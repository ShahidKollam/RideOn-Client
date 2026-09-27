RIDEON ADMIN FRONTEND — MOBILE TABLE UX UPDATE

I am providing the existing RideOn Admin Frontend project as a ZIP.

Your task is to UPDATE THE EXISTING PROJECT, not rebuild it from scratch.

IMPORTANT:
- Preserve the existing architecture and codebase.
- Do not rewrite unrelated modules.
- Do not change backend APIs.
- Do not change API contracts.
- Do not change authentication, JWT, refresh-token logic, or RBAC.
- Do not change existing business logic.
- Do not change pricing, payment, booking, late-fee, extra-KM, bike allocation, or settings logic.
- Do not remove existing features.
- Do not introduce a new UI framework.
- Reuse the existing components, hooks, API services, tables, drawers, forms, and design system wherever possible.
- Only improve the RESPONSIVE UX for MOBILE SCREENS.

==================================================
TASK: MOBILE TABLE RESPONSIVE UX
==================================================

The current admin contains several wide tables.

On desktop/tablet, keep the existing table-based UI.

On mobile screens, DO NOT force users to horizontally scroll through wide tables.

Instead, create a responsive mobile representation for every relevant admin table/list.

DESKTOP:
- Keep the existing table.
- Keep existing columns.
- Keep existing actions.
- Keep existing sorting/filtering/pagination behavior.
- Do not unnecessarily redesign desktop.

MOBILE:
- Replace wide tables with compact vertical cards/list items.
- No horizontal scrolling for normal admin data tables.
- Show only the most important information in the list/card.
- Tapping/clicking the item should open the existing detail page/drawer/modal/action flow where one already exists.
- Preserve every existing action available from the table.
- Do not hide important information permanently; secondary information should be available through the existing details UI.

==================================================
1. BOOKING LIST
==================================================

Desktop:
- Keep the current booking table exactly as the desktop experience.

Mobile:
Replace the wide booking table with a compact booking card.

Example:

┌─────────────────────────────┐
│ BK-1024        ● ACTIVE     │
│ Rahul K.                    │
│ RO-001                      │
│ 20 Sep • 10:00 AM           │
│ ₹450                    →   │
└─────────────────────────────┘

The card can contain:
- Booking number
- Booking status
- Customer name
- Bike number
- Pickup date/time
- Rental amount / relevant amount
- Important late indicator when applicable
- Chevron/action indicator

Do NOT attempt to display every table column inside the card.

On tap:
- Open the EXISTING booking details flow.
- If the project already uses the Booking Details page, navigate to that page.
- If an existing drawer/modal is still used for another booking flow, preserve it.
- Do not create duplicate detail implementations.

Booking details must continue to contain the existing relevant information such as:
- Customer
- Bike
- Rental
- Pickup / Return
- Charges
- Payment
- Late fee
- Outstanding amount
- Actions

==================================================
2. BIKE TABLE
==================================================

Desktop:
- Keep the existing bike table.

Mobile:
- Replace the wide table with compact bike cards.

Show important information such as:
- Bike number
- Registration number
- Bike name
- Status
- Important availability/late indicator if already provided by the existing API
- Existing action/menu

Example:

┌─────────────────────────────┐
│ RO-001             ● ACTIVE │
│ Honda / Bike Name           │
│ KL-XX-1234                  │
│ Available                   │
│                         →   │
└─────────────────────────────┘

Do not duplicate backend calculations.

==================================================
3. USER TABLE
==================================================

Desktop:
- Keep existing table.

Mobile:
- Convert each row into a compact user card.

Prioritize:
- Name
- Email / primary identifier
- Status
- Important role/type information
- Existing actions

Secondary fields remain accessible through the existing user details/action flow.

==================================================
4. PAYMENT TABLE
==================================================

Desktop:
- Keep existing payment table.

Mobile:
- Convert rows into payment cards.

