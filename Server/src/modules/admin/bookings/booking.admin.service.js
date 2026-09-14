/**
 * Fully independent admin booking service — Prisma only.
 * No imports from client booking.service.
 */
import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'
import { randomUUID } from 'crypto'
import { calculateHelmetAmount } from '../../settings/settings.service.js'

const ADMIN_CANCELLABLE = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'NO_SHOW']
const BOOKING_INCLUDE = {
    user: { select: { id: true, name: true, email: true, phone: true } },
    bike: {
        select: { id: true, name: true, registrationNumber: true, status: true, currentOdometer: true },
    },
    campus: { select: { id: true, name: true } },
    pricing: { select: { id: true, packageName: true, durationHours: true } },
    payments: {
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            status: true,
            amount: true,
            gatewayOrderId: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
        },
    },
}

const withPaymentSummary = (booking, settings) => {
    const payments = booking.payments || []

    const paidAmount = payments
        .filter((payment) => payment.status === 'PAID')
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const totalAmount = Number(booking.totalAmount || 0)

    // GST from the original booking
    const originalTaxableAmount =
        Number(booking.baseAmount || 0) +
        Number(settings?.platformFeeEnabled ? settings.platformFee : 0) +
        Number(booking.helmetAmount || 0)

    const originalGstAmount = settings?.gstEnabled
        ? Number(
              (
                  (originalTaxableAmount * Number(settings.gstRate)) /
                  100
              ).toFixed(2)
          )
        : 0

    // GST added after return
    const additionalTaxableAmount =
        Number(booking.extraKmCharge || 0) +
        Number(booking.lateFee || 0) +
        Number(booking.lateHelmetFee || 0)

    const additionalGstAmount = settings?.gstEnabled
        ? Number(
              (
                  (additionalTaxableAmount * Number(settings.gstRate)) /
                  100
              ).toFixed(2)
          )
        : 0

    const gstAmount = Number(
        (originalGstAmount + additionalGstAmount).toFixed(2)
    )

    return {
        ...booking,

        gstAmount,
        originalGstAmount,
        additionalGstAmount,
        platformAmount: Number(settings?.platformFeeEnabled ? settings.platformFee : 0),
        paymentSummary: {
            paidAmount: Number(paidAmount.toFixed(2)),
            outstandingAmount: Number(
                Math.max(0, totalAmount - paidAmount).toFixed(2)
            ),
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

export const listBookings = async (query) => {
    const { page = 1, limit = 20, status, paymentStatus, campusId, userId, bikeId, search, from, to } = query

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

    return withPaymentSummary(booking, settings)
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

    // const settings = await prisma.systemSetting.findFirst()

    const platformFee = settings?.platformFeeEnabled ? Number(settings.platformFee) || 0 : 0

    const subtotal = Number((baseAmount + platformFee + helmetAmount).toFixed(2))

    const gstAmount = settings?.gstEnabled ? Number(((subtotal * Number(settings.gstRate)) / 100).toFixed(2)) : 0

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
            platformAmount: platformFee,
            includedKm: pricing.includedKm,
            extraKmRate: pricing.extraKmRate,
            helmetCount,
            helmetAmount,
            notes: notes || null,
        },
        include: BOOKING_INCLUDE,
    })
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

export const returnBooking = async (id, returnOdometer) => {
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
    const isLate = now > new Date(booking.returnAt)
    let lateHelmetFee = 0
    if (isLate && (booking.helmetCount || 0) > 0) {
        const settings = await prisma.systemSetting.findFirst()
        lateHelmetFee = Number(settings?.lateHelmetFee) || 0
    }

    const lateFee = 0
    const additionalSubtotal = Number((extraKmCharge + lateFee + lateHelmetFee).toFixed(2))

    const settings = await prisma.systemSetting.findFirst()

    const additionalGstAmount = settings?.gstEnabled
        ? Number(((additionalSubtotal * Number(settings.gstRate)) / 100).toFixed(2))
        : 0

    const finalTotal = Number((booking.totalAmount + additionalSubtotal + additionalGstAmount).toFixed(2))
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
        return tx.booking.update({
            where: { id },
            data: {
                returnOdometer,
                returnedAt: now,
                actualKm,
                extraKm,
                extraKmCharge,
                lateFee,
                lateHelmetFee,
                totalAmount: finalTotal,
                paymentStatus,
                status: 'COMPLETED',
            },
            include: BOOKING_INCLUDE,
        })
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

export const cancelBooking = async (id) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { bike: true },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (!ADMIN_CANCELLABLE.includes(booking.status)) {
        throw new ApiError(400, `Cannot cancel booking in status ${booking.status}`)
    }

    return prisma.$transaction(async (tx) => {
        if (booking.bikeId && booking.status === 'ACTIVE') {
            await tx.bike.update({
                where: { id: booking.bikeId },
                data: { status: 'AVAILABLE' },
            })
        }
        return tx.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: BOOKING_INCLUDE,
        })
    })
}
