import { createBooking, cancelBooking, pickupBooking, returnBooking, getBooking, getBookings } from './booking.service.js';
import { checkAvailability } from './availability.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const createBookingController = asyncHandler(async (req, res) => {
  const booking = await createBooking(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, 'Booking created successfully', booking));
});

export const adminCreateBookingController = asyncHandler(async (req, res) => {
  const booking = await createBooking(req.body);
  res.status(201).json(new ApiResponse(201, 'Booking created by admin successfully', booking));
});

export const checkAvailabilityController = asyncHandler(async (req, res) => {
  const summary = await checkAvailability(req.body);
  res.status(200).json(new ApiResponse(200, 'Availability checked successfully', summary));
});

export const getBookingsController = asyncHandler(async (req, res) => {
  const result = await getBookings(req.query, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Bookings retrieved successfully'));
});

export const getBookingController = asyncHandler(async (req, res) => {
  const booking = await getBooking(req.params.id, req.user ? req.user.id : null);
  res.status(200).json(new ApiResponse(200, booking, 'Booking retrieved successfully'));
});

export const cancelBookingController = asyncHandler(async (req, res) => {
  const result = await cancelBooking(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Booking cancelled successfully'));
});

export const pickupBookingController = asyncHandler(async (req, res) => {
  const { pickupOdometer } = req.body;
  const booking = await pickupBooking(req.params.id, pickupOdometer);
  res.status(200).json(new ApiResponse(200, booking, 'Booking picked up successfully'));
});

export const returnBookingController = asyncHandler(async (req, res) => {
  const { returnOdometer } = req.body;
  const booking = await returnBooking(req.params.id, returnOdometer);
  res.status(200).json(new ApiResponse(200, booking, 'Booking returned successfully'));
});
