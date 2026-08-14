import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import {
    calculatePrice,
    findPricingByDuration,
    MAX_RENTAL_HOURS,
    MIN_RENTAL_HOURS,
} from './pricing.service.js'
import { findAvailableBike } from '../bike/bike.service.js'

export const getBookingAvailability = async (data, client = prisma) => {
    const pickupAt = new Date(data.pickupAt)
    const returnAt = new Date(data.returnAt)

    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    const durationHours = Math.ceil((returnAt - pickupAt) / (1000 * 60 * 60))
    if (durationHours < MIN_RENTAL_HOURS) {
        throw new ApiError(400, `Minimum duration is ${MIN_RENTAL_HOURS} hour`)
    }
    if (durationHours > MAX_RENTAL_HOURS) {
        throw new ApiError(400, `Maximum rental duration is ${MAX_RENTAL_HOURS} hours`)
    }

    // Validate campus
    const campus = await client.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    // Find pricing (single package or composed 24h blocks + remainder)
    const pricing = await findPricingByDuration(durationHours, data.campusId, client)
    const priceSnapshot = await calculatePrice(pricing)

    // Optional helmet add-on preview (0–2). Payment createOrder is still source of truth for charged amount.
    const settings = await client.systemSetting.findFirst()
    const helmetFirstPrice = settings?.helmetFirstPrice ?? 0
    const helmetSecondPrice = settings?.helmetSecondPrice ?? 0
    const helmetCount = Math.min(2, Math.max(0, Number(data.helmetCount) || 0))
    const helmetAmount =
        helmetCount === 0
            ? 0
            : helmetCount === 1
              ? Number(helmetFirstPrice) || 0
              : Number(((Number(helmetFirstPrice) || 0) + (Number(helmetSecondPrice) || 0)).toFixed(2))

    const totalWithHelmet = Number((priceSnapshot.totalAmount + helmetAmount).toFixed(2))

    // Check if at least one bike is available (do not expose bike to client)
    let availableBike = null
    try {
        availableBike = await findAvailableBike(pickupAt, returnAt, data.campusId, client)
    } catch (error) {
        // No available bike
    }

    const helmetPreview = {
        helmetCount,
        helmetAmount,
        helmetFirstPrice: Number(helmetFirstPrice) || 0,
        helmetSecondPrice: Number(helmetSecondPrice) || 0,
        totalAmountWithHelmet: totalWithHelmet,
    }

    const pricingInfo = {
        id: pricing.id,
        packageName: pricing.packageName || pricing._packageName,
        composed: Boolean(pricing._composed),
        segments: pricing._segments?.map((s) => ({
            id: s.id,
            packageName: s.packageName,
            durationHours: s.durationHours,
            price: s.price,
        })),
    }

    if (!availableBike) {
        return {
            available: false,
            reason: 'No available bikes for the selected time',
            durationHours,
            pricing: pricingInfo,
            ...priceSnapshot,
            ...helmetPreview,
        }
    }

    return {
        available: true,
        durationHours,
        pricing: pricingInfo,
        ...priceSnapshot,
        ...helmetPreview,
    }
}

export const checkAvailability = async (data) => getBookingAvailability(data)
