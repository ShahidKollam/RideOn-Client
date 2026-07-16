import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  createBookingController,
  getBookingsController,
  getBookingController,
  cancelBookingController,
} from './booking.controller.js';

const router = express.Router();

router.post('/', protect, createBookingController);
router.get('/', protect, getBookingsController);
router.get('/:id', protect, getBookingController);
router.patch('/:id/cancel', protect, cancelBookingController);

export default router;
