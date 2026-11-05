# NORA.POKER · AI HANDOFF

Shared log for every AI working on this repo (Claude, ChatGPT, Gemini) and for Mike.
**Read this first. Append at the bottom of "Log" when you finish. Never delete other entries.**

Raw link for ChatGPT / Gemini:
`https://raw.githubusercontent.com/pinatamike/index.html/nora-ux-review-draft/HANDOFF.md`

## Project
Single-file HTML UX prototype of NORA.POKER (poker game manager). Branch: `nora-ux-review-draft`.
- App prototype: `index.html` (workflows WF1–71, hash `#workflow-N`)
- Desktop Control Center: `desktop/control-center.html`
- Rules: `DESIGN_RULES.md` (read before any UI change)
- Preview pattern: `https://raw.githack.com/pinatamike/index.html/<sha>/index.html#workflow-N`

## Standing rules (from Mike)
- Very short replies. Yes/no asks get yes/no.
- Phone UI reviews: show the full screen, before/after side by side. Wait for approval before pushing unless the brief says publish.
- Back up the branch before big changes. Fetch + rebase before pushing.
- Square corners. Text at least 14px (nav labels 11.5px). Primary buttons 63px. Phones fit 340px.
- COP label at 65% of the number size, inline. Never abbreviate money (no "5.5M").
- Team names: Anna, Costa, Alex. Costa is dealer only (not a player).
- Do not claim 100% done unless every screen was rendered and checked. Say when a preview was not visually seen.

## Current state
| Area | Latest SHA | Status |
|---|---|---|
| Control Center v4 (tiles -8%, Snapshot column, team view, section nav, roles) | `aa57f57` | Pushed, awaiting owner approval |
| Settings bottom-nav clearance (WF59–66) | `395cde6` | Pushed |
| Global UI audit, WF48 simplification | `09683a9`, `aea3d04` | Approved |

Previews:
- Control Center: https://raw.githack.com/pinatamike/index.html/aa57f57/desktop/control-center.html
- Settings: https://raw.githack.com/pinatamike/index.html/aa57f57/index.html#workflow-59

## Decisions
- Accounting model in the demo: Net = Rake + F&B sales − (operating expenses + team compensation). Buy-ins/rebuys are chips sold, not revenue. Cash-outs are settlements. Sign & Settle owed is a receivable. Team compensation is counted once.
- Control Center desktop = rail · player grid · always-visible Snapshot · contextual panel. Tiles stay portrait and are not enlarged.
- One shared bottom nav (Tables, Players, Team, Reporting, Settings) on every phone screen. Settings workflows always highlight Settings.
- Settings config is one shared store (`nora.cfg.v2`) read by Settings, WF48 and the checklist.

## Open / next
1. **Settings & Onboarding correction (not started):** WF59 as a 3-screen Nora conversation (Welcome, Tell Nora, Confirm) + one compact manual screen; START FIRST SESSION / SAVE FOR LATER; Settings home as 5 groups / 15 modules; internal order per module; checklist refinement.
2. (done) Settings home is now a 5-group accordion.
3. WF64 screen 2 has ~7px nav clearance instead of 12px.
4. Control Center: only the Cashbox balance exists in demo data (no Nequi/Bancolombia). Old `cc5.js` test selectors need updating (hidden toolbar).
5. Owner approval needed on Control Center v4 before applying the layout to other screens.

## How to add an entry
Append one block under Log:
```
### YYYY-MM-DD · <AI name>
- Did: …
- SHA / preview: …
- Decisions: …
- Open issues: …
```
Update "Current state" and "Open / next" only if your work changes them.

## Log

### 2026-11-05 · Claude
- Did: Settings home (WF60 screen 4) rebuilt as 5 groups (A Business & Game Setup, B People & Access, C Financial Operations, D Communications & AI, E Account & Administration), one open at a time. Unbuilt modules (Player Preferences & CRM, Subscription & Billing, Security) shown disabled. Quick Setup row kept.
- Open issues: WF59 Nora conversation rewrite and module-internal order still to do; WF64 screen 2 has 7px nav clearance.

### 2026-11-05 · Claude
- Did: Settings entries in the phone menu drawer renamed to the approved hierarchy (Business Profile & Preferences, Account Balances, Team Members & Invitations, Team Roles & Permissions, Expenses & Inventory, Food/Beverage & Menu Pricing, Invitations/RSVP/WhatsApp, Nora AI Preferences). Quick Setup kept.
- Open issues: Subscription & Billing, Security, Player Preferences & CRM Configuration have no screens yet, so they are not listed. Full accordion Settings home still to build.

### 2026-11-05 · Claude
- Did: created this file. Control Center v4 and Settings nav clearance already pushed (see Current state).
- SHA / preview: `aa57f57`
- Decisions: this file is the single shared channel between Claude, ChatGPT and Gemini.
- Open issues: see "Open / next".
