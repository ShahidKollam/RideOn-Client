
# ADMIN APIs

## 1. Bike Module (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/bikes` | `protectAdmin` | Create bike |
| `GET` | `/admin/bikes` | `protectAdmin` | List bikes |
| `GET` | `/admin/bikes/:id` | `protectAdmin` | Get bike |
| `PATCH` | `/admin/bikes/:id` | `protectAdmin` | Update bike |
| `PATCH` | `/admin/bikes/:id/status` | `protectAdmin` | Change status |
| `DELETE` | `/admin/bikes/:id` | `protectAdmin` | Soft delete |

### 1.1 Create Bike
**Payload:**
```json
{
  "campusId": "clx...",
  "registrationNumber": "MH12AB1234",
  "name": "Honda Activa 6G",
  "brand": "Honda",
  "model": "Activa 6G",
  "year": 2024,
  "color": "Pearl White",
  "imageUrls": [
    "https://example.com/bike1.jpg",
    "https://example.com/bike2.jpg"
  ],
  "currentOdometer": 1250
}
```

### 1.2 Update Bike
**Endpoint:** `PATCH /admin/bikes/:id`

**Payload (all fields optional):**
```json
{
  "name": "Honda Activa 6G Updated",
  "brand": "Honda",
  "model": "Activa 6G",
  "year": 2024,
  "color": "Matte Black",
  "imageUrls": [
    "https://example.com/new-image.jpg"
  ],
  "currentOdometer": 1800
}
```

### 1.3 Change Bike Status
**Endpoint:** `PATCH /admin/bikes/:id/status`

**Payload:**
```json
{
  "status": "AVAILABLE"
}
```
Allowed values: `AVAILABLE` | `MAINTENANCE` | `DISABLED` | `RETIRED`

### 1.4 Soft Delete Bike
**Endpoint:** `DELETE /admin/bikes/:id`  
No body required. Sets `isActive = false`.

---

## 2. Pricing Module (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/pricing` | `protectAdmin` | Create pricing |
| `GET` | `/admin/pricing` | `protectAdmin` | List pricing |
| `GET` | `/admin/pricing/:id` | `protectAdmin` | Get pricing |
| `PATCH` | `/admin/pricing/:id` | `protectAdmin` | Update pricing |
| `DELETE` | `/admin/pricing/:id` | `protectAdmin` | Soft delete |

### 2.1 Create Pricing
**Payload:**
```json
{
  "campusId": "clx...",
  "packageName": "4 Hour Package",
  "durationHours": 4,
  "price": 250,
  "includedKm": 40,
  "extraKmRate": 5,
  "depositAmount": 500,
  "displayOrder": 1,
  "isFeatured": true,
  "isActive": true
}
```

### 2.2 Update Pricing
**Endpoint:** `PATCH /admin/pricing/:id`

**Payload (all fields optional):**
```json
{
  "packageName": "4 Hour Package Updated",
  "durationHours": 4,
  "price": 280,
  "includedKm": 45,
  "extraKmRate": 6,
  "depositAmount": 600,
  "displayOrder": 2,
  "isFeatured": false,
  "isActive": true
}
```

### 2.3 Soft Delete Pricing
**Endpoint:** `DELETE /admin/pricing/:id`  
No body. Sets `isActive = false`.

---

## 3. Booking Module (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/bookings` | `protectAdmin` | Create booking for any user |
| `GET` | `/admin/bookings` | `protectAdmin` | List all bookings |
| `GET` | `/admin/bookings/:id` | `protectAdmin` | Get booking |
| `PATCH` | `/admin/bookings/:id/pickup` | `protectAdmin` | Mark pickup |
| `PATCH` | `/admin/bookings/:id/return` | `protectAdmin` | Mark return |
| `PATCH` | `/admin/bookings/:id/cancel` | `protectAdmin` | Cancel booking |

### 3.1 Admin Create Booking
**Payload:**
```json
{
  "userId": "clx...",
  "bikeId": "clx...",
  "campusId": "clx...",
  "pickupAt": "2026-08-05T10:00:00.000Z",
  "returnAt": "2026-08-05T14:00:00.000Z",
  "notes": "Walk-in / Phone booking"
}
```

### 3.2 Pickup Booking
**Endpoint:** `PATCH /admin/bookings/:id/pickup`

**Payload:**
```json
{
  "pickupOdometer": 1250
}
```
Allowed only when status is `CONFIRMED`.

### 3.3 Return Booking
**Endpoint:** `PATCH /admin/bookings/:id/return`

**Payload:**
```json
{
  "returnOdometer": 1320
}
```
Allowed only when status is `ACTIVE`.  
System calculates `actualKm`, `extraKm`, `extraKmCharge`, and updates total.

### 3.4 Cancel Booking (Admin)
**Endpoint:** `PATCH /admin/bookings/:id/cancel`

**Payload (optional):**
```json
{
  "reason": "Customer requested cancellation"
}
```

---

### Important Business Rules (from your code)

- Bike is locked at **booking creation** time.
- 15-minute buffer is enforced between bookings on the same bike.
- Pricing is auto-selected by the server based on `durationHours`.
- User must have:
  - Verified email
  - `onboardingStatus = PROFILE_COMPLETED`
  - Driving license status = `APPROVED`
- Soft delete is used for both Bike and Pricing.

Would you like me to also generate a clean Markdown file or a Postman collection JSON for these contracts?