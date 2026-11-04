# NORA UI Design System — Authoritative Specification

**Status: FROZEN (Nov 2, 2026).** This is the approved UI for NORA. Developers build the production app to match it. Change it only with the owner's approval.

- Visual rules: [`../DESIGN_RULES.md`](../DESIGN_RULES.md)
- Prototype: `index.html` (branch `nora-ux-review-draft`)
- Desktop / tablet layouts: [`../desktop/`](../desktop/README.md). Approved sample: `desktop/table-view.html`
- Restore point before the master sweep: branch `backup-before-master-sweep-branch`

## Required blocks in `index.html` (do not delete, rename or reorder)

These must stay the **last elements inside `<head>`**, in this order. They hold the final, approved styling and behavior. Each later block overrides the earlier ones.

| id | Type | Purpose |
|---|---|---|
| `audit-fixes` | style | Team 19–24, WF1–11 sizing, square corners |
| `polish-chatgpt-workflows` | style | Width, rows, footers, COP for WF13–18, 32–53, 59–71 |
| `polish-chatgpt-js` | script | COP wrapping, minimum font, Daily Close nav |
| `nora-system` | style | Global tokens: square corners, 5-tab nav, icons, COP baseline, footers |
| `nora-system-js` | script | Unified bottom nav + routes, SVG icon family, duplicate-title removal, header fit |
| `nora-final` | style | WF40 dashboard, visual balance for Nora AI / Settings / Reporting |
| `nora-chat-css` | style | Nora chat & voice: composer, round mic, recording/processing states, review cards, overlay |
| `nora-guard` | script | Nav routes, routing for new tiles, quantity steppers, **missing-block alarm** |

`nora-chat-js` is the **last script before `</body>`**: WF13–18 screens and the context-aware Nora overlay opened from any portrait.

`nora-guard` shows a red banner and a console error if any block is missing. If you see it, restore the block from git before continuing.

## Tokens

| Token | Value |
|---|---|
| Card background | `#082b43` |
| Card border | `#00baff`, 2px |
| Label text | `#c5e4f2`, 16px, weight 800–900 |
| Value text | `#ffffff`, 19–22px, weight 900 |
| COP label | `#f7f4ea`, **65% of the amount's font size**, inline, baseline |
| Success | `#22f0a4` / `#0f9a6c` |
| Warning | `#ffc04a` / `#b07a12` |
| Error / loss | `#ff6b7d` / `#a5233a` |
| Corners | **square everywhere**; only check icons and stamps are round |
| Min text size | 14px (bottom-nav labels 11.5px) |
| Primary action | 63px tall, full width (two actions split 50/50) |
| Phone width | 340px |
| Bottom nav | Tables · Players · Team · Reporting · Settings |

## Components (reuse; never restyle per screen)

- **Player / staff tile:** 172px, 140px photo, name 22–24px, two stat lines
- **Selection grid:** 3 × 4 photo tiles (Select Player / Find Player)
- **Confirmation screen:** NORA tile 92px, status banner 172px (84px icon, title, subtitle), details tile, CONTINUE 63px
- **Data row:** label left, value right, 1px divider
- **Hero figure:** gradient banner, 36–38px amount
- **Chips:** 44px, selected = green border / green fill
- **Line icons:** SVG, stroke 2–2.2, `currentColor`; no emoji

## Editing rules

1. New screens reuse the components above; no new visual styles.
2. Never shrink fonts to fit content. Wrap labels to two lines or let lists scroll.
3. Every change: render at 340px, check clipping, COP ratio, button height, and run the 260-screen audit before pushing.
4. Production code should move these tokens into the app's real stylesheet/theme. The override blocks are only how the prototype carries them.

## Nora chat & voice (frozen Nov 2)

- **Open:** tap Nora's portrait on any screen. The panel opens over the content with a context bar (module · player · read-only state), a greeting, 0–3 context tiles and the composer. The mic is never auto-activated.
- **Tiles:** live table → Live Action + Ask Nora (Help is the ? icon); task screens → only that task + Ask; read-only screens (Snapshot, Reporting, ledgers, closed sessions) → no transaction tiles. Context rules are in `context()` inside `nora-chat-js`.
- **Composer:** text input + 62px round mic. Typing swaps the mic for Send. Tap mic → recording bar (Cancel · live waveform + timer · round red Stop with pulsing rings). Stop → "Nora is interpreting…" → answer.
- **Money actions:** always a REVIEW card (player, action, amount, table/seat, account) with CHANGE / CONFIRM (63px). Authorization step where required. Result shows the ledger reference only after backend posting (prototype says "Preview: not posted").
- **Read-only questions:** answered directly, no confirmation.
- **Multiple actions:** each action reviewed separately; batch confirm; each posts with its own reference.
- **Errors:** clear message, nothing recorded, CANCEL / TRY AGAIN; retries reuse the same request ID (no double posting).
- **Motion:** idle mic breathes; recording rings + waveform; processing dots; all disabled under `prefers-reduced-motion`. The round mic and rings are the only intentional round shapes besides check icons and stamps.
