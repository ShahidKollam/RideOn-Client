import { z } from 'zod';

export const createBikeSchema = z.object({
  campusId: z.string().min(1, 'Campus ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required').trim(),
  name: z.string().min(1, 'Name is required').trim(),
  brand: z.string().min(1, 'Brand is required').trim(),
  model: z.string().min(1, 'Model is required').trim(),
  year: z.number().int().positive().optional(),
  color: z.string().trim().optional(),
  imageUrls: z.array(z.string().url()).optional().default([]),
  currentOdometer: z.number().int().nonnegative().optional().default(0),
});

export const updateBikeSchema = z.object({
  name: z.string().min(1).trim().optional(),
  brand: z.string().min(1).trim().optional(),
  model: z.string().min(1).trim().optional(),
  year: z.number().int().positive().optional(),
  color: z.string().trim().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  currentOdometer: z.number().int().nonnegative().optional(),
});

export const changeBikeStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DISABLED', 'RETIRED']),
});

export const bikeQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  campusId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'DISABLED', 'RETIRED']).optional(),
  isActive: z.string().optional().transform(val => val === 'true'),
});
