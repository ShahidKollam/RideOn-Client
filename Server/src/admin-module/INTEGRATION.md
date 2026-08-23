# Integration Guide — Independent Admin Module

## Copy files

```
Server/
├── prisma/
│   ├── migrations/20260820120000_add_admin_foundation/migration.sql
│   └── seed/seed-admin.js
├── src/
│   ├── middlewares/
│   │   ├── authenticateAdmin.js
│   │   └── requirePermission.js
│   └── modules/admin/          ← entire tree
```

## Prisma

Append models from `prisma/schema.admin.prisma.snippet` to `schema.prisma`.  
Add on Campus: `admins Admin[]`

```bash
npx prisma migrate dev --name add_admin_foundation
npx prisma generate
```

## Seed

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 node prisma/seed/seed-admin.js
```

## Mount (manual — keep existing client + old admin routes)

```js
import adminRoutes from '../modules/admin/admin.routes.js'
router.use('/admin', adminRoutes)
// keep existing: /admin/bikes, /admin/bookings, /admin/pricing, /admin/settings, client routes
```

## Independence

Admin services import only:
- `config/prisma`
- `utils/ApiError`, `utils/ApiResponse`, `utils/asyncHandler`
- `lib/jwt`
- `middlewares/*`

No imports from client `bike/`, `booking/`, `payment/`, `settings/` services.