Prioritize:
- Payment/reference ID
- Customer/booking
- Amount
- Payment status
- Date/time
- Existing action

Do not remove payment information from the existing detail flow.

==================================================
5. PRICING TABLES
==================================================

Desktop:
- Keep existing pricing tables.

Mobile:
- Use responsive pricing cards/list items instead of horizontal scrolling.

Show:
- Pricing/duration name
- Relevant price
- Status
- Existing actions

All existing pricing edit/delete/action functionality must continue working.

Do NOT modify pricing calculations.

==================================================
6. STAFF / OTHER DATA TABLES
==================================================

Apply the same responsive pattern to ALL OTHER ADMIN TABLES where the current table becomes too wide on mobile.

Examples may include:
- Staff
- Reports
- Dashboard data tables
- Booking-related tables
- Payment-related tables
- Bike-related tables
- User-related tables
- Any other existing admin list/table

Do not blindly convert every small table.

If a table already fits comfortably on mobile:
- Keep it as-is.

If it becomes too wide:
- Use a compact mobile card/list representation.

==================================================
7. SETTINGS — MOBILE ONLY
==================================================

IMPORTANT:

The Settings page should NOT become a horizontally scrolling desktop form on mobile.

Desktop:
- Keep the existing Settings layout.

Mobile:
- Make the existing settings sections responsive and stack them vertically.
- Use full-width controls.
- Inputs/selects/toggles must fit the viewport.
- Avoid side-by-side controls when they become cramped.
- Group related settings into clear sections/cards.
- Keep labels and descriptions readable.
- Buttons should be easily tappable.
- Avoid horizontal scrolling.

Do NOT change:
- Settings API
- Settings fields
- Validation
- Existing business rules
- Default values
- GST logic
- Platform fee logic
- Booking buffer logic
- Late-fee settings
- Disruption penalty
- Any existing setting behavior

This is purely a mobile layout/UX improvement.

==================================================
8. FILTERS AND SEARCH
==================================================

For every admin table/list:

Desktop:
- Preserve the existing filter/search layout.

Mobile:
- Make filters responsive.
- Stack filter controls when necessary.
- Search input should be full width where appropriate.
- Select/dropdown controls should fit the viewport.
- Date filters should remain usable.
- Do not create horizontal overflow.

Existing filtering behavior must remain unchanged.

==================================================
9. PAGINATION
==================================================

Do not change pagination logic or API behavior.

Desktop:
- Preserve existing pagination UI.

Mobile:
- Make pagination fit the viewport.
- Avoid horizontal scrolling.
- If the existing pagination component already has a responsive mode, reuse it.

==================================================
10. ACTIONS
==================================================

Existing actions must remain available.

Examples:
- View
- Edit
- Delete
- Activate/deactivate
- Payment
- Return bike
- Booking actions
- Other existing admin actions

On mobile:
- Use compact action menus, buttons, or the existing detail flow where appropriate.
- Do not remove actions just because the table was converted into cards.

Avoid putting too many buttons directly inside the card.

==================================================
11. LOADING / EMPTY / ERROR STATES
==================================================

Create responsive versions of existing:
- Skeleton loaders
- Empty states
- Error states
- Loading states

Mobile cards should have proper skeleton placeholders instead of showing broken/wide table layouts.

Do not change API loading/error behavior.

==================================================
12. RESPONSIVE BREAKPOINT BEHAVIOR
==================================================

The responsive change should primarily target MOBILE.

Recommended behavior:

Desktop:
- Existing table UI.

Tablet:
- Keep table if it fits.
- Otherwise use the responsive/mobile representation.

Mobile:
- Card/list representation.
- No unnecessary horizontal scrolling.

Use the project's existing Tailwind breakpoints/design system if already present.

Do not introduce arbitrary breakpoints without checking the existing project.

==================================================
13. VISUAL DESIGN
==================================================

Keep the RideOn Admin visual style.

