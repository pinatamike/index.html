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

**Updated (Bogotá time):** 2026-11-06 23:52  
**Current task:** Task 001 — WF48 Screen 7 seat-photo caption crop (from CLAUDE-TASK.md) + owner add-on from Mike: remove CHANGE SEAT tile on Screen 7  
**State:** Complete — awaiting Mike's visual review of the preview  
**Latest Claude response:** Task 001 done. Screen 7 seat photos are cropped (image-only, scoped with `.wf48-table-screen:has(.wf48-confirm-top)` so Screen 6 is untouched); the baked-in "Nora A" and "Paul Smith" captions are no longer visible, faces are recognizable, white names and the yellow rank badges are intact. Separately, per Mike's direct request, the CHANGE SEAT tile was removed from Screen 7; CANCEL RSVP + DONE now split 50/50 at 152×54px / 17px, identical to Screen 6's footer. The two changes are separate commits so either can be reverted alone.  
**Changed UI files:** `index.html` only (+5 CSS lines crop; footer: 1 button removed, +5 CSS lines)  
**UI commit SHAs:** crop `fc4b54f816eb6b65253b69b45183533fa4621304`; footer `c27e1e403c84c4829b15d2931abbe9aa3d5595aa` (final UI version). Rollback tag (local): `rollback-before-task001` = `af63eed8ae0d9f5f00cc991b328783cbaa1cf418`.  
**Preview (final):** https://raw.githack.com/pinatamike/index.html/c27e1e403c84c4829b15d2931abbe9aa3d5595aa/index.html#workflow-48  
**Testing — passed:** All 7 WF48 screens re-captured at 390×844 @2x and viewed; Screens 1-6 pixel-identical to the pre-task baseline, only Screen 7 differs; no vertical scroll on any screen; selector verified to match exactly 5 images, all on Screen 7; WF02 pixel-identical; 41 inline scripts pass syntax check; DONE click works with no page errors; footer buttons measured 152×54 @17px = Screen 6.  
**Testing — unverified / limitations:** raw.githack URL not opened from Claude's PC (not reachable here); only DONE/CANCEL clicks were exercised, no swipes; CANCEL RSVP produced no visible change in the static preview (unchanged behavior, not investigated). Screen 3 captures occasionally come out as a tiled image from my screenshot tool (not the app; re-runs match baseline).  
**Pre-existing issues noticed, NOT changed (out of scope):** (1) Screen 6 seat photos still show the baked-in "Nora A"/"Paul Smith" captions — Task said not to touch Screen 6. (2) After tapping DONE on Screen 7 with no seat chosen, the banner reads "SEAT null". (3) The orphaned `data-wf48-change` handler remains in JS (harmless, now unreachable). (4) Photos are ~140px source and look soft when zoomed.  
**Needs Mike/ChatGPT:** Review Screen 7 in the preview; decide whether to apply the same caption crop to Screen 6 and fix the "SEAT null" banner.

## History

- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.
