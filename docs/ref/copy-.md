import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  createBikeController,
  getBikeListController,
  getBikeByIdController,
  updateBikeController,
  changeBikeStatusController,
  deleteBikeController,
} from './bike.controller.js';

const router = express.Router();

// Admin routes
router.post('/', protectAdmin, createBikeController);
router.get('/', protectAdmin, getBikeListController);
router.get('/:id', protectAdmin, getBikeByIdController);
router.patch('/:id', protectAdmin, updateBikeController);
router.patch('/:id/status', protectAdmin, changeBikeStatusController);
router.delete('/:id', protectAdmin, deleteBikeController);

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController); // Adjust for public
router.get('/public/:id', getBikeByIdController);

export default router;
import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  createBikeController,
  getBikeListController,
  getBikeByIdController,
  updateBikeController,
  changeBikeStatusController,
  deleteBikeController,
} from './bike.controller.js';

const router = express.Router();

// Admin routes
router.post('/', protectAdmin, createBikeController);
router.get('/', protectAdmin, getBikeListController);
router.get('/:id', protectAdmin, getBikeByIdController);
router.patch('/:id', protectAdmin, updateBikeController);
router.patch('/:id/status', protectAdmin, changeBikeStatusController);
router.delete('/:id', protectAdmin, deleteBikeController);

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController); // Adjust for public
router.get('/public/:id', getBikeByIdController);

export default router;
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

export const BOOKING_BUFFER_MINUTES = 15
const blockingBookingStatuses = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE']

export const checkBikeAvailability = async (bikeId, pickupAt, returnAt, client = prisma) => {
    const bike = await client.bike.findUnique({ where: { id: bikeId } })
    if (!bike || !bike.isActive || bike.status !== 'AVAILABLE') {
        return { available: false, reason: 'Bike is not available' }
    }

    const bufferStart = new Date(pickupAt.getTime() - BOOKING_BUFFER_MINUTES * 60 * 1000)
    const bufferedReturnAt = new Date(returnAt.getTime() + BOOKING_BUFFER_MINUTES * 60 * 1000)
    const conflict = await client.booking.findFirst({
        where: {
            bikeId,
            status: { in: blockingBookingStatuses },
            pickupAt: { lt: bufferedReturnAt },
            returnAt: { gt: bufferStart },
        },
        orderBy: { pickupAt: 'asc' },
    })

    return conflict
        ? { available: false, reason: '15-minute buffer required between bookings' }
        : { available: true }
}

export const findNextAvailableBike = async (bikeId, pickupAt, returnAt, client = prisma) => {
    const durationMs = returnAt.getTime() - pickupAt.getTime()
    const bookings = await client.booking.findMany({
        where: { bikeId, status: { in: blockingBookingStatuses } },
        select: { pickupAt: true, returnAt: true },
        orderBy: { pickupAt: 'asc' },
    })

    let availableFrom = new Date(pickupAt)
    for (const booking of bookings) {
        const bufferedReturnAt = new Date(booking.returnAt.getTime() + BOOKING_BUFFER_MINUTES * 60 * 1000)
        if (availableFrom.getTime() + durationMs <= booking.pickupAt.getTime() - BOOKING_BUFFER_MINUTES * 60 * 1000) break
        if (availableFrom < bufferedReturnAt) availableFrom = bufferedReturnAt
    }

    return { availableFrom }
}


export const createBike = async (data) => {
    // Verify campus exists and is active
    const campus = await prisma.campus.findUnique({
        where: {
            id: data.campusId,
        },
    })

    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    // Check if registration number already exists
    const existingBike = await prisma.bike.findUnique({
        where: {
            registrationNumber: data.registrationNumber,
        },
    })

    if (existingBike) {
        throw new ApiError(409, 'Bike with this registration number already exists')
    }

    // Create bike
    const bike = await prisma.bike.create({
        data: {
            campusId: data.campusId,
            registrationNumber: data.registrationNumber,
            name: data.name,
            brand: data.brand,
            model: data.model,
            year: data.year,
            color: data.color,
            imageUrls: data.imageUrls ?? [],
            currentOdometer: data.currentOdometer ?? 0,
        },
        include: {
            campus: true,
        },
    })

    return bike
}

