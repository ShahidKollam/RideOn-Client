generator client {provider = "prisma-client-js"}

datasource db {provider = "postgresql"url      = env("DATABASE_URL")}

model User {id                   String           @id @default(cuid())email                String           @uniquename                 StringstudentId            String?hostel               String?department           String?yearOfStudy          Int?drivingLicenseNumber String?          @uniquephone                String?campusId             Stringcampus               Campus           @relation(fields: [campusId], references: [id])drivingLicense       DrivingLicense?isVerified           Boolean          @default(false)acceptedTerms        Boolean          @default(false)acceptedTermsAt      DateTime?onboardingStatus     OnboardingStatus @default(SIGNED_UP)refreshTokens        RefreshToken[]createdAt            DateTime         @default(now())updatedAt            DateTime         @updatedAtmagicLinkTokens      MagicLinkToken[]bookings             Booking[]payments             Payment[]

@@map("users")}

enum OnboardingStatus {SIGNED_UPEMAIL_VERIFIEDPROFILE_COMPLETED}

model RefreshToken {id        String   @id @default(cuid())token     String   @uniqueuserId    Stringuser      User     @relation(fields: [userId], references: [id], onDelete: Cascade)expiresAt DateTimecreatedAt DateTime @default(now())

@@map("refresh_tokens")}

model Campus {id        String    @id @default(cuid())name      Stringlocation  StringisActive  Boolean   @default(true)createdAt DateTime  @default(now())updatedAt DateTime  @updatedAtusers     User[]bikes     Bike[]pricings  Pricing[]bookings  Booking[]

@@map("campuses")}

model DrivingLicense {id            String        @id @default(cuid())userId        String        @uniqueuser          User          @relation(fields: [userId], references: [id], onDelete: Cascade)licenseNumber String        @uniquefullName      StringdateOfBirth   DateTimeexpiryDate    DateTimeissuingDate   DateTimestatus        LicenseStatus @default(PENDING)documentUrl   String?createdAt     DateTime      @default(now())updatedAt     DateTime      @updatedAt

@@map("driving_licenses")}

enum LicenseStatus {PENDINGAPPROVEDREJECTED}

model MagicLinkToken {id        String    @id @default(cuid())tokenHash String    @uniqueuserId    Stringuser      User      @relation(fields: [userId], references: [id], onDelete: Cascade)expiresAt DateTimeusedAt    DateTime?createdAt DateTime  @default(now())

@@map("magic_link_tokens")}

// ==================== NEW MODELS ====================

model Bike {id                 String     @id @default(cuid())campusId           StringregistrationNumber String     @uniquename               Stringbrand              Stringmodel              Stringyear               Int?color              String?imageUrls          String[]currentOdometer    Int        @default(0)status             BikeStatus @default(AVAILABLE)isActive           Boolean    @default(true)createdAt          DateTime   @default(now())updatedAt          DateTime   @updatedAt

campus   Campus    @relation(fields: [campusId], references: [id])bookings Booking[]

@@index([campusId])@@index([status])@@index([isActive])@@map("bikes")}

enum BikeStatus {AVAILABLEMAINTENANCEDISABLEDRETIRED}

model Pricing {id            String   @id @default(cuid())campusId      StringpackageName   StringdurationHours Intprice         FloatincludedKm    IntextraKmRate   FloatdepositAmount FloatdisplayOrder  Int      @default(0)isFeatured    Boolean  @default(false)isActive      Boolean  @default(true)createdAt     DateTime @default(now())updatedAt     DateTime @updatedAt

campus   Campus    @relation(fields: [campusId], references: [id])bookings Booking[]

@@index([campusId])@@index([displayOrder])@@index([isActive])@@map("pricings")}

model Booking {id             String        @id @default(cuid())bookingNumber  String        @uniqueuserId         StringbikeId         String?campusId       StringpricingId      StringpickupAt       DateTimereturnAt       DateTimedurationHours  Intstatus         BookingStatus @default(PAYMENT_PENDING)paymentStatus  PaymentStatus @default(PENDING)baseAmount     FloatdepositAmount  FloatdiscountAmount Float         @default(0)totalAmount    FloatincludedKm     IntextraKmRate    FloatpickupOdometer Int?returnOdometer Int?actualKm       Int?extraKm        Int?extraKmCharge  Float?lateFee        Float?pickedUpAt     DateTime?returnedAt     DateTime?notes          String?

createdAt DateTime @default(now())updatedAt DateTime @updatedAt

user    User     @relation(fields: [userId], references: [id])bike    Bike?    @relation(fields: [bikeId], references: [id])campus  Campus   @relation(fields: [campusId], references: [id])pricing Pricing  @relation(fields: [pricingId], references: [id])payment Payment?

@@index([bookingNumber])@@index([userId])@@index([bikeId])@@index([campusId])@@index([pricingId])@@index([status])@@index([pickupAt])@@index([returnAt])@@map("bookings")}

enum BookingStatus {PAYMENT_PENDINGCONFIRMEDACTIVECOMPLETEDCANCELLEDFAILEDNO_SHOW}

enum PaymentStatus {PENDINGPAIDFAILEDREFUNDEDPARTIALLY_REFUNDED}

model SystemSetting {id String @id @default(cuid())

gstEnabled Boolean @default(true)gstRate    Float   @default(18)

platformFeeEnabled Boolean @default(true)platformFee        Float   @default(20)

createdAt DateTime @default(now())updatedAt DateTime @updatedAt

@@map("system_settings")}

