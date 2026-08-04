import express from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validation.middleware.js'
import {
    createOrderController,
    verifyPaymentController,
    markPaymentFailedController,
    getPaymentController,
    getPaymentsController,
    webhookController,
} from './payment.controller.js'
import {
    createOrderSchema,
    verifyPaymentSchema,
    paymentQuerySchema,
} from './payment.validation.js'

const router = express.Router()

// Webhook – no auth, signature verified inside service
// IMPORTANT: mount this route with raw body parser in app.js
router.post('/webhook', webhookController)

// Authenticated user routes
router.post('/create-order', protect, validate(createOrderSchema), createOrderController)
router.post('/verify', protect, validate(verifyPaymentSchema), verifyPaymentController) 
router.post('/mark-failed', protect, markPaymentFailedController)
router.get('/', protect, getPaymentsController)
router.get('/:id', protect, getPaymentController)

export default router
