import express from 'express'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { validate } from '../../../middlewares/validation.middleware.js'
import {
  adminCreateBookingSchema,
  adminDeskCreateBookingSchema,
  adminCheckAvailabilitySchema,
  adminAvailableBikesSchema,
  pickupSchema,
  returnSchema,
  collectPaymentSchema,
  adminCancelBookingSchema,
  recordCashRefundSchema,
} from './booking.admin.validation.js'
import {
  createBookingController,
  createDeskBookingController,
  checkAvailabilityController,
  listAvailableBikesController,
  listBookingsController,
  getBookingController,
  pickupBookingController,
  returnBookingController,
  cancelBookingController,
  recordCashRefundController,
  collectAdditionalPaymentController,
  previewLateChargesController,
  lateReturnStatsController,
} from './booking.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)

router.post('/', requirePermission('bookings.create'), validate(adminCreateBookingSchema), createBookingController)
/** Desk / walk-in booking (shared walk-in user + guest fields) */
router.post(
  '/desk',
  requirePermission('bookings.create'),
  validate(adminDeskCreateBookingSchema),
  createDeskBookingController
)
router.post(
  '/check-availability',
  requirePermission('bookings.create'),
  validate(adminCheckAvailabilitySchema),
  checkAvailabilityController
)
router.post(
  '/available-bikes',
  requirePermission('bookings.create'),
  validate(adminAvailableBikesSchema),
  listAvailableBikesController
)
router.get('/', requirePermission('bookings.read'), listBookingsController)
router.get('/late-returns', requirePermission('bookings.read'), lateReturnStatsController)
router.get('/:id', requirePermission('bookings.read'), getBookingController)
router.get('/:id/late-charges', requirePermission('bookings.read'), previewLateChargesController)
router.patch('/:id/pickup', requirePermission('bookings.update'), validate(pickupSchema), pickupBookingController)
router.patch('/:id/return', requirePermission('bookings.update'), validate(returnSchema), returnBookingController)
router.post('/:id/payments', requirePermission('bookings.update'), validate(collectPaymentSchema), collectAdditionalPaymentController)
router.patch('/:id/cancel', requirePermission('bookings.cancel'), validate(adminCancelBookingSchema), cancelBookingController)
router.post('/:id/cash-refund', requirePermission('bookings.cancel'), validate(recordCashRefundSchema), recordCashRefundController)

export default router
