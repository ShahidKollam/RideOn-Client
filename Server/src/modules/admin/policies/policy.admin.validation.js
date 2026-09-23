import { z } from 'zod'

const cancellationRuleSchema = z.object({
  hours: z.number().min(0, 'Rule hours must be >= 0'),
  percent: z
    .number()
    .min(0, 'Rule percent must be >= 0')
    .max(100, 'Rule percent must be <= 100'),
})

const cancellationPolicySchema = z.object({
  enabled: z.boolean(),
  rules: z
    .array(cancellationRuleSchema)
    .min(1, 'At least one cancellation rule is required'),
})

export const updatePolicySchema = z.object({
  gstEnabled: z.boolean().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  platformFeeEnabled: z.boolean().optional(),
  platformFee: z.number().min(0).optional(),
  helmetFirstPrice: z.number().min(0).optional(),
  helmetSecondPrice: z.number().min(0).optional(),
  lateHelmetFee: z.number().min(0).optional(),
  bookingBufferMinutes: z
    .number()
    .int()
    .min(0)
    .max(180)
    .optional(),
  disruptionPenalty: z.number().min(0).optional(),
  cancellationPolicy: cancellationPolicySchema.optional(),
})