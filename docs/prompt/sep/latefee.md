# RideOn — Late Fee Implementation Prompt

## 1. Backend

Implement the late-fee feature without changing existing booking, pricing, package, payment, or bike-allocation logic.

* Add configurable **Booking Buffer** in General Settings. Default: **15 minutes**.
* Add configurable **Late Fee** settings:

  * Enabled/disabled
  * Fee interval: **5 minutes**
  * Fee amount: **₹10 per 5 minutes**
  * GST
* Keep **scheduled pickup/return time** and **actual pickup/return time** separate.
* Customer's booking time remains the scheduled time.
* Admin/staff can confirm/update the actual pickup and return time when the action happens.
* Calculate the late fee **when the return is recorded**, using the confirmed actual return time.
* Late fee increases in 5-minute blocks.
* No separate customer grace period.
* If the customer doesn't pay the late fee at return, keep it as **outstanding**.
* Include outstanding late fee in the customer's next booking payment while showing it separately from the new booking amount.
* Prevent duplicate late-fee/outstanding payments.
* If payment fails, keep the amount outstanding.
* Admin can adjust/waive an outstanding late fee with a reason.
* Apply GST separately.
* Keep bike unavailable until actual return.
* If a late return affects the next booking, do not automatically cancel it; allow the existing/admin process to handle reassignment or timing changes.
* Preserve backward compatibility and existing API contracts wherever possible.
* You can make changes if it is essential and needed and if breaks any other side you mention to me that also you fix it but dont make core logic changes 
* Follow industry best pracitces 
* At last give me the simple api doc and a simple doc that say what the changes needed to do in ui frontend.

---

## 2. Admin Frontend

Update the admin booking/pickup/return flow.

* Show **Scheduled Pickup/Return** and **Actual Pickup/Return** separately.
* During pickup/return, allow admin/staff to confirm or update the actual date/time.
* On return, automatically show the calculated late fee.
* Show:

  * Late duration
  * Late fee
  * GST
  * Total late-fee amount
* If there is an outstanding amount, show **Collect Outstanding Amount**.
* Allow admin to adjust/waive the amount with a reason.
* Show outstanding late fees clearly in booking/customer details.
* Show the configurable booking buffer and late-fee settings in **General Settings**.
* Keep the existing admin UI/business flow unchanged apart from the required additions.

---

## 3. Client Frontend

Update the customer booking and booking details UI.

* Keep the customer's original scheduled pickup/return time unchanged.
* Clearly show any **outstanding late fee** before/while making a new booking.
* Show the outstanding amount separately from the new rental charges.
* Include the outstanding amount in the final payable amount.
* If payment fails, clearly show that the outstanding amount is still pending.
* Do not create a separate booking flow for late fees.
* Do not change existing pricing/package/payment UI logic unnecessarily.
* Keep the UI mobile-first, clean and consistent with the existing RideOn design.

---

## 4. Important Rules

* **Scheduled time = customer's original booking time.**
* **Actual time = time confirmed/updated by admin/staff.**
* **Late fee = calculated from actual return time.**
* **15-minute buffer = booking-to-booking availability buffer, not customer grace period.**
* **Late fee = every 5 minutes.**
* **Unpaid late fee = outstanding + payable with the next booking.**
* **Admin handles exceptional operational cases.**
* **Do not disturb existing booking, pricing, payment, or allocation logic.**
