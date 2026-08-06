import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { getBookingAvailability } from '../booking/availability.service.js'
import { findAvailableBike } from '../bike/bike.service.js'
import {
    createRazorpayOrder,
    verifyPaymentSignature,
    fetchRazorpayPayment,
    toPaise,
    fromPaise,
} from '../../lib/razorpay.js'
import { PAYMENT_GATEWAY, PAYMENT_STATUS, CURRENCY } from './payment.constants.js'

const generateBookingNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000)
    return `BK${year}${random.toString().padStart(6, '0')}`
}

const isSerializationError = (error) =>
    error?.code === 'P2034' || error?.message?.toLowerCase?.().includes('serialization')

const isUniqueConstraintError = (error) => error?.code === 'P2002'

/**
 * Shared booking creation used by verify + reconciliation.
 * Must be called inside a Prisma transaction (tx).
 * Idempotent: if payment already has bookingId, returns existing booking.
 */
const createBookingForPaidPayment = async (tx, payment, razorpay_payment_id, source = 'verify') => {
    console.log(`📦 [${source}] Booking creation started for payment ${payment.id}`)

    // Idempotency guard
    if (payment.bookingId) {
        console.log(`♻️  [${source}] Booking already linked: ${payment.bookingId}`)
        const booking = await tx.booking.findUnique({
            where: { id: payment.bookingId },
            include: {
                user: true,
                campus: true,
                pricing: true,
                bike: true,
            },
        })
        return { payment, booking, alreadyProcessed: true }
    }

    const intent = payment.gatewayResponse?.intent
    if (!intent) {
        throw new ApiError(400, 'Payment intent data missing')
    }

    const userId = payment.userId

    // Re-verify availability inside transaction
    const summary = await getBookingAvailability(
        {
            campusId: intent.campusId,
            pickupAt: intent.pickupAt,
            returnAt: intent.returnAt,
        },
        tx
    )
    if (!summary.available) {
        console.error(`❌ [${source}] No bikes available for payment ${payment.id}`)
        throw new ApiError(409, summary.reason || 'No available bikes')
    }

    // Assign bike
    const bike = await findAvailableBike(
        new Date(intent.pickupAt),
        new Date(intent.returnAt),
        intent.campusId,
        tx
    )
    console.log(`🚲 [${source}] Bike assigned: ${bike.id} (${bike.registrationNumber || bike.name})`)

    // Create booking
    const bookingNumber = generateBookingNumber()
    const booking = await tx.booking.create({
        data: {
            bookingNumber,
            userId,
            bikeId: bike.id,
            campusId: intent.campusId,
            pricingId: intent.pricingId,
            pickupAt: new Date(intent.pickupAt),
            returnAt: new Date(intent.returnAt),
            durationHours: intent.durationHours,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            baseAmount: intent.baseAmount,
            depositAmount: intent.depositAmount,
            totalAmount: payment.amount,
            includedKm: intent.includedKm,
            extraKmRate: intent.extraKmRate,
            notes: intent.notes || null,
        },
        include: {
            user: true,
            campus: true,
            pricing: true,
            bike: true,
        },
    })
    console.log(`✅ [${source}] Booking created: ${booking.id} (${booking.bookingNumber})`)

    // Update payment → PAID and link booking
    console.log(`💳 [${source}] Payment status before update: ${payment.status}`)
    const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
            bookingId: booking.id,
            gatewayPaymentId: razorpay_payment_id || payment.gatewayPaymentId,
            status: PAYMENT_STATUS.PAID,
            paidAt: payment.paidAt || new Date(),
            gatewayResponse: {
                ...payment.gatewayResponse,
                bookingCreatedBy: source,
                bookingCreatedAt: new Date().toISOString(),
            },
        },
    })
    console.log(`💳 [${source}] Payment status after update: ${updatedPayment.status} | bookingId: ${updatedPayment.bookingId}`)

    return { payment: updatedPayment, booking, alreadyProcessed: false }
}

/**
 * Step 1–4: Check availability, calculate amount, create Razorpay order, return to frontend.
 * Does NOT create a booking.
 */
