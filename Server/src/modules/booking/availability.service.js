import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { calculatePrice, findPricingByDuration, MAX_RENTAL_HOURS, MIN_RENTAL_HOURS } from './pricing.service.js'
import { findAvailableBike, hasAvailableBike } from '../bike/bike.service.js'
import { calculateHelmetAmount, getBookingBufferMinutes } from '../settings/settings.service.js'

const MAX_ALTERNATIVES = 5
/** Search window: look ± this many hours around the requested range for alternatives */
const ALT_SEARCH_HOURS = 12
/** Step size when sliding candidate windows (minutes) */
const ALT_STEP_MINUTES = 30

/**
 * Build ranked alternative time ranges when the exact request has no bike.
 * - Prefer same duration
 * - Never longer than requested
 * - Rank: same duration first, then closest to requested start
 * - Max 5
 * Uses the same buffer-aware availability as the main check.
 */
const findAlternativeSlots = async (pickupAt, returnAt, campusId, client) => {
    const requestedMs = returnAt.getTime() - pickupAt.getTime()
    const requestedMinutes = Math.round(requestedMs / (60 * 1000))
    if (requestedMinutes < MIN_RENTAL_HOURS * 60) return []

    const candidates = []
    const searchStart = new Date(pickupAt.getTime() - ALT_SEARCH_HOURS * 60 * 60 * 1000)
    const searchEnd = new Date(returnAt.getTime() + ALT_SEARCH_HOURS * 60 * 60 * 1000)
    const now = Date.now()

    // Same-duration first: slide windows of exact requested duration
    const durationsToTry = [requestedMinutes]
    // Then shorter durations (down to 1h, in 30-min steps) if needed
    for (let m = requestedMinutes - ALT_STEP_MINUTES; m >= MIN_RENTAL_HOURS * 60; m -= ALT_STEP_MINUTES) {
        durationsToTry.push(m)
    }

    for (const durationMin of durationsToTry) {
        if (candidates.length >= MAX_ALTERNATIVES) break

        for (
            let startMs = searchStart.getTime();
            startMs + durationMin * 60 * 1000 <= searchEnd.getTime();
            startMs += ALT_STEP_MINUTES * 60 * 1000
        ) {
            if (candidates.length >= MAX_ALTERNATIVES) break
            // Skip past times
            if (startMs < now - 5 * 60 * 1000) continue

            const altPickup = new Date(startMs)
            const altReturn = new Date(startMs + durationMin * 60 * 1000)

            // Skip the exact requested window (already known unavailable)
            if (
                altPickup.getTime() === pickupAt.getTime() &&
                altReturn.getTime() === returnAt.getTime()
            ) {
                continue
            }

            const free = await hasAvailableBike(altPickup, altReturn, campusId, client)
            if (!free) continue

            const distanceMs = Math.abs(altPickup.getTime() - pickupAt.getTime())
            candidates.push({
                pickupAt: altPickup.toISOString(),
                returnAt: altReturn.toISOString(),
                durationMinutes: durationMin,
                durationHours: Math.ceil(durationMin / 60),
                sameDuration: durationMin === requestedMinutes,
                distanceMs,
            })
        }
    }

    // Rank: same duration first, then closest to requested start
    candidates.sort((a, b) => {
        if (a.sameDuration !== b.sameDuration) return a.sameDuration ? -1 : 1
        return a.distanceMs - b.distanceMs
    })

    // Deduplicate by pickup+return string and take top N
    const seen = new Set()
    const unique = []
    for (const c of candidates) {
        const key = `${c.pickupAt}|${c.returnAt}`
        if (seen.has(key)) continue
        seen.add(key)
        unique.push({
            pickupAt: c.pickupAt,
            returnAt: c.returnAt,
            durationHours: c.durationHours,
            sameDuration: c.sameDuration,
        })
        if (unique.length >= MAX_ALTERNATIVES) break
    }

    return unique
}

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
