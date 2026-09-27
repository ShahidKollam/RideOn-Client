import { z } from 'zod';

const cancellationRuleSchema = z.object({
  hours: z.number().min(0, 'Rule hours must be >= 0'),
  percent: z.number().min(0, 'Rule percent must be >= 0').max(100, 'Rule percent must be <= 100'),
});

const cancellationPolicySchema = z.object({
  enabled: z.boolean(),
  rules: z.array(cancellationRuleSchema).min(1, 'At least one cancellation rule is required'),
});

export const updateSettingsSchema = z.object({
  gstEnabled: z.boolean().optional(),
  gstRate: z.number().min(0, 'GST rate must be greater than or equal to 0').optional(),
  platformFeeEnabled: z.boolean().optional(),
  platformFee: z.number().min(0, 'Platform fee must be greater than or equal to 0').optional(),
  helmetFirstPrice: z.number().min(0, 'Helmet first price must be >= 0').optional(),
  helmetSecondPrice: z.number().min(0, 'Helmet second price must be >= 0').optional(),
  lateHelmetFee: z.number().min(0, 'Late helmet fee must be >= 0').optional(),
  bookingBufferMinutes: z
    .number()
    .int('Booking buffer must be an integer')
    .min(0, 'Booking buffer must be >= 0')
    .max(180, 'Booking buffer must be <= 180 minutes')
    .optional(),
  disruptionPenalty: z
    .number()
    .min(0, 'Disruption penalty must be >= 0')
    .optional(),
  cancellationPolicy: cancellationPolicySchema.optional(),
});
