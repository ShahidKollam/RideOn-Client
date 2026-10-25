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
  lateOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})

/** Legacy admin create: attach to an existing customer userId */
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

/**
 * Desk / walk-in create: no customer User.
 * Uses shared walk-in userId internally; stores guest on booking.
 */
export const adminDeskCreateBookingSchema = z.object({
  campusId: z.string().min(1),
  pricingId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  bikeId: z.string().min(1, 'Select a bike'),
  guestName: z.string().trim().min(1, 'Guest name is required').max(120),
  guestEmail: z.string().trim().email('Valid guest email is required').max(200),
  guestPhone: z.string().trim().max(30).optional().nullable(),
  helmetCount: z.number().int().min(0).max(2).optional().default(0),
  notes: z.string().trim().max(1000).optional().nullable(),
})

export const adminCheckAvailabilitySchema = z.object({
  campusId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
  helmetCount: z.number().int().min(0).max(2).optional().default(0),
})

export const adminAvailableBikesSchema = z.object({
  campusId: z.string().min(1),
  pickupAt: z.string().datetime(),
  returnAt: z.string().datetime(),
})

export const pickupSchema = z.object({
  pickupOdometer: z.number().int().min(0),
})

export const returnSchema = z.object({
  returnOdometer: z.number().int().min(0),
  /** Admin decides whether calculated late rental/package charge is applied */
  applyLateFee: z.boolean().optional().default(false),
  /** Admin decides whether configured disruption penalty is applied */
  applyDisruptionPenalty: z.boolean().optional().default(false),
})

export const collectPaymentSchema = z.object({
  paymentMethod: z.enum(['UPI', 'CASH']),
  reference: z.string().trim().max(120).optional(),
})

export const adminCancelBookingSchema = z.object({
  applyCancellationFee: z.boolean().optional().default(true),
  /** Optional admin override of refund amount (audit stored) */
  adjustedRefundAmount: z.number().min(0).optional().nullable(),
  adjustmentReason: z.string().trim().max(500).optional().nullable(),
})

export const recordCashRefundSchema = z.object({
  reference: z.string().trim().max(120).optional(),
})
