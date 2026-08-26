=== write dowm here for admin changes 

- Pagination in ui and add contract - in pagination need a limit selection of 10, 25,50,100,200 only  and defult 10 
- complete page for modules - like total users box
- and after a less time admin is logout 
- we can go for a complete implementation of admin frontend 
- but dont make any other issues or mistakes 
- already we dome some parts , but we need to do more and complete it
- i gave the first prompt base one - once more for your reference but we done aleady some of it in that 
- so you no need to rebuild a new one instead you can update the current folder
- currently it is very nice and super intersting - so you follow it and if need add more better super design style , ui ux
- follow professional standards

- in policy page you change the dseign to the image i shared
- we need the complete working site , so make all things interactive, like action three buttons and inside it 
- for edit delete , etch all thing add and if any are not supporting in api contract only you must keep there dummy 
- and in action three button know when we preess it and just move outside it then the box hide immediatly 
- this is not a user frinedly - dont hide it if clicked outside only hide it or clickes a item in it so then follow as it is in professional
- in login page - it is completly differnet from our prject standards and colore and no theme icon - giv e icon 
- login - must be more better design super professional modern and i share a image for login page - you do that
- login browser is not askign to save the credientials and then we can reuse it - is this in code do it fo r that
- dont forget about drawer in best design 
- and there must be all are workign - workign means if there is a menu lis t dropdown show it or what matches 
- header show a hamburg for sidebar expand and collapse left of sidebar and remove the icon BELOW SUPERADMIN IN SIDEBAR BOTTOM < THIS ARROW 

- give add edit view for all have it 
- GIV E CUSTOM modals , confirem box , toast , for all it needed you must give that all where all needed
- in header profile icon must be working 
- 


- up to this new prompt 

- api contract - **Complete Admin API Contract** (corrected + pagination included)

Base path for admin routes: `/admin`  
Auth: all endpoints below require `protectAdmin` (Bearer token with admin role) unless noted.  
Standard success response shape:


{
  "success": true,
  "message": "...",
  "data": { ... }
}


List endpoints always return:


{
  "success": true,
  "message": "...",
  "data": {
    "<items>": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}


---

## 0. Auth (Admin)

| Method | Endpoint       | Auth           | Description                         |
| ------ | -------------- | -------------- | ----------------------------------- |
| `POST` | `/auth/login`  | None           | Admin login                         |
| `GET`  | `/auth/me`     | `protectAdmin` | Current admin profile + permissions |
| `POST` | `/auth/logout` | `protectAdmin` | Logout / invalidate session         |

**Login payload**


{
    "email": "admin@rideon.com",
    "password": "Admin@12345"
}


---

## 1. Bike Module (Admin)

| Method   | Endpoint                  | Auth           | Description                      |
| -------- | ------------------------- | -------------- | -------------------------------- |
| `POST`   | `/admin/bikes`            | `protectAdmin` | Create bike                      |
| `GET`    | `/admin/bikes`            | `protectAdmin` | List bikes (paginated)           |
| `GET`    | `/admin/bikes/:id`        | `protectAdmin` | Get bike                         |
| `PATCH`  | `/admin/bikes/:id`        | `protectAdmin` | Update bike                      |
| `PATCH`  | `/admin/bikes/:id/status` | `protectAdmin` | Change status                    |
| `DELETE` | `/admin/bikes/:id`        | `protectAdmin` | Soft delete (`isActive = false`) |

### 1.1 Create Bike

**POST** `/admin/bikes`


{
    "campusId": "clx...",
    "registrationNumber": "MH12AB1234",
    "name": "Honda Activa 6G",
    "brand": "Honda",
    "model": "Activa 6G",
    "year": 2024,
    "color": "Pearl White",
    "imageUrls": ["https://example.com/bike1.jpg"],
    "currentOdometer": 1250
}


- `year`, `color`, `imageUrls`, `currentOdometer` optional
- `currentOdometer` defaults to `0`

### 1.2 List Bikes

**GET** `/admin/bikes`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search registration / name / brand / model |
| `campusId`| string | - | Filter by campus |
| `status` | enum | - | `AVAILABLE` \| `MAINTENANCE` \| `DISABLED` \| `RETIRED` |
| `isActive`| boolean | true | Active / inactive filter |

**Response data**


{
  "bikes": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}


### 1.3 Update Bike

**PATCH** `/admin/bikes/:id`  
All fields optional:


{
    "name": "Honda Activa 6G Updated",
    "brand": "Honda",
    "model": "Activa 6G",
    "year": 2024,
    "color": "Matte Black",
    "imageUrls": ["https://example.com/new.jpg"],
    "currentOdometer": 1800
}


### 1.4 Change Status

**PATCH** `/admin/bikes/:id/status`


{
    "status": "AVAILABLE"
}


Allowed: `AVAILABLE` | `MAINTENANCE` | `DISABLED` | `RETIRED`

### 1.5 Soft Delete

**DELETE** `/admin/bikes/:id`  
No body. Sets `isActive = false`.

---

## 2. Pricing Module (Admin)

| Method   | Endpoint             | Auth           | Description                      |
| -------- | -------------------- | -------------- | -------------------------------- |
| `POST`   | `/admin/pricing`     | `protectAdmin` | Create pricing                   |
| `GET`    | `/admin/pricing`     | `protectAdmin` | List pricing (paginated)         |
| `GET`    | `/admin/pricing/:id` | `protectAdmin` | Get pricing                      |
| `PATCH`  | `/admin/pricing/:id` | `protectAdmin` | Update pricing                   |
| `DELETE` | `/admin/pricing/:id` | `protectAdmin` | Soft delete (`isActive = false`) |

### 2.1 Create Pricing

**POST** `/admin/pricing`


{
    "campusId": "clx...",
    "packageName": "4 Hour Package",
    "durationHours": 4,
    "price": 250,
    "includedKm": 40,
    "extraKmRate": 5,
    "depositAmount": 500,
    "displayOrder": 1,
    "isFeatured": true,
    "isActive": true
}


- `displayOrder` defaults to `0`
- `isFeatured` defaults to `false`
- `isActive` defaults to `true`

### 2.2 List Pricing

**GET** `/admin/pricing`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `campusId`| string | - | Filter by campus |
| `isActive`| boolean | true | Active / inactive filter |

**Response data**


{
  "pricings": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}


### 2.3 Update Pricing

**PATCH** `/admin/pricing/:id`  
All fields optional (same keys as create except `campusId`).

### 2.4 Soft Delete

**DELETE** `/admin/pricing/:id`  
No body. Sets `isActive = false`.

---

## 3. Booking Module (Admin)

| Method  | Endpoint                     | Auth           | Description                   |
| ------- | ---------------------------- | -------------- | ----------------------------- |
| `POST`  | `/admin/bookings`            | `protectAdmin` | Create booking for any user   |
| `GET`   | `/admin/bookings`            | `protectAdmin` | List all bookings (paginated) |
| `GET`   | `/admin/bookings/:id`        | `protectAdmin` | Get booking                   |
| `PATCH` | `/admin/bookings/:id/pickup` | `protectAdmin` | Mark pickup                   |
| `PATCH` | `/admin/bookings/:id/return` | `protectAdmin` | Mark return                   |
| `PATCH` | `/admin/bookings/:id/cancel` | `protectAdmin` | Cancel booking                |

### 3.1 Admin Create Booking

**POST** `/admin/bookings`


{
    "userId": "clx...",
    "campusId": "clx...",
    "pickupAt": "2026-08-05T10:00:00.000Z",
    "returnAt": "2026-08-05T14:00:00.000Z",
    "notes": "Walk-in / Phone booking"
}


- Server auto-selects available bike and matching pricing by duration.
- No `bikeId` or `pricingId` in payload.

### 3.2 List Bookings

**GET** `/admin/bookings`

**Query params**
| Param | Type | Default | Description |
|-----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search by bookingNumber |
| `status` | enum | - | `PAYMENT_PENDING` \| `CONFIRMED` \| `ACTIVE` \| `COMPLETED` \| `CANCELLED` \| `FAILED` \| `NO_SHOW` |
| `userId` | string | - | Filter by user |
| `campusId`| string | - | Filter by campus |

**Response data**


{
  "bookings": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "totalPages": 5
  }
}


