# Verification record

3 November 2026

- `npm test`: 18 tests passed, zero failures. Covers formula/reference example, premature rounding regression, signed rounding, stroke allocation invariants, Stableford, no returns, all format allowances, mixed-tee par adjustments, relative match allowances, fourball aggregation, early match close, incomplete cards, and invalid data.
- `npm run build`: succeeded; creates a deployable dist directory with index.html and source assets.
- `node --check src/app.js`: passed.
- Browser preview attempted at http://127.0.0.1:4173. Browser reported a connection timeout; a local HTTP check reported socket access forbidden by environment permissions. Responsive layout and browser interaction checks could therefore not be completed in this environment. They are not represented as passed.

## Suggested browser acceptance checks

Run `npm start`, then open the printed URL. At desktop and 390px phone width, confirm tabs, player cards and horizontal scorecard scrolling are usable. Change an Index and tee, check recalculation, enter numeric scores and X, and switch through the five formats. Use two players (one per side) for singles match; two per side for fourball. Export and reload a round, import it, and confirm scores are retained. Add a tee, try duplicated stroke indices (must fail), then save valid data. Reload the page and confirm device persistence. Use the keyboard to reach fields and buttons. Check blocked storage produces an export reminder.

This is local project delivery; no GitHub repository was created and no external site was published.
