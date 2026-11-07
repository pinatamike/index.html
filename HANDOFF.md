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
- SUPERSEDED (nora-nav-v2): hamburger = 6 sections (Live Session, Schedule, Reporting, Players, Team, Settings). Bottom bar is contextual: Live Session 6 tabs, Reporting 5, Settings 6, none in Schedule/Players/Team.
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

### 2026-11-05 · Claude (navigation rework)
- Did: backup branch `backup-before-nav-rework-20261105` (do not touch). Work continues ONLY on branch `nora-nav-v2`. Six-section hamburger + contextual bottom bars implemented centrally in sweep2 (`ctx()` maps workflow/step to bar+active tab). Removed stray stage-level bars in WF41-46. Audited all 71 workflows at 390/820/1280: one bar max, correct active tab, no clipping.
- Decisions: WF19-24 = Live Session, Team tab. WF54-58 are Players (data says CRM), no bar. Reporting Accounts/Inventory and Settings Expenses/Hospitality/Players tabs map to nearest existing screens (69:2, 70:0, 64:1, 64:0, 48:2).
- Open issues: preview not visually seen from raw.githack (own screenshots only).


### 2026-11-05 · ChatGPT — direct navigation repair, commit 80e64d9
- Repository: `pinatamike/index.html`; edited only `index.html` on `nora-nav-v2`. Backup `backup-before-nav-rework-20261105` untouched. Gaurav's React app untouched.
- Removed obsolete review router bindings from hamburger and bottom tabs, which conflicted with the dedicated sweep2 navigation handling.
- Corrected contextual bottom bar to one per phone, with no bar for Schedule / standalone Players; workflow 19–24 Team operations now consistently belong to Live Session, Team active. WF53 final live step marks Live Session.
- Settings Core routes to WF60 step 4 (actual Settings home), not WF59 onboarding.
- Reporting Accounts & Inventory and Settings Players tabs had misleading borrowed destinations. They remain visible but report an unbuilt destination instead of taking user to unrelated existing screens. These three destinations still need dedicated UI designs before they can be fully wired.
- Reporting active states corrected to avoid marking unrelated reports as Accounts/Inventory.
- Kept existing approved layouts and screen designs. Browser screenshot/click-through verification of raw.githack has NOT yet been completed; must not claim all 71 visually verified.
- Commit: `80e64d95cc51f161be7c8350d1cd1057a3b4a9b0`. Preview: https://raw.githack.com/pinatamike/index.html/80e64d95cc51f161be7c8350d1cd1057a3b4a9b0/index.html#workflow-2
- For Claude handoff, summarize this log and the remaining unbuilt nav destinations at the end of Mike's working session.


### 2026-11-05 · ChatGPT — owner correction: six-tab hamburger (commit 2511273)
- Mike rejected the previous preview because the hamburger still showed a long expanded submenu on the phone. Correct interpretation: hamburger MUST show exactly SIX direct, non-expanding tabs: Live Session / Schedule / Reporting / Players / Team / Settings. No nested submenu inside the hamburger.
- Replaced sweep2 `drawer(st)` HTML with six direct section buttons; removed accordion toggling. Active section is highlighted. Each tab routes to its section home via `rnGo`. Settings home corrected to WF60 screen 4 (60:3).
- Left contextual bottom navigation in place: Live Session 6, Reporting 5, Settings 6; no bottom bar for Schedule or standalone Players. No restyling of underlying workflow screens. No React app changes.
- Code checks: six section objects exactly, drawer no longer contains `nn-items`, `nn-chev`, or `data-nn-toggle`. Actual rendered browser test has NOT been done; do not declare visual completion.
- Work branch `nora-nav-v2` only. Backup `backup-before-nav-rework-20261105` untouched.
- Latest prototype code commit: `25112736b1eadf28e099212bb11dc85f72adc6bf`.


### 2026-11-05 · ChatGPT — owner hamburger styling and utility footer (commit 24326df)
- Implemented on prototype branch `nora-nav-v2`, file `index.html` only. Backup untouched. Gaurav app untouched.
- User reviewed six-tab hamburger and approved structure. Requested removal of right-pointing chevron/caret from each main tab, restoration of stronger Live Session prominence (larger text and distinct teal background), and three utility tabs anchored at the bottom of the opened hamburger: user thumbnail/Profile, SUPPORT, Privacy.
- Hamburger still has exactly six main section tabs (no submenus). Implemented Live Session at 21px with distinct teal background; other six-tab labels are 18px, active section retains green highlight. Added fixed bottom row with user-initial avatar Profile, chat icon SUPPORT, lock icon Privacy.
- Profile routes to WF65 step 1; Support and Privacy open clearly labeled in-drawer preview information with Back (no invented contact or policy). Follow-up: wire actual support and privacy destinations once designed and approved. Profile avatar currently uses initial 'M' instead of an uploaded owner profile image, since no confirmed linked user image is available in prototype data.
- Verification: static source checks pass for exactly six direct sections, no arrow markup, all three footer controls, active styling and click handler. Browser-rendered click testing still outstanding; do not claim full visual QA.
- Code commit: `24326df60d8fda325457c7a28f0850e6ca17f3f2`.