### 3.3 Pickup

**PATCH** `/admin/bookings/:id/pickup`  
Allowed only when status = `CONFIRMED`


{
    "pickupOdometer": 1250
}


### 3.4 Return

**PATCH** `/admin/bookings/:id/return`  
Allowed only when status = `ACTIVE`


{
    "returnOdometer": 1320
}


Server calculates `actualKm`, `extraKm`, `extraKmCharge` and updates totals.

### 3.5 Cancel (Admin)

**PATCH** `/admin/bookings/:id/cancel`


{
    "reason": "Customer requested cancellation"
}


`reason` is optional.

---

## 4. Users Module (Admin)

| Method | Endpoint       | Auth           | Description            |
| ------ | -------------- | -------------- | ---------------------- |
| `GET`  | `/admin/users` | `protectAdmin` | List users (paginated) |

**Query params**
| Param | Type | Default | Description |
|--------------------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search name / email |
| `onboardingStatus` | enum | - | `SIGNED_UP` \| `EMAIL_VERIFIED` \| `PROFILE_COMPLETED` |

**Response data**


{
  "users": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 12
  }
}


---

## 5. Payments Module (Admin view)

| Method | Endpoint              | Auth           | Description               |
| ------ | --------------------- | -------------- | ------------------------- |
| `GET`  | `/admin/payments`     | `protectAdmin` | List payments (paginated) |
| `GET`  | `/admin/payments/:id` | `protectAdmin` | Get payment               |

**Query params**
| Param | Type | Default | Description |
|----------|---------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search |
| `status` | enum | - | `PENDING` \| `PAID` \| `FAILED` \| `REFUNDED` \| `PARTIALLY_REFUNDED` |

**Response data**


{
  "payments": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}


---

## 6. Settings / Policies (Admin)

| Method  | Endpoint                               | Auth           | Description          |
| ------- | -------------------------------------- | -------------- | -------------------- |
| `GET`   | `/admin/settings` or `/admin/policies` | `protectAdmin` | Get current settings |
| `PATCH` | `/admin/settings` or `/admin/policies` | `protectAdmin` | Update settings      |

**Update payload** (all fields optional)


{
    "gstEnabled": true,
    "gstRate": 18,
    "platformFeeEnabled": true,
    "platformFee": 20,
    "helmetFirstPrice": 50,
    "helmetSecondPrice": 30,
    "lateHelmetFee": 100
}


---

### Important Business Rules (from code)

- Bike is locked at **booking creation** time.
- 15-minute buffer is enforced between bookings on the same bike.
- Pricing is auto-selected by the server based on `durationHours`.
- User must have verified email + `onboardingStatus = PROFILE_COMPLETED` + driving license `APPROVED` (for user-created bookings).
- Soft delete is used for Bike and Pricing (`isActive = false`).
- Admin create booking does **not** accept `bikeId` — server finds an available bike.

This is the complete, correct admin-side contract with pagination and accurate payloads.

- old prompt - 



- i shared only the images of light and dark vresions - you need to build the same and for other pages you follow this same image ui idea styles.etc and prompt.

# RIDEON ADMIN FRONTEND — GENERAL FOUNDATION PROMPT