The mobile cards should be:
- Clean
- Professional
- Compact
- Easy to scan
- Consistent with existing colors
- Consistent with existing typography
- Consistent with existing spacing
- Consistent with existing status badges
- Touch friendly

Do not make the UI look like a completely different application.

Avoid:
- Excessive shadows
- Excessive rounded containers
- Huge cards
- Flashy animations
- AI-generated-looking UI
- Unnecessary gradients
- Excessive icons

Use subtle existing design patterns.

==================================================
14. NO DUPLICATION
==================================================

IMPORTANT IMPLEMENTATION RULE:

Do not create completely separate business logic for desktop and mobile.

Prefer:

Same data
   ↓
Same hooks/API
   ↓
Same business logic
   ↓
Desktop Table OR Mobile Card

The responsive UI should only change presentation.

For example:

const bookings = useBookings();

Desktop:
<BookingTable data={bookings} />

Mobile:
<BookingMobileList data={bookings} />

Both must use the same:
- API
- query
- filters
- pagination
- permissions
- actions
- data transformations

==================================================
15. NO BACKEND CHANGES
==================================================

Do NOT modify the backend.

Do NOT create new APIs.

Do NOT modify:
- API endpoints
- Request payloads
- Response structures
- Authentication
- RBAC
- Permissions
- Business calculations

Use the existing API contract exactly as it currently exists.

==================================================
16. EXISTING FEATURES MUST CONTINUE WORKING
==================================================

After the responsive changes, verify:

- Booking list
- Booking details
- Bike list
- Bike details/actions
- User list
- Payment list
- Pricing
- Settings
- Staff/report tables
- Search
- Filters
- Pagination
- Sorting
- Existing actions
- Drawers
- Modals
- Forms
- API loading states
- Error states
- Permissions
- Authentication/session persistence

Nothing unrelated should regress.

==================================================
17. IMPLEMENTATION APPROACH
==================================================

First inspect the ZIP and understand:

- Existing admin architecture
- Existing table components
- Existing responsive components
- Existing Tailwind setup
- Existing breakpoints
- Existing drawer/modal components
- Existing booking details flow
- Existing settings page
- Existing shared UI components

Then make the smallest clean changes necessary.

Prefer reusable components such as:

<DataTable />

<MobileList />

<MobileCard />

only if they fit naturally into the existing architecture.

Do NOT create unnecessary abstraction just for this task.

==================================================
18. FINAL VALIDATION
==================================================

After implementation:

1. Test desktop width.
2. Test tablet width.
3. Test mobile width.
4. Confirm no important table has unwanted horizontal scrolling.
5. Confirm mobile cards show the correct important information.
6. Confirm tapping a card opens the correct existing detail/action flow.
7. Confirm all existing actions still work.
8. Confirm filters work.
9. Confirm pagination works.
10. Confirm loading states work.
11. Confirm empty states work.
12. Confirm error states work.
13. Confirm Settings is fully usable on mobile.
14. Confirm desktop UI was not unnecessarily changed.
15. Confirm no backend/API changes were introduced.
16. Confirm no existing business logic was changed.

==================================================
FINAL REQUIREMENT
==================================================

Return the UPDATED ADMIN FRONTEND PROJECT after making these changes.

Also provide a short implementation summary containing:

- Files/components changed
- Tables converted to mobile cards
- Settings mobile changes
- Any reusable responsive components created
- Confirmation that desktop behavior was preserved
- Confirmation that backend/API/business logic was not changed
- Any issues or limitations found

MOST IMPORTANT:

This is a RESPONSIVE UX UPDATE, not an admin rewrite.

Desktop should remain essentially as it is.

Mobile should become significantly easier to use by replacing unnecessarily wide tables with compact cards/lists and making Settings/forms properly responsive.

Do not change anything unrelated.

You're right. I reviewed the **full API contract again**, including the admin auth, settings, bikes, bookings, late-return, payment, dashboard, RBAC, and shared behavior sections. 

