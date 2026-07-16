import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

export const getAdminProfile = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { campus: true },
  });
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
};

export const getUsers = async (campusId, page = 1, limit = 10) => {
  const { skip, take } = { skip: (page - 1) * limit, take: limit };
  return await prisma.user.findMany({
    where: campusId ? { campusId } : {},
    skip,
    take,
    include: { campus: true, drivingLicense: true },
  });
};
