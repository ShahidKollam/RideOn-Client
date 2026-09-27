# 🚲 RideOn — Backend Incremental Changes

> **Important:** This is an **incremental update to the existing RideOn backend**, not a refactor/rewrite. Existing booking, availability, pricing, package-rounding, extra-kilometer, payment, bike-allocation, and other business logic must remain unchanged unless explicitly required below.
>
> Reuse existing models, services, utilities, APIs, calculations, and patterns wherever possible. Do not remove or duplicate existing logic. If an existing implementation must be changed to support the requirements below, update it carefully and make sure all related flows continue to work.

---

# BOOKING-2 — Configurable Booking Buffer

Update the existing booking buffer implementation.

### Requirements

* Move the existing booking buffer value to **General Settings**.
* The buffer must be fully configurable by admin.
* **Do not hardcode the buffer value** anywhere in booking/availability logic.
* Default/current value can remain **15 minutes**, but it must come from Settings.
* Reuse the existing availability/booking conflict logic.
* The configured buffer must be consistently respected in:

  * Bike availability checking.
  * Booking availability validation.
  * Booking creation/confirmation validation where applicable.
  * Existing alternative availability/time-slot logic.
* The client must receive availability results based on the configured backend value.
* Do not create separate buffer calculations in different services.
* Do not change the existing booking allocation logic.

---

# BOOKING-3 — Alternative Available Time Slots

Update the existing bike availability API to return alternative available time ranges when the requested range has no available bike.

### Requirements

* First check the exact requested range using the **existing availability logic**.
* If a bike is available, return the existing response **without changing the current behavior**.
* If no bike is available:

  * Find nearby available alternatives before and after the requested range.
  * Prefer alternatives with the **same duration**.
  * If same-duration alternatives are unavailable, include shorter available durations.
  * Never suggest a longer duration than requested.
  * Return a maximum of **5 useful alternatives**.
  * Return fewer if fewer valid alternatives exist.
  * Rank by:

    1. Same duration first.
    2. Closest to the requested time.
* Apply the configured **booking buffer** when determining availability.
* Alternatives are suggestions only.
* When the user selects an alternative, the existing availability check must run again.
* Do not change existing:

  * Booking logic.
  * Pricing logic.
  * Package rounding.
  * Payment logic.
  * Bike allocation logic.

---

# LATE-FEE-1 — Late Return & Late Fee

Implement the new agreed late-return system using the existing booking, pricing, return, and payment architecture.

### General Settings

Add the required configurable values to the existing **General Settings**.

* Booking buffer minutes.
* Late-fee/package calculation configuration required by the agreed pricing model.
* Disruption penalty amount — currently **₹150**.
* GST configuration according to the existing system.

### Important

* **Do not add a separate `lateFeeEnabled` setting.**
* Do not hardcode business values.
* Admin-configured values must be used wherever applicable.
* Reuse the existing pricing/package calculation instead of creating a duplicate pricing system.

### Return

Keep:

* Scheduled pickup time.
* Actual pickup time.
* Scheduled return time.
* Actual return time.

separate.

When admin records/confirms the actual return:

* Calculate the applicable late duration.
* Calculate the applicable additional rental/package charge using the existing pricing logic.
* Provide admin with an **Apply Late Fee** option.
* Admin decides whether the calculated late fee should actually be applied.
* Do not automatically apply the ₹150 disruption penalty.

### Disruption Penalty

* Keep the **₹150 disruption penalty** separate from the normal late rental/package charge.
* Admin can explicitly choose **Apply Disruption Penalty**.
* The penalty is **not mandatory**.
* Admin can adjust/waive applicable charges according to the existing admin process.
* Do not automatically apply the penalty merely because another booking exists.
* The system should provide information about whether another confirmed booking is affected so admin can make the decision.

### Outstanding Amount

If the applicable late amount is not collected during return:

* Store it as outstanding.
* Keep it associated with the correct customer/booking.
* Make it available during the customer's next booking/payment.
* Keep outstanding amount separately identifiable from the new booking amount.
* Prevent duplicate application/payment.
* If payment fails, keep it outstanding.

### Bike Availability

* A bike remains unavailable until the actual return is recorded.
* If a late return affects another booking, expose the affected-booking information.
* Do not automatically cancel, reschedule, or reassign future bookings.
* Admin handles exceptional operational situations.

---

# LATE-FEE-2 — Late Return Admin Alert Data

Provide backend support for admin late-return monitoring.

### Requirements

Expose enough information for the admin frontend to show:

