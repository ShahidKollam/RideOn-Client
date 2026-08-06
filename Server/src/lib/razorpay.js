import Razorpay from 'razorpay'
import crypto from 'crypto'
import ApiError from '../utils/ApiError.js'

let razorpayInstance = null

export const getRazorpay = () => {
    if (razorpayInstance) return razorpayInstance

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
        throw new ApiError(500, 'Razorpay credentials are not configured')
    }

    razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    })

    return razorpayInstance
}

/**
 * Amount must be in paise (smallest currency unit)
 */
export const createRazorpayOrder = async ({ amountInPaise, currency = 'INR', receipt, notes = {} }) => {
    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes,
    })

    return order
}

/**
 * Fetch payment details from Razorpay (GET /v1/payments/{payment_id})
 */
export const fetchRazorpayPayment = async (paymentId) => {
    const razorpay = getRazorpay()
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
}

/**
 * Verify payment signature from frontend checkout callback
 */
export const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
        throw new ApiError(500, 'Razorpay credentials are not configured')
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex')

    return expectedSignature === razorpay_signature
}

/**
 * Verify webhook signature
 * Raw body string is required
 */
export const verifyWebhookSignature = (rawBody, signature) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
        throw new ApiError(500, 'Razorpay webhook secret is not configured')
    }

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
    return expectedSignature === signature
}

export const toPaise = (amountInRupees) => Math.round(Number(amountInRupees) * 100)

export const fromPaise = (amountInPaise) => Number((Number(amountInPaise) / 100).toFixed(2))