### 2026-11-05 · ChatGPT — drawer covers contextual bottom bar (commit 55eecda)
- Mike's screenshot showed contextual Live Session bottom nav exposed below the open hamburger. The requested open drawer must instead display exactly six main navigation tabs plus its own anchored Profile / SUPPORT / Privacy utility footer.
- Root cause: drawer was previously sized to END ABOVE the bottom bar. Fixed `drawer(st)` to extend down to the phone bottom (`d.style.bottom='0px'`), overlaying the contextual bar. It reappears when the drawer closes.
- Verified source contains the `.nn-footer` with Profile, SUPPORT, Privacy and its 72px layout, and z-index 45 on the drawer. No underlying screens or workflows changed. Visual browser verification pending.
- Code commit `55eecdaa0f693f45d80cd9a36fa7da3eabf15816`; branch `nora-nav-v2`; untouched backup and Gaurav's code.


### 2026-11-05 · ChatGPT — WF54 Players CRM owner-approved updates
- Only WF54 prototype implementation edited on nora-nav-v2. Backup and React app untouched.
- Four screens now: Find Player → Player CRM Profile → Session History → Session Transactions & Audit Trail. The separate search-results screen was removed. Player selection routes directly to profile.
- Profile retains sessions, hours, WhatsApp, email, lifetime win/loss, Edit Contact and Session History. Removed total lifetime buy-ins, invitation/history action and NOT REGISTERED badge. App User badge appears only when registered.
- Sessions grouped by session date and result. Selecting a date shows transactions with type, amount, time and posting operator (Alex · Cashier). Data is illustrative.
- Changes limited to WF54 specific rendering, code and styles; other workflows intentionally left alone.
- Latest code commit d10de8ef6e73bbb4a2320d1b1c9fcb1f81a764d8. Browser/mobile rendering and interaction tests remain outstanding.


### 2026-11-05 · WF54 correction — remove fifth screen, restore original initials, tighten first three
- Owner reported unwanted fifth WhatsApp/Invites screen still present after earlier WF54 edit, player tile initials made too small, and poor spacing/format on screens 1–3. Do not alter other workflows.
- Root cause fifth screen: pre-existing legacy IIFE appended a fifth entry to WORKFLOWS[54].steps and SCREEN_SPECS[54].types. Disabled only WF54 append and deleted dead fifth-screen renderer. WF68 extension logic unchanged.
- WF54 first screen now uses previously used crmRoster56(false) photo grid with full-size 45px initial fallback, preserving same names/images, and existing player selection routing.
- WF54 profile screen: compact identity layout, aligned Sessions/Hours with correct spacing, slightly tightened contact/CTA areas; retains approved data only. WF54 Session History: compact header and date tiles; retains date grouping and click-through.
- Scope: only WF54 source and scoped WF54 CSS were edited. The four-step workflow remains Find → Profile → Session History → Transactions. Gaurav React repo and protected backup branch untouched.
- Code commit e203ddb1f8aadaf3047871e77a3eeb5a61e46f3f. Static code checks confirm no fifth-screen append; mobile browser visual verification still needed.

### 2026-11-07 · Claude Code · GLOBAL SWEEP (branch `nora-global-sweep-20261107`)
- Source protection: the newest branch `nora-ux-review-draft` (da84a33) was NOT the whole truth. It was built from cf18645, just before the 17 commits on `nora-nav-v2` (Nov 5: six-tab hamburger, Profile/Support/Privacy footer, drawer covering the bar, contextual bars Live 6 / Reports 5 / Settings 6, WF54 four-screen CRM). Those were merged into the sweep branch (clean merge, 6c6734d). Backup of the draft: branch `backup-before-global-sweep-20261107` (da84a33). Not merged on purpose: `nora-wf02-one-screen-preview` / `nora-wf54-profile-fix-20261105` (their extra commits rework WF02, which the draft deliberately restored).
- Navigation: drawer = Tables, Players, Team, Schedule, Reports, Settings (one `NAV` config, `BARS` + `ctx()` for the contextual bars). Live bar says Table. Browser Back/Forward and pasted #workflow-N links now switch workflows. Header titles SCHEDULE / REPORTS.
- WF48: audit items 6-9 and 11 done (live refresh of dependent screens, no duplicate titles, one wording for the reserved count, identical 54px/18px action row on all 7 screens, Screen 1 amount spacing). Settings > Invitations (WF60 step 8) now drives WF48 through the shared `invites.*` settings.
- Global: the 71-workflow inventory (qa/audit-app.mjs) showed 185 rounded tiles; one shared rule squared them. COP is 65% everywhere it can be measured; amounts carry thousands separators; no dark name bars; nothing scrolls.
- QA kit: `qa/` (Node + Edge). Run `node qa/run-all.mjs index.html`. Headless Edge needs background throttling disabled or the nav layer (started on requestAnimationFrame) can fail to run on repeated reloads; that is a harness issue, not an app bug.
- Open: Settings still lacks Scheduling defaults, Reports/ledger settings, Team compensation, expense categories, inventory counts/waste; Player CRM, Subscription and Security are labelled "Not in this prototype". Settings bar labels stay at 10px because of "Hospitality" (6 tabs x 56px); WF2 and WF48 Screen 1 share the WF02 form.