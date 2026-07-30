# Booking API

## Check availability

`POST /api/bookings/check-availability`

Request body:

```json
{
  "bikeId": "bike_123",
  "campusId": "campus_123",
  "pickupAt": "2026-08-10T09:00:00.000Z",
  "returnAt": "2026-08-10T15:00:00.000Z"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Availability checked successfully",
  "data": {
    "available": true,
    "durationHours": 6,
    "pricing": { "id": "pricing_123", "packageName": "Half Day Plus" },
    "baseAmount": 400,
    "depositAmount": 500,
    "includedKm": 80,
    "extraKmRate": 4,
    "totalAmount": 900
  }
}
```

When unavailable, `data` also contains `reason` and `availableFrom`; the latter includes the mandatory 15-minute booking buffer.

## Create booking

`POST /api/bookings`

Request body:

```json
{
  "bikeId": "bike_123",
  "campusId": "campus_123",
  "pickupAt": "2026-08-10T09:00:00.000Z",
  "returnAt": "2026-08-10T15:00:00.000Z",
  "notes": "Please have the bike ready at the main gate."
}
```

Successful response:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_123",
    "bikeId": "bike_123",
    "pricingId": "pricing_123",
    "baseAmount": 400,
    "depositAmount": 500,
    "includedKm": 80,
    "extraKmRate": 4,
    "totalAmount": 900
  }
}
```

The server selects the pricing package and validates availability again during creation. Clients must not send `pricingId`.
