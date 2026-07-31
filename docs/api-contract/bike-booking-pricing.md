**Complete API Contracts**  
(First **Client / User**, then **Admin** — organized by module)

All responses use your standard `ApiResponse` format.

---

# CLIENT (USER) APIs

## 1. Bike Module (Client)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/bikes` | `protect` | List bikes |
| `GET` | `/bikes/:id` | `protect` | Get bike details |
| `GET` | `/bikes/public` | None | Public list of bikes |
| `GET` | `/bikes/public/:id` | None | Public bike details |

### Query Parameters (List)
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |
| `search` | string | Search by registrationNumber, name, brand, model |
| `campusId` | string | Filter by campus |
| `status` | string | `AVAILABLE` \| `MAINTENANCE` \| `DISABLED` \| `RETIRED` |
| `isActive` | boolean | Default: true |

---

## 2. Booking Module (Client)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/bookings/check-availability` | `protect` | Check bike availability + price |
| `POST` | `/bookings` | `protect` | Create booking |
| `GET` | `/bookings` | `protect` | List my bookings |
| `GET` | `/bookings/:id` | `protect` | Get my booking |
| `PATCH` | `/bookings/:id/cancel` | `protect` | Cancel booking |

### 2.1 Check Availability
**Endpoint:** `POST /bookings/check-availability`

**Payload:**
```json
{
  "bikeId": "clx...",
  "campusId": "clx...",
  "pickupAt": "2026-08-05T10:00:00.000Z",
  "returnAt": "2026-08-05T14:00:00.000Z"
}
```

**Success Response (`data`):**
```json
{
  "available": true,
  "durationHours": 4,
  "pricing": {
    "id": "clx...",
    "packageName": "4 Hour Package"
  },
  "baseAmount": 250,
  "depositAmount": 500,
  "includedKm": 40,
  "extraKmRate": 5,
  "totalAmount": 750
}
```

**When not available:**
```json
{
  "available": false,
  "reason": "15-minute buffer required between bookings",
  "availableFrom": "2026-08-05T15:15:00.000Z",
  "durationHours": 4,
  "pricing": { ... },
  "baseAmount": 250,
  "depositAmount": 500,
  "includedKm": 40,
  "extraKmRate": 5,
  "totalAmount": 750
}
```

### 2.2 Create Booking
**Endpoint:** `POST /bookings`

**Payload:**
```json
{
  "bikeId": "clx...",
  "campusId": "clx...",
  "pickupAt": "2026-08-05T10:00:00.000Z",
  "returnAt": "2026-08-05T14:00:00.000Z",
  "notes": "optional note"
}
```

### 2.3 List My Bookings
**Endpoint:** `GET /bookings`

**Query Parameters:**
- `page`, `limit`
- `search` (bookingNumber)
- `status` (`PAYMENT_PENDING` | `CONFIRMED` | `ACTIVE` | `COMPLETED` | `CANCELLED` | `FAILED` | `NO_SHOW`)
- `campusId`

### 2.4 Cancel Booking
**Endpoint:** `PATCH /bookings/:id/cancel`

**Payload (optional):**
```json
{
  "reason": "Change of plans"
}
```

**Allowed only when status is:** `PAYMENT_PENDING` or `CONFIRMED`

---