You are building the frontend for the RideOn Admin Panel.

This prompt defines the GENERAL frontend architecture, UI/UX standards,
folder structure, development rules, and project-output requirements.

Feature-specific requirements will be provided separately later.

Do not invent or implement business features that are not provided.

==================================================
1. PROJECT GOAL
==================================================

Build a professional, production-quality RideOn Admin frontend.

The project must be:

- Fully runnable
- Clean
- Maintainable
- Responsive
- Modular
- Permission-aware
- API-ready
- Easy to extend module-by-module

This is an actual working frontend project, NOT a UI mockup.

Every implemented feature must actually work inside the application.

==================================================
2. TECHNOLOGY
==================================================

Use:

- React
- JavaScript
- Tailwind CSS
- React Router
- TanStack Query
- React Context

Do NOT use:

- TypeScript
- Redux
- Redux Toolkit

Use functional React components.

Do not introduce unnecessary libraries.

If a library is genuinely required, prefer a lightweight and
well-maintained solution.

==================================================
3. IMPORTANT — MODULE-BASED ARCHITECTURE
==================================================

Use a FEATURE/MODULE-BASED folder structure.

Do NOT organize the whole application primarily as:

pages/
components/
services/

Instead, keep feature-specific code together.

Example:

src/
│
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── bikes/
│   ├── bookings/
│   ├── payments/
│   ├── pricing/
│   ├── policies/
│   ├── roles/
│   └── audit/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── feedback/
│
├── context/
├── hooks/
├── lib/
├── routes/
└── utils/

Each module may contain only what that module actually needs.

For example:

modules/users/
├── pages/
├── components/
├── hooks/
├── api/
└── ...

Keep UserDetailsDrawer inside users if it is user-specific.

Move something into shared components only when it is genuinely
reusable or clearly generic.

Do NOT create abstractions just for the sake of abstraction.

==================================================
4. SIDEBAR
==================================================

All currently defined RideOn Admin modules must be represented in
the sidebar/navigation.

The sidebar should be structured into small professional groups.

Example:

MAIN
- Dashboard

OPERATIONS
- Users
- Bikes
- Bookings
- Payments

BUSINESS
- Pricing
- Policies

ADMINISTRATION
- Roles & Permissions
- Audit Logs

However:

Sidebar visibility MUST respect RBAC permissions.

Do not hard-code visibility based on role names.

Use permissions.

Example:

payments.read
→ show Payments

No payments.read
→ do not show Payments

==================================================
5. FEATURE PLACEHOLDER / DEVELOPMENT STRUCTURE
==================================================

The base project should have the navigation structure for all known
modules.

When a module has not yet been implemented, clicking it should NOT
lead to a broken route, blank page, or fake completed feature.

Instead show a professional development placeholder such as:

------------------------------------------------
Bookings

This module is currently under development.

The module will appear here once implementation
is completed.

------------------------------------------------

OR another polished "Coming Soon / Under Development"
experience matching the RideOn design.

Do NOT create fake tables, fake statistics, fake records,
or fake API responses just to make an unfinished module
look completed.

The sidebar can contain the module from the beginning,
while actual feature implementation is done later.

==================================================
6. API
==================================================

The Admin API base path is:

/api/v1/admin

Authentication uses:

Authorization: Bearer <accessToken>

The frontend must consume the provided backend API.

Do NOT duplicate backend business logic inside React.

The backend remains the source of truth for:

- Business rules
- Validation
- Authorization
- Pricing calculations
- Booking rules
- Payment rules
- Status transitions
- Audit logging

Frontend should only handle presentation, interaction,
validation appropriate for UX, and API communication.

==================================================
7. STATE MANAGEMENT
==================================================

Use three types of state.

A. AUTHENTICATION / RBAC STATE
Use React Context.

Store:

- admin
- accessToken
- permissions
- isAuthenticated

Provide utilities such as:

- login()
- logout()
- hasPermission()

B. SERVER STATE
Use TanStack Query.

Use TanStack Query for:

- Dashboard data
- Users
- Bikes
- Bookings
- Payments
- Pricing
- Policies
- Roles
- Audit logs
- Any future API data

Do NOT put API lists into Context.

Do NOT use Redux for server data.

C. LOCAL UI STATE
Use:

- useState
- useReducer where genuinely useful

For:

- Drawer state
- Modal state
- Selected item
- Filters
- Search
- Form state
- UI preferences
- Confirmation state

==================================================
8. TANSTACK QUERY
==================================================

Use TanStack Query professionally.

It should handle:

- Queries
- Mutations
- Loading states
- Error states
- Caching
- Refetching
- Query invalidation

After mutations, invalidate/refetch affected queries.

Example:

Create Bike
→ successful API response
→ invalidate bikes query
→ display updated bike list

Cancel Booking
→ successful API response
→ invalidate booking
→ invalidate booking list
→ update related dashboard data when appropriate

Do not manually duplicate server state unnecessarily.

==================================================
9. RBAC
==================================================

Use permission-based RBAC.

Do NOT build UI logic like:

if admin.role === "SUPER_ADMIN"

Prefer:

hasPermission("payments.read")

Permissions should control:

- Sidebar items
- Routes
- Pages
- Buttons
- Actions
- Create/Edit/Delete controls

Frontend RBAC is for UX.

Backend authorization is the real security layer.

Never assume hiding a button provides security.

The backend must still reject unauthorized API requests.

==================================================
10. ROUTE PROTECTION
==================================================

Protected routes must verify authentication.

Permission-protected routes must verify the required permission.

If unauthenticated:

→ redirect to login.

If authenticated but lacking permission:

→ show a professional Access Denied page
OR redirect to an allowed page.

Do NOT redirect an authenticated user to login
just because they lack permission.

