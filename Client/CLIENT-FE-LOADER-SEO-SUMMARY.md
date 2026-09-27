# RideOn Client Frontend v1.2.1 — Full-page loader + basic SEO

## What was done

### 1. Full-page loading overlay (`FullPageLoader`)
New component: `src/components/ui/FullPageLoader.jsx`

- Full-viewport overlay with light slate backdrop + subtle blur
- Centered white card with spinner, primary message, and short helper text
- Locks body scroll while open
- Portaled to `document.body` (works above modals / sticky bars)
- Used **only for major async actions**, not for every small request

**Where it appears**

| Action | Message |
|--------|---------|
| Check availability | Checking availability… |
| Create payment order | Preparing payment… |
| After Razorpay success → verify | Confirming your payment… |
| Confirm booking cancellation | Cancelling booking… |

Payment note: the overlay is hidden while the Razorpay checkout window is open, then shown again during verification until redirect to the success page.

### 2. Basic SEO
- **`index.html`**: title, meta description, theme-color, robots, canonical, Open Graph, Twitter card, apple-touch-icon
- **`useDocumentTitle` hook**: sets tab titles per page (`Page · RideOn`)
- Applied on: Home, Book, My bookings, Booking details, Booking confirmed, Vehicles, Pricing, About, Contact, Log in

Default title: **RideOn — Campus bike rentals**

### 3. Files touched
| Path | Change |
|------|--------|
| `src/components/ui/FullPageLoader.jsx` | **New** |
| `src/lib/useDocumentTitle.js` | **New** |
| `src/pages/BookingPage.jsx` | FullPageLoader for availability + payment phases |
| `src/pages/BookingDetailsPage.jsx` | FullPageLoader for cancel confirm |
| `src/pages/*` (key pages) | Document titles |
| `index.html` | Meta / OG / Twitter SEO |
| `package.json` | version → 1.2.1 |

### 4. Unchanged
- Auth, payment APIs, cancellation business logic, and existing booking flow behavior
- No frontend fee/refund calculations

## Run
```bash
unzip rideon-client-frontend-v1.2.1.zip
cd rideon-client-work
npm install
npm run dev
```
