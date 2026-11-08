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

**Updated (Bogotá time):** 2026-11-07 18:00  
**Current task:** Brief (a) Reports redesign + chip accounting: DONE on branch. Brief (b) TEAM main tab starting next, then (c) Settings + onboarding (with 4 Rewards programs incl. Rakeback, Team quick-fix and Team terminology WORKING/FINISHED).  
**State:** (a) complete, awaiting Mike review. NOT approved.  
**Branches:** backup-before-reports-20261107 (6be6947) · nora-reports-20261107 (UI 878929d).  
**Testing:** PASS test-reports 48/48, batch1 39/39, batch2 35/35, nav 87/87, design 19/19, WF48 suites. UNVERIFIED: raw.githack from this PC, real touch devices.  
**Needs Mike:** review (a) preview.

### Part B audit — findings ledger
**Fixed: items 1-3 (UI `4fa4a5f`), 4-5 and 10 (`47f8e88`), Screen 1 alignment 12 (`a7235bb`), and 6, 7, 8, 9, 11 in the global sweep (UI `bef0258`, branch `nora-global-sweep-20261107`). Nothing from this ledger is open any more.**
Severity per CLAUDE.md. "Pre-existing" = present before Task 002. Evidence PNGs are on Claude's PC in `C:\Users\mikee\nora-qa\audit\` (not in the repo).

| # | Sev | Screen | Issue and why it matters | Proposed fix | Origin |
|---|---|---|---|---|---|
| 1 ✅ FIXED | P1 | S5 Player RSVP | The owner's personal message is cut off. The note tile has hidden overflow: a 110-char note loses 31px, a 280-char note (the allowed max) loses 108px, and after tapping YES the tile shrinks 61 to 47px so even a 30-char note is clipped by 12px. Guests cannot read the full message. | Let the note tile grow into the free space above "ARE YOU COMING?" and scroll internally when long; keep the full tile height in the YES state (compress the arrival block spacing instead). Optionally cap the S4 textarea at ~140 chars. | Pre-existing |
| 2 ✅ FIXED | P1 | S7 Reserved Table | Open seat tiles are tappable on the confirmation screen. Tapping one turns the screen into the Choose Seat layout (title "SELECT YOUR SEAT", BACK / RESERVE SEAT footer) under the "Reserved Table" header, and the saved data becomes inconsistent: seat 2 while the RSVP log still says seat 4. With CHANGE SEAT removed this is now an accidental way to change seat. | Make S7 seat tiles non-interactive (disabled, no tap). Seat change then = CANCEL RSVP and choose again. | Pre-existing; more exposed since CHANGE SEAT was removed |
| 3 ✅ FIXED | P2 | S3 Select Players | After tapping any player or page dot, the footer loses its `s2-foot` class: REVIEW INVITES switches 17 to 18px, 0 to 12px padding, and its second line spills 8px below the bottom border. | Add `s2-foot` to the `wf48-player-actions` div in `wf48PlayerForm()` (or give the same rules to `.wf48-player-actions`). One-line change. | Pre-existing |
| 4 ✅ FIXED | P2 | S6 / S7 | Names truncated on 3 of 5 reserved tiles: "Macaul…", "Miguel…", "Paul S…". Players cannot be identified. | Show first name only, or wrap "Macaulay / C." on two lines using the 6.8px added by Task 002 (no width change). | Pre-existing |
| 5 ✅ FIXED (revised) | P2 | S6 / S7 | The yellow rank badge baked into each photo (digits 1-5) sits next to the real seat number and reads as a second seat number. After renumbering they disagree (Luka: seat 7 + badge 1; Nora: 5 + 4). | Crop the badge out of the seat photos the same way the captions were cropped (Screens 6-7 only). | Pre-existing; more visible after renumbering |
| 6 ✅ FIXED (sweep) | P2 | S4, S5, S7 (studio) | Frames do not refresh live from earlier steps: S4 shows "0 INVITEES" after picking players on S3; S5 does not show the note typed on S4 until a response is tapped; S7 stays at "SEAT —" and count 5 after RESERVE until DONE or reload. All correct after reload. Reviewers can see stale numbers. | Re-render the destination frame from saved state when the studio navigates to it (S4, S5, S7). | Pre-existing |
| 7 ✅ FIXED (sweep) | P3 | S3, S4 | Body title repeats the header subtitle ("SELECT PLAYERS", "INVITATION PREVIEW"), against the no-duplicate-title rule. | Remove or reword (S3: keep only "N SELECTED"; S4: drop the title). | Pre-existing |
| 8 ✅ FIXED (sweep) | P3 | S1-S7 footers | Footer height and position differ: S1 buttons 52px, S2-S7 54px; bottom gap 19px (S1), 21px (S2-S3), 18px (S4-S7), so buttons jump 3px between screens. | Standardise to 54px with one bottom gap (18px). | Pre-existing |
| 9 ✅ FIXED (sweep) | P3 | S5 / S6 / S7, S1 | Copy differs for the same fact: "5 PLAYERS ALREADY RESERVED SEATS" (S5) vs "5 PLAYERS RESERVED" (S6) vs "5 PLAYERS RESERVED SEATS" (S7). S1's time error says "07:00 PM" while the field shows "7:00 PM". | Use "5 PLAYERS RESERVED" everywhere; change the S1 message to "7:00 PM". | Pre-existing |
| 10 ✅ FIXED (side effect of 5) | P3 | S6 / S7 | A thin sliver of the old caption still shows along the bottom edge of Paul Smith's photo. | Crop 3-4% more at the bottom for that rule. | Pre-existing since Task 001 |
| 11 ✅ FIXED (sweep) | P3 | S1 | Blinds and buy-in rows have a wide gap before "/" (about 14px) but tight spacing on S4-S5. | Match the S4-S5 spacing (S1 is a WF02 clone; change only the WF48 copy). | Pre-existing |

Checked and fine: S2 dropdown states; S3 4-selected look (bold border + check), page 2, empty-selection message; S1 validation messages; S5 NO / MAYBE messages and arrival validation; S6 selected state ("JK / YOU", hint text); dates ("Sun, Nov 8, 2026 · 7:00 PM") and COP at ~65%; no broken images; no vertical or horizontal scroll on any screen or state tested.  
| 12 ✅ FIXED | owner request | S1 Schedule Session | The Date tile was narrower than Game Name above it and Start Time wider than Invitations (151.5 + 151.5px with a 7px gap vs 164.7 + 140.3px with a 5px gap), so the two rows did not line up. | Row 2 now uses the same column split and gap as row 1. | Owner request (Nov 7) |

**Decision for Mike (optional):** a 280-character note cannot show in full without scrolling anywhere on this screen. If you want long messages always fully visible, cap the Screen 4 note field at about 140 characters (small change, needs your approval).  

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