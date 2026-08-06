import prisma from '../../config/prisma.js'
import ApiError from '../../utils/ApiError.js'
import { verifyWebhookSignature } from '../../lib/razorpay.js'
import { PAYMENT_STATUS, RAZORPAY_WEBHOOK_EVENTS } from './payment.constants.js'

/**
 * Process Razorpay webhook.
 * Must be called with the raw body string for signature verification.
 * Fully idempotent – never creates bookings. Only updates payment status.
 */
export const processWebhook = async (rawBody, signature) => {
    console.log('🟡 [webhook] START')

    if (!signature) {
        console.error('❌ [webhook] Missing signature')
        throw new ApiError(400, 'Missing webhook signature')
    }

    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
        console.error('❌ [webhook] Invalid signature')
        throw new ApiError(400, 'Invalid webhook signature')
    }
    console.log('✅ [webhook] Signature valid')

    let payload
    try {
        payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch {
        console.error('❌ [webhook] Invalid payload JSON')
        throw new ApiError(400, 'Invalid webhook payload')
    }

    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity
    console.log('🟡 [webhook] Event:', event)

    if (!paymentEntity) {
        console.warn('⚠️  [webhook] No payment entity – acknowledging')
        return { processed: false, reason: 'No payment entity in payload' }
    }

    const gatewayOrderId = paymentEntity.order_id
    const gatewayPaymentId = paymentEntity.id

    if (!gatewayOrderId) {
        console.warn('⚠️  [webhook] Missing order_id')
        return { processed: false, reason: 'Missing order_id' }
    }

    const payment = await prisma.payment.findUnique({
        where: { gatewayOrderId },
        include: { booking: true },
    })

    if (!payment) {
        console.warn('⚠️  [webhook] Payment not found in system:', gatewayOrderId)
        return { processed: false, reason: 'Payment order not found in system' }
    }

    console.log('💳 [webhook] Payment status before:', payment.status, '| bookingId:', payment.bookingId)

    // Idempotency: already fully handled
    if (payment.status === PAYMENT_STATUS.PAID && payment.gatewayPaymentId) {
        console.log('♻️  [webhook] Already processed')
        return {
            processed: true,
            alreadyProcessed: true,
            paymentId: payment.id,
            bookingId: payment.bookingId,
        }
    }

    if (event === RAZORPAY_WEBHOOK_EVENTS.PAYMENT_CAPTURED || event === RAZORPAY_WEBHOOK_EVENTS.ORDER_PAID) {
        // Only update payment status. Booking creation stays with verify / reconciliation.
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
                            executedFirst: !payment.gatewayResponse?.verification,
                        },
                    },
                },
            })

            console.log('💳 [webhook] Payment status after:', updated.status, '| bookingId:', updated.bookingId)
            console.log(
                updated.bookingId
                    ? 'ℹ️  [webhook] Booking already linked (verify ran first)'
                    : 'ℹ️  [webhook] Webhook executed first – booking will be created by verify or reconcile'
            )
            console.log('🟡 [webhook] END | processed')

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
            console.log('💳 [webhook] Payment marked FAILED')
            console.log('🟡 [webhook] END | failed event processed')
            return { processed: true, alreadyProcessed: false, paymentId: payment.id }
        }
    }

    console.log('🟡 [webhook] END | unhandled or already settled:', event)
    return { processed: false, reason: `Unhandled or already settled event: ${event}` }
}
