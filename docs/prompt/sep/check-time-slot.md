RIDEON CLIENT FRONTEND — RESPONSIVE UX + AVAILABILITY + BOOKING UPDATE

I am providing the existing RideOn Client Frontend project as a ZIP.

Update the existing project based on the requirements below.

IMPORTANT:
- This is an incremental update, NOT a frontend rewrite.
- Inspect the existing project before changing anything.
- Preserve the existing architecture and component structure wherever possible.
- Reuse existing components, hooks, API services, utilities, forms, payment flow, booking flow, and styling system.
- Do not change backend APIs unless the existing API contract explicitly requires it.
- Use the existing API contract as the source of truth.
- Do not invent endpoints, request fields, response fields, or business rules.
- Do not change existing business logic unless required by the requirements below.
- Do not remove existing features.
- Do not rebuild authentication.
- Do not change customer JWT/refresh-token behavior.
- Do not introduce admin authentication into the client.
- Do not modify admin functionality.
- Do not change pricing calculations on the frontend.
- Backend remains responsible for authoritative pricing, availability, late charges, GST, package calculations, and payment amounts.

==================================================
TASK CLIENT-01 — INSPECT EXISTING CLIENT
==================================================

Before implementation, inspect:

- Existing client architecture
- Booking page
- Availability/check-availability flow
- Booking form
- Pricing display
- Payment flow
- Booking confirmation flow
- Bike display/components
- Authentication/session handling
- Existing responsive components
- Existing Tailwind/design system
- Existing loading/skeleton components
- Existing modal/drawer components
- API services/hooks
- Date/time utilities

Make changes using the existing patterns wherever possible.

==================================================
TASK CLIENT-02 — CHECK AVAILABILITY
==================================================

Existing API:

POST /api/v1/bookings/check-availability

Request uses the existing contract:

- campusId
- pickupAt
- returnAt
- helmetCount

Use the existing authentication mechanism.

The exact availability check must happen FIRST.

Do not create a separate frontend availability algorithm.

Use the backend response as the source of truth.

==================================================
TASK CLIENT-03 — AVAILABLE RESPONSE
==================================================

When the requested period is available:

Keep the existing successful booking flow.

Continue displaying the existing information returned by the API, including where available:

- available
- durationHours
- bookingBufferMinutes
- pricing
- amounts
- helmet information
- other existing response fields

Do not change the existing pricing/payment behavior.

The `bookingBufferMinutes` value comes from backend General Settings.

The client must NOT hardcode the booking buffer.

==================================================
TASK CLIENT-04 — UNAVAILABLE RESPONSE
==================================================

When the requested period is unavailable:

Show a clear message:

"No bike available for your selected time"

Then display up to 5 alternative time ranges returned by the backend.

Example:

┌──────────────────────────────┐
│ No bike available            │
│ for your selected time       │
│                              │
│ Alternative times            │
│                              │
│ 10:00 AM – 12:00 PM     →   │
│ 12:30 PM – 2:30 PM      →   │
│ 3:00 PM – 5:00 PM       →   │
└──────────────────────────────┘

The alternatives must come from the API.

DO NOT calculate alternatives on the frontend.

==================================================
TASK CLIENT-05 — ALTERNATIVE RULES
==================================================

Follow the backend response exactly.

Backend alternative selection rules are:

1. Maximum 5 alternatives.
2. Same duration first.
3. Alternatives closer to requested start time first.
4. Never suggest a longer duration.
5. Shorter duration may be suggested only when same-duration alternatives are insufficient.
6. Selecting an alternative must trigger a fresh availability check.

The frontend must NOT reproduce these ranking rules.

It only displays the alternatives returned by the API.

==================================================
TASK CLIENT-06 — SELECT ALTERNATIVE
==================================================

When the user selects an alternative:

Update:

- Pickup date
- Pickup time
- Return date
- Return time

using the selected alternative.

Then trigger the EXISTING Check Availability flow.

Do not create a separate booking flow.

The sequence must be:

Select alternative
        ↓
Update booking fields
        ↓
Check Availability
        ↓
Backend validates availability
        ↓
Show updated result
        ↓
Continue existing booking/payment flow

Do NOT automatically create a booking after selecting an alternative.

==================================================
TASK CLIENT-07 — BOOKING BUFFER
==================================================

The booking buffer is configurable from Admin General Settings.

Current/default value is 15 minutes.

The client must NEVER hardcode 15 minutes.

Use the `bookingBufferMinutes` value returned by the backend where it is exposed.

