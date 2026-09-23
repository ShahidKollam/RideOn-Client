# RideOn Client Frontend v1.2.3 — BookingSummary + SEO

## 1. BookingSummary
Replaced `src/components/bookings/BookingSummary.jsx` with the provided component **as-is** (no other booking/payment logic changes).

- Displays backend pricing only (GST, outstanding, totals)
- Outstanding late amount only when backend value &gt; 0
- No frontend fee recalculation

## 2. SEO improvements

### Static files (`public/`)
| File | Purpose |
|------|---------|
| `robots.txt` | Allow public pages; disallow auth, bookings, payment-failed, profile; points to sitemap |
| `sitemap.xml` | Home, Vehicles, Pricing, Booking, About (Team), Contact |
| `site.webmanifest` | PWA-style name, theme color, icons |

### `index.html`
- Meta description, keywords, author, robots, googlebot
- Canonical URL
- Open Graph (url, image absolute, image:alt)
- Twitter card (`summary_large_image`)
- JSON-LD: Organization + WebSite (schema.org)
- Manifest link

### `vercel.json`
- SPA rewrite excludes `robots.txt`, `sitemap.xml`, `site.webmanifest`, and other static files with extensions
- Correct Content-Type headers for robots/sitemap

### Domain note
Sitemap and canonical use `https://rideon.app`. Update these if your production domain differs.

## 3. Files touched
- `src/components/bookings/BookingSummary.jsx`
- `public/robots.txt` **new**
- `public/sitemap.xml` **new**
- `public/site.webmanifest` **new**
- `index.html`
- `vercel.json`
- `package.json` → 1.2.3

## Unchanged
Auth, booking flow, payment, cancellation, team page, FullPageLoader.
