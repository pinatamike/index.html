# NORA desktop / tablet UI

Responsive layouts for the same NORA app. Mobile (under 768px) stays exactly as approved in `index.html`.

| Screen | File | Status |
|---|---|---|
| Table View (Live Session) | `table-view.html` | Approved sample. Reference for all desktop screens |

## Layout rules (from the approved Table View)

- **Breakpoints:** desktop 1200px and up, tablet 768–1199px, mobile under 768px.
- **Navigation:** the left sidebar mirrors the mobile hamburger menu (`NORA_NAV()`): 5 prominent sections with the same filled icons, the current one expanded to its submodules. No bottom nav on desktop.
- **Shell:** a three-column grid.
  - Left sidebar, 232px: NORA logo, the 5 sections (Tables · Players · Team · Reporting · Settings) with the same **filled, colored icons** as the mobile bottom nav, and the user at the bottom.
  - Center: the main work area.
  - Right panel, 380px: the selected item's actions, plus the Nora composer.
- **Header, 76px:** the section/screen box (same as mobile), then session pills, table tabs, and the Nora portrait at far right.
- **Seat tiles, same as approved mobile:**
  - The photo fills the tile.
  - A light gradient at the bottom (transparent → 35% → 70% black), not a solid black band.
  - The name and amount sit directly on the photo with a text shadow. Amounts show without COP inside seat tiles.
  - A yellow seat number at top left and a colored border per seat.
  - The selected seat gets a white border.
- **Empty seat:** a large outlined + icon and "SEAT OPEN".
- **Wait list:** a 1-2-3 list icon and "1 waiting".
- **Tokens:** identical to mobile. Square corners, COP at 65% elsewhere, 63px+ primary actions, nothing under 14px.
- **Desktop uses the extra space:** KPI row above the grid, all seats visible at once, and player actions in the side panel instead of a separate screen.

Next screens, in order: Buy-in, Rebuy, Cash-out, Players, Snapshot, Daily Close.
