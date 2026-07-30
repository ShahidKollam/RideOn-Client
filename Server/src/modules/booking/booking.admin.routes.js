import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  adminCreateBookingController,
  getBookingsController,
  getBookingController,
  pickupBookingController,
  returnBookingController,
  cancelBookingController,
} from './booking.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { adminCreateBookingSchema } from './booking.validation.js';

const router = express.Router();

router.post('/', protectAdmin, validate(adminCreateBookingSchema), adminCreateBookingController);
router.get('/', protectAdmin, getBookingsController);
router.get('/:id', protectAdmin, getBookingController);
router.patch('/:id/pickup', protectAdmin, pickupBookingController);
router.patch('/:id/return', protectAdmin, returnBookingController);
router.patch('/:id/cancel', protectAdmin, cancelBookingController);

export default router;
