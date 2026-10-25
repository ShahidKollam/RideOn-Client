# Admin UI v1.2.3 — Bookings sidebar + Reserve a Ride

## Sidebar
- Bookings is expandable with bullet sub-items:
  - **All Bookings** → `/bookings`
  - **Reserve a Ride** → `/bookings/reserve`
- Auto-expands when on any `/bookings*` route
- Collapsed mode still links to All Bookings

## Reserve a Ride (desk / walk-in)
Mobile-first 4-step flow:
1. Check availability (campus, pickup, return, helmets) → count or alternatives
2. Guest form (name*, email*, phone, notes) — no user create
3. Select bike (lowest odometer first)
4. Confirm pricing → `POST /admin/bookings/desk`

Requires server **v1.2.21+** (desk APIs + walk-in user seed + guest columns).

## All Bookings
- **+ Reserve a Ride** header CTA
- Customer column shows `guestName` / desk marker when present

## Unchanged
- Other modules, calendar (not built), customer app
