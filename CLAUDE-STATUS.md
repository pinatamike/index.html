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

**Updated (Bogotá time):** 2026-11-06 23:45  
**Current task:** Investigate WF48 Screen 3 (Select Players) reported image overflow — read-only  
**State:** Ready (investigation complete; no UI edits made or authorized)  
**Latest Claude response:** The Screen 3 "overflow" is not a visible defect. The 8 photo tiles use an intentional 175% zoom-crop on the `<img>` (`index.html` ~L2719-2722, "crop badges baked into photo assets") so the image box is ~155×162px inside a 94×98px tile. The parent `.wf48-face` has `overflow:hidden` (~L2585), so it is clipped to the tile; nothing bleeds onto the screen and no vertical scroll exists. It was a false positive from my geometry check. Two real observations (not fixed): (1) source photos are only ~140×136px, so the 175% crop upscales them ~2.2× and they look soft at 2× DPR; (2) on Screen 7 the Nora A. and Paul S. seat photos still show a faint burned-in caption ("Nora A", "Paul Smith") — the caption crop used on Screen 3 is not applied there (DESIGN_RULES: "Player photos crop out the burned-in name caption"). Read DESIGN_RULES.md and HANDOFF.md; will follow them, WF02 untouched.  
**Changed UI files:** None  
**UI commit SHA:** `0ae1c0ebaa449b0881f6c5b4c31e598b56ca4c56` (UI baseline; HEAD before this status commit was `3505b73`)  
**Testing:** Passed: 7 screens render at 390×844, no vertical scroll on any, geometry probe identifies the single flagged element type. Unverified: tap/swipe interactions; raw.githack rendering from Claude's PC; Screen 7 caption observation is from a screenshot, not measured.  
**Needs Mike/ChatGPT:** Decide whether Screen 7 caption crop and/or higher-resolution player photos should be part of the first UI task; otherwise send the first implementation task.

## History

- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.
