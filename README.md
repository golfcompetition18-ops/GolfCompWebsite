# Fairway UK

A responsive, dependency-free golf competition scorer. Built with semantic HTML, CSS and browser JavaScript modules, with a separately testable WHS calculation engine. Ready to upload to a GitHub repository and deploy as static files.

## Run

Install Node.js 20 or later. No package installation or API keys required.

```sh
npm start
# http://127.0.0.1:4173
npm test
npm run build
```

Use a web server rather than double-clicking index.html: browser modules need HTTP. The development server binds to this computer only. Google Fonts are optional; system font fallbacks work without them. The app otherwise makes no external service requests.

## Included

- Per-player Handicap Index and tee selection, including men’s and women’s rating categories.
- Full-precision 18-hole Course Handicap and format-specific Playing Handicap, signed plus handicaps, mixed-tee par adjustment and stroke allocation.
- Individual net stroke play, individual Stableford, singles match play, fourball Stableford and fourball match play.
- Editable hole-by-hole gross scores, no-return entries, progress and provisional leaderboard. Match results close when mathematically decided.
- Course/tee creation and editing, hole pars and stroke indices, course JSON import/export.
- Automatic local-device saving and complete round JSON export/import. One active round; export files to archive multiple rounds.
- Unit tests, GitHub Actions checks, rule notes and sample course JSON.
- A 14-player, 12-competition season, averaged points for tied places, Total Points and a final Playing Handicap column, Captain’s Pick, saved event cards and rolling handicap estimates.

## The 12-competition season

Open **The season → Set up 14-player season**. This keeps the existing players and fills empty slots to make 14. Set player names and tees on The round, then enter starting handicap **indices** in the season setup. The starting values are not already-converted playing strokes. The season roster stays at 14; starting indices and prior histories lock after the first recorded event.

The events, in order, are Official Stableford, Best Front 9, Official Medal, Best Back 9, Best Stableford, Best Par 3, Stableford - unofficial, Best Par 5, SI 10 to 18, Best Par 4, SI 1 to 9, and Captains Pick. All use Stableford points on the indicated holes, except Official Medal, which uses lowest 18-hole net strokes. All Stableford variants have identical scoring mechanics; their names distinguish separate events. Captain’s Pick selects one of the first 11 types and inherits its scoring and hole selection. “Official” is an event name, not an official score-submission status.

Each event awards **14 to 1 season points** to 14 players. Tied places share the average of their occupied points: two tied first receive 13.5 each, third receives 12. Medal NR cards rank below numeric cards, with multiple NRs tied. Every event distributes 105 points; 12 events distribute 1,260. Equal season totals share their finishing position.

Choose **Prepare next competition** to clear the active card, select the matching round format/allowance, and enter the next 18-hole round. Choose Captain’s Pick before preparing event 12. Set the course and tees on The round. In The season, select the next event and **Record current round** after all 14 complete cards are entered. A subset prize still needs 18 hole entries for the handicap update. Partial cards cannot earn final season points. Played holes without a valid score use X; truly unplayed holes remain blank and block recording. Use Undo latest competition to correct the last result, then record it again. Repeated Undo can reopen earlier events.

Recording snapshots gross scores and tee ratings, awards points, calculates a complete-round Score Differential, and updates each player’s competition index for the next event. Both tabs use that evolving local index once a season exists; the round player card shows the computed Competition index as read-only. Edit the initial index in the season setup, not on that card. Original reference WHS values are retained in exported data. Existing standalone round files still import.

The standings show each event’s season points and raw competition score, Total Points, starting/current index, and **Playing Handicap as the final column**. That PH uses the currently selected course/player tees and the next event’s allowance (last event’s settings after the season ends), so it changes if you change the upcoming tee. Individual recorded event results retain the actual PH used on that day.

### Handicap history and limits

You requested WHS averaging: this uses the best **8 Score Differentials of the latest 20**, not eight gross scores or eight competition point totals. Enter up to 20 real prior Score Differentials per player, separated by commas, oldest first. No prior history is invented from the starting index. With fewer than three recorded differentials, the starting index is retained; with 3–19 the Rule 5.2a shorter-history table applies. Once 20 are available, every new card removes the oldest from the calculation window.

