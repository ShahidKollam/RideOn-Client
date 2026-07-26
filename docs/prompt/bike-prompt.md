You are extending an existing production-ready backend project.
This project already has an established architecture, coding style, utilities, authentication flow, middleware, and project structure.
Your job is to build new modules that integrate seamlessly into the existing codebase.
DO NOT redesign or refactor the existing project.
=========================================================
PROJECT STACK
=========================================================

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JavaScript (ES Modules)
- # Service Layer Architecture
    # CURRENT PROJECT ARCHITECTURE
    Follow the existing project architecture exactly.
    src/
    api/
    routes.js
    config/
    env.js
    prisma.js
    logger.js
    mail.js
    lib/
    jwt.js
    mailer.js
    middlewares/
    auth.middleware.js
    validation.middleware.js
    error.middleware.js
    notFound.middleware.js
    modules/
    auth/
    admin/
    user/
    campus/
    driving-license/
    bike/
    booking/
    utils/
    ApiError.js
    ApiResponse.js
    asyncHandler.js
    helpers.js
    app.js
    server.js
    =========================================================
    PRISMA ARCHITECTURE
    =========================================================
    The project uses ONE Prisma schema only.
    Use
    src/prisma/schema.prisma
    Do NOT split Prisma models into multiple files.
    Do NOT create
    user.prisma
    bike.prisma
    booking.prisma
    etc.
    All models must remain inside the single schema.prisma file.
    =========================================================
    PROJECT STANDARDS
    =========================================================
    Follow the same architecture as the existing Auth module.
    Controllers
    ↓
    Services
    ↓
    Prisma
    ↓
    Database
    Business logic belongs ONLY inside Services.
    Controllers should only
- validate request
- call service
- return ApiResponse
  Never place business logic inside controllers.
  =========================================================
  GENERAL BACKEND REQUIREMENTS
  =========================================================
  Use
- Service Layer Architecture
- Prisma ORM
- async/await
- ApiError
- ApiResponse
- asyncHandler
- Existing middleware
- Existing auth flow
- Existing response format
  Support
- Pagination
- Searching
- Filtering
  Use Prisma transactions only where required.
  Keep controllers thin.
  Use reusable services.
  Write production-ready code.
  Avoid duplicated logic.
  Follow SOLID principles where practical.
  Readable naming.
  Clean code.
  Comments only where necessary.
  =========================================================
  DO NOT CHANGE EXISTING PROJECT
  =========================================================
  Do NOT
- Rename folders
- Rename files
- Rename utilities
- Rename middleware
- Change authentication flow
- Change JWT logic
- Change response format
- Change error handling
- Change project structure
- Change route prefixes
- Change coding style
  New modules must integrate without breaking existing functionality.
  =========================================================
  AUTHENTICATION
  =========================================================
  Existing authentication already exists.
  User authentication
  protect
  Admin authentication
  protectAdmin
  Continue using these middlewares.
  Do NOT redesign authentication.
  Do NOT implement RBAC.
  Do NOT implement admin roles.
  Current project uses only
  User
  Admin
  =========================================================
  MODULE 1
  BIKE MODULE
  =========================================================
  Create
  modules/
  bike/
  bike.controller.js
  bike.service.js
  bike.routes.js
  bike.validation.js
  =========================================================
  OBJECTIVE
  =========================================================
  Bike module manages physical bikes only.
  It must NOT contain
- booking logic
- pricing
- payment
- rental logic
- # availability calculation
    # PRISMA MODEL
    Bike
    Fields
    id
    campusId (FK)
    registrationNumber (unique)
    name
    brand
    model
    year (nullable)
    color (nullable)
    imageUrls (String[])
    currentOdometer (default 0)
    status
    AVAILABLE
    MAINTENANCE
    DISABLED
    RETIRED
    isActive (default true)
    createdAt
    updatedAt
    Indexes
    registrationNumber
    campusId
    status
    isActive
    Notes
    Do NOT create BikeImage table.
    Store imageUrls as String[].
    Do NOT store pricing.
    Do NOT store booking information.
    =========================================================
    VALIDATION
    =========================================================
    Create Bike
    Required
    campusId
    registrationNumber
    name
    brand
    model
    Optional
    year
    color
    imageUrls
    currentOdometer
    =========================================================
    SERVICE METHODS
    =========================================================
    createBike()
    updateBike()
    getBikeById()
    getBikeList()
    changeBikeStatus()
    deleteBike()
    =========================================================
    REQUIREMENTS
    =========================================================
    createBike()
- verify campus exists
- registration number unique
- create bike
  updateBike()
