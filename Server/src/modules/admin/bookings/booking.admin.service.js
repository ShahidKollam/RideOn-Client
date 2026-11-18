/**
 * Fully independent admin booking service — Prisma only.
 * No imports from client booking.service.
 */
import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'
import { randomUUID } from 'crypto'
import { calculateHelmetAmount } from '../../settings/settings.service.js'
import { findPricingByDuration } from '../../booking/pricing.service.js'
import { getBookingBufferMinutes } from '../../settings/settings.service.js'
import { getBookingAvailability } from '../../booking/availability.service.js'
import { checkBikeAvailability, listAvailableBikes } from '../../bike/bike.service.js'
import { sendBookingConfirmationEmail, sendGuestSignupInvitationEmail, sendRideCompletedFeedbackEmail } from '../../../lib/mailer.js'

/** Shared system user for all admin desk / walk-in bookings (seed once). */
export const WALKIN_USER_EMAIL = 'walkin@rideon.internal'

const ADMIN_CANCELLABLE = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'NO_SHOW']
const BOOKING_INCLUDE = {
    user: { select: { id: true, name: true, email: true, phone: true } },
    bike: {
        select: {
            id: true,
            name: true,
            registrationNumber: true,
            bikeNumber: true,
            status: true,
            currentOdometer: true,
        },
    },
    campus: { select: { id: true, name: true } },
    pricing: { select: { id: true, packageName: true, durationHours: true } },
    payments: {
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            status: true,
            amount: true,
            gateway: true,
            gatewayOrderId: true,
            gatewayPaymentId: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
            gatewayResponse: true,
        },
    },
}

const withPaymentSummary = (booking, settings) => {
    const payments = booking.payments || []

    const paidAmount = payments
        .filter((payment) => payment.status === 'PAID')
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const totalAmount = Number(booking.totalAmount || 0)

    const originalTaxableAmount =
        Number(booking.baseAmount || 0) +
        Number(settings?.platformFeeEnabled ? settings.platformFee : 0) +
        Number(booking.helmetAmount || 0)

    const originalGstAmount = settings?.gstEnabled
        ? Number(((originalTaxableAmount * Number(settings.gstRate)) / 100).toFixed(2))
        : 0

    const additionalTaxableAmount =
        Number(booking.extraKmCharge || 0) +
        Number(booking.lateFee || 0) +
        Number(booking.lateHelmetFee || 0) +
        Number(booking.disruptionPenalty || 0) +
        Number(booking.extensionAmount || 0)

    const additionalGstAmount = settings?.gstEnabled
        ? Number(((additionalTaxableAmount * Number(settings.gstRate)) / 100).toFixed(2))
        : 0

    const gstAmount = Number((originalGstAmount + additionalGstAmount).toFixed(2))

    const isLate =
        booking.status === 'ACTIVE' &&
        booking.returnAt &&
        new Date() > new Date(booking.returnAt)

    let lateDurationMinutes = booking.lateDurationMinutes ?? null
    if (isLate && lateDurationMinutes == null) {
        lateDurationMinutes = Math.max(
            0,
            Math.ceil((Date.now() - new Date(booking.returnAt).getTime()) / (60 * 1000))
        )
    }

    return {
        ...booking,
        gstAmount,
        originalGstAmount,
        additionalGstAmount,
        platformAmount: Number(settings?.platformFeeEnabled ? settings.platformFee : 0),
        isLate: Boolean(isLate || (booking.lateDurationMinutes && booking.lateDurationMinutes > 0)),
        lateDurationMinutes,
        paymentSummary: {
            paidAmount: Number(paidAmount.toFixed(2)),
            outstandingAmount: Number(Math.max(0, totalAmount - paidAmount).toFixed(2)),
        },
    }
}

function bookingNumber() {
    const d = new Date()
    const y = d.getFullYear().toString().slice(-2)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const r = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
    return `BK${y}${m}${day}${r}`
}

/**
 * Compute late charges using fixed per-hour late fee + grace from policies.
 * Grace applies at the start of each billable hour block:
 *   0..grace → ₹0
 *   grace+ → 1× lateFeePerHour
 *   60+grace → 2×, 120+grace → 3×, etc.
 * Does NOT apply them — admin chooses via applyLateFee / applyDisruptionPenalty.
 */
