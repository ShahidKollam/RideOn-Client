import { z } from 'zod'

export const updatePolicySchema = z.object({
  gstEnabled: z.boolean().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  platformFeeEnabled: z.boolean().optional(),
  platformFee: z.number().min(0).optional(),
  helmetFirstPrice: z.number().min(0).optional(),
  helmetSecondPrice: z.number().min(0).optional(),
  lateHelmetFee: z.number().min(0).optional(),
})
