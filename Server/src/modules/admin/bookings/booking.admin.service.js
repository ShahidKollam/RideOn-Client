/**
 * Fully independent admin booking service — Prisma only.
 * No imports from client booking.service.
 */
import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'
import { randomUUID } from 'crypto'

const ADMIN_CANCELLABLE = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'NO_SHOW']
const BOOKING_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  bike: {
    select: { id: true, name: true, registrationNumber: true, status: true },
  },
  campus: { select: { id: true, name: true } },
  pricing: { select: { id: true, packageName: true, durationHours: true } },
  payment: {
    select: {
      id: true,
      status: true,
      amount: true,
      gatewayOrderId: true,
      paidAt: true,
    },
  },
}

function bookingNumber() {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const r = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `BK${y}${m}${day}${r}`
}

export const listBookings = async (query) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    campusId,
    userId,
    bikeId,
    search,
    from,
    to,
  } = query

  const where = {}
  if (status) where.status = status
  if (paymentStatus) where.paymentStatus = paymentStatus
  if (campusId) where.campusId = campusId
  if (userId) where.userId = userId
  if (bikeId) where.bikeId = bikeId
  if (from || to) {
    where.pickupAt = {}
    if (from) where.pickupAt.gte = new Date(from)
    if (to) where.pickupAt.lte = new Date(to)
  }
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: BOOKING_INCLUDE,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export const getBookingById = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: BOOKING_INCLUDE,
  })
  if (!booking) throw new ApiError(404, 'Booking not found')
  return booking
}

export const createBooking = async (data) => {
  const { userId, campusId, pricingId, pickupAt, returnAt, bikeId, helmetCount = 0, notes } = data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, 'User not found')

  const campus = await prisma.campus.findUnique({ where: { id: campusId } })
  if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid or inactive campus')

  const pricing = await prisma.pricing.findUnique({ where: { id: pricingId } })
  if (!pricing || !pricing.isActive) throw new ApiError(400, 'Invalid or inactive pricing')

  const pickup = new Date(pickupAt)
  const ret = new Date(returnAt)
  if (ret <= pickup) throw new ApiError(400, 'returnAt must be after pickupAt')

  const durationHours = Math.ceil((ret - pickup) / (1000 * 60 * 60))

  // Helmet amount from system settings
  let helmetAmount = 0
  const settings = await prisma.systemSetting.findFirst()
  if (settings && helmetCount > 0) {
    const first = Number(settings.helmetFirstPrice) || 0
    const second = Number(settings.helmetSecondPrice) || 0
    helmetAmount = helmetCount === 1 ? first : first + second
  }

  const baseAmount = pricing.price
  const depositAmount = pricing.depositAmount
  const totalAmount = Number((baseAmount + helmetAmount).toFixed(2))

  if (bikeId) {
    const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
    if (!bike || !bike.isActive || bike.status !== 'AVAILABLE') {
      throw new ApiError(400, 'Bike not available')
    }
  }

  return prisma.booking.create({
    data: {
      bookingNumber: bookingNumber(),
      userId,
      campusId,
      pricingId,
      bikeId: bikeId || null,
      pickupAt: pickup,
      returnAt: ret,
      durationHours,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      baseAmount,
      depositAmount,
      discountAmount: 0,
      totalAmount,
      includedKm: pricing.includedKm,
      extraKmRate: pricing.extraKmRate,
      helmetCount,
      helmetAmount,
      notes: notes || null,
    },
    include: BOOKING_INCLUDE,
  })
}

export const pickupBooking = async (id, pickupOdometer) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { bike: true },
  })
  if (!booking) throw new ApiError(404, 'Booking not found')
  if (booking.status !== 'CONFIRMED') {
    throw new ApiError(400, 'Booking must be CONFIRMED for pickup')
  }

  let bikeId = booking.bikeId
  if (!bikeId) {
    const bike = await prisma.bike.findFirst({
      where: {
        campusId: booking.campusId,
        status: 'AVAILABLE',
        isActive: true,
      },
      orderBy: { currentOdometer: 'asc' },
    })
    if (!bike) throw new ApiError(400, 'No available bikes')
    bikeId = bike.id
  } else {
    const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
    if (!bike || bike.status !== 'AVAILABLE') {
      throw new ApiError(400, 'Assigned bike is not available')
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.bike.update({
      where: { id: bikeId },
      data: { status: 'MAINTENANCE' },
    })
    return tx.booking.update({
      where: { id },
      data: {
        bikeId,
        pickupOdometer,
        pickedUpAt: new Date(),
        status: 'ACTIVE',
      },
      include: BOOKING_INCLUDE,
    })
  })
}

export const returnBooking = async (id, returnOdometer) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { bike: true },
  })
  if (!booking) throw new ApiError(404, 'Booking not found')
  if (booking.status !== 'ACTIVE') {
    throw new ApiError(400, 'Booking must be ACTIVE for return')
  }
  if (booking.pickupOdometer == null) {
    throw new ApiError(400, 'Pickup odometer missing')
  }
  if (returnOdometer < booking.pickupOdometer) {
    throw new ApiError(400, 'returnOdometer cannot be less than pickupOdometer')
  }

  const actualKm = returnOdometer - booking.pickupOdometer
  const extraKm = Math.max(0, actualKm - booking.includedKm)
  const extraKmCharge = Number((extraKm * booking.extraKmRate).toFixed(2))

  const now = new Date()
  const isLate = now > new Date(booking.returnAt)
  let lateHelmetFee = 0
  if (isLate && (booking.helmetCount || 0) > 0) {
    const settings = await prisma.systemSetting.findFirst()
    lateHelmetFee = Number(settings?.lateHelmetFee) || 0
  }

  const lateFee = 0
  const finalTotal = Number(
    (booking.totalAmount + extraKmCharge + lateFee + lateHelmetFee).toFixed(2)
  )

  return prisma.$transaction(async (tx) => {
    if (booking.bikeId) {
      await tx.bike.update({
        where: { id: booking.bikeId },
        data: {
          currentOdometer: returnOdometer,
          status: 'AVAILABLE',
        },
      })
    }
    return tx.booking.update({
      where: { id },
      data: {
        returnOdometer,
        returnedAt: now,
        actualKm,
        extraKm,
        extraKmCharge,
        lateFee,
        lateHelmetFee,
        totalAmount: finalTotal,
        status: 'COMPLETED',
      },
      include: BOOKING_INCLUDE,
    })
  })
}

export const cancelBooking = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { bike: true },
  })
  if (!booking) throw new ApiError(404, 'Booking not found')
  if (!ADMIN_CANCELLABLE.includes(booking.status)) {
    throw new ApiError(400, `Cannot cancel booking in status ${booking.status}`)
  }

  return prisma.$transaction(async (tx) => {
    if (booking.bikeId && booking.status === 'ACTIVE') {
      await tx.bike.update({
        where: { id: booking.bikeId },
        data: { status: 'AVAILABLE' },
      })
    }
    return tx.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: BOOKING_INCLUDE,
    })
  })
}
