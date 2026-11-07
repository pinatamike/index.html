# NORA — Current Claude Code implementation task

**Owner approval context:** Mike approved correcting Screen 7's residual baked-in player-name captions and asked Claude to implement. ChatGPT is the UX director.

## Task 001 — Workflow 48, Screen 7 photo caption crop

**Scope:** Modify ONLY the **WF48 Screen 7 seat-photo rendering** in `pinatamike/index.html` on branch `nora-ux-review-draft`. No production app changes.

### Problem
The source photo assets contain baked-in captions. On Workflow 48 Screen 7 (Reserved Table), some seat thumbnails (e.g., Nora A. and Paul Smith) visibly show the original baked-in caption within the photo, in addition to NORA's separately rendered white name.

On Workflow 48 Screen 3, the photos use a zoom/crop that hides the baked-in caption. Screen 7's `.wf48-seat-face img` currently uses plain fill and `object-fit:cover` instead.

### Required change
- Apply a **localized image-only crop** to Screen 7 seat thumbnails, enough to hide baked-in name labels while preserving recognizable faces.
- Do NOT crop the separately rendered white name label.
- Maintain square corners, existing seat tile positions and sizes, border styles, selected status, available seats, layout and controls.
- Avoid blurry/over-zoomed imagery as far as source quality permits. Inspect at 2× DPR. Do not use a global image rule.
- Do not modify Screen 6 unless strictly necessary and explicitly approved. Do not modify Screen 3, WF02, other workflows, `DESIGN_RULES.md`, or production application files.

### Before editing
1. Pull latest branch changes via SSH and read `CLAUDE-STATUS.md`, `DESIGN_RULES.md`, and `HANDOFF.md`.
2. Confirm branch and create a rollback reference.
3. Record baseline screenshots for all seven WF48 screens at 390×844, 2× DPR using the existing local Edge/Node capture script.

### QA / completion
1. Fix Screen 7 caption crop.
2. Re-capture all seven Workflow 48 screens and compare with baseline. Inspect each at full size.
3. Confirm Screen 7's burned-in captions are no longer visible, faces are recognizable, separately rendered names remain visible, and no other UI changed.
4. Verify no scrolling/clipping/regressions, code syntax, and Workflow 02 unchanged.
5. Report exact modifications, screenshot results and any unresolved limitations.
6. Commit & push only approved UI changes to `nora-ux-review-draft`; provide new full SHA and raw.githack URL.
7. Update `CLAUDE-STATUS.md` with results and commit/push the status. Never claim browser QA passed unless actually inspected.

**Do not expand this task to general UI cleanup.**

### Future tasks
Wait for the next authorized task from Mike/ChatGPT. ChatGPT will update this same file for future tasks. After Mike says “Read the task file” you can retrieve it and implement it.