Do not implement a second frontend conflict calculation.

The backend remains the final authority for availability and booking conflicts.

==================================================
TASK CLIENT-08 — DATE FORMAT
==================================================

Use:

DD-MM-YYYY

consistently in the client UI.

Do not allow browser/device locale differences to produce inconsistent visible date formats.

Apply this consistently to all screen size:

- Booking form
- Pickup date
- Return date
- Availability alternatives
- Booking summary
- Confirmation
- Relevant booking displays

Do not change the underlying API date/time format if the API already expects ISO/date-time values.

Only the DISPLAY format should be standardized.

==================================================
TASK CLIENT-09 — DATE/TIME BEHAVIOR
==================================================

Do not change existing timezone/business behavior.

Keep the existing API date/time handling.

Only improve the UI representation and validation where required.

Do not introduce a new timezone system.

Do not convert times incorrectly between browser timezone and backend timezone.

==================================================
TASK CLIENT-10 — MOBILE AVAILABILITY RESULT
==================================================

On mobile:

After the user taps "Check Availability":

- Show loading state immediately.
- Disable duplicate submission while the request is processing.
- When the response arrives, smoothly scroll to the availability result section.
- Scroll only enough to bring the result into a comfortable visible position.
- Do not aggressively jump to the bottom.
- If the result is already visible, do not unnecessarily scroll.

Desktop:
- Use a small smooth scroll only when useful.
- Do not create distracting movement.

==================================================
TASK CLIENT-11 — RESPONSIVE BOOKING UI
==================================================

The booking page must be mobile-first.

Mobile users must not need unnecessary horizontal scrolling.

Review:

- Booking form
- Date/time controls
- Availability result
- Pricing summary
- Alternative slots
- Helmet selection
- Payment section
- Booking confirmation

All should fit within the viewport.

Use the existing Tailwind responsive system.

Do not redesign the entire booking page.

==================================================
TASK CLIENT-12 — OUTSTANDING LATE AMOUNT
==================================================

The payment API may return:

- rentalAmount
- outstandingLateAmount
- outstandingBookings
- totalAmount / amount

The client must display the outstanding amount separately from the new rental amount.

Example:

New Rental
₹300

Previous Outstanding Late Amount
₹100

GST
₹72

Total Payable
₹472

Use the backend-provided amounts.

DO NOT calculate late fees or GST independently if the backend already provides the authoritative values.

==================================================
TASK CLIENT-13 — PAYMENT FLOW
==================================================

Preserve the existing payment flow.

When creating an order:

Use the existing:

POST /api/v1/payments/create-order

behavior and response contract.

If outstanding late amount exists:

- Show it separately.
- Include it in the total payable shown to the customer.
- Do not create a separate late-fee payment flow.
- Do not create a separate booking for the outstanding amount.

The existing backend payment flow remains responsible for applying the correct amounts.

==================================================
TASK CLIENT-14 — SUCCESSFUL PAYMENT
==================================================

After successful payment:

Preserve the existing booking confirmation flow.

According to the API contract:

- The new booking's rental amount is associated with the new booking.
- Previous outstanding amount is settled through the payment order.
- The corresponding outstanding booking/payment state is updated by backend.

Do not manually update payment status on the frontend.

Use the existing verification API/flow.

==================================================
TASK CLIENT-15 — FAILED PAYMENT
==================================================

If payment fails:

- Show a clear error.
- Keep the user on a recoverable state.
- Do not duplicate the payment/order.
- Do not remove existing outstanding late amount.
- Allow the user to retry using the existing payment flow.

Do not implement independent payment state management that conflicts with the backend.

==================================================
TASK CLIENT-16 — BIKE NUMBER
==================================================

Bike responses may now contain:

- id
- registrationNumber
- bikeNumber
- name

`bikeNumber` is the human-readable bike identifier.

Display bikeNumber where relevant.

Example:

Bike
RO-001

Registration
KL-XX-1234

Do not replace the internal bike `id`.

Do not assume bikeNumber always exists because older bikes may have:

bikeNumber: null

Handle null safely.

==================================================
TASK CLIENT-17 — LOADING STATES
==================================================

Improve existing loading behavior.

For:

- Check Availability
- Booking creation
- Payment order creation
- Payment verification
- Confirmation
- API-loaded booking data

Use proper:

- Skeletons
- Loading indicators
- Disabled buttons
- Processing states

Do not allow users to accidentally submit the same action multiple times.

==================================================
TASK CLIENT-18 — PAYMENT TRANSITION
==================================================

