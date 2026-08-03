import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { calculatePrice, findPricingByDuration } from './pricing.service.js'
import { findAvailableBike } from '../bike/bike.service.js'

export const getBookingAvailability = async (data, client = prisma) => {
    const pickupAt = new Date(data.pickupAt)
    const returnAt = new Date(data.returnAt)

    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    const durationHours = Math.ceil((returnAt - pickupAt) / (1000 * 60 * 60))
    if (durationHours < 1) {
        throw new ApiError(400, 'Minimum duration 1 hour')
    }

    // Validate campus
    const campus = await client.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    // Find pricing
    const pricing = await findPricingByDuration(durationHours, data.campusId, client)
    const priceSnapshot = await calculatePrice(pricing)

    // Check if at least one bike is available (do not expose bike to client)
    let availableBike = null
    try {
        availableBike = await findAvailableBike(pickupAt, returnAt, data.campusId, client)
    } catch (error) {
        // No available bike
    }

    if (!availableBike) {
        return {
            available: false,
            reason: 'No available bikes for the selected time',
            durationHours,
            pricing: {
                id: pricing.id,
                packageName: pricing.packageName,
            },
            ...priceSnapshot,
        }
    }

    return {
        available: true,
        durationHours,
        pricing: {
            id: pricing.id,
            packageName: pricing.packageName,
        },
        ...priceSnapshot,
    }
}

export const checkAvailability = async (data) => getBookingAvailability(data)
