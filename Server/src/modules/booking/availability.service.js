import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { calculatePrice, findPricingByDuration, MAX_RENTAL_HOURS, MIN_RENTAL_HOURS } from './pricing.service.js'
import { findAvailableBike, hasAvailableBike } from '../bike/bike.service.js'
import { calculateHelmetAmount, getBookingBufferMinutes } from '../settings/settings.service.js'

const MAX_ALTERNATIVES = 5
/** Step size when walking outward from the requested pickup (minutes) */
const ALT_STEP_MINUTES = 30
/**
 * Safety cap so we never scan indefinitely (DB load).
 * Search is still availability-driven: we expand nearest-first and stop once we have 5 free slots.
 */
const ALT_MAX_SEARCH_HOURS = 48
/** Allow pickup slightly in the past (clock skew / network latency); same as past-pickup guard */
const PAST_PICKUP_GRACE_MS = 5 * 60 * 1000

/**
 * Build ranked alternative time ranges when the exact request has no bike.
 *
 * Rules:
 * 1. Keep the requested rental duration (never longer, never shorter).
 * 2. Search nearest available slots first (expand outward from requested pickup).
 * 3. Look both before and after the requested pickup time.
 * 4. Return only slots where a bike is actually available (buffer-aware).
 * 5. Max 5 alternatives.
 * 6. Never return a slot in the past.
 */
const findAlternativeSlots = async (pickupAt, returnAt, campusId, client) => {
    const requestedMs = returnAt.getTime() - pickupAt.getTime()
    const durationMin = Math.round(requestedMs / (60 * 1000))
    if (durationMin < MIN_RENTAL_HOURS * 60) return []

    const now = Date.now()
    const earliestStartMs = now - PAST_PICKUP_GRACE_MS
    const maxOffsetMs = ALT_MAX_SEARCH_HOURS * 60 * 60 * 1000
    const stepMs = ALT_STEP_MINUTES * 60 * 1000
    const durationMs = durationMin * 60 * 1000
    const requestedStartMs = pickupAt.getTime()

    const results = []
    const seen = new Set()

    // Expand outward: ±1 step, ±2 steps, ... nearest first
    for (let step = 1; step * stepMs <= maxOffsetMs; step++) {
        if (results.length >= MAX_ALTERNATIVES) break

        const offsets = [step * stepMs, -step * stepMs]
        for (const offsetMs of offsets) {
            if (results.length >= MAX_ALTERNATIVES) break

            const startMs = requestedStartMs + offsetMs
            if (startMs < earliestStartMs) continue

            const altPickup = new Date(startMs)
            const altReturn = new Date(startMs + durationMs)

            const key = `${altPickup.toISOString()}|${altReturn.toISOString()}`
            if (seen.has(key)) continue
            seen.add(key)

            const free = await hasAvailableBike(altPickup, altReturn, campusId, client)
            if (!free) continue

            results.push({
                pickupAt: altPickup.toISOString(),
                returnAt: altReturn.toISOString(),
                durationHours: Math.ceil(durationMin / 60),
                sameDuration: true,
            })
        }
    }

    return results
}

export const getBookingAvailability = async (data, client = prisma) => {
    const pickupAt = new Date(data.pickupAt)
    const returnAt = new Date(data.returnAt)

    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime()) || pickupAt >= returnAt) {
        throw new ApiError(400, 'Pickup must be before return')
    }

    // Reject past pickup (shared by check-availability and create-booking)
    if (pickupAt.getTime() < Date.now() - PAST_PICKUP_GRACE_MS) {
        throw new ApiError(400, 'Pickup time cannot be in the past')
    }

    const durationHours = Math.ceil((returnAt - pickupAt) / (1000 * 60 * 60))
    if (durationHours < MIN_RENTAL_HOURS) {
        throw new ApiError(400, `Minimum duration is ${MIN_RENTAL_HOURS} hour`)
    }
    if (durationHours > MAX_RENTAL_HOURS) {
        throw new ApiError(400, `Maximum rental duration is ${MAX_RENTAL_HOURS} hours`)
    }

    const campus = await client.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const pricing = await findPricingByDuration(durationHours, data.campusId, client)

    const settings = await client.systemSetting.findFirst()
    const helmetFirstPrice = settings?.helmetFirstPrice ?? 0
    const helmetSecondPrice = settings?.helmetSecondPrice ?? 0

    const { helmetCount, helmetAmount } = calculateHelmetAmount(
        settings || {},
        data.helmetCount,
        durationHours
    )

    const priceSnapshot = await calculatePrice({
        ...pricing,
        helmetAmount,
    })

    let availableBike = null
    try {
        availableBike = await findAvailableBike(pickupAt, returnAt, data.campusId, client)
    } catch {
        // no bike
    }

    const bufferMinutes = await getBookingBufferMinutes(client)

    const helmetPreview = {
        helmetCount,
        helmetAmount,
        helmetFirstPrice: Number(helmetFirstPrice) || 0,
        helmetSecondPrice: Number(helmetSecondPrice) || 0,
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
        const alternatives = await findAlternativeSlots(pickupAt, returnAt, data.campusId, client)

        return {
            available: false,
            reason: 'No available bikes for the selected time',
            durationHours,
            bookingBufferMinutes: bufferMinutes,
            pricing: pricingInfo,
            ...priceSnapshot,
            ...helmetPreview,
            alternatives,
        }
    }

    return {
        available: true,
        durationHours,
        bookingBufferMinutes: bufferMinutes,
        pricing: pricingInfo,
        ...priceSnapshot,
        ...helmetPreview,
    }
}

export const checkAvailability = async (data) => getBookingAvailability(data)
