import { z } from 'zod';

export const uploadLicenseSchema = z.object({
  licenseNumber: z.string(),
  fullName: z.string(),
  dateOfBirth: z.string().datetime(),
  expiryDate: z.string().datetime(),
  issuingDate: z.string().datetime(),
  // documentUrl would come from upload, but for API assume provided
  documentUrl: z.string().optional(),
});
