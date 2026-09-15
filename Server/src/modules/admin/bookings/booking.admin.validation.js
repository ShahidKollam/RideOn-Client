import { z } from 'zod'

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED', 'NO_SHOW'])
    .optional(),
  paymentStatus: z
    .enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .optional(),
  campusId: z.string().optional(),
  userId: z.string().optional(),
  bikeId: z.string().optional(),
  search: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const adminCreateBookingSchema = z.object({
  userId: z.string().min(1),
  campusId: z.string().min(1),
  pricingId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  bikeId: z.string().optional(),
  helmetCount: z.number().int().min(0).max(2).optional(),
  notes: z.string().optional(),
})

export const pickupSchema = z.object({
  pickupOdometer: z.number().int().min(0),
})

export const returnSchema = z.object({
  returnOdometer: z.number().int().min(0),
})

export const collectPaymentSchema = z.object({
  paymentMethod: z.enum(['UPI', 'CASH']),
  reference: z.string().trim().max(120).optional(),
})
