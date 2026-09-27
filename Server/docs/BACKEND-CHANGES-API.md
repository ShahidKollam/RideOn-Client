# API Documentation — Backend Changes

## Settings

### GET /admin/settings (or existing settings GET)
**New response fields:**
- `bookingBufferMinutes` (number, default 15)
- `disruptionPenalty` (number, default 150)

### PATCH /admin/settings
**New request fields (optional):**
- `bookingBufferMinutes` (0–180 integer)
- `disruptionPenalty` (>= 0)

---

## Availability

### POST /bookings/check-availability (or existing availability endpoint)
**Unchanged when available:** `available: true` + existing pricing fields  
**When unavailable — new fields:**
```json
{
  "available": false,
  "reason": "No available bikes for the selected time",
  "bookingBufferMinutes": 15,
  "alternatives": [
    {
      "pickupAt": "ISO",
      "returnAt": "ISO",
      "durationHours": 6,
      "sameDuration": true
    }
  ]
}
```
Also returns `bookingBufferMinutes` when available.

---

## Bikes

### POST /admin/bikes, PATCH /admin/bikes/:id
**New field:** `bikeNumber` (string, unique, optional)

### GET bike list/detail / booking responses
Bike objects now include `bikeNumber` where bike is selected.

---

## Admin Bookings — Return

### PATCH /admin/bookings/:id/return
**Request body:**
```json
{
  "returnOdometer": 12345,
  "applyLateFee": false,
  "applyDisruptionPenalty": false
}
```
**Response additions:**
- `lateDurationMinutes`
- `lateFee` / `disruptionPenalty` (applied amounts)
- `lateFeeApplied` / `disruptionPenaltyApplied`
- `lateChargeDetails` (calculated + affectedBooking)
- `paymentSummary.outstandingAmount`
- `bike.bikeNumber`

### GET /admin/bookings/:id/late-charges
Preview calculated late rental + disruption + affected booking (ACTIVE only).

### GET /admin/bookings/late-returns
```json
{
  "currentlyLateCount": 2,
  "items": [
    {
      "bookingId": "...",
      "status": "LATE_RETURN",
      "lateDurationMinutes": 30,
      "bike": { "id": "...", "bikeNumber": "RO-001" }
    }
  ]
}
```

### GET /admin/bookings?lateOnly=true
Filter late / overdue bookings.

---

## Admin Dashboard

### GET /admin/dashboard (overview)
**New fields:**
- `bookings.lateReturns` (count of ACTIVE past returnAt)
- `bikes.inUse`

---

## Client Payment

### POST /payments/create-order (existing)
**Response pricing additions:**
- `rentalAmount` — new booking amount only
- `outstandingLateAmount` — from previous completed unpaid bookings
- `outstandingBookings` — list of those bookings
- `totalAmount` = rentalAmount + outstandingLateAmount

On successful verify, previous outstanding bookings are marked PAID.

---

## No new public client endpoints required beyond existing flows.
