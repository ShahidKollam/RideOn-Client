import prisma from '../../../config/prisma.js'

export const getOverview = async () => {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    totalUsers, newUsers, totalBikes, availableBikes, maintenanceBikes, inUseBikes,
    todayBookings, activeBookings, completedBookings, cancelledBookings,
    lateReturnsCount, todayRevenueAgg, pendingPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.bike.count({ where: { isActive: true } }),
    prisma.bike.count({ where: { isActive: true, status: 'AVAILABLE' } }),
    prisma.bike.count({ where: { isActive: true, status: 'MAINTENANCE' } }),
    prisma.bike.count({ where: { isActive: true, status: 'IN_USE' } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
    prisma.booking.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({
      where: {
        status: 'ACTIVE',
        returnAt: { lt: now },
      },
    }),
    prisma.payment.aggregate({
      where: { status: 'PAID', paidAt: { gte: startOfDay, lte: endOfDay } },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
  ])

  return {
    users: { total: totalUsers, newLast7Days: newUsers },
    bikes: {
      total: totalBikes,
      available: availableBikes,
      maintenance: maintenanceBikes,
      inUse: inUseBikes,
    },
    bookings: {
      today: todayBookings,
      active: activeBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      lateReturns: lateReturnsCount,
    },
    revenue: { today: todayRevenueAgg._sum.amount || 0 },
    payments: { pending: pendingPayments },
  }
}
