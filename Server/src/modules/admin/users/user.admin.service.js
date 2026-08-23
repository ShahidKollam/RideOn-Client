import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'

const userSelect = {
  id: true,
  email: true,
  name: true,
  studentId: true,
  hostel: true,
  department: true,
  yearOfStudy: true,
  drivingLicenseNumber: true,
  phone: true,
  campusId: true,
  isVerified: true,
  acceptedTerms: true,
  acceptedTermsAt: true,
  onboardingStatus: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, location: true } },
  drivingLicense: {
    select: {
      id: true,
      licenseNumber: true,
      fullName: true,
      status: true,
      expiryDate: true,
    },
  },
}

export const listUsers = async (query) => {
  const {
    page = 1,
    limit = 20,
    search,
    campusId,
    isVerified,
    onboardingStatus,
    createdFrom,
    createdTo,
  } = query

  const where = {}
  if (campusId) where.campusId = campusId
  if (typeof isVerified === 'boolean') where.isVerified = isVerified
  if (onboardingStatus) where.onboardingStatus = onboardingStatus
  if (createdFrom || createdTo) {
    where.createdAt = {}
    if (createdFrom) where.createdAt.gte = new Date(createdFrom)
    if (createdTo) where.createdAt.lte = new Date(createdTo)
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { studentId: { contains: search, mode: 'insensitive' } },
    ]
  }

  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    items: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      bookings: {
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          pickupAt: true,
          returnAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export const updateUser = async (id, data) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'User not found')
  return prisma.user.update({ where: { id }, data, select: userSelect })
}

export const updateUserStatus = async (id, data) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, 'User not found')
  return prisma.user.update({ where: { id }, data, select: userSelect })
}