==================================================
11. 401 / 403 HANDLING
==================================================

Handle these centrally.

401:

- Session expired / unauthorized
- Clear invalid session when appropriate
- Redirect to login
- Show clear user feedback

403:

- User is authenticated
- User does not have permission
- Show Access Denied
- Do not treat it as a login problem

==================================================
12. GLOBAL ERROR HANDLING
==================================================

The application must have a global API/error-handling strategy.

Handle:

- Network errors
- 401
- 403
- 404 where relevant
- 422/validation errors
- 500/server errors
- Unexpected API responses
- Session expiration

Do not allow raw API errors to create ugly UI.

Show meaningful user-facing messages.

Use a React Error Boundary for unexpected React/rendering
errors.

The entire application must NOT become a blank white screen
because one component crashes.

Provide a professional fallback such as:

Something went wrong.

We couldn't display this page.

[Try Again] [Go to Dashboard]

==================================================
13. LOADING STATES
==================================================

Loading must be handled professionally.

Do NOT leave blank white areas while waiting for API responses.

Use appropriate loading UI:

- Page skeleton
- Table skeleton
- Card skeleton
- Drawer skeleton
- Button loading state
- Inline loading where appropriate

For mutations:

Save
→ Saving...

Delete
→ Deleting...

Return
→ Returning...

Disable the relevant action while the mutation is running
to prevent duplicate requests.

==================================================
14. EMPTY STATES
==================================================

Empty data is NOT an error.

Create professional empty states.

Example:

No bikes found.

There are no bikes matching your current filters.

[Clear Filters]

For a genuinely empty module:

No bikes yet.

Add your first RideOn bike.

[Add Bike]

==================================================
15. REUSABILITY
==================================================

Use reusable components where there is genuine repetition.

Good candidates include:

- Button
- Input
- Select
- Modal
- Drawer
- Confirmation Dialog
- DataTable
- Pagination
- SearchInput
- FilterBar
- StatusBadge
- PageHeader
- Breadcrumb
- Toast
- Skeleton
- EmptyState
- ErrorState
- LoadingButton

Users, Bikes, Bookings and Payments should be able to reuse
common table foundations where appropriate.

BUT:

Do not create giant "universal" components with dozens of
configuration options.

Prefer small, composable, understandable components.

==================================================
16. CUSTOM RIDEON DESIGN SYSTEM
==================================================

Do NOT use browser-default UI for important interactions.

Do NOT use:

window.confirm()

Do NOT rely on ugly default browser alerts.

Create a custom RideOn UI system.

The design system should cover:

- Typography
- Spacing
- Colors
- Border radius
- Shadows
- Buttons
- Inputs
- Selects
- Cards
- Tables
- Status badges
- Modals
- Drawers
- Confirmation dialogs
- Toasts
- Tabs
- Dropdowns
- Pagination
- Skeletons
- Empty states
- Error states

All modules must visually belong to the same product.

==================================================
17. MODALS
==================================================

Create professional custom modals matching the RideOn design.

Examples:

- Add Bike
- Edit User
- Edit Pricing
- Change Status
- Pickup
- Return
- Edit Role
- Confirmation dialogs

Confirmation dialogs should be visually polished and
context-aware.

Example:

Delete Bike?

Are you sure you want to delete this bike?

This action cannot be undone.

[Cancel] [Delete Bike]

Do not create a completely different modal design
for every module.

Use a shared modal foundation while allowing module-specific
content.

==================================================
18. DRAWERS
==================================================

Use drawers for quick details without leaving the current page.

Examples:

Users
→ User Details Drawer

Bikes
→ Bike Details Drawer

Bookings
→ Booking Details Drawer

Payments
→ Payment Details Drawer

Audit
→ Audit Details Drawer

The drawer should:

- Slide smoothly
- Have clear header
- Have close button
- Support loading state
- Support error state
- Be responsive
- Handle keyboard Escape
- Manage focus properly

On mobile, drawers may become full-screen panels where appropriate.

==================================================
19. PAGES VS DRAWERS VS MODALS
==================================================

Use this rule:

PAGE
→ Major workspace/module

DRAWER
→ Inspect details / quick information

MODAL
→ Focused edit or small action

CONFIRMATION MODAL
→ Destructive or important action

INLINE CONTROL
→ Very small state change

Do not turn every interaction into a separate page.

Do not put large complicated workflows into tiny modals.

==================================================
20. BREADCRUMBS
==================================================

Use breadcrumbs where navigation depth makes them useful.

Examples:

Home / Bookings

Home / Bookings / BK1024

Home / Business / Pricing

Do not clutter simple top-level pages with unnecessary
breadcrumbs.

==================================================
21. PAGE HEADER
==================================================

Major pages should have a consistent Page Header.

Example:

Breadcrumb

Bookings

Manage and monitor RideOn bookings

[Page Actions]

Then filters/content.

Keep page headers visually consistent throughout the application.

==================================================
22. TABLES
==================================================

Tables will be a major part of the admin.

Provide a reusable table foundation where useful.

Support as required:

- Server-side pagination
- Search
- Filters
- Sorting where useful
- Status badges
- Row actions
- Loading skeleton
- Empty state
- Error state
- Responsive behavior

Avoid overcrowded action columns.

Use a compact action menu for secondary actions where appropriate.

==================================================
23. PAGINATION
==================================================

Use server-side pagination for large API lists.

Do NOT fetch thousands of records just to paginate them
in the browser.

Pagination should be reusable where appropriate.

Example:

Showing 21–40 of 245

[Previous] 1 2 3 4 5 [Next]

==================================================
24. SEARCH / FILTERS
==================================================

Use a consistent filtering system.

Prefer:

