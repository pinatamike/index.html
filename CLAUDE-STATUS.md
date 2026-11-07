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

**Updated:** 2026-11-06 (initial bridge setup)  
**Current task:** Claude Code onboarding and reusable Edge screenshot QA for Workflow 48  
**State:** Ready for first implementation task (as reported by Claude; no UI edits authorized)  
**Latest Claude response:** SSH access to the UX repository is working. Local Edge + Node screenshot capture can render all seven Workflow 48 screens at 390×844, and a reusable `qa.mjs` is located outside the repo. Claude identified one possible image overflow on Screen 3; clicks/swipes remain untested. The branch is at the reviewed UI commit `0ae1c0ebaa449b0881f6c5b4c31e598b56ca4c56`.  
**Changed UI files:** None  
**UI commit SHA:** `0ae1c0ebaa449b0881f6c5b4c31e598b56ca4c56` (existing approved review baseline)  
**Testing:** Static screenshots reported successful and repeatable; tap/swipe interactions unverified; exact raw.githack rendering from Claude's environment unverified.  
**Needs Mike/ChatGPT:** Choose first implementation task; request examination of Screen 3 overflow before claiming fully clean visual QA.

## History

- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.
