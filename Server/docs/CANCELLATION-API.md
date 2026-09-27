# RideOn — Booking Cancellation System (Backend)

**Version:** Cancellation incremental release  
**Base URL:** `/api/v1`  
**Response envelope:** `{ success, statusCode, message, data }` (via `ApiResponse`)

---

## 1. Cancellation policy (SystemSetting)

Stored as JSON on `SystemSetting.cancellationPolicy`. **Never hardcoded** in booking services.

Default:

```json
{
  "enabled": true,
  "rules": [
    { "hours": 72, "percent": 25 },
    { "hours": 48, "percent": 50 },
    { "hours": 24, "percent": 75 },
    { "hours": 0, "percent": 100 }
  ]
}
```

Rule selection: hours remaining until **scheduled** `pickupAt`, first matching rule where `hoursRemaining >= rule.hours` (rules sorted descending by hours).

### GET `/admin/settings`

Returns existing settings **plus** `cancellationPolicy`.

### PATCH `/admin/settings`

Auth: Admin.

```json
{
  "cancellationPolicy": {
    "enabled": true,
    "rules": [
      { "hours": 72, "percent": 25 },
      { "hours": 48, "percent": 50 },
      { "hours": 24, "percent": 75 },
      { "hours": 0, "percent": 100 }
    ]
  }
}
```

---

## 2. Customer APIs

### GET `/bookings/:id/cancellation-preview`

Auth: Customer (`protect`). Ownership enforced.

**Does not cancel.** Backend calculates all amounts.

**200 example (allowed):**

```json
{
  "success": true,
  "data": {
    "canCancel": true,
    "reason": null,
    "bookingAmount": 500,
    "cancellationPercentage": 50,
    "cancellationAmount": 250,
    "refundAmount": 250,
    "hoursRemaining": 60,
    "policyEnabled": true,
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "refundStatus": null,
    "cancelledAt": null
  }
}
```

**When not allowed:** `canCancel: false` with `reason`, e.g.:

- `"Cancellation is currently disabled"`
- `"Cannot cancel after the bike has been picked up"`
- `"Booking is already cancelled"`
- `"Booking is already completed"`
- `"Cannot cancel booking in status ACTIVE"`

### PATCH `/bookings/:id/cancel`

Auth: Customer. Ownership enforced.

1. Verifies ownership  
2. Verifies still cancellable (status `PAYMENT_PENDING` | `CONFIRMED`, bike **not** picked up)  
3. Recalculates policy (never trusts body amounts)  
4. Sets booking `CANCELLED`  
5. Initiates Razorpay refund for **booking amount only** when applicable  
6. Idempotent: second call does **not** create another refund  

**200 data includes:** booking fields + `cancellation` object (`refundAmount`, `refundStatus`, `cancellationPercentage`, etc.) and `alreadyCancelled`.

### GET `/bookings/:id`

Additive field on booking:

```json
"cancellation": {
  "canCancel": true,
  "reason": null,
  "bookingAmount": 500,
  "cancellationPercentage": 50,
  "cancellationAmount": 250,
  "refundAmount": 250,
  "hoursRemaining": 60,
  "policyEnabled": true,
  "refundStatus": null,
  "cancelledAt": null,
  "cancelledBy": null
}
```

---

## 3. Admin APIs

### PATCH `/admin/bookings/:id/cancel`

Auth: Admin + permission `bookings.cancel`.

**Body:**

```json
{
  "applyCancellationFee": true,
  "adjustedRefundAmount": null,
  "adjustmentReason": null
}
```

| Field | Effect |
|--------|--------|
| `applyCancellationFee: true` | Apply configured policy % |
| `applyCancellationFee: false` | Full refund of booking amount (0% fee) |
| `adjustedRefundAmount` | Optional admin override of refund; original calculated amount still stored |
| `adjustmentReason` | Required for audit clarity when adjusting |

**Example — fee applied (policy 50% on ₹500):**

- Deduction ₹250, refund ₹250  

**Example — fee waived:**

- Deduction ₹0, refund ₹500  

Audit log action: `BOOKING_CANCEL` with original vs final amounts.

### POST `/admin/bookings/:id/cash-refund`

Auth: Admin + `bookings.cancel`.

After cancellation of a **cash / offline** paid booking, admin records physical refund:

```json
{ "reference": "optional note" }
```

Sets `refundStatus: SUCCESS`, creates a `CASH_REFUND` payment row (negative amount).

### GET `/admin/bookings/:id`

Additive `cancellation` object (eligibility, amounts, audit fields, refund status).

---

## 4. Outstanding amount behaviour (critical)

A single Razorpay payment may be:

```
rentalAmount (current booking) + outstandingLateAmount = payment.amount
```

**Cancellation refund is calculated only from `booking.totalAmount` (rental).**

Example:

- Booking ₹500 + outstanding ₹100 → customer paid ₹600  
- Policy 50% → cancellation fee ₹250, **refund ₹250** (not ₹300, not ₹600)

Intent stored at order time (`gatewayResponse.intent.rentalAmount`, `outstandingLateAmount`) is the reference; booking `totalAmount` is the cancellation base.

---

## 5. Refund behaviour

| Gateway | Behaviour |
|---------|-----------|
| Razorpay | Backend calls `payments.refund` with original `gatewayPaymentId` and refund amount in paise. Customer is **not** asked for bank/UPI details. |
| Cash / ADMIN_OFFLINE | No Razorpay call. `refundStatus: PENDING` until admin records cash refund. |

**Statuses (separate from booking status):**

- `NONE` / `NOT_APPLICABLE` — nothing to refund  
- `PENDING` — refund due / initiated  
- `SUCCESS` — refund completed  
- `FAILED` — gateway error (booking still CANCELLED)

Booking status becomes `CANCELLED` independently of refund success.

**Duplicate protection:** If `status === CANCELLED` or `refundGatewayId` already set, no second refund is created.

---

## 6. Customer eligibility rules

Customer may cancel only when:

- Policy `enabled === true`  
- Status is `PAYMENT_PENDING` or `CONFIRMED`  
- Bike has **not** been picked up (`status !== ACTIVE` and `pickedUpAt` is null)  

Not allowed: `ACTIVE`, `COMPLETED`, `CANCELLED`, `FAILED`, policy disabled.

Admin may also cancel `ACTIVE` and `NO_SHOW` (frees bike when ACTIVE).

---

## 7. Schema additions

**Booking**

- `cancelledAt`, `cancelledBy` (`CUSTOMER` \| `ADMIN`), `cancelledByAdminId`  
- `cancellationPercentage`, `cancellationAmount`, `originalCancellationAmount`  
- `refundAmount`, `refundStatus`, `refundedAt`, `refundGatewayId`  
- `adminAdjustedRefundAmount`, `adminAdjustmentReason`  

**SystemSetting**

- `cancellationPolicy` (Json / JSONB)

Migration: `prisma/migrations/20260922120000_booking_cancellation/`

---

## 8. Error cases

| Case | HTTP | Message (example) |
|------|------|-------------------|
| Not owner | 403 | Not authorized |
| Not found | 404 | Booking not found |
| After pickup (customer) | 400 | Cannot cancel after the bike has been picked up |
| Already cancelled | 200 idempotent or 400 | Already cancelled |
| Policy disabled | 400 | Cancellation is currently disabled |
| Invalid admin body | 400 | Validation error |

---

## 9. Notifications

Uses existing mailer patterns where available. Events of interest: booking cancelled, refund initiated / success / failed. No new notification subsystem.
