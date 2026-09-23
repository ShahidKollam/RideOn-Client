# RideOn Client Frontend v1.2.0 — Customer Booking Cancellation

## Version
- Package: **1.2.0**
- Zip: `rideon-client-frontend-v1.2.0.zip`

## 1. Components / files changed
| Path | Change |
|------|--------|
| `src/services/bookingService.js` | Added `getCancellationPreview(id)`; `cancelBooking` sends empty body `{}` |
| `src/components/bookings/CancellationModal.jsx` | **New** — mobile-friendly confirmation modal |
| `src/pages/BookingDetailsPage.jsx` | Preview → modal → confirm flow; cancelled details panel |
| `src/components/bookings/BookingCard.jsx` | Status badge colors (CANCELLED red, etc.) |
| `package.json` | version → 1.2.0 |

## 2. Cancellation UI added
- **Cancel booking** button on booking details (only when eligible)
- Confirmation modal with:
  - Booking amount
  - Cancellation fee (percentage + amount from backend)
  - Refund amount
  - Hours remaining
  - Note: “Refund will be returned to your original payment method.”
- Loading spinner while fetching preview
- Disabled confirm while processing (prevents duplicates)
- Cancelled booking panel: fee, refund amount, refund status (SUCCESS / PENDING / FAILED), cancelled at

## 3. APIs integrated
- `GET /bookings/:id/cancellation-preview` — before showing modal content
- `PATCH /bookings/:id/cancel` with body `{}` — no money fields sent
- `GET /bookings/:id` — refresh after cancel; uses `data.cancellation`

## 4. Loading / error handling
- Preview loading state inside modal; confirm button hidden until preview succeeds and `canCancel === true`
- Preview failure: error UI + retry; modal does not allow confirm with incomplete data
- Cancel processing: confirm button disabled + “Cancelling…”
- Cancel failure: toast with backend error; booking state unchanged; user can retry

## 5. Confirmations
- **No cancellation/refund calculations in the frontend** — all amounts, percentages, hours, and eligibility come from the backend
- **No money amounts sent** in PATCH cancel body
- **Existing booking / payment / authentication logic preserved** — only client UI for cancellation updated

## Run
```bash
unzip rideon-client-frontend-v1.2.0.zip
cd rideon-client-work
npm install
# set VITE_API_BASE_URL if needed
npm run dev
```
