# Admin Authentication API

Base path: `/api/v1/admin/auth`  
All admin APIs (except login/refresh) require:  
`Authorization: Bearer <accessToken>`

Cookie (HttpOnly, Secure in production): `adminRefreshToken`  
Isolated from customer cookie `refreshToken`.

---

## 1. Login

**POST** `/api/v1/admin/auth/login`

**Request body**
```json
{ "email": "admin@example.com", "password": "••••••••" }
```

**Success `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "admin": {
      "id": "...",
      "name": "...",
      "email": "...",
      "isActive": true,
      "campusId": null,
      "campus": null,
      "role": { "id": "...", "name": "SUPER_ADMIN" },
      "permissions": ["dashboard.read", "bookings.read", "..."],
      "lastLoginAt": "..."
    }
  }
}
```

**Cookie set:** `adminRefreshToken` (HttpOnly, SameSite=Lax/None, maxAge 7d)  
Refresh token is **not** returned in the JSON body.

**Errors**
| Status | When |
|--------|------|
| 401 | Invalid credentials |
| 403 | Admin inactive / role inactive |
| 400 | Validation (email/password) |

---

## 2. Refresh Token

**POST** `/api/v1/admin/auth/refresh`  
**Required cookie:** `adminRefreshToken`  
No body. `credentials: include` on the client.

**Success `200`**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "<new jwt>",
    "admin": { "...same shape as login..." }
  }
}
```

Rotates refresh token (old session deleted, new cookie set).

**Errors**
| Status | When |
|--------|------|
| 401 | Missing / invalid / expired / revoked refresh token |
| 403 | Admin or role inactive |

---

## 3. Logout

**POST** `/api/v1/admin/auth/logout`  
Uses refresh cookie (access token optional).

**Success `200`**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

Revokes the refresh session in DB and clears `adminRefreshToken` cookie.

---

## 4. Current Admin / Session

**GET** `/api/v1/admin/auth/me`  
**Auth:** Bearer access token

**Success `200`** — admin object with `permissions` array (same shape as login `admin`).

**Errors:** 401 unauthorized / inactive; 403 role inactive.

---

## 5. Protected Admin APIs

- Header: `Authorization: Bearer <accessToken>`
- Access token TTL: `JWT_EXPIRES_IN` (default **15m**)
- On 401, client should call `/auth/refresh` once and retry
- Middleware: `authenticateAdmin` → loads admin + permissions onto `req.admin`
- Authorization: `requirePermission('resource.action')` → **403** if missing (SUPER_ADMIN bypass)

### 401 vs 403
| Code | Meaning |
|------|---------|
| **401** | Not authenticated (no/invalid/expired token, or not an admin) |
| **403** | Authenticated but inactive, role inactive, or missing permission |

---

## 6. RBAC

- **Authentication** identifies the admin (`authenticateAdmin`)
- **Authorization** checks `req.admin.permissions` (`requirePermission`)
- Frontend hide/show is UX only; backend always enforces

---

## 7. Example frontend flow

1. **Login** → POST `/auth/login` with credentials → store `accessToken` in memory → cookie holds refresh  
2. **Reload** → POST `/auth/refresh` (cookie) → new access token → optional GET `/me`  
3. **API call** → Bearer access token; on 401 → single-flight refresh → retry once  
4. **Logout** → POST `/auth/logout` → clear local state + cookie  

Customer/user auth (`/api/v1/auth/*`, cookie `refreshToken`) is unchanged.
