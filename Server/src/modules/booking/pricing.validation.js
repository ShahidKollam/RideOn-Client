import { z } from 'zod';

export const createPricingSchema = z.object({
  campusId: z.string().min(1),
  packageName: z.string().min(1).trim(),
  durationHours: z.number().int().min(1),
  price: z.number().positive(),
  includedKm: z.number().int().nonnegative(),
  extraKmRate: z.number().nonnegative(),
  depositAmount: z.number().nonnegative(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updatePricingSchema = z.object({
  packageName: z.string().min(1).trim().optional(),
  durationHours: z.number().int().min(1).optional(),
  price: z.number().positive().optional(),
  includedKm: z.number().int().nonnegative().optional(),
  extraKmRate: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const pricingQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  campusId: z.string().optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});
