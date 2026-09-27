# RideOn Admin — Frontend

Professional RideOn Admin Control Center frontend.

## Stack

- React 19
- JavaScript (no TypeScript)
- Tailwind CSS v4
- React Router v7
- TanStack Query v5
- Lucide React (icons)
- Vite

## Requirements

- Node.js 18+
- npm 9+

## Installation

```bash
cd rideon-admin
npm install
```

## Environment

Create a `.env` file if needed:

```
VITE_API_BASE_URL=/api/v1/admin
```

The Vite dev server proxies `/api` to `http://localhost:3000` by default.

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Production Build

```bash
npm run build
npm run preview
```

## Architecture

Module-based folder structure:

```
src/
├── modules/          # Feature modules (dashboard, users, bikes, ...)
├── components/
│   ├── ui/           # Design system components
│   └── layout/       # App shell (Sidebar, Topbar, AdminLayout)
├── context/          # Auth + Theme
├── lib/              # API client, QueryClient
├── routes/
└── utils/
```

## Design System

- Light & Dark themes (persisted in localStorage)
- Design tokens for colors, radius, spacing
- Reusable: Button, Card, KpiCard, StatusBadge, EmptyState, ErrorState, Skeleton, PageHeader, etc.

## Current Status

- **Dashboard** — fully implemented with demo data (visual prototype as allowed)
- All other modules — professional "Under Development" placeholders
- App shell, RBAC-ready sidebar, theme toggle, responsive layout — complete

Feature-specific prompts will replace placeholders with real implementations.

## API

Admin API base: `/api/v1/admin`  
Auth header: `Authorization: Bearer <accessToken>`

Frontend never duplicates backend business logic.
