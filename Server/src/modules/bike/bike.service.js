import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'


export const createBike = async (data) => {
    // Verify campus exists and is active
    const campus = await prisma.campus.findUnique({
        where: {
            id: data.campusId,
        },
    })

    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    // Check if registration number already exists
    const existingBike = await prisma.bike.findUnique({
        where: {
            registrationNumber: data.registrationNumber,
        },
    })

    if (existingBike) {
        throw new ApiError(409, 'Bike with this registration number already exists')
    }

    // Create bike
    const bike = await prisma.bike.create({
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
        include: {
            campus: true,
        },
    })

    return bike
}

export const updateBike = async (id, data) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }

    const updatedBike = await prisma.bike.update({
        where: { id },
        data,
        include: {
            campus: true,
        },
    })

    return updatedBike
}

export const getBikeById = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id, isActive: true },
        include: {
            campus: true,
        },
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
            include: {
                campus: true,
            },
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
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }

    const updatedBike = await prisma.bike.update({
        where: { id },
        data: { status },
        include: {
            campus: true,
        },
    })

    return updatedBike
}

export const deleteBike = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike) {
        throw new ApiError(404, 'Bike not found')
    }

    // Soft delete
    await prisma.bike.update({
        where: { id },
        data: { isActive: false },
    })

    return { message: 'Bike soft deleted successfully' }
}