The previous prompt missed some important API-driven details. Also, **admin auth must not be treated as a new implementation task** here. It is already part of the API contract and should simply continue using the existing admin authentication/session/RBAC implementation. 

Here is the corrected **ADMIN FRONTEND ONLY** prompt.

---

# RideOn — Admin Frontend Incremental Update

## IMPORTANT — EXISTING APPLICATION

This is an **incremental frontend update** to the existing RideOn Admin application.

**DO NOT perform a complete refactor or redesign of the existing admin application.**

* Do not remove existing logic.
* Do not remove existing tables.
* Do not remove existing drawers except the **Booking Details drawer**, which is specifically being replaced by a page.
* Do not change existing pricing, booking, payment, extra-KM, package, bike-allocation, RBAC, or authentication logic.
* Do not create duplicate API/business logic in the frontend.
* Reuse existing components, hooks, API services, query handling, permissions, layouts, and design system.
* Make only the changes required below.
* If an existing component must be changed, preserve its current behavior.
* Use the supplied **Backend API Documentation as the source of truth**.
* Do not invent endpoints, fields, calculations, or statuses.

---

# ADMIN-FE-01 — Existing Admin Authentication Integration

**Task ID: `ADMIN-FE-01`**

The admin authentication system is already implemented.

**Do not rebuild or redesign admin authentication.**

Continue using the existing implementation with the API contract:

* Admin access JWT.
* `adminRefreshToken` HttpOnly cookie.
* `/api/v1/admin/auth/refresh`
* `/api/v1/admin/auth/me`
* `/api/v1/admin/auth/logout`
* Existing RBAC/permissions.

The API contract specifies:

* Access token default expiry: 15 minutes.
* On `401`, refresh once and retry the request once.
* `403` means authenticated but inactive/unauthorized.
* Backend remains the actual RBAC security layer. 

**Only ensure the new APIs use the existing admin authentication mechanism. Do not make unrelated auth changes.**

---

# ADMIN-FE-02 — General Settings

**Task ID: `ADMIN-FE-02`**

Use:

* `GET /api/v1/admin/settings`
* `PATCH /api/v1/admin/settings` 

Update the existing Settings UI.

### Existing settings must remain

Do not remove existing settings such as:

* GST
* Platform fee
* Helmet pricing
* Late helmet fee
* Other existing settings.

### New/relevant settings

Add UI for:

* `bookingBufferMinutes`
* `disruptionPenalty`

The API currently defines:

* `bookingBufferMinutes`: integer `0–180`, default `15`
* `disruptionPenalty`: number ≥ `0`, default `150` 

### Important

* **Do not add `lateFeeEnabled`.**
* Do not hardcode `15`.
* Do not hardcode `150`.
* Display and update values from the API.
* Use proper validation.
* Show useful descriptions for admins.

The booking buffer must be clearly described as the **time between bookings used by availability/conflict checks**.

---

# ADMIN-FE-03 — Bike Number

**Task ID: `ADMIN-FE-03`**

Update the existing Bike Create/Edit UI.

Use:

* `POST /api/v1/admin/bikes`
* `PATCH /api/v1/admin/bikes/:id` 

Add:

```text
Bike Number
[ RO-001 ]
```

### Rules

* `bikeNumber` is optional because older bikes may not have one.
* It must be unique.
* Handle `409` duplicate errors clearly.
* Do not replace the internal `id`.
* Keep registration number and all existing bike fields.

### Bike list/detail

Display:

* Bike Number
* Registration Number
* Name
* Status
* Existing fields

Bike search should also work with Bike Number because the backend supports it. 

---

# ADMIN-FE-04 — Booking List

**Task ID: `ADMIN-FE-04`**

Keep the **existing booking table**.

Use:

`GET /api/v1/admin/bookings` 

Continue supporting all existing filters:

* status
* paymentStatus
* campusId
* userId
* bikeId
* search
* from
* to

Add:

### `lateOnly=true`

Provide a clear **Late Returns** filter.

