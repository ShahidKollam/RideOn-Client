# RideOn Admin Backend Module (Fully Independent)

Complete admin API. **No reuse of client services.** All admin logic uses Prisma directly.

## Rules followed

- Admin-only features under `/api/v1/admin/*`
- Settings + pricing management fully admin
- Admin create / cancel / pickup / return booking
- No imports from `bike.service`, `booking.service`, `pricing.service`, `settings.service`
- Client modules untouched — you wire routes yourself
- Old admin routes kept (not removed)
- Naming: `*.admin.js`

## Structure

```
src/modules/admin/
  admin.routes.js
  auth/ dashboard/ users/ bikes/ bookings/
  payments/ pricing/ policies/ roles/ audit/
src/middlewares/
  authenticateAdmin.js
  requirePermission.js
prisma/
  schema.admin.prisma.snippet
  migrations/20260820120000_add_admin_foundation/
  seed/seed-admin.js
```

## Setup

1. Copy into Server (see INTEGRATION.md)
2. Append Prisma models + migrate + generate
3. Seed: `ADMIN_EMAIL=... ADMIN_PASSWORD=... node prisma/seed/seed-admin.js`
4. Mount: `router.use('/admin', adminRoutes)` in routes.js (keep old mounts)
