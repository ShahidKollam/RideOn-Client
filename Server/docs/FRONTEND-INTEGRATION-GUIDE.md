# RideOn Cancellation — Frontend Integration Guide (Client + Admin)

**Backend base:** `/api/v1`  
**Envelope:** `{ success, statusCode, message, data }`  
**Rule:** Frontend must **never** calculate cancellation %, fee, or refund. Always use backend values.

---

## Shared concepts

### Policy (display only)
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
Meaning for UI copy:
- **> 72h** before pickup → 25% fee
- **48–72h** → 50%
- **24–48h** → 75%
- **< 24h** → 100% (no refund)

### Refund status (separate from booking status)
| `refundStatus` | UI meaning |
|----------------|------------|
| `null` / absent | Not cancelled yet |
| `NONE` / `NOT_APPLICABLE` | Cancelled, nothing to refund (unpaid) |
| `PENDING` | Refund due / in progress (Razorpay or cash) |
| `SUCCESS` | Refund completed |
| `FAILED` | Refund failed — show support message |

### Booking status after cancel
Always `CANCELLED`. Do not assume refund succeeded just because status is cancelled.

### Money fields (always from API)
- `bookingAmount` — current booking total only (not outstanding)
- `cancellationPercentage`
- `cancellationAmount` — fee deducted
- `refundAmount` — amount customer gets back

---

# PART A — CLIENT (Customer app)

## A1. API contract

### 1) Preview (before confirm dialog)
```
GET /api/v1/bookings/:id/cancellation-preview
Authorization: Bearer <customer token>
```
**No body.** Does not cancel.

**Success `data`:**
```json
{
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
```

**When blocked:**
```json
{
  "canCancel": false,
  "reason": "Cannot cancel after the bike has been picked up",
  "bookingAmount": 500,
  "cancellationPercentage": 100,
  "cancellationAmount": 500,
  "refundAmount": 0,
  "...": "..."
}
```

### 2) Confirm cancel
```
PATCH /api/v1/bookings/:id/cancel
Authorization: Bearer <customer token>
```
**No body** (or empty `{}`). Never send fee/refund amounts.

**Success `data`:** full booking + 
```json
{
  "cancellation": {
    "bookingAmount": 500,
    "cancellationPercentage": 50,
    "cancellationAmount": 250,
    "refundAmount": 250,
    "refundStatus": "SUCCESS",
    "refundGatewayId": "rfnd_xxx",
    "...": "..."
  },
  "alreadyCancelled": false
}
```

### 3) Booking detail (show cancel CTA + status)
```
GET /api/v1/bookings/:id
```
Uses additive field `data.cancellation` (same shape as preview fields + `canCancel` / `reason`).

---

## A2. What to do in Client UI

### Booking list / detail
1. Read `booking.cancellation` (or call preview).
2. **Show “Cancel booking” only if** `cancellation.canCancel === true`.
3. If `canCancel === false`:
   - Hide button, **or** show disabled with tooltip = `reason`.
4. If `status === "CANCELLED"`:
   - Badge: Cancelled
   - Show refund line: amount + status (Pending / Success / Failed)

### Cancel flow (recommended UX)
```
[Cancel booking]
    → GET cancellation-preview
    → Modal:
         Booking amount: ₹{bookingAmount}
         Cancellation fee ({cancellationPercentage}%): ₹{cancellationAmount}
         Refund: ₹{refundAmount}
         Note: Refund goes to original payment method (Razorpay).
         [Back]  [Confirm cancel]
    → PATCH /bookings/:id/cancel
    → Success screen:
         Cancelled
         Refund: ₹X · status SUCCESS/PENDING/FAILED
    → Refresh booking detail
```

### Do NOT
- Calculate % from local clock vs pickup time for money
- Send `cancellationPercentage` / `refundAmount` in cancel body
- Ask for bank / UPI / card for refund
- Show cancel after pickup / ACTIVE / COMPLETED (backend will 400 anyway)

### Error handling
| HTTP | UI |
|------|-----|
| 400 | Show `message` (e.g. already picked up, policy disabled) |
| 403 | Not your booking |
| 404 | Booking not found |
| Network fail | Retry; do not assume cancelled |

### Idempotency
If user taps Confirm twice, second response may have `alreadyCancelled: true` — treat as success, show existing refund info.

---

# PART B — ADMIN

## B1. API contract

### 1) Settings — read/write policy
```
GET  /api/v1/admin/settings
PATCH /api/v1/admin/settings
Authorization: Admin token
Permission: settings (existing admin settings permission)
```

**PATCH body (partial OK):**
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

Response includes full settings object with `cancellationPolicy`.

### 2) Booking detail (eligibility + amounts)
```
GET /api/v1/admin/bookings/:id
Permission: bookings.read
```
Additive:
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
  "cancelledBy": null,
  "originalCancellationAmount": null,
  "adminAdjustedRefundAmount": null,
  "adminAdjustmentReason": null,
  "refundGatewayId": null
}
```

### 3) Admin cancel
```
PATCH /api/v1/admin/bookings/:id/cancel
Permission: bookings.cancel
Content-Type: application/json
```

**Body:**
```json
{
  "applyCancellationFee": true,
  "adjustedRefundAmount": null,
  "adjustmentReason": null
}
```

| Field | Required | Meaning |
|-------|----------|---------|
| `applyCancellationFee` | no (default `true`) | `true` = policy fee; `false` = full refund of booking amount |
| `adjustedRefundAmount` | no | Optional override of **refund** amount (₹). Backend stores original vs final |
| `adjustmentReason` | recommended if adjusted | Audit text, max 500 chars |

**Examples:**
```json
// Apply policy fee
{ "applyCancellationFee": true }

