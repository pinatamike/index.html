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

**Updated (Bogotá time):** 2026-11-07 00:47  
**Current task:** Mike approved audit fixes 1, 2 and 3 from the Task 002 audit. Implemented and pushed; nothing else changed (audit items 4-11 are still open and unapproved).  
**State:** Complete — awaiting Mike's visual review  
**Latest Claude response:** (1) Screen 5: the owner's personal message is never silently cut off any more. The tile is at least one line tall (61px), grows with the message (up to 131px before a response, 120px after NO/MAYBE) and scrolls inside when longer; after a response the gaps below the game card tighten by 3px so the tile is not squeezed (card and footer positions are unchanged). In the YES state the arrival block needs the room, so the tile stays 61px and a long message scrolls there; it can be read in full before tapping YES. (2) Screen 7: all seat tiles are now inert (rendered disabled), so tapping an open seat no longer turns the confirmation screen into Choose Seat or desyncs the saved seat. Seat change = CANCEL RSVP, then choose again. (3) Screen 3: the re-rendered footer keeps its `s2-foot` class, so REVIEW INVITES stays 17px / 54px and no longer spills past the border after a tap.  
**Changed UI files:** `index.html` only (16 added / 4 removed lines)  
**UI commit SHA (latest visual revision):** `4fa4a5f4bccbc27ceebc59a738aa7da6307351ef`  
**Preview:** https://raw.githack.com/pinatamike/index.html/4fa4a5f4bccbc27ceebc59a738aa7da6307351ef/index.html#workflow-48  
**Rollback:** local tag `rollback-before-fixes-1-2-3` = `2a30f96` (UI identical to `df7381a`)  
**QA — PASS:** 41/41 new checks: Screen 3 footer identical to default after picking/deselecting players and paging (and the empty-selection message still works); Screen 5 with 30/110/280-char notes in default, YES, NO and MAYBE: tile never below 61px, short and medium messages fully visible except medium in YES (scrolls), long messages scroll, game card top/height and footer position unchanged, nothing pushed off screen; Screen 7: all 10 seat tiles disabled, taps (including a forced synthetic click) change nothing, saved seat/log unchanged, DONE and CANCEL RSVP still work; Screen 6 unchanged (open seats still tappable); 0 JavaScript errors. Part A seat suite re-run: 76/76. Default renders of all 7 screens are pixel-identical to `df7381a` at 340/390/430px; WF02 identical to the original; 41 inline scripts pass syntax; `git diff --check` clean.  
**QA — UNVERIFIED:** raw.githack URL (not reachable from Claude's PC); scrolling a long note on real touch hardware (scrolling was tested by script); the thin scrollbar look on real devices; keyboard / screen-reader use; devices narrower than 340px.  
### Part B audit — findings ledger
**Items 1, 2 and 3 were approved by Mike and are FIXED in UI commit `4fa4a5f`. Items 4-11 are NOT approved and NOT changed.**
Severity per CLAUDE.md. "Pre-existing" = present before Task 002. Evidence PNGs are on Claude's PC in `C:\Users\mikee\nora-qa\audit\` (not in the repo).

| # | Sev | Screen | Issue and why it matters | Proposed fix | Origin |
|---|---|---|---|---|---|
| 1 ✅ FIXED | P1 | S5 Player RSVP | The owner's personal message is cut off. The note tile has hidden overflow: a 110-char note loses 31px, a 280-char note (the allowed max) loses 108px, and after tapping YES the tile shrinks 61 to 47px so even a 30-char note is clipped by 12px. Guests cannot read the full message. | Let the note tile grow into the free space above "ARE YOU COMING?" and scroll internally when long; keep the full tile height in the YES state (compress the arrival block spacing instead). Optionally cap the S4 textarea at ~140 chars. | Pre-existing |
| 2 ✅ FIXED | P1 | S7 Reserved Table | Open seat tiles are tappable on the confirmation screen. Tapping one turns the screen into the Choose Seat layout (title "SELECT YOUR SEAT", BACK / RESERVE SEAT footer) under the "Reserved Table" header, and the saved data becomes inconsistent: seat 2 while the RSVP log still says seat 4. With CHANGE SEAT removed this is now an accidental way to change seat. | Make S7 seat tiles non-interactive (disabled, no tap). Seat change then = CANCEL RSVP and choose again. | Pre-existing; more exposed since CHANGE SEAT was removed |
| 3 ✅ FIXED | P2 | S3 Select Players | After tapping any player or page dot, the footer loses its `s2-foot` class: REVIEW INVITES switches 17 to 18px, 0 to 12px padding, and its second line spills 8px below the bottom border. | Add `s2-foot` to the `wf48-player-actions` div in `wf48PlayerForm()` (or give the same rules to `.wf48-player-actions`). One-line change. | Pre-existing |
| 4 | P2 | S6 / S7 | Names truncated on 3 of 5 reserved tiles: "Macaul…", "Miguel…", "Paul S…". Players cannot be identified. | Show first name only, or wrap "Macaulay / C." on two lines using the 6.8px added by Task 002 (no width change). | Pre-existing |
| 5 | P2 | S6 / S7 | The yellow rank badge baked into each photo (digits 1-5) sits next to the real seat number and reads as a second seat number. After renumbering they disagree (Luka: seat 7 + badge 1; Nora: 5 + 4). | Crop the badge out of the seat photos the same way the captions were cropped (Screens 6-7 only). | Pre-existing; more visible after renumbering |
| 6 | P2 | S4, S5, S7 (studio) | Frames do not refresh live from earlier steps: S4 shows "0 INVITEES" after picking players on S3; S5 does not show the note typed on S4 until a response is tapped; S7 stays at "SEAT —" and count 5 after RESERVE until DONE or reload. All correct after reload. Reviewers can see stale numbers. | Re-render the destination frame from saved state when the studio navigates to it (S4, S5, S7). | Pre-existing |
| 7 | P3 | S3, S4 | Body title repeats the header subtitle ("SELECT PLAYERS", "INVITATION PREVIEW"), against the no-duplicate-title rule. | Remove or reword (S3: keep only "N SELECTED"; S4: drop the title). | Pre-existing |
| 8 | P3 | S1-S7 footers | Footer height and position differ: S1 buttons 52px, S2-S7 54px; bottom gap 19px (S1), 21px (S2-S3), 18px (S4-S7), so buttons jump 3px between screens. | Standardise to 54px with one bottom gap (18px). | Pre-existing |
| 9 | P3 | S5 / S6 / S7, S1 | Copy differs for the same fact: "5 PLAYERS ALREADY RESERVED SEATS" (S5) vs "5 PLAYERS RESERVED" (S6) vs "5 PLAYERS RESERVED SEATS" (S7). S1's time error says "07:00 PM" while the field shows "7:00 PM". | Use "5 PLAYERS RESERVED" everywhere; change the S1 message to "7:00 PM". | Pre-existing |
| 10 | P3 | S6 / S7 | A thin sliver of the old caption still shows along the bottom edge of Paul Smith's photo. | Crop 3-4% more at the bottom for that rule. | Pre-existing since Task 001 |
| 11 | P3 | S1 | Blinds and buy-in rows have a wide gap before "/" (about 14px) but tight spacing on S4-S5. | Match the S4-S5 spacing (S1 is a WF02 clone; change only the WF48 copy). | Pre-existing |

Checked and fine: S2 dropdown states; S3 4-selected look (bold border + check), page 2, empty-selection message; S1 validation messages; S5 NO / MAYBE messages and arrival validation; S6 selected state ("JK / YOU", hint text); dates ("Sun, Nov 8, 2026 · 7:00 PM") and COP at ~65%; no broken images; no vertical or horizontal scroll on any screen or state tested.  

**Decision for Mike (optional):** a 280-character note cannot show in full without scrolling anywhere on this screen. If you want long messages always fully visible, cap the Screen 4 note field at about 140 characters (small change, needs your approval).  
**Needs Mike/ChatGPT:** Review the preview; say which of items 4-11 (and the optional 140-character cap) to do next. WF48 is NOT approved until Mike checks it himself.

## History

- 2026-11-07 00:47 — Claude: audit fixes 1-3 done (UI 4fa4a5f): S5 message tile, S7 inert seats, S3 footer class. Items 4-11 still open.
- 2026-11-07 00:28 — Claude: Task 002 Part A done (UI df7381a9afc8a7e2a8f484e2e5fb88665ed2fe9f: seat renumbering + 10% taller tiles) and Part B audit posted (11 findings, 2 P1, no P0). No fixes applied beyond Part A.
- 2026-11-07 00:01 — Claude: re-read CLAUDE.md (unchanged since afdd8d5), confirmed understanding, no UI changes. No task active.
- 2026-11-06 23:59 — Claude: fixed Screen 7 'SEAT null' (UI 202b414), approved by Mike.
- 2026-11-06 23:56 — Claude: Screen 6 caption crop applied (UI 4ab959e), approved by Mike. Only Screen 6 changed; WF02 identical. (Also restored the message template section accidentally dropped in 69de5a6.)
- 2026-11-06 23:52 — Claude: Task 001 complete (fc4b54f crop, c27e1e4 footer: CHANGE SEAT removed on Mike's request). Only Screen 7 changed; WF02 identical.
- 2026-11-06 23:45 — Claude: Screen 3 overflow = clipped intentional crop (false positive); noted soft photos and Screen 7 residual captions. No UI changes.
- 2026-11-06 (earlier) — Claude: onboarding complete; SSH access works; Edge+Node screenshot QA ready (`qa.mjs` outside repo); branch was at `0ae1c0e`.
- 2026-11-06 — Status bridge created by ChatGPT. Awaiting Claude Code to read this file and start posting updates.