export const createOrder = async ({ campusId, pickupAt, returnAt, notes }, userId) => {
    console.log('🟢 [createOrder] START', { userId, campusId, pickupAt, returnAt })

    if (!userId) throw new ApiError(401, 'Authentication required')

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { drivingLicense: true },
    })
    if (!user) throw new ApiError(404, 'User not found')
    if (!user.isVerified) throw new ApiError(400, 'User email not verified')
    if (user.onboardingStatus !== 'PROFILE_COMPLETED') {
        throw new ApiError(400, 'Complete your profile before booking')
    }

    const activeBooking = await prisma.booking.findFirst({
        where: {
            userId,
            status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
    })
    if (activeBooking) throw new ApiError(400, 'User has an active booking')

    // Availability + pricing (source of truth on backend)
    const summary = await getBookingAvailability({ campusId, pickupAt, returnAt })
    if (!summary.available) {
        console.warn('⚠️  [createOrder] No availability', summary.reason)
        throw new ApiError(409, summary.reason || 'No available bikes for the selected time')
    }

    const amount = summary.totalAmount
    const amountInPaise = toPaise(amount)

    // Create Razorpay order. Intent is stored in notes (not duplicated as booking fields).
    const receipt = `rcpt_${Date.now()}_${userId.slice(-6)}`
    const razorpayOrder = await createRazorpayOrder({
        amountInPaise,
        currency: CURRENCY.INR,
        receipt,
        notes: {
            userId,
            campusId,
            pickupAt,
            returnAt,
            notes: notes || '',
            durationHours: String(summary.durationHours),
            pricingId: summary.pricing.id,
            baseAmount: String(summary.baseAmount),
            depositAmount: String(summary.depositAmount),
            platformFee: String(summary.platformFee ?? 0),
            gstAmount: String(summary.gstAmount ?? 0),
            totalAmount: String(amount),
            includedKm: String(summary.includedKm),
            extraKmRate: String(summary.extraKmRate),
        },
    })
    console.log('🧾 [createOrder] Razorpay order created:', razorpayOrder.id)

    // Persist pending payment (bookingId still null until verification succeeds)
    const payment = await prisma.payment.create({
        data: {
            userId,
            gateway: PAYMENT_GATEWAY.RAZORPAY,
            gatewayOrderId: razorpayOrder.id,
            amount,
            currency: CURRENCY.INR,
            status: PAYMENT_STATUS.PENDING,
            gatewayResponse: {
                razorpayOrder,
                intent: {
                    campusId,
                    pickupAt,
                    returnAt,
                    notes: notes || null,
                    durationHours: summary.durationHours,
                    pricingId: summary.pricing.id,
                    baseAmount: summary.baseAmount,
                    depositAmount: summary.depositAmount,
                    platformFee: summary.platformFee ?? 0,
                    gstAmount: summary.gstAmount ?? 0,
                    includedKm: summary.includedKm,
                    extraKmRate: summary.extraKmRate,
                },
            },
        },
    })
    console.log('🟢 [createOrder] END | paymentId:', payment.id, '| status:', payment.status)

    return {
        paymentId: payment.id,
        orderId: razorpayOrder.id,
        amount,
        amountInPaise,
        currency: CURRENCY.INR,
        keyId: process.env.RAZORPAY_KEY_ID,
        // Pricing breakdown for UI display only (backend remains source of truth)
        pricing: {
            id: summary.pricing.id,
            packageName: summary.pricing.packageName,
            durationHours: summary.durationHours,
            baseAmount: summary.baseAmount,
            platformFee: summary.platformFee ?? 0,
            gstAmount: summary.gstAmount ?? 0,
            depositAmount: summary.depositAmount,
            totalAmount: amount,
            includedKm: summary.includedKm,
            extraKmRate: summary.extraKmRate,
        },
    }
}

/**
 * Step 8–14: Verify signature + Razorpay Payments API, then in a transaction:
 * re-check availability → create booking → save payment → commit.
 * Fully idempotent.
 */