export const computeLateCharges = async (booking, settings, asOf = new Date()) => {
    const scheduledReturn = new Date(booking.returnAt)
    const lateMs = asOf.getTime() - scheduledReturn.getTime()
    const lateDurationMinutes = lateMs > 0 ? Math.ceil(lateMs / (60 * 1000)) : 0

    const graceMinutes = Math.max(
        0,
        Math.floor(Number(settings?.lateFeeGraceMinutes ?? 15))
    )
    const lateFeePerHour = Math.max(0, Number(settings?.lateFeePerHour ?? 79))

    let calculatedLateRental = 0
    let billableLateHours = 0
    let latePricingInfo = null

    if (lateDurationMinutes > graceMinutes) {
        // Per-block grace: hour N starts after (N-1)*60 + grace
        billableLateHours = Math.floor((lateDurationMinutes - graceMinutes) / 60) + 1
        calculatedLateRental = Number((billableLateHours * lateFeePerHour).toFixed(2))
        latePricingInfo = {
            durationHours: billableLateHours,
            packageName: `Fixed late fee (₹${lateFeePerHour}/hr)`,
            price: calculatedLateRental,
            composed: false,
            graceMinutes,
            lateFeePerHour,
        }
    }

    const disruptionPenaltyAmount = Number(settings?.disruptionPenalty ?? 150)

    // Detect whether another confirmed/active booking is affected by this late return
    let affectedBooking = null
    if (booking.bikeId && lateDurationMinutes > 0) {
        const bufferMinutes = await getBookingBufferMinutes()
        const bufferStart = new Date(scheduledReturn.getTime() - bufferMinutes * 60 * 1000)
        const conflict = await prisma.booking.findFirst({
            where: {
                bikeId: booking.bikeId,
                id: { not: booking.id },
                status: { in: ['CONFIRMED', 'ACTIVE', 'PAYMENT_PENDING'] },
                pickupAt: { lt: asOf },
                returnAt: { gt: bufferStart },
            },
            select: {
                id: true,
                bookingNumber: true,
                pickupAt: true,
                returnAt: true,
                status: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { pickupAt: 'asc' },
        })
        if (conflict) {
            affectedBooking = conflict
        }
    }

    return {
        lateDurationMinutes,
        calculatedLateRental: Number(calculatedLateRental.toFixed(2)),
        latePricingInfo,
        disruptionPenaltyAmount: Number(disruptionPenaltyAmount.toFixed(2)),
        affectedBooking,
        isLate: lateDurationMinutes > 0,
    }
}

export const listBookings = async (query) => {
    const {
        page = 1,
        limit = 20,
        status,
        paymentStatus,
        campusId,
        userId,
        bikeId,
        search,
        from,
        to,
        dateField = 'pickup',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        lateOnly,
    } = query

    const where = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (campusId) where.campusId = campusId
    if (userId) where.userId = userId
    if (bikeId) where.bikeId = bikeId

    // from/to apply to pickupAt (default) or returnAt
    if (from || to) {
        const field = dateField === 'return' ? 'returnAt' : 'pickupAt'
        where[field] = {}
        if (from) where[field].gte = new Date(from)
        if (to) where[field].lte = new Date(to)
    }

    if (search) {
        where.OR = [
            { bookingNumber: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { bike: { bikeNumber: { contains: search, mode: 'insensitive' } } },
            { guestName: { contains: search, mode: 'insensitive' } },
            { guestEmail: { contains: search, mode: 'insensitive' } },
            { guestPhone: { contains: search, mode: 'insensitive' } },
        ]
    }

    // Late returns: ACTIVE past returnAt, or COMPLETED with lateDurationMinutes > 0
    if (lateOnly) {
        const lateClause = {
            OR: [
                { status: 'ACTIVE', returnAt: { lt: new Date() } },
                { lateDurationMinutes: { gt: 0 } },
            ],
        }
        if (where.OR) {
            // Combine search OR with late filter via AND
            where.AND = [{ OR: where.OR }, lateClause]
            delete where.OR
        } else {
            Object.assign(where, lateClause)
        }
    }

    const skip = (page - 1) * limit
    const settingsPromise = prisma.systemSetting.findFirst()

    // Late list: ACTIVE overdue first, then by returnAt ascending (longest waiting first).
    // Applies whenever lateOnly is on (KPI Late or advanced filter).
    if (lateOnly || sortBy === 'latePriority') {
        const [idRows, total, settings] = await Promise.all([
            prisma.booking.findMany({
                where,
                select: { id: true, status: true, returnAt: true, createdAt: true },
            }),
            prisma.booking.count({ where }),
            settingsPromise,
        ])
        idRows.sort((a, b) => {
            const aActive = a.status === 'ACTIVE' ? 0 : 1
            const bActive = b.status === 'ACTIVE' ? 0 : 1
            if (aActive !== bActive) return aActive - bActive
            const ra = a.returnAt ? new Date(a.returnAt).getTime() : 0
            const rb = b.returnAt ? new Date(b.returnAt).getTime() : 0
            if (ra !== rb) return ra - rb // earlier returnAt = more overdue first among ACTIVE
            const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return cb - ca // tie-break newest created
        })
        const pageIds = idRows.slice(skip, skip + limit).map((r) => r.id)
        if (pageIds.length === 0) {
            return {
                items: [],
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
            }
        }
        const found = await prisma.booking.findMany({
            where: { id: { in: pageIds } },
            include: BOOKING_INCLUDE,
        })
        const byId = new Map(found.map((b) => [b.id, b]))
        const items = pageIds.map((id) => byId.get(id)).filter(Boolean)
        return {
            items: items.map((booking) => withPaymentSummary(booking, settings)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        }
    }

    // Nearest-to-now (optional; admin does not use by default)
    if (sortBy === 'nearest') {
        const timeField = dateField === 'return' ? 'returnAt' : 'pickupAt'
        const [idRows, total, settings] = await Promise.all([
            prisma.booking.findMany({
                where,
                select: { id: true, pickupAt: true, returnAt: true },
            }),
            prisma.booking.count({ where }),
            settingsPromise,
        ])
        const nowMs = Date.now()
        idRows.sort((a, b) => {
            const ta = new Date(a[timeField] || a.pickupAt).getTime()
            const tb = new Date(b[timeField] || b.pickupAt).getTime()
            const da = Math.abs(ta - nowMs)
            const db = Math.abs(tb - nowMs)
            if (da !== db) return da - db
            if (ta !== tb) return ta - tb
            return String(a.id).localeCompare(String(b.id))
        })
        const pageIds = idRows.slice(skip, skip + limit).map((r) => r.id)
        if (pageIds.length === 0) {
            return {
                items: [],
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
            }
        }
        const found = await prisma.booking.findMany({
            where: { id: { in: pageIds } },
            include: BOOKING_INCLUDE,
        })
        const byId = new Map(found.map((b) => [b.id, b]))
        const items = pageIds.map((id) => byId.get(id)).filter(Boolean)
        return {
            items: items.map((booking) => withPaymentSummary(booking, settings)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        }
    }

    const allowedSort = new Set(['createdAt', 'pickupAt', 'returnAt'])
    const orderField = allowedSort.has(sortBy) ? sortBy : 'createdAt'
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc'

    const [items, total, settings] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: BOOKING_INCLUDE,
            skip,
            take: limit,
            orderBy: { [orderField]: orderDir },
        }),
        prisma.booking.count({ where }),
        settingsPromise,
    ])

    return {
        items: items.map((booking) => withPaymentSummary(booking, settings)),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    }
}

