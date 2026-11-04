# NORA Design Rules — AUTHORITATIVE (frozen Nov 2, 2026)

These rules and `design-system/README.md` are the single UI specification for NORA. Where an older rule below conflicts with a newer one, the newer section wins.


## Font sizes (minimum)
- Screen titles / card titles: 20px
- Main action buttons: 17-18px, single line when possible
- Labels (DATE, TIME, GAME, STATUS, ACTION, BUY-IN · CASHBOX, TOTAL BUY-INS): 16px, bold, same color (#c5e4f2)
- Values / player names in lists: 17-18px
- Financial amounts: 22px+ bold; "COP" always 65% of the amount size, milk white (#f7f4ea), same line
- Subtitles and taglines: 14-16px
- Bottom nav labels: 9px (shared, unchanged)
- No text below 14px except bottom nav

## Financial amounts
- Format: COP 500,000 (full amount, never abbreviated)
- Amounts in one column share size, weight, and COP style
- A label and its amount sit on one line; never wrap COP away from its number

## Tiles
- Player/team selection: 3 columns x 4 rows
- Player tiles: full photo, white name, initials fallback
- Tile borders, radius, and gaps stay consistent across related screens
- Table View: do not change

## Action buttons
- Primary (confirm, continue, save): full width, 63-65px tall, same bottom position on related screens
- Button labels single line where possible

## Placement
- Header: same on every screen
- Content starts directly under the header with consistent padding
- Bottom nav fixed; actions sit above it
- Avoid scrolling on core screens

## Process
- Before/after full-phone comparison for every screen before approval
- Check for clipping, wrapping, and scrollbars before sending

## Added rules (approved 19:58)
- Player/team detail and data-entry screens use the same oversize thumbnail and player tile as the approved Select Player and Initial Buy-in screens (workflow 3, screens 2-3)
- Bottom large action tiles share one height across all screens
- Spacing between tiles, cards and rows is consistent across screens
- While editing any screen, brighten colors slightly for a cleaner look (no dull grays on key text or borders)
- Initials on empty tiles: 34px bold minimum

## Added rules (approved 21:42)
- COP is always 65% of its amount's font size and milk white, on every screen
- Confirmation screens share one fixed layout: NORA tile 92px, status banner 172px (84px icon, one title line, one subtitle line), details tile (name + SEAT row, two label/amount rows), CONTINUE 63px; same positions on every confirmation screen
- Status banner: green for success, red for busted/outstanding
- Long labels go on two lines (PAID / CASHBOX) instead of crowding amounts
- Prefer horizontal tiles: label left, value right; selections shown as a small chip inside the tile
- Values scale down to fit long amounts (e.g. COP 12,453,000) instead of clipping
- No text under 14px; summary/route lines at least 17px
- Player photos crop out the burned-in name caption
- Every render is checked for clipping, overflow, phone width and COP ratio before it is shown

## Added rules (approved Nov 2)
- All tiles, pills, buttons and inputs have straight (square) corners; only check icons and stamps stay round

## Master sweep (Nov 2)
- One bottom nav on every screen: Tables · Players · Team · Reporting · Settings (24px line icons, 11.5px labels)
- One line-icon family (SVG) replaces emoji and text glyphs inside screens
- No screen title repeated under the header subtitle
- Footer actions: 63px, full width; a single action spans the full width
- Table View names/amounts 18px in every variant
- System layer lives in <style id="nora-system"> and <script id="nora-system-js">; keep them last in <head>

## Final items (Nov 2)
- WF40 Daily Close: all 8 checks on one screen, no scroll; 26px status squares (green ✓ done, amber ! review, red ✗ action required)
- Team figures follow the session staff record: Anna compensation COP 150,000, advance 100,000, final payment 50,000, outstanding 0, chip tips 15,000
- Blinds are written COP 5,000 / 10,000; minimum buy-in COP 500,000 (never 5M / 10M / 500K)

## Navigation architecture (Nov 4) — authoritative
- **Mobile bottom nav** = primary navigation, exactly 5 filled colored icons: Tables · Players · Team · Reporting · Settings. Each goes to its section landing screen. The active tab follows the current section. Never add functions to it.
- **Hamburger (☰)** = complete app menu, grouped by the same 5 sections: Live Session (Live Tables, Seat a Player, Wait List, Expenses, Food & Beverage, Inventory, Snapshot, Sign & Settle, Daily Close, Ask Nora), Players, Team, Reporting, Settings. Respects enabled modules and permissions. Opens over the content on the current section.
- **No second permanent nav bar** on mobile. Session functions are reached through ☰ or contextual tiles.
- **Desktop** = persistent left sidebar with the same hierarchy and icons. The 5 sections are prominent and expand into their submodules. No bottom bar on desktop.
- **Contextual tiles** perform actions on the current screen. **Header** shows location plus Nora. These are not global navigation.
- One filled icon family everywhere (mobile + desktop). Menu structure lives in `NORA_NAV()` in `nora-nav-js`, and desktop must mirror it.

## Sweep 2 (restored UI b99a9c1) — required blocks

The restored UI is harmonized by three blocks. They must stay last: `nora-sweep2` (end of `<head>`), then `nora-sweep2-js` and `nora-sweep2-guard` (end of `<body>`). If one is missing, a red banner appears.

- **Player photo tiles show names only.** The photo fills the tile, with a yellow seat number and a large bold white name of 15.5–21px, auto-fitted, on a light gradient. Amounts never appear on photo tiles.
- **Bottom nav:** exactly 5 filled icons (Tables · Players · Team · Reporting · Settings). The active section follows the workflow. The ☰ menu holds the complete grouped app menu.
- **COP is 65% of the number,** milk white, on the baseline. It is re-synced after any font fitting.
- **Square corners.** Only true circles stay round (check icons, stamps, the mic, photos).
- **Two border weights:** 3px for large tiles and buttons (58px or taller), 2px for rows and fields.
- **Text is 14px minimum,** except nav labels (11.5px) and stamp lettering.
- **Footer actions are 63px.** One button spans the full width; two split 50/50. Footers sit at the bottom of the screen.
- **One filled SVG icon family** replaces glyph and emoji icons.
- **WF9 / WF54 ledger:** 5 entries per page, swipe between pages, a compact page indicator, and totals computed from the entries.

## F&B, Bar & Inventory update — required blocks
- `nora-fnb` (CSS) and `nora-fnb-js` must sit BEFORE the `nora-sweep2*` blocks; guard REQ list includes both.
- Accounting method is per category (Food / Beverages / Bar): SIMPLE EXPENSE TRACKING or INVENTORY & COST CONTROL. Same service UI in both.
- Every product: Sell or Comp (square tiles). Recipient required: Player / Player's Guest / Game Guest (guests are not CRM players).
- Snapshot: revenue, operating expenses, team expenses, inventory purchases, consumption cost, asset value, net profit — no double counting.
- Daily Close stays one-screen and adapts to the mode.

## Fast start, onboarding & Settings checklist — required blocks
- Order in file: `nora-fnb*`, then `nora-start` (CSS) / `nora-start-js`, then `nora-sweep2*`. Guard REQ list includes all six.
- WF1: auto-resume (launch → restoring → Live Table View), plus chooser, restore-failed Retry, no-active-session. Closed sessions never reopen.
- WF2: Quick Start (START WITH LAST SETTINGS dominant, saved games, custom setup, scheduled game). One review screen; START LIVE SESSION is double-tap guarded; nothing is seated or posted.
- WF59: three screens (Meet Nora, Configure, Review & Ready) + Nora listening/confirm/rake-help states. SAVE & START FIRST SESSION routes to WF2 review.
- WF60: Settings home (7 sections + "Finish setting up your business" banner after first session), checklist (8 items, progress, skip, Nora help, dismiss/restore, saved in localStorage for the demo), game templates.
- WF61–66 updated in place (Account Balances, optional Sign & Settle, role presets by module, Profile & Preferences, 3-part invitations).

## Invitations, RSVP & WhatsApp — required blocks
- Order: `nora-fnb*`, `nora-start*`, `nora-iv` (CSS) / `nora-iv-js`, then `nora-sweep2*`. Guard REQ list includes all eight.
- Integrated in place: WF48 (schedule + Settings → Invitations & WhatsApp), WF49 (invite), WF50/52 (player mobile web link, no NORA chrome or nav), WF51 (dashboard, roster, Nora), WF53 (start + reservations on the approved grid), WF8 (unified waitlist + offers), WF54 (consent/history), WF68 (attendance), WF60 checklist item 9.
- A reservation is never a buy-in. Reserved seats use a dashed amber border + badge on the existing seat tiles. All times are computed from the demo clock; WhatsApp threads are labelled SIMULATED.
- Backend spec and runnable tests: `backend-spec/invitations/` (`node tests.js`).
