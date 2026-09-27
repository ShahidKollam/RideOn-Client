import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import {
    DEFAULT_CANCELLATION_POLICY,
    normalizeCancellationPolicy,
} from '../booking/cancellation.service.js'

const DEFAULT_SETTINGS = {
    gstEnabled: true,
    gstRate: 18,
    platformFeeEnabled: true,
    platformFee: 20,
    helmetFirstPrice: 0,
    helmetSecondPrice: 0,
    lateHelmetFee: 0,
    bookingBufferMinutes: 15,
    disruptionPenalty: 150,
    cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
}

/**
 * Ensure a single SystemSetting record always exists.
 * Creates one with defaults if none is found.
 */
const getOrCreateSettings = async () => {
    let settings = await prisma.systemSetting.findFirst()

    if (!settings) {
        settings = await prisma.systemSetting.create({
            data: DEFAULT_SETTINGS,
        })
    }

    return settings
}

/**
 * Compute helmet add-on amount from admin prices and selected count (0–2)
 * for every started 24-hour booking period.
 */
export const calculateHelmetAmount = (settings, helmetCount = 0, durationHours = 0) => {
    const count = Math.min(2, Math.max(0, Number(helmetCount) || 0))
    if (count <= 0) return { helmetCount: 0, helmetAmount: 0 }

    const first = Number(settings.helmetFirstPrice) || 0
    const second = Number(settings.helmetSecondPrice) || 0
    const periods = Math.ceil((Number(durationHours) || 0) / 24)

    const helmetAmount =
        count === 1
            ? Number((first * periods).toFixed(2))
            : Number(((first + second) * periods).toFixed(2))

    return { helmetCount: count, helmetAmount }
}

const toPublicSettings = (settings) => ({
    gstEnabled: settings.gstEnabled,
    gstRate: settings.gstRate,
    platformFeeEnabled: settings.platformFeeEnabled,
    platformFee: settings.platformFee,
    helmetFirstPrice: settings.helmetFirstPrice,
    helmetSecondPrice: settings.helmetSecondPrice,
    lateHelmetFee: settings.lateHelmetFee,
    bookingBufferMinutes: settings.bookingBufferMinutes ?? DEFAULT_SETTINGS.bookingBufferMinutes,
    disruptionPenalty: settings.disruptionPenalty ?? DEFAULT_SETTINGS.disruptionPenalty,
    cancellationPolicy: normalizeCancellationPolicy(
        settings.cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY
    ),
})

export const getSettings = async () => {
    const settings = await getOrCreateSettings()
    return toPublicSettings(settings)
}

/**
 * Resolve booking buffer minutes from settings (never hardcode callers).
 * Falls back to 15 if settings row is missing/invalid.
 */
export const getBookingBufferMinutes = async (client = prisma) => {
    const settings = await client.systemSetting.findFirst()
    const value = Number(settings?.bookingBufferMinutes)
    if (Number.isFinite(value) && value >= 0) return Math.floor(value)
    return DEFAULT_SETTINGS.bookingBufferMinutes
}

export const updateSettings = async (data) => {
    const current = await getOrCreateSettings()

    const updated = await prisma.systemSetting.update({
        where: { id: current.id },
        data: {
            ...(data.gstEnabled !== undefined && { gstEnabled: data.gstEnabled }),
            ...(data.gstRate !== undefined && { gstRate: data.gstRate }),
            ...(data.platformFeeEnabled !== undefined && { platformFeeEnabled: data.platformFeeEnabled }),
            ...(data.platformFee !== undefined && { platformFee: data.platformFee }),
            ...(data.helmetFirstPrice !== undefined && { helmetFirstPrice: data.helmetFirstPrice }),
            ...(data.helmetSecondPrice !== undefined && { helmetSecondPrice: data.helmetSecondPrice }),
            ...(data.lateHelmetFee !== undefined && { lateHelmetFee: data.lateHelmetFee }),
            ...(data.bookingBufferMinutes !== undefined && {
                bookingBufferMinutes: data.bookingBufferMinutes,
            }),
            ...(data.disruptionPenalty !== undefined && {
                disruptionPenalty: data.disruptionPenalty,
            }),
            ...(data.cancellationPolicy !== undefined && {
                cancellationPolicy: normalizeCancellationPolicy(data.cancellationPolicy),
            }),
        },
    })

    return toPublicSettings(updated)
}