export const getBookingById = async (id) => {
    const [booking, settings] = await Promise.all([
        prisma.booking.findUnique({
            where: { id },
            include: BOOKING_INCLUDE,
        }),
        prisma.systemSetting.findFirst(),
    ])

    if (!booking) throw new ApiError(404, 'Booking not found')

    const summary = withPaymentSummary(booking, settings)

    // Attach live late-charge preview for ACTIVE overdue bookings
    if (booking.status === 'ACTIVE' && new Date() > new Date(booking.returnAt)) {
        const lateInfo = await computeLateCharges(booking, settings)
        summary.lateChargePreview = lateInfo
    }

    // Cancellation eligibility + amounts (backend-calculated)
    try {
        const { getCancellationPolicy, buildCancellationInfo } = await import(
            '../../booking/cancellation.service.js'
        )
        const policy = await getCancellationPolicy()
        summary.cancellation = buildCancellationInfo(booking, policy, 'ADMIN')
    } catch (e) {
        summary.cancellation = null
    }

    return summary
}

export const createBooking = async (data) => {
    const { userId, campusId, pricingId, pickupAt, returnAt, bikeId, helmetCount = 0, notes } = data

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new ApiError(404, 'User not found')

    const campus = await prisma.campus.findUnique({ where: { id: campusId } })
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')

    const pricing = await prisma.pricing.findUnique({ where: { id: pricingId } })
    if (!pricing || !pricing.isActive) throw new ApiError(400, 'Invalid or inactive pricing')

    const pickup = new Date(pickupAt)
    const ret = new Date(returnAt)
    if (ret <= pickup) throw new ApiError(400, 'returnAt must be after pickupAt')

    const durationHours = Math.ceil((ret - pickup) / (1000 * 60 * 60))

    const settings = await prisma.systemSetting.findFirst()
    const { helmetAmount } = calculateHelmetAmount(settings || {}, helmetCount, durationHours)

    const baseAmount = Number(pricing.price)
    const depositAmount = Number(pricing.depositAmount)
    const platformFee = settings?.platformFeeEnabled ? Number(settings.platformFee) || 0 : 0
    const subtotal = Number((baseAmount + platformFee + helmetAmount).toFixed(2))
    const gstAmount = settings?.gstEnabled
        ? Number(((subtotal * Number(settings.gstRate)) / 100).toFixed(2))
        : 0
    const totalAmount = Number((subtotal + gstAmount + depositAmount).toFixed(2))

    if (bikeId) {
        const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
        if (!bike || !bike.isActive || bike.status !== 'AVAILABLE') {
            throw new ApiError(400, 'Bike not available')
        }
    }

    return prisma.booking.create({
        data: {
            bookingNumber: bookingNumber(),
            userId,
            campusId,
            pricingId,
            bikeId: bikeId || null,
            pickupAt: pickup,
            returnAt: ret,
            durationHours,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            baseAmount,
            depositAmount,
            discountAmount: 0,
            totalAmount,
            includedKm: pricing.includedKm,
            extraKmRate: pricing.extraKmRate,
            helmetCount,
            helmetAmount,
            notes: notes || null,
        },
        include: BOOKING_INCLUDE,
    })
}

/**
 * Resolve the single shared walk-in user. Must be seeded first.
 */
export const resolveWalkinUserId = async () => {
    const user = await prisma.user.findUnique({
        where: { email: WALKIN_USER_EMAIL },
        select: { id: true },
    })
    if (!user) {
        throw new ApiError(
            500,
            `Walk-in user not found (${WALKIN_USER_EMAIL}). Run: node prisma/seed/seed-walkin-user.js`
        )
    }
    return user.id
}

/** Admin check-availability — same rules as customer; admin-auth only. */
export const adminCheckAvailability = async (data) => getBookingAvailability(data)

/** Admin list bikes for slot, lowest odometer first. */
export const adminListAvailableBikes = async ({ campusId, pickupAt, returnAt }) => {
    const campus = await prisma.campus.findUnique({ where: { id: campusId } })
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')

    const pickup = new Date(pickupAt)
    const ret = new Date(returnAt)
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || pickup >= ret) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    const bikes = await listAvailableBikes(pickup, ret, campusId)
    return {
        availableCount: bikes.length,
        bikes,
    }
}

/**
 * Desk / walk-in booking: no new customer User.
 * Attaches to shared walk-in userId; stores guestName/Email/Phone on booking.
 * Rechecks availability + bike slot on submit. Sends confirmation + signup invitation to guestEmail only (no user create).
 */
