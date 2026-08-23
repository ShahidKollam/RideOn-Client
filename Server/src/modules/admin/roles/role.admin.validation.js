import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  permissionNames: z.array(z.string()).optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissionNames: z.array(z.string()).optional(),
})