After payment success:

Do not leave the old payment screen interactive while confirmation is loading.

Use a smooth transition:

Payment success
      ↓
Processing / verifying
      ↓
Booking confirmation

The transition should feel intentional and professional.

Do not add flashy animations.

==================================================
TASK CLIENT-19 — MICRO ANIMATIONS
==================================================

Add subtle animations only where useful:

- Availability result appearing
- Alternative list appearing
- Expand/collapse sections
- Loading states
- Success states
- Error states
- Buttons
- Modals/drawers/dropdowns

Animations must:

- Be short
- Be subtle
- Feel professional
- Not delay API operations
- Not interfere with payment
- Not interfere with booking
- Respect prefers-reduced-motion

Avoid flashy "AI-generated" animations.

==================================================
TASK CLIENT-20 — ERROR HANDLING
==================================================

Use the existing API error handling.

For availability:

Show a clear user-friendly message when unavailable.

For validation:

Show the error close to the relevant field/section.

For payment:

Show an understandable payment error.

For network/server errors:

Use the existing application's error pattern.

Do not expose raw backend stack traces or technical errors to users.

==================================================
TASK CLIENT-21 — RESPONSIVE RESULT DESIGN
==================================================

Availability result should be easy to scan.

For available:

Show:

- Availability status
- Selected duration
- Pickup/return
- Bike availability where returned
- Pricing summary
- Helmet details
- Continue/booking action

For unavailable:

Show:

- Clear unavailable message
- Alternative slots
- Each alternative as a selectable UI element
- Existing check availability action

Do not overwhelm the user with backend fields.

==================================================
TASK CLIENT-22 — BOOKING SUMMARY
==================================================

Review the booking summary and ensure it clearly separates:

Rental
Helmet
Platform fee
GST
Outstanding late amount
Other existing charges
Total

ONLY display sections that are applicable according to the existing backend response/business rules.

Do not change existing calculations.

Do not duplicate GST.

Do not calculate outstanding late amount again.

==================================================
TASK CLIENT-23 — EXISTING PRICING LOGIC
==================================================

This is extremely important.

DO NOT change existing:

- Hourly pricing
- Daily pricing
- Half-day pricing
- Package calculations
- Package multiplication
- Extra KM calculation
- Helmet pricing
- Platform fee
- GST
- Security deposit
- Late rental calculation
- Payment calculations

If these values are provided by backend APIs, display them.

The backend remains authoritative.

==================================================
TASK CLIENT-24 — BOOKING DURATION
==================================================

Do not change existing duration/package behavior.

For example, if the existing backend handles:

24 hours
48 hours
multiple package application
extra duration

continue using that behavior.

The frontend should not introduce a competing calculation.

==================================================
TASK CLIENT-25 — AUTHENTICATION
==================================================

Do not rebuild authentication.

Keep the existing customer authentication implementation.

Continue using the existing:

- Access token
- Customer refresh token
- Session persistence
- Protected API handling

Do NOT use admin authentication endpoints.

Do NOT introduce:

- adminRefreshToken
- admin JWT logic
- admin RBAC

into the client application.

==================================================
TASK CLIENT-26 — MOBILE FORM UX
==================================================

On mobile:

- Inputs must be full-width where appropriate.
- Date/time controls must be easy to tap.
- Buttons must have comfortable touch targets.
- Avoid cramped two-column layouts.
- Stack sections where necessary.
- Keep important actions visible.
- Avoid unnecessary horizontal scrolling.

Desktop layout should remain substantially unchanged.

==================================================
TASK CLIENT-27 — MOBILE ALTERNATIVE CARDS
==================================================

Alternative availability slots should work especially well on mobile.

Example:

┌──────────────────────────────┐
│ Alternative                  │
│                              │
│ 20 Sep                       │
│ 12:00 PM – 2:00 PM           │
│ 2 hours                      │
│                              │
│ Select →                     │
└──────────────────────────────┘

Make the whole card selectable if appropriate.

After selection:

- Update booking fields.
- Run Check Availability.
- Show the new backend result.

Do not directly proceed to payment.

==================================================
TASK CLIENT-28 — NO HORIZONTAL OVERFLOW
==================================================

Audit the client pages affected by this work.

Especially check:

- Booking page
- Availability result
- Alternative slots
- Payment summary
- Confirmation
- Bike information
- Responsive navigation

There should be no accidental horizontal page overflow on normal mobile widths.

Do not solve overflow by simply hiding important content.