export const createDeskBooking = async (data) => {
    const {
        campusId,
        pricingId,
        pickupAt,
        returnAt,
        bikeId,
        guestName,
        guestEmail,
        guestPhone = null,
        helmetCount = 0,
        notes = null,
    } = data

    const walkinUserId = await resolveWalkinUserId()

    const campus = await prisma.campus.findUnique({ where: { id: campusId } })
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')

    const pricing = await prisma.pricing.findUnique({ where: { id: pricingId } })
    if (!pricing || !pricing.isActive) throw new ApiError(400, 'Invalid or inactive pricing')

    const pickup = new Date(pickupAt)
    const ret = new Date(returnAt)
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret <= pickup) {
        throw new ApiError(400, 'returnAt must be after pickupAt')
    }

    // Same past-pickup rule as availability (5 min grace inside getBookingAvailability)
    const availability = await getBookingAvailability({
        campusId,
        pickupAt: pickup.toISOString(),
        returnAt: ret.toISOString(),
        helmetCount,
    })
    if (!availability.available || availability.availableCount < 1) {
        throw new ApiError(400, availability.reason || 'No available bikes for the selected time')
    }

    const bikeCheck = await checkBikeAvailability(bikeId, pickup, ret)
    if (!bikeCheck.available) {
        throw new ApiError(400, bikeCheck.reason || 'Selected bike is not available for this slot')
    }

    const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
    if (!bike || !bike.isActive || bike.campusId !== campusId) {
        throw new ApiError(400, 'Invalid bike for this campus')
    }

    const durationHours = Math.ceil((ret - pickup) / (1000 * 60 * 60))
    const settings = await prisma.systemSetting.findFirst()
    const { helmetAmount } = calculateHelmetAmount(settings || {}, helmetCount, durationHours)

    const baseAmount = Number(pricing.price)
    const depositAmount = Number(pricing.depositAmount)
    const platformFee = settings?.platformFeeEnabled ? Number(settings.platformFee) || 0 : 0
    const subtotal = Number((baseAmount + platformFee + helmetAmount).toFixed(2))
    const gstAmount = settings?.gstEnabled
        ? Number(((subtotal * Number(settings.gstRate)) / 100).toFixed(2))
        : 0
    const totalAmount = Number((subtotal + gstAmount + depositAmount).toFixed(2))

    const booking = await prisma.booking.create({
        data: {
            bookingNumber: bookingNumber(),
            userId: walkinUserId,
            campusId,
            pricingId,
            bikeId,
            pickupAt: pickup,
            returnAt: ret,
            durationHours,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            baseAmount,
            depositAmount,
            discountAmount: 0,
            totalAmount,
            includedKm: pricing.includedKm,
            extraKmRate: pricing.extraKmRate,
            helmetCount,
            helmetAmount,
            notes: notes || null,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim().toLowerCase(),
            guestPhone: guestPhone ? String(guestPhone).trim() : null,
        },
        include: BOOKING_INCLUDE,
    })

    // Guest-only emails: confirmation + signup invitation (no user create, no magic link)
    try {
        await sendBookingConfirmationEmail({ booking, payment: null })
    } catch (err) {
        console.error(
            `Desk booking confirmation email failed for ${booking.bookingNumber}:`,
            err?.message || err
        )
    }
    try {
        if (booking.guestEmail) {
            await sendGuestSignupInvitationEmail({
                guestEmail: booking.guestEmail,
                guestName: booking.guestName,
                bookingNumber: booking.bookingNumber,
            })
        }
    } catch (err) {
        console.error(
            `Desk booking signup invitation failed for ${booking.bookingNumber}:`,
            err?.message || err
        )
    }

    return booking
}

export const pickupBooking = async (id, pickupOdometer) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { bike: true },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.status !== 'CONFIRMED') {
        throw new ApiError(400, 'Booking must be CONFIRMED for pickup')
    }

    let bikeId = booking.bikeId
    if (!bikeId) {
        const bike = await prisma.bike.findFirst({
            where: {
                campusId: booking.campusId,
                status: 'AVAILABLE',
                isActive: true,
            },
            orderBy: { currentOdometer: 'asc' },
        })
        if (!bike) throw new ApiError(400, 'No available bikes')
        bikeId = bike.id
    } else {
        const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
        if (!bike || bike.status !== 'AVAILABLE') {
            throw new ApiError(400, 'Assigned bike is not available')
        }
    }

    return prisma.$transaction(async (tx) => {
        await tx.bike.update({
            where: { id: bikeId },
            data: { status: 'IN_USE' },
        })
        return tx.booking.update({
            where: { id },
            data: {
                bikeId,
                pickupOdometer,
                pickedUpAt: new Date(),
                status: 'ACTIVE',
            },
            include: BOOKING_INCLUDE,
        })
    })
}

export const returnBooking = async (id, returnOdometer, options = {}) => {
    const { applyLateFee = false, applyDisruptionPenalty = false } = options

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { bike: true },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.status !== 'ACTIVE') {
        throw new ApiError(400, 'Booking must be ACTIVE for return')
    }
    if (booking.pickupOdometer == null) {
        throw new ApiError(400, 'Pickup odometer missing')
    }
    if (returnOdometer < booking.pickupOdometer) {
        throw new ApiError(400, 'returnOdometer cannot be less than pickupOdometer')
    }

    const actualKm = returnOdometer - booking.pickupOdometer
    const extraKm = Math.max(0, actualKm - booking.includedKm)
    const extraKmCharge = Number((extraKm * booking.extraKmRate).toFixed(2))

    const now = new Date()
    const settings = await prisma.systemSetting.findFirst()

    const lateInfo = await computeLateCharges(booking, settings, now)

    let lateHelmetFee = 0
    if (lateInfo.isLate && (booking.helmetCount || 0) > 0) {
        lateHelmetFee = Number(settings?.lateHelmetFee) || 0
    }

    // Admin-controlled application of charges
    const lateFee = applyLateFee ? lateInfo.calculatedLateRental : 0
    const disruptionPenalty = applyDisruptionPenalty ? lateInfo.disruptionPenaltyAmount : 0

    const additionalSubtotal = Number(
        (extraKmCharge + lateFee + lateHelmetFee + disruptionPenalty).toFixed(2)
    )

    const additionalGstAmount = settings?.gstEnabled
        ? Number(((additionalSubtotal * Number(settings.gstRate)) / 100).toFixed(2))
        : 0

    const finalTotal = Number(
        (booking.totalAmount + additionalSubtotal + additionalGstAmount).toFixed(2)
    )

    const result = await prisma.$transaction(async (tx) => {
        if (booking.bikeId) {
            await tx.bike.update({
                where: { id: booking.bikeId },
                data: {
                    currentOdometer: returnOdometer,
                    status: 'AVAILABLE',
                },
            })
        }

        const paidAmount = (
            await tx.payment.findMany({
                where: { bookingId: id, status: 'PAID' },
                select: { amount: true },
            })
        ).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

        const paymentStatus = paidAmount + 0.0001 < finalTotal ? 'PARTIALLY_PAID' : 'PAID'

        const updated = await tx.booking.update({
            where: { id },
            data: {
                returnOdometer,
                returnedAt: now,
                actualKm,
                extraKm,
                extraKmCharge,
                lateFee,
                lateHelmetFee,
                lateDurationMinutes: lateInfo.lateDurationMinutes,
                disruptionPenalty: disruptionPenalty || null,
                lateFeeApplied: Boolean(applyLateFee && lateFee > 0),
                disruptionPenaltyApplied: Boolean(applyDisruptionPenalty && disruptionPenalty > 0),
                totalAmount: finalTotal,
                paymentStatus,
                status: 'COMPLETED',
            },
            include: BOOKING_INCLUDE,
        })

        return {
            booking: updated,
            lateChargeDetails: {
                ...lateInfo,
                appliedLateFee: lateFee,
                appliedDisruptionPenalty: disruptionPenalty,
                lateHelmetFee,
            },
        }
    })

    const summary = {
        ...withPaymentSummary(result.booking, settings),
        lateChargeDetails: result.lateChargeDetails,
    }

    // Non-blocking thank-you + feedback email after successful return
    try {
        await sendRideCompletedFeedbackEmail({ booking: result.booking })
    } catch (err) {
        console.error('[returnBooking] feedback email failed', err?.message || err)
    }

    return summary
}

