# RideOn Backend — Incremental Update (2026-09-20)

## Features implemented

### BOOKING-2 — Configurable Booking Buffer
- `SystemSetting.bookingBufferMinutes` (default 15)
- Admin can update via existing Settings API
- `checkBikeAvailability` / `findAvailableBike` read buffer from settings (no hardcode)

### BOOKING-3 — Alternative Available Time Slots
- When exact range is unavailable, availability API returns up to 5 `alternatives`
- Same duration preferred, then shorter; never longer; ranked by proximity
- Uses same buffer-aware availability logic

### LATE-FEE-1 / LATE-FEE-2 — Late Return & Late Fee
- Settings: `bookingBufferMinutes`, `disruptionPenalty` (default ₹150)
- On return admin can choose `applyLateFee` and/or `applyDisruptionPenalty`
- Late rental charge calculated via existing `findPricingByDuration`
- `lateDurationMinutes`, `disruptionPenalty`, flags stored on Booking
- Affected booking info returned for admin decision
- Bike stays `IN_USE` until actual return
- Late return stats: `GET /admin/bookings/late-returns`
- Preview: `GET /admin/bookings/:id/late-charges`
- Dashboard includes `bookings.lateReturns` count

### BIKE-1 / BIKE-2 — Bike Number
- `Bike.bikeNumber` (unique, optional string, e.g. RO-001)
- Create/update validation for duplicates
- Included in booking/bike responses

### CLIENT-BE-1 — Outstanding Late Amount
- `getUserOutstandingLateAmount(userId)`
- Included in payment `createOrder` as separate line; added to payable total
- On successful verify, previous outstanding bookings marked PAID

## Migration
```bash
npx prisma migrate deploy
# or
npx prisma migrate dev
npx prisma generate
```

Migration: `20260920090000_booking_buffer_late_fee_bike_number`
