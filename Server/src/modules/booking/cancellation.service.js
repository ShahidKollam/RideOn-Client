/**
 * Central booking cancellation calculator + orchestration.
 * Backend is the ONLY source of truth for cancellation fees and refunds.
 * Refunds apply ONLY to the current booking amount (rental), never to
 * outstanding late amounts that may have been bundled in the same Razorpay payment.
 */
import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { createRazorpayRefund } from '../../lib/razorpay.js'
import { PAYMENT_STATUS } from '../payment/payment.constants.js'

/** Default policy — never hardcode percentages in other services; read from SystemSetting. */
export const DEFAULT_CANCELLATION_POLICY = {
    enabled: true,
    rules: [
        { hours: 72, percent: 25 },
        { hours: 48, percent: 50 },
        { hours: 24, percent: 75 },
        { hours: 0, percent: 100 },
    ],
}

const CUSTOMER_CANCELLABLE_STATUSES = ['PAYMENT_PENDING', 'CONFIRMED']
const ADMIN_CANCELLABLE_STATUSES = ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'NO_SHOW']

const round2 = (n) => Number(Number(n || 0).toFixed(2))

/**
 * Normalize policy from DB (Json) or fall back to defaults.
 */
export const normalizeCancellationPolicy = (raw) => {
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_CANCELLATION_POLICY }

    const enabled = raw.enabled !== false
    let rules = Array.isArray(raw.rules) ? raw.rules : DEFAULT_CANCELLATION_POLICY.rules

    rules = rules
        .map((r) => ({
            hours: Number(r.hours),
            percent: Number(r.percent),
        }))
        .filter((r) => Number.isFinite(r.hours) && Number.isFinite(r.percent) && r.percent >= 0 && r.percent <= 100)
        .sort((a, b) => b.hours - a.hours)

    if (rules.length === 0) {
        rules = [...DEFAULT_CANCELLATION_POLICY.rules]
    }

    return { enabled, rules }
}

/**
 * Load cancellation policy from SystemSetting (single row).
 */
export const getCancellationPolicy = async (client = prisma) => {
    const settings = await client.systemSetting.findFirst()
    return normalizeCancellationPolicy(settings?.cancellationPolicy)
}

/**
 * Hours remaining until scheduled pickup (can be negative if past pickup).
 */
export const getHoursUntilPickup = (pickupAt, now = new Date()) => {
    const pickup = new Date(pickupAt)
    const ms = pickup.getTime() - new Date(now).getTime()
    return ms / (1000 * 60 * 60)
}

/**
 * Pick applicable cancellation percent from policy rules.
 * Rules are sorted descending by hours; first rule where hoursRemaining >= rule.hours wins.
 */
export const getApplicableCancellationPercent = (policy, hoursRemaining) => {
    const normalized = normalizeCancellationPolicy(policy)
    for (const rule of normalized.rules) {
        if (hoursRemaining >= rule.hours) {
            return rule.percent
        }
    }
    // Past all thresholds (including hours: 0) → highest penalty from lowest hours rule
    const lowest = normalized.rules[normalized.rules.length - 1]
    return lowest ? lowest.percent : 100
}

/**
 * Eligible booking amount for cancellation = booking.totalAmount only.
 * Does NOT include outstanding late amounts that may have been paid in the same Razorpay order.
 */
export const getBookingEligibleAmount = (booking) => round2(booking.totalAmount)

/**
 * Resolve primary payment linked to this booking (for refund routing).
 * Prefer RAZORPAY PAID with gatewayPaymentId; otherwise any PAID payment.
 */
export const resolveBookingPayment = (booking) => {
    const payments = booking.payments || []
    const paid = payments.filter((p) => p.status === 'PAID' || p.status === 'PARTIALLY_REFUNDED')
    if (paid.length === 0) return null

    const razorpay = paid.find(
        (p) => (p.gateway === 'RAZORPAY' || !p.gateway || p.gateway === 'razorpay') && p.gatewayPaymentId
    )
    if (razorpay) return razorpay

    return paid[0]
}

/**
 * Whether the bike has actually been picked up (status ACTIVE or pickedUpAt set).
 * Do NOT use only scheduled pickupAt.
 */
export const isBikePickedUp = (booking) => {
    if (booking.status === 'ACTIVE') return true
    if (booking.pickedUpAt) return true
    return false
}

