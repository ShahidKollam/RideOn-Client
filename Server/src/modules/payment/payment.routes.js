import express from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validation.middleware.js'
import { paymentRateLimit } from '../../middlewares/rateLimit.middleware.js'
import {
    createOrderController,
    verifyPaymentController,
    markPaymentFailedController,
    getPaymentController,
    getPaymentsController,
    webhookController,
} from './payment.controller.js'
import { createOrderSchema, verifyPaymentSchema, paymentQuerySchema } from './payment.validation.js'

const router = express.Router()

// Webhook – no auth, signature verified inside service
// Raw body is captured in app.js before JSON parser for this path
router.post('/webhook', webhookController)

// Authenticated user routes
router.post('/create-order', protect, paymentRateLimit, validate(createOrderSchema), createOrderController)
router.post('/verify', protect, paymentRateLimit, validate(verifyPaymentSchema), verifyPaymentController)
router.post('/mark-failed', protect, markPaymentFailedController)
router.get('/', protect, getPaymentsController)
router.get('/:id', protect, getPaymentController)

export default router
