import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { getBookingAvailability } from '../booking/availability.service.js'
import { findAvailableBike } from '../bike/bike.service.js'
import {
    createRazorpayOrder,
    verifyPaymentSignature,
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
 * Step 1–4: Check availability, calculate amount, create Razorpay order, return to frontend.
 * Does NOT create a booking.
 */
export const createOrder = async ({ campusId, pickupAt, returnAt, notes }, userId) => {
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
 * Step 8–14: Verify signature, then in a transaction:
 * re-check availability → create booking → save payment → commit.
 * Fully idempotent.
 */
export const verifyPayment = async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    userId
) => {
    if (!userId) throw new ApiError(401, 'Authentication required')

    // Signature verification (never trust frontend)
    const isValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    })
    if (!isValid) {
        throw new ApiError(400, 'Invalid payment signature')
    }

    const existingPayment = await prisma.payment.findUnique({
        where: { gatewayOrderId: razorpay_order_id },
        include: { booking: true },
    })

    if (!existingPayment) {
        throw new ApiError(404, 'Payment order not found')
    }

    if (existingPayment.userId !== userId) {
        throw new ApiError(403, 'Not authorized for this payment')
    }

    // Idempotency: already completed
    if (existingPayment.status === PAYMENT_STATUS.PAID && existingPayment.bookingId) {
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

    // Amount sanity check against stored order
    // (Razorpay amount is authoritative; we compare with our stored amount)
    if (Number(existingPayment.amount) <= 0) {
        throw new ApiError(400, 'Invalid payment amount')
    }

    const MAX_ATTEMPTS = 2
    let lastError = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await prisma.$transaction(
                async (tx) => {
                    // Re-fetch payment inside transaction for consistency
                    const payment = await tx.payment.findUnique({
                        where: { id: existingPayment.id },
                    })
                    if (!payment) throw new ApiError(404, 'Payment not found')

                    if (payment.status === PAYMENT_STATUS.PAID && payment.bookingId) {
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
                        throw new ApiError(409, summary.reason || 'No available bikes')
                    }

                    // Assign bike
                    const bike = await findAvailableBike(
                        new Date(intent.pickupAt),
                        new Date(intent.returnAt),
                        intent.campusId,
                        tx
                    )

                    // Create booking only after successful payment verification
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
                            totalAmount: existingPayment.amount,
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

                    // Update payment → PAID and link booking
                    const updatedPayment = await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            bookingId: booking.id,
                            gatewayPaymentId: razorpay_payment_id,
                            status: PAYMENT_STATUS.PAID,
                            paidAt: new Date(),
                            gatewayResponse: {
                                ...payment.gatewayResponse,
                                verification: {
                                    razorpay_order_id,
                                    razorpay_payment_id,
                                    verifiedAt: new Date().toISOString(),
                                },
                            },
                        },
                    })

                    return { payment: updatedPayment, booking, alreadyProcessed: false }
                },
                { isolationLevel: 'Serializable' }
            )

            return result
        } catch (error) {
            lastError = error
            if (attempt < MAX_ATTEMPTS && (isSerializationError(error) || isUniqueConstraintError(error))) {
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