/**
 * Core calculator — used by customer preview, customer cancel, and admin cancel.
 *
 * @param {object} booking - Booking with payments relation preferred
 * @param {object} options
 * @param {'CUSTOMER'|'ADMIN'} options.actor
 * @param {boolean} [options.applyCancellationFee=true] - Admin may set false for full refund
 * @param {number|null} [options.adjustedRefundAmount] - Admin override of refund amount
 * @param {object} [options.policy] - Optional preloaded policy
 * @param {Date} [options.now]
 */
export const calculateCancellation = (booking, options = {}) => {
    const {
        actor = 'CUSTOMER',
        applyCancellationFee = true,
        adjustedRefundAmount = null,
        policy: policyInput,
        now = new Date(),
    } = options

    const policy = normalizeCancellationPolicy(policyInput ?? DEFAULT_CANCELLATION_POLICY)
    const bookingAmount = getBookingEligibleAmount(booking)
    const hoursRemaining = getHoursUntilPickup(booking.pickupAt, now)
    const policyPercent = getApplicableCancellationPercent(policy, hoursRemaining)

    let canCancel = true
    let reason = null

    if (booking.status === 'CANCELLED') {
        canCancel = false
        reason = 'Booking is already cancelled'
    } else if (booking.status === 'COMPLETED') {
        canCancel = false
        reason = 'Booking is already completed'
    } else if (booking.status === 'FAILED') {
        canCancel = false
        reason = 'Booking has failed and cannot be cancelled'
    } else if (actor === 'CUSTOMER') {
        if (!policy.enabled) {
            canCancel = false
            reason = 'Cancellation is currently disabled'
        } else if (isBikePickedUp(booking)) {
            canCancel = false
            reason = 'Cannot cancel after the bike has been picked up'
        } else if (!CUSTOMER_CANCELLABLE_STATUSES.includes(booking.status)) {
            canCancel = false
            reason = `Cannot cancel booking in status ${booking.status}`
        }
    } else if (actor === 'ADMIN') {
        if (!ADMIN_CANCELLABLE_STATUSES.includes(booking.status)) {
            canCancel = false
            reason = `Cannot cancel booking in status ${booking.status}`
        }
    }

    let cancellationPercentage = applyCancellationFee ? policyPercent : 0
    let cancellationAmount = round2((bookingAmount * cancellationPercentage) / 100)
    let refundAmount = round2(bookingAmount - cancellationAmount)

    // Admin manual adjustment of refund (audit stored separately by caller)
    let wasAdjusted = false
    if (actor === 'ADMIN' && adjustedRefundAmount != null && Number.isFinite(Number(adjustedRefundAmount))) {
        const adjusted = round2(Math.max(0, Math.min(bookingAmount, Number(adjustedRefundAmount))))
        if (adjusted !== refundAmount) {
            wasAdjusted = true
            refundAmount = adjusted
            cancellationAmount = round2(bookingAmount - refundAmount)
            cancellationPercentage = bookingAmount > 0 ? round2((cancellationAmount / bookingAmount) * 100) : 0
        }
    }

    // Unpaid / pending payment → no refund to process
    const payment = resolveBookingPayment(booking)
    const isPaid =
        booking.paymentStatus === 'PAID' ||
        booking.paymentStatus === 'PARTIALLY_PAID' ||
        (payment && (payment.status === 'PAID' || payment.status === 'PARTIALLY_REFUNDED'))

    if (!isPaid || bookingAmount <= 0) {
        refundAmount = 0
        if (booking.status === 'PAYMENT_PENDING') {
            // Cancelling unpaid booking — no fee concept needed for money movement
        }
    }

    // Cap refund at booking amount (never touch outstanding portion of a combined Razorpay payment)
    if (refundAmount > bookingAmount) {
        refundAmount = bookingAmount
    }

    return {
        canCancel,
        reason,
        policyEnabled: policy.enabled,
        hoursRemaining: round2(hoursRemaining),
        bookingAmount,
        cancellationPercentage,
        cancellationAmount,
        refundAmount,
        originalCancellationAmount: round2((bookingAmount * policyPercent) / 100),
        policyPercent,
        applyCancellationFee,
        wasAdjusted,
        isPaid: Boolean(isPaid),
        payment,
        isPickedUp: isBikePickedUp(booking),
    }
}

/**
 * Preview for customer (no side effects).
 */
