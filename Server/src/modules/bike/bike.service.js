import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { getBookingBufferMinutes } from '../settings/settings.service.js'

/** @deprecated Prefer getBookingBufferMinutes() — kept only for any external import compatibility */
export const BOOKING_BUFFER_MINUTES = 15

const blockingBookingStatuses = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE']

export const checkBikeAvailability = async (bikeId, pickupAt, returnAt, client = prisma) => {
    const bike = await client.bike.findUnique({ where: { id: bikeId } })
    if (!bike || !bike.isActive || bike.status !== 'AVAILABLE') {
        return { available: false, reason: 'Bike is not available' }
    }

    // Bike still on an active rental (not yet returned) is unavailable
    if (bike.status === 'IN_USE') {
        return { available: false, reason: 'Bike is currently rented' }
    }

    const bufferMinutes = await getBookingBufferMinutes(client)
    const bufferStart = new Date(pickupAt.getTime() - bufferMinutes * 60 * 1000)
    const bufferedReturnAt = new Date(returnAt.getTime() + bufferMinutes * 60 * 1000)

    const conflict = await client.booking.findFirst({
        where: {
            bikeId,
            status: { in: blockingBookingStatuses },
            pickupAt: { lt: bufferedReturnAt },
            returnAt: { gt: bufferStart },
        },
        orderBy: { pickupAt: 'asc' },
    })

    if (conflict) {
        return {
            available: false,
            reason: `${bufferMinutes}-minute buffer required between bookings`,
            conflictingBookingId: conflict.id,
        }
    }

    return { available: true }
}

/**
 * Find the first available bike for the given time range and campus
 */
export const findAvailableBike = async (pickupAt, returnAt, campusId, client = prisma) => {
    const bikes = await client.bike.findMany({
        where: {
            campusId,
            status: 'AVAILABLE',
            isActive: true,
        },
        orderBy: { currentOdometer: 'asc' },
    })

    for (const bike of bikes) {
        const availability = await checkBikeAvailability(
            bike.id,
            new Date(pickupAt),
            new Date(returnAt),
            client
        )
        if (availability.available) return bike
    }

    throw new ApiError(400, 'No available bikes for the selected time')
}

/**
 * Returns true if any bike at the campus is free for the range (with buffer).
 */
export const hasAvailableBike = async (pickupAt, returnAt, campusId, client = prisma) => {
    try {
        await findAvailableBike(pickupAt, returnAt, campusId, client)
        return true
    } catch {
        return false
    }
}

export const createBike = async (data) => {
    const campus = await prisma.campus.findUnique({
        where: { id: data.campusId },
    })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const existingBike = await prisma.bike.findUnique({
        where: { registrationNumber: data.registrationNumber },
    })
    if (existingBike) {
        throw new ApiError(409, 'Bike with this registration number already exists')
    }

    if (data.bikeNumber) {
        const existingNumber = await prisma.bike.findUnique({
            where: { bikeNumber: data.bikeNumber },
        })
        if (existingNumber) {
            throw new ApiError(409, 'Bike number already exists')
        }
    }

    const bike = await prisma.bike.create({
        data: {
            campusId: data.campusId,
            registrationNumber: data.registrationNumber,
            bikeNumber: data.bikeNumber || null,
            name: data.name,
            brand: data.brand,
            model: data.model,
            year: data.year,
            color: data.color,
            imageUrls: data.imageUrls ?? [],
            currentOdometer: data.currentOdometer ?? 0,
        },
        include: { campus: true },
    })
    return bike
}

export const updateBike = async (id, data) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }

    if (data.registrationNumber && data.registrationNumber !== bike.registrationNumber) {
        const existing = await prisma.bike.findUnique({
            where: { registrationNumber: data.registrationNumber },
        })
        if (existing) {
            throw new ApiError(409, 'Bike with this registration number already exists')
        }
    }

    if (data.bikeNumber !== undefined && data.bikeNumber !== bike.bikeNumber) {
        if (data.bikeNumber) {
            const existingNumber = await prisma.bike.findUnique({
                where: { bikeNumber: data.bikeNumber },
            })
            if (existingNumber) {
                throw new ApiError(409, 'Bike number already exists')
            }
        }
    }

    const updatedBike = await prisma.bike.update({
        where: { id },
        data,
        include: { campus: true },
    })
    return updatedBike
}

export const getBikeById = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id, isActive: true },
        include: { campus: true },
    })
    if (!bike) {
        throw new ApiError(404, 'Bike not found')
    }
    return bike
}

export const getBikeList = async (query = {}) => {
    const { page = 1, limit = 10, search, campusId, status, isActive } = query
    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }
    if (campusId) where.campusId = campusId
    if (status) where.status = status
    if (search) {
        where.OR = [
            { registrationNumber: { contains: search, mode: 'insensitive' } },
            { bikeNumber: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
        ]
    }
    const [bikes, total] = await Promise.all([
        prisma.bike.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { campus: true },
        }),
        prisma.bike.count({ where }),
    ])
    return {
        bikes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export const changeBikeStatus = async (id, status) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }
    const updatedBike = await prisma.bike.update({
        where: { id },
        data: { status },
        include: { campus: true },
    })
    return updatedBike
}

export const deleteBike = async (id) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike) {
        throw new ApiError(404, 'Bike not found')
    }
    await prisma.bike.update({
        where: { id },
        data: { isActive: false },
    })
    return { message: 'Bike soft deleted successfully' }
}
