Yes. Since much of the system is **already implemented**, the prompt should explicitly tell the coding AI to make **incremental changes only**, not rebuild the feature.

Also, the new **Bike Number** should be treated as a proper bike identifier and covered everywhere the bike is displayed/selected/referenced.

I would split the next work into **3 backend tasks**: Backend Core, Admin Backend, Client Backend. Then we can do the frontend separately.

---

# 🚲 RideOn — Incremental Late Fee + Bike Number Backend Update

## 🔴 IMPORTANT — READ FIRST

This is an **existing RideOn application with many features and calculations already implemented**.

**DO NOT refactor or rebuild the existing system.**

* Do not remove existing logic.
* Do not replace existing calculations unnecessarily.
* Do not change existing pricing, package, extra-kilometer, booking, payment, availability, or bike-allocation logic unless the new requirements explicitly require an integration/change.
* Do not create duplicate implementations of logic that already exists.
* Reuse existing services, utilities, models, APIs, and calculations wherever possible.
* Make only the **minimum required changes** for the new requirements.
* If an existing implementation must be changed to support a new requirement, update it carefully and ensure all related parts of the application continue working.
* Check all usages/dependencies of any changed field or logic before modifying it.
* Maintain backward compatibility wherever possible.
* Follow the existing project architecture and coding style.

---

# 1. BACKEND — Core Late Fee + Bike Changes

### Task ID: `BE-LF-01`

### A. General Settings

Update the existing General Settings implementation.

All business-configurable values must come from Settings.

Include/configure:

* Booking buffer time in minutes.
* Late-fee calculation interval/package rule as required by the agreed late-fee logic.
* Late-fee related amount/configuration.
* Disruption penalty amount — currently ₹150.
* GST configuration according to the existing system.

### Important

* **Do not add a separate `lateFeeEnabled` setting.**
* Do not hardcode the booking buffer.
* Do not hardcode the ₹150 penalty.
* Do not hardcode late-fee configuration.
* Existing settings architecture must be reused.

---

### B. Booking Buffer Integration

The configured booking buffer must actually be used wherever the application currently calculates booking availability.

Example:

```text
Booking A ends: 6:00 PM
Configured buffer: 15 minutes

Next availability: 6:15 PM
```

The value must come from General Settings.

Make sure the same setting is correctly respected by:

* Booking availability calculation.
* Bike availability checks.
* Booking creation/validation where applicable.
* Alternative availability logic if already implemented.
* Any existing server-side overlap/conflict validation.

**Do not create a second buffer calculation.**

Use the existing availability logic and replace only the hardcoded/configured value where required.

---

### C. Late Return

Reuse the existing pickup/return implementation.

Keep:

```text
Scheduled Pickup
Actual Pickup

Scheduled Return
Actual Return
```

separate.

When return is recorded:

* Calculate the applicable late duration.
* Calculate the applicable late charge using the existing pricing/package system.
* Do not automatically apply the optional ₹150 disruption penalty.
* Admin will explicitly decide whether it applies.
* Finalize the applicable charges during return processing.

---

### D. Outstanding Late Amount

If the applicable late charge is not collected:

* Store it as outstanding.
* Keep it associated with the customer/booking correctly.
* Make it available for collection in the customer's next booking/payment.
* Keep the outstanding amount separately identifiable from the new rental amount.
* Prevent duplicate collection/payment.
* Preserve existing payment/idempotency logic.

---

# 2. BACKEND — Admin

### Task ID: `BE-ADMIN-LF-01`

Update existing admin APIs/services only where required.

### Return Processing

During return confirmation, admin must be able to:

* See calculated late duration.
* See calculated late charge.
* Choose **Apply Late Fee**.
* Choose whether to apply the **Disruption Penalty**.
* Use the configured penalty amount from Settings.
* Adjust/waive applicable charges where the existing admin flow supports this.
* Store adjustment/reason where required.
* Finalize the return with the correct payable/outstanding amount.

The ₹150 disruption penalty must **never be automatically forced** just because another booking exists.

---

### Late Return Identification

Expose enough information for admin to identify:

* Late booking.
* Late duration.
* Late bike.
* Whether another confirmed booking is affected.
* Current outstanding late amount.

Do not automatically cancel/reschedule future bookings.

Admin handles operational decisions.

---

# 3. BACKEND — Bike Number

### Task ID: `BE-BIKE-ID-01`

Add a new **Bike Number** field to the existing Bike model.