export const previewCustomerCancellation = async (bookingId, userId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            payments: {
                orderBy: { createdAt: 'asc' },
            },
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.userId !== userId) throw new ApiError(403, 'Not authorized')

    const policy = await getCancellationPolicy()
    const calc = calculateCancellation(booking, { actor: 'CUSTOMER', policy })

    return {
        canCancel: calc.canCancel,
        reason: calc.reason,
        bookingAmount: calc.bookingAmount,
        cancellationPercentage: calc.cancellationPercentage,
        cancellationAmount: calc.cancellationAmount,
        refundAmount: calc.refundAmount,
        hoursRemaining: calc.hoursRemaining,
        policyEnabled: calc.policyEnabled,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        refundStatus: booking.refundStatus || null,
        cancelledAt: booking.cancelledAt || null,
    }
}

/**
 * Build cancellation info payload for booking detail responses.
 */
export const buildCancellationInfo = (booking, policy, actor = 'CUSTOMER') => {
    if (booking.status === 'CANCELLED') {
        return {
            canCancel: false,
            reason: 'Booking is already cancelled',
            bookingAmount: getBookingEligibleAmount(booking),
            cancellationPercentage: booking.cancellationPercentage ?? null,
            cancellationAmount: booking.cancellationAmount ?? null,
            refundAmount: booking.refundAmount ?? null,
            refundStatus: booking.refundStatus ?? null,
            cancelledAt: booking.cancelledAt ?? null,
            cancelledBy: booking.cancelledBy ?? null,
            originalCancellationAmount: booking.originalCancellationAmount ?? null,
            adminAdjustedRefundAmount: booking.adminAdjustedRefundAmount ?? null,
            adminAdjustmentReason: booking.adminAdjustmentReason ?? null,
            refundGatewayId: booking.refundGatewayId ?? null,
        }
    }

    const calc = calculateCancellation(booking, { actor, policy })
    return {
        canCancel: calc.canCancel,
        reason: calc.reason,
        bookingAmount: calc.bookingAmount,
        cancellationPercentage: calc.cancellationPercentage,
        cancellationAmount: calc.cancellationAmount,
        refundAmount: calc.refundAmount,
        hoursRemaining: calc.hoursRemaining,
        policyEnabled: calc.policyEnabled,
        refundStatus: booking.refundStatus ?? null,
        cancelledAt: booking.cancelledAt ?? null,
        cancelledBy: booking.cancelledBy ?? null,
        originalCancellationAmount: booking.originalCancellationAmount ?? null,
        adminAdjustedRefundAmount: booking.adminAdjustedRefundAmount ?? null,
        adminAdjustmentReason: booking.adminAdjustmentReason ?? null,
        refundGatewayId: booking.refundGatewayId ?? null,
    }
}

/**
 * Process Razorpay refund for the booking-eligible refund amount only.
 * Idempotent: if refundGatewayId already set, skip.
 */
const processRazorpayRefund = async (booking, payment, refundAmount) => {
    if (refundAmount <= 0) {
        return { refundStatus: 'NOT_APPLICABLE', refundGatewayId: null, error: null }
    }

    if (booking.refundGatewayId || booking.refundStatus === 'SUCCESS') {
        return {
            refundStatus: booking.refundStatus || 'SUCCESS',
            refundGatewayId: booking.refundGatewayId,
            error: null,
            alreadyProcessed: true,
        }
    }

    if (!payment?.gatewayPaymentId) {
        return {
            refundStatus: 'FAILED',
            refundGatewayId: null,
            error: 'No Razorpay payment id on record',
        }
    }

    try {
        const refund = await createRazorpayRefund({
            paymentId: payment.gatewayPaymentId,
            amountInPaise: Math.round(refundAmount * 100),
            notes: {
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber,
                type: 'CANCELLATION',
            },
        })

        // Persist refund id on payment gatewayResponse for audit trail
        const prev = payment.gatewayResponse && typeof payment.gatewayResponse === 'object' ? payment.gatewayResponse : {}
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status:
                    refundAmount >= Number(payment.amount) ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED,
                gatewayResponse: {
                    ...prev,
                    cancellationRefund: {
                        id: refund.id,
                        amount: refundAmount,
                        status: refund.status,
                        createdAt: new Date().toISOString(),
                    },
                },
            },
        })

        return {
            refundStatus: 'SUCCESS',
            refundGatewayId: refund.id,
            error: null,
            razorpayRefund: refund,
        }
    } catch (err) {
        console.error(`❌ Razorpay refund failed for booking ${booking.bookingNumber}:`, err?.message || err)
        return {
            refundStatus: 'FAILED',
            refundGatewayId: null,
            error: err?.message || 'Razorpay refund failed',
        }
    }
}

