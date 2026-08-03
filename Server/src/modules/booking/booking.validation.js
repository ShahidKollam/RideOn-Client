import { z } from 'zod'

export const createBookingSchema = z.object({
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
    notes: z.string().optional(),
})

export const adminCreateBookingSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
    notes: z.string().optional(),
})

export const checkAvailabilitySchema = z.object({
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
})

export const cancelBookingSchema = z.object({
    reason: z.string().optional(),
})

export const bookingQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 1)),
    limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 10)),
    search: z.string().optional(),
    status: z.enum(['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED', 'NO_SHOW']).optional(),
    userId: z.string().optional(),
    campusId: z.string().optional(),
})
