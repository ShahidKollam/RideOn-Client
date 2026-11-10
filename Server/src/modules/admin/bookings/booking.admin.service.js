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
import { sendBookingConfirmationEmail, sendGuestSignupInvitationEmail } from '../../../lib/mailer.js'

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
        Number(booking.disruptionPenalty || 0)

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
 * Compute late charges using existing pricing package logic (same duration rules).
 * Does NOT apply them — admin chooses via applyLateFee / applyDisruptionPenalty.
 */
export const computeLateCharges = async (booking, settings, asOf = new Date()) => {
    const scheduledReturn = new Date(booking.returnAt)
    const lateMs = asOf.getTime() - scheduledReturn.getTime()
    const lateDurationMinutes = lateMs > 0 ? Math.ceil(lateMs / (60 * 1000)) : 0

    let calculatedLateRental = 0
    let latePricingInfo = null

    if (lateDurationMinutes > 0) {
        // Convert late minutes to billable hours (ceil), min 1h when any lateness
        const lateHours = Math.max(1, Math.ceil(lateDurationMinutes / 60))
        try {
            const latePricing = await findPricingByDuration(lateHours, booking.campusId)
            calculatedLateRental = Number(latePricing.price) || 0
            latePricingInfo = {
                durationHours: lateHours,
                packageName: latePricing.packageName || latePricing._packageName,
                price: calculatedLateRental,
                composed: Boolean(latePricing._composed),
            }
        } catch {
            // No matching package — leave calculatedLateRental at 0
            calculatedLateRental = 0
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
        lateOnly,
    } = query

    const where = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (campusId) where.campusId = campusId
    if (userId) where.userId = userId
    if (bikeId) where.bikeId = bikeId
    if (from || to) {
        where.pickupAt = {}
        if (from) where.pickupAt.gte = new Date(from)
        if (to) where.pickupAt.lte = new Date(to)
    }
    if (search) {
        where.OR = [
            { bookingNumber: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { bike: { bikeNumber: { contains: search, mode: 'insensitive' } } },
        ]
    }

    // Late returns: ACTIVE past returnAt, or COMPLETED with lateDurationMinutes > 0
    if (lateOnly) {
        where.OR = [
            ...(where.OR || []),
            {
                status: 'ACTIVE',
                returnAt: { lt: new Date() },
            },
            {
                lateDurationMinutes: { gt: 0 },
            },
        ]
    }

    const skip = (page - 1) * limit
    const [items, total, settings] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: BOOKING_INCLUDE,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
        prisma.systemSetting.findFirst(),
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

    return prisma.$transaction(async (tx) => {
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
            ...withPaymentSummary(updated, settings),
            lateChargeDetails: {
                ...lateInfo,
                appliedLateFee: lateFee,
                appliedDisruptionPenalty: disruptionPenalty,
                lateHelmetFee,
            },
        }
    })
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
 * List campus bikes with conflict + next-booking impact for change-bike UI.
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

    const options = bikes.map((bike) => {
        const others = byBike.get(bike.id) || []
        const conflict = others.find(
            (ob) =>
                new Date(ob.pickupAt) < bufferedReturnAt &&
                new Date(ob.returnAt) > bufferStart
        )
        const nextBooking =
            others.find((ob) => new Date(ob.pickupAt) >= now) ||
            others.find((ob) => new Date(ob.returnAt) >= now) ||
            null

        const warnings = []
        if (bike.id === booking.bikeId) {
            warnings.push({ level: 'info', code: 'CURRENT', message: 'Already assigned to this booking' })
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
                level: 'error',
                code: 'CONFLICT',
                message: `Overlaps booking #${conflict.bookingNumber || conflict.id.slice(0, 8)} (${conflict.status}).`,
            })
        } else if (nextBooking) {
            warnings.push({
                level: 'warning',
                code: 'NEXT',
                message: `Next booking on this bike: #${nextBooking.bookingNumber || nextBooking.id.slice(0, 8)} · pickup ${new Date(nextBooking.pickupAt).toLocaleString('en-IN')}.`,
            })
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

    // AVAILABLE first, then no conflict, then by bike number
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
    if (newBike.status !== 'AVAILABLE' && !confirmNonAvailable) {
        throw new ApiError(
            400,
            `Bike is ${newBike.status}. Pass confirmNonAvailable to proceed if it is free at the counter.`
        )
    }

    const bufferMinutes = await getBookingBufferMinutes()
    const bufferStart = new Date(new Date(booking.pickupAt).getTime() - bufferMinutes * 60 * 1000)
    const bufferedReturnAt = new Date(new Date(booking.returnAt).getTime() + bufferMinutes * 60 * 1000)

    const conflict = await prisma.booking.findFirst({
        where: {
            bikeId: newBikeId,
            id: { not: booking.id },
            status: { in: OVERLAP_STATUSES },
            pickupAt: { lt: bufferedReturnAt },
            returnAt: { gt: bufferStart },
        },
        select: { id: true, bookingNumber: true, status: true, pickupAt: true, returnAt: true },
    })
    if (conflict) {
        throw new ApiError(
            400,
            `Bike conflicts with booking #${conflict.bookingNumber || conflict.id.slice(0, 8)} (${conflict.status})`
        )
    }

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

    const durationHours = Math.max(1, Math.ceil((newReturn - pickup) / (1000 * 60 * 60)))
    if (durationHours > 72) {
        throw new ApiError(400, 'Extended duration cannot exceed 72 hours')
    }

    const warnings = []
    let matchedPricing = null
    try {
        matchedPricing = await findPricingByDuration(durationHours, booking.campusId)
    } catch {
        matchedPricing = null
        warnings.push({
            level: 'warning',
            code: 'NO_PACKAGE',
            message: `No pricing package matches ${durationHours}h. Schedule will still update; included km package left unchanged.`,
        })
    }

    if (matchedPricing && matchedPricing.id !== booking.pricingId) {
        warnings.push({
            level: 'info',
            code: 'PACKAGE',
            message: `Duration becomes ${durationHours}h. Closest package: ${matchedPricing.packageName || matchedPricing.durationHours + 'h'} (${matchedPricing.includedKm ?? '—'} km included). Schedule will update; existing paid total is not auto-changed.`,
        })
    } else {
        warnings.push({
            level: 'info',
            code: 'DURATION',
            message: `Duration becomes ${durationHours}h (was ${booking.durationHours ?? '—'}h). Return time updates so the ride is not treated as late until the new time.`,
        })
    }

    let conflicts = []
    if (booking.bikeId) {
        const bufferMinutes = await getBookingBufferMinutes()
        const bufferStart = new Date(pickup.getTime() - bufferMinutes * 60 * 1000)
        const bufferedReturnAt = new Date(newReturn.getTime() + bufferMinutes * 60 * 1000)

        conflicts = await prisma.booking.findMany({
            where: {
                bikeId: booking.bikeId,
                id: { not: booking.id },
                status: { in: EXTEND_OVERLAP_STATUSES },
                pickupAt: { lt: bufferedReturnAt },
                returnAt: { gt: bufferStart },
            },
            orderBy: { pickupAt: 'asc' },
            select: {
                id: true,
                bookingNumber: true,
                status: true,
                pickupAt: true,
                returnAt: true,
            },
        })

        for (const c of conflicts) {
            warnings.push({
                level: 'error',
                code: 'CONFLICT',
                message: `Overlaps booking #${c.bookingNumber || c.id.slice(0, 8)} (${c.status}) on bike ${booking.bike?.bikeNumber || ''}. Change bike on that booking (or this one) before extending.`,
            })
        }

        if (conflicts.length === 0) {
            const nextBooking = await prisma.booking.findFirst({
                where: {
                    bikeId: booking.bikeId,
                    id: { not: booking.id },
                    status: { in: EXTEND_OVERLAP_STATUSES },
                    pickupAt: { gte: currentReturn },
                },
                orderBy: { pickupAt: 'asc' },
                select: {
                    id: true,
                    bookingNumber: true,
                    status: true,
                    pickupAt: true,
                    returnAt: true,
                },
            })
            if (nextBooking) {
                warnings.push({
                    level: 'warning',
                    code: 'NEXT',
                    message: `Next booking on this bike: #${nextBooking.bookingNumber || nextBooking.id.slice(0, 8)} · pickup ${new Date(nextBooking.pickupAt).toLocaleString('en-IN')}. Extension stays clear of it.`,
                })
            }
        }
    } else {
        warnings.push({
            level: 'warning',
            code: 'NO_BIKE',
            message: 'No bike assigned yet. Extension only updates the schedule.',
        })
    }

    return {
        booking: {
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            pickupAt: booking.pickupAt,
            returnAt: booking.returnAt,
            durationHours: booking.durationHours,
            bike: booking.bike,
            pricing: booking.pricing,
        },
        proposed: {
            returnAt: newReturn.toISOString(),
            durationHours,
            matchedPricing: matchedPricing
                ? {
                      id: matchedPricing.id,
                      packageName: matchedPricing.packageName,
                      durationHours: matchedPricing.durationHours,
                      includedKm: matchedPricing.includedKm,
                      price: matchedPricing.price,
                  }
                : null,
        },
        conflicts,
        hasConflict: conflicts.length > 0,
        warnings,
    }
}

/**
 * Admin extend: push returnAt forward (CONFIRMED / ACTIVE only).
 * Hard-blocks bike overlaps. Updates durationHours + includedKm when a package matches.
 * Does not auto-alter totalAmount / payment (avoids paid-booking accounting issues).
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
    const matched = preview.proposed.matchedPricing

    const data = {
        returnAt: newReturn,
        durationHours,
    }
    if (matched) {
        data.pricingId = matched.id
        if (matched.includedKm != null) data.includedKm = matched.includedKm
        // keep money fields unchanged for paid / desk continuity
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data,
        include: BOOKING_INCLUDE,
    })

    return {
        booking: updated,
        previousReturnAt: preview.booking.returnAt,
        previousDurationHours: preview.booking.durationHours,
        warnings: preview.warnings.filter((w) => w.level !== 'error'),
    }
}
