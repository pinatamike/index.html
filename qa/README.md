# NORA UX Review Studio - repeatable QA kit

Automated checks for the recurring problems found in the global sweep. They drive a real headless Microsoft Edge through the Chrome DevTools Protocol, so no packages are installed: **Node 22+ and Edge only**. Run from the repo root.

```
set EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe   (only if Edge is elsewhere)
node qa/run-all.mjs index.html            # every suite, summary at the end
node qa/test-nav.mjs index.html 71        # navigation across all 71 workflows
node qa/audit-app.mjs index.html out.json 390   # inventory of every screen (JSON)
node qa/qa.mjs index.html 48 shots/       # screenshots of one workflow at 390x844 @2x
```

| Script | What it protects |
|---|---|
| `test-nav.mjs` | Exactly six drawer tabs in the order Tables, Players, Team, Schedule, Reports, Settings; Profile / Support / Privacy footer; no sub-tabs in the drawer; contextual bottom bar differs from the six tabs; Live bar says "Table"; Reports (5) and Settings (6) bars; no bar in Schedule / Players / Team; drawer covers the bar; drawer destinations, Support/Privacy panels, tab navigation, direct links, browser Back / Forward - on every screen of every workflow |
| `test-design.mjs` | Square tile corners, tile border widths, no undersized essential text, COP at 65%, thousands separators, no dark bars behind player names (uses an inventory JSON from `audit-app.mjs`) |
| `test-wf48sweep.mjs` | WF48 live refresh between screens, no duplicate titles, one wording for the reserved count, Settings > Invitations toggles really drive WF48 |
| `test-task002.mjs`, `test-fixes123.mjs`, `test-items45.mjs`, `test-s1align.mjs` | WF48 seat numbering and double-booking, footer / note / seat fixes, first names and photo crop, Screen 1 column alignment |

## Notes
* Edge is started with `--disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-background-timer-throttling` and focus emulation. Without them a headless page can stall `requestAnimationFrame`, and the navigation layer (which starts on an animation frame) never runs on repeated reloads. This is a harness issue, not an app bug.
* `qa/` is test tooling only; nothing in `index.html` depends on it.
* Screenshots are stable-captured (two identical frames required); compare before/after hashes to detect visual regressions.