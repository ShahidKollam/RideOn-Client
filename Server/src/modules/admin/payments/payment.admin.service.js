import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'

export const listPayments = async (query) => {
  const {
    page = 1, limit = 20, status, paymentMethod, bookingId, userId, dateFrom, dateTo,
  } = query

  const where = {}
  if (status) where.status = status
  if (paymentMethod) where.paymentMethod = paymentMethod
  if (bookingId) where.bookingId = bookingId
  if (userId) where.userId = userId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: {
          select: { id: true, bookingNumber: true, status: true, totalAmount: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ])

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  }
}

export const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      booking: {
        select: {
          id: true, bookingNumber: true, status: true, paymentStatus: true,
          totalAmount: true, baseAmount: true, depositAmount: true,
          pickupAt: true, returnAt: true,
        },
      },
    },
  })
  if (!payment) throw new ApiError(404, 'Payment not found')
  const safe = { ...payment }
  if (safe.gatewayResponse) safe.gatewayResponse = { summary: 'present' }
  return safe
}
