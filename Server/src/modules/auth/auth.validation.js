import { z } from 'zod'

export const signupSchema = z.object({
    name: z.string().min(2),
    studentId: z.string().min(1),
    email: z.string().email().toLowerCase(),
    campusId: z.string(),
})

export const magicLinkSchema = z.object({
    email: z.string().email().toLowerCase(),
})

export const verifyMagicLinkSchema = z.object({
    token: z.string().min(1),
})

export const completeProfileSchema = z.object({
    phone: z.string().min(10),
    hostel: z.string().min(1),
    department: z.string().min(1),
    yearOfStudy: z.number().int().min(1).max(5),
    drivingLicenseNumber: z.string().min(1),
    acceptedTerms: z.literal(true),
})

export const refreshTokenSchema = z.object({}) // Not used in body

export const adminLoginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(6),
})