Search
+ Common Filters
+ More Filters

Do not show a huge number of filters by default.

Search should be debounced where appropriate.

==================================================
25. URL STATE
==================================================

For important list state, use URL query parameters where
appropriate.

Example:

/admin/bookings?status=ACTIVE&page=2

This helps with:

- Refresh
- Browser back/forward
- Sharing a filtered page
- Preserving list state

Do not put every tiny UI state into the URL.

==================================================
26. FORMS
==================================================

Forms must have:

- Clear labels
- Appropriate inputs
- Validation
- Error messages
- Loading state
- Submit
- Cancel

Prevent duplicate submission.

Show useful validation messages.

Do not rely only on browser validation.

Backend remains the final validation authority.

==================================================
27. TOASTS / FEEDBACK
==================================================

Use one consistent toast/feedback system.

Success:

Bike created successfully.

Error:

Unable to update booking.

Do not create separate notification implementations
inside individual modules.

==================================================
28. STATUS BADGES
==================================================

Create a reusable StatusBadge foundation.

Examples:

ACTIVE
AVAILABLE
MAINTENANCE
COMPLETED
CANCELLED
PENDING
DISABLED
RETIRED

Status appearance should be consistent throughout the application.

==================================================
29. RESPONSIVE DESIGN
==================================================

The admin must work properly on:

- Desktop
- Tablet
- Mobile

Desktop:

Sidebar + Topbar + Content

Tablet:

Collapsed/compact navigation where appropriate

Mobile:

Mobile navigation
+
Content
+
Full-width modal/drawer where appropriate

Do not simply shrink desktop tables until they become unusable.

Use cards or controlled horizontal scrolling where appropriate.

==================================================
30. ACCESSIBILITY
==================================================

Implement sensible accessibility.

At minimum:

- Keyboard navigation
- Proper semantic buttons
- Form labels
- Focus management
- Modal focus handling
- Escape to close modal/drawer
- Sufficient contrast
- Meaningful status indicators
- Accessible interactive controls

==================================================
31. VISUAL DESIGN
==================================================

The RideOn Admin should feel like a premium modern SaaS
operations dashboard.

Design direction:

- Professional
- Clean
- Modern
- Premium
- Minimal
- Strong spacing
- Excellent typography
- Subtle shadows
- Rounded surfaces
- Minimal tasteful glass/soft UI
- Smooth transitions

Do NOT overuse:

- Glassmorphism
- Gradients
- Huge shadows
- Excessive animations
- Decorative elements

The design must prioritize usability over visual effects.

It should NOT look like a generic Bootstrap/admin template.

==================================================
32. SIDEBAR / LAYOUT UX
==================================================

Support:

- Expanded sidebar
- Collapsed sidebar
- Mobile navigation

When collapsed, provide useful tooltips for icons.

Sidebar state may be local UI state and may optionally be
persisted.

No Redux is required.

==================================================
33. NO FAKE FEATURES
==================================================

Do NOT create fake:

- API data
- Statistics
- Notifications
- Payments
- Search results
- Export functionality
- Backend responses

If the backend/API is not available yet, use a clearly
defined API integration layer and/or development placeholder.

Never make fake data look like real production data.

==================================================
34. NO UNNECESSARY FEATURES
==================================================

Do not add features simply because they are common in admin panels.

Examples:

- Global search
- Export
- Notifications
- Analytics
- Reports

Only implement them when the feature/API requirement
is explicitly provided.

==================================================
35. PERFORMANCE
==================================================

Use sensible performance practices.

- TanStack Query caching
- Server-side pagination
- Debounced search
- Lazy-load larger modules where useful
- Avoid unnecessary API calls
- Avoid unnecessary global state
- Avoid rendering huge lists
- Reuse components sensibly

Do not over-engineer optimization before there is a problem.

==================================================
36. DEVELOPMENT APPROACH
==================================================

Build incrementally.

Do NOT generate hundreds of files before implementing
anything.

Recommended approach:

Foundation
→ Test
→ Implement feature
→ Test
→ Implement next feature
→ Test

Every implemented feature must actually connect to the
frontend architecture.

Do not create empty files just to make the folder structure
look complete.

==================================================
37. FEATURE PLACEHOLDER RULE
==================================================

All planned modules can appear in the sidebar.

However, if a module has not been implemented yet:

Sidebar
→ Module
→ Professional "Under Development" page

Once its feature-specific prompt is provided:

Under Development
→ Replace with actual implementation

Do not break existing modules while adding a new module.

==================================================
38. EXISTING PROJECT RULE
==================================================

If an existing RideOn frontend project is provided:

1. Inspect the project first.
2. Understand its structure.
3. Reuse existing good components and patterns.
4. Do not unnecessarily rewrite working code.
5. Do not introduce conflicting architecture.
6. Preserve existing functionality unless explicitly asked
   to change it.
7. Make changes incrementally.

==================================================
39. NEW PROJECT RULE
==================================================

If no frontend project is provided:

Create a complete React project from scratch using the
specified architecture.

It must contain:

- package.json
- source code
- configuration
- Tailwind setup
- routing
- application entry point
- required dependencies
- README
- environment example if API configuration is required
- no need node_modules // it may make hang i manuaally install it

The project must be runnable after installation.

==================================================
40. IMPORTANT — OUTPUT REQUIREMENT
==================================================

The final result MUST be a real runnable project.

If you have access to a code editor/workspace:

→ Create the project files directly.

If you DO NOT have access to a code editor/workspace:

→ Generate the complete project files
→ Package them into a ZIP file
→ Return the ZIP file to the user

The ZIP must contain the actual project.

Do NOT return only:

- Code snippets
- Partial files
- Pseudocode
- Screenshots
- A design description

The user must receive a project that can be extracted
and run.

