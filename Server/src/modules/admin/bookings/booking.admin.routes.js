import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import {
  adminCreateBookingSchema,
  pickupSchema,
  returnSchema,
  collectPaymentSchema,
} from './booking.admin.validation.js'
import {
  createBookingController,
  listBookingsController,
  getBookingController,
  pickupBookingController,
  returnBookingController,
  cancelBookingController,
  collectAdditionalPaymentController,
} from './booking.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)

router.post('/', requirePermission('bookings.create'), validate(adminCreateBookingSchema), createBookingController)
router.get('/', requirePermission('bookings.read'), listBookingsController)
router.get('/:id', requirePermission('bookings.read'), getBookingController)
router.patch('/:id/pickup', requirePermission('bookings.update'), validate(pickupSchema), pickupBookingController)
router.patch('/:id/return', requirePermission('bookings.update'), validate(returnSchema), returnBookingController)
router.post('/:id/payments', requirePermission('bookings.update'), validate(collectPaymentSchema), collectAdditionalPaymentController)
router.patch('/:id/cancel', requirePermission('bookings.cancel'), cancelBookingController)

export default router
