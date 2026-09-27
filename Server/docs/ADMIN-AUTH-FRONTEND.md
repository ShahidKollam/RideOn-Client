# Admin Frontend — Authentication UI Behavior

## Login flow
1. User submits email + password on `/login`
2. Button shows loading; form disabled while request in flight
3. On success → session applied → navigate to dashboard
4. On 401 → “Invalid email or password.”
5. On 403 → inactive account message
6. If already authenticated after bootstrap → redirect to `/`

## Application startup / session restoration
1. `AuthProvider` starts with `bootstrapping = true`
2. Full-screen “Restoring session…” (login page and protected routes both respect this — no login flash)
3. Call `POST /auth/refresh` with `credentials: include`
4. On success → store access token + admin + permissions
5. On failure → try existing access token via `GET /auth/me`, else clear session
6. `bootstrapping = false` → route to app or login

## Token refresh flow
- Access token lives in memory (+ short localStorage cache for same-tab convenience only)
- Refresh token lives only in **HttpOnly cookie** (`adminRefreshToken`) — never in localStorage
- `apiRequest` on **401** (non-auth routes): single shared refresh promise → retry original request once
- Concurrent 401s do not stampede refresh

## Logout flow
1. User clicks Logout
2. `POST /auth/logout` (clears cookie + revokes DB session)
3. Clear local access token + profile cache
4. Redirect to `/login`
5. Storage event helps other tabs clear profile

## Protected routes
- Unauthenticated → `/login`
- Authenticated without permission → Access Denied page
- Backend still enforces permissions on every API call

## RBAC UI
- `hasPermission(perm)` drives sidebar, buttons, and route guards
- Empty permissions + `SUPER_ADMIN` role → allow (backend remains authority)

## Loading states
- Bootstrap: full-screen spinner
- Login submit: button spinner + disabled
- Protected route while bootstrapping: full-screen spinner

## Error states
- Friendly messages only (no stack traces / raw JWT errors)
- Network failures: generic retry message

## Mobile
- Same cookie + credentials flow works on mobile browsers
- Login layout is responsive (existing design system)
