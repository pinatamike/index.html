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

## Operational Control Center (`control-center.html`)

Interactive prototype. The desktop Live Table becomes the control center for the whole session.

- **Responsive philosophy:** one set of business workflows, three presentations.
  - Mobile: focused, sequential screens.
  - Tablet: hybrid, with contextual panels where space allows.
  - Desktop: a persistent live table plus a dynamic operations panel.
- **Left:** a compact sidebar with 5 sections. One accordion submenu is open at a time. Below 1200px it collapses to icons.
- **Center:** the live table is always visible. It has Table 1/2 tabs, KPIs (total in, rake, seated, wait list) and seat selection.
- **Right:** the dynamic panel.
  - No selection: session actions.
  - Player selected: Details, Rebuy, Cash-out (chips, win/loss, payment, Sign & Settle warning), Move.
  - Session: Wait List, Team/Tips, Expenses, Snapshot, Daily Close, Nora AI (mic + text).
- **Money actions:** Form → Review → Confirm/Change. Values are kept across Change. After confirming, the panel returns to the player or session context.
- **Demo only:** results are labeled "DEMO · NOT POSTED · REF DEMO-n". Nothing reaches a backend.
- **Rule: no scrolling** on any screen, with rare exceptions. Verified at 1024×768, 1280×800, 1440×900 and 1920×1080.

## Control Center v2 (`control-center.html`) — one responsive file
- **≥1000px (desktop, tablet landscape):** icon rail (76px, overlay-expands on hover/tap, pin button keeps it open) · header · KPI strip · portrait seat grid 4×3 · right Control Center panel (Selected seat → Session actions → Status & alerts → Recent activity).
- **768–999px (tablet portrait):** same rail, grid 3×4, panel becomes a right drawer opened by seat tap or TASKS.
- **<768px (mobile):** no rail; hamburger drawer + 5-tab bottom nav, grid 3×4, panel is a bottom sheet (seat tap or tasks button).
- Seat tiles: fixed 0.84 portrait ratio sized from the canvas, photo fills, white name only, no amount (buy-ins live in the Selected seat card), square 32px yellow seat badge (26px on mobile).
- Demo staff names: Anna, Costa, Alex.

## v3 — Live Snapshot column (≥1280px)
Four regions: rail · player grid · always-visible Live Snapshot · Control Center. Tiles keep portrait ratio (not enlarged); the old KPI strip is replaced by the Snapshot column on desktop. Metrics reuse the WF31–39 Snapshot formulas and each opens the existing detail (buy-ins/rake/expenses → Snapshot accordion, cash-outs → cash-out, accounts/variance → Daily Close). Below 1280px the Snapshot column is hidden and the KPI strip + SNAPSHOT tile remain. Only the Cashbox balance and COP 50,000 variance exist in the prototype data; Nequi/Bancolombia are not invented.
