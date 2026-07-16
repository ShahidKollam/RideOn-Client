import prisma from '../../config/prisma.js';

export const getActiveCampuses = async () => {
  return await prisma.campus.findMany({
    where: { isActive: true },
    select: { id: true, name: true, location: true },
  });
};
