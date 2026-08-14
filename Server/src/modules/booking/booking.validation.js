import { z } from 'zod'

const helmetCountSchema = z
    .number()
    .int()
    .min(0, 'helmetCount must be 0, 1 or 2')
    .max(2, 'Maximum 2 helmets allowed')
    .optional()
    .default(0)

export const createBookingSchema = z.object({
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
    notes: z.string().optional(),
    helmetCount: helmetCountSchema,
})

export const adminCreateBookingSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
    notes: z.string().optional(),
    helmetCount: helmetCountSchema,
})

export const checkAvailabilitySchema = z.object({
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime(),
    returnAt: z.string().datetime(),
    helmetCount: helmetCountSchema,
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