==================================================
41. RUNNABLE PROJECT REQUIREMENT
==================================================

Before returning the project:

1. Install/check dependencies if the environment allows.
2. Run the appropriate build command.
3. Fix build errors.
4. Verify routing.
5. Verify the application starts.
6. Verify there are no obvious runtime errors.
7. Verify the implemented UI works.

If the environment cannot run the project, clearly state
that it could not be executed, but still provide the
complete project.

Never claim that a project was tested if it was not tested.

==================================================
42. README
==================================================

Include a simple README containing:

- Project description
- Requirements
- Installation
- Environment variables
- Development command
- Production build command
- API base URL configuration
- Basic architecture explanation

Keep it simple and useful.

==================================================
43. FEATURE PROMPTS COME LATER
==================================================

This prompt defines only the foundation.

Later feature prompts may specify:

- API endpoints
- Page requirements
- Tables
- Filters
- Forms
- Actions
- Business-specific UI
- Module-specific components

When receiving a feature prompt:

1. Follow this foundation.
2. Put code inside the correct module.
3. Reuse existing shared components where appropriate.
4. Do not duplicate existing functionality.
5. Do not modify unrelated modules.
6. Do not invent missing backend behavior.
7. Keep the project runnable.

==================================================
44. FINAL PRINCIPLE
==================================================

Build a professional, maintainable RideOn Admin.

Prioritize:

Correctness
+
Usability
+
Consistency
+
Maintainability
+
Reusability where useful
+
Good error handling
+
Responsive design
+
RBAC
+
Clean architecture

Avoid:

Over-engineering
+
Unnecessary abstractions
+
Fake features
+
Duplicate code
+
Unnecessary dependencies
+
Hard-coded role checks
+
Browser-default dialogs
+
Broken/incomplete UI

The result should feel like a real production SaaS admin
application, not an AI-generated demo.

------------------------

# RIDEON ADMIN — DESIGN SYSTEM + APP SHELL

You are building the frontend foundation and design system for the RideOn Admin Panel.

The existing RideOn Admin General Foundation Prompt is the base architecture and development rule set.

This prompt specifically defines the VISUAL DESIGN SYSTEM, APP SHELL, THEME SYSTEM, SHARED UI COMPONENTS, ICON SYSTEM, ASSET HANDLING, and responsive behavior.

Do not implement business features in this prompt.

The next feature prompt will implement:
- Authentication
- Dashboard
- Users
- Bookings
- Pricing

Other modules must only appear in navigation and show a professional "Under Development" page until their feature prompt is provided.

==================================================
1. TECHNOLOGY
==================================================

Use:

- React
- JavaScript
- Tailwind CSS
- React Router
- TanStack Query
- React Context
- lucide-react for icons

Do NOT use:

- TypeScript
- Redux
- Redux Toolkit
- unnecessary UI libraries
- multiple icon libraries

Use functional React components.

==================================================
2. DESIGN DIRECTION
==================================================

The RideOn Admin should feel like:

- Premium modern SaaS
- Professional
- Clean
- Minimal
- Operational
- Trustworthy
- Modern
- Slightly futuristic

Use the provided RideOn Admin reference images as visual direction.

The design should be inspired by the references but must be implemented as an original reusable RideOn design system.

Do not copy the reference UI literally.

The application must support:

- Light theme
- Dark theme
- Desktop
- Tablet
- Mobile

==================================================
3. DESIGN REFERENCE ASSETS
==================================================

Do NOT generate or recreate the reference images.

Use the supplied images as design references.

Store them as:

public/design-reference/
├── rideon-admin-light.png
└── rideon-admin-dark.png

If these files are not already present, place the supplied reference images there.

Use:

rideon-admin-light.png
for light-theme visual reference.

Use:

rideon-admin-dark.png
for dark-theme visual reference.

These images are references only and must NOT appear as UI content inside the actual application.

==================================================
4. BRAND ASSETS
==================================================

Use the supplied RideOn logo.

Recommended structure:

public/assets/brand/

Possible files:

rideon-logo.png
rideon-logo-light.png
rideon-logo-dark.png

Do not create fake replacement logos.

If only one supplied logo exists, reuse it appropriately.

==================================================
5. COLOR SYSTEM
==================================================

Create theme-aware design tokens.

Do not hard-code random colors throughout components.

--------------------------------------------------
LIGHT THEME
--------------------------------------------------

Background:
#F7F9FC

Surface:
#FFFFFF

Elevated Surface:
#FFFFFF

Sidebar:
#FFFFFF

Border:
#E6EAF0

Strong Border:
#D8DEE8

Primary Text:
#111827

Secondary Text:
#475569

Muted Text:
#64748B

Disabled Text:
#94A3B8

--------------------------------------------------
DARK THEME
--------------------------------------------------

Background:
#060C18

Surface:
#0B1424

Card:
#101A2B

Elevated Surface:
#142035

Sidebar:
#07101F

Border:
#1C2A40

Strong Border:
#293A55

Primary Text:
#F8FAFC

Secondary Text:
#CBD5E1

Muted Text:
#94A3B8

Disabled Text:
#64748B

--------------------------------------------------
PRIMARY BRAND COLOR
--------------------------------------------------

RideOn blue is the primary brand color.

Light:

Primary:
#1683FF

Primary Hover:
#0D73E6

Primary Soft:
#E8F3FF

Dark:

Primary:
#4C8DFF

Primary Hover:
#6A9FFF

Primary Soft:
rgba(76, 141, 255, 0.14)

The exact blue may be adjusted slightly if necessary to match the supplied RideOn logo and reference images while maintaining accessibility.

--------------------------------------------------
SECONDARY
--------------------------------------------------

Purple:

Light:
#6D4AFF

