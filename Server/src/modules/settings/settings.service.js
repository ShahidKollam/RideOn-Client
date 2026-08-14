import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

const DEFAULT_SETTINGS = {
    gstEnabled: true,
    gstRate: 18,
    platformFeeEnabled: true,
    platformFee: 20,
    helmetFirstPrice: 0,
    helmetSecondPrice: 0,
    lateHelmetFee: 0,
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
 * Compute helmet add-on amount from admin prices and selected count (0–2).
 */
export const calculateHelmetAmount = (settings, helmetCount = 0) => {
    const count = Math.min(2, Math.max(0, Number(helmetCount) || 0))
    if (count <= 0) return { helmetCount: 0, helmetAmount: 0 }

    const first = Number(settings.helmetFirstPrice) || 0
    const second = Number(settings.helmetSecondPrice) || 0

    const helmetAmount =
        count === 1 ? first : Number((first + second).toFixed(2))

    return { helmetCount: count, helmetAmount }
}

export const getSettings = async () => {
    const settings = await getOrCreateSettings()

    return {
        gstEnabled: settings.gstEnabled,
        gstRate: settings.gstRate,
        platformFeeEnabled: settings.platformFeeEnabled,
        platformFee: settings.platformFee,
        helmetFirstPrice: settings.helmetFirstPrice,
        helmetSecondPrice: settings.helmetSecondPrice,
        lateHelmetFee: settings.lateHelmetFee,
    }
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
        },
    })

    return {
        gstEnabled: updated.gstEnabled,
        gstRate: updated.gstRate,
        platformFeeEnabled: updated.platformFeeEnabled,
        platformFee: updated.platformFee,
        helmetFirstPrice: updated.helmetFirstPrice,
        helmetSecondPrice: updated.helmetSecondPrice,
        lateHelmetFee: updated.lateHelmetFee,
    }
}