export const updateBike = async (id, data) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }

    const updatedBike = await prisma.bike.update({
        where: { id },
        data,
        include: {
            campus: true,
        },
    })

    return updatedBike
}

export const getBikeById = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id, isActive: true },
        include: {
            campus: true,
        },
    })
    if (!bike) {
        throw new ApiError(404, 'Bike not found')
    }
    return bike
}

export const getBikeList = async (query = {}) => {
    const { page = 1, limit = 10, search, campusId, status, isActive } = query

    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }

    if (campusId) where.campusId = campusId
    if (status) where.status = status

    if (search) {
        where.OR = [
            { registrationNumber: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
        ]
    }

    const [bikes, total] = await Promise.all([
        prisma.bike.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                campus: true,
            },
        }),
        prisma.bike.count({ where }),
    ])

    return {
        bikes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export const changeBikeStatus = async (id, status) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike || !bike.isActive) {
        throw new ApiError(404, 'Bike not found or inactive')
    }

    const updatedBike = await prisma.bike.update({
        where: { id },
        data: { status },
        include: {
            campus: true,
        },
    })

    return updatedBike
}

export const deleteBike = async (id) => {
    const bike = await prisma.bike.findUnique({
        where: { id },
    })
    if (!bike) {
        throw new ApiError(404, 'Bike not found')
    }

    // Soft delete
    await prisma.bike.update({
        where: { id },
        data: { isActive: false },
    })

    return { message: 'Bike soft deleted successfully' }
}
import { z } from 'zod';

export const createBikeSchema = z.object({
  campusId: z.string().min(1, 'Campus ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  brand: z.string().min(1, 'Brand is required').trim(),
  model: z.string().min(1, 'Model is required').trim(),
  year: z.number().int().positive().optional(),
  color: z.string().trim().optional(),
  imageUrls: z.array(z.string().url()).optional().default([]),
  currentOdometer: z.number().int().nonnegative().optional().default(0),
});

export const updateBikeSchema = z.object({
  name: z.string().min(1).trim().optional(),
  brand: z.string().min(1).trim().optional(),
  model: z.string().min(1).trim().optional(),
  year: z.number().int().positive().optional(),
  color: z.string().trim().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  currentOdometer: z.number().int().nonnegative().optional(),
});

export const changeBikeStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DISABLED', 'RETIRED']),
});

export const bikeQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  campusId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DISABLED', 'RETIRED']).optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});
import express from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import {
    createBikeController,
    getBikeListController,
    getBikeByIdController,
    updateBikeController,
    changeBikeStatusController,
    deleteBikeController,
} from './bike.controller.js'

const router = express.Router()

// Admin routes
// router.post('/', protect, createBikeController)
router.post('/', createBikeController)
router.get('/', protect, getBikeListController)
router.get('/:id', protect, getBikeByIdController)
router.patch('/:id', protect, updateBikeController)
router.patch('/:id/status', protect, changeBikeStatusController)
router.delete('/:id', protect, deleteBikeController)

// Public routes - can be mounted separately or with optional auth
router.get('/public', getBikeListController) // Adjust for public
router.get('/public/:id', getBikeByIdController)

export default router
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { checkBikeAvailability, findNextAvailableBike } from '../bike/bike.service.js'
import { calculatePrice, findPricingByDuration } from './pricing.service.js'

