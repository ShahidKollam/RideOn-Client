**Complete Admin API Contract** (corrected + pagination included)

Base path for admin routes: `/admin`  
Auth: all endpoints below require `protectAdmin` (Bearer token with admin role) unless noted.  
Standard success response shape:


{
  "success": true,
  "message": "...",
  "data": { ... }
}


List endpoints always return:


{
  "success": true,
  "message": "...",
  "data": {
    "<items>": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}


---

## 0. Auth (Admin)

| Method | Endpoint       | Auth           | Description                         |
| ------ | -------------- | -------------- | ----------------------------------- |
| `POST` | `/auth/login`  | None           | Admin login                         |
| `GET`  | `/auth/me`     | `protectAdmin` | Current admin profile + permissions |
| `POST` | `/auth/logout` | `protectAdmin` | Logout / invalidate session         |

**Login payload**


{
    "email": "admin@rideon.com",
    "password": "Admin@12345"
}


---

## 1. Bike Module (Admin)

| Method   | Endpoint                  | Auth           | Description                      |
| -------- | ------------------------- | -------------- | -------------------------------- |
| `POST`   | `/admin/bikes`            | `protectAdmin` | Create bike                      |
| `GET`    | `/admin/bikes`            | `protectAdmin` | List bikes (paginated)           |
| `GET`    | `/admin/bikes/:id`        | `protectAdmin` | Get bike                         |
| `PATCH`  | `/admin/bikes/:id`        | `protectAdmin` | Update bike                      |
| `PATCH`  | `/admin/bikes/:id/status` | `protectAdmin` | Change status                    |
| `DELETE` | `/admin/bikes/:id`        | `protectAdmin` | Soft delete (`isActive = false`) |

### 1.1 Create Bike

**POST** `/admin/bikes`


{
    "campusId": "clx...",
    "registrationNumber": "MH12AB1234",
    "name": "Honda Activa 6G",
    "brand": "Honda",
    "model": "Activa 6G",
    "year": 2024,
    "color": "Pearl White",
    "imageUrls": ["https://example.com/bike1.jpg"],
    "currentOdometer": 1250
}


- `year`, `color`, `imageUrls`, `currentOdometer` optional
- `currentOdometer` defaults to `0`

### 1.2 List Bikes

**GET** `/admin/bikes`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search registration / name / brand / model |
| `campusId`| string | - | Filter by campus |
| `status` | enum | - | `AVAILABLE` \| `MAINTENANCE` \| `DISABLED` \| `RETIRED` |
| `isActive`| boolean | true | Active / inactive filter |

**Response data**


{
  "bikes": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}


### 1.3 Update Bike

**PATCH** `/admin/bikes/:id`  
All fields optional:


{
    "name": "Honda Activa 6G Updated",
    "brand": "Honda",
    "model": "Activa 6G",
    "year": 2024,
    "color": "Matte Black",
    "imageUrls": ["https://example.com/new.jpg"],
    "currentOdometer": 1800
}


### 1.4 Change Status

**PATCH** `/admin/bikes/:id/status`


{
    "status": "AVAILABLE"
}


Allowed: `AVAILABLE` | `MAINTENANCE` | `DISABLED` | `RETIRED`

### 1.5 Soft Delete

**DELETE** `/admin/bikes/:id`  
No body. Sets `isActive = false`.

---

## 2. Pricing Module (Admin)

| Method   | Endpoint             | Auth           | Description                      |
| -------- | -------------------- | -------------- | -------------------------------- |
| `POST`   | `/admin/pricing`     | `protectAdmin` | Create pricing                   |
| `GET`    | `/admin/pricing`     | `protectAdmin` | List pricing (paginated)         |
| `GET`    | `/admin/pricing/:id` | `protectAdmin` | Get pricing                      |
| `PATCH`  | `/admin/pricing/:id` | `protectAdmin` | Update pricing                   |
| `DELETE` | `/admin/pricing/:id` | `protectAdmin` | Soft delete (`isActive = false`) |

### 2.1 Create Pricing

**POST** `/admin/pricing`


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


- `displayOrder` defaults to `0`
- `isFeatured` defaults to `false`
- `isActive` defaults to `true`

### 2.2 List Pricing

**GET** `/admin/pricing`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `campusId`| string | - | Filter by campus |
| `isActive`| boolean | true | Active / inactive filter |

**Response data**


{
  "pricings": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}


### 2.3 Update Pricing

**PATCH** `/admin/pricing/:id`  
All fields optional (same keys as create except `campusId`).

### 2.4 Soft Delete

**DELETE** `/admin/pricing/:id`  
No body. Sets `isActive = false`.

---

## 3. Booking Module (Admin)

| Method  | Endpoint                     | Auth           | Description                   |
| ------- | ---------------------------- | -------------- | ----------------------------- |
| `POST`  | `/admin/bookings`            | `protectAdmin` | Create booking for any user   |
| `GET`   | `/admin/bookings`            | `protectAdmin` | List all bookings (paginated) |
| `GET`   | `/admin/bookings/:id`        | `protectAdmin` | Get booking                   |
| `PATCH` | `/admin/bookings/:id/pickup` | `protectAdmin` | Mark pickup                   |
| `PATCH` | `/admin/bookings/:id/return` | `protectAdmin` | Mark return                   |
| `PATCH` | `/admin/bookings/:id/cancel` | `protectAdmin` | Cancel booking                |

### 3.1 Admin Create Booking

**POST** `/admin/bookings`


{
    "userId": "clx...",
    "campusId": "clx...",
    "pickupAt": "2026-08-05T10:00:00.000Z",
    "returnAt": "2026-08-05T14:00:00.000Z",
    "notes": "Walk-in / Phone booking"
}


- Server auto-selects available bike and matching pricing by duration.
- No `bikeId` or `pricingId` in payload.

### 3.2 List Bookings

**GET** `/admin/bookings`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by bookingNumber |
| `status` | enum | - | `PAYMENT_PENDING` \| `CONFIRMED` \| `ACTIVE` \| `COMPLETED` \| `CANCELLED` \| `FAILED` \| `NO_SHOW` |
| `userId` | string | - | Filter by user |
| `campusId`| string | - | Filter by campus |

**Response data**


{
  "bookings": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "totalPages": 5
  }
}


