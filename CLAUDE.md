# CLAUDE.md — NORA UX Review Studio: Permanent Developer Orientation

> **Read automatically at the start of every Claude Code session.** This file establishes operating procedure; it does not authorize UI changes. Mike (owner) approves scope; ChatGPT acts as product/UX director; Claude Code is the primary implementation and QA developer.

## 1. Product and business purpose

**NORA.POKER — Cash Game Manager**: a premium, mobile-first multi-tenant business SaaS for operators of private and home poker **cash games, not tournaments**. Persona: *Nora, Your AI Poker Game Administrator*. Business analogy:
- Owner/partners = business owners; players = customers; cashier/dealers/waitress/chef = team.
- Tables = revenue-producing operations; rake = revenue; team/venue/F&B = operating costs.
- Buy-ins and rebuys exchange money for chips, **not revenue**; cash-outs settle player balances.
- Sign & Settle outstanding is a receivable. Chip-box variance and financial close require accurate reconciliation, never plausible fake arithmetic.
- Single- and multi-table sessions, high-value transactions, staff permissions, audit trails, player CRM, scheduling, invitations, inventory, reports and AI assistance all have real operational stakes.

These screens must feel like fast, serious business software used with one hand during a live game. Avoid clutter, tiny text, duplicate steps and decorative UI that obscures information.

## 2. Repo isolation and authority

**Current project: UX Review Studio (prototype), NOT the production app**
- Repository: `pinatamike/index.html`
- Authorized branch: `nora-ux-review-draft`
- Main storyboard: `index.html`; route `#workflow-N`; approx. 71 workflows.
- Also inspect relevant `workflows/`, `design-system/`, `desktop/`, `backend-spec/` when a task requires.
- Preview only: `https://raw.githack.com/pinatamike/index.html/<FULL_UI_COMMIT_SHA>/index.html#workflow-N`. **raw.githack cannot be edited**; edit GitHub, commit, then use the actual commit SHA.
- Separate production repository: `pinatamike/app.nora.poker`, branch `mike`. **Never read from or write to it as part of UX work unless Mike separately authorizes a production task.** The `mike` branch is not the UX branch.
- No broad refactors, production migrations, new dependencies, renames, branch switching or force-push without authorization.

**Required reading before UI changes:** `DESIGN_RULES.md`, `HANDOFF.md`, `design-system/README.md` where present, the relevant workflow/source files, `CLAUDE-TASK.md`, and `CLAUDE-STATUS.md`.

**Conflict precedence:** (1) Mike's latest explicit approved instruction for the affected workflow, (2) newest dated decision/handoff, (3) current approved implementation, (4) older frozen design rules, (5) personal preference. Older docs contain obsolete descriptions (for example, an older WF48 section says 3 screens). **Latest approved WF48 has 7 screens.** Do not quietly revert it to three. If a conflict cannot be resolved by precedence, report it and ask *one precise product question*.

## 3. Roles and communication

- **Mike:** product owner, final acceptance; wants concise responses, one actionable question at a time.
- **ChatGPT:** product design direction, cross-workflow reasoning, writes authorized specifications.
- **Claude Code:** engineering, QA, regression, reliable source changes, screenshots, commits.
- **`CLAUDE-TASK.md`:** active work order. Pull and read it on explicit request. Do not self-initiate new tasks.
- **`CLAUDE-STATUS.md`:** shared bridge. After each substantive response to Mike, update it, commit and push a **status-only commit**, and report if the push fails. Avoid secrets. The user can say “Check Claude” to ChatGPT, which will read it. The status file is not the UI.
- **`HANDOFF.md`:** project history; append a relevant concise entry after substantial implementation (do not erase history).
- Preserve actual **UI commit SHA** separately from documentation-only commit SHAs.
- A status push can advance HEAD without altering the UI; always fetch newest branch HEAD and avoid accidentally reporting status-only SHA as a new visual revision.

## 4. Mobile visual system — nonnegotiable

**Baseline**: no vertical scrolling on core operating screens when content can fit, and no clipping. UI is phone-first, then tablet/desktop. Test 320/340/375/390/430px phone widths when relevant; at least 390×844 and DPR 2 for primary visual review. Check larger breakpoints when modifying responsive styles.

**Readability**
- Screen/card titles ~20px+, button labels 17–18px+, labels 16px+, values 17–18px+, prominent money 22px+.
- No sub-14px body text unless there is a specifically approved exception (e.g. nav). No unnecessary abbreviations.
- Aim for *large enough to read without glasses*. If text won't fit, adjust component layout before shrinking type.
- Date/time clear and consistent (`7:00 PM`, full year where shown); financial formatting like `COP 500,000`, no K/M shorthand.
- COP inline before the amount at approximately **65% of the numerals' font size**, aligned on baseline.

