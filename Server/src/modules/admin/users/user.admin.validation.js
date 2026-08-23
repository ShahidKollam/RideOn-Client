import { z } from 'zod'

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  campusId: z.string().optional(),
  isVerified: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  onboardingStatus: z
    .enum(['SIGNED_UP', 'EMAIL_VERIFIED', 'PROFILE_COMPLETED'])
    .optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  hostel: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
})

export const updateUserStatusSchema = z.object({
  isVerified: z.boolean().optional(),
  onboardingStatus: z
    .enum(['SIGNED_UP', 'EMAIL_VERIFIED', 'PROFILE_COMPLETED'])
    .optional(),
})
