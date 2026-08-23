import { z } from 'zod'

export const createPricingSchema = z.object({
  campusId: z.string().min(1),
  packageName: z.string().min(1),
  durationHours: z.number().int().min(1),
  price: z.number().min(0),
  includedKm: z.number().int().min(0),
  extraKmRate: z.number().min(0),
  depositAmount: z.number().min(0),
  displayOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const updatePricingSchema = z.object({
  campusId: z.string().min(1).optional(),
  packageName: z.string().min(1).optional(),
  durationHours: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  includedKm: z.number().int().min(0).optional(),
  extraKmRate: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
  displayOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const pricingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  campusId: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})