export const collectAdditionalPayment = async (id, { paymentMethod, reference }) => {
    return prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: { id },
            include: { payments: { select: { amount: true, status: true } } },
        })
        if (!booking) throw new ApiError(404, 'Booking not found')
        if (booking.status !== 'COMPLETED') {
            throw new ApiError(400, 'Additional payments can only be collected after return')
        }

        const paidAmount = booking.payments
            .filter((payment) => payment.status === 'PAID')
            .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
        const outstandingAmount = Number((Number(booking.totalAmount) - paidAmount).toFixed(2))
        if (outstandingAmount <= 0) throw new ApiError(400, 'No outstanding amount for this booking')

        const payment = await tx.payment.create({
            data: {
                userId: booking.userId,
                bookingId: booking.id,
                gateway: 'ADMIN_OFFLINE',
                gatewayOrderId: `ADMIN-${randomUUID()}`,
                amount: outstandingAmount,
                status: 'PAID',
                paymentMethod,
                gatewayResponse: reference ? { reference } : undefined,
                paidAt: new Date(),
            },
        })
        await tx.booking.update({ where: { id }, data: { paymentStatus: 'PAID' } })
        return payment
    })
}

/**
 * Admin cancellation.
 * @param {string} id - booking id
 * @param {object} opts
 * @param {boolean} [opts.applyCancellationFee=true]
 * @param {number|null} [opts.adjustedRefundAmount]
 * @param {string|null} [opts.adjustmentReason]
 * @param {string|null} [opts.adminId]
 */
export const cancelBooking = async (id, opts = {}) => {
    const {
        applyCancellationFee = true,
        adjustedRefundAmount = null,
        adjustmentReason = null,
        adminId = null,
    } = opts

    const { executeCancellation, buildCancellationInfo, getCancellationPolicy } = await import(
        '../../booking/cancellation.service.js'
    )

    const result = await executeCancellation({
        bookingId: id,
        adminId,
        actor: 'ADMIN',
        applyCancellationFee: applyCancellationFee !== false,
        adjustedRefundAmount,
        adjustmentReason,
    })

    const policy = await getCancellationPolicy()
    const summary = result.booking
    return {
        ...summary,
        cancellation: {
            ...result.calculation,
            ...buildCancellationInfo(result.booking, policy, 'ADMIN'),
        },
        alreadyCancelled: result.alreadyCancelled,
    }
}

/**
 * Admin records physical cash refund after cancellation.
 */
export const recordCashRefund = async (id, adminId, body = {}) => {
    const { recordCashRefund: record } = await import('../../booking/cancellation.service.js')
    return record(id, adminId, body)
}

/**
 * Dashboard / monitoring: count of currently late returns and recent late list.
 */
export const getLateReturnStats = async () => {
    const now = new Date()
    const [currentlyLate, recentLate] = await Promise.all([
        prisma.booking.count({
            where: {
                status: 'ACTIVE',
                returnAt: { lt: now },
            },
        }),
        prisma.booking.findMany({
            where: {
                OR: [
                    { status: 'ACTIVE', returnAt: { lt: now } },
                    { lateDurationMinutes: { gt: 0 } },
                ],
            },
            include: {
                bike: {
                    select: { id: true, bikeNumber: true, registrationNumber: true, name: true },
                },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { returnAt: 'asc' },
            take: 20,
        }),
    ])

    return {
        currentlyLateCount: currentlyLate,
        items: recentLate.map((b) => {
            const lateMins =
                b.lateDurationMinutes ??
                (b.status === 'ACTIVE' && b.returnAt
                    ? Math.max(0, Math.ceil((now - new Date(b.returnAt)) / 60000))
                    : 0)
            return {
                bookingId: b.id,
                bookingNumber: b.bookingNumber,
                status: b.status === 'ACTIVE' && lateMins > 0 ? 'LATE_RETURN' : b.status,
                lateDurationMinutes: lateMins,
                bike: b.bike
                    ? {
                          id: b.bike.id,
                          bikeNumber: b.bike.bikeNumber,
                          registrationNumber: b.bike.registrationNumber,
                          name: b.bike.name,
                      }
                    : null,
                user: b.user,
                scheduledReturnAt: b.returnAt,
                returnedAt: b.returnedAt,
            }
        }),
    }
}

/** Booking statuses that may change assigned bike */
const CHANGE_BIKE_ALLOWED = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'FAILED', 'NO_SHOW']
const CHANGE_BIKE_BLOCKED = ['COMPLETED', 'CANCELLED']
const OVERLAP_STATUSES = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE']