### Booking row

Where available, display:

* Bike Number
* `isLate`
* `lateDurationMinutes`
* `lateFee`
* `disruptionPenalty`
* `lateFeeApplied`
* `disruptionPenaltyApplied`
* Paid amount
* Outstanding amount

Use clear status badges:

```text
🔴 Late Return
⚠️ Booking Affected
```

Do not overload the table with too many columns. Use the booking details page for complete information.

---

# ADMIN-FE-05 — Replace Booking Details Drawer With Page

**Task ID: `ADMIN-FE-05`**

This is the **main UI structural change**.

The existing Booking Details drawer has become too long because of the new late-return, payment, bike, and operational information.

### Replace ONLY the Booking Details drawer with a dedicated page.

Example:

```text
/admin/bookings/:id
```

Use the project's existing route conventions if a booking-details route already exists.

### Important

Keep all other existing table drawers.

Do **not** convert every drawer into a page.

Only:

> **Booking Details Drawer → Booking Details Page**

---

# ADMIN-FE-06 — Booking Details Page

**Task ID: `ADMIN-FE-06`**

Create a professional, well-structured Booking Details page.

### Header

Show:

* Back to bookings
* Booking Number
* Booking Status
* Payment Status
* Customer
* Bike Number
* Important actions

---

## Section 1 — Booking Information

Show the existing booking information already available in the application.

Include where applicable:

* Booking number
* Customer
* Campus
* Bike
* Bike Number
* Registration Number
* Booking status
* Payment status
* Booking creation information

Do not remove existing useful booking information.

---

# ADMIN-FE-07 — Scheduled vs Actual Timeline

**Task ID: `ADMIN-FE-07`**

Clearly separate:

### Scheduled

```text
Pickup:  10:00 AM
Return:   6:00 PM
```

### Actual

```text
Pickup:  10:12 AM
Return:  6:25 PM
```

Do not visually mix scheduled and actual timestamps.

If the booking is late:

```text
🔴 Late Return
25 minutes
```

Use the API's actual late information rather than calculating it independently.

---

# ADMIN-FE-08 — Late Return Monitoring

**Task ID: `ADMIN-FE-08`**

Use:

`GET /api/v1/admin/bookings/late-returns` 

Show:

* Currently late count
* Booking Number
* Customer
* Bike Number
* Registration Number
* Late duration
* Scheduled return
* Return status

Bike status should clearly communicate:

> 🔴 **Late / Currently Rented**

The backend states that the bike remains `IN_USE` until actual return. 

---

# ADMIN-FE-09 — Dashboard Late Returns

**Task ID: `ADMIN-FE-09`**

Use:

`GET /api/v1/admin/dashboard/overview` 

Existing dashboard must remain.

Add/extend the booking statistics with:

```text
Late Returns
2
```

Use:

```text
bookings.lateReturns
```

Clicking it should take the admin to the relevant late-return/booking view.

Do not rebuild the dashboard.

---

# ADMIN-FE-10 — Late Charge Preview

**Task ID: `ADMIN-FE-10`**

Before return, use:

`GET /api/v1/admin/bookings/:id/late-charges`

This API is valid for `ACTIVE` bookings. 

Display:

* Late duration.
* Calculated late rental.
* Package name.
* Package duration.
* Package price.
* Disruption penalty amount.
* Affected booking, if any.
* Late status.

### Example

```text
Late Return
────────────────────
45 minutes late

Additional Rental
₹99

Package
1 Hour

Potential Disruption Penalty
₹150

⚠️ Booking Affected
BK260920ABC
```

**Do not calculate these values again in React.**

Use the API response.

---

# ADMIN-FE-11 — Affected Booking

**Task ID: `ADMIN-FE-11`**

If:

```text
affectedBooking != null
```

show:

```text
⚠️ Booking Affected

Booking: BK260920ABC
Customer: John
Pickup: 06:00 PM
Return: ...
Status: CONFIRMED
```

