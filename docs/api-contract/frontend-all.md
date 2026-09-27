# RideOn Backend API Documentation

**Version:** Backend incremental release (Auth + Buffer + Alternatives + Late Fee + Bike Number + Outstanding)  
**Base URL:** `/api/v1`  
**Response envelope (all endpoints):**

```json
{
  "success": true,
  "message": "…",
  "data": { }
}
```

Errors use the same envelope with `success: false` and an appropriate HTTP status.

---

# PART A — CLIENT (Customer) APIs

Customer routes use the **user** JWT (`Authorization: Bearer <accessToken>`).  
Customer refresh cookie is `refreshToken` (separate from admin).  
These APIs were extended for availability alternatives, configurable buffer, bike number display, and outstanding late amounts.

---

## A1. Check Availability

**POST** `/api/v1/bookings/check-availability`  
**Auth:** Bearer (user)

### Request body

```json
{
  "campusId": "cuid",
  "pickupAt": "2026-09-20T10:00:00.000Z",
  "returnAt": "2026-09-20T16:00:00.000Z",
  "helmetCount": 0
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| campusId | string | yes | Active campus |
| pickupAt | ISO datetime | yes | Must be before returnAt |
| returnAt | ISO datetime | yes | Duration 1–72 hours |
| helmetCount | 0 \| 1 \| 2 | no | Default 0 |

### Success when a bike is available (`available: true`)

Existing pricing fields are unchanged. Additive fields:

```json
{
  "available": true,
  "durationHours": 6,
  "bookingBufferMinutes": 15,
  "pricing": {
    "id": "…",
    "packageName": "6 Hour",
    "composed": false,
    "segments": null
  },
  "baseAmount": 199,
  "platformFee": 20,
  "helmetAmount": 0,
  "subtotal": 219,
  "gstAmount": 39.42,
  "depositAmount": 500,
  "totalAmount": 758.42,
  "includedKm": 50,
  "extraKmRate": 5,
  "helmetCount": 0,
  "helmetFirstPrice": 30,
  "helmetSecondPrice": 20
}
```

### Success when no bike is available (`available: false`)

Same pricing preview, plus **alternatives** (max 5):

```json
{
  "available": false,
  "reason": "No available bikes for the selected time",
  "durationHours": 6,
  "bookingBufferMinutes": 15,
  "pricing": { "…" },
  "baseAmount": 199,
  "totalAmount": 758.42,
  "helmetCount": 0,
  "helmetAmount": 0,
  "alternatives": [
    {
      "pickupAt": "2026-09-20T10:30:00.000Z",
      "returnAt": "2026-09-20T16:30:00.000Z",
      "durationHours": 6,
      "sameDuration": true
    },
    {
      "pickupAt": "2026-09-20T09:00:00.000Z",
      "returnAt": "2026-09-20T14:00:00.000Z",
      "durationHours": 5,
      "sameDuration": false
    }
  ]
}
```

**Alternative ranking rules (backend):**

1. Same duration as requested first  
2. Then closer to requested start time  
3. Never longer than requested  
4. Shorter durations only if same-duration slots are not enough  
5. Maximum 5 items  

Selecting an alternative requires a **new** availability check with those times before booking/payment.

**Buffer:** `bookingBufferMinutes` comes from General Settings (default 15). It is applied on every availability and booking conflict check. Clients must not hardcode the buffer.

---

## A2. Create Payment Order

**POST** `/api/v1/payments/create-order`  
**Auth:** Bearer (user)

### Request body

```json
{
  "campusId": "cuid",
  "pickupAt": "2026-09-20T10:00:00.000Z",
  "returnAt": "2026-09-20T16:00:00.000Z",
  "helmetCount": 0,
  "notes": "optional"
}
```

### Success response (pricing section — additive fields)

```json
{
  "paymentId": "…",
  "orderId": "order_…",
  "amount": 908.42,
  "amountInPaise": 90842,
  "currency": "INR",
  "keyId": "rzp_…",
  "pricing": {
    "id": "…",
    "packageName": "6 Hour",
    "durationHours": 6,
    "baseAmount": 199,
    "platformFee": 20,
    "gstAmount": 39.42,
    "depositAmount": 500,
    "helmetCount": 0,
    "helmetAmount": 0,
    "rentalAmount": 758.42,
    "outstandingLateAmount": 150,
    "outstandingBookings": [
      {
        "bookingId": "…",
        "bookingNumber": "BK260920ABC",
        "outstandingAmount": 150,
        "lateFee": 0,
        "disruptionPenalty": 150
      }
    ],
    "totalAmount": 908.42,
    "includedKm": 50,
    "extraKmRate": 5
  }
}
```

| Field | Meaning |
|-------|---------|
| `rentalAmount` | Amount for **this** new booking only |
| `outstandingLateAmount` | Unpaid late-related balance from previous completed bookings |
| `outstandingBookings` | List of those previous bookings |
| `totalAmount` / `amount` | `rentalAmount + outstandingLateAmount` (what Razorpay charges) |

If there is no outstanding late amount, `outstandingLateAmount` is `0` and `outstandingBookings` is `[]`.

### After successful verify

- New booking is created with `totalAmount = rentalAmount` (not including outstanding).  
- Previous outstanding bookings included in the order are marked **PAID**.  
- Failed payment leaves outstanding unchanged (no duplicate charge).

---

## A3. Booking / Bike responses (client)

Where a booking includes a bike, the bike object may include:

```json
{
  "id": "cuid",
  "registrationNumber": "TN-00-XX-0000",
  "bikeNumber": "RO-001",
  "name": "…"
}
```

- `id` — internal DB id (use for relations)  
- `bikeNumber` — human-readable label (may be `null` on older bikes)  

No new client booking endpoints were added for late fee; late fee is handled by admin at return, and any unpaid amount surfaces as `outstandingLateAmount` on the next payment order.

---

## A4. Client auth (unchanged)

Customer magic-link / refresh flow is **unchanged**.  
Cookie name: `refreshToken`.  
Do **not** use admin auth endpoints from the client app.

---

# PART B — ADMIN APIs

Admin base path: `/api/v1/admin`  
Admin access token: short-lived JWT (default **15 minutes**).  
Admin refresh cookie: **`adminRefreshToken`** (HttpOnly; isolated from customer `refreshToken`).

Protected routes require:

```http
Authorization: Bearer <accessToken>
```

---

## B1. Admin Authentication

### B1.1 Login

**POST** `/api/v1/admin/auth/login`  
**Auth:** none

**Request**

```json
{
  "email": "admin@example.com",
  "password": "••••••••"
}
```

**Success `200`**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "admin": {
      "id": "…",
      "name": "…",
      "email": "…",
      "isActive": true,
      "campusId": null,
      "campus": null,
      "role": { "id": "…", "name": "SUPER_ADMIN" },
      "permissions": ["dashboard.read", "bookings.read", "bookings.update", "…"],
      "lastLoginAt": "…"
    }
  }
}
```

