import { z } from 'zod'

export const adminLoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
})
