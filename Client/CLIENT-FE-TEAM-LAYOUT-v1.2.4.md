# RideOn Client Frontend v1.2.4 — Team page layout

## Changes
- **Removed** intro paragraph and “Meet Our Team” section heading/subtitle
- **Left-aligned** hero (eyebrow + title) to match Contact / Pricing
- Members sit **closer to the top** under the title
- Layout: **first row 3 cards (centered)**, **second row 4 cards (centered)**
- Light **staggered entrance animation** on cards + hover lift; image subtle scale on hover
- `prefers-reduced-motion` respected
- `src/data/team.json` still holds the 7 members (easy to edit)

## Files
- `src/pages/AboutPage.jsx`
- `src/data/team.json`
- `src/index.css` (team-card-in keyframes)
- `package.json` → 1.2.4
