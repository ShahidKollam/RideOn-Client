import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'

/** Business rules: min 1h (enforced in availability), max 72h */
export const MAX_RENTAL_HOURS = 72
export const MIN_RENTAL_HOURS = 1

export const createPricing = async (data) => {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) {
        throw new ApiError(400, 'Invalid or inactive campus')
    }

    const pricing = await prisma.pricing.create({
        data: {
            campusId: data.campusId,
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return pricing
}

export const updatePricing = async (id, data) => {
    const pricing = await prisma.pricing.findUnique({ where: { id } })
    if (!pricing) {
        throw new ApiError(404, 'Pricing not found')
    }

    const updated = await prisma.pricing.update({
        where: { id },
        data: {
            packageName: data.packageName,
            durationHours: data.durationHours,
            price: data.price,
            includedKm: data.includedKm,
            extraKmRate: data.extraKmRate,
            depositAmount: data.depositAmount,
            displayOrder: data.displayOrder,
            isFeatured: data.isFeatured,
            isActive: data.isActive,
        },
        include: {
            campus: true,
        },
    })

    return updated
}

export const getPricingById = async (id) => {
    const pricing = await prisma.pricing.findUnique({
        where: { id, isActive: true },
        include: { campus: true },
    })
    if (!pricing) throw new ApiError(404, 'Pricing not found')
    return pricing
}

export const getPricingList = async (query = {}) => {
    const { page = 1, limit = 20, campusId, isActive } = query

    const where = {
        isActive: isActive !== undefined ? isActive : true,
    }
    if (campusId) where.campusId = campusId

    const [pricings, total] = await Promise.all([
        prisma.pricing.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
            include: {
                campus: true,
            },
        }),
        prisma.pricing.count({ where }),
    ])

    return {
        pricings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
}

export const deletePricing = async (id) => {
    // Soft delete
    await prisma.pricing.update({
        where: { id },
        data: { isActive: false },
    })
    return { message: 'Pricing soft deleted' }
}

/**
 * Build a list of package segments that cover `durationHours`.
 *
 * Rules:
 * - Prefer largest package with durationHours <= remaining (greedy).
 * - If nothing fits remaining (> 0), round UP to the smallest package
 *   with durationHours >= remaining.
 * - Does not require 25–72h package rows in DB.
 *
 * Examples (packages 1,2,3,6,12,24):
 *   6h  → [6]
 *   13h → [12, 1]
 *   25h → [24, 1]
 *   50h → [24, 24, 2]
 *   72h → [24, 24, 24]
 */
export const composePackagesForDuration = (durationHours, packages) => {
    if (!packages?.length) {
        throw new ApiError(400, 'No active pricing packages for this campus')
    }

    const sortedDesc = [...packages].sort((a, b) => b.durationHours - a.durationHours)
    const sortedAsc = [...packages].sort((a, b) => a.durationHours - b.durationHours)

    let remaining = durationHours
    const segments = []
    // Safety: avoid infinite loop (max segments if all 1h)
    const maxSteps = durationHours + 2

    for (let step = 0; step < maxSteps && remaining > 0; step++) {
        // Largest package that still fits remaining
        const fit = sortedDesc.find((p) => p.durationHours <= remaining)
        if (fit) {
            segments.push(fit)
            remaining -= fit.durationHours
            continue
        }

        // Nothing fits → round up to smallest package that covers remaining
        const roundUp = sortedAsc.find((p) => p.durationHours >= remaining)
        if (!roundUp) {
            throw new ApiError(
                400,
                `No pricing package can cover the remaining ${remaining} hour(s)`
            )
        }
        segments.push(roundUp)
        remaining = 0
    }

    if (remaining > 0) {
        throw new ApiError(400, 'Unable to compose pricing for the selected duration')
    }

    return segments
}

/**
 * Resolve pricing for a rental duration.
 * - Single package when one covers the duration (existing behaviour).
 * - Otherwise composes multiple packages (e.g. 25h = 24h + 1h).
 *
 * Returns a synthetic "primary" pricing object (largest segment) plus
 * composed totals used by calculatePrice / booking snapshot.
 */
export const findPricingByDuration = async (durationHours, campusId, client = prisma) => {
    if (durationHours < MIN_RENTAL_HOURS) {
        throw new ApiError(400, `Minimum rental duration is ${MIN_RENTAL_HOURS} hour`)
    }
    if (durationHours > MAX_RENTAL_HOURS) {
        throw new ApiError(400, `Maximum rental duration is ${MAX_RENTAL_HOURS} hours`)
    }

    const packages = await client.pricing.findMany({
        where: {
            campusId,
            isActive: true,
        },
        orderBy: [{ durationHours: 'asc' }, { displayOrder: 'asc' }],
    })

    if (!packages.length) {
        throw new ApiError(400, 'No active pricing package matches the selected duration')
    }

    // 1) Exact package match → use it alone (same as current system for 1h, 6h, 12h, 24h, …)
    const exact = packages.find((p) => p.durationHours === durationHours)
    if (exact) {
        return {
            ...exact,
            _composed: false,
            _segments: [exact],
            _composedPrice: exact.price,
            _composedIncludedKm: exact.includedKm,
            _composedDeposit: exact.depositAmount,
            _composedExtraKmRate: exact.extraKmRate,
            _packageName: exact.packageName,
        }
    }

    // 2) Otherwise compose from building-block packages (greedy largest-fit;
    //    residual rounds UP to the smallest package that covers it).
    //    Examples: 13h → 12h + 1h; 25h → 24h + 1h; 50h → 24h + 24h + 2h; 72h → 24×3
    const segments = composePackagesForDuration(durationHours, packages)
    const primary = segments.reduce((best, p) =>
        p.durationHours > best.durationHours ? p : best
    )

    const isSingle = segments.length === 1
    const composedPrice = Number(
        segments.reduce((sum, p) => sum + Number(p.price), 0).toFixed(2)
    )
    const composedIncludedKm = segments.reduce((sum, p) => sum + Number(p.includedKm), 0)
    // Deposit once per booking — highest among segments
    const composedDeposit = Math.max(...segments.map((p) => Number(p.depositAmount)))
    // Extra km rate from primary (largest) package
    const composedExtraKmRate = Number(primary.extraKmRate)

    const packageName = isSingle
        ? primary.packageName
        : segments.map((p) => `${p.durationHours}h`).join(' + ')

    return {
        ...primary,
        price: composedPrice,
        includedKm: composedIncludedKm,
        depositAmount: composedDeposit,
        extraKmRate: composedExtraKmRate,
        packageName,
        // Keep primary.id for Booking.pricingId FK; amounts are the composed snapshot
        durationHours: segments.reduce((s, p) => s + p.durationHours, 0),
        _composed: !isSingle,
        _segments: segments,
        _composedPrice: composedPrice,
        _composedIncludedKm: composedIncludedKm,
        _composedDeposit: composedDeposit,
        _composedExtraKmRate: composedExtraKmRate,
        _packageName: packageName,
    }
}

/**
 * Calculate final price including Platform Fee + GST
 * Accepts a single Pricing row or the object returned by findPricingByDuration.
 */
export const calculatePrice = async (pricingData) => {
    // Get current system settings
    let settings = await prisma.systemSetting.findFirst()

    if (!settings) {
        // Fallback defaults (should rarely happen)
        settings = {
            gstEnabled: true,
            gstRate: 18,
            platformFeeEnabled: true,
            platformFee: 20,
        }
    }

    const baseAmount = Number(pricingData.price)
    const depositAmount = Number(pricingData.depositAmount)

    // Platform Fee (once per booking)
    const platformFee = settings.platformFeeEnabled ? settings.platformFee : 0

    // Subtotal
    const subtotal = baseAmount + platformFee

    // GST
    const gstAmount = settings.gstEnabled
        ? Number(((subtotal * settings.gstRate) / 100).toFixed(2))
        : 0

    // Final Total
    const totalAmount = Number((subtotal + gstAmount + depositAmount).toFixed(2))

    return {
        baseAmount,
        platformFee,
        subtotal,
        gstAmount,
        depositAmount,
        includedKm: pricingData.includedKm,
        extraKmRate: pricingData.extraKmRate,
        totalAmount,
        // Optional composition metadata for UI / debugging
        ...(pricingData._composed
            ? {
                  pricingComposed: true,
                  pricingSegments: pricingData._segments?.map((s) => ({
                      id: s.id,
                      packageName: s.packageName,
                      durationHours: s.durationHours,
                      price: s.price,
                  })),
              }
            : { pricingComposed: false }),
    }
}