export const getBookingAvailability = async (data, client = prisma) => {
    const pickupAt = new Date(data.pickupAt)
    const returnAt = new Date(data.returnAt)
    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    const durationHours = Math.ceil((returnAt - pickupAt) / (1000 * 60 * 60))
    if (durationHours < 1) throw new ApiError(400, 'Minimum duration 1 hour')

    const [campus, bike] = await Promise.all([
        client.campus.findUnique({ where: { id: data.campusId } }),
        client.bike.findUnique({ where: { id: data.bikeId } }),
    ])
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid campus')
    if (!bike || bike.campusId !== data.campusId) throw new ApiError(400, 'Bike does not belong to the selected campus')

    const pricing = await findPricingByDuration(durationHours, data.campusId, client)
    const priceSnapshot = calculatePrice(pricing)
    const availability = await checkBikeAvailability(data.bikeId, pickupAt, returnAt, client)
    const nextAvailability = availability.available
        ? null
        : await findNextAvailableBike(data.bikeId, pickupAt, returnAt, client)

    return {
        available: availability.available,
        ...(availability.available ? {} : { reason: availability.reason, availableFrom: nextAvailability.availableFrom }),
        durationHours,
        pricing: { id: pricing.id, packageName: pricing.packageName },
        ...priceSnapshot,
        totalAmount: priceSnapshot.baseAmount + priceSnapshot.depositAmount,
    }
}

export const checkAvailability = async (data) => getBookingAvailability(data)
import { z } from 'zod';

export const createBookingSchema = z.object({
  bikeId: z.string().min(1),
  campusId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  notes: z.string().optional(),
});

export const adminCreateBookingSchema = z.object({
  userId: z.string().min(1),
  bikeId: z.string().min(1),
  campusId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  notes: z.string().optional(),
});

export const checkAvailabilitySchema = z.object({
  bikeId: z.string().min(1),
  campusId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

export const bookingQuerySchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.enum(['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED', 'NO_SHOW']).optional(),
  userId: z.string().optional(),
  campusId: z.string().optional(),
});
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
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { getBookingAvailability } from './availability.service.js'
import { checkBikeAvailability } from '../bike/bike.service.js'

const generateBookingNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000) // Simple unique, better use DB sequence or check
    return `BK${year}${random.toString().padStart(6, '0')}`
}

export const createBooking = async (data, userIdFromAuth = null) => {
    const userId = userIdFromAuth || data.userId
    if (!userId) throw new ApiError(400, 'User ID required')

    // Validate user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { drivingLicense: true },
    })
    if (!user) throw new ApiError(404, 'User not found')
    if (!user.isVerified) throw new ApiError(400, 'User email not verified')
    if (user.onboardingStatus !== 'PROFILE_COMPLETED') throw new ApiError(400, 'Complete your profile')
    if (user.drivingLicense?.status !== 'APPROVED') throw new ApiError(400, 'Driving license not approved')

    // Check no active booking
    const activeBooking = await prisma.booking.findFirst({
        where: {
            userId,
            status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
    })
    if (activeBooking) throw new ApiError(400, 'User has an active booking')

    const bookingNumber = generateBookingNumber()
    const booking = await prisma.$transaction(async (tx) => {
        // Re-check inside the create transaction so an earlier availability result
        // cannot bypass the required buffer.
        const summary = await getBookingAvailability(data, tx)
        if (!summary.available) throw new ApiError(409, summary.reason)

        return tx.booking.create({
            data: {
                bookingNumber,
                userId,
                bikeId: data.bikeId,
                campusId: data.campusId,
                pricingId: summary.pricing.id,
                pickupAt: new Date(data.pickupAt),
                returnAt: new Date(data.returnAt),
                durationHours: summary.durationHours,
                status: 'PAYMENT_PENDING',
                paymentStatus: 'PENDING',
                baseAmount: summary.baseAmount,
                depositAmount: summary.depositAmount,
                totalAmount: summary.totalAmount,
                includedKm: summary.includedKm,
                extraKmRate: summary.extraKmRate,
                notes: data.notes,
            },
            include: { user: true, campus: true, pricing: true, bike: true },
        })
    }, { isolationLevel: 'Serializable' })

    return booking
}

