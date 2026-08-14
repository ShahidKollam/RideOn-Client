import { z } from 'zod';

export const updateSettingsSchema = z.object({
  gstEnabled: z.boolean().optional(),
  gstRate: z.number().min(0, 'GST rate must be greater than or equal to 0').optional(),
  platformFeeEnabled: z.boolean().optional(),
  platformFee: z.number().min(0, 'Platform fee must be greater than or equal to 0').optional(),
  helmetFirstPrice: z.number().min(0, 'Helmet first price must be >= 0').optional(),
  helmetSecondPrice: z.number().min(0, 'Helmet second price must be >= 0').optional(),
  lateHelmetFee: z.number().min(0, 'Late helmet fee must be >= 0').optional(),
});
