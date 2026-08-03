import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { getBookingAvailability } from './availability.service.js'
import { findAvailableBike } from '../bike/bike.service.js'

const generateBookingNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000)
    return `BK${year}${random.toString().padStart(6, '0')}`
}

const isSerializationError = (error) => {
    // Prisma P2034 = write conflict / deadlock (serialization failure)
    return error?.code === 'P2034' || error?.message?.toLowerCase?.().includes('serialization')
}

const isUniqueConstraintError = (error) => {
    // Prisma P2002 = unique constraint failed
    return error?.code === 'P2002'
}

export const createBooking = async (data, userIdFromAuth = null) => {
    const userId = userIdFromAuth || data.userId
    if (!userId) throw new ApiError(400, 'User ID required')

    // Validate user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { drivingLicense: true },
    })
    if (!user) throw new ApiError(404, 'User not found')
    if (!user.isVerified) throw new ApiError(400, 'User email not verified')
    if (user.onboardingStatus !== 'PROFILE_COMPLETED') throw new ApiError(400, 'Complete your profile')
    // if (user.drivingLicense?.status !== 'APPROVED') throw new ApiError(400, 'Driving license not approved') // dont remove this line

    // Check no active booking
    const activeBooking = await prisma.booking.findFirst({
        where: {
            userId,
            status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
    })
    if (activeBooking) throw new ApiError(400, 'User has an active booking')

    const MAX_ATTEMPTS = 2

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let bookingNumber = generateBookingNumber()

        try {
            const booking = await prisma.$transaction(
                async (tx) => {
                    // Re-check availability + get pricing snapshot inside the transaction
                    const summary = await getBookingAvailability(data, tx)
                    if (!summary.available) {
                        throw new ApiError(409, summary.reason || 'No available bikes')
                    }

                    // Assign the first available bike (single assignment point)
                    const bike = await findAvailableBike(
                        new Date(data.pickupAt),
                        new Date(data.returnAt),
                        data.campusId,
                        tx
                    )

                    return tx.booking.create({
                        data: {
                            bookingNumber,
                            userId,
                            bikeId: bike.id,
                            campusId: data.campusId,
                            pricingId: summary.pricing.id,
                            pickupAt: new Date(data.pickupAt),
                            returnAt: new Date(data.returnAt),
                            durationHours: summary.durationHours,
                            status: 'PAYMENT_PENDING',
                            paymentStatus: 'PENDING',
                            baseAmount: summary.baseAmount,
                            depositAmount: summary.depositAmount,
                            totalAmount: summary.totalAmount,
                            includedKm: summary.includedKm,
                            extraKmRate: summary.extraKmRate,
                            notes: data.notes,
                        },
                        include: {
                            user: true,
                            campus: true,
                            pricing: true,
                            bike: true,
                        },
                    })
                },
                { isolationLevel: 'Serializable' }
            )

            return booking
        } catch (error) {
            // Retry once on serialization failure or bookingNumber collision
            if (attempt < MAX_ATTEMPTS && (isSerializationError(error) || isUniqueConstraintError(error))) {
                continue
            }
            throw error
        }
    }
}

export const assignBike = async (bookingId, bikeId) => {
    return await prisma.booking.update({
        where: { id: bookingId },
        data: { bikeId },
    })
}

export const cancelBooking = async (bookingId, userId) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.userId !== userId) throw new ApiError(403, 'Not authorized')

    if (!['PAYMENT_PENDING', 'CONFIRMED'].includes(booking.status)) {
        throw new ApiError(400, 'Cannot cancel booking in current status')
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
    })

    return updated
}

export const pickupBooking = async (bookingId, pickupOdometer, adminId = null) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { bike: true },
    })
    if (!booking || booking.status !== 'CONFIRMED') {
        throw new ApiError(400, 'Booking must be CONFIRMED for pickup')
    }

    // For admin or validate window
    const now = new Date()
    if (now < booking.pickupAt || now > booking.returnAt) {
        // Allow some window, simplified
    }

    let bike = null
    if (!booking.bikeId) {
        bike = await findAvailableBike(booking.pickupAt, booking.returnAt, booking.campusId)
    } else {
        bike = await prisma.bike.findUnique({ where: { id: booking.bikeId } })
    }

    if (!bike || bike.status !== 'AVAILABLE') throw new ApiError(400, 'Bike not available')

    return await prisma.$transaction(async (tx) => {
        await tx.bike.update({
            where: { id: bike.id },
            data: { status: 'MAINTENANCE' }, // or occupied logic, but per spec
        })

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: {
                bikeId: bike.id,
                pickupOdometer,
                pickedUpAt: new Date(),
                status: 'ACTIVE',
            },
        })

        return updatedBooking
    })
}

export const returnBooking = async (bookingId, returnOdometer) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { bike: true },
    })
    if (!booking || booking.status !== 'ACTIVE') {
        throw new ApiError(400, 'Booking must be ACTIVE for return')
    }

    const actualKm = returnOdometer - booking.pickupOdometer
    const extraKm = Math.max(0, actualKm - booking.includedKm)
    const extraKmCharge = extraKm * booking.extraKmRate
    // Late fee logic simplified
    const lateFee = 0 // Implement based on time

    const finalTotal = booking.totalAmount + extraKmCharge + lateFee

    return await prisma.$transaction(async (tx) => {
        await tx.bike.update({
            where: { id: booking.bikeId },
            data: {
                currentOdometer: returnOdometer,
                status: 'AVAILABLE',
            },
        })

        const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
                returnOdometer,
                returnedAt: new Date(),
                actualKm,
                extraKm,
                extraKmCharge,
                lateFee,
                totalAmount: finalTotal,
                status: 'COMPLETED',
            },
        })

        return updated
    })
}

export const getBooking = async (id, userId = null) => {
    const where = { id }
    if (userId) where.userId = userId

    const booking = await prisma.booking.findUnique({
        where,
        include: {
            user: true,
            bike: true,
            campus: true,
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    return booking
}

export const getBookings = async (query = {}, userId = null) => {
    const { page = 1, limit = 10, search, status, campusId } = query

    const where = {}
    if (userId) where.userId = userId
    if (status) where.status = status
    if (campusId) where.campusId = campusId

    if (search) {
        where.OR = [
            { bookingNumber: { contains: search, mode: 'insensitive' } },
            // Add user name etc via include or separate query
        ]
    }

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                bike: { select: { registrationNumber: true, name: true } },
                campus: true,
            },
        }),
        prisma.booking.count({ where }),
    ])

    return {
        bookings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}