* 🔴 **Late Return** on the booking.
* Late duration.
* 🔴 **Late / Currently Rented** on the affected bike.
* ⚠️ **Booking Affected** when another confirmed booking is actually affected.
* Late Returns count/list for the admin dashboard.

### Real-time

* WebSocket is **not required initially**.
* Use the existing API/data refresh mechanism.
* Do not introduce a new real-time architecture just for this feature.

### Customer notifications

Backend should support important notification events only, such as:

* Return overdue.
* Late fee finalized.
* Late fee remains outstanding.

Do not create repeated notifications every few minutes.

---

# BIKE-1 — Bike Number

Add a new human-readable **Bike Number** field to the existing Bike model.

### Requirements

Example:

```text
Bike ID:     internal database ID
Bike Number: RO-001
```

* Keep the existing Bike `id`.
* `bikeNumber` is the human-readable identifier.
* Bike number should be unique.
* Validate duplicate bike numbers.
* Follow the existing model/validation conventions.
* Admin must be able to create and update it.
* Do not replace or change the existing Bike ID/relationships.

### Existing API Responses

Where the existing API already returns bike information, include `bikeNumber` where relevant:

* Bike list.
* Bike details.
* Booking details.
* Availability responses where bike information exists.
* Admin booking/return responses.
* Other existing bike-related responses where the identifier is displayed.

Do **not** create unnecessary new APIs just for Bike Number.

---

# BIKE-2 — Late Return + Bike Identification

Ensure late-return information can identify the physical bike easily.

Example response structure:

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

* Continue using the existing `bike.id` for database relationships and allocation.
* Use `bikeNumber` only as the human-readable identifier.
* Do not change existing Bike → Booking relationships.

---

# CLIENT-BE-1 — Outstanding Late Amount

Update customer-facing backend APIs only where required.

* Return outstanding late amount when applicable.
* Keep it separate from the new booking's rental amount.
* Include it in the final payable amount through the existing payment flow.
* Support payment success/failure correctly.
* Prevent duplicate payment processing.
* Do not create a separate late-fee booking/payment system.
* Do not change existing booking/payment logic unnecessarily.

---

# FINAL BACKEND SAFETY CHECK

Before completing the work, verify all affected existing flows:

* Existing availability.
* Booking buffer.
* Alternative availability.
* Booking creation.
* Bike allocation.
* Pricing.
* Package rounding.
* Extra-kilometer calculation.
* Pickup/return.
* Late fee.
* Outstanding amount.
* Payment.
* GST.
* Admin settings.
* Bike model.
* Booking/bike responses.

### Strict rule

**Do not refactor unrelated code. Do not remove existing calculations. Do not replace working logic simply because a new implementation is being added.**

Only make the minimum changes required to integrate:

**Configurable Buffer + Alternative Slots + Late Return/Late Fee + Admin Alert Data + Bike Number + Outstanding Late Amount.**

---

## 📄 Required output after backend implementation

At the end, provide:

### 1. API Documentation

A simple list of:

* Changed APIs.
* New/updated request fields.
* New/updated response fields.
* Settings fields.
* Any new API endpoints, if genuinely required.

### 2. Frontend Change Document

Separate the required frontend work into:

* **Admin Frontend**
* **Client Frontend**

Include only what each frontend needs to consume/display from these backend changes.

### 3. Change Summary

Clearly list:

* Files/modules changed.
* Existing logic reused.
* Any existing logic that had to be modified.
* Any potential backward-compatibility impact.

**No frontend code changes should be made as part of this backend task unless absolutely required for backend compatibility.**


----------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


- ThIS is the refactor number - BOOKING-1 // like this we need to give a id for each refactor
- Check available time slots

SERVER

Update the existing bike availability API to return alternative available time ranges when no bike is available for the user's exact requested pickup/return range.

Rules:
- First check the exact requested range using the existing availability logic.
- If exact availability exists, return the existing response without any change.
- If no bike is available for the exact range, find nearby alternative ranges before and after the requested range.
- Prefer alternatives with the same duration as the requested range.
- If same-duration alternatives are not available, include shorter available ranges.
- Never suggest a longer duration than the user's requested duration.
- Return a maximum of 5 useful alternatives. If fewer than 5 exist, return only those available.
- Rank alternatives by duration preference (same duration first) and closeness to the original requested range.
- Do not change the existing booking, pricing, package-rounding, payment, or bike allocation logic.
- The alternatives are only suggestions; booking must still use the existing availability check when the user selects one.
* At last give me the simple api doc and a simple doc that say what the changes needed to do in ui frontend