### 3.3 Pickup

**PATCH** `/admin/bookings/:id/pickup`  
Allowed only when status = `CONFIRMED`


{
    "pickupOdometer": 1250
}


### 3.4 Return

**PATCH** `/admin/bookings/:id/return`  
Allowed only when status = `ACTIVE`


{
    "returnOdometer": 1320
}


Server calculates `actualKm`, `extraKm`, `extraKmCharge` and updates totals.

### 3.5 Cancel (Admin)

**PATCH** `/admin/bookings/:id/cancel`


{
    "reason": "Customer requested cancellation"
}


`reason` is optional.

---

## 4. Users Module (Admin)

| Method | Endpoint       | Auth           | Description            |
| ------ | -------------- | -------------- | ---------------------- |
| `GET`  | `/admin/users` | `protectAdmin` | List users (paginated) |

**Query params**
| Param | Type | Default | Description |
|--------------------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search name / email |
| `onboardingStatus` | enum | - | `SIGNED_UP` \| `EMAIL_VERIFIED` \| `PROFILE_COMPLETED` |

**Response data**


{
  "users": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 12
  }
}


---

## 5. Payments Module (Admin view)

| Method | Endpoint              | Auth           | Description               |
| ------ | --------------------- | -------------- | ------------------------- |
| `GET`  | `/admin/payments`     | `protectAdmin` | List payments (paginated) |
| `GET`  | `/admin/payments/:id` | `protectAdmin` | Get payment               |

**Query params**
| Param | Type | Default | Description |
|----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search |
| `status` | enum | - | `PENDING` \| `PAID` \| `FAILED` \| `REFUNDED` \| `PARTIALLY_REFUNDED` |

**Response data**


{
  "payments": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}


---

## 6. Settings / Policies (Admin)

| Method  | Endpoint                               | Auth           | Description          |
| ------- | -------------------------------------- | -------------- | -------------------- |
| `GET`   | `/admin/settings` or `/admin/policies` | `protectAdmin` | Get current settings |
| `PATCH` | `/admin/settings` or `/admin/policies` | `protectAdmin` | Update settings      |

**Update payload** (all fields optional)


{
    "gstEnabled": true,
    "gstRate": 18,
    "platformFeeEnabled": true,
    "platformFee": 20,
    "helmetFirstPrice": 50,
    "helmetSecondPrice": 30,
    "lateHelmetFee": 100
}


---

### Important Business Rules (from code)

- Bike is locked at **booking creation** time.
- 15-minute buffer is enforced between bookings on the same bike.
- Pricing is auto-selected by the server based on `durationHours`.
- User must have verified email + `onboardingStatus = PROFILE_COMPLETED` + driving license `APPROVED` (for user-created bookings).
- Soft delete is used for Bike and Pricing (`isActive = false`).
- Admin create booking does **not** accept `bikeId` — server finds an available bike.

This is the complete, correct admin-side contract with pagination and accurate payloads.