/**
 * List ALL active campus bikes with conflict + next-booking impact for change-bike UI.
 * Overlaps are warnings only — admin may still assign (soft conflict).
 */
export const getChangeBikeOptions = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            bike: {
                select: {
                    id: true,
                    bikeNumber: true,
                    name: true,
                    status: true,
                    registrationNumber: true,
                },
            },
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (CHANGE_BIKE_BLOCKED.includes(booking.status)) {
        throw new ApiError(400, `Cannot change bike when booking is ${booking.status}`)
    }

    const bufferMinutes = await getBookingBufferMinutes()
    const bufferStart = new Date(new Date(booking.pickupAt).getTime() - bufferMinutes * 60 * 1000)
    const bufferedReturnAt = new Date(new Date(booking.returnAt).getTime() + bufferMinutes * 60 * 1000)
    const now = new Date()

    // Always list every active bike on this campus (AVAILABLE, IN_USE, MAINTENANCE, etc.)
    const bikes = await prisma.bike.findMany({
        where: {
            campusId: booking.campusId,
            isActive: true,
        },
        orderBy: [{ status: 'asc' }, { bikeNumber: 'asc' }],
        select: {
            id: true,
            bikeNumber: true,
            name: true,
            status: true,
            registrationNumber: true,
            currentOdometer: true,
        },
    })

    const bikeIds = bikes.map((b) => b.id)
    const relatedBookings =
        bikeIds.length === 0
            ? []
            : await prisma.booking.findMany({
                  where: {
                      bikeId: { in: bikeIds },
                      id: { not: booking.id },
                      status: { in: OVERLAP_STATUSES },
                  },
                  select: {
                      id: true,
                      bookingNumber: true,
                      bikeId: true,
                      status: true,
                      pickupAt: true,
                      returnAt: true,
                  },
                  orderBy: { pickupAt: 'asc' },
              })

    const byBike = new Map()
    for (const b of relatedBookings) {
        if (!byBike.has(b.bikeId)) byBike.set(b.bikeId, [])
        byBike.get(b.bikeId).push(b)
    }

    const fmtLocal = (d) =>
        new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })

    const options = bikes.map((bike) => {
        const others = byBike.get(bike.id) || []
        const conflict = others.find(
            (ob) =>
                new Date(ob.pickupAt) < bufferedReturnAt &&
                new Date(ob.returnAt) > bufferStart
        )
        // Prefer a future pickup as "next ride"; fall back to any still-live booking
        const nextBooking =
            others.find((ob) => new Date(ob.pickupAt) >= now) ||
            others.find((ob) => new Date(ob.returnAt) >= now) ||
            null

        const warnings = []
        if (bike.id === booking.bikeId) {
            warnings.push({
                level: 'info',
                code: 'CURRENT',
                message: 'Already assigned to this booking',
            })
        }
        if (bike.status !== 'AVAILABLE') {
            warnings.push({
                level: 'warning',
                code: 'STATUS',
                message: `Bike status is ${bike.status}. Continue only if it is physically free at the counter.`,
            })
        }
        if (conflict) {
            warnings.push({
                level: 'warning',
                code: 'CONFLICT',
                message: `Overlaps live booking #${conflict.bookingNumber || conflict.id.slice(0, 8)} (${conflict.status}) · ${fmtLocal(conflict.pickupAt)} → ${fmtLocal(conflict.returnAt)}. You can still assign — resolve the other booking if needed.`,
            })
        }
        // Always surface next ride when present (even if same as conflict)
        if (nextBooking) {
            const isSameAsConflict = conflict && conflict.id === nextBooking.id
            if (!isSameAsConflict) {
                warnings.push({
                    level: 'warning',
                    code: 'NEXT',
                    message: `Next ride on this bike: #${nextBooking.bookingNumber || nextBooking.id.slice(0, 8)} (${nextBooking.status}) · pickup ${fmtLocal(nextBooking.pickupAt)}.`,
                })
            } else {
                warnings.push({
                    level: 'info',
                    code: 'NEXT',
                    message: `That overlapping booking is the next ride on this bike.`,
                })
            }
        }

        return {
            id: bike.id,
            bikeNumber: bike.bikeNumber,
            name: bike.name,
            status: bike.status,
            registrationNumber: bike.registrationNumber,
            currentOdometer: bike.currentOdometer,
            isCurrent: bike.id === booking.bikeId,
            hasConflict: Boolean(conflict),
            hasOtherBooking: others.length > 0,
            conflict: conflict
                ? {
                      id: conflict.id,
                      bookingNumber: conflict.bookingNumber,
                      status: conflict.status,
                      pickupAt: conflict.pickupAt,
                      returnAt: conflict.returnAt,
                  }
                : null,
            nextBooking: nextBooking
                ? {
                      id: nextBooking.id,
                      bookingNumber: nextBooking.bookingNumber,
                      status: nextBooking.status,
                      pickupAt: nextBooking.pickupAt,
                      returnAt: nextBooking.returnAt,
                  }
                : null,
            warnings,
        }
    })

    // Current last; then non-conflict AVAILABLE; then others; bike number within groups
    options.sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? 1 : -1
        if (a.hasConflict !== b.hasConflict) return a.hasConflict ? 1 : -1
        if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1
        if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1
        return String(a.bikeNumber || '').localeCompare(String(b.bikeNumber || ''))
    })

    return {
        booking: {
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            campusId: booking.campusId,
            pickupAt: booking.pickupAt,
            returnAt: booking.returnAt,
            bike: booking.bike,
        },
        options,
    }
}