==================================================
TASK CLIENT-29 — ACCESSIBILITY
==================================================

Ensure:

- Buttons have clear labels.
- Interactive alternative cards are keyboard accessible.
- Focus states remain visible.
- Loading states are understandable.
- Status information is not communicated by color alone.
- Reduced-motion preference is respected.

Do not introduce accessibility regressions.

==================================================
TASK CLIENT-30 — PERFORMANCE
==================================================

Do not introduce unnecessary:

- API requests
- polling
- duplicate queries
- expensive renders
- large dependencies

Selecting an alternative should use the existing availability API flow.

Do not call availability repeatedly because of UI state changes.

==================================================
TASK CLIENT-31 — API CONTRACT COMPLIANCE
==================================================

Follow the existing API contract exactly.

Important existing client APIs include:

POST /api/v1/bookings/check-availability

POST /api/v1/payments/create-order

and the existing payment verification/booking APIs already used by the project.

Do not invent new endpoints.

Do not modify request/response contracts from the frontend.

If an existing implementation differs from the API contract, inspect the actual project and make only the minimum required correction.

==================================================
TASK CLIENT-32 — NO BUSINESS LOGIC DUPLICATION
==================================================

Frontend responsibilities:

- Collect user input.
- Display backend results.
- Allow user selection.
- Trigger existing APIs.
- Display pricing/charges returned by backend.
- Handle UI states.

Backend responsibilities:

- Availability
- Booking conflicts
- Booking buffer
- Pricing
- Package calculations
- GST
- Late rental
- Disruption penalty
- Outstanding amounts
- Payment totals
- Bike allocation
- Booking state

Do not move backend business logic into the frontend.

==================================================
TASK CLIENT-33 — EXISTING UI PRESERVATION
==================================================

Do not unnecessarily redesign the whole application.

Preserve:

- Existing branding
- Existing colors
- Existing typography
- Existing navigation
- Existing components
- Existing booking flow
- Existing payment flow
- Existing authentication
- Existing pages

Improve only what is required.

==================================================
TASK CLIENT-34 — FINAL RESPONSIVE VALIDATION
==================================================

Test at minimum:

Mobile:
- 320px
- 375px
- 390px
- 430px

Tablet:
- 768px

Desktop:
- 1024px+
- 1440px+

Verify:

1. No unwanted horizontal overflow.
2. Booking form works.
3. Check Availability works.
4. Available response works.
5. Unavailable response works.
6. Alternatives display correctly.
7. Selecting an alternative updates fields.
8. Selecting an alternative triggers availability check.
9. Booking buffer is never hardcoded.
10. Date display is DD-MM-YYYY.
11. Pricing remains unchanged.
12. GST remains correct.
13. Outstanding late amount displays separately.
14. Total payable is taken from backend.
15. Payment flow works.
16. Payment failure is recoverable.
17. Payment success transitions correctly.
18. Bike number displays correctly.
19. Null bikeNumber does not break UI.
20. Authentication/session remains unchanged.
21. Existing APIs continue working.
22. Existing business logic remains unchanged.

==================================================
TASK CLIENT-35 — FINAL CODE QUALITY
==================================================

Before finishing:

- Remove unused imports.
- Remove dead code introduced by this task.
- Avoid duplicate components.
- Follow the project's existing naming conventions.
- Follow existing Tailwind conventions.
- Keep components maintainable.
- Do not introduce unnecessary abstractions.
- Do not leave debugging console logs.
- Do not modify unrelated files.

==================================================
FINAL OUTPUT
==================================================

Return the UPDATED CLIENT FRONTEND PROJECT.

Also provide a concise implementation summary:

1. Files/components changed
2. Availability changes
3. Alternative-slot UX changes
4. Mobile/responsive improvements
5. Outstanding late amount/payment changes
6. Bike number changes
7. Loading/animation improvements
8. Confirmation that existing business logic was preserved
9. Confirmation that authentication was preserved
10. Confirmation that no unnecessary backend/API changes were made
11. Any issues discovered during implementation

MOST IMPORTANT:

This is an incremental RideOn client update.

DO NOT REBUILD THE APPLICATION.

DO NOT CHANGE EXISTING BUSINESS LOGIC UNLESS REQUIRED.

DO NOT CREATE A SECOND BOOKING/PRICING/PAYMENT SYSTEM.

USE THE EXISTING API CONTRACT AND EXISTING PROJECT ARCHITECTURE.

The final result should feel like the same RideOn application, but cleaner, smoother, more responsive, and easier to use—especially on mobile.