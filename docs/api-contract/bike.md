# Bike & Booking Module - Full API Documentation

## Authentication Notes
- User routes: Use `protect` middleware (req.user.id available)
- Admin routes: Use `protectAdmin` middleware
- All responses use `ApiResponse` format: `{ success: true, message: "...", data: {...}, ... }`

## BIKE MODULE

### Public Endpoints

**GET /bikes**
- Description: List bikes (public, with filters)
- Query Params: `page`, `limit`, `search`, `campusId`, `status`, `isActive`
- Response: Paginated list of bikes

**GET /bikes/:id**
- Description: Get single bike details
- Path: `id` (Bike ID)
- Response: Full bike object

### Admin Endpoints

**POST /admin/bikes**
- Body (JSON):
  ```json
  {
    "campusId": "string",
    "registrationNumber": "string",
    "name": "string",
    "brand": "string",
    "model": "string",
    "year": 2023,
    "color": "string",
    "imageUrls": ["https://..."],
    "currentOdometer": 0
  }
  ```
- Response: Created bike

**GET /admin/bikes**
- Same query params as public + admin filters
- Response: Paginated list

**GET /admin/bikes/:id**
- Get single bike (admin)

**PATCH /admin/bikes/:id**
- Body: Partial update fields (name, brand, etc.)

**PATCH /admin/bikes/:id/status**
- Body: `{"status": "AVAILABLE" | "MAINTENANCE" | "DISABLED" | "RETIRED"}`

**DELETE /admin/bikes/:id**
- Soft delete (isActive = false)

## BOOKING MODULE

### Pricing (Admin Only)

**POST /admin/pricing**
- Body: Pricing details (campusId, packageName, durationHours, price, etc.)

**GET /admin/pricing**
- List pricings (with pagination/filter)

**GET /admin/pricing/:id**, **PATCH /admin/pricing/:id**, **DELETE /admin/pricing/:id**

### User Booking Endpoints

**POST /bookings**
- Body:
  ```json
  {
    "campusId": "string",
    "pickupAt": "2026-07-20T10:00:00Z",
    "returnAt": "2026-07-22T10:00:00Z",
    "pricingId": "string",
    "notes": "optional"
  }
  ```
- Validates user, no active booking, availability, etc.
- Creates PAYMENT_PENDING booking

**GET /bookings**
- List user's bookings (paginated, searchable)

**GET /bookings/:id**
- Get specific booking

**PATCH /bookings/:id/cancel**
- Cancel PAYMENT_PENDING or CONFIRMED booking

### Admin Booking Endpoints

**POST /admin/bookings**
- Same as user but includes `userId` in body (for walk-ins)

**GET /admin/bookings**
- Admin list (all bookings, search by bookingNumber/user/bike)

**GET /admin/bookings/:id**

**PATCH /admin/bookings/:id/pickup**
- Body: `{"pickupOdometer": 12345}`
- Assigns bike if needed, sets ACTIVE

**PATCH /admin/bookings/:id/return**
- Body: `{"returnOdometer": 12500}`
- Calculates KM, fees, sets COMPLETED

**PATCH /admin/bookings/:id/cancel**
- Admin cancel

## Error Responses
- Standard `ApiError` with status codes (400, 404, 409, etc.)
- Examples: "No available bikes", "User has active booking", etc.

**Pagination Response Example**:
```json
{
  "bikes": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

For full OpenAPI-like details or Postman collection, let me know.
