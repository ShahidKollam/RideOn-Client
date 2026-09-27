# Frontend Change Document

## Admin Frontend

### Settings / Policies
- Show & edit `bookingBufferMinutes` (minutes)
- Show & edit `disruptionPenalty` (₹)
- Do **not** add a `lateFeeEnabled` toggle

### Bikes
- Create/Edit form: add `bikeNumber` field (e.g. RO-001)
- List/Detail/Table: display `bikeNumber` (prefer over internal id)
- Search should work with bikeNumber (backend already supports)

### Bookings list / detail
- Show 🔴 Late Return when `isLate` or `status===ACTIVE && now > returnAt`
- Show `lateDurationMinutes`
- Bike column: show `bike.bikeNumber`
- Filter: use `?lateOnly=true` or dedicated late-returns endpoint

### Return flow (admin)
1. Call `GET /admin/bookings/:id/late-charges` before confirming return (optional preview)
2. Show calculated late rental, disruption penalty, and **affected booking** warning if present
3. Checkboxes/toggles:
   - Apply Late Fee (default off)
   - Apply Disruption Penalty (default off)
4. Submit `PATCH .../return` with `returnOdometer`, `applyLateFee`, `applyDisruptionPenalty`
5. After return, show outstanding if `paymentSummary.outstandingAmount > 0` and allow collect payment

### Dashboard
- Card/stat for **Late Returns** using `bookings.lateReturns`
- Optional list from `GET /admin/bookings/late-returns`

### Bike status
- Treat `IN_USE` as currently rented; show 🔴 Late / Currently Rented when overdue

---

## Client Frontend

### Availability
- When `available: false`, display `alternatives[]` as suggested time slots
- Selecting an alternative must re-call availability (and then create order) with the new times
- Show buffer only if needed for UX; value comes from backend

### Payment / Checkout
- Display line items:
  - Rental amount (`pricing.rentalAmount`)
  - Outstanding late amount (`pricing.outstandingLateAmount`) if > 0
  - Total payable (`pricing.totalAmount`)
- Outstanding is settled automatically on successful payment (no separate late-fee payment UI required)

### Booking history
- Show `bike.bikeNumber` when present
- If a completed booking still has outstanding, surface it (optional)

### Notifications (backend support only)
- Backend does not emit repeated push; client can poll booking status for overdue if desired
