# Server v1.2.21 — Admin desk / walk-in booking (shared Walk-in User)

## Goal
Admin can create bookings without creating customer User accounts.
All desk bookings attach to one shared system user; guest details live on the booking.

## One-time setup
1. Apply migration `20261024120000_booking_guest_fields` (guestName, guestEmail, guestPhone).
2. Run walk-in seed:
   `node prisma/seed/seed-walkin-user.js`
   Creates user `walkin@rideon.internal` if missing.

## New admin APIs (auth + `bookings.create`)
- `POST /admin/bookings/check-availability` — same availability + alternatives as customer.
- `POST /admin/bookings/available-bikes` — bikes free for slot, ordered by currentOdometer ASC.
- `POST /admin/bookings/desk` — create desk booking:
  - body: campusId, pricingId, pickupAt, returnAt, bikeId, guestName, guestEmail, guestPhone?, helmetCount?, notes?
  - userId = walk-in user (internal)
  - rechecks availability + bike slot
  - status CONFIRMED, paymentStatus PAID (same as existing admin create)
  - confirmation email to **guestEmail only** (no signup / no magic link)

## Unchanged
- Customer check-availability / create booking
- Legacy `POST /admin/bookings` with userId
- Pickup / return / cancel / payments
- Client My Bookings (only real userId)

## Flow
Check Availability → Select slot → Guest form → Select bike (odometer) → Confirm desk booking