export const findAvailableBike = async (pickupAt, returnAt, campusId) => {
    const bikes = await prisma.bike.findMany({
        where: {
            campusId,
            status: 'AVAILABLE',
            isActive: true,
        },
        orderBy: { currentOdometer: 'asc' },
    })

    for (const bike of bikes) {
        const availability = await checkBikeAvailability(bike.id, new Date(pickupAt), new Date(returnAt))
        if (availability.available) return bike
    }

    throw new ApiError(400, 'No available bikes for the selected time')
}

export const assignBike = async (bookingId, bikeId) => {
    return await prisma.booking.update({
        where: { id: bookingId },
        data: { bikeId },
    })
}

export const cancelBooking = async (bookingId, userId) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.userId !== userId) throw new ApiError(403, 'Not authorized')

    if (!['PAYMENT_PENDING', 'CONFIRMED'].includes(booking.status)) {
        throw new ApiError(400, 'Cannot cancel booking in current status')
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
    })

    return updated
}

export const pickupBooking = async (bookingId, pickupOdometer, adminId = null) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { bike: true },
    })
    if (!booking || booking.status !== 'CONFIRMED') {
        throw new ApiError(400, 'Booking must be CONFIRMED for pickup')
    }

    // For admin or validate window
    const now = new Date()
    if (now < booking.pickupAt || now > booking.returnAt) {
        // Allow some window, simplified
    }

    let bike = null
    if (!booking.bikeId) {
        bike = await findAvailableBike(booking.pickupAt, booking.returnAt, booking.campusId)
    } else {
        bike = await prisma.bike.findUnique({ where: { id: booking.bikeId } })
    }

    if (!bike || bike.status !== 'AVAILABLE') throw new ApiError(400, 'Bike not available')

    return await prisma.$transaction(async (tx) => {
        await tx.bike.update({
            where: { id: bike.id },
            data: { status: 'MAINTENANCE' }, // or occupied logic, but per spec
        })

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: {
                bikeId: bike.id,
                pickupOdometer,
                pickedUpAt: new Date(),
                status: 'ACTIVE',
            },
        })

        return updatedBooking
    })
}

export const returnBooking = async (bookingId, returnOdometer) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { bike: true },
    })
    if (!booking || booking.status !== 'ACTIVE') {
        throw new ApiError(400, 'Booking must be ACTIVE for return')
    }

    const actualKm = returnOdometer - booking.pickupOdometer
    const extraKm = Math.max(0, actualKm - booking.includedKm)
    const extraKmCharge = extraKm * booking.extraKmRate
    // Late fee logic simplified
    const lateFee = 0 // Implement based on time

    const finalTotal = booking.totalAmount + extraKmCharge + lateFee

    return await prisma.$transaction(async (tx) => {
        await tx.bike.update({
            where: { id: booking.bikeId },
            data: {
                currentOdometer: returnOdometer,
                status: 'AVAILABLE',
            },
        })

        const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
                returnOdometer,
                returnedAt: new Date(),
                actualKm,
                extraKm,
                extraKmCharge,
                lateFee,
                totalAmount: finalTotal,
                status: 'COMPLETED',
            },
        })

        return updated
    })
}

export const getBooking = async (id, userId = null) => {
    const where = { id }
    if (userId) where.userId = userId

    const booking = await prisma.booking.findUnique({
        where,
        include: {
            user: true,
            bike: true,
            campus: true,
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    return booking
}

export const getBookings = async (query = {}, userId = null) => {
    const { page = 1, limit = 10, search, status, campusId } = query

    const where = {}
    if (userId) where.userId = userId
    if (status) where.status = status
    if (campusId) where.campusId = campusId

    if (search) {
        where.OR = [
            { bookingNumber: { contains: search, mode: 'insensitive' } },
            // Add user name etc via include or separate query
        ]
    }

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                bike: { select: { registrationNumber: true, name: true } },
                campus: true,
            },
        }),
        prisma.booking.count({ where }),
    ])

    return {
        bookings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}
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
import { z } from 'zod';