/**
 * Execute cancellation (customer or admin). Idempotent for already-cancelled bookings.
 */
export const executeCancellation = async ({
    bookingId,
    userId = null,
    adminId = null,
    actor = 'CUSTOMER',
    applyCancellationFee = true,
    adjustedRefundAmount = null,
    adjustmentReason = null,
}) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            payments: { orderBy: { createdAt: 'asc' } },
            bike: true,
            user: true,
            campus: true,
            pricing: true,
        },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')

    if (actor === 'CUSTOMER') {
        if (!userId || booking.userId !== userId) {
            throw new ApiError(403, 'Not authorized')
        }
    }

    // Duplicate protection: already cancelled → return existing state, no second refund
    if (booking.status === 'CANCELLED') {
        return {
            booking,
            alreadyCancelled: true,
            calculation: {
                canCancel: false,
                reason: 'Booking is already cancelled',
                bookingAmount: getBookingEligibleAmount(booking),
                cancellationPercentage: booking.cancellationPercentage,
                cancellationAmount: booking.cancellationAmount,
                refundAmount: booking.refundAmount,
                refundStatus: booking.refundStatus,
            },
        }
    }

    const policy = await getCancellationPolicy()
    const calc = calculateCancellation(booking, {
        actor,
        applyCancellationFee,
        adjustedRefundAmount,
        policy,
    })

    if (!calc.canCancel) {
        throw new ApiError(400, calc.reason || 'Cancellation not allowed')
    }

    const payment = calc.payment
    const isRazorpay =
        payment &&
        payment.gatewayPaymentId &&
        (payment.gateway === 'RAZORPAY' ||
            payment.gateway === 'razorpay' ||
            !payment.gateway ||
            payment.gateway === 'RAZORPAY')

    const isCashOrOffline =
        payment &&
        (payment.gateway === 'ADMIN_OFFLINE' ||
            payment.gateway === 'CASH' ||
            (payment.paymentMethod && String(payment.paymentMethod).toUpperCase().includes('CASH')))

    let refundStatus = 'NONE'
    let refundGatewayId = null
    let refundError = null

    if (calc.refundAmount > 0 && calc.isPaid) {
        if (isRazorpay) {
            refundStatus = 'PENDING'
        } else if (isCashOrOffline) {
            // Admin handles physical cash refund; mark pending until recorded
            refundStatus = 'PENDING'
        } else if (payment) {
            refundStatus = 'PENDING'
        } else {
            refundStatus = 'NOT_APPLICABLE'
        }
    } else {
        refundStatus = 'NOT_APPLICABLE'
    }

    const now = new Date()

    const updated = await prisma.$transaction(async (tx) => {
        // Free bike if it was reserved / in use for this booking
        if (booking.bikeId && (booking.status === 'ACTIVE' || booking.status === 'CONFIRMED')) {
            // Only set AVAILABLE if bike is not already elsewhere; admin ACTIVE cancel frees it
            if (booking.status === 'ACTIVE') {
                await tx.bike.update({
                    where: { id: booking.bikeId },
                    data: { status: 'AVAILABLE' },
                })
            }
        }

        const data = {
            status: 'CANCELLED',
            cancelledAt: now,
            cancelledBy: actor,
            cancelledByAdminId: adminId || null,
            cancellationPercentage: calc.cancellationPercentage,
            cancellationAmount: calc.cancellationAmount,
            originalCancellationAmount: calc.originalCancellationAmount,
            refundAmount: calc.refundAmount,
            refundStatus,
            adminAdjustedRefundAmount: calc.wasAdjusted ? calc.refundAmount : null,
            adminAdjustmentReason: calc.wasAdjusted && adjustmentReason ? String(adjustmentReason).slice(0, 500) : null,
        }

        return tx.booking.update({
            where: { id: bookingId },
            data,
            include: {
                payments: { orderBy: { createdAt: 'asc' } },
                bike: true,
                user: true,
                campus: true,
                pricing: true,
            },
        })
    })

    // Process Razorpay refund outside the DB transaction (external API)
    let finalBooking = updated
    if (refundStatus === 'PENDING' && isRazorpay && calc.refundAmount > 0) {
        const result = await processRazorpayRefund(updated, payment, calc.refundAmount)
        refundStatus = result.refundStatus
        refundGatewayId = result.refundGatewayId
        refundError = result.error

        finalBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                refundStatus,
                refundGatewayId,
                refundedAt: refundStatus === 'SUCCESS' ? new Date() : null,
            },
            include: {
                payments: { orderBy: { createdAt: 'asc' } },
                bike: true,
                user: true,
                campus: true,
                pricing: true,
            },
        })
    }

    // Audit log for admin cancellation
    if (actor === 'ADMIN' && adminId) {
        try {
            await prisma.auditLog.create({
                data: {
                    adminId,
                    action: 'BOOKING_CANCEL',
                    entityType: 'Booking',
                    entityId: bookingId,
                    metadata: {
                        bookingNumber: booking.bookingNumber,
                        applyCancellationFee,
                        originalCancellationAmount: calc.originalCancellationAmount,
                        cancellationAmount: calc.cancellationAmount,
                        refundAmount: calc.refundAmount,
                        wasAdjusted: calc.wasAdjusted,
                        adjustmentReason: adjustmentReason || null,
                        refundStatus,
                        refundGatewayId,
                    },
                },
            })
        } catch (e) {
            console.error('Failed to write cancellation audit log:', e?.message)
        }
    }

    return {
        booking: finalBooking,
        alreadyCancelled: false,
        calculation: {
            canCancel: true,
            bookingAmount: calc.bookingAmount,
            cancellationPercentage: calc.cancellationPercentage,
            cancellationAmount: calc.cancellationAmount,
            originalCancellationAmount: calc.originalCancellationAmount,
            refundAmount: calc.refundAmount,
            refundStatus,
            refundGatewayId,
            refundError,
            applyCancellationFee,
            wasAdjusted: calc.wasAdjusted,
            hoursRemaining: calc.hoursRemaining,
            paymentGateway: payment?.gateway || null,
            isRazorpay: Boolean(isRazorpay),
            isCashOrOffline: Boolean(isCashOrOffline),
        },
    }
}

