Here's a simple, clear prompt you can give to your AI/code generator:

---

**Prompt**

We need to update the RideOn onboarding flow by adding a new **Step 3: Driving Licence Verification**.

### New Onboarding Flow

1. Sign Up
2. Verify Magic Link
3. Complete Profile (keep existing fields only)

   * Phone
   * Hostel
   * Department
   * Year of Study
   * Accept Terms
4. Driving Licence Verification (new step)

   * Driving Licence Number
   * Issuing Authority
   * Vehicle Class
   * Issue Date
   * Expiry Date
   * Upload Front Licence Image
   * Upload Back Licence Image
5. Dashboard

### Backend Changes

* Create a new API for Step 3 (Driving Licence Verification).
* Move all driving licence-related logic from `completeProfile()` to the new API.
* Store all licence information in the `DrivingLicense` model.
* Add new onboarding status: `LICENSE_COMPLETED`.
* Update login/onboarding redirect logic:

  * `EMAIL_VERIFIED` → Complete Profile
  * `PROFILE_COMPLETED` → Driving Licence Verification
  * `LICENSE_COMPLETED` → Dashboard

### Frontend Changes

* Keep the existing Signup page.
* Keep the existing Complete Profile page (remove Driving Licence Number from it).
* Create a new page: **DrivingLicence.jsx** for Step 3.
* After Step 2, navigate to Step 3.
* After successful Step 3 submission, navigate to the Dashboard.

**Note:** Do not implement OCR yet. Only allow users to manually enter licence details and upload front/back licence images. The architecture should be designed so OCR can be added later without changing the database.
