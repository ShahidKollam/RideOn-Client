Based on the booking flow we finalized, here are the modules that need changes.

---

# 1. Prisma Schema 🟢

### Booking

**Update**

* Add `pricingId`
* Add relation to `Pricing`

```prisma
pricingId String
pricing   Pricing @relation(fields: [pricingId], references: [id])
```

---

### Pricing

**No major changes**

(Optional)

* Rename `packageName` → `displayName`

---

# 2. Pricing Module 🟡

### Update

Current

```
calculatePrice(pricingData)
```

Needs

```
findPricingByDuration(durationHours)
```

Example

```
5h 20m

↓

6 Hour Package
```

Then

```
calculatePrice(selectedPricing)
```

---

# 3. Booking Module 🔴

## createBooking()

### Remove

```
pricingId
```

from frontend request.

---

### Add

```
Calculate duration

↓

Find matching pricing

↓

Save pricingId automatically

↓

Create booking
```

---

### Save

```
pricingId
baseAmount
depositAmount
includedKm
extraKmRate
```

(snapshot)

---

# 4. Availability Module 🟢 (NEW)

Create

```
checkAvailability()
```

Responsibilities

* Validate pickup/return
* Check bike availability
* Calculate duration
* Find matching pricing
* Return booking summary

No booking creation.

---

# 5. Bike Module 🟡

Current

```
findAvailableBike()
```

Split into two methods.

```
checkBikeAvailability()
```

Only checks availability.

---

```
findNextAvailableBike()
```

Returns

```
Same Honda Activa

↓

availableFrom
```

Used only when selected bike isn't available.

---

# 6. Booking API 🔴

### New API

```
POST

/bookings/check-availability
```

Returns

```
available

pricing

duration

amount

included KM

deposit
```

---

### Existing API

```
POST

/bookings
```

Uses the result internally and creates the booking.

---

# 7. Frontend 🟢

Booking Page

```
Select Time

↓

Check Availability

↓

Summary Updates

↓

Continue to Payment
```

No package selection.

---

# Final Change List

| Module       | Action                                              |
| ------------ | --------------------------------------------------- |
| Prisma       | ➕ Add `pricingId` to Booking                        |
| Pricing      | ✏️ Find pricing by duration                         |
| Booking      | ✏️ Auto-select pricing, remove frontend `pricingId` |
| Bike         | ✏️ Split availability & assignment                  |
| Availability | ➕ New `checkAvailability()` service                 |
| API          | ➕ `/bookings/check-availability`                    |
| Frontend     | ✏️ Check availability before payment                |

This is the complete set of changes needed for the new booking flow.
