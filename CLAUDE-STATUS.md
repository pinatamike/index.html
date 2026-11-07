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

**Updated (Bogotá time):** 2026-11-06 23:59  
**Current task:** Mike-approved fix: WF48 Screen 7 banner showed "SEAT null" after tapping DONE with no seat chosen  
**State:** Complete — awaiting Mike's review  
**Latest Claude response:** Fixed. The DONE handler printed the raw empty seat value; it now falls back to the same "—" the initial banner uses. One-line change in `index.html` (DONE handler, ~L7645). No static screen changed visually.  
**Changed UI files:** `index.html` only (1 line)  
**UI commit SHA (latest visual revision):** `202b4146fde2c738f9b5bbc50d08ec635d7f94a6`  
**Preview:** https://raw.githack.com/pinatamike/index.html/202b4146fde2c738f9b5bbc50d08ec635d7f94a6/index.html#workflow-48  
**QA — PASS:** DONE with no seat → banner "RSVP CONFIRMED · 7:00 PM · TABLE 1 · SEAT —"; flow pick seat 2 on Screen 6 → RESERVE → DONE → "SEAT 2" (both with zero page errors); all 7 WF48 screens pixel-identical to the previous commit; WF02 identical; no vertical scroll; 41 inline scripts pass syntax; `git diff --check` clean.  
**QA — UNVERIFIED:** raw.githack URL not opened from Claude's PC; swipes not tested; only WF48 and WF02 rendered.  
**Observation (not changed):** after RESERVE on Screen 6, the static Screen 7 banner still reads "SEAT —" until DONE is tapped (storyboard renders each screen once); not part of this fix.  
**Still open (not changed):** unreachable `data-wf48-change` JS handler; photos are ~140px source and soft when zoomed.  
**Needs Mike/ChatGPT:** Review in the preview; send the next task when ready.

## History

- 2026-11-06 23:59 — Claude: fixed Screen 7 'SEAT null' (UI 202b414), approved by Mike.
- 2026-11-06 23:56 — Claude: Screen 6 caption crop applied (UI 4ab959e), approved by Mike. Only Screen 6 changed; WF02 identical. (Also restored the message template section accidentally dropped in 69de5a6.)
- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.