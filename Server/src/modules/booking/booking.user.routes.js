import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createBookingController,
  checkAvailabilityController,
  getBookingsController,
  getBookingController,
  cancelBookingController,
} from './booking.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { checkAvailabilitySchema, createBookingSchema } from './booking.validation.js';

const router = express.Router();

router.post('/check-availability', protect, validate(checkAvailabilitySchema), checkAvailabilityController);
router.post('/', protect, validate(createBookingSchema), createBookingController);
router.get('/', protect, getBookingsController);
router.get('/:id', protect, getBookingController);
router.patch('/:id/cancel', protect, cancelBookingController);

export default router;
