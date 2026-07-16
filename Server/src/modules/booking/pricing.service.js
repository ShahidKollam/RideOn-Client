import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export const createPricing = async (data) => {
  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
  if (!campus || !campus.isActive) {
    throw new ApiError(400, 'Invalid or inactive campus');
  }

  const pricing = await prisma.pricing.create({
    data,
    include: { campus: true },
  });

  return pricing;
};

export const updatePricing = async (id, data) => {
  const pricing = await prisma.pricing.findUnique({ where: { id } });
  if (!pricing) {
    throw new ApiError(404, 'Pricing not found');
  }

  const updated = await prisma.pricing.update({
    where: { id },
    data,
    include: { campus: true },
  });

  return updated;
};

export const getPricingById = async (id) => {
  const pricing = await prisma.pricing.findUnique({
    where: { id, isActive: true },
    include: { campus: true },
  });
  if (!pricing) throw new ApiError(404, 'Pricing not found');
  return pricing;
};

export const getPricingList = async (query = {}) => {
  const { page = 1, limit = 10, campusId, isActive } = query;

  const where = {
    isActive: isActive !== undefined ? isActive : true,
  };
  if (campusId) where.campusId = campusId;

  const [pricings, total] = await Promise.all([
    prisma.pricing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { displayOrder: 'asc', createdAt: 'desc' },
      include: { campus: true },
    }),
    prisma.pricing.count({ where }),
  ]);

  return {
    pricings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const deletePricing = async (id) => {
  // Soft delete
  await prisma.pricing.update({
    where: { id },
    data: { isActive: false },
  });
  return { message: 'Pricing soft deleted' };
};

// Helper for booking
export const calculatePrice = (pricingData, durationHours) => {
  // Simple calc, can be enhanced
  const baseAmount = pricingData.price; // Assume price is for the duration
  // More logic if needed based on duration match
  return {
    baseAmount,
    depositAmount: pricingData.depositAmount,
    includedKm: pricingData.includedKm,
    extraKmRate: pricingData.extraKmRate,
    durationHours: pricingData.durationHours,
  };
};
