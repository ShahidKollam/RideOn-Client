import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'

export const createBike = async (data) => {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const existing = await prisma.bike.findUnique({
        where: { registrationNumber: data.registrationNumber },
    })
    if (existing) {
        throw new ApiError(409, 'Bike with this registration number already exists')
    }

    return prisma.bike.create({
        data: {
            campusId: data.campusId,
            registrationNumber: data.registrationNumber,
            name: data.name,
            brand: data.brand,
            model: data.model,
            year: data.year,
            color: data.color,
            imageUrls: data.imageUrls ?? [],
            currentOdometer: data.currentOdometer ?? 0,
        },
        include: { campus: { select: { id: true, name: true, location: true } } },
    })
}

export const listBikes = async (query) => {
    const { page = 1, limit = 20, campusId, status, isActive, search } = query
    const where = {}
    if (campusId) where.campusId = campusId
    if (status) where.status = status
    if (typeof isActive === 'boolean') where.isActive = isActive
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { registrationNumber: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
        ]
    }

    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
        prisma.bike.findMany({
            where,
            include: { campus: { select: { id: true, name: true, location: true } } },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.bike.count({ where }),
    ])

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    }
}

export const getBikeById = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
        include: { campus: { select: { id: true, name: true, location: true } } },
    })
    if (!bike) throw new ApiError(404, 'Bike not found')
    return bike
}

export const updateBike = async (id, data) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike || !bike.isActive) throw new ApiError(404, 'Bike not found or inactive')

    if (data.registrationNumber && data.registrationNumber !== bike.registrationNumber) {
        const clash = await prisma.bike.findUnique({
            where: { registrationNumber: data.registrationNumber },
        })
        if (clash) throw new ApiError(409, 'Registration number already exists')
    }

    if (data.campusId) {
        const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
        if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')
    }

    return prisma.bike.update({
        where: { id },
        data,
        include: { campus: { select: { id: true, name: true, location: true } } },
    })
}

export const changeBikeStatus = async (id, status) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike) throw new ApiError(404, 'Bike not found')

    return prisma.bike.update({
        where: { id },
        data: { status },
        include: { campus: { select: { id: true, name: true, location: true } } },
    })
}

export const deleteBike = async (id) => {
    const bike = await prisma.bike.findUnique({ where: { id } })
    if (!bike) throw new ApiError(404, 'Bike not found')

    // Soft delete — keep history
    await prisma.bike.update({
        where: { id },
        data: { isActive: false, status: 'RETIRED' },
    })
    return { id, deleted: true }
}