These are **local competition index estimates**, not official WHS updates. The implementation includes net-double-bogey adjusted gross scoring, the 18-hole differential formula, published PCC input (default zero), the short-history table and best-eight averaging. It omits soft/hard caps, exceptional score reductions, committee adjustments, official score eligibility and submission. Existing players who omit their prior history can see different results from their official index. Values are kept within the app’s supported -10.0 to 54.0 range. See [docs/SEASON.md](docs/SEASON.md) for formulas and sources.

Round/season export includes the full course library, starting histories, 12-event settings and recorded scorecards. Use **Import saved round** on The round tab to restore it. Course-only imports remain separate. No shared server or cross-device sync is added.

## Play a round

1. Choose a course and format. Set the allowance to the committee’s Terms of Competition. The default singles allowance is 95%; Appendix C permits consideration of 100% for fewer than 30 players. This app does not infer committee policy from group size.
2. Enter player names, existing WHS indices and tee rating categories. Enter `-2.4` for a plus index of +2.4. The supported index entry range is -10.0 to 54.0 (a product limit on the plus end).
3. For singles match use two players, one on A and one on B. Fourball needs four players, two on each side. The default demo group already supports fourball.
4. Enter gross strokes including penalties. Blank means unplayed; `X` explicitly marks no valid score/picked up. In match play X loses to a valid score; both sides X halve the hole as a social scoring convention. Concessions are not modelled—record agreed scores including conceded strokes or keep the match record outside this app.
5. Export the round for backup. Device storage is not cloud storage and may be cleared by the browser. There is no account, shared live session, backend or cross-device sync.

## Course data and licensing

**All bundled names and ratings are fictional illustrative data, not official golf courses or an official directory.** The app does not claim a licence to the England Golf, R&A, USGA or home-union course databases. There is no bulk directory download, scraping, or official WHS connection.

For real play, enter club-confirmed current Course Rating, Slope, par and stroke index for the exact tee and rating category. Record source, verification date and permission in the provenance field. Directory integration requires a separately authorised/licensed supplier and a mapping to this schema. Never infer women’s ratings from men’s ratings, or rating categories from tee colour.

Use `samples/course.json` as the course import schema. Each tee has exactly 18 `{par,si}` holes, with SI a permutation of 1–18. Imports validate structure; this is not verification that ratings are official. Course imports create a new course ID to avoid replacing existing records. Round imports replace the active round and library after confirmation. Files are limited to 2 MB, with up to 40 players and 100 courses per round import.

## Rule coverage

See [docs/RULES.md](docs/RULES.md) and [docs/SEASON.md](docs/SEASON.md) for formulas, rounding, sources reviewed on 3 November 2026, implementation decisions and exclusions. This is an England-oriented social competition calculation profile, not a certified all-UK competition or handicapping service. Committee policies and home-union implementation must be checked. Official indices are not updated and acceptable scores are not submitted; the season maintains a separate local estimate.

## Deploy to GitHub Pages

1. Put the contents of this project folder at your repository root and push to GitHub.
2. In Settings → Pages, select **Deploy from a branch**, your branch (e.g. main), and **/(root)**.
3. Open the Pages URL when GitHub finishes deploying. Relative asset paths support repository subpaths.

Alternatively run `npm run build` and upload **dist/** to any static host (Netlify, Cloudflare Pages, etc.). Build command: `npm run build`; output directory: `dist`; no environment variables required. This deliverable has not been published to an external host or pushed to a GitHub account.

GitHub Actions runs tests and a static build on pushes and pull requests. No dependencies means no lockfile is required. Use your organisation’s preferred licence before distributing; no third-party official course data is included.

## Structure

`src/rules.js` round calculations · `src/season.js` season/handicap estimates · `src/season-ui.js` season screen · `src/data.js` fictional demos · `src/app.js` round UI and storage · `tests/` calculations and handler smoke tests · `docs/` rule mapping and season guide · `server.mjs` local preview · `build.mjs` static export.

## Operational boundaries

Standalone round scores remain editable and are not attested. Ties remain tied, with no countback or sudden-death holes. Incomplete individual stroke cards are separated from complete results, and all incomplete results remain provisional. Team points require an entry from both partners per hole (use X for a partner who picks up). Round gross subtotals exclude X; season differential calculations separately apply net double bogey. Course updates recalculate the active round after confirmation. Recorded season events snapshot their tees and cards, so later course edits do not change historical results. Use Undo latest competition for season corrections. Export your data for backup.

Before running official club competitions, add competition governance, authorised data, audit/attestation, eligibility checks and an approved handicap-service integration as required. Local Rules and decisions, penalties, disqualification and score acceptance require committee judgement.