Make it easy for admin to open that booking.

### Important

The UI must **not automatically**:

* Cancel.
* Reschedule.
* Reassign.
* Modify.

the affected booking.

Admin decides what to do.

---

# ADMIN-FE-12 — Return Action

**Task ID: `ADMIN-FE-12`**

Use:

`PATCH /api/v1/admin/bookings/:id/return`

Request:

```json
{
  "returnOdometer": 12345,
  "applyLateFee": false,
  "applyDisruptionPenalty": false
}
```

The API explicitly says neither charge is automatically applied. 

### Return UI

Show:

```text
Return Odometer
[________]

☐ Apply Late Fee

☐ Apply Disruption Penalty
```

When selected, show the corresponding amount from the backend.

### Do not hardcode:

```text
₹150
```

Use:

```text
disruptionPenaltyAmount
```

from the backend/settings.

---

# ADMIN-FE-13 — Return Charge Summary

**Task ID: `ADMIN-FE-13`**

Before final confirmation, clearly show the charges returned/calculated by the backend.

Include where applicable:

* Late rental.
* Disruption penalty.
* Late helmet fee.
* Extra KM.
* Extra KM charge.
* GST.
* Outstanding amount.
* Final amount.

The return API explicitly provides these/additive fields. 

### Important

Do **not rewrite existing extra-KM or pricing calculations in frontend**.

Display backend results.

---

# ADMIN-FE-14 — Admin Late Fee Decision

**Task ID: `ADMIN-FE-14`**

The admin must have explicit control.

### Late fee

```text
☐ Apply Late Fee
```

### Disruption penalty

```text
☐ Apply Disruption Penalty
```

Neither is automatically selected just because the API provides a calculated amount.

Admin decides.

If your existing UI supports adjustment/waiver, integrate it without replacing the existing payment/adjustment architecture.

---

# ADMIN-FE-15 — Completed Booking Outstanding Payment

**Task ID: `ADMIN-FE-15`**

If return leaves an outstanding amount:

```text
Outstanding Amount
₹150

[ Collect Outstanding ]
```

Use:

`POST /api/v1/admin/bookings/:id/payments` 

Request:

```json
{
  "paymentMethod": "UPI",
  "reference": "optional"
}
```

Support:

* Loading.
* Success.
* Failure.
* Already paid.
* Prevent duplicate clicks.

---

# ADMIN-FE-16 — Bike Number Everywhere Relevant

**Task ID: `ADMIN-FE-16`**

Use `bike.bikeNumber` wherever a bike needs to be identified in the admin UI.

Especially:

* Booking list.
* Booking details.
* Late return list.
* Dashboard-related late information.
* Bike list.
* Bike details.
* Return flow.

The backend keeps:

```text
bike.id = internal relationship
bike.bikeNumber = human-readable identifier
```

Do not change this relationship. 

---

# ADMIN-FE-17 — Loading / Error / Success States

**Task ID: `ADMIN-FE-17`**

All new API-driven UI must have proper states.

### Loading

Use skeletons for:

* Booking details page.
* Late charge preview.
* Late return list.
* Dashboard late-return count.
* Settings.
* Bike create/edit.

### Actions

During API calls:

* Disable the relevant action.
* Show loading indicator.
* Prevent duplicate submission.

### Success

After:

* Return.
* Payment collection.
* Bike update.
* Settings update.

Update the UI using the API response/query invalidation pattern already used in the project.

### Error

Show clear user-friendly error messages.

Do not expose raw backend stack traces.

---

# ADMIN-FE-18 — Existing Drawers

**Task ID: `ADMIN-FE-18`**

This distinction is important:

### Replace

❌ **Booking Details Drawer**

with:

✅ **Booking Details Page**

### Keep

✅ Other existing drawers.

Do not globally replace the drawer system.

Use drawers for:

* Quick previews.
* Small forms.
* Existing table interactions.
* Other modules where they already work well.

