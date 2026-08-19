# SIMPLIFICATION PASS (approved items 2, 3, 4, 5, 8)

Goal: fewer screens, fewer elements, fewer choices. Remove, don't add. Keep the Mission loop, Reps, the 30-day course, tab bar (5 tabs stay), design system.

## 2. Onboarding → 2 screens
- Screen 1: H1 `WELCOME TO YOUR MISSION` (eyebrow `LET'S SET YOU UP`). Fields: `First name` (required) then the goal options (same 6 radio rows incl. Custom) under a small eyebrow `WHAT ARE YOU WORKING TOWARD?`. Button `CONTINUE` (disabled until name + goal).
- Screen 2: H1 `YOUR 30-DAY MISSION STARTS NOW.` body `For the next 30 days, don't just wear the fragrances. Give them a job. One short lesson and one real-world Mission a day.` Button `START MY MISSION` → same profile write as today (display_name, primary_goal, onboarding_completed, challenge_start_date).
- Delete the Scent Triggers screen and the S.T.A.R. screen from onboarding (Day 2 and Day 3 lessons teach them). Progress dots: 2.

## 3. Home → one question
Order, top to bottom:
1. Wordmark + DayBadge (unchanged).
2. Active-Mission banner if any (unchanged, incl. reminder state).
3. **Today card** (challenge mode): `DAY {d}` eyebrow + lesson title + `{minutes} min` + chevron → lesson. In log mode: omit.
4. H1 `WHAT DO YOU NEED TODAY?` + the three TriggerCards.
5. One compact reps line (single glass row, 4 small columns: HONOR n · COURAGE n · COMMITMENT n · COURSE n, 12px labels, 22px numerals). Remove the separate "{n} Missions completed" line.
Remove from Home: the phase/lesson copy line, the commerce card (moves: Settings already has "Get Mission Fragrances"; ALSO add a small link line at the end of the Day 2 lesson body: `Don't own the set yet? Get Mission Fragrances — $597` → /shop). Keep the "FEATURED THIS PHASE" eyebrow logic removed too (no phases now).

## 4. Declare → 3 suggestions
Keep WRITE YOUR OWN first, then `OR CHOOSE ONE` with the **first 3** suggestions per trigger from content/actionSuggestions.ts (trim the file to 3 each; keep definitions): Honor = Maintain my standards in the face of adversity / Keep my word / Take responsibility for a mistake; Courage = Face a small fear today / Say no to something I don't want to do / Make the tough decision under pressure; Commitment = Do what I planned instead of what I feel like / Finish what I started / Keep a promise I made. When the day's lesson has `missionSuggestions`, show up to 3 of those under `FROM TODAY'S LESSON` above the defaults (so max 6 rows + custom).

## 5. Check-in "Not yet" → two choices
`That's okay. The Mission isn't over.` buttons: `TRY AGAIN` (→ active) and `END MISSION` (confirm sheet as today). Remove EDIT MISSION and the inline edit field (keep `updateMissionAction` in the data layer; unused UI removed).

## 8. Log detail
Remove the `DELETE ENTRY` button and its confirm sheet (keep the DB policy; no data-layer change needed).

## Keep
Everything else as is. Update docs/BUILD_SPEC.md §10.2–10.4, §10.8, §10.10 notes briefly to reflect the new behavior (one-line edits), and COURSE_V2_SPEC §3.4. Lint/tsc/build clean; demo walkthrough: onboarding 2 steps → home shows Today card + 3 cards + reps row, no commerce card; declare shows 3 (+lesson) suggestions; check-in Not yet shows 2 buttons; log detail has no delete; zero console errors; screenshots → docs/screenshots/v2/simplified-*.png.