/**
 * Admin records that a cash refund was handed over.
 */
export const recordCashRefund = async (bookingId, adminId, { reference } = {}) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true },
    })
    if (!booking) throw new ApiError(404, 'Booking not found')
    if (booking.status !== 'CANCELLED') {
        throw new ApiError(400, 'Booking must be cancelled before recording a cash refund')
    }
    if (booking.refundStatus === 'SUCCESS') {
        return booking // idempotent
    }

    const amount = Number(booking.refundAmount || 0)
    if (amount <= 0) {
        throw new ApiError(400, 'No refund amount due for this booking')
    }

    const updated = await prisma.$transaction(async (tx) => {
        await tx.payment.create({
            data: {
                userId: booking.userId,
                bookingId: booking.id,
                gateway: 'CASH_REFUND',
                gatewayOrderId: `CASH-REFUND-${booking.id}-${Date.now()}`,
                amount: -Math.abs(amount),
                status: 'REFUNDED',
                paymentMethod: 'CASH',
                gatewayResponse: {
                    type: 'CANCELLATION_CASH_REFUND',
                    reference: reference || null,
                    recordedByAdminId: adminId,
                },
                paidAt: new Date(),
            },
        })

        return tx.booking.update({
            where: { id: bookingId },
            data: {
                refundStatus: 'SUCCESS',
                refundedAt: new Date(),
                paymentStatus:
                    booking.paymentStatus === 'PAID' || booking.paymentStatus === 'PARTIALLY_PAID'
                        ? 'REFUNDED'
                        : booking.paymentStatus,
            },
            include: {
                payments: { orderBy: { createdAt: 'asc' } },
                user: true,
                bike: true,
                campus: true,
                pricing: true,
            },
        })
    })

    if (adminId) {
        try {
            await prisma.auditLog.create({
                data: {
                    adminId,
                    action: 'CASH_REFUND_RECORDED',
                    entityType: 'Booking',
                    entityId: bookingId,
                    metadata: {
                        bookingNumber: booking.bookingNumber,
                        refundAmount: amount,
                        reference: reference || null,
                    },
                },
            })
        } catch (_) {
            /* non-fatal */
        }
    }

    return updated
}
