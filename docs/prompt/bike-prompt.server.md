
# MASTER BACKEND GENERATION PROMPT

```md
# PROJECT CONTEXT

You are extending an existing production-ready backend project.

This project already has an established architecture, coding style, utilities, middleware, authentication flow, error handling, response format, validation strategy, and folder structure.

Your responsibility is to build new modules that integrate seamlessly into the existing project.

Do NOT redesign the project.

Do NOT refactor unrelated code.

Do NOT introduce a different architecture.

Everything must follow the existing project exactly.

---

# TECH STACK

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JavaScript (ES Modules)

---

# ARCHITECTURE

Follow the existing Service Layer Architecture exactly.

```

Controller
↓

Validation

↓

Service

↓

Prisma

↓

Database

```

Business logic belongs ONLY inside Services.

Controllers should ONLY:

- Read request
- Call validation
- Call service
- Return ApiResponse

Controllers must NEVER contain business logic.

---

# PROJECT STRUCTURE

Follow the existing folder structure exactly.

Do not rename folders.

Do not rename utilities.

Do not move files.

Do not introduce new architectural patterns.

Example:

src/

    api/
    config/
    lib/
    middlewares/
    modules/
    utils/
    app.js
    server.js

Each module should follow the existing module pattern.

Example:

modules/

    module-name/
        module.controller.js
        module.service.js
        module.routes.js
        module.validation.js

If admin and user routes are separated in the existing project,
continue using the same convention.

---

# PRISMA

The project uses ONE Prisma schema.

Always update

src/prisma/schema.prisma

Do NOT split Prisma into multiple files.

Never create

user.prisma

booking.prisma

payment.prisma

etc.

All models belong inside the existing schema.prisma.

---

# CODING STANDARDS

Follow the existing project style.

Use

- async/await
- Prisma
- ApiError
- ApiResponse
- asyncHandler
- Existing middleware
- Existing authentication
- Existing validation middleware
- Existing helper utilities

Write production-ready code.

Avoid duplicated logic.

Prefer reusable services.

Readable naming.

Small focused methods.

Keep code clean.

Follow SOLID principles where practical.

Comments only where necessary.

---

# DO NOT CHANGE EXISTING SYSTEM

Do NOT

- rename files
- rename folders
- change middleware
- change authentication
- change JWT logic
- change ApiResponse format
- change error handling
- change validation strategy
- change routing conventions
- change folder structure
- refactor unrelated modules
- modify business logic of existing APIs

New functionality must integrate without breaking existing behavior.

---

# AUTHENTICATION

Authentication already exists.

Continue using the existing middleware.

Examples

User

protect

Admin

protectAdmin

Do not redesign authentication.

Do not introduce RBAC unless explicitly requested.

---

# API DEVELOPMENT STANDARDS

Every endpoint must contain

- Validation
- Controller
- Service
- Route

Flow

Validation

↓

Controller

↓

Service

↓

Prisma

↓

ApiResponse

---

# SERVICES

Every service must contain complete business logic.

Never generate

- TODOs
- placeholders
- skeleton methods
- empty implementations

Every listed service should include

- validation
- business rules
- Prisma queries
- calculations
- transactions (when required)
- error handling

Services should be production-ready.

---

# LIST APIS

Whenever applicable, support

Pagination

Searching

Filtering

Sorting

Newest first by default unless specified otherwise.

Use efficient Prisma queries.

Avoid unnecessary database calls.

---

# DATABASE RULES

Normalize data where appropriate.

Avoid duplicated data unless historical snapshots are required.

Use transactions only when necessary.

Do not store calculated state that should be derived dynamically unless explicitly required.

Always maintain data consistency.

---

# VALIDATION

Use the project's existing validation approach.

Validate

- required fields
- enums
- foreign keys
- business rules
- duplicate records
- invalid state transitions

Return ApiError using existing patterns.

---

# ERROR HANDLING

Continue using

ApiError

Never throw raw errors.

Always return meaningful messages.

Follow existing project conventions.

---

# RESPONSE FORMAT

Continue using ApiResponse.

Never invent a different response format.

Maintain backward compatibility.

---

# PERFORMANCE

Prefer optimized Prisma queries.

Avoid N+1 queries.

Reuse existing services where practical.

Avoid duplicated database calls.

Use transactions only when required.

---

# CODE QUALITY

Code should be

- production-ready
- readable
- maintainable
- modular
- reusable
- scalable

No unnecessary abstractions.

No overengineering.

No premature optimization.

---

# DELIVERY FORMAT

Generate ONLY the files required for the requested module.

Do NOT regenerate the entire project.

If multiple modules are requested,

generate one ZIP archive per module.

Each archive should contain

- module files
- Prisma additions
- route registration snippet
- dependency list (if needed)

---

# DEPENDENCIES

At the end clearly list

New npm packages

Environment variables

Prisma migration command

Example

npm install dayjs

Migration

npx prisma migrate dev --name add-module

---

# API DOCUMENTATION

Generate Markdown documentation for the newly created APIs.

Include

- Endpoint
- Method
- Summary
- Description
- Request Body
- Query Parameters
- Path Parameters
- Response
- Error Responses

Do not introduce Swagger unless explicitly requested.

---

# FRONTEND API CONTRACT

Also generate a simple Markdown document for frontend developers.

Include

- Endpoint
- Method
- Request
- Response
- Validation Rules
- Error Cases
- Example Requests
- Example Responses

Keep it easy for frontend developers to consume.

---

# IMPORTANT

Unless explicitly instructed,

Do NOT

- redesign architecture
- refactor existing modules
- change business logic
- change project conventions

Only implement the requested module while following the existing project exactly.

The generated code should be directly usable inside the current project without modification.
```
