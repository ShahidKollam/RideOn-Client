import { z } from 'zod'

/** Normalize DL input: trim, uppercase; keep only letters/digits for shape checks. */
export const normalizeDrivingLicense = (raw) => {
    const trimmed = String(raw || '').trim().toUpperCase()
    const compact = trimmed.replace(/[\s-]+/g, '')
    return { display: trimmed, compact }
}

/**
 * Soft Indian DL validation for MVP.
 * - Accepts common modern formats (state + RTO + series).
 * - Accepts older alphanumeric numbers of reasonable length.
 * - Does not claim authenticity or two-wheeler entitlement.
 */
export const isPlausibleIndianDl = (raw) => {
    const { compact } = normalizeDrivingLicense(raw)
    if (!compact) return { ok: false, message: 'Driving licence number is required.' }
    if (!/^[A-Z0-9]+$/.test(compact)) {
        return {
            ok: false,
            message: 'Use only letters and numbers (spaces and hyphens are fine).',
        }
    }
    if (compact.length < 8 || compact.length > 20) {
        return {
            ok: false,
            message: 'This does not look like a valid Indian driving licence number. Please check and try again.',
        }
    }
    // Common modern-style: 2 letter state code + digits/letters (e.g. KL0720120001234)
    const modern = /^[A-Z]{2}[0-9]{2}[0-9A-Z]{4,16}$/.test(compact)
    if (modern || (compact.length >= 10 && /[A-Z]/.test(compact) && /\d/.test(compact))) {
        return { ok: true }
    }
    // Older numeric-heavy or mixed formats — accept if length is sensible
    if (compact.length >= 10) return { ok: true }
    return {
        ok: false,
        message: 'This does not look like a common Indian driving licence format. Please double-check the number.',
    }
}

const drivingLicenseField = z
    .string()
    .min(1, 'Driving licence number is required.')
    .transform((v) => normalizeDrivingLicense(v).display)
    .superRefine((val, ctx) => {
        const check = isPlausibleIndianDl(val)
        if (!check.ok) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message })
        }
    })

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    // Optional for general customers
    studentId: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((v) => (v && String(v).trim() ? String(v).trim() : null)),
    email: z.string().email('Enter a valid email address').toLowerCase(),
    campusId: z.string().min(1, 'Campus is required'),
})

export const magicLinkSchema = z.object({
    email: z.string().email().toLowerCase(),
})

export const verifyMagicLinkSchema = z.object({
    token: z.string().min(1),
})

export const completeProfileSchema = z.object({
    phone: z.string().min(10, 'Phone number is required'),
    // Optional student-oriented fields
    hostel: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v && String(v).trim() ? String(v).trim() : null)),
    department: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v && String(v).trim() ? String(v).trim() : null)),
    yearOfStudy: z
        .union([z.number().int().min(1).max(5), z.null(), z.undefined()])
        .optional()
        .nullable()
        .transform((v) => (v === undefined || v === null || Number.isNaN(v) ? null : v)),
    studentId: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v && String(v).trim() ? String(v).trim() : null)),
    drivingLicenseNumber: drivingLicenseField,
    acceptedTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms to continue.' }),
    }),
})

export const refreshTokenSchema = z.object({}) // Not used in body

export const adminLoginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(6),
})
