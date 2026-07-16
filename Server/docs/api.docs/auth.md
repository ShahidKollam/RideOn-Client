# Authentication API

## Student Signup
**POST** `/api/auth/signup`

**Description**: Register a new student user.

**Request**:
```json
{
  "email": "student@nitc.ac.in",
  "name": "John Doe",
  "phone": "1234567890",
  "campusId": "campus_id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { ...user }
}
```

## Magic Link
**POST** `/api/auth/magic-link`

**Verify Magic Link**
**POST** `/api/auth/verify-magic-link`

## Admin Login
**POST** `/api/auth/admin/login`

**Logout**
**POST** `/api/auth/logout`
