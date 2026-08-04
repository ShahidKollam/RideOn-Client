import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { verifyWebhookSignature, fromPaise } from '../../lib/razorpay.js'
import { PAYMENT_STATUS, RAZORPAY_WEBHOOK_EVENTS } from './payment.constants.js'

/**
 * Process Razorpay webhook.
 * Must be called with the raw body string for signature verification.
 * Fully idempotent – never creates duplicate bookings or payments.
 */
export const processWebhook = async (rawBody, signature) => {
    if (!signature) {
        throw new ApiError(400, 'Missing webhook signature')
    }

    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
        throw new ApiError(400, 'Invalid webhook signature')
    }

    let payload
    try {
        payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch {
        throw new ApiError(400, 'Invalid webhook payload')
    }

    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity

    if (!paymentEntity) {
        // Acknowledge unknown/irrelevant events so Razorpay stops retrying
        return { processed: false, reason: 'No payment entity in payload' }
    }

    const gatewayOrderId = paymentEntity.order_id
    const gatewayPaymentId = paymentEntity.id

    if (!gatewayOrderId) {
        return { processed: false, reason: 'Missing order_id' }
    }

    const payment = await prisma.payment.findUnique({
        where: { gatewayOrderId },
        include: { booking: true },
    })

    if (!payment) {
        // Order may have been created outside this system – acknowledge
        return { processed: false, reason: 'Payment order not found in system' }
    }

    // Idempotency: already handled
    if (payment.status === PAYMENT_STATUS.PAID && payment.gatewayPaymentId) {
        return {
            processed: true,
            alreadyProcessed: true,
            paymentId: payment.id,
            bookingId: payment.bookingId,
        }
    }

    if (event === RAZORPAY_WEBHOOK_EVENTS.PAYMENT_CAPTURED || event === RAZORPAY_WEBHOOK_EVENTS.ORDER_PAID) {
        // Only update payment status / ids if still PENDING.
        // Booking creation is owned by the verify endpoint (frontend callback).
        // Webhook is a safety net for status reconciliation, not a second booking path.
        if (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.FAILED) {
            const updated = await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
                    status: PAYMENT_STATUS.PAID,
                    paidAt: payment.paidAt || new Date(),
                    paymentMethod: paymentEntity.method || null,
                    gatewayResponse: {
                        ...payment.gatewayResponse,
                        webhook: {
                            event,
                            paymentEntity,
                            receivedAt: new Date().toISOString(),
                        },
                    },
                },
            })

            return {
                processed: true,
                alreadyProcessed: false,
                paymentId: updated.id,
                bookingId: updated.bookingId,
                note: updated.bookingId
                    ? 'Payment confirmed, booking already linked'
                    : 'Payment marked PAID via webhook. Booking may still be pending frontend verify.',
            }
        }
    }

    if (event === RAZORPAY_WEBHOOK_EVENTS.PAYMENT_FAILED) {
        if (payment.status === PAYMENT_STATUS.PENDING) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: PAYMENT_STATUS.FAILED,
                    gatewayResponse: {
                        ...payment.gatewayResponse,
                        webhook: {
                            event,
                            paymentEntity,
                            receivedAt: new Date().toISOString(),
                        },
                    },
                },
            })
            return { processed: true, alreadyProcessed: false, paymentId: payment.id }
        }
    }

    return { processed: false, reason: `Unhandled or already settled event: ${event}` }
}
