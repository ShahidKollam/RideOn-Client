import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

const DEFAULT_SETTINGS = {
    gstEnabled: true,
    gstRate: 18,
    platformFeeEnabled: true,
    platformFee: 20,
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

export const getSettings = async () => {
    const settings = await getOrCreateSettings()

    return {
        gstEnabled: settings.gstEnabled,
        gstRate: settings.gstRate,
        platformFeeEnabled: settings.platformFeeEnabled,
        platformFee: settings.platformFee,
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
        },
    })

    return {
        gstEnabled: updated.gstEnabled,
        gstRate: updated.gstRate,
        platformFeeEnabled: updated.platformFeeEnabled,
        platformFee: updated.platformFee,
    }
}