model Payment {id               String        @id @default(cuid())userId           StringbookingId        String?       @uniquegateway          String        @default("RAZORPAY")gatewayOrderId   String        @uniquegatewayPaymentId String?amount           Floatcurrency         String        @default("INR")status           PaymentStatus @default(PENDING)paymentMethod    String?gatewayResponse  Json?paidAt           DateTime?createdAt        DateTime      @default(now())updatedAt        DateTime      @updatedAt

user    User     @relation(fields: [userId], references: [id])booking Booking? @relation(fields: [bookingId], references: [id])

@@index([userId])@@index([gatewayOrderId])@@index([gatewayPaymentId])@@index([status])@@map("payments")}# Payment Module – Integration Guide

1. Environment variables

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

2. Install dependency

npm install razorpay

3. Prisma

npx prisma migrate dev --name add_payment
npx prisma generate

4. Mount routes (app.js / routes index)

import paymentRoutes from './modules/payment/payment.routes.js'

// Webhook needs raw body for signature verification
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body.toString('utf8')
    try {
      req.body = JSON.parse(req.rawBody)
    } catch {
      req.body = {}
    }
    next()
  },
  paymentRoutes
)

// Other payment routes (JSON body)
app.use('/api/payments', paymentRoutes)

If the above double-mount is awkward, split webhook into its own router file.

5. API Contract (Frontend)

POST /api/payments/create-order

Auth: requiredBody:

{
  "campusId": "string",
  "pickupAt": "2026-08-10T10:00:00.000Z",
  "returnAt": "2026-08-10T16:00:00.000Z",
  "notes": "optional string"
}

Response data:

{
  "paymentId": "string",
  "orderId": "order_xxxxx",
  "amount": 450,
  "amountInPaise": 45000,
  "currency": "INR",
  "keyId": "rzp_test_xxxxx",
  "pricing": {
    "id": "string",
    "packageName": "6 Hours",
    "durationHours": 6,
    "baseAmount": 400,
    "platformFee": 20,
    "gstAmount": 30,
    "depositAmount": 0,
    "totalAmount": 450,
    "includedKm": 50,
    "extraKmRate": 5
  }
}

Frontend Razorpay Checkout

const options = {
  key: data.keyId,
  amount: data.amountInPaise,
  currency: data.currency,
  order_id: data.orderId,
  name: 'Campus Bikes',
  handler: async function (response) {
    // response contains: razorpay_order_id, razorpay_payment_id, razorpay_signature
    await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    })
  },
}
const rzp = new Razorpay(options)
rzp.open()

POST /api/payments/verify

Auth: requiredBody:

{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxx"
}

Response data:

{
  "payment": {
    "id": "string",
    "status": "PAID",
    "amount": 450,
    "currency": "INR",
    "gatewayOrderId": "order_xxxxx",
    "gatewayPaymentId": "pay_xxxxx",
    "paidAt": "ISO date"
  },
  "booking": { /* full booking object with bike, campus, pricing */ },
  "alreadyProcessed": false
}

POST /api/payments/mark-failed (optional)

Body: { "razorpay_order_id": "order_xxxxx" }

POST /api/payments/webhook

No auth. Secured by x-razorpay-signature header.Configure in Razorpay Dashboard → Webhooks → URL = https://yourdomain/api/payments/webhook

GET /api/payments

List current user payments (paginated).

GET /api/payments/

Single payment (owner only).

6. Important design notes

Booking is created only after successful signature verification (not at order creation).

Payment status and Booking status are independent.

All money amounts are calculated on the backend. Frontend only displays.

Verify endpoint is idempotent – safe to call multiple times.

Webhook is a safety net; primary path is frontend verify callback.

Existing POST /bookings can still be used for admin / cash flows if needed.export const PAYMENT_GATEWAY = {RAZORPAY: 'RAZORPAY',}

export const PAYMENT_STATUS = {PENDING: 'PENDING',PAID: 'PAID',FAILED: 'FAILED',REFUNDED: 'REFUNDED',PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',}

export const CURRENCY = {INR: 'INR',}

export const RAZORPAY_WEBHOOK_EVENTS = {PAYMENT_CAPTURED: 'payment.captured',PAYMENT_FAILED: 'payment.failed',ORDER_PAID: 'order.paid',}import {createOrder,verifyPayment,markPaymentFailed,getPaymentById,getUserPayments,} from './payment.service.js'import { processWebhook } from './webhook.service.js'import asyncHandler from '../../utils/asyncHandler.js'import ApiResponse from '../../utils/ApiResponse.js'

/**

POST /payments/create-order

Body: { campusId, pickupAt, returnAt, notes? }*/export const createOrderController = asyncHandler(async (req, res) => {const { campusId, pickupAt, returnAt, notes } = req.body

const order = await createOrder({ campusId, pickupAt, returnAt, notes },req.user.id)

res.status(201).json(new ApiResponse(201, 'Order created successfully', order))})

/**

POST /payments/verify

Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }*/export const verifyPaymentController = asyncHandler(async (req, res) => {const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

const result = await verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature },req.user.id)

const message = result.alreadyProcessed? 'Payment already verified': 'Payment verified and booking created successfully'

res.status(200).json(new ApiResponse(200, message, {payment: {id: result.payment.id,status: result.payment.status,amount: result.payment.amount,currency: result.payment.currency,gatewayOrderId: result.payment.gatewayOrderId,gatewayPaymentId: result.payment.gatewayPaymentId,paidAt: result.payment.paidAt,},booking: result.booking,alreadyProcessed: result.alreadyProcessed,}))})

