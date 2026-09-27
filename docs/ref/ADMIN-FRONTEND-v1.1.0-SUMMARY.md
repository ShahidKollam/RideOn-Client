# RideOn Admin Frontend v1.1.0 — Implementation Summary

## Version
- Package version: **1.1.0**
- Zip: `rideon-admin-frontend-v1.1.0.zip`

## What changed

### Settings (ADMIN-FE-02)
- Replaced UnderDevelopment stub with full Settings page
- Fields: GST, platform fee, helmet pricing, **bookingBufferMinutes**, **disruptionPenalty**, lateHelmetFee
- No `lateFeeEnabled` toggle
- Mobile: stacked full-width cards

### Bike Number (ADMIN-FE-03 / 16)
- Create/Edit form: optional `bikeNumber` (e.g. RO-001)
- List column & detail show bike number
- Search still uses backend (supports bikeNumber)

### Bookings list (ADMIN-FE-04)
- `lateOnly` filter checkbox
- Bike number column + late indicator
- Deep-link `?late=1` from dashboard

### Booking Details Page (ADMIN-FE-05–15)
- **New route:** `/bookings/:id`
- Replaces booking **details drawer** (drawer disabled; other drawers kept)
- Scheduled vs actual timeline
- Late preview from `GET /bookings/:id/late-charges`
- Affected booking warning + link
- Return modal: odometer + Apply Late Fee + Apply Disruption Penalty (default off)
- Outstanding collect payment modal
- Pickup / cancel preserved

### Dashboard (ADMIN-FE-09)
- Live `bookings.lateReturns` from `GET /dashboard/overview`
- Banner links to `/bookings?late=1`

### Mobile table UX
- New shared: `src/components/ui/MobileList.jsx` (`MobileCard`, `MobileList`)
- Mobile cards (no wide horizontal tables) for:
  - Bookings
  - Bikes
  - Users
  - Payments
  - Pricing
- Desktop: existing `DataTable` unchanged (`hidden md:block`)

### Auth
- **Not modified** — continues using existing AuthContext / api client

## Files touched
- `src/modules/settings/pages/SettingsPage.jsx` (new implementation)
- `src/modules/bookings/pages/BookingDetailPage.jsx` (new)
- `src/modules/bookings/pages/BookingsPage.jsx`
- `src/modules/bikes/pages/BikesPage.jsx`
- `src/modules/users/pages/UsersPage.jsx`
- `src/modules/payments/pages/PaymentsPage.jsx`
- `src/modules/pricing/pages/PricingPage.jsx`
- `src/modules/dashboard/pages/DashboardPage.jsx`
- `src/routes/index.jsx`
- `src/components/ui/MobileList.jsx` (new)
- `src/components/ui/StatusBadge.jsx` (LATE_RETURN, IN_USE)
- `package.json` → 1.1.0

## Preserved
- Desktop table layouts
- Auth / RBAC / JWT session
- Other drawers (user, bike, payment, pricing, etc.)
- No backend/API contract changes
- No business calculation logic in the frontend

## Run
```bash
unzip rideon-admin-frontend-v1.1.0.zip
cd rideon-admin-v110
npm install
npm run dev
```