Dark:
#7C63FF

Use purple as a secondary accent.

Do not make the entire application purple.

--------------------------------------------------
SEMANTIC COLORS
--------------------------------------------------

Success:
#16B364

Warning:
#F59E0B

Danger:
#EF4444

Info:
#3B82F6

Use semantic colors consistently.

==================================================
6. THEME SYSTEM
==================================================

Support:

- Light
- Dark

Theme affects:

- Backgrounds
- Surfaces
- Sidebar
- Topbar
- Cards
- Borders
- Typography
- Inputs
- Tables
- Modals
- Drawers
- Dropdowns
- Charts
- Status badges
- Hover states

Do not simply invert the light theme.

Light and dark themes must have intentionally designed colors.

Add a theme toggle to the topbar.

Persist the selected theme locally.

==================================================
7. TYPOGRAPHY
==================================================

Use:

Inter

Fallback:

system-ui, sans-serif

Hierarchy:

Page title:
30–32px / 700

Section title:
20px / 600

Card title:
15–16px / 600

Body:
14–15px

Table:
13–14px

Caption:
12–13px

Large metric:
28–34px / 700

Keep typography clean and readable.

==================================================
8. SPACING
==================================================

Use a consistent spacing system:

4
8
12
16
20
24
32
40
48
64

Common usage:

Control gap:
8–12px

Component gap:
16px

Card padding:
20–24px

Section gap:
24–32px

Page padding:
24–32px

Do not randomly introduce spacing values.

==================================================
9. BORDER RADIUS
==================================================

Small controls:
8px

Inputs:
8px

Buttons:
8px

Cards:
14–16px

Modal:
16px

Drawer:
16px

Badge:
999px

Avatar:
999px

Avoid excessive rounded styling.

==================================================
10. SHADOWS
==================================================

Use subtle shadows.

Light theme:
Use very soft shadows for elevation.

Dark theme:
Prefer surface contrast and borders instead of heavy shadows.

Do not use large glowing shadows everywhere.

==================================================
11. ICON SYSTEM
==================================================

Use ONLY lucide-react for application icons.

Do not use:

- Emoji as UI icons
- Random SVG icon sets
- Font Awesome
- Material Icons
- Multiple icon libraries

Use semantically correct icons.

--------------------------------------------------
NAVIGATION ICONS
--------------------------------------------------

Dashboard:
LayoutDashboard

Users:
Users

Bikes:
Bike

Bookings:
CalendarCheck

Payments:
CreditCard

Pricing:
Tags

Policies:
ShieldCheck

Roles & Permissions:
UsersRound

Audit Logs:
ClipboardList

Settings:
Settings

System Logs:
FileText

--------------------------------------------------
DASHBOARD ICONS
--------------------------------------------------

Revenue:
CircleDollarSign

Bookings:
CalendarCheck

Users:
UsersRound

Pending Payments:
CreditCard

Add Bike:
Bike

New Booking:
CalendarPlus

Add User:
UserPlus

Payments:
CreditCard

Settings:
Settings

Audit:
FileText

Activity:
Activity

--------------------------------------------------
BOOKING ACTIONS
--------------------------------------------------

Pickup:
KeyRound

Return:
Undo2

Cancel:
CircleX

View:
Eye

Edit:
Pencil

Delete:
Trash2

--------------------------------------------------
STATUS ICONS
--------------------------------------------------

Available:
CircleCheck

Active:
CirclePlay

Completed:
CircleCheckBig

Pending:
Clock3

Maintenance:
Wrench

Cancelled:
CircleX

Disabled:
Ban

Retired:
Archive

Icons should communicate meaning, not merely decoration.

==================================================
12. ICON SIZES
==================================================

Small:
16px

Normal:
18–20px

Large:
24px

Dashboard feature icon:
24–28px

Navigation icon:
18–20px

Maintain consistent sizing.

==================================================
13. APP SHELL
==================================================

Create:

- AdminLayout
- Sidebar
- Topbar
- Main content area
- Responsive mobile navigation

Desktop:

Sidebar + Topbar + Content

Tablet:

Collapsed/compact sidebar + Content

Mobile:

Topbar + Content + Mobile navigation

==================================================
14. SIDEBAR
==================================================

The sidebar must contain ALL currently planned Admin modules.

Use these groups:

MAIN

Dashboard

OPERATIONS

Users
Bikes
Bookings
Payments

BUSINESS

Pricing
Policies

ADMINISTRATION

Roles & Permissions
Audit Logs

SYSTEM

Settings
System Logs

Sidebar visibility must respect RBAC permissions.

Do not hard-code role names.

Use permissions such as:

hasPermission("payments.read")

The sidebar can contain all known modules, but unauthorized modules should not be displayed to an admin who lacks the required permission.

For modules not yet implemented, clicking them must open the professional Under Development page.

==================================================
15. TOPBAR
==================================================

Create:

- Sidebar toggle
- Search visual
- Theme toggle
- Notification visual
- Admin profile

Do not implement fake functionality for features that do not yet have requirements.

For example, do not create a fake notification backend.

==================================================
16. PAGE CONTAINER
==================================================

Use a consistent content container.

Recommended:

mx-auto
max-w-7xl
px-4
sm:px-6
lg:px-8

Maintain consistent page spacing.

==================================================
17. PAGE HEADER
==================================================

Create reusable PageHeader.

Support:

- Breadcrumb
- Title
- Description
- Page actions

Example:

Bookings
Manage and monitor RideOn bookings.

[Page Action]

Keep top-level pages clean.

==================================================
18. BUTTON SYSTEM
==================================================

Create:

- Primary
- Secondary
- Ghost
- Danger
- Icon Button
- Link Button

Support:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

Example:

[+ Add Bike]