- editable fields only
  getBikeList()
  Support
  pagination
  search
  registration number
  bike name
  brand
  model
  filter
  campus
  status
  isActive
  Sort
  createdAt DESC
  getBikeById()
  Return complete bike.
  changeBikeStatus()
  Allowed
  AVAILABLE
  MAINTENANCE
  DISABLED
  RETIRED
  deleteBike()
  Soft delete only
  isActive=false
  =========================================================
  ROUTES
  =========================================================
  Admin
  POST
  /admin/bikes
  GET
  /admin/bikes
  GET
  /admin/bikes/:id
  PATCH
  /admin/bikes/:id
  PATCH
  /admin/bikes/:id/status
  DELETE
  /admin/bikes/:id
  Public
  GET
  /bikes
  GET
  /bikes/:id
  =========================================================
  MODULE 2
  BOOKING MODULE
  =========================================================
  Create
  modules/
  booking/
  booking.controller.js
  booking.service.js
  booking.validation.js
  booking.user.routes.js
  booking.admin.routes.js
  pricing.controller.js
  pricing.service.js
  pricing.validation.js
  pricing.admin.routes.js
  =========================================================
  OBJECTIVE
  =========================================================
  Booking module manages
  Booking lifecycle
  Pricing
  Bike assignment
  Pickup
  Return
  Cancellation
  =========================================================
  PRISMA MODELS
  =========================================================
  Pricing
  id
  campusId
  packageName
  durationHours
  price
  includedKm
  extraKmRate
  depositAmount
  displayOrder (default 0)
  isFeatured
  isActive
  createdAt
  updatedAt
  Indexes
  campusId
  displayOrder
  isActive
  Notes
  Soft delete only.
  =========================================================
  Booking
  id
  bookingNumber (unique)
  userId
  bikeId (nullable)
  campusId
  pickupAt
  returnAt
  durationHours
  status
  paymentStatus
  baseAmount
  depositAmount
  discountAmount
  totalAmount
  includedKm
  extraKmRate
  pickupOdometer
  returnOdometer
  actualKm
  extraKm
  extraKmCharge
  lateFee
  pickedUpAt
  returnedAt
  notes
  createdAt
  updatedAt
  Indexes
  bookingNumber
  userId
  bikeId
  campusId
  status
  pickupAt
  returnAt
  =========================================================
  IMPORTANT
  =========================================================
  Do NOT store pricingId.
  Pricing is used ONLY while creating a booking.
  Booking must store pricing snapshot.
  Store
  baseAmount
  depositAmount
  includedKm
  extraKmRate
  durationHours
  After booking creation
  Booking must never depend on Pricing.
  Historical bookings must remain immutable.
  =========================================================
  BOOKING STATUS
  =========================================================
  PAYMENT_PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
  FAILED
  NO_SHOW
  Allowed transitions
  PAYMENT_PENDING
  ↓
  CONFIRMED
  ↓
  ACTIVE
  ↓
  COMPLETED
  Alternative
  PAYMENT_PENDING
  ↓
  FAILED
  CONFIRMED
  ↓
  CANCELLED
  CONFIRMED
  ↓
  NO_SHOW
  =========================================================
  PAYMENT STATUS
  =========================================================
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  =========================================================
  BOOKING VALIDATION
  =========================================================
  Validate
  User exists
  User verified
  Profile completed
  Driving license approved
  Pickup before return
  Minimum duration
  1 hour
  User has no ACTIVE booking
  Pricing package exists
  Pricing active
  Find at least one available bike
  =========================================================
  BIKE AVAILABILITY
  =========================================================
  Never store
  bike.available
  Availability must always be calculated.
  Logic
  Find bikes
  ↓
  Exclude overlapping bookings
  ↓
  Return available bike
  Overlap rule
  existingPickup < newReturn
  AND
  existingReturn > newPickup
  =========================================================
  PRICING SERVICE
  =========================================================
  Pricing service calculates
  Duration
  Base Rent
  Deposit
  Included KM
  Extra KM Rate
  Booking service must reuse Pricing service.
  =========================================================
  BOOKING SERVICE
  =========================================================
  Implement
  createBooking()
  calculatePrice()
  findAvailableBike()
  assignBike()
  cancelBooking()
  pickupBooking()
  returnBooking()
  getBooking()
  getBookings()
  =========================================================
  BIKE ASSIGNMENT
  =========================================================
  Bike assignment should happen during pickup.
  Do NOT permanently reserve a bike at booking creation.
  Booking.bikeId should be nullable.
  Flow
  Booking
  ↓
  CONFIRMED
  ↓
  Pickup
  ↓
  Assign available bike
  ↓
  ACTIVE
  =========================================================
  BOOKING NUMBER
  =========================================================
  Generate unique human-readable booking numbers.
  Example
  BK2026000001
  Implement generation inside the Booking service.
  =========================================================
  PICKUP
  =========================================================
  Validate
  Booking status
  CONFIRMED
  Pickup window valid
  Bike available
  Bike status AVAILABLE
  Driving license approved
  Assign bike
  Store pickup odometer
  Update
  Status
  ACTIVE
  =========================================================
  RETURN
  =========================================================
  Calculate
  Actual KM
  Extra KM
  Extra KM Charge
  Late Fee
  Final Amount
  Store
  Return odometer
  returnedAt
  Status
  COMPLETED
  =========================================================
  CANCELLATION
  =========================================================
  Allow cancellation only for
  PAYMENT_PENDING
  CONFIRMED
  ACTIVE bookings cannot be cancelled.
  Completed bookings cannot be cancelled.
  =========================================================
  ADMIN BOOKING
  =========================================================
  Create an Admin Booking API.
  Admin can create bookings on behalf of any user.
  Example
  Walk-in booking
  Phone booking
  Offline booking
  Admin selects
  User
  Pickup
  Return
  Pricing
  Use EXACTLY the same createBooking() service.
  Do NOT duplicate business logic.
  Difference
  User booking
  userId comes from
  req.user.id
  Admin booking
  userId comes from
  request body
  Do NOT store
  bookedBy
  createdBy
  or similar fields.
  =========================================================
  ROUTES
  =========================================================
  USER
  POST
  /bookings
  GET
  /bookings
  GET
  /bookings/:id
  PATCH
  /bookings/:id/cancel
  GET
  /pricing
  ADMIN
  POST
  /admin/bookings
  GET
  /admin/bookings
  GET
  /admin/bookings/:id
  PATCH
  /admin/bookings/:id/pickup
  PATCH
  /admin/bookings/:id/return
  PATCH
  /admin/bookings/:id/cancel
  POST
  /admin/pricing
  GET
  /admin/pricing
  GET
  /admin/pricing/:id
  PATCH
  /admin/pricing/:id
  DELETE
  /admin/pricing/:id
  =========================================================
  LIST APIS
  =========================================================
  Support
  Pagination
  Searching
  Filtering
  Sort
  Newest first
  Search
  Booking Number
  User Name
  User Email
  Bike Registration Number
  Bike
  Registration Number
  Bike Name
  Brand
  Model
  Inactive records should be excluded by default unless explicitly requested by admin.
  =========================================================
  DO NOT IMPLEMENT
  =========================================================
  Do NOT implement
  Razorpay
  Payment gateway
  Coupons
  Referral system
  Email notifications
  PDF agreements
  Maintenance history
  RBAC
  Admin Roles
  =========================================================
  DELIVERY FORMAT
  =========================================================
  Generate one ZIP archive per module.
  Example
  bike.zip
  booking.zip
  Each ZIP should contain
