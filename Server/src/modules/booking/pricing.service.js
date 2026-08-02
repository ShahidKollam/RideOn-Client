import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

export const createPricing = async (data) => {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const pricing = await prisma.pricing.create({
        data: {
            campusId: data.campusId,
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return pricing
}

export const updatePricing = async (id, data) => {
    const pricing = await prisma.pricing.findUnique({ where: { id } })
    if (!pricing) {
        throw new ApiError(404, 'Pricing not found')
    }

    const updated = await prisma.pricing.update({
        where: { id },
        data: {
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return updated
}

export const getPricingById = async (id) => {
    const pricing = await prisma.pricing.findUnique({
        where: { id, isActive: true },
        include: { campus: true },
    })
    if (!pricing) throw new ApiError(404, 'Pricing not found')
    return pricing
}

export const getPricingList = async (query = {}) => {
    const { page = 1, limit = 20, campusId, isActive } = query

    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }
    if (campusId) where.campusId = campusId

    const [pricings, total] = await Promise.all([
        prisma.pricing.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
            include: {
                campus: true,
            },
        }),
        prisma.pricing.count({ where }),
    ])

    return {
        pricings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}

export const deletePricing = async (id) => {
    // Soft delete
    await prisma.pricing.update({
        where: { id },
        data: { isActive: false },
    })
    return { message: 'Pricing soft deleted' }
}

export const findPricingByDuration = async (durationHours, campusId, client = prisma) => {
    const pricing = await client.pricing.findFirst({
        where: {
            campusId,
            isActive: true,
            durationHours: { gte: durationHours },
        },
        orderBy: [{ durationHours: 'asc' }, { displayOrder: 'asc' }],
    })

    if (!pricing) throw new ApiError(400, 'No active pricing package matches the selected duration')
    return pricing
}

// Helper for booking. Pricing is selected by the server before this is called.
export const calculatePrice = (pricingData) => {
    const baseAmount = pricingData.price // Assume price is for the duration
    return {
        baseAmount,
        depositAmount: pricingData.depositAmount,
        includedKm: pricingData.includedKm,
        extraKmRate: pricingData.extraKmRate,
    }
}
