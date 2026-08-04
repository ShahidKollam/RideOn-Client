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