/**
 * Reassign bike on a non-completed/non-cancelled booking.
 * ACTIVE: swaps IN_USE / AVAILABLE. Other statuses: bikeId only.
 */
export const changeBookingBike = async (bookingId, newBikeId, { confirmNonAvailable = false } = {}) => {
    if (!newBikeId) throw new ApiError(400, 'bikeId is required')

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            bike: {
                select: { id: true, bikeNumber: true, status: true, name: true },
            },
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (CHANGE_BIKE_BLOCKED.includes(booking.status)) {
        throw new ApiError(400, `Cannot change bike when booking is ${booking.status}`)
    }
    if (!CHANGE_BIKE_ALLOWED.includes(booking.status)) {
        throw new ApiError(400, `Cannot change bike when booking is ${booking.status}`)
    }
    if (booking.bikeId === newBikeId) {
        throw new ApiError(400, 'Booking is already on this bike')
    }

    const newBike = await prisma.bike.findUnique({ where: { id: newBikeId } })
    if (!newBike || !newBike.isActive) throw new ApiError(400, 'Bike not found or inactive')
    if (newBike.campusId !== booking.campusId) {
        throw new ApiError(400, 'Bike must belong to the same campus as the booking')
    }
    // Admin may assign any active bike (AVAILABLE / IN_USE / MAINTENANCE / etc.).
    // Status + overlaps are UI warnings only — never hard-block. confirmNonAvailable ignored (compat).
    void confirmNonAvailable

    // Soft conflict only: overlap is allowed for admin (UI shows warnings). No hard block.
    const oldBikeId = booking.bikeId
    const isActive = booking.status === 'ACTIVE'

    const updated = await prisma.$transaction(async (tx) => {
        if (isActive) {
            if (oldBikeId) {
                await tx.bike.update({
                    where: { id: oldBikeId },
                    data: { status: 'AVAILABLE' },
                })
            }
            await tx.bike.update({
                where: { id: newBikeId },
                data: { status: 'IN_USE' },
            })
        }

        return tx.booking.update({
            where: { id: bookingId },
            data: { bikeId: newBikeId },
            include: BOOKING_INCLUDE,
        })
    })

    return {
        booking: updated,
        fromBike: booking.bike,
        toBike: {
            id: newBike.id,
            bikeNumber: newBike.bikeNumber,
            name: newBike.name,
            status: isActive ? 'IN_USE' : newBike.status,
        },
    }
}

const EXTEND_ALLOWED = ['CONFIRMED', 'ACTIVE']
const EXTEND_OVERLAP_STATUSES = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE']

/**
 * Preview impact of extending a booking's returnAt (admin).
 * Additive packages: original package stays; only the *extra* hours are priced
 * as their own package (e.g. 1h booking + 2h extend = 1h pkg + 2h pkg).
 * GST applied on the extension amount when GST is enabled in policies.
 */
export const previewExtendBooking = async (bookingId, newReturnAtISO) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            bike: {
                select: {
                    id: true,
                    bikeNumber: true,
                    name: true,
                    status: true,
                },
            },
            pricing: {
                select: {
                    id: true,
                    packageName: true,
                    durationHours: true,
                    includedKm: true,
                    price: true,
                },
            },
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (!EXTEND_ALLOWED.includes(booking.status)) {
        throw new ApiError(400, `Extend is only allowed for CONFIRMED or ACTIVE (current: ${booking.status})`)
    }

    const pickup = new Date(booking.pickupAt)
    const currentReturn = new Date(booking.returnAt)
    const newReturn = new Date(newReturnAtISO)
    if (Number.isNaN(newReturn.getTime())) throw new ApiError(400, 'Invalid returnAt')
    if (newReturn <= pickup) throw new ApiError(400, 'New return time must be after pickup')
    if (newReturn <= currentReturn) {
        throw new ApiError(400, 'New return time must be after the current scheduled return')
    }

    const totalDurationHours = Math.max(1, Math.ceil((newReturn - pickup) / (1000 * 60 * 60)))
    if (totalDurationHours > 72) {
        throw new ApiError(400, 'Extended duration cannot exceed 72 hours')
    }

    const extensionHours = Math.max(
        1,
        Math.ceil((newReturn.getTime() - currentReturn.getTime()) / (1000 * 60 * 60))
    )

    const settings = await prisma.systemSetting.findFirst()
    const warnings = []

    let extensionPricing = null
    try {
        extensionPricing = await findPricingByDuration(extensionHours, booking.campusId)
    } catch {
        extensionPricing = null
        warnings.push({
            level: 'warning',
            code: 'NO_PACKAGE',
            message: `No pricing package matches +${extensionHours}h extension. Schedule can still update; no extension charge will be added.`,
        })
    }

    const extensionBase = extensionPricing ? Number(extensionPricing.price) || 0 : 0
    const extensionGst =
        settings?.gstEnabled && extensionBase > 0
            ? Number(((extensionBase * Number(settings.gstRate)) / 100).toFixed(2))
            : 0
    const extensionTotal = Number((extensionBase + extensionGst).toFixed(2))
    const newTotalAmount = Number((Number(booking.totalAmount || 0) + extensionTotal).toFixed(2))

    if (extensionPricing) {
        const name =
            extensionPricing.packageName ||
            extensionPricing._packageName ||
            `${extensionHours}h`
        warnings.push({
            level: 'info',
            code: 'PACKAGE',
            message: `Extension +${extensionHours}h uses package: ${name} (₹${extensionBase.toFixed(2)}${extensionGst ? ` + GST ₹${extensionGst.toFixed(2)}` : ''}). Original package is kept.`,
        })
    }

    if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'PARTIALLY_PAID') {
        warnings.push({
            level: 'info',
            code: 'PAYMENT',
            message:
                extensionTotal > 0
                    ? `Extra ₹${extensionTotal.toFixed(2)} will be added to the booking total. Collect outstanding after confirm if needed.`
                    : 'No extra charge for this extension.',
        })
    }

    // Bike overlap conflicts (same rules as before)
    const conflicts = []
    if (booking.bikeId) {
        const bufferMinutes = await getBookingBufferMinutes()
        const bufferMs = bufferMinutes * 60 * 1000
        const windowStart = new Date(currentReturn.getTime() - bufferMs)
        const windowEnd = new Date(newReturn.getTime() + bufferMs)

        const overlapping = await prisma.booking.findMany({
            where: {
                bikeId: booking.bikeId,
                id: { not: booking.id },
                status: { in: EXTEND_OVERLAP_STATUSES },
                pickupAt: { lt: windowEnd },
                returnAt: { gt: windowStart },
            },
            select: {
                id: true,
                bookingNumber: true,
                pickupAt: true,
                returnAt: true,
                status: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { pickupAt: 'asc' },
        })

        for (const c of overlapping) {
            conflicts.push({
                id: c.id,
                bookingNumber: c.bookingNumber,
                pickupAt: c.pickupAt,
                returnAt: c.returnAt,
                status: c.status,
                user: c.user,
                message: `Overlaps booking #${c.bookingNumber || c.id.slice(0, 8)} (${c.status}) on bike ${booking.bike?.bikeNumber || ''}. Change bike on that booking (or this one) before extending.`,
            })
        }
    } else {
        warnings.push({
            level: 'info',
            code: 'NO_BIKE',
            message: 'No bike assigned yet. Extension only updates the schedule.',
        })
    }

    const pkgLabel = (p) =>
        p
            ? {
                  id: p.id,
                  packageName: p.packageName || p._packageName,
                  durationHours: p.durationHours,
                  includedKm: p.includedKm,
                  price: Number(p.price) || 0,
                  composed: Boolean(p._composed),
              }
            : null

    return {
        booking: {
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            pickupAt: booking.pickupAt,
            returnAt: booking.returnAt,
            durationHours: booking.durationHours,
            totalAmount: booking.totalAmount,
            isExtended: Boolean(booking.isExtended),
            originalReturnAt: booking.originalReturnAt,
            extensionAmount: Number(booking.extensionAmount || 0),
            bike: booking.bike,
            pricing: booking.pricing,
        },
        proposed: {
            returnAt: newReturn.toISOString(),
            durationHours: totalDurationHours,
            extensionHours,
            extensionPricing: pkgLabel(extensionPricing),
            // legacy field for older UI — maps to extension package
            matchedPricing: pkgLabel(extensionPricing),
            extensionBase,
            extensionGst,
            extensionTotal,
            newTotalAmount,
            gstEnabled: Boolean(settings?.gstEnabled),
            gstRate: Number(settings?.gstRate ?? 0),
        },
        conflicts,
        hasConflict: conflicts.length > 0,
        warnings,
    }
}