export const verifyPayment = async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    userId
) => {
    console.log('🔵 [verify] START', { razorpay_order_id, razorpay_payment_id, userId })

    if (!userId) throw new ApiError(401, 'Authentication required')

    // 1. Signature verification (never trust frontend)
    const isValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    })
    if (!isValid) {
        console.error('❌ [verify] Invalid payment signature')
        throw new ApiError(400, 'Invalid payment signature')
    }
    console.log('✅ [verify] Signature valid')

    const existingPayment = await prisma.payment.findUnique({
        where: { gatewayOrderId: razorpay_order_id },
        include: { booking: true },
    })

    if (!existingPayment) {
        console.error('❌ [verify] Payment order not found')
        throw new ApiError(404, 'Payment order not found')
    }

    if (existingPayment.userId !== userId) {
        console.error('❌ [verify] Not authorized')
        throw new ApiError(403, 'Not authorized for this payment')
    }

    // Idempotency: already completed
    if (existingPayment.status === PAYMENT_STATUS.PAID && existingPayment.bookingId) {
        console.log('♻️  [verify] Already processed | bookingId:', existingPayment.bookingId)
        return {
            payment: existingPayment,
            booking: existingPayment.booking,
            alreadyProcessed: true,
        }
    }

    const intent = existingPayment.gatewayResponse?.intent
    if (!intent) {
        throw new ApiError(400, 'Payment intent data missing')
    }

    if (Number(existingPayment.amount) <= 0) {
        throw new ApiError(400, 'Invalid payment amount')
    }

    // 2. Production-grade: fetch payment from Razorpay and validate
    console.log('🔍 [verify] Fetching payment from Razorpay API...')
    let razorpayPayment
    try {
        razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id)
    } catch (err) {
        console.error('❌ [verify] Razorpay Payments API failed:', err.message)
        throw new ApiError(502, 'Unable to verify payment with gateway')
    }

    console.log('🔍 [verify] Razorpay payment status:', razorpayPayment.status, '| amount:', razorpayPayment.amount)

    // Status must be captured
    if (razorpayPayment.status !== 'captured') {
        console.error('❌ [verify] Payment not captured. Status:', razorpayPayment.status)
        throw new ApiError(400, `Payment not captured. Current status: ${razorpayPayment.status}`)
    }

    // Amount must match (Razorpay uses paise)
    const expectedPaise = toPaise(existingPayment.amount)
    if (Number(razorpayPayment.amount) !== expectedPaise) {
        console.error('❌ [verify] Amount mismatch', {
            expected: expectedPaise,
            got: razorpayPayment.amount,
        })
        throw new ApiError(400, 'Payment amount mismatch')
    }

    // Currency must match
    if ((razorpayPayment.currency || '').toUpperCase() !== (existingPayment.currency || 'INR').toUpperCase()) {
        console.error('❌ [verify] Currency mismatch', {
            expected: existingPayment.currency,
            got: razorpayPayment.currency,
        })
        throw new ApiError(400, 'Payment currency mismatch')
    }

    // Order ID must match
    if (razorpayPayment.order_id !== razorpay_order_id) {
        console.error('❌ [verify] Order ID mismatch', {
            expected: razorpay_order_id,
            got: razorpayPayment.order_id,
        })
        throw new ApiError(400, 'Payment order mismatch')
    }

    console.log('✅ [verify] Razorpay payment validated (captured + amount + currency + order)')

    // 3. Transaction: create booking + update payment
    const MAX_ATTEMPTS = 2
    let lastError = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(`🔄 [verify] Transaction START (attempt ${attempt})`)
            const result = await prisma.$transaction(
                async (tx) => {
                    const payment = await tx.payment.findUnique({
                        where: { id: existingPayment.id },
                    })
                    if (!payment) throw new ApiError(404, 'Payment not found')

                    if (payment.status === PAYMENT_STATUS.PAID && payment.bookingId) {
                        console.log('♻️  [verify] Already linked inside transaction')
                        const booking = await tx.booking.findUnique({
                            where: { id: payment.bookingId },
                            include: {
                                user: true,
                                campus: true,
                                pricing: true,
                                bike: true,
                            },
                        })
                        return { payment, booking, alreadyProcessed: true }
                    }

                    // Store gateway payment details from API
                    const paymentWithGatewayData = {
                        ...payment,
                        gatewayResponse: {
                            ...payment.gatewayResponse,
                            verification: {
                                razorpay_order_id,
                                razorpay_payment_id,
                                verifiedAt: new Date().toISOString(),
                                razorpayPaymentSnapshot: {
                                    id: razorpayPayment.id,
                                    status: razorpayPayment.status,
                                    amount: razorpayPayment.amount,
                                    currency: razorpayPayment.currency,
                                    method: razorpayPayment.method,
                                    order_id: razorpayPayment.order_id,
                                },
                            },
                        },
                    }

                    // Persist gateway snapshot before booking create (same transaction)
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            gatewayPaymentId: razorpay_payment_id,
                            paymentMethod: razorpayPayment.method || null,
                            gatewayResponse: paymentWithGatewayData.gatewayResponse,
                        },
                    })

                    const refreshed = await tx.payment.findUnique({ where: { id: payment.id } })
                    return createBookingForPaidPayment(tx, refreshed, razorpay_payment_id, 'verify')
                },
                { isolationLevel: 'Serializable' }
            )

            console.log('🔄 [verify] Transaction COMMIT')
            console.log('🔵 [verify] END | alreadyProcessed:', result.alreadyProcessed)
            return result
        } catch (error) {
            console.error('🔄 [verify] Transaction ROLLBACK:', error.message)
            lastError = error
            if (attempt < MAX_ATTEMPTS && (isSerializationError(error) || isUniqueConstraintError(error))) {
                console.warn('⚠️  [verify] Retrying after serialization/unique error...')
                continue
            }
            throw error
        }
    }

    throw lastError
}

