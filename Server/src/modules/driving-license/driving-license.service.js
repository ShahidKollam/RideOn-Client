import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export const uploadLicense = async (userId, data) => {
  const existing = await prisma.drivingLicense.findUnique({ where: { userId } });
  if (existing) throw new ApiError(409, 'License already uploaded');

  return await prisma.drivingLicense.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const updateLicense = async (userId, data) => {
  return await prisma.drivingLicense.update({
    where: { userId },
    data,
  });
};

export const getLicense = async (userId) => {
  const license = await prisma.drivingLicense.findUnique({
    where: { userId },
  });
  if (!license) throw new ApiError(404, 'No license found');
  return license;
};
