# Cancellation release notes

## Apply this backend

1. Unzip and install
   ```bash
   unzip rideon-backend-with-cancellation.zip -d rideon-backend
   cd rideon-backend
   cp .env.example .env   # fill DATABASE_URL, RAZORPAY_*, JWT, etc.
   npm install
   ```

2. Migrate database (required)
   ```bash
   npx prisma migrate deploy
   # or during dev: npx prisma migrate dev
   npx prisma generate
   ```

3. Run
   ```bash
   npm run dev
   # or
   npm start
   ```

## What this adds

- Customer: `GET /bookings/:id/cancellation-preview`, enhanced `PATCH /bookings/:id/cancel`
- Admin: enhanced `PATCH /admin/bookings/:id/cancel`, `POST /admin/bookings/:id/cash-refund`
- Settings: `cancellationPolicy` on GET/PATCH `/admin/settings`
- Razorpay partial refund via original payment id (booking amount only)
- Schema: booking cancellation/refund columns + SystemSetting.cancellationPolicy

See `docs/CANCELLATION-API.md` and `docs/FRONTEND-INTEGRATION-GUIDE.md`.
