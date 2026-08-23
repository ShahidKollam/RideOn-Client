import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { bookingListQuerySchema } from './booking.admin.validation.js'
import {
  listBookings,
  getBookingById,
  createBooking,
  pickupBooking,
  returnBooking,
  cancelBooking,
} from './booking.admin.service.js'
import prisma from '../../../config/prisma.js'

const audit = async (req, action, entityId, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action,
        entityType: 'Booking',
        entityId,
        metadata,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    })
  } catch { /* non-blocking */ }
}

export const createBookingController = asyncHandler(async (req, res) => {
  const { userId, campusId, pricingId, pickupAt, returnAt, bikeId, helmetCount, notes } = req.body
  const booking = await createBooking({
    userId, campusId, pricingId, pickupAt, returnAt, bikeId, helmetCount, notes,
  })
  await audit(req, 'CREATE', booking.id)
  res.status(201).json(new ApiResponse(201, 'Booking created', booking))
})

export const listBookingsController = asyncHandler(async (req, res) => {
  const query = bookingListQuerySchema.parse(req.query)
  const result = await listBookings(query)
  res.status(200).json(new ApiResponse(200, 'Bookings retrieved', result))
})

export const getBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const booking = await getBookingById(id)
  res.status(200).json(new ApiResponse(200, 'Booking retrieved', booking))
})

export const pickupBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { pickupOdometer } = req.body
  const booking = await pickupBooking(id, pickupOdometer)
  await audit(req, 'UPDATE', id, { action: 'pickup', pickupOdometer })
  res.status(200).json(new ApiResponse(200, 'Booking picked up', booking))
})

export const returnBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { returnOdometer } = req.body
  const booking = await returnBooking(id, returnOdometer)
  await audit(req, 'UPDATE', id, { action: 'return', returnOdometer })
  res.status(200).json(new ApiResponse(200, 'Booking returned', booking))
})

export const cancelBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const booking = await cancelBooking(id)
  await audit(req, 'CANCEL', id)
  res.status(200).json(new ApiResponse(200, 'Booking cancelled', booking))
})
