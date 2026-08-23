# Admin API Contract

Base: `/api/v1/admin`  
Auth: `Authorization: Bearer <token>`

Response: `{ success, message, data, statusCode }`

## Auth
- POST `/auth/login` — body: `{ email, password }`
- GET `/auth/me`
- POST `/auth/logout`

## Dashboard
- GET `/dashboard/overview` — permission: `dashboard.read`

## Users
- GET `/users` — `users.read` — query: page, limit, search, campusId, isVerified, onboardingStatus, createdFrom, createdTo
- GET `/users/:id` — `users.read`
- PATCH `/users/:id` — `users.update` — body: name, phone, hostel, department, yearOfStudy
- PATCH `/users/:id/status` — `users.update` — body: isVerified, onboardingStatus

## Bikes
- POST `/bikes` — `bikes.create`
- GET `/bikes` — `bikes.read`
- GET `/bikes/:id` — `bikes.read`
- PATCH `/bikes/:id` — `bikes.update`
- PATCH `/bikes/:id/status` — `bikes.update` — body: `{ status }`
- DELETE `/bikes/:id` — `bikes.delete`

## Bookings
- POST `/bookings` — `bookings.create` — body: userId, campusId, pricingId, pickupAt, returnAt, bikeId?, helmetCount?, notes?
- GET `/bookings` — `bookings.read`
- GET `/bookings/:id` — `bookings.read`
- PATCH `/bookings/:id/pickup` — `bookings.update` — body: `{ pickupOdometer }`
- PATCH `/bookings/:id/return` — `bookings.update` — body: `{ returnOdometer }`
- PATCH `/bookings/:id/cancel` — `bookings.cancel` — cancels PAYMENT_PENDING|CONFIRMED|ACTIVE|NO_SHOW; releases bike if ACTIVE

## Payments
- GET `/payments` — `payments.read`
- GET `/payments/:id` — `payments.read`

## Pricing (full admin management)
- POST `/pricing` — `pricing.create`
- GET `/pricing` — `pricing.read`
- GET `/pricing/:id` — `pricing.read`
- PATCH `/pricing/:id` — `pricing.update`
- DELETE `/pricing/:id` — `pricing.delete` (soft: isActive=false)

## Policies (settings — full admin management)
- GET `/policies` — `policies.read`
- PATCH `/policies` — `policies.update` — gstEnabled, gstRate, platformFeeEnabled, platformFee, helmetFirstPrice, helmetSecondPrice, lateHelmetFee

## Roles
- GET `/roles` — `roles.read`
- GET `/roles/permissions` — `roles.read`
- GET `/roles/:id` — `roles.read`
- POST `/roles` — `roles.create`
- PATCH `/roles/:id` — `roles.update`
- DELETE `/roles/:id` — `roles.delete`

## Audit
- GET `/audit` — `audit.read` — query: page, limit, adminId, action, entityType, from, to