- module files
- Prisma schema additions
- route registration snippet
- external files only if required
  Do NOT generate the entire project.
  Generate only files required for the requested module.
  =========================================================
  DEPENDENCIES
  =========================================================
  If any module requires
- npm packages
- Prisma migration
- Environment variables
  List them clearly at the end.
  Example
  npm install dayjs
  New ENV
  BOOKING_TIMEOUT=15
  Migration
  npx prisma migrate dev --name add-booking-module
  =========================================================
  FINAL REQUIREMENT
  =========================================================
  Generate complete production-ready code.
  No pseudo-code.
  No TODOs.
  No placeholders.
  Every generated file must be directly usable inside the existing project while following the established architecture exactly.
- =========================================================
  API CONTRACT
  =========================================================
  For every endpoint, follow this standard flow.
  Validation
  ↓
  Controller
  ↓
  Service
  ↓
  Prisma
  ↓
  ApiResponse
  Controllers must only
- Read request
- Call validation middleware
- Call service
- Return ApiResponse
  Controllers must never contain business logic.
  Every endpoint should have
- Validation schema
- Controller
- Service
- Route
  Every API should return the existing ApiResponse format.
  Implement complete REST APIs.
  Do not leave endpoints with empty services or placeholder implementations.

---

## Every service method must contain meaningful business logic. Do not generate skeleton methods or placeholder implementations. If a service is listed, fully implement its validation, business rules, Prisma queries, calculations, transactions (where required), and error handling.

## Also give api contract for frontend dev in simple in md file like earlier.

=========================================================
API DOCUMENTATION
=========================================================
Generate OpenAPI-compatible API documentation.
Document every endpoint with

- Summary
- Description
- Request Body
- Path Parameters
- Query Parameters
- Response Schema
- Error Responses
  Keep documentation synchronized with the generated APIs.
  If the project does not currently use Swagger/OpenAPI, do not introduce a new documentation framework automatically.
  Instead, generate concise Markdown documentation only for the newly created modules.
