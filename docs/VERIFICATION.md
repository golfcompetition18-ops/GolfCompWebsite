# Verification record

3 November 2026

- `npm test`: 34 tests passed, zero failures. Includes the original round engine tests, all 12 event names/scopes, 14-to-1 awards and fractional ties, Medal NR ordering, short-history rules, best-eight/latest-20 rolling calculation, NDB/PCC and high-CH caps, full-card requirement, Captain’s Pick, full-season replay/export, historic tee snapshots, Undo, and invalid records.
- One application-handler smoke test runs against a small DOM stub: boots the app, creates 14 players, enters cards, records an event, imports the embedded season, undoes an event, changes a starting index and chooses a Captain’s Pick. It verifies required HTML IDs exist and PH is the final standings column. This does not substitute for a real-browser interaction/layout check.
- `npm run build`: succeeded; creates a deployable dist directory with index.html and source assets.
- `node --check src/app.js`: passed.
- Browser preview attempted at http://127.0.0.1:4173. Browser reported a connection timeout; a local HTTP check reported socket access forbidden by environment permissions. Responsive layout and browser interaction checks could therefore not be completed in this environment. They are not represented as passed.

## Suggested browser acceptance checks

Run `npm start`, then open the printed URL. At desktop and 390px phone width, confirm tabs, player cards and horizontal scorecard scrolling are usable. Change an Index and tee, check recalculation, enter numeric scores and X, and switch through the five formats. Use two players (one per side) for singles match; two per side for fourball. Export and reload a round, import it, and confirm scores are retained. Add a tee, try duplicated stroke indices (must fail), then save valid data. Reload the page and confirm device persistence. Use the keyboard to reach fields and buttons. Check blocked storage produces an export reminder.

For the season, create the 14-player roster, supply names/starting indices/history, prepare a round, enter all 18 holes, record an event and inspect points/handicap changes. Verify starting fields lock, recorded results remain stable after editing the active course, and Undo restores the prior state. Check the season table scrolls horizontally on a phone and Playing Handicap remains the final column. Captain’s Pick must be chosen before preparing event 12.

This is local project delivery; no GitHub repository was created and no external site was published.
