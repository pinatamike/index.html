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

**Updated (Bogotá time):** 2026-11-07 00:01  
**Current task:** None active. Mike asked Claude to re-pull the branch, read `CLAUDE.md` carefully, confirm understanding, and make no further UI changes.  
**State:** Ready — no UI work in progress  
**Latest Claude response:** Pulled `nora-ux-review-draft` (already current at `dbc69ca`; `CLAUDE.md` is byte-identical to the version I read when it landed in `afdd8d5`; `CLAUDE-TASK.md` unchanged, so Task 001 is the last task). I have read all 10 sections of `CLAUDE.md` and will treat it as the standing operating manual. Key commitments: (1) work only on the authorized UX repo/branch (`pinatamike/index.html` / `nora-ux-review-draft`); never touch `pinatamike/app.nora.poker`; (2) precedence is Mike's latest instruction, then newest dated decision, then current approved implementation, then older rules; latest WF48 is 7 screens; (3) minimal reversible edits: fetch, check status, tag a rollback, write a scope checklist, narrowest change, no edits to WF02 or unrelated workflows, `git diff --stat` / `--check` to avoid CRLF churn; (4) scratch tools stay outside the repo (`C:\Users\mikee\nora-qa`); (5) three QA passes (functional, rendered visual, micro-detail/regression) with before/after captures at 390×844 @2x, reported as PASS / FAIL / UNVERIFIED, never "done" because code compiled or a few screenshots looked fine; automated overflow flags are leads, not proof; (6) audit modes A-D (screen, workflow, module, app-wide 71-workflow sweep) only when Mike explicitly requests them, starting with an announced scope and an issue inventory, with P0-P3 severity; (7) status-only commits kept separate from UI commits, and the UI SHA reported separately from status SHAs; (8) no new tasks self-initiated.  
**Changed UI files:** None this round (no UI changes made)  
**Latest UI commit SHA:** `202b4146fde2c738f9b5bbc50d08ec635d7f94a6` (WF48 Screen 7 'SEAT null' fix; previous: `4ab959e` Screen 6 crop, `c27e1e4` and `fc4b54f` Screen 7)  
**Preview (latest UI):** https://raw.githack.com/pinatamike/index.html/202b4146fde2c738f9b5bbc50d08ec635d7f94a6/index.html#workflow-48  
**Testing:** No new testing this round (documentation/orientation only). Last QA for latest UI `202b414` (PASS): DONE with no seat gives 'SEAT —'; pick seat 2 then RESERVE then DONE gives 'SEAT 2'; all 7 WF48 screens pixel-identical to the prior commit; WF02 identical; no vertical scroll; 41 inline scripts pass syntax; `git diff --check` clean. UNVERIFIED: raw.githack not reachable from Claude's PC, swipes, and any workflow other than 48 and 02.  
**Points noted from the manual:** (a) Global rule says footers are 63px, but WF48 screens 2-7 use an owner-approved 54px button system; I will honor the workflow-specific approval. (b) `HANDOFF.md` asks for a concise entry after substantial implementation; I have not added one for Task 001 and Screens 6-7 follow-ups because they were small. Say so if you want one. (c) Lesson applied: my earlier status edit once deleted the message template (fixed in `03ee6ec`); I now anchor edits on the section headings and diff before committing.  
**Needs Mike/ChatGPT:** Send the next authorized task, or request an audit mode (screen / workflow / module / app-wide) with scope.

## History

- 2026-11-07 00:01 — Claude: re-read CLAUDE.md (unchanged since afdd8d5), confirmed understanding, no UI changes. No task active.
- 2026-11-06 23:59 — Claude: fixed Screen 7 'SEAT null' (UI 202b414), approved by Mike.
- 2026-11-06 23:56 — Claude: Screen 6 caption crop applied (UI 4ab959e), approved by Mike. Only Screen 6 changed; WF02 identical. (Also restored the message template section accidentally dropped in 69de5a6.)
- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.