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

- Keep the UI clean, modern, professional and consistent with the existing RideOn design.
- give better mobile responsive design
- and in mobile when press check avilability slightly scroll down or half the page to see the result 
- give a smooth animation everywhere that need when open or close 
- see in mobile screen the return and pickup date format is different y ? we need consistent like dd-mm-yyy
- give in booking page more better ui ux - like skeltion on loading / placeholders and when api call is loading show loading correctly and all other like that 
    means suppose if paymetn success then the same page is remaining there so many time and it is interacive with no loaidng or somehting but after some seconds it return to bookign confirm page . like this we need to fix in all place this have .

----------------------------------------------------------------------------------------------------------------------------------------------------------