# RideOn Client Frontend v1.2.2 — Team page

## What changed

### Header / footer
- Nav label **About Us** → **Team** (still routes to `/about`)
- Footer link updated the same way

### About page → Team page
Replaced the old values-grid About page with a team layout matching the reference:
- Eyebrow, headline (“Meet the Team Behind Your Ride”), intro
- “Meet Our Team” section with member cards (photo, name, role, bio, LinkedIn + X)
- Soft gradient background + light decorative blobs
- **Removed** “Why We RideOn” and “Ready to Ride?” sections (not included)

### Team data (easy to replace)
All copy and members live in:

`src/data/team.json`

Structure:
- `page.eyebrow`, `page.title`, `page.intro`, `page.sectionTitle`, `page.sectionSubtitle`
- `members[]`: `id`, `name`, `role`, `bio`, `image`, `linkedin`, `twitter`

**7 dummy members** included (4 from the design + 3 extra). Swap photos/URLs and text in this JSON only — no code changes needed for content updates.

### Files
| Path | Change |
|------|--------|
| `src/data/team.json` | **New** — team content |
| `src/pages/AboutPage.jsx` | Team UI (reads JSON) |
| `src/components/layout/Navbar.jsx` | Label → Team |
| `src/components/layout/Footer.jsx` | Label → Team |
| `package.json` | version → 1.2.2 |

### Unchanged
Auth, booking, payment, cancellation, loaders, SEO hooks.
