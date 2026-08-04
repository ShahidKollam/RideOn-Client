import { z } from 'zod'

export const createOrderSchema = z.object({
    campusId: z.string().min(1, 'Campus ID is required'),
    pickupAt: z.string().datetime({ message: 'pickupAt must be a valid ISO datetime' }),
    returnAt: z.string().datetime({ message: 'returnAt must be a valid ISO datetime' }),
    notes: z.string().max(500).optional(),
})

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
    razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
    razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
})

export const paymentQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 10)),
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
})
