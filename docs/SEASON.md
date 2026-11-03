# 12-event season rules

This feature implements the user’s society competition structure, with locally calculated handicap estimates. Reviewed 3 November 2026.

## Competitions

| Event | Holes selected from each player’s own tee | Winner |
| --- | --- | --- |
| Official Stableford | All 18 | Most Stableford points |
| Best Front 9 | Holes 1–9 | Most Stableford points |
| Official Medal | All 18 | Lowest net strokes |
| Best Back 9 | Holes 10–18 | Most Stableford points |
| Best Stableford | All 18 | Most Stableford points |
| Best Par 3 | Holes with par 3 | Most Stableford points |
| Stableford - unofficial | All 18 | Most Stableford points |
| Best Par 5 | Holes with par 5 | Most Stableford points |
| SI 10 to 18 | Holes with stroke index 10–18 | Most Stableford points |
| Best Par 4 | Holes with par 4 | Most Stableford points |
| SI 1 to 9 | Holes with stroke index 1–9 | Most Stableford points |
| Captains Pick | Captain selects one of the first 11 types | Inherits selected type |

All events use the same pre-round competition index. “Official” and “unofficial” are labels and do not change scoring or trigger official WHS submission. The user confirmed that the three full-round Stableford variants are separate events with identical scoring.

Handicap allowance defaults to 95%, with an editable event setting. Hole subsets retain the full-round handicap stroke allocation; PH is not halved for a Front/Back 9 prize within an 18-hole card. Each player’s own tee determines par and SI. Subsets can therefore contain different holes when tee rating records differ. Scores are totals, not averages per eligible hole. Events with no eligible holes cannot be recorded.

For Medal, use the mixed-tee par adjustment already documented in RULES.md. For Stableford, compare point totals without a further par adjustment. Net double bogey never caps Medal competition scores: it is only used separately when computing the round differential.

## Season points

Exactly 14 players compete in each event. Place 1 earns 14 points; place 14 earns 1. If k players tie for places a through b, each receives the arithmetic mean of the points for those places. Thus tied first/second earn 13.5 each. A tie is based on competition score, not the gross card. Medal NR entries rank below numeric results and tie with other NRs. There is no countback.

Each event distributes 105 points regardless of ties; the complete season distributes 1,260. Sum all event points for Total Points. Equal season totals share rank. There are no dropped rounds or bonus points. DNS/withdrawal rules are not specified: the app requires 14 completed cards for every event and does not award fictitious points for absent players.

## Handicap progression

The starting handicap is entered as an **index**, not a course-specific playing handicap. Prior history comprises actual Score Differentials (oldest to newest), at most 20. The starting index is used for event 1 even when prior history is supplied, preserving the entered baseline. Each complete event then generates a new differential and recalculates the estimate for the next event. The app never fabricates past rounds from a starting number.

For handicap adjustment, every event needs an entire 18-hole card, even when the event prize only uses some holes. Truly unplayed holes cannot be filled with X; X means a played hole without a valid finishing score. The app does not use a proprietary expected-score algorithm for unplayed holes.

1. Calculate the full unrestricted Course Handicap from the player’s **pre-event** local index, exact tee rating, slope and par; round CH to an integer.
2. Limit each gross hole score to `par + 2 + strokes received` (or subtract strokes given back). If CH exceeds 54 and at least 4 strokes are received on a hole, limit it to par + 5. For a played hole recorded X, use this limit. All season players are assumed to enter with an established starting handicap; this is not initial-index issuance for a new golfer.
3. Sum these capped holes into adjusted gross score. Compute the 18-hole differential as `(113 / Slope) × (adjusted gross − Course Rating − PCC)`. Round to one decimal, including exact negative halves toward zero. Published PCC is entered manually, from -1 to +3, default 0; no automatic PCC is claimed.
4. Append the differential to the history; keep the most recent 20. For a full history, average the lowest 8. Shorter histories use the table below. Round the resulting estimate to one decimal and enforce this app’s -10.0 to 54.0 limits.

| Differentials available | Lowest used | Adjustment |
| --- | --- | --- |
| 0–2 | Keep entered starting index | Product fallback: insufficient history |
| 3 | 1 | −2.0 |
| 4 | 1 | −1.0 |
| 5 | 1 | 0 |
| 6 | 2 | −1.0 |
| 7–8 | 2 | 0 |
| 9–11 | 3 | 0 |
| 12–14 | 4 | 0 |
| 15–16 | 5 | 0 |
| 17–18 | 6 | 0 |
| 19 | 7 | 0 |
| 20 | 8 | 0 |

Without prior differentials, the first two rounds retain the starting index. Short-history recalculation can move sharply and should not be mistaken for a reproduction of an established player’s official history. Enter real previous differentials for meaningful established-player tracking.

This is the WHS **core averaging calculation**, not the complete WHS administrative calculation. Soft/hard caps, low-index tracking, exceptional score reductions, committee adjustments, eligibility, official score acceptance and submission are excluded. Consequently this app’s competition index can differ from an official WHS Index. It is labelled “Local estimate” in the standings. The authorised WHS service remains the source of official indices.

## Display, persistence and correction

The last column of the season table is Playing Handicap, calculated for the active course/player tee selections and next competition allowance. Changing the next course or tee changes that column. After all events, it uses the final event’s allowance/format for that display. Recorded event detail separately shows the actual PH used, differential and index before/after.

Events record in order. Snapshots preserve cards, tee ratings, course name and record time. Results replay deterministically from starting histories. Editing current course data cannot rewrite a recorded event. Undo removes the latest event and recalculates totals/indices from remaining events; repeated Undo permits correction of earlier events. Starting values/history become editable when all events are undone. Allowances, PCC and Captain’s Pick lock when their event is recorded.

Normal round edits remain a draft. “Prepare next competition” clears that draft and configures the appropriate round scoring; season snapshots remain safe. Both round and season screens use the computed competition index while the season exists. Season settings determine final captured event scoring, even if the user subsequently changes the draft round format. Saved round JSON contains the full season and restores through Import saved round. Existing v1 standalone round JSON remains supported.

## Primary references

- [England Golf: Handicap Index](https://www.englandgolf.org/handicap-index): best eight of the latest 20 differentials.
- [USGA Rule 5.2a](https://www.usga.org/content/usga/home-page/handicapping/roh/Content/rules/5%202a%20For%20Fewer%20Than%2020%20Scores.htm): shorter-history table. Retrieved as indexed primary-source text.
- [USGA Rule 5.1a](https://www.usga.org/content/usga/home-page/handicapping/roh/Content/rules/5%201a%20Calculation%20of%20a%20Score%20Differential18Hole.htm): 18-hole differential and PCC range. Retrieved as indexed primary-source text.
- [R&A Rule 3](https://www.randa.org/nb-NO/roh/the-rules-of-handicapping/rule-3): net double bogey with unrestricted rounded CH and the over-54 exception. The indexed page returned English rule text despite its locale path.
- [R&A Appendix C](https://www.randa.org/en/roh/appendices/appendix-c): handicap allowances and committee responsibility. The 14-to-1 season points and custom hole subsets are the user’s competition design, not WHS prescriptions.