**Tiles, photos and controls**
- Square corners for tiles, inputs, buttons. Consistent border weight, widths, padding, vertical alignment.
- Standard selection grid **3 × 4** unless workflow-specific approval says otherwise.
- Player photo fills the tile; white name directly over photo, **no opaque black name bar**. Initials large and readable when no photo. Crop baked-in captions from source photo, but keep faces recognizable. Selected tile has bold highlight border + checkmark. Seat-number badges only in contexts where explicitly approved.
- Match related action-footer positions, heights and complete borders. For current WF48, the bottom actions across screens 2–7 intentionally share a common system. The *global* rule in DESIGN_RULES.md describes 63px; a workflow-specific owner-approved footer may have another exact value—honor its current approval.
- Standard Nora header = hamburger, section/screen identification, Nora portrait. Mobile bottom nav = Tables/Players/Team/Reporting/Settings, except distinct player-facing invitation web views that explicitly omit app chrome.
- No duplicate body title where header already displays it; no gratuitous emojis, duplicate nav, rounded tile corners or unrequested animation.
- Read-only analytics/report screens may use elegant rows and tables instead of forcing an action-tile grid.
- Never sacrifice function or legibility just to remove whitespace.

## 5. Architecture and operational logic

Core cycle: setup/schedule → start live session → seat with initial buy-in → rebuys/seat moves/cash-outs → team and expenses → live snapshot → chip/financial reconciliation → daily close.

- **Roles:** primary Owner, possible equal partners, Cashier, Dealers, waitress/bartender, Chef. Check permission implications on operations and audit records.
- **Seats:** cannot seat with zero initial buy-in; reservations are **not** buy-ins. Multi-table moves and reservations must not double-book a seat.
- **Cash-out and Sign & Settle:** chip return vs cash-out settlement vs unpaid receivable are separate. Busted=0 chips; cashier confirmation when S&S debt remains. No unsupported partial cash-out.
- **Reconciliation:** total buy-ins + promotional chips = total cash-outs + chip tips, with variance/explanation workflow when applicable. Do not “fix” a UI by fabricating matching figures.
- **Account Balances:** Cash, Nequi, Bancolombia, PayPal/Zelle, S&S outstanding, Chips Box, configured accounts.
- **Financial ledger:** operator/user and timestamp on every meaningful transaction, immutable correction history where required; read-only Snapshot/Daily Close must correspond to underlying records.
- **Food/bar/inventory:** Basic purchases direct to session expenses; Advanced counts, purchases, consumption, reconciliation, images and audit trail. Product images mandatory where specified. Don't silently force Advanced setup for Basic owners.
- **Nora AI:** large voice interaction; categories Live Action, Ask Nora, Help & Support. Financial actions require explicit confirmation.

**Current WF48 Schedule & Invitations approved 7-screen version**:
1. Schedule Session (cloned from protected WF02, optional invitation toggle).
2. Invitations (audience, seat hold, send-before, reminder settings).
3. Select Players (3×4 photo grid, bold selected border/check).
4. Invitation Preview (game details generated from scheduled data, optional personal note).
5. Player RSVP (same game-card placement/format as screen 4, personal note shown, Yes/No/Maybe, arrival time; only Yes selects seat).
6. Choose Seat (reserved/open player thumbnails; green table rectangle intentionally removed).
7. Reserved Table (arrival/table/seat, count, change/cancel/done).
Exact data and visuals come from the latest branch and Mike-approved screenshots, not superseded old spec. Scheduling and RSVP are demo/storyboard, not proof of delivered WhatsApp messages or live multi-user backend.

## 6. Editing contract: minimal and reversible

1. Fetch current remote HEAD; check `git status`; verify intended branch; identify rollback commit.
2. Understand active DOM, CSS cascade order, event handling, persisted demo data. Do not add another CSS override blindly: investigate earlier rules and consolidate *within authorized scope* safely.
3. Before any edit, record authorized workflows, screens and components in a mini scope checklist.
4. Make the narrowest change that satisfies the brief. No edits to WF02 unless expressly authorized. No unrelated workflow changes.
5. Never delete approved functionality or reorder steps silently.
6. Keep screenshot scripts and scratch artifacts **outside the repository**, unless Mike approves adding them.
7. On Windows avoid CRLF whole-file churn: check `git diff --stat` and `git diff --check`, compare normalized content if necessary, ensure a small focused diff.
8. Run automated and visual QA. If screenshots fail, say **UNVERIFIED** rather than “100% done.”
9. For approved implementation, commit/push only authorized changes via SSH. No force push. Produce immutable raw.githack preview tied to the actual UI commit.
10. For audit-only tasks, **do not modify UI** unless scope explicitly includes fixes.

## 7. Specialized audit modes — Mike can request any

### A. Single-screen micro sweep
Inspect **every visible element**: spelling, font sizes, weight, positioning, consistent text casing, badges, COP ratio, numerical grouping, tile border, photo/name overlay, buttons, keyboard accessibility, viewport clipping and overflow. Compare to sibling screens and approved baseline. Fix only that screen if authorized.

