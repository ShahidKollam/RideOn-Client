import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { checkBikeAvailability, findNextAvailableBike } from '../bike/bike.service.js'
import { calculatePrice, findPricingByDuration } from './pricing.service.js'

export const getBookingAvailability = async (data, client = prisma) => {
    const pickupAt = new Date(data.pickupAt)
    const returnAt = new Date(data.returnAt)
    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    const durationHours = Math.ceil((returnAt - pickupAt) / (1000 * 60 * 60))
    if (durationHours < 1) throw new ApiError(400, 'Minimum duration 1 hour')

    const [campus, bike] = await Promise.all([
        client.campus.findUnique({ where: { id: data.campusId } }),
        client.bike.findUnique({ where: { id: data.bikeId } }),
    ])
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid campus')
    if (!bike || bike.campusId !== data.campusId) throw new ApiError(400, 'Bike does not belong to the selected campus')

    const pricing = await findPricingByDuration(durationHours, data.campusId, client)
    const priceSnapshot = calculatePrice(pricing)
    const availability = await checkBikeAvailability(data.bikeId, pickupAt, returnAt, client)
    const nextAvailability = availability.available
        ? null
        : await findNextAvailableBike(data.bikeId, pickupAt, returnAt, client)

    return {
        available: availability.available,
        ...(availability.available ? {} : { reason: availability.reason, availableFrom: nextAvailability.availableFrom }),
        durationHours,
        pricing: { id: pricing.id, packageName: pricing.packageName },
        ...priceSnapshot,
        totalAmount: priceSnapshot.baseAmount + priceSnapshot.depositAmount,
    }
}

export const checkAvailability = async (data) => getBookingAvailability(data)