/**
 * Admin extend: push returnAt forward (CONFIRMED / ACTIVE only).
 * Additive package: original package kept; extension hours priced separately.
 * Adds extension base + GST to totalAmount. Hard-blocks bike overlaps.
 */
export const extendBooking = async (bookingId, newReturnAtISO) => {
    const preview = await previewExtendBooking(bookingId, newReturnAtISO)
    if (preview.hasConflict) {
        const first = preview.conflicts[0]
        throw new ApiError(
            400,
            `Cannot extend: overlaps booking #${first.bookingNumber || first.id.slice(0, 8)}. Change bike on the conflicting booking first.`
        )
    }

    const newReturn = new Date(preview.proposed.returnAt)
    const durationHours = preview.proposed.durationHours
    const extensionBase = Number(preview.proposed.extensionBase || 0)
    const extensionTotal = Number(preview.proposed.extensionTotal || 0)
    const matched = preview.proposed.extensionPricing

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            returnAt: true,
            originalReturnAt: true,
            extensionAmount: true,
            includedKm: true,
            totalAmount: true,
        },
    })

    const data = {
        returnAt: newReturn,
        durationHours,
        isExtended: true,
        originalReturnAt: booking.originalReturnAt || booking.returnAt,
        extensionAmount: Number(
            (Number(booking.extensionAmount || 0) + extensionBase).toFixed(2)
        ),
        totalAmount: Number((Number(booking.totalAmount || 0) + extensionTotal).toFixed(2)),
    }

    if (matched && matched.includedKm != null) {
        data.includedKm = Number(booking.includedKm || 0) + Number(matched.includedKm || 0)
    }
    // pricingId stays on the original package — do not switch to a combined package

    const updated = await prisma.$transaction(async (tx) => {
        const row = await tx.booking.update({
            where: { id: bookingId },
            data,
            include: BOOKING_INCLUDE,
        })

        const paidAmount = (row.payments || [])
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0)

        let paymentStatus = row.paymentStatus
        if (paidAmount + 0.0001 < Number(row.totalAmount || 0)) {
            paymentStatus =
                paidAmount > 0 ? 'PARTIALLY_PAID' : row.paymentStatus === 'PAID' ? 'PARTIALLY_PAID' : row.paymentStatus
            if (paidAmount > 0 || row.paymentStatus === 'PAID') {
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { paymentStatus: 'PARTIALLY_PAID' },
                })
                row.paymentStatus = 'PARTIALLY_PAID'
            }
        }

        return row
    })

    return {
        booking: updated,
        previousReturnAt: preview.booking.returnAt,
        previousDurationHours: preview.booking.durationHours,
        extension: {
            hours: preview.proposed.extensionHours,
            base: extensionBase,
            gst: preview.proposed.extensionGst,
            total: extensionTotal,
            package: matched,
        },
        warnings: preview.warnings.filter((w) => w.level !== 'error'),
    }
}