---

# ADMIN-FE-19 — Professional Design

**Task ID: `ADMIN-FE-19`**

The new Booking Details page and modified admin screens must have a **modern, professional, production-quality RideOn design**.

Use:

* Clear visual hierarchy.
* Consistent spacing.
* Consistent typography.
* Professional cards.
* Clean tables.
* Meaningful status badges.
* Proper empty states.
* Proper skeleton states.
* Responsive layout.
* Subtle transitions.

Avoid:

* Excessive cards.
* Huge empty spaces.
* Too many colors.
* Oversized badges.
* Excessive rounded containers.
* AI-looking decorative UI.
* Unnecessary animations.

The design should feel like a **real operational/admin product**.

---

# ADMIN-FE-20 — Responsive Design

**Task ID: `ADMIN-FE-20`**

Ensure the new page works on:

* Desktop.
* Tablet.
* Mobile.

### Mobile

* Stack booking sections.
* Keep important status/action information near the top.
* Make action buttons touch-friendly.
* Prevent horizontal overflow.
* Allow tables to scroll horizontally where necessary.
* Keep late-return and affected-booking warnings highly visible.

---

# ADMIN-FE-21 — API Contract Compliance

**Task ID: `ADMIN-FE-21`**

Use the supplied API contract exactly.

### Client availability APIs are NOT part of this admin frontend task.

Do not implement customer endpoints here.

### Admin APIs relevant to this work

```text
GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings

POST   /api/v1/admin/bikes
PATCH  /api/v1/admin/bikes/:id

GET    /api/v1/admin/bookings
GET    /api/v1/admin/bookings/late-returns
GET    /api/v1/admin/bookings/:id/late-charges
PATCH  /api/v1/admin/bookings/:id/return
POST   /api/v1/admin/bookings/:id/payments

GET    /api/v1/admin/dashboard/overview
```

All are documented in the supplied API contract.    

---

# ADMIN-FE-22 — Do Not Duplicate Backend Calculations

**Task ID: `ADMIN-FE-22`**

The frontend must **display backend-calculated values**, not recreate business calculations.

Do not independently calculate:

* Late rental.
* Package rounding.
* Disruption penalty.
* GST.
* Extra KM.
* Extra KM charge.
* Outstanding amount.
* Booking buffer.
* Bike availability.

Backend remains the source of truth.

---

# ADMIN-FE-23 — Final Validation

**Task ID: `ADMIN-FE-23`**

Before declaring the implementation complete, verify:

* Existing admin authentication still works.
* Existing refresh/session behavior still works.
* Existing RBAC/permissions still work.
* Settings update works.
* Booking buffer comes from Settings.
* Bike Number create/update/list/search works.
* Booking list still works.
* `lateOnly` works.
* Late Returns dashboard works.
* Dashboard `lateReturns` works.
* Booking Details page works.
* Old Booking Details drawer is removed/replaced **only for booking details**.
* Other drawers remain.
* Late-charge preview works.
* Apply Late Fee works.
* Apply Disruption Penalty works.
* Neither charge is automatically applied.
* Affected booking is displayed correctly.
* Return works.
* Existing extra-KM information remains intact.
* Outstanding payment works.
* Loading/error/success states work.
* No duplicate actions occur.
* Desktop/mobile layouts work.
* No unrelated business logic or existing UI functionality has been changed.

---

## Final principle

```text
Existing Admin App
       │
       ├── Keep existing architecture
       ├── Keep existing auth/RBAC
       ├── Keep existing tables
       ├── Keep existing drawers
       │
       └── Replace ONLY Booking Details Drawer
                    ↓
             Booking Details Page
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
       Booking   Late Return  Payment
       Details    & Charges   / Outstanding
```

**This is an incremental UI enhancement, not an admin frontend rewrite.** The supplied API contract remains the source of truth, and the existing RideOn behavior must be preserved wherever the new requirements do not explicitly change it. 