**Cookie set:** `adminRefreshToken`  
- HttpOnly  
- Secure in production  
- SameSite: `lax` (dev) / `none` (production)  
- Max-Age: 7 days (from `REFRESH_TOKEN_EXPIRES_IN`)  

The refresh token is **not** returned in the JSON body.

| Status | When |
|--------|------|
| 400 | Validation error |
| 401 | Invalid email or password |
| 403 | Admin inactive or role inactive |

---

### B1.2 Refresh access token

**POST** `/api/v1/admin/auth/refresh`  
**Auth:** cookie `adminRefreshToken` only (no Bearer required)  
**Body:** none  
**Client must send:** `credentials: 'include'`

**Success `200`**

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "<new jwt>",
    "admin": { "…same shape as login…" }
  }
}
```

Behavior:

- Validates JWT signature and DB session row  
- **Rotates** refresh token (old session deleted, new cookie set)  
- Rejects reused / revoked / expired sessions  

| Status | When |
|--------|------|
| 401 | Missing, invalid, expired, or revoked refresh token |
| 403 | Admin or role inactive |

---

### B1.3 Current admin (session)

**GET** `/api/v1/admin/auth/me`  
**Auth:** Bearer access token

**Success `200`** — `data` is the admin object (same fields as login `admin`, including `permissions`).

| Status | When |
|--------|------|
| 401 | Missing/invalid token or admin not found |
| 403 | Admin or role inactive |

---

### B1.4 Logout

**POST** `/api/v1/admin/auth/logout`  
**Auth:** refresh cookie (Bearer optional)

**Success `200`**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

- Deletes the refresh session from DB  
- Clears `adminRefreshToken` cookie  
- That refresh token cannot be used again  

---

### B1.5 Protected admin APIs — auth rules

| Concern | Behavior |
|---------|----------|
| Access token | `Authorization: Bearer <token>` on every protected call |
| Expiry | Default 15m (`JWT_EXPIRES_IN`) |
| On 401 | Call `POST /admin/auth/refresh`, then retry the request **once** |
| Identity | Middleware loads active admin + role + permissions onto `req.admin` |
| **401** | Not authenticated (no/bad/expired token) |
| **403** | Authenticated but inactive, role inactive, or missing permission |

**RBAC**

- Authentication = who the admin is  
- Authorization = `requirePermission('resource.action')` on the route  
- `SUPER_ADMIN` bypasses permission checks on the backend  
- Frontend menu visibility is **not** security; backend always enforces  

---

## B2. General Settings

**GET** `/api/v1/admin/settings`  
**PATCH** `/api/v1/admin/settings` (admin auth required for update)

### Settings fields (including new)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| gstEnabled | boolean | true | Apply GST |
| gstRate | number | 18 | GST % |
| platformFeeEnabled | boolean | true | Apply platform fee |
| platformFee | number | 20 | Platform fee amount |
| helmetFirstPrice | number | 0 | First helmet price |
| helmetSecondPrice | number | 0 | Second helmet price |
| lateHelmetFee | number | 0 | Flat fee if late return with helmets |
| **bookingBufferMinutes** | integer 0–180 | **15** | Minutes between bookings (availability + conflicts) |
| **disruptionPenalty** | number ≥ 0 | **150** | Optional admin-applied penalty on late return |

There is **no** `lateFeeEnabled` flag. Late rental charge is calculated at return; admin chooses whether to apply it.

**PATCH body** — any subset of the fields above.

---

## B3. Bikes — Bike Number

### Create / update

**POST** `/api/v1/admin/bikes`  
**PATCH** `/api/v1/admin/bikes/:id`

New optional field:

```json
{
  "bikeNumber": "RO-001"
}
```

| Rule | Detail |
|------|--------|
| Unique | Duplicate `bikeNumber` → **409** |
| Optional | May be null/omitted on older bikes |
| Does not replace | Internal `id` remains the FK for bookings |

### List / detail / booking payloads

Bike objects include:

```json
{
  "id": "cuid",
  "bikeNumber": "RO-001",
  "registrationNumber": "…",
  "name": "…",
  "status": "AVAILABLE"
}
```

Search on admin bike list also matches `bikeNumber`.

---

## B4. Bookings — Late return & late fee

### B4.1 List bookings

**GET** `/api/v1/admin/bookings`

Query params (existing + new):

| Param | Notes |
|-------|--------|
| status, paymentStatus, campusId, userId, bikeId, search, from, to | Existing |
| **lateOnly** | `true` → overdue ACTIVE or bookings with `lateDurationMinutes > 0` |

Each item may include:

- `bike.bikeNumber`  
- `isLate`  
- `lateDurationMinutes`  
- `lateFee`, `disruptionPenalty`, `lateFeeApplied`, `disruptionPenaltyApplied`  
- `paymentSummary.paidAmount` / `paymentSummary.outstandingAmount`  

---

### B4.2 Late return stats (dashboard list)

**GET** `/api/v1/admin/bookings/late-returns`  
**Permission:** `bookings.read`

```json
{
  "currentlyLateCount": 2,
  "items": [
    {
      "bookingId": "…",
      "bookingNumber": "BK…",
      "status": "LATE_RETURN",
      "lateDurationMinutes": 30,
      "bike": {
        "id": "…",
        "bikeNumber": "RO-001",
        "registrationNumber": "…",
        "name": "…"
      },
      "user": { "id": "…", "name": "…", "email": "…" },
      "scheduledReturnAt": "…",
      "returnedAt": null
    }
  ]
}
```

- Bike remains **unavailable** (`IN_USE`) until actual return is recorded.  
- No automatic cancel/reschedule of the next booking.

---

### B4.3 Preview late charges (before return)

**GET** `/api/v1/admin/bookings/:id/late-charges`  
**Permission:** `bookings.read`  
**Only valid for** `ACTIVE` bookings

```json
{
  "lateDurationMinutes": 45,
  "calculatedLateRental": 99,
  "latePricingInfo": {
    "durationHours": 1,
    "packageName": "1 Hour",
    "price": 99,
    "composed": false
  },
  "disruptionPenaltyAmount": 150,
  "affectedBooking": {
    "id": "…",
    "bookingNumber": "BK…",
    "pickupAt": "…",
    "returnAt": "…",
    "status": "CONFIRMED",
    "user": { "id": "…", "name": "…", "email": "…" }
  },
  "isLate": true
}
```

| Field | Meaning |
|-------|---------|
| calculatedLateRental | Extra package charge from existing pricing logic (ceil late minutes → hours) |
| disruptionPenaltyAmount | From settings (default 150); **not** auto-applied |
| affectedBooking | Next confirmed/active booking impacted by lateness, or `null` |

Admin uses this to decide the two apply flags on return.

---

### B4.4 Confirm return (apply late fee)

**PATCH** `/api/v1/admin/bookings/:id/return`  
**Permission:** `bookings.update`

**Request body**

```json
{
  "returnOdometer": 12345,
  "applyLateFee": false,
  "applyDisruptionPenalty": false
}
```

| Field | Default | Meaning |
|-------|---------|---------|
| returnOdometer | required | Must be ≥ pickup odometer |
| applyLateFee | false | If true, add calculated late rental to total |
| applyDisruptionPenalty | false | If true, add settings disruption penalty |

**Neither charge is applied automatically.** Admin must explicitly opt in.

**Response (additive fields)**

- `lateDurationMinutes`  
- `lateFee` — applied rental late amount (0 if not applied)  
- `disruptionPenalty` — applied penalty (0/null if not applied)  
- `lateFeeApplied` / `disruptionPenaltyApplied` — booleans  
- `lateHelmetFee` — if late and helmets were taken (existing setting)  
- `extraKm` / `extraKmCharge`  
- `paymentSummary.outstandingAmount` — if not collected at return  
- `lateChargeDetails` — full calculation snapshot + `affectedBooking`  
- `bike.bikeNumber`  
- Status becomes `COMPLETED`; bike status → `AVAILABLE`

Outstanding amount stays on the booking. Customer sees it on the **next** payment order as `outstandingLateAmount`.

---

### B4.5 Collect additional payment (after return)

**POST** `/api/v1/admin/bookings/:id/payments`  
**Permission:** `bookings.update`

```json
{
  "paymentMethod": "UPI",
  "reference": "optional"
}
```

Collects remaining `outstandingAmount` for a **COMPLETED** booking (offline). Marks booking `paymentStatus: PAID`.

---

## B5. Dashboard overview

**GET** `/api/v1/admin/dashboard/overview`  
**Permission:** `dashboard.read`

Additive fields:

```json
{
  "users": { "total": 0, "newLast7Days": 0 },
  "bikes": {
    "total": 0,
    "available": 0,
    "maintenance": 0,
    "inUse": 0
  },
  "bookings": {
    "today": 0,
    "active": 0,
    "completed": 0,
    "cancelled": 0,
    "lateReturns": 0
  },
  "revenue": { "today": 0 },
  "payments": { "pending": 0 }
}
```

| Field | Meaning |
|-------|---------|
| `bookings.lateReturns` | Count of ACTIVE bookings past scheduled `returnAt` |
| `bikes.inUse` | Bikes currently on rental |

---

# PART C — Shared behavior notes

### Booking buffer

- Stored in `SystemSetting.bookingBufferMinutes` (default 15)  
- Used in bike conflict checks for **client and admin** availability/booking  
- Not hardcoded in services  

### Late fee model

| Charge | Source | Applied by |
|--------|--------|------------|
| Late rental / package | Existing pricing composition for late duration (hours) | Admin flag `applyLateFee` |
| Disruption penalty | Settings `disruptionPenalty` (default ₹150) | Admin flag `applyDisruptionPenalty` |
| Late helmet fee | Settings `lateHelmetFee` | Auto when late + helmets taken (existing behavior) |

### Outstanding late amount

- If not collected at return → remains on that booking (`paymentStatus` may be `PARTIALLY_PAID`)  
- Next client `create-order` adds it as `outstandingLateAmount`  
- Settled on successful payment verify  
- Kept separate from the new booking’s `rentalAmount`  

### Bike identification

- `bike.id` — database relationships and allocation  
- `bike.bikeNumber` — human-readable display only  

### Customer auth vs admin auth

| | Customer | Admin |
|--|----------|--------|
| Access JWT role claim | `user` | `admin` |
| Refresh cookie | `refreshToken` | `adminRefreshToken` |
| Refresh table | `refresh_tokens` | `admin_refresh_tokens` |
| Login path | `/api/v1/auth/…` | `/api/v1/admin/auth/…` |

Do not mix tokens between client and admin apps.

---

# PART D — Environment (auth-related)

```env
JWT_SECRET=…
JWT_REFRESH_SECRET=…
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
ADMIN_URL_FE=http://localhost:5174
CLIENT_URL_FE=http://localhost:5173
```

CORS must allow the admin origin with **credentials** so the refresh cookie is sent.

---

# PART E — Migration required

```bash
npx prisma migrate deploy
npx prisma generate
```

Relevant migrations:

- `20260920090000_booking_buffer_late_fee_bike_number` — settings fields, booking late fields, `bikeNumber`  
- `20260920103000_admin_refresh_tokens` — `admin_refresh_tokens` table  

---

*End of document. Only endpoints and fields introduced or changed by the Auth + Late Fee + Buffer + Alternatives + Bike Number work are specified in detail; other existing APIs behave as before.*
