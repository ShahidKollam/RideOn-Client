# Final files to copy (helmet + duration 1–72h)

**Only use this folder:**  
`/home/workdir/artifacts/final-copy/`

Ignore older folders (`helmet-changes/`, `booking/`, `payment/`, `backend/`, `server-extracted/`, zips, etc.).  
They are history only and are **not** required for this release.

---

## Map → your Server tree

| Copy from `final-copy/` | Paste into Server |
|-------------------------|-------------------|
| `prisma/schema.prisma` | `prisma/schema.prisma` |
| `prisma/migrations/20260814120000_add_helmet_fields/migration.sql` | `prisma/migrations/20260814120000_add_helmet_fields/migration.sql` |
| `settings/settings.service.js` | `src/modules/settings/settings.service.js` |
| `settings/settings.validation.js` | `src/modules/settings/settings.validation.js` |
| `payment/payment.service.js` | `src/modules/payment/payment.service.js` |
| `payment/payment.validation.js` | `src/modules/payment/payment.validation.js` |
| `payment/payment.controller.js` | `src/modules/payment/payment.controller.js` |
| `booking/pricing.service.js` | `src/modules/booking/pricing.service.js` |
| `booking/availability.service.js` | `src/modules/booking/availability.service.js` |
| `booking/booking.service.js` | `src/modules/booking/booking.service.js` |
| `booking/booking.validation.js` | `src/modules/booking/booking.validation.js` |

**Do not** copy only partial diffs — replace each listed file **entirely** so no logic is lost.

---

## After copy

```bash
npx prisma migrate deploy
# or: npx prisma migrate dev --name add_helmet_fields
npx prisma generate
# restart API
```

---

## What this release includes

### 1) Helmet add-on (0–2)
- Admin: `helmetFirstPrice`, `helmetSecondPrice`, `lateHelmetFee` on SystemSetting
- APIs accept `helmetCount` (0|1|2) on check-availability, create-order, create-booking
- Amount: 1 → first price; 2 → first + second
- Stored on Booking; late return applies `lateHelmetFee` when helmets were taken

### 2) Duration rules
- Min **1 hour** (unchanged)
- Max **72 hours** (new hard limit)
- Pricing:
  - Exact package if it exists (6h → 6h package, 24h → 24h package)
  - Else **compose** existing packages as building blocks (greedy largest-fit; residual rounds up)
  - Examples: 13h → 12h + 1h · 25h → 24h + 1h · 50h → 24h + 24h + 2h · 72h → 24h × 3
- No need for 25–72h rows in Pricing table
- Booking still has one `pricingId` (primary/largest segment); amounts are the composed snapshot
- Deposit charged **once** (max among segments); platform fee + GST once; extraKmRate from primary package

### Unchanged (safe)
- bike module, Razorpay lib, webhook, GST/platform-fee formula structure

---

## Quick API checks

```json
// settings
{ "helmetFirstPrice": 30, "helmetSecondPrice": 20, "lateHelmetFee": 50 }

// availability / create-order
{
  "campusId": "...",
  "pickupAt": "2026-08-15T10:00:00.000Z",
  "returnAt": "2026-08-18T10:00:00.000Z",
  "helmetCount": 2
}
// 72h OK; 73h → 400 Maximum rental duration is 72 hours
```