[Filter]

[Cancel]

[Delete Bike]

==================================================
19. INPUT SYSTEM
==================================================

Create reusable:

- Input
- SearchInput
- Select
- Checkbox
- Switch
- Date input
- Dropdown

States:

- Default
- Focus
- Error
- Disabled
- Read-only

==================================================
20. CARD SYSTEM
==================================================

Create reusable:

- Card
- KpiCard
- StatCard
- InfoCard
- ChartCard

All must support both themes.

==================================================
21. STATUS BADGE
==================================================

Create reusable StatusBadge.

Support:

AVAILABLE
ACTIVE
MAINTENANCE
COMPLETED
CANCELLED
PENDING
DISABLED
RETIRED

Use consistent semantic colors.

==================================================
22. TABLE SYSTEM
==================================================

Create reusable table foundation.

Support:

- Server-side pagination
- Search
- Filters
- Sorting where required
- Status badges
- Row actions
- Loading state
- Empty state
- Error state
- Responsive behavior

Do not create a giant universal table with unnecessary configuration.

==================================================
23. MODAL SYSTEM
==================================================

Create one shared RideOn Modal foundation.

Support:

- Header
- Content
- Footer
- Close
- Escape
- Loading
- Responsive behavior

Used later for:

- Add Bike
- Edit User
- Edit Pricing
- Change Status
- Pickup
- Return
- Edit Role
- Confirmation

Do not use window.confirm().

==================================================
24. DRAWER SYSTEM
==================================================

Create one shared Drawer foundation.

Used later for:

- User Details
- Bike Details
- Booking Details
- Payment Details
- Audit Details

Desktop:
Right-side drawer

Mobile:
Full-screen panel where appropriate

Support:

- Close button
- Escape
- Loading
- Error
- Footer actions
- Focus management

==================================================
25. TOAST SYSTEM
==================================================

Create one global toast system.

Examples:

Bike created successfully.

Booking returned successfully.

Unable to update booking.

Do not create separate toast systems per module.

==================================================
26. LOADING SYSTEM
==================================================

Create:

- PageSkeleton
- CardSkeleton
- KpiSkeleton
- TableSkeleton
- DrawerSkeleton
- LoadingButton

Never show large blank white areas during loading.

==================================================
27. EMPTY STATES
==================================================

Create reusable EmptyState.

Support:

First-time empty:

No bikes yet.
Add your first RideOn bike.

Filtered empty:

No bikes found.
Try changing your filters.

Dashboard empty:

Your RideOn activity will appear here
as your platform starts growing.

Empty data is NOT an error.

==================================================
28. ERROR SYSTEM
==================================================

Create:

ErrorState

Example:

Something went wrong.

We couldn't load this page.

[Try Again]

Handle:

- Network errors
- 401
- 403
- 404
- 422
- 500
- Unexpected responses

==================================================
29. RESPONSIVE DRAWERS / TABLES
==================================================

Do not shrink desktop tables until they become unusable.

On mobile:

- Convert suitable tables to cards
- Or use controlled horizontal scrolling

Drawers can become full-screen panels.

==================================================
30. ACCESSIBILITY
==================================================

Implement:

- Keyboard navigation
- Focus states
- Semantic buttons
- Form labels
- Escape handling
- Modal focus management
- Drawer focus management
- Sufficient contrast
- Accessible interactive controls

==================================================
31. MOTION
==================================================

Use subtle transitions.

Recommended:

150–200ms

Use for:

- Hover
- Sidebar
- Drawer
- Modal
- Dropdown
- Toast
- Theme switching

Do not over-animate.

==================================================
32. ASSET RULE
==================================================

Do not generate additional images automatically.

If a future feature needs an image/illustration, explicitly identify it.

Example:

Asset required:
Filename: empty-bikes.svg
Location: public/assets/illustrations/
Purpose: Bikes empty state illustration

The implementation agent should then add/use that file only when supplied or generated separately.

==================================================
33. NO IMAGE-BASED ICONS
==================================================

Do not create:

dashboard-icon.png
user-icon.png
bike-icon.png
payment-icon.png

Use lucide-react.

Do not create status images.

Use CSS/theme tokens.

==================================================
34. NO RANDOM DECORATION
==================================================

Do not add:

- Stock photos
- Random scooter images
- Random people
- Unrelated illustrations
- Excessive gradients
- Excessive glassmorphism
- Excessive glow effects

Visual design must prioritize usability.

==================================================
35. DASHBOARD DESIGN PROTOTYPE RULE
==================================================

The Dashboard may temporarily use clearly defined demo data for visual prototyping.

This is allowed ONLY for the Dashboard.

The purpose is to establish the dashboard UI before all dashboard analytics APIs are available.

When real dashboard APIs become available:

Demo data
→ replace with API data

Do not create fake production functionality.

==================================================
36. COMPONENT INVENTORY
==================================================

Create only the reusable components needed for the foundation.

UI:

Button
IconButton
Input
Select
Checkbox
Switch
Dropdown
Tooltip
Badge
StatusBadge
Card
KpiCard
Table
Pagination
Tabs
Modal
ConfirmationDialog
Drawer
Toast
Skeleton
EmptyState
ErrorState
LoadingButton
PageHeader
Breadcrumb
SearchInput
FilterBar

Layout:

AdminLayout
Sidebar
Topbar
MobileNavigation
ContentContainer

==================================================
37. FINAL DESIGN SYSTEM REQUIREMENT
==================================================

Every future RideOn Admin module must use this design system.

Do not redesign buttons, cards, tables, modals, drawers, badges, inputs, colors, typography, spacing, or themes inside individual modules.

Feature prompts should define BUSINESS UI and workflows only.

The result should feel like one cohesive RideOn Admin product.