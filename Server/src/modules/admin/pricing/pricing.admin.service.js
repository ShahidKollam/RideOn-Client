import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'

export const createPricing = async (data) => {
  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
  if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')

  return prisma.pricing.create({
    data: {
      campusId: data.campusId,
      packageName: data.packageName,
      durationHours: data.durationHours,
      price: data.price,
      includedKm: data.includedKm,
      extraKmRate: data.extraKmRate,
      depositAmount: data.depositAmount,
      displayOrder: data.displayOrder ?? 0,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
    },
    include: { campus: { select: { id: true, name: true } } },
  })
}

export const listPricing = async (query) => {
  const { page = 1, limit = 50, campusId, isActive } = query
  const where = {}
  if (campusId) where.campusId = campusId
  if (typeof isActive === 'boolean') where.isActive = isActive

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    prisma.pricing.findMany({
      where,
      include: { campus: { select: { id: true, name: true } } },
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.pricing.count({ where }),
  ])

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export const getPricingById = async (id) => {
  const pricing = await prisma.pricing.findUnique({
    where: { id },
    include: { campus: { select: { id: true, name: true } } },
  })
  if (!pricing) throw new ApiError(404, 'Pricing not found')
  return pricing
}

export const updatePricing = async (id, data) => {
  const existing = await prisma.pricing.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Pricing not found')

  if (data.campusId) {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')
  }

  return prisma.pricing.update({
    where: { id },
    data,
    include: { campus: { select: { id: true, name: true } } },
  })
}

export const deletePricing = async (id) => {
  const existing = await prisma.pricing.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'Pricing not found')

  // Soft deactivate to preserve booking history
  await prisma.pricing.update({
    where: { id },
    data: { isActive: false },
  })
  return { id, deleted: true }
}
