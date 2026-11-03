# Rule engine and source review

Reviewed online: **3 November 2026**. Scope: 18-hole competition scoring with an existing Handicap Index. Sources may change; recheck when introducing new national or committee policies. England, Scotland, Wales and Northern Ireland do not form a single administrative golf authority.

## Primary sources

1. [R&A Rules of Handicapping, Rule 6](https://www.randa.org/en/roh/the-rules-of-handicapping/rule-6): Course/Playing Handicap and different tee pars. The retrieved page exposes its section heading but not all rule body text, so calculation details were cross-checked against the official USGA online version below.
2. [R&A Appendix C](https://www.randa.org/en/roh/appendices/appendix-c): allowances, use of unrounded Course Handicap, plus handicap allocation and match play. Allowances are specified in Terms of Competition; field size may justify a different percentage.
3. [England Golf Handicap Index](https://www.englandgolf.org/handicap-index): using an existing index to obtain a tee-specific Course Handicap.
4. [England Golf: equity and 95%](https://englandgolf.freshdesk.com/support/solutions/articles/80001021976-what-is-equity-in-strokeplay-95-handicap-allowance): competition net scoring and handicap-record calculations have distinct purposes. The support article is dated 19 December 2024.
5. [England Golf match-play scenarios](https://englandgolf.freshdesk.com/support/solutions/articles/80001021985-handicap-allowances-in-various-matchplay-scenario): supplementary examples. Its search extract references rounded-CH examples; these are not used to override current Appendix C machine-precision guidance.
6. [USGA Rule 6.2a](https://www.usga.org/content/usga/home-page/handicapping/roh/Content/rules/6%202a%20Standard%20Calculation.htm): indexed primary co-governing-body cross-check for full precision; direct page retrieval returned 403. [USGA Rule 6.2b](https://www.usga.org/handicapping/roh/Content/rules/6%202b%20Calculation%20When%20Multiple%20Tees%20Are%20Used%20in%20a%20Competition.htm) was available in the indexed search extract and confirms par adjustment and the Stableford exception. [USGA implementation FAQs](https://www.usga.org/content/usga/home-page/handicapping/world-handicap-system/world-handicap-system-usga-golf-faqs.html) provide the Course Handicap formula. These are mathematical cross-checks, not substitutes for England Golf administrative policy.
7. [R&A Golf Rule 21](https://www.randa.org/en/rog/the-rules-of-golf/rule-21): Stableford points and holes without a valid score.
8. [Scottish Golf handicapping](https://www.scottishgolf.org/handicapping/): indexed current guidance announces committee flexibility from 1 April 2026. The live extracted page body was incomplete. The app therefore exposes a committee allowance setting and does not assert that England defaults constitute a Scottish competition policy.

An England Golf 2024 update PDF on static.whsplatform.englandgolf.org could not be fetched during review; it is not represented as successfully inspected. No claim is made of England Golf certification or an exhaustive review of every home-union administrative rule.

## Implemented calculations

Internal sign convention: receiving strokes is positive; a golf “plus” handicap is negative. Display reverses the sign notation for plus values.

- `CHraw = HI × Slope / 113 + CR − sum(hole pars)`.
- Displayed Course Handicap is rounded CHraw. Calculation keeps CHraw intact.
- For stroke/points: `PH = round(CHraw × allowance + parAdjustment)`.
- For absolute net stroke and match formats: `parAdjustment = player tee par − lowest field tee par`; zero in Stableford. No additional CR difference is added, as CR minus par is already in CHraw.
- For match play: form `adjusted[i] = CHraw[i] × allowance + parAdjustment[i]`, then `match strokes[i] = round(adjusted[i] − min(adjusted))`. With the same allowance for all players, this applies allowance to the full-precision difference from the low player and adds the par difference before rounding. The low player receives zero. The app does not round each player first and then subtract.
- Whole-number rounding is `floor(x + 0.5)`; exact negative halves move toward zero. Example +1.5 becomes +1.
- Positive PH strokes are allocated SI 1 upward, one per hole each circuit of 18. Negative PH gives strokes back SI 18 downward. Test checks allocation sums over signed handicaps -60 through 90.
- `netHole = grossHole − allocatedStrokes`. Stableford uses `max(0, 2 + ownHolePar − netHole)` with no upper cap.

Defaults: individual net stroke / Stableford 95%; singles match 100%; fourball Stableford 85%; fourball match 90%. A committee can select 0–100% explicitly; configurability is not a claim that every percentage is authorised in every jurisdiction. R&A Appendix C permits considering 100% for individual fields below 30. The default sample group is a social illustration, not a committee instruction.

## Result semantics and product conventions

Stroke: gross totals less allocated PH across entered holes. A full numeric card produces full gross minus full PH. Any X makes the stroke result NR, not a capped competition score. Stableford X is zero. A blank is unplayed, not a fabricated net-par/expected score.

Fourball Stableford: highest partner points on each hole. This implementation waits for both partner entries before counting a hole; X can explicitly mark a non-contributing partner. Fourball match: best valid partner net on each hole. Match proceeds through consecutive completed holes and closes when lead exceeds remaining holes. An X is treated as no valid score, losing to a valid score; both sides lacking valid scores halve the hole as an explicit social convention. The app does not adjudicate concessions or rules breaches.

Men/women are rating categories associated with a tee. There is no gender multiplier. Pars and stroke indices belong to each individual tee rating record. Tee colours do not restrict player selection.

Tied totals remain tied; no countback policy has been invented. Partial point totals and partial stroke totals are provisional and should not be compared as final results. Complete stroke cards rank above incomplete numeric cards, with NR last. These ranking and completion rules are product conventions rather than a mandatory WHS leaderboard design.

## Explicitly outside this engine

Official Handicap Index calculation (best differentials, low index, caps, exceptional score reduction), PCC, initial handicaps, net-double-bogey adjusted gross score, expected-score algorithms, 9-hole or shortened rounds, acceptable-score submission, fourball handicap-acceptance triggers, eligibility, verification, attestation and audit, penalties/disqualification, concessions, Local Rules, extra holes, withdrawals, mixed-tee committee stroke-index adjudication, official directory access and licensing.

Net double bogey is a handicap-record adjustment and must not cap stroke-play competition gross scores. This app keeps the entered competition scores; it does not produce an official adjusted gross score or recalculate the stored index. It is a deterministic scorer for the supported formats, not a full rules adjudicator.
