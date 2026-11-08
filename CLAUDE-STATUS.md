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

**Updated (Bogotá time):** 2026-11-07 20:00  
**Current task:** Brief (b) TEAM main tab + Team terminology + Team quick fixes: DONE on branch nora-team-20261107 (backup backup-before-team-20261107 = fa1b7d7). Brief (c) Settings + onboarding + 4 Rewards programs is next.  
**State:** Complete (awaiting Mike review; nothing merged or deployed)  
**Latest Claude response:** Added WF72-77 (Team Overview, Add Team Member, Team Member Profile, Edit Team Member, Team History, Team Access & Permissions). Live Game Team dashboard now shows only WORKING and FINISHED; Check In / Check Out / Team Sessions / Hours Worked / Sessions Worked; no Shift wording. Tests: test-team 25/25, test-nav 93/93, reports 48/48, batch1 39/39, batch2 35/35, design 19/19, wf48sweep 32/32, task002 76/76, fixes123 41/41, items45 28/28, s1align 18/18.  
**Changed UI files:** index.html (+ qa suites)  
**UI commit SHA:** b9fe6eda0f4738ea13cb7c701e1bcb148b12e247  
**Preview:** https://raw.githack.com/pinatamike/index.html/b9fe6eda0f4738ea13cb7c701e1bcb148b12e247/index.html#workflow-72 (not reachable from this PC; checked locally)

## History

- 2026-11-07 04:52 — Claude: GLOBAL SWEEP done on branch nora-global-sweep-20261107 (UI bef0258, QA kit 67f89de); lost nav-v2 work restored by merge; backup branch backup-before-global-sweep-20261107; draft untouched.
- 2026-11-07 01:23 — Claude: audit items 4-5 done (UI 47f8e88), revised per Mike (no corner number on occupied seats, photos cropped); Screen 1 Date/Start Time column alignment done (UI a7235bb).
- 2026-11-07 00:47 — Claude: audit fixes 1-3 done (UI 4fa4a5f): S5 message tile, S7 inert seats, S3 footer class. Items 4-11 still open.
- 2026-11-07 00:28 — Claude: Task 002 Part A done (UI df7381a9afc8a7e2a8f484e2e5fb88665ed2fe9f: seat renumbering + 10% taller tiles) and Part B audit posted (11 findings, 2 P1, no P0). No fixes applied beyond Part A.
- 2026-11-07 00:01 — Claude: re-read CLAUDE.md (unchanged since afdd8d5), confirmed understanding, no UI changes. No task active.
- 2026-11-06 23:59 — Claude: fixed Screen 7 'SEAT null' (UI 202b414), approved by Mike.
- 2026-11-06 23:56 — Claude: Screen 6 caption crop applied (UI 4ab959e), approved by Mike. Only Screen 6 changed; WF02 identical. (Also restored the message template section accidentally dropped in 69de5a6.)
- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.