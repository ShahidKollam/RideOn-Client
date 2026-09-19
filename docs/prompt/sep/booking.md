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