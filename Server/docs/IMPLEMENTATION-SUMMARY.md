# RideOn Booking Cancellation — Implementation Summary

## 1. Files changed

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | Booking cancellation/refund fields; `SystemSetting.cancellationPolicy` Json |
| `prisma/migrations/20260922120000_booking_cancellation/migration.sql` | Additive migration |
| `src/modules/booking/cancellation.service.js` | **New** — central calculator + execute + cash refund |
| `src/modules/booking/booking.service.js` | Customer cancel → executeCancellation; preview; getBooking + cancellation info |
| `src/modules/booking/booking.controller.js` | Preview controller |
| `src/modules/booking/booking.user.routes.js` | `GET /:id/cancellation-preview` |
| `src/lib/razorpay.js` | `createRazorpayRefund` |
| `src/modules/settings/settings.service.js` | GET/PATCH `cancellationPolicy` |
| `src/modules/settings/settings.validation.js` | Zod for policy |
| `src/modules/admin/bookings/booking.admin.service.js` | Admin cancel with fee/adjust; cash refund; detail cancellation |
| `src/modules/admin/bookings/booking.admin.controller.js` | Body: applyCancellationFee, adjustedRefundAmount, reason |
| `src/modules/admin/bookings/booking.admin.routes.js` | Validated cancel + `POST /:id/cash-refund` |
| `src/modules/admin/bookings/booking.admin.validation.js` | Schemas |

Deliverables:

- `artifacts/backend-patches/cancellation/` — individual files  
- `artifacts/rideon-backend-cancellation.zip` — full backend tree with changes  

## 2. Database / schema changes

Additive only (no removals/renames):

- Booking: cancellation + refund + admin audit columns  
- SystemSetting: `cancellationPolicy` JSONB  

Run migration in deploy environment before relying on new columns.

## 3. New / updated APIs

**Customer**

- `GET /api/v1/bookings/:id/cancellation-preview`  
- `PATCH /api/v1/bookings/:id/cancel` (enhanced)  
- `GET /api/v1/bookings/:id` (adds `cancellation`)  

**Admin**

- `PATCH /api/v1/admin/bookings/:id/cancel` (body: fee / adjust)  
- `POST /api/v1/admin/bookings/:id/cash-refund`  
- `GET /api/v1/admin/bookings/:id` (adds `cancellation`)  
- `GET|PATCH /api/v1/admin/settings` (includes `cancellationPolicy`)  

## 4. Cancellation flow

1. Load booking + payments  
2. Load policy from SystemSetting (defaults if null)  
3. Eligibility by actor (customer vs admin) using **status / pickedUpAt**, not only schedule  
4. Hours until `pickupAt` → policy percent  
5. `cancellationAmount = booking.totalAmount × percent / 100`  
6. `refundAmount = booking.totalAmount − cancellationAmount` (or admin override / waive fee)  
7. Transaction: status CANCELLED, store amounts, free bike if ACTIVE  
8. Outside TX: Razorpay partial refund if online payment  

## 5. Refund flow

- **Razorpay:** `createRazorpayRefund({ paymentId: gatewayPaymentId, amountInPaise })`  
- Store `refundGatewayId`, set `refundStatus` SUCCESS/FAILED  
- Update payment status REFUNDED / PARTIALLY_REFUNDED  
- **Cash:** leave PENDING; admin `POST .../cash-refund` marks SUCCESS + payment row  

## 6. Outstanding-payment handling

Refund base = **`booking.totalAmount` only** (rental / current booking).  
Never `payment.amount × percent` when the Razorpay order included outstanding late from prior bookings.  
Order-time intent already stores `rentalAmount` vs `outstandingLateAmount`; booking row stores rental as `totalAmount`.

## 7. Admin cancellation handling

- `applyCancellationFee: true` → policy percent  
- `applyCancellationFee: false` → 0% fee, full booking refund  
- Optional `adjustedRefundAmount` + `adjustmentReason`  
- Stores `originalCancellationAmount` vs final; AuditLog `BOOKING_CANCEL`  

## 8. Audit handling

- Booking columns: original vs adjusted amounts, reason, admin id, timestamps  
- `AuditLog` row for admin cancel and cash refund record  

## 9. Test results (calculator unit checks)

| Case | Result |
|------|--------|
| >72h → 25% | PASS |
| 48–72h → 50% | PASS |
| 24–48h → 75% | PASS |
| <24h → 100% | PASS |
| ₹500 @ 50% → fee 250, refund 250 | PASS |
| Outstanding isolation (refund from 500 not 600) | PASS |
| Customer + ACTIVE / pickedUp | blocked by design |
| Policy disabled | blocked by design |
| Duplicate cancel | returns existing, no second refund |

Full integration tests require DB + Razorpay test keys (not run in this environment).

## 10. Issues / assumptions

1. **Bike status enum:** Pickup sets bike to `IN_USE` in existing code; schema `BikeStatus` list may differ by deploy — cancel frees bike to `AVAILABLE` when booking was ACTIVE.  
2. **PAYMENT_PENDING cancel:** Allowed for customer; refund NOT_APPLICABLE if never paid.  
3. **PARTIALLY_PAID:** Treated as paid for refund eligibility when a PAID payment row exists.  
4. **Notifications:** Confirmation email pattern exists; dedicated cancel/refund templates not added (reuse existing mailer if product wants later).  
5. **Circular import:** settings → cancellation (policy defaults only); booking service dynamic-imports cancellation to keep load light.  
6. Existing simple cancel endpoints replaced in-place — same paths, richer behaviour; response shape is additive (`cancellation` object).  

## Design constraints respected

- No rewrite of payment/booking core  
- No second payment/refund system  
- Backend sole source of truth for fees/refunds  
- No customer bank details for Razorpay refunds  
- Availability remains existing conflict/buffer logic (cancelled bookings stop blocking via status)  