### B. Whole-workflow sweep
Inspect **all steps and states**, not just static default screenshots. Confirm sequence, navigation, BACK/CANCEL/CONTINUE logic, optional branching, empty/full/error states, persistent data and confirmation. Cross-check against adjacent upstream/downstream workflows. Verify visual consistency before and after. Classify findings by severity and fix only approved scope.

### C. Module sweep
Review an entire module (e.g., Live Session, Player CRM, Team, Reporting, Settings) for terminology, repeated components, ledger consistency, permissions and cross-workflow navigation. Inventory screens and report drilldowns may differ appropriately from tile-entry screens. Create an issue inventory before changing anything.

### D. App-wide exhaustive micro-detail sweep
When Mike explicitly requests the **entire 71-workflow UX Studio**:
1. Inventory actual workflows/screens and count them from the current code—do not assume an old count of 303 is current.
2. Run systematic browser capture at primary phone viewport for **every screen**, with targeted width/DPR comparisons; collect evidence by workflow and screen, not a handful of examples.
3. Run automated geometry, overflow, scroll, minimum-font, contrast/readability, button-border, cropping, icon, duplicate-header, footer, COP/time/date format, layout-alignment and image checks. Automated failures are leads, **not proof**: visually distinguish intentional cropping from actual overflow.
4. Test practical interactions: clicks, taps, swipes, optional branches, modals, selected/unselected/disabled states, back/forward and persistence. Separate storyboard behavior from real backend availability; never claim live integration on demo data.
5. Identify reusable patterns/root causes, but **do not globally refactor without authorization**. Propose safe batches by module or CSS-component scope with rollback points and regression tests.
6. Provide a concise summary for Mike plus complete machine-readable issue ledger: workflow, screen, severity, exact defect, screenshot reference, root cause, proposed fix, status, verification.
7. If Mike authorizes remediation, implement in small batches, verify all affected screens and representative unrelated screens, then repeat audit until residual findings are documented.
8. Never claim all 71 workflows reviewed when only a subset was rendered or tested.

### Severity and priority
- **P0:** security/tenant isolation, inaccurate financial posting/settlement, destructive data loss, blocked critical live operation.
- **P1:** broken workflow, incorrect amount/seat/role/navigation, clipped essential action, user unable to complete task.
- **P2:** major readability, overlap, inconsistent required fields, missed audit context.
- **P3:** micro-alignment, inconsequential spacing, polish.

Mike currently prioritizes *serious functional and UX flaws* over endlessly polishing a nearly-approved workflow. Avoid expanding a small P3 task into a design overhaul.

## 8. Browser testing in this Windows environment

Claude has already established **Microsoft Edge + Node built-in WebSocket/CDP** screenshot QA without installing Playwright. Reuse local `C:\Users\mikee\nora-qa\qa.mjs` (outside repo) and its README; verify actual path and environment rather than assuming. It captures full phone frames at 390×844, DPR 2, supports workflow number and output directory. Add interaction and alternate viewport coverage as tasks require. Screen captures must be checked after load stabilizes: a prior Screen 5 image was a CDP capture artifact (tiled/repeated), not an app defect.

- For a change, capture **before and after** at identical viewport/DPR, compare full phone, zoom details, and inspect controls/borders.
- Test no unintended vertical/horizontal scroll, overflow, broken images and wrong footer baseline.
- Distinguish intentionally oversized source photo (clipped within its tile) from true bleeding content; check CSS `overflow:hidden`.
- If browser cannot reach raw.githack on this computer, render the **local Git clone of the exact commit**; Mike can check live preview in Chrome.
- Don't substitute a source-code search for a rendered-screen pass.

## 9. QA release gates and response contract

Three mandatory passes:
1. **UX & functional:** complete flows, practical interactions, expected state changes, no fake functionality claims.
2. **Rendered visual:** screenshot every changed screen, inspect at full size and zoom, fix defects.
3. **Micro-detail & regression:** every label/value/border/photo/footer and unrelated workflow check.

Use **PASS / FAIL / UNVERIFIED**, and record which screen/state was tested. Test suites should be reusable.

Final response to Mike (brief):
- Completed: exact screens/behaviors changed.
- QA: pass counts and what remains unverified.
- GitHub: branch, UI commit SHA, changed files.
- Preview: raw.githack URL (only for a verified real commit).
- Decision needed: only genuine owner decisions.

Then update `CLAUDE-STATUS.md` (status-only commit, separate from UI commit), and `HANDOFF.md` if the product architecture/spec changed materially.

## 10. First-use behavior

Reading this orientation does **not** give permission to start an app-wide audit or change files. Keep working on the explicitly authorized `CLAUDE-TASK.md` task. When Mike later requests an entire module/app sweep, announce scope, create a workflow-by-workflow audit plan, and execute that request using the protocols above.

**Never claim completion just because code compiled, a commit succeeded, or a few screenshots looked good.**