/**
 * Mark payment failed (e.g. user closed checkout). Safe and idempotent.
 */
export const markPaymentFailed = async (razorpay_order_id, userId) => {
    const payment = await prisma.payment.findUnique({
        where: { gatewayOrderId: razorpay_order_id },
    })
    if (!payment) throw new ApiError(404, 'Payment order not found')
    if (payment.userId !== userId) throw new ApiError(403, 'Not authorized')

    if (payment.status === PAYMENT_STATUS.PAID) {
        return payment // already paid – do not downgrade
    }

    if (payment.status === PAYMENT_STATUS.FAILED) {
        return payment
    }

    console.log('⚠️  [markFailed] Payment', payment.id, '→ FAILED')
    return prisma.payment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_STATUS.FAILED },
    })
}

export const getPaymentById = async (paymentId, userId = null) => {
    const where = { id: paymentId }
    if (userId) where.userId = userId

    const payment = await prisma.payment.findUnique({
        where,
        include: {
            booking: {
                include: {
                    bike: { select: { id: true, registrationNumber: true, name: true } },
                    campus: true,
                },
            },
        },
    })
    if (!payment) throw new ApiError(404, 'Payment not found')
    return payment
}

export const getUserPayments = async (userId, query = {}) => {
    const { page = 1, limit = 10, status } = query
    const where = { userId }
    if (status) where.status = status

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        id: true,
                        bookingNumber: true,
                        status: true,
                        pickupAt: true,
                        returnAt: true,
                    },
                },
            },
        }),
        prisma.payment.count({ where }),
    ])

    return {
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

/**
 * Background reconciliation:
 * Finds payments that are PAID but have no booking yet (e.g. webhook arrived,
 * frontend verify never completed) and creates the booking.
 * Fully idempotent. Safe to run on a cron every 1–5 minutes.
 */
export const reconcilePaidPaymentsWithoutBooking = async () => {
    console.log('🟣 [reconcile] START')

    const orphanPayments = await prisma.payment.findMany({
        where: {
            status: PAYMENT_STATUS.PAID,
            bookingId: null,
        },
        orderBy: { createdAt: 'asc' },
        take: 20, // batch limit
    })

    console.log(`🟣 [reconcile] Found ${orphanPayments.length} PAID payment(s) without booking`)

    const results = []

    for (const payment of orphanPayments) {
        try {
            console.log(`🟣 [reconcile] Processing payment ${payment.id} | order: ${payment.gatewayOrderId}`)

            if (!payment.gatewayResponse?.intent) {
                console.warn(`⚠️  [reconcile] Skipping ${payment.id} – missing intent`)
                results.push({ paymentId: payment.id, status: 'skipped', reason: 'missing intent' })
                continue
            }

            const result = await prisma.$transaction(
                async (tx) => {
                    // Re-fetch inside transaction for race safety
                    const fresh = await tx.payment.findUnique({ where: { id: payment.id } })
                    if (!fresh) return null
                    if (fresh.bookingId) {
                        console.log(`♻️  [reconcile] Already linked by another process: ${fresh.bookingId}`)
                        return { alreadyProcessed: true, bookingId: fresh.bookingId }
                    }

                    const created = await createBookingForPaidPayment(
                        tx,
                        fresh,
                        fresh.gatewayPaymentId,
                        'reconcile'
                    )
                    return created
                },
                { isolationLevel: 'Serializable' }
            )

            if (result?.booking) {
                console.log(`✅ [reconcile] Booking created for payment ${payment.id} → ${result.booking.id}`)
                results.push({
                    paymentId: payment.id,
                    status: 'booked',
                    bookingId: result.booking.id,
                    alreadyProcessed: result.alreadyProcessed,
                })
            } else if (result?.alreadyProcessed) {
                results.push({
                    paymentId: payment.id,
                    status: 'already_linked',
                    bookingId: result.bookingId,
                })
            }
        } catch (err) {
            console.error(`❌ [reconcile] Failed for payment ${payment.id}:`, err.message)
            results.push({ paymentId: payment.id, status: 'error', error: err.message })
        }
    }

    console.log('🟣 [reconcile] END', { processed: results.length })
    return { processed: results.length, results }
}
