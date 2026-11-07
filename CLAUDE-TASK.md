# NORA — Current Claude Code implementation task

## Task 002 — WF48 correct seat numbering and thumbnail height; then AUDIT ONLY

**Authorized by Mike (Nov 7, 2026).** Scope: Workflow 48, **Screens 6 and 7** for the two fixes below. Then a comprehensive read-only audit of **all 7 screens**. Do **not** fix additional audit findings until Mike approves them.

**Repository:** `pinatamike/index.html`  
**Branch:** `nora-ux-review-draft`  
**Current UI baseline to verify against remote:** `202b4146fde2c738f9b5bbc50d08ec635d7f94a6` (branch may have newer status/doc commits).  
**Protected:** Workflow 02, all other workflows, production NORA repository, previous accepted WF48 behavior/appearance.

### Part A — Implement ONLY these two approved changes

#### 1. Correct seat-number positions on Screens 6 (Choose Seat) and 7 (Reserved Table)

The existing 10 physical seat positions are arranged around the table and currently numbered 1–10 incorrectly. Mike wants **the same positions**, with the following **exact old-position-label → new-seat-number** mapping:

| Current position/label | Correct number |
|---|---|
| 5 | **1** |
| 6 | **2** |
| 7 | **3** |
| 8 | **4** |
| 9 | **5** |
| 10 | **6** |
| 1 | **7** |
| 2 | **8** |
| 3 | **9** |
| 4 | **10** |

This is a *seat renumbering*, not a request to rotate or relocate player tiles visually. Follow the mapping for the existing seat geometry, consistently on **both screens**. Check clockwise poker-seat ordering after implementation.

**Critical:** Do not simply alter displayed number badges while leaving the reservation logic, occupied/open states, clicked seat IDs, selected-seat labels, current player's reservation, or confirmation data referring to the old numbers. New seat identifiers must be internally consistent and unique. Preserve the intended demo participants/occupied positions while mapping their seat IDs appropriately. Update fixtures such as `WF48RESERVED` if necessary to retain each illustrated player's physical position. Tests must verify no duplicates/double booking.

Avoid changing the seating appearance, table geometry, or any other workflows.

#### 2. Increase the HEIGHT of every player seat thumbnail tile by 10%; do NOT increase WIDTH

Applies to the seat tiles on **Screens 6 and 7**, including occupied and open seats. Increase *outer tile height* by exactly **10% from the existing computed size**, preserving existing width. For example, 68px tall becomes 74.8px (use appropriate CSS precision). Do not stretch images or crop player faces unintentionally; adjust their inner height and flex layout only if needed to use the extra tile space. Keep square corners, names visible, borders, labels, and action/footer positions unchanged. Verify no overlap or clipped tiles/number badges on 390×844 at DPR 2; check 340/375/430 widths. If the taller tiles collide, make the minimum scoped geometry adjustment needed, without width changes or unrelated redesign.

### Part B — After implementing and testing, REVIEW Workflow 48 one final time (AUDIT ONLY)

Inspect all seven screens and their meaningful interaction states, from Schedule Session → Invitations → Select Players → Invitation Preview → Player RSVP → Choose Seat → Reserved Table.

Report the **remaining minor visual or functional issues** (P2/P3) with:
- screen number and label
- exact issue and why it matters
- proposed precise fix
- severity and whether it is newly introduced or pre-existing
- screenshot/evidence location where applicable

Check alignment, action/footer height, typography, dates/COP, cropping, name display, missing personal message, seat availability, arrivals, YES/NO/MAYBE, navigation, responsiveness, and duplicate copy. Note any serious issue (P0/P1) separately if found, but **do not repair anything outside Part A without Mike's explicit approval**.

Do **not** report trivial non-issues as defects. Keep the owner-facing shortlist compact and prioritized.

### Testing and release instructions
1. Fetch remote HEAD via SSH; verify correct branch and clean worktree; read `CLAUDE.md`, `DESIGN_RULES.md`, `HANDOFF.md`, and `CLAUDE-STATUS.md`; record rollback point.
2. Capture **before** screenshots of Screens 6/7 and all WF48 frames with existing local Edge+Node QA harness outside repo.
3. Implement Part A with minimal, tightly scoped changes.
4. Test mapping old→new for **all ten positions** and all relevant seat click, reserve, confirm, cancel, re-render and count states. Verify no duplicate seat IDs.
5. Capture **after** Screens 1–7 at 390×844, DPR 2; compare Screens 1–5 against baseline unchanged; inspect 6/7 and alternate mobile widths. Test actual clicks and flows when feasible.
6. Verify Workflow 02 pixel-identical (or substantively unchanged if capture nondeterminism), no horizontal/vertical overflow, no photo/name clipping, no JavaScript errors, and no whole-file CRLF churn.
7. Only commit and push approved Part A UI changes; report actual full UI commit SHA and immutable raw.githack URL.
8. Run Part B audit without extra UI edits. Post prioritized issue list **for Mike's approval** in `CLAUDE-STATUS.md` (and concise Claude reply), status-only commit/push separately.
9. Do not call Workflow 48 fully approved until Mike personally checks the preview.

**Important:** This task supersedes Task 001, which Claude has completed. No changes to the actual production NORA app.