Purpose:

> Make it easy for staff/admin/customers to identify the physical bike.

Example:

```text
Bike ID:       clxyz123...
Bike Number:   RO-001
```

### Requirements

* Add `bikeNumber` to the Bike model using the existing database conventions.
* It should be required if appropriate for the existing bike creation flow.
* It should be **unique**.
* Prevent duplicate bike numbers.
* Validate empty/invalid values according to existing validation conventions.
* Allow admin to create/update the bike number.
* Do not replace the existing internal Bike ID.
* `id` remains the technical database identifier.
* `bikeNumber` becomes the human-friendly identifier.

### Bike Number must be available wherever relevant

Ensure the backend includes `bikeNumber` in relevant existing responses such as:

* Bike list.
* Bike details.
* Booking details.
* Booking responses containing bike information.
* Availability responses where bike information is returned.
* Admin booking/return responses.
* Any existing API that already exposes bike identity and needs the human-readable identifier.

**Do not create unnecessary new APIs just for this.**

Add the field to existing responses where appropriate.

---

# 4. BACKEND — Late Return + Bike Number Relationship

### Task ID: `BE-LATE-BIKE-01`

Ensure late-return information can clearly identify the physical bike.

Example response concept:

```json
{
  "bookingId": "...",
  "bike": {
    "id": "...",
    "bikeNumber": "RO-001"
  },
  "status": "LATE_RETURN",
  "lateDuration": 30
}
```

The internal `bike.id` must continue to be used for database relationships and allocation.

`bikeNumber` is the **human-readable identifier**.

Do not change existing Bike → Booking relationships just to add this field.

---

# 5. BACKEND — Client

### Task ID: `BE-CLIENT-LF-01`

Update customer-facing APIs only where necessary.

### Outstanding Late Fee

Customer APIs should provide:

* Outstanding late amount.
* Related booking/reference where appropriate.
* Amount included in the final payment calculation.
* Clear separation between:

  * New booking charges.
  * Outstanding late amount.
  * GST.
  * Final payable amount.

If payment fails:

* Keep the outstanding amount.
* Do not mark it as paid.
* Prevent duplicate payment processing.

---

### Booking Availability

The client availability API must use the **same configured booking buffer from General Settings**.

Do not hardcode the buffer on the client or server.

The client should rely on the backend availability result rather than implementing its own conflicting buffer calculation.

Existing availability and alternative-slot logic must continue working.

---

# 6. BACKEND — Final Safety Rules

### Task ID: `BE-SAFE-01`

Before completing the implementation:

* Check every existing usage of modified Settings fields.
* Check every existing usage of Bike model.
* Check booking availability calculations.
* Check booking creation validation.
* Check return processing.
* Check payment/outstanding handling.
* Check extra-kilometer calculations.
* Check existing pricing/package calculations.
* Check admin booking APIs.
* Check client booking/availability APIs.

### Do NOT:

* ❌ Rewrite the booking system.
* ❌ Rewrite the pricing system.
* ❌ Rewrite extra-kilometer calculations.
* ❌ Replace the existing payment system.
* ❌ Replace the existing bike-allocation system.
* ❌ Remove existing fields because a new field is introduced.
* ❌ Create duplicate pricing calculations.
* ❌ Hardcode configurable values.
* ❌ Automatically apply the ₹150 penalty.
* ❌ Automatically cancel affected bookings.

### Expected approach

```text
Existing System
      │
      ├── Keep existing logic
      │
      ├── Add Settings integration
      │
      ├── Add late-fee integration
      │
      ├── Add Bike Number
      │
      └── Extend existing APIs where required
```

**This is an incremental enhancement, not a refactor.**

---

## 📌 Task ID structure

To make the coding work easy to track, use IDs by **feature + layer**, not random IDs:

```text
BE-LF-01          Backend late-fee/settings
BE-ADMIN-LF-01    Admin late-fee backend
BE-BIKE-ID-01     Bike Number backend
BE-LATE-BIKE-01   Late return + bike identification
BE-CLIENT-LF-01   Client late-fee backend
BE-SAFE-01        Final compatibility/safety check
```

Then later, when we generate the frontend prompts, we can use:

```text
FE-ADMIN-LF-01
FE-ADMIN-BIKE-01
FE-CLIENT-LF-01
FE-CLIENT-BIKE-01
```

This makes it very easy for the coding AI to say **which task is completed** without putting a Task ID on every individual requirement.
