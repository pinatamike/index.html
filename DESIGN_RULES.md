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