// Full refund (waive fee)
{ "applyCancellationFee": false }

// Manual refund amount
{
  "applyCancellationFee": true,
  "adjustedRefundAmount": 400,
  "adjustmentReason": "Customer goodwill — partial fee only"
}
```

**Success:** booking + `cancellation` with final fee/refund/refundStatus + `alreadyCancelled`.

### 4) Record cash refund (cash / offline paid bookings)
```
POST /api/v1/admin/bookings/:id/cash-refund
Permission: bookings.cancel
```
```json
{ "reference": "Paid at desk · receipt #12" }
```
Use when booking is already `CANCELLED`, payment was cash/offline, and `refundStatus` is `PENDING`.

---

## B2. What to do in Admin UI

### Policies / General settings page
Add a **Cancellation policy** card (alongside GST / Platform / Helmet if that page exists):

1. Toggle: **Cancellation enabled** → maps to `cancellationPolicy.enabled`
2. Editable rules table: Hours threshold | Fee %
3. Save → `PATCH /admin/settings` with full `cancellationPolicy` object
4. Do not hardcode the four tiers in frontend logic for money — settings are source of truth; UI can still show the saved rules as info text

### Booking detail drawer / page
1. Load `GET /admin/bookings/:id`
2. Section **Cancellation**
   - If not cancelled: show eligibility, booking amount, policy %, fee, refund (from `cancellation`)
   - If cancelled: show cancelledAt, cancelledBy, amounts, refundStatus, refundGatewayId, admin adjustment fields if present
3. **Cancel** action (permission `bookings.cancel` and `cancellation.canCancel`):
   - Open modal:
     - Toggle / checkbox: **Apply cancellation fee** (default ON)
     - Live summary from last GET (or re-fetch detail after toggle is only display; final numbers always from cancel response)
     - Optional: **Adjust refund amount** + **Reason** (show reason required if amount changed)
     - Confirm
   - `PATCH .../cancel` with body above
   - On success: toast + refresh detail
4. If `refundStatus === "PENDING"` and payment was cash/offline:
   - Button **Record cash refund** → `POST .../cash-refund`
5. If Razorpay + `FAILED`: show “Refund failed — check Razorpay / retry support process” (no automatic second cancel)

### Booking list
- Status chip includes `CANCELLED`
- Optional column/filter: refund status (if list API later exposes it; detail is enough for v1)

### Admin cancel modal wireframe
```
Cancel booking BK2026…
─────────────────────────────────
Booking amount:     ₹500.00
Policy fee (50%):   ₹250.00     ← hide/zero when “Apply fee” off
Refund:             ₹250.00

[✓] Apply cancellation fee

Advanced (optional)
  Adjust refund to: [    ]
  Reason:           [    ]

[Cancel]  [Confirm cancellation]
```

After confirm, show result refundStatus from response.

### Do NOT
- Trust list-only status for money without detail/preview
- Recalculate fee in the browser for final confirmation
- Call Razorpay from frontend for refunds
- Use full payment amount (with outstanding) as refund base in any UI copy that invents numbers

### Permissions
| Action | Permission |
|--------|------------|
| View cancellation on booking | `bookings.read` |
| Cancel / cash refund | `bookings.cancel` |
| Edit policy | existing settings permission |

---

# PART C — Quick mapping checklist

### Client
| UI element | Source |
|------------|--------|
| Show Cancel button | `cancellation.canCancel` |
| Fee / refund in modal | `GET .../cancellation-preview` |
| Confirm | `PATCH .../cancel` (no amounts in body) |
| After cancel badge | `status === "CANCELLED"` + `refundStatus` |

### Admin
| UI element | Source |
|------------|--------|
| Policy form | GET/PATCH `/admin/settings` → `cancellationPolicy` |
| Fee preview on booking | `GET /admin/bookings/:id` → `cancellation` |
| Cancel with fee on/off | `PATCH .../cancel` body |
| Manual refund amount | `adjustedRefundAmount` + `adjustmentReason` |
| Cash refund done | `POST .../cash-refund` |
| Audit display | `originalCancellationAmount`, `adminAdjustedRefundAmount`, `adminAdjustmentReason` |

---

# PART D — Copy / messaging suggestions

**Client preview modal**
> Cancellation fee is calculated by RideOn based on time left before pickup. Refund (if any) is returned to your original payment method.

**Client after SUCCESS**
> Booking cancelled. Refund of ₹X has been initiated to your original payment method.

**Client after PENDING**
> Booking cancelled. Refund of ₹X is being processed.

**Client after FAILED**
> Booking cancelled, but refund could not be completed automatically. Contact support with your booking number.

**Admin cash**
> Record only after cash has been returned to the customer.

---

# PART E — Out of scope for frontend

- Creating a second refund API
- Collecting bank details for Razorpay refunds
- Changing outstanding late payment UI as part of cancel (outstanding is not refunded on cancel)
- Bypassing `canCancel` with local status checks only (still call backend)

For full backend field list and error messages, see `CANCELLATION-API.md` in the same folder.