/**

POST /payments/mark-failed

Body: { razorpay_order_id }

Optional helper when user closes Razorpay without paying*/export const markPaymentFailedController = asyncHandler(async (req, res) => {const { razorpay_order_id } = req.bodyif (!razorpay_order_id) {return res.status(400).json(new ApiResponse(400, 'razorpay_order_id is required', null))}

const payment = await markPaymentFailed(razorpay_order_id, req.user.id)

res.status(200).json(new ApiResponse(200, 'Payment marked as failed', {id: payment.id,status: payment.status,gatewayOrderId: payment.gatewayOrderId,}))})

/**

GET /payments/*/export const getPaymentController = asyncHandler(async (req, res) => {const payment = await getPaymentById(req.params.id, req.user.id)res.status(200).json(new ApiResponse(200, 'Payment retrieved successfully', payment))})

/**

GET /payments*/export const getPaymentsController = asyncHandler(async (req, res) => {const result = await getUserPayments(req.user.id, req.query)res.status(200).json(new ApiResponse(200, 'Payments retrieved successfully', result))})

/**

POST /payments/webhook

Raw body required for signature verification.

No auth – secured by Razorpay webhook signature.*/export const webhookController = asyncHandler(async (req, res) => {const signature = req.headers['x-razorpay-signature']// Prefer raw body (must be configured in Express with express.raw or similar for this route)const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))

const result = await processWebhook(rawBody, signature)

// Always return 200 to Razorpay once signature is valid / processedres.status(200).json({ success: true, ...result })})import express from 'express'import { protect } from '../../middlewares/auth.middleware.js'import { validate } from '../../middlewares/validation.middleware.js'import {createOrderController,verifyPaymentController,markPaymentFailedController,getPaymentController,getPaymentsController,webhookController,} from './payment.controller.js'import {createOrderSchema,verifyPaymentSchema,paymentQuerySchema,} from './payment.validation.js'

const router = express.Router()

// Webhook – no auth, signature verified inside service// IMPORTANT: mount this route with raw body parser in app.jsrouter.post('/webhook', webhookController)

// Authenticated user routesrouter.post('/create-order', protect, validate(createOrderSchema), createOrderController)router.post('/verify', protect, validate(verifyPaymentSchema), verifyPaymentController)router.post('/mark-failed', protect, markPaymentFailedController)router.get('/', protect, getPaymentsController)

router.get('/:id', protect, getPaymentController)

export default routerimport prisma from '../../config/prisma.js'import ApiError from '../../utils/ApiError.js'import { getBookingAvailability } from '../booking/availability.service.js'import { findAvailableBike } from '../bike/bike.service.js'import {createRazorpayOrder,verifyPaymentSignature,toPaise,fromPaise,} from '../../lib/razorpay.js'import { PAYMENT_GATEWAY, PAYMENT_STATUS, CURRENCY } from './payment.constants.js'

const generateBookingNumber = () => {const year = new Date().getFullYear()const random = Math.floor(100000 + Math.random() * 900000)return BK${year}${random.toString().padStart(6, '0')}}

const isSerializationError = (error) =>error?.code === 'P2034' || error?.message?.toLowerCase?.().includes('serialization')

const isUniqueConstraintError = (error) => error?.code === 'P2002'

/**

Step 1–4: Check availability, calculate amount, create Razorpay order, return to frontend.

Does NOT create a booking.*/export const createOrder = async ({ campusId, pickupAt, returnAt, notes }, userId) => {if (!userId) throw new ApiError(401, 'Authentication required')

const user = await prisma.user.findUnique({where: { id: userId },include: { drivingLicense: true },})if (!user) throw new ApiError(404, 'User not found')if (!user.isVerified) throw new ApiError(400, 'User email not verified')if (user.onboardingStatus !== 'PROFILE_COMPLETED') {throw new ApiError(400, 'Complete your profile before booking')}

const activeBooking = await prisma.booking.findFirst({where: {userId,status: { in: ['CONFIRMED', 'ACTIVE'] },},})if (activeBooking) throw new ApiError(400, 'User has an active booking')

// Availability + pricing (source of truth on backend)const summary = await getBookingAvailability({ campusId, pickupAt, returnAt })if (!summary.available) {throw new ApiError(409, summary.reason || 'No available bikes for the selected time')}

const amount = summary.totalAmountconst amountInPaise = toPaise(amount)

// Create Razorpay order. Intent is stored in notes (not duplicated as booking fields).const receipt = rcpt_${Date.now()}_${userId.slice(-6)}const razorpayOrder = await createRazorpayOrder({amountInPaise,currency: CURRENCY.INR,receipt,notes: {userId,campusId,pickupAt,returnAt,notes: notes || '',durationHours: String(summary.durationHours),pricingId: summary.pricing.id,baseAmount: String(summary.baseAmount),depositAmount: String(summary.depositAmount),platformFee: String(summary.platformFee ?? 0),gstAmount: String(summary.gstAmount ?? 0),totalAmount: String(amount),includedKm: String(summary.includedKm),extraKmRate: String(summary.extraKmRate),},})

// Persist pending payment (bookingId still null until verification succeeds)const payment = await prisma.payment.create({data: {userId,gateway: PAYMENT_GATEWAY.RAZORPAY,gatewayOrderId: razorpayOrder.id,amount,currency: CURRENCY.INR,status: PAYMENT_STATUS.PENDING,gatewayResponse: {razorpayOrder,intent: {campusId,pickupAt,returnAt,notes: notes || null,durationHours: summary.durationHours,pricingId: summary.pricing.id,baseAmount: summary.baseAmount,depositAmount: summary.depositAmount,platformFee: summary.platformFee ?? 0,gstAmount: summary.gstAmount ?? 0,includedKm: summary.includedKm,extraKmRate: summary.extraKmRate,},},},})

return {paymentId: payment.id,orderId: razorpayOrder.id,amount,amountInPaise,currency: CURRENCY.INR,keyId: process.env.RAZORPAY_KEY_ID,// Pricing breakdown for UI display only (backend remains source of truth)pricing: {id: summary.pricing.id,packageName: summary.pricing.packageName,durationHours: summary.durationHours,baseAmount: summary.baseAmount,platformFee: summary.platformFee ?? 0,gstAmount: summary.gstAmount ?? 0,depositAmount: summary.depositAmount,totalAmount: amount,includedKm: summary.includedKm,extraKmRate: summary.extraKmRate,},}}

/**

Step 8–14: Verify signature, then in a transaction:

re-check availability → create booking → save payment → commit.

Fully idempotent.*/export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature },userId) => {if (!userId) throw new ApiError(401, 'Authentication required')

// Signature verification (never trust frontend)const isValid = verifyPaymentSignature({razorpay_order_id,razorpay_payment_id,razorpay_signature,})if (!isValid) {throw new ApiError(400, 'Invalid payment signature')}

const existingPayment = await prisma.payment.findUnique({where: { gatewayOrderId: razorpay_order_id },include: { booking: true },})

if (!existingPayment) {throw new ApiError(404, 'Payment order not found')}

if (existingPayment.userId !== userId) {throw new ApiError(403, 'Not authorized for this payment')}

// Idempotency: already completedif (existingPayment.status === PAYMENT_STATUS.PAID && existingPayment.bookingId) {return {payment: existingPayment,booking: existingPayment.booking,alreadyProcessed: true,}}

const intent = existingPayment.gatewayResponse?.intentif (!intent) {throw new ApiError(400, 'Payment intent data missing')}

// Amount sanity check against stored order// (Razorpay amount is authoritative; we compare with our stored amount)if (Number(existingPayment.amount) <= 0) {throw new ApiError(400, 'Invalid payment amount')}

const MAX_ATTEMPTS = 2let lastError = null

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {try {const result = await prisma.$transaction(async (tx) => {// Re-fetch payment inside transaction for consistencyconst payment = await tx.payment.findUnique({where: { id: existingPayment.id },})if (!payment) throw new ApiError(404, 'Payment not found')

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

throw lastError}

/**

Mark payment failed (e.g. user closed checkout). Safe and idempotent.*/export const markPaymentFailed = async (razorpay_order_id, userId) => {const payment = await prisma.payment.findUnique({where: { gatewayOrderId: razorpay_order_id },})if (!payment) throw new ApiError(404, 'Payment order not found')if (payment.userId !== userId) throw new ApiError(403, 'Not authorized')

if (payment.status === PAYMENT_STATUS.PAID) {return payment // already paid – do not downgrade}

if (payment.status === PAYMENT_STATUS.FAILED) {return payment}

return prisma.payment.update({where: { id: payment.id },data: { status: PAYMENT_STATUS.FAILED },})}

export const getPaymentById = async (paymentId, userId = null) => {const where = { id: paymentId }if (userId) where.userId = userId

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

export const getUserPayments = async (userId, query = {}) => {const { page = 1, limit = 10, status } = queryconst where = { userId }if (status) where.status = status

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

}import { z } from 'zod'

export const createOrderSchema = z.object({campusId: z.string().min(1, 'Campus ID is required'),pickupAt: z.string().datetime({ message: 'pickupAt must be a valid ISO datetime' }),returnAt: z.string().datetime({ message: 'returnAt must be a valid ISO datetime' }),notes: z.string().max(500).optional(),})

export const verifyPaymentSchema = z.object({razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),razorpay_signature: z.string().min(1, 'razorpay_signature is required'),})

export const paymentQuerySchema = z.object({page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),})import prisma from '../../config/prisma.js'import ApiError from '../../utils/ApiError.js'import { verifyWebhookSignature, fromPaise } from '../../lib/razorpay.js'import { PAYMENT_STATUS, RAZORPAY_WEBHOOK_EVENTS } from './payment.constants.js'

/**

Process Razorpay webhook.

Must be called with the raw body string for signature verification.

Fully idempotent – never creates duplicate bookings or payments.*/export const processWebhook = async (rawBody, signature) => {if (!signature) {throw new ApiError(400, 'Missing webhook signature')}

const isValid = verifyWebhookSignature(rawBody, signature)if (!isValid) {throw new ApiError(400, 'Invalid webhook signature')}

let payloadtry {payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody} catch {throw new ApiError(400, 'Invalid webhook payload')}

const event = payload.eventconst paymentEntity = payload.payload?.payment?.entity

if (!paymentEntity) {// Acknowledge unknown/irrelevant events so Razorpay stops retryingreturn { processed: false, reason: 'No payment entity in payload' }}

const gatewayOrderId = paymentEntity.order_idconst gatewayPaymentId = paymentEntity.id

if (!gatewayOrderId) {return { processed: false, reason: 'Missing order_id' }}

const payment = await prisma.payment.findUnique({where: { gatewayOrderId },include: { booking: true },})

if (!payment) {// Order may have been created outside this system – acknowledgereturn { processed: false, reason: 'Payment order not found in system' }}

// Idempotency: already handledif (payment.status === PAYMENT_STATUS.PAID && payment.gatewayPaymentId) {return {processed: true,alreadyProcessed: true,paymentId: payment.id,bookingId: payment.bookingId,}}

if (event === RAZORPAY_WEBHOOK_EVENTS.PAYMENT_CAPTURED || event === RAZORPAY_WEBHOOK_EVENTS.ORDER_PAID) {// Only update payment status / ids if still PENDING.// Booking creation is owned by the verify endpoint (frontend callback).// Webhook is a safety net for status reconciliation, not a second booking path.if (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.FAILED) {const updated = await prisma.payment.update({where: { id: payment.id },data: {gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,status: PAYMENT_STATUS.PAID,paidAt: payment.paidAt || new Date(),paymentMethod: paymentEntity.method || null,gatewayResponse: {...payment.gatewayResponse,webhook: {event,paymentEntity,receivedAt: new Date().toISOString(),},},},})

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

if (event === RAZORPAY_WEBHOOK_EVENTS.PAYMENT_FAILED) {if (payment.status === PAYMENT_STATUS.PENDING) {await prisma.payment.update({where: { id: payment.id },data: {status: PAYMENT_STATUS.FAILED,gatewayResponse: {...payment.gatewayResponse,webhook: {event,paymentEntity,receivedAt: new Date().toISOString(),},},},})return { processed: true, alreadyProcessed: false, paymentId: payment.id }}}

return { processed: false, reason: Unhandled or already settled event: ${event} }}

import { useEffect, useMemo, useState } from 'react'

import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Clock3, FileText, Info, MapPin, Search, Settings2, ShieldCheck, X } from 'lucide-react'

import { Link, useNavigate } from 'react-router-dom'



import BookingSummary from '@/components/bookings/BookingSummary'

import { Button } from '@/components/ui/button'

import { ErrorState, SkeletonCard } from '@/components/ui/PageStates'

import { useAuth } from '@/context/AuthContext'

import { useToast } from '@/context/ToastContext'

import { getApiErrorMessage } from '@/lib/apiClient'

import { checkAvailability } from '@/services/bookingService'

import { createPaymentOrder, markPaymentFailed, verifyPayment } from '@/services/paymentService'

import { getVehicles } from '@/services/vehicleService'



const toDateInput = (date) => {

    const offset = date.getTimezoneOffset() * 60000

    return new Date(date - offset).toISOString().slice(0, 10)

}



const toTimeInput = (date) => date.toTimeString().slice(0, 5)

const combineDateAndTime = (date, time) => date && time ? new Date(`${date}T${time}`) : null

const money = (value) => value === undefined || value === null ? '\u2014' : `\u20B9${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`



const loadRazorpayCheckout = () => new Promise((resolve) => {

    if (window.Razorpay) return resolve(true)

    const existingScript = document.querySelector('script[data-rideon-razorpay]')

    if (existingScript) {

        existingScript.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true })

        existingScript.addEventListener('error', () => resolve(false), { once: true })

        return

    }

    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'

    script.async = true

    script.dataset.rideonRazorpay = 'true'

    script.onload = () => resolve(Boolean(window.Razorpay))

    script.onerror = () => resolve(false)

    document.body.appendChild(script)

})



function TimeField({ label, date, time, minDate, minTime, onDateChange, onTimeChange }) {

    return (

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

            <label className="flex h-[53px] overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-rideon-dark">

                <span className="flex w-[84px] shrink-0 items-center border-r border-slate-200 px-4 font-semibold">{label}</span>

                <span className="relative flex min-w-0 flex-1 items-center">

                    <CalendarDays className="pointer-events-none absolute left-4 size-[18px] text-rideon-blue" />

                    <input aria-label={`${label} date`} required type="date" min={minDate} value={date} onChange={(event) => onDateChange(event.target.value)} className="h-full w-full appearance-none bg-transparent pr-3 pl-11 text-sm font-medium outline-none" />

                </span>

            </label>

            <label className="relative flex h-[53px] overflow-hidden rounded-lg border border-slate-200 bg-white text-sm text-rideon-dark">

                <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-rideon-blue" />

                <input aria-label={`${label} time`} required type="time" min={minTime} value={time} onChange={(event) => onTimeChange(event.target.value)} className="h-full w-full appearance-none bg-transparent px-11 text-sm font-medium outline-none" />

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-rideon-dark" />

            </label>

        </div>

    )

}



export default function BookingPage() {

    const navigate = useNavigate()

    const { isAuthenticated, user } = useAuth()

    const { showToast } = useToast()

    const [vehicle, setVehicle] = useState(null)

    const [error, setError] = useState('')

    const [dateError, setDateError] = useState('')

    const [submitting, setSubmitting] = useState(false)

    const [availability, setAvailability] = useState(null)

    const initialPickup = useMemo(() => {

        const value = new Date()

        value.setMinutes(0, 0, 0)

        value.setHours(value.getHours() + 1)

        return { date: toDateInput(value), time: toTimeInput(value) }

    }, [])

    const [values, setValues] = useState({ pickupDate: initialPickup.date, pickupTime: initialPickup.time, returnDate: toDateInput(new Date()), returnTime: '' })

    const [summaryOpen, setSummaryOpen] = useState(false)



    useEffect(() => {

        getVehicles({ isActive: true, limit: 1 }).then((data) => {

            const representativeVehicle = data?.bikes?.[0]

            if (!representativeVehicle) throw new Error('No active vehicle available')

            setVehicle(representativeVehicle)

        }).catch((requestError) => setError(getApiErrorMessage(requestError, 'We could not load the vehicle for booking.')))

    }, [])



    const pickupAt = combineDateAndTime(values.pickupDate, values.pickupTime)

    const returnAt = combineDateAndTime(values.returnDate, values.returnTime)

    const updateValue = (field, value) => {

        setAvailability(null)

        setDateError('')

        setValues((current) => ({ ...current, [field]: value }))

    }



    const checkBookingAvailability = async (event) => {

        event.preventDefault()

        if (!pickupAt || !returnAt || returnAt <= pickupAt) {

            setDateError('Return date and time must be after the pickup date and time.')

            return

        }

        if (!isAuthenticated) {

            navigate('/auth/login', { state: { from: '/booking' } })

            return

        }



        setSubmitting(true)

        try {

            const summary = await checkAvailability({ campusId: vehicle.campusId, pickupAt: pickupAt.toISOString(), returnAt: returnAt.toISOString() })

            setAvailability(summary)

            if (!summary.available) showToast({ type: 'error', title: 'Bike unavailable', description: summary.reason || 'Choose another time.' })

        } catch (requestError) {

            showToast({ type: 'error', title: 'Could not check availability', description: getApiErrorMessage(requestError) })

        } finally {

            setSubmitting(false)

        }

    }



    const submitBooking = async () => {

        if (!availability?.available) return

        setSubmitting(true)

        try {

            const order = await createPaymentOrder({ campusId: vehicle.campusId, pickupAt: pickupAt.toISOString(), returnAt: returnAt.toISOString() })

            const checkoutLoaded = await loadRazorpayCheckout()

            if (!checkoutLoaded) throw new Error('Razorpay Checkout could not be loaded. Please try again.')



            let paymentFlowEnded = false

            const failPayment = (message) => {

                if (paymentFlowEnded) return

                paymentFlowEnded = true

                markPaymentFailed(order.orderId).catch(() => {})

                navigate('/payment-failed', { state: { message } })

            }



            const checkout = new window.Razorpay({

                key: order.keyId,

                amount: order.amountInPaise,

                currency: order.currency,

                name: 'RideOn',

                description: 'Bike rental booking',

                order_id: order.orderId,

                prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },

                theme: { color: '#0764f5' },

                handler: async (response) => {

                    setSubmitting(true)

                    try {

                        const result = await verifyPayment({

                            razorpay_order_id: response.razorpay_order_id,

                            razorpay_payment_id: response.razorpay_payment_id,

                            razorpay_signature: response.razorpay_signature,

                        })

                        paymentFlowEnded = true

                        navigate(`/booking-success/${result.booking.id}`, { state: { booking: result.booking, payment: result.payment } })

                    } catch (requestError) {

                        failPayment(getApiErrorMessage(requestError, 'Payment verification failed. Please contact support if money was deducted.'))

                    } finally {

                        setSubmitting(false)

                    }

                },

                modal: { ondismiss: () => failPayment('Payment was cancelled before completion. No booking has been created.') },

            })



            checkout.on('payment.failed', (response) => failPayment(response.error?.description || 'Your payment could not be completed.'))

            checkout.open()

            setSubmitting(false)

        } catch (requestError) {

            showToast({ type: 'error', title: 'Could not start payment', description: getApiErrorMessage(requestError) })

            setSubmitting(false)

        }

    }



    if (error) return <div className="px-4 pt-28"><ErrorState message={error} /></div>

    if (!vehicle) return <div className="mx-auto max-w-7xl px-4 pt-28"><SkeletonCard className="h-[43rem]" /></div>



    const image = vehicle.imageUrls?.[0]

    const vehicleName = vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim()



    return (

        <div className="min-h-screen bg-[#fcfdff] pb-28 pt-24 text-[#081440] md:pb-12 sm:pt-28">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_495px] xl:items-start">

                    <main>

                        <Link to="/vehicles" className="inline-flex items-center gap-2 text-[15px] font-semibold text-rideon-blue"><ArrowLeft className="size-[18px]" />Back to vehicles</Link>

                        <h1 className="mt-4 text-[31px] font-extrabold leading-none tracking-[-0.04em] sm:text-[34px]">Book your ride</h1>

                        <p className="mt-2 text-[15px] text-[#344879]">Select your ride time and we&apos;ll check availability for you.</p>



                        <form onSubmit={checkBookingAvailability} className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(28,55,113,0.035)] sm:p-6">

                            <div className="flex items-center gap-4"><span className="flex size-[29px] items-center justify-center rounded-full bg-rideon-blue text-sm font-bold text-white">1</span><h2 className="text-[16px] font-bold">Select ride time</h2></div>

                            <div className="mt-6 space-y-4">

                                <TimeField label="Pickup" date={values.pickupDate} time={values.pickupTime} minDate={initialPickup.date} onDateChange={(value) => updateValue('pickupDate', value)} onTimeChange={(value) => updateValue('pickupTime', value)} />

                                <TimeField label="Return" date={values.returnDate} time={values.returnTime} minDate={values.pickupDate} minTime={values.returnDate === values.pickupDate ? values.pickupTime : undefined} onDateChange={(value) => updateValue('returnDate', value)} onTimeChange={(value) => updateValue('returnTime', value)} />

                            </div>

                            {dateError && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{dateError}</p>}

                            <div className="mt-5 flex min-h-11 items-center gap-4 rounded-lg border border-[#e5edf9] bg-[#f7faff] px-5 text-[13px] text-[#344879]"><Info className="size-5 shrink-0 text-rideon-blue" />Minimum rental duration is 1 hour.</div>

                            <Button type="submit" disabled={submitting} className="mt-5 h-[43px] w-full rounded-md bg-[#0764f5] text-[15px] font-semibold text-white shadow-none hover:bg-[#075be0]">{submitting ? 'Checking availability…' : <><Search className="size-[18px]" />Check availability</>}</Button>

                        </form>



                        {availability && <section className="mt-4 hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(28,55,113,0.035)] md:block sm:p-6">

                            <div className="flex items-center gap-4"><span className="flex size-[29px] items-center justify-center rounded-full bg-[#20a64b] text-sm font-bold text-white">2</span><h2 className="text-[16px] font-bold">Availability result</h2></div>

                            {availability.available ? <>

                                <div className="mt-5 overflow-hidden rounded-lg border border-[#a9dfb9]">

                                    <div className="flex items-center gap-4 border-b border-[#a9dfb9] bg-[#f2fff5] px-6 py-4 text-[15px] font-semibold text-[#138a34]"><CheckCircle2 className="size-6 fill-[#20a64b] text-white" />Great! A bike is available for the chosen time.</div>

                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">

                                        <div className="flex min-w-0 flex-1 items-center gap-5"><div className="flex size-32 shrink-0 items-center justify-center overflow-hidden">{image ? <img src={image} alt={vehicleName} className="h-full w-full object-contain" /> : <Settings2 className="size-9 text-rideon-blue/40" />}</div><div className="min-w-0"><span className="inline-flex rounded-md bg-[#e7f9e9] px-2 py-1 text-xs font-medium text-[#138a34]">Available</span><h3 className="mt-2 truncate text-[18px] font-bold">{vehicleName}</h3><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#344879]"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-rideon-blue" />{vehicle.campus?.name || 'Campus pickup'}</span><span className="inline-flex items-center gap-2"><Settings2 className="size-4 text-[#344879]" />{vehicle.model || 'Automatic'}</span></div></div></div>

                                        <span className="inline-flex shrink-0 items-center gap-3 rounded-md bg-[#f2fff5] px-4 py-3 text-[13px] font-medium text-[#138a34]"><CheckCircle2 className="size-5" />Confirmed for selected time</span>

                                    </div>

                                </div>

                                <div className="mt-3 flex justify-end"><Button type="button" onClick={submitBooking} disabled={submitting} variant="outline" className="h-10 rounded-lg border-[#a9c9ff] px-5 text-[14px] font-semibold text-rideon-blue hover:bg-blue-50">Continue to payment <ArrowRight className="size-[18px]" /></Button></div>

                            </> : <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{availability.reason || 'This bike is not available for the selected time.'}{availability.availableFrom && ` Next available: ${new Date(availability.availableFrom).toLocaleString()}.`}</div>}

                            <div className="mt-4 flex items-center gap-4 rounded-lg border border-[#e5edf9] bg-[#f7faff] px-5 py-3 text-[13px] text-[#344879]"><Info className="size-5 shrink-0 text-rideon-blue" />Price is calculated automatically based on the nearest eligible rental package.</div>

                        </section>}



                        {availability && <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(28,55,113,0.035)] md:hidden">

                            <div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full bg-[#20a64b] text-sm font-bold text-white">2</span><h2 className="text-[15px] font-bold">Availability result</h2></div>

                            {availability.available ? <>

                                <div className="mt-4 rounded-lg border border-[#a9dfb9] bg-[#f2fff5] p-3 text-sm font-semibold text-[#138a34]"><span className="flex items-center gap-2"><CheckCircle2 className="size-5" />Great! A bike is available for the chosen time.</span></div>

                                <div className="mt-4 flex items-center gap-4"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100">{image ? <img src={image} alt={vehicleName} className="size-full object-contain" /> : <Settings2 className="size-7 text-rideon-blue/40" />}</div><div className="min-w-0"><span className="rounded bg-[#e7f9e9] px-2 py-1 text-xs font-medium text-[#138a34]">Available</span><h3 className="mt-2 truncate text-[16px] font-bold">{vehicleName}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-[#40537e]"><MapPin className="size-3.5 text-rideon-blue" />{vehicle.campus?.name || 'Campus pickup'}</p></div></div>

                                <div className="mt-4 rounded-lg border border-[#dbe6fa] bg-[#f7faff] px-4 py-3"><div className="flex items-center justify-between text-xs text-[#40537e]"><span>Subtotal + GST</span><span>{money(availability.subtotal)} + {money(availability.gstAmount)}</span></div><div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold">Total amount</span><strong className="text-xl text-rideon-blue">{money(availability.totalAmount)}</strong></div></div>

                                <button type="button" onClick={() => setSummaryOpen(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#a9c9ff] py-3 text-sm font-semibold text-rideon-blue">View booking details <ChevronDown className="size-4" /></button>

                            </> : <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{availability.reason || 'This bike is not available for the selected time.'}</div>}

                        </section>}



                        <section className="mt-4 flex flex-col gap-4 rounded-lg border border-[#f3cf85] bg-[#fffaf0] p-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex gap-4"><ShieldCheck className="mt-0.5 size-8 shrink-0 text-[#cf8200]" /><div><h2 className="text-[15px] font-bold">Cancellation policy</h2><p className="mt-1 text-[13px] text-[#46577f]">You can cancel your booking anytime before payment. Once confirmed, cancellations are subject to policy.</p></div></div>

                            <Button type="button" variant="outline" className="h-11 shrink-0 rounded-lg border-[#f3d9a8] bg-white px-5 text-[14px] text-[#1d294b]"><FileText className="size-[18px]" />View policy</Button>

                        </section>

                    </main>

                    <BookingSummary className="hidden md:block" vehicle={vehicle} pickupAt={pickupAt?.toISOString()} returnAt={returnAt?.toISOString()} availability={availability} status="AVAILABLE" />

                </div>

            </div>

            {availability?.available && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"><Button type="button" onClick={submitBooking} disabled={submitting} className="h-12 w-full rounded-lg bg-[#0764f5] text-[15px] font-semibold text-white hover:bg-[#075be0]">{submitting ? 'Continuing…' : <>Continue to payment <ArrowRight className="size-[18px]" /></>}</Button></div>}

            {summaryOpen && <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/30 p-0 md:hidden" role="dialog" aria-modal="true" aria-label="Booking details" onMouseDown={() => setSummaryOpen(false)}><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" /><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Booking details</h2><button type="button" aria-label="Close booking details" onClick={() => setSummaryOpen(false)} className="rounded-md p-1 text-[#081440]"><X className="size-5" /></button></div><BookingSummary className="border-0 p-0 shadow-none" vehicle={vehicle} pickupAt={pickupAt?.toISOString()} returnAt={returnAt?.toISOString()} availability={availability} status="AVAILABLE" /></div></div>}

        </div>

    )

}

# Payment Module – Integration Guide



## 1. Environment variables



```env

RAZORPAY_KEY_ID=rzp_test_xxxxx

RAZORPAY_KEY_SECRET=xxxxx

RAZORPAY_WEBHOOK_SECRET=xxxxx

```



## 2. Install dependency



```bash

npm install razorpay

```



## 3. Prisma



```bash

npx prisma migrate dev --name add_payment

npx prisma generate

```



## 4. Mount routes (app.js / routes index)



```js

import paymentRoutes from './modules/payment/payment.routes.js'



// Webhook needs raw body for signature verification

app.use(

  '/api/payments/webhook',

  express.raw({ type: 'application/json' }),

  (req, res, next) => {

    req.rawBody = req.body.toString('utf8')

    try {

      req.body = JSON.parse(req.rawBody)

    } catch {

      req.body = {}

    }

    next()

  },

  paymentRoutes

)



// Other payment routes (JSON body)

app.use('/api/payments', paymentRoutes)

```



> If the above double-mount is awkward, split webhook into its own router file.



## 5. API Contract (Frontend)



### POST /api/payments/create-order

**Auth:** required  

**Body:**

```json

{

  "campusId": "string",

  "pickupAt": "2026-08-10T10:00:00.000Z",

  "returnAt": "2026-08-10T16:00:00.000Z",

  "notes": "optional string"

}

```

**Response `data`:**

```json

{

  "paymentId": "string",

  "orderId": "order_xxxxx",

  "amount": 450,

  "amountInPaise": 45000,

  "currency": "INR",

  "keyId": "rzp_test_xxxxx",

  "pricing": {

    "id": "string",

    "packageName": "6 Hours",

    "durationHours": 6,

    "baseAmount": 400,

    "platformFee": 20,

    "gstAmount": 30,

    "depositAmount": 0,

    "totalAmount": 450,

    "includedKm": 50,

    "extraKmRate": 5

  }

}

```



### Frontend Razorpay Checkout

```js

const options = {

  key: data.keyId,

  amount: data.amountInPaise,

  currency: data.currency,

  order_id: data.orderId,

  name: 'Campus Bikes',

  handler: async function (response) {

    // response contains: razorpay_order_id, razorpay_payment_id, razorpay_signature

    await fetch('/api/payments/verify', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

      body: JSON.stringify({

        razorpay_order_id: response.razorpay_order_id,

        razorpay_payment_id: response.razorpay_payment_id,

        razorpay_signature: response.razorpay_signature,

      }),

    })

  },

}

const rzp = new Razorpay(options)

rzp.open()

```



### POST /api/payments/verify

**Auth:** required  

**Body:**

```json

{

  "razorpay_order_id": "order_xxxxx",

  "razorpay_payment_id": "pay_xxxxx",

  "razorpay_signature": "xxxxx"

}

```

**Response `data`:**

```json

{

  "payment": {

    "id": "string",

    "status": "PAID",

    "amount": 450,

    "currency": "INR",

    "gatewayOrderId": "order_xxxxx",

    "gatewayPaymentId": "pay_xxxxx",

    "paidAt": "ISO date"

  },

  "booking": { /* full booking object with bike, campus, pricing */ },

  "alreadyProcessed": false

}

```



### POST /api/payments/mark-failed (optional)

**Body:** `{ "razorpay_order_id": "order_xxxxx" }`



### POST /api/payments/webhook

No auth. Secured by `x-razorpay-signature` header.  

Configure in Razorpay Dashboard → Webhooks → URL = `https://yourdomain/api/payments/webhook`



### GET /api/payments

List current user payments (paginated).



### GET /api/payments/:id

Single payment (owner only).



## 6. Important design notes



- Booking is created **only after** successful signature verification (not at order creation).

- Payment status and Booking status are independent.

- All money amounts are calculated on the backend. Frontend only displays.

- Verify endpoint is idempotent – safe to call multiple times.

- Webhook is a safety net; primary path is frontend verify callback.

- Existing `POST /bookings` can still be used for admin / cash flows if needed.

import { apiClient } from '@/lib/apiClient'



const payload = (response) => response.data?.data



export async function createPaymentOrder(request) {

    const response = await apiClient.post('/payments/create-order', request)

    return payload(response)

}



export async function verifyPayment(request) {

    const response = await apiClient.post('/payments/verify', request)

    return payload(response)

}



export async function markPaymentFailed(razorpayOrderId) {

    await apiClient.post('/payments/mark-failed', { razorpay_order_id: razorpayOrderId })

}



- be -  