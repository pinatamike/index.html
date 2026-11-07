# NORA UX Review — Claude Code Status Bridge

This is the shared communication log between Claude Code and ChatGPT for the **UX Review Studio only**.

- Repository: `pinatamike/index.html`
- Branch: `nora-ux-review-draft`
- Protected application repository: `pinatamike/app.nora.poker` (do **not** modify).
- Workflow source and UI preview: `index.html`; raw.githack is a read-only preview of a committed revision.
- Last UI review baseline before this bridge: `0ae1c0ebaa449b0881f6c5b4c31e598b56ca4c56`.
- This status file is coordination-only. Do not alter UI files to post a status.

## Claude Code instructions

After **every substantive answer to Mike** (including readiness, test results, identified defects, proposed fixes, completed changes, blockers, or any question needing a design decision):

1. Update this file with the latest response in compact form, retaining recent entries under **History**. Do not include secrets, raw private SSH keys, credentials, personal data, or unnecessary command logs.
2. On the `nora-ux-review-draft` branch only, commit and push this Markdown file over GitHub SSH. Use a commit message starting `status:` (for status-only updates).
3. If GitHub push fails, clearly tell Mike that the status was **not** shared. Do not claim ChatGPT has read it until Mike asks ChatGPT to check.
4. Keep the UI implementation separate: only edit `index.html` when explicitly authorized. Before each UI task, pull/rebase carefully and verify current HEAD. Never force-push.
5. After implementation, provide the real UI commit SHA and immutable raw.githack preview. Status-only commits are not new UI versions.
6. When asked for reviews, read `DESIGN_RULES.md`, `HANDOFF.md`, and the relevant workflow files before editing.

### Message template

**Updated (Bogotá time):** YYYY-MM-DD HH:MM  
**Current task:** ...  
**State:** Ready / In progress / Needs Mike decision / Blocked / Complete  
**Latest Claude response:** 1–5 sentences including the useful result or question  
**Changed UI files:** None / paths  
**UI commit SHA:** (only if changed)  
**Testing:** Passed, failed, and unverified clearly separated  
**Needs Mike/ChatGPT:** Specific decision/action or None

## Latest status

**Updated (Bogotá time):** 2026-11-06 23:56  
**Current task:** Mike-approved follow-up to Task 001: apply the same seat-photo caption crop to WF48 Screen 6 (Choose Seat)  
**State:** Complete — awaiting Mike's visual review  
**Latest Claude response:** Screen 6 seat photos now use the same image-only caption crop as Screen 7; the baked-in "Nora A" / "Paul Smith" captions are no longer visible, faces recognizable, white names, yellow badges, footer and layout unchanged. Rule is scoped to `.wf48-table-screen:not(:has(.wf48-confirm-top))` and matches exactly 5 images, all on Screen 6. Read the new CLAUDE.md and followed its gates (`git diff --check` clean, small focused diff, scratch tools outside repo).  
**Changed UI files:** `index.html` only (+5 CSS lines)  
**UI commit SHA (latest visual revision):** `4ab959e04fde7a824f0fd24ca0f608378fce1009`. Earlier UI commits this task: `fc4b54f` (Screen 7 crop), `c27e1e4` (Screen 7 CHANGE SEAT removed). Local rollback tag `rollback-before-screen6-crop` = `816cd9a`.  
**Preview:** https://raw.githack.com/pinatamike/index.html/4ab959e04fde7a824f0fd24ca0f608378fce1009/index.html#workflow-48  
**QA — PASS:** all 7 WF48 screens captured at 390×844 @2x on the committed tree and Screen 6 viewed at full size; Screens 1-5 and 7 pixel-identical to the previous commit (Screen 4 re-run 3× to rule out a capture fluke); no vertical scroll; WF02 pixel-identical; 41 inline scripts pass syntax check; selector scope verified (0 matches on screens 1-5 and 7).  
**QA — UNVERIFIED:** raw.githack URL not opened from Claude's PC; no swipe/tap test on Screen 6 seat selection this round (only layout/visual change, no handler changes); other workflows not re-rendered beyond WF02 (rule cannot match them: it requires WF48's table markup).  
**Still open (not changed, out of scope):** (1) "SEAT null" in the Screen 7 banner after tapping DONE with no seat chosen. (2) Orphaned `data-wf48-change` JS handler, now unreachable. (3) Source photos are ~140px, so they look soft when zoomed.  
**Needs Mike/ChatGPT:** Review Screens 6 and 7 in the preview; decide whether to fix the "SEAT null" banner.

## History

- 2026-11-06 23:56 — Claude: Screen 6 caption crop applied (UI 4ab959e), approved by Mike. Only Screen 6 changed; WF02 identical. (Also restored the message template section accidentally dropped in 69de5a6.)
- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.