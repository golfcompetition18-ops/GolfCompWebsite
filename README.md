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

See [docs/RULES.md](docs/RULES.md) for formulas, rounding, sources reviewed on 3 November 2026, implementation decisions and exclusions. This is an England-oriented social competition calculation profile, not a certified all-UK competition or handicapping service. Committee policies and home-union implementation must be checked. It consumes an existing index; it does not update that index or submit acceptable scores.

## Deploy to GitHub Pages

1. Put the contents of this project folder at your repository root and push to GitHub.
2. In Settings → Pages, select **Deploy from a branch**, your branch (e.g. main), and **/(root)**.
3. Open the Pages URL when GitHub finishes deploying. Relative asset paths support repository subpaths.

Alternatively run `npm run build` and upload **dist/** to any static host (Netlify, Cloudflare Pages, etc.). Build command: `npm run build`; output directory: `dist`; no environment variables required. This deliverable has not been published to an external host or pushed to a GitHub account.

GitHub Actions runs tests and a static build on pushes and pull requests. No dependencies means no lockfile is required. Use your organisation’s preferred licence before distributing; no third-party official course data is included.

## Structure

`src/rules.js` pure calculation engine · `src/data.js` fictional demos · `src/app.js` UI and storage · `tests/rules.test.js` reference/edge cases · `docs/RULES.md` rule mapping · `server.mjs` local preview · `build.mjs` static export.

## Operational boundaries

Scores and settings remain editable and are not locked or attested. Ties remain tied, with no countback or sudden-death holes. Incomplete individual stroke cards are separated from complete results, and all incomplete results remain provisional. Team points require an entry from both partners per hole (use X for a partner who picks up). Gross subtotals exclude X; they are not adjusted gross scores. Course updates recalculate an active round after confirmation; scores do not snapshot historic tee ratings. Export a round before updating course data if you need that historical record.

Before running official club competitions, add competition governance, authorised data, audit/attestation, eligibility checks and an approved handicap-service integration as required. Local Rules and decisions, penalties, disqualification and score acceptance require committee judgement.