<<< --------------- >>>

CLIENT =======

Update the existing client availability UI to display alternative time ranges when the requested range has no available bike.

Rules:
- Keep the existing availability UI unchanged when a bike is available.
- When no bike is available, show a clear "No bike available for your selected time" message.
- Below it, show up to 5 alternative available time ranges returned by the server.
- Show the alternatives as simple selectable time-range suggestions.
- When the user selects an alternative, update the pickup and return time fields and trigger the existing "Check Availability" action/API exactly like a normal search.
- Do not create a separate booking flow.
- Do not change pricing, package selection, payment, booking, or any other existing UI/logic.

----------------------

Improve the existing RideOn client UI/UX without changing any business logic, API contracts, pricing, booking, or payment logic.

### General UI/UX

* Keep the UI clean, modern, professional, and consistent with the existing RideOn design system.
* Improve mobile responsiveness across all affected screens, especially for smaller mobile screens.
* Use smooth, subtle animations wherever appropriate, including opening/closing dynamic sections, result sections, drawers, and state changes. Avoid excessive animations.

### Availability Search

* After clicking **Check Availability** on mobile, smoothly scroll down a small/appropriate amount so the availability result is immediately visible.
* If a dynamic result/section opens after an action, automatically scroll smoothly to the relevant section.
* On desktop, use a small smooth scroll; on mobile, use a slightly larger scroll so the result is clearly visible without moving the user too far.

### Date & Time Consistency

* Make pickup and return date formatting consistent everywhere.
* Use `DD-MM-YYYY` consistently for dates on mobile and desktop.
* Do not allow browser/device-specific date formatting to create different formats between pickup and return fields.
* Keep the existing time handling and business logic unchanged.

### Booking Page UX

Improve the booking page loading and transition experience throughout the entire flow.

* Add proper skeleton loaders for sections that are waiting for API data.
* Use appropriate placeholders instead of showing empty content while data is loading.
* Show clear loading states whenever an API request is in progress.
* Prevent confusing states where the UI looks fully interactive while an API operation is still processing.
* After payment success, immediately show an appropriate processing/loading state instead of leaving the previous payment screen appearing interactive for several seconds.
* Handle transitions between payment success → booking confirmation smoothly and clearly.
* Apply the same principle to all other API-driven actions where the current UI remains visible and interactive while waiting for the next response.
* Disable relevant buttons/actions while their operation is processing to prevent duplicate actions.
* Make success, error, loading, and transition states visually clear and consistent.

### Dynamic Sections & Navigation

* Whenever a section dynamically appears, expands, or updates with new results, smoothly scroll the user toward the relevant content when appropriate.
* On desktop, use a subtle scroll adjustment.
* On mobile, scroll enough to clearly bring the newly displayed content into view.
* Do not force scrolling when the relevant content is already clearly visible.

### Important

* Do not change existing business logic.
* Do not change API contracts.
* Do not change pricing calculations.
* Do not change booking availability rules.
* Do not change payment logic.
* Do not introduce unnecessary refactoring.
* Reuse the existing components, styles, and patterns wherever possible.
* Make only the necessary frontend UI/UX changes.
* Ensure all changes work correctly on both mobile and desktop.

### Smooth Animations & Transitions

Add **smooth, subtle, professional animations throughout the affected RideOn client UI** wherever they improve the user experience.

* Add smooth enter/exit animations when dynamic sections appear or disappear.
* Add smooth expand/collapse animations for expandable content.
* Add smooth transitions when availability results appear or change.
* Add smooth transitions between loading, success, error, and completed states.
* Add smooth animations for drawers, modals, dropdowns, alerts, and other overlays where applicable.
* Add subtle button and interactive-element transitions for hover, focus, press, and disabled states.
* When payment succeeds and the UI transitions to the booking confirmation state, use a smooth transition instead of abruptly replacing the screen.
* When a dynamic section opens and the page needs to scroll to it, combine the scroll with a smooth transition so it feels natural.
* Keep animations fast and responsive; they should never make the user wait for an action.
* Avoid excessive, flashy, or decorative animations. The overall feel should be **premium, natural, and professional**, not like an AI-generated UI.
* Respect `prefers-reduced-motion` and reduce/disable non-essential animations for users who have requested reduced motion.
* Use consistent animation timing and easing throughout the application rather than implementing unrelated animations for each component.

**Important:** Animations must support the UX and must not interfere with API requests, form interactions, booking flow, payment flow, or navigation.


----------------------------------------------------------------------------------------------------------------------------------------------------------