export const createPricingSchema = z.object({
  campusId: z.string().min(1),
  packageName: z.string().min(1).trim(),
  durationHours: z.number().int().min(1),
  price: z.number().positive(),
  includedKm: z.number().int().nonnegative(),
  extraKmRate: z.number().nonnegative(),
  depositAmount: z.number().nonnegative(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updatePricingSchema = z.object({
  packageName: z.string().min(1).trim().optional(),
  durationHours: z.number().int().min(1).optional(),
  price: z.number().positive().optional(),
  includedKm: z.number().int().nonnegative().optional(),
  extraKmRate: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const pricingQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  campusId: z.string().optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

export const createPricing = async (data) => {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const pricing = await prisma.pricing.create({
        data,
        include: { campus: true },
    })

    return pricing
}

export const updatePricing = async (id, data) => {
    const pricing = await prisma.pricing.findUnique({ where: { id } })
    if (!pricing) {
        throw new ApiError(404, 'Pricing not found')
    }

    const updated = await prisma.pricing.update({
        where: { id },
        data,
        include: { campus: true },
    })

    return updated
}

export const getPricingById = async (id) => {
    const pricing = await prisma.pricing.findUnique({
        where: { id, isActive: true },
        include: { campus: true },
    })
    if (!pricing) throw new ApiError(404, 'Pricing not found')
    return pricing
}

export const getPricingList = async (query = {}) => {
    const { page = 1, limit = 10, campusId, isActive } = query

    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }
    if (campusId) where.campusId = campusId

    const [pricings, total] = await Promise.all([
        prisma.pricing.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { displayOrder: 'asc', createdAt: 'desc' },
            include: { campus: true },
        }),
        prisma.pricing.count({ where }),
    ])

    return {
        pricings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}

export const deletePricing = async (id) => {
    // Soft delete
    await prisma.pricing.update({
        where: { id },
        data: { isActive: false },
    })
    return { message: 'Pricing soft deleted' }
}

export const findPricingByDuration = async (durationHours, campusId, client = prisma) => {
    const pricing = await client.pricing.findFirst({
        where: {
            campusId,
            isActive: true,
            durationHours: { gte: durationHours },
        },
        orderBy: [{ durationHours: 'asc' }, { displayOrder: 'asc' }],
    })

    if (!pricing) throw new ApiError(400, 'No active pricing package matches the selected duration')
    return pricing
}

// Helper for booking. Pricing is selected by the server before this is called.
export const calculatePrice = (pricingData) => {
    const baseAmount = pricingData.price // Assume price is for the duration
    return {
        baseAmount,
        depositAmount: pricingData.depositAmount,
        includedKm: pricingData.includedKm,
        extraKmRate: pricingData.extraKmRate,
    }
}
import { createPricing, updatePricing, getPricingById, getPricingList, deletePricing } from './pricing.service.js';
import { createPricingSchema, updatePricingSchema, pricingQuerySchema } from './pricing.validation.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const createPricingController = asyncHandler(async (req, res) => {
  // Validation assumed
  const pricing = await createPricing(req.body);
  res.status(201).json(new ApiResponse(201, pricing, 'Pricing created successfully'));
});

export const getPricingListController = asyncHandler(async (req, res) => {
  const result = await getPricingList(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Pricings retrieved successfully'));
});

export const getPricingByIdController = asyncHandler(async (req, res) => {
  const pricing = await getPricingById(req.params.id);
  res.status(200).json(new ApiResponse(200, pricing, 'Pricing retrieved successfully'));
});

export const updatePricingController = asyncHandler(async (req, res) => {
  const pricing = await updatePricing(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, pricing, 'Pricing updated successfully'));
});

export const deletePricingController = asyncHandler(async (req, res) => {
  const result = await deletePricing(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Pricing deleted successfully'));
});
import express from 'express';
import { protectAdmin } from '../../middlewares/auth.middleware.js';
import {
  createPricingController,
  getPricingListController,
  getPricingByIdController,
  updatePricingController,
  deletePricingController,
} from './pricing.controller.js';

const router = express.Router();

router.post('/', protectAdmin, createPricingController);
router.get('/', protectAdmin, getPricingListController);
router.get('/:id', protectAdmin, getPricingByIdController);
router.patch('/:id', protectAdmin, updatePricingController);
router.delete('/:id', protectAdmin, deletePricingController);

export default router;
import express from 'express'

import authRoutes from '../modules/auth/auth.routes.js'
import userRoutes from '../modules/user/user.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import campusRoutes from '../modules/campus/campus.routes.js'
import drivingLicenseRoutes from '../modules/driving-license/driving-license.routes.js'

import bikeRoutes from '../modules/bike/bike.routes.js'
import bookingUserRoutes from '../modules/booking/booking.user.routes.js'
import bookingAdminRoutes from '../modules/booking/booking.admin.routes.js'
import pricingAdminRoutes from '../modules/booking/pricing.admin.routes.js'
import bikeAdminRoutes from '../modules/bike/bike.admin.routes.js'

const router = express.Router()

router.use('/auth', authRoutes)generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String           @id @default(cuid())
  email                String           @unique
  name                 String
  studentId            String?
  hostel               String?
  department           String?
  yearOfStudy          Int?
  drivingLicenseNumber String?          @unique
  phone                String?
  campusId             String
  campus               Campus           @relation(fields: [campusId], references: [id])
  drivingLicense       DrivingLicense?
  isVerified           Boolean          @default(false)
  acceptedTerms        Boolean          @default(false)
  acceptedTermsAt      DateTime?
  onboardingStatus     OnboardingStatus @default(SIGNED_UP)
  refreshTokens        RefreshToken[]
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  magicLinkTokens      MagicLinkToken[]
  bookings             Booking[] // New relation

  @@map("users")
}

enum OnboardingStatus {
  SIGNED_UP
  EMAIL_VERIFIED
  PROFILE_COMPLETED
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

model Campus {
  id        String    @id @default(cuid())
  name      String
  location  String
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  users     User[]
  bikes     Bike[] // New
  pricings  Pricing[] // New
  bookings  Booking[] // New

  @@map("campuses")
}

model DrivingLicense {
  id            String        @id @default(cuid())
  userId        String        @unique
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  licenseNumber String        @unique
  fullName      String
  dateOfBirth   DateTime
  expiryDate    DateTime
  issuingDate   DateTime
  status        LicenseStatus @default(PENDING)
  documentUrl   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("driving_licenses")
}

enum LicenseStatus {
  PENDING
  APPROVED
  REJECTED
}

model MagicLinkToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@map("magic_link_tokens")
}

// ==================== NEW MODELS ====================

model Bike {
  id                 String     @id @default(cuid())
  campusId           String
  registrationNumber String     @unique
  name               String
  brand              String
  model              String
  year               Int?
  color              String?
  imageUrls          String[]
  currentOdometer    Int        @default(0)
  status             BikeStatus @default(AVAILABLE)
  isActive           Boolean    @default(true)
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  campus   Campus    @relation(fields: [campusId], references: [id])
  bookings Booking[]

  @@index([campusId])
  @@index([status])
  @@index([isActive])
  @@map("bikes")
}

enum BikeStatus {
  AVAILABLE
  MAINTENANCE
  DISABLED
  RETIRED
}

model Pricing {
  id            String   @id @default(cuid())
  campusId      String
  packageName   String
  durationHours Int
  price         Float
  includedKm    Int
  extraKmRate   Float
  depositAmount Float
  displayOrder  Int      @default(0)
  isFeatured    Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  campus Campus @relation(fields: [campusId], references: [id])
  bookings Booking[]

  @@index([campusId])
  @@index([displayOrder])
  @@index([isActive])
  @@map("pricings")
}

model Booking {
  id             String        @id @default(cuid())
  bookingNumber  String        @unique
  userId         String
  bikeId         String?
  campusId       String
  pricingId      String
  pickupAt       DateTime
  returnAt       DateTime
  durationHours  Int
  status         BookingStatus @default(PAYMENT_PENDING)
  paymentStatus  PaymentStatus @default(PENDING)
  baseAmount     Float
  depositAmount  Float
  discountAmount Float         @default(0)
  totalAmount    Float
  includedKm     Int
  extraKmRate    Float
  pickupOdometer Int?
  returnOdometer Int?
  actualKm       Int?
  extraKm        Int?
  extraKmCharge  Float?
  lateFee        Float?
  pickedUpAt     DateTime?
  returnedAt     DateTime?
  notes          String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  bike   Bike?  @relation(fields: [bikeId], references: [id])
  campus Campus @relation(fields: [campusId], references: [id])
  pricing Pricing @relation(fields: [pricingId], references: [id])

  @@index([bookingNumber])
  @@index([userId])
  @@index([bikeId])
  @@index([campusId])
  @@index([pricingId])
  @@index([status])
  @@index([pickupAt])
  @@index([returnAt])
  @@map("bookings")
}

enum BookingStatus {
  PAYMENT_PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
  FAILED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/campus', campusRoutes)
router.use('/driving-licenses', drivingLicenseRoutes)

// Mount routes (adjust prefixes to match existing style, e.g., /api/...)
router.use('/bikes', bikeRoutes) // Admin part
router.use('/admin/bikes', bikeAdminRoutes) // Admin part
// Public bikes can be exposed separately
router.use('/bookings', bookingUserRoutes)
router.use('/admin/bookings', bookingAdminRoutes)
router.use('/admin/pricing', pricingAdminRoutes)

export default router
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

export const createPricing = async (data) => {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const pricing = await prisma.pricing.create({
        data: {
            campusId: data.campusId,
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return pricing
}

export const updatePricing = async (id, data) => {
    const pricing = await prisma.pricing.findUnique({ where: { id } })
    if (!pricing) {
        throw new ApiError(404, 'Pricing not found')
    }

    const updated = await prisma.pricing.update({
        where: { id },
        data: {
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return updated
}

export const getPricingById = async (id) => {
    const pricing = await prisma.pricing.findUnique({
        where: { id, isActive: true },
        include: { campus: true },
    })
    if (!pricing) throw new ApiError(404, 'Pricing not found')
    return pricing
}

export const getPricingList = async (query = {}) => {
    const { page = 1, limit = 10, campusId, isActive } = query

    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }
    if (campusId) where.campusId = campusId

    const [pricings, total] = await Promise.all([
        prisma.pricing.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { displayOrder: 'asc', createdAt: 'desc' },
            include: { campus: true },
        }),
        prisma.pricing.count({ where }),
    ])

    return {
        pricings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}

export const deletePricing = async (id) => {
    // Soft delete
    await prisma.pricing.update({
        where: { id },
        data: { isActive: false },
    })
    return { message: 'Pricing soft deleted' }
}

export const findPricingByDuration = async (durationHours, campusId, client = prisma) => {
    const pricing = await client.pricing.findFirst({
        where: {
            campusId,
            isActive: true,
            durationHours: { gte: durationHours },
        },
        orderBy: [{ durationHours: 'asc' }, { displayOrder: 'asc' }],
    })

    if (!pricing) throw new ApiError(400, 'No active pricing package matches the selected duration')
    return pricing
}

// Helper for booking. Pricing is selected by the server before this is called.
export const calculatePrice = (pricingData) => {
    const baseAmount = pricingData.price // Assume price is for the duration
    return {
        baseAmount,
        depositAmount: pricingData.depositAmount,
        includedKm: pricingData.includedKm,
        extraKmRate: pricingData.extraKmRate,
    }
}
