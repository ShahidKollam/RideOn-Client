import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { campus: true, drivingLicense: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { campus: true },
  });
  return user;
};
