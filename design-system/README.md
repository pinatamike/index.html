# NORA UI Design System — Authoritative Specification

**Status: FROZEN (Nov 2, 2026).** This is the approved UI for NORA. Developers build the production app to match it. Change it only with the owner's approval.

- Visual rules: [`../DESIGN_RULES.md`](../DESIGN_RULES.md)
- Prototype: `index.html` (branch `nora-ux-review-draft`)
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
| `nora-guard` | script | Nav routes, routing for new tiles, quantity steppers, **missing-block alarm** |

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
