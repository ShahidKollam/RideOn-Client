import { z } from 'zod'

export const createBikeSchema = z.object({
  campusId: z.string().min(1),
  registrationNumber: z.string().min(1),
  bikeNumber: z.string().min(1).max(32).optional(),
  name: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().optional(),
  color: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  currentOdometer: z.number().int().min(0).optional(),
})

export const updateBikeSchema = z.object({
  campusId: z.string().min(1).optional(),
  registrationNumber: z.string().min(1).optional(),
  bikeNumber: z.string().min(1).max(32).nullable().optional(),
  name: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().optional().nullable(),
  color: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
  currentOdometer: z.number().int().min(0).optional(),
})

export const changeBikeStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISABLED', 'RETIRED']),
})

export const bikeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  campusId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISABLED', 'RETIRED']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  search: z.string().optional(),
})
