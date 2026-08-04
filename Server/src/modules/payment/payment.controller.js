import {
    createOrder,
    verifyPayment,
    markPaymentFailed,
    getPaymentById,
    getUserPayments,
} from './payment.service.js'
import { processWebhook } from './webhook.service.js'
import asyncHandler from '../../utils/asyncHandler.js'
import ApiResponse from '../../utils/ApiResponse.js'

/**
 * POST /payments/create-order
 * Body: { campusId, pickupAt, returnAt, notes? }
 */
export const createOrderController = asyncHandler(async (req, res) => {
    const { campusId, pickupAt, returnAt, notes } = req.body

    const order = await createOrder(
        { campusId, pickupAt, returnAt, notes },
        req.user.id
    )

    res.status(201).json(
        new ApiResponse(201, 'Order created successfully', order)
    )
})

/**
 * POST /payments/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPaymentController = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const result = await verifyPayment(
        { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        req.user.id
    )

    const message = result.alreadyProcessed
        ? 'Payment already verified'
        : 'Payment verified and booking created successfully'

    res.status(200).json(
        new ApiResponse(200, message, {
            payment: {
                id: result.payment.id,
                status: result.payment.status,
                amount: result.payment.amount,
                currency: result.payment.currency,
                gatewayOrderId: result.payment.gatewayOrderId,
                gatewayPaymentId: result.payment.gatewayPaymentId,
                paidAt: result.payment.paidAt,
            },
            booking: result.booking,
            alreadyProcessed: result.alreadyProcessed,
        })
    )
})

/**
 * POST /payments/mark-failed
 * Body: { razorpay_order_id }
 * Optional helper when user closes Razorpay without paying
 */
export const markPaymentFailedController = asyncHandler(async (req, res) => {
    const { razorpay_order_id } = req.body
    if (!razorpay_order_id) {
        return res.status(400).json(new ApiResponse(400, 'razorpay_order_id is required', null))
    }

    const payment = await markPaymentFailed(razorpay_order_id, req.user.id)

    res.status(200).json(
        new ApiResponse(200, 'Payment marked as failed', {
            id: payment.id,
            status: payment.status,
            gatewayOrderId: payment.gatewayOrderId,
        })
    )
})

/**
 * GET /payments/:id
 */
export const getPaymentController = asyncHandler(async (req, res) => {
    const payment = await getPaymentById(req.params.id, req.user.id)
    res.status(200).json(new ApiResponse(200, 'Payment retrieved successfully', payment))
})

/**
 * GET /payments
 */
export const getPaymentsController = asyncHandler(async (req, res) => {
    const result = await getUserPayments(req.user.id, req.query)
    res.status(200).json(new ApiResponse(200, 'Payments retrieved successfully', result))
})

/**
 * POST /payments/webhook
 * Raw body required for signature verification.
 * No auth – secured by Razorpay webhook signature.
 */
export const webhookController = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature']
    // Prefer raw body (must be configured in Express with express.raw or similar for this route)
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))

    const result = await processWebhook(rawBody, signature)

    // Always return 200 to Razorpay once signature is valid / processed
    res.status(200).json({ success: true, ...result })
})
