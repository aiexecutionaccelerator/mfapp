# COURSE V2 — SELF-CONTAINED, 30 DAYS, ONE SYSTEM WITH MISSIONS

Approved by Antonio (product owner). Supersedes COURSE_SPEC.md §3 and the link-out model. Read docs/COURSE_QC.md (context + decisions) and docs/BUILD_SPEC.md §4/§10 (design + screens). Source data: `docs/course-source/skool-lessons.json` (authoritative text, 30 lessons, YouTube IDs, images) and `docs/course-source/academy-lessons.json` (structured action-task prompts per lesson; same lessons, older order — match by title).

## 1. Content model — `src/content/course.ts` (generated once from the JSON, then hand-edited; commit the result, not a runtime loader)

```ts
export type Trigger = 'honor'|'courage'|'commitment';
export interface LessonPrompt { id: string; kind: 'text' | 'commit' | 'check'; label: string; placeholder?: string; minWords?: number }
export interface Lesson {
  day: number;                 // 1..30 = order in Skool
  id: string;                  // slug from title (e.g. 'the-importance-of-honor')
  module: number; moduleTitle: string;   // 1 Quick Start · 2 Legacy & Core Values · 3 The Man You Know Yourself To Be · 4 Laws Of Men Who Get Sh*t Done · 5 Forge Your Vivid Vision
  title: string;
  youtubeId: string | null;     // 26 lessons have one (see QC doc list); 4,28,29,30 null
  minutes: number | null;       // from videoLenMs
  trigger: Trigger | null;      // 7 honor, 8 courage, 9 commitment, else null
  body: string;                 // markdown (## headings, **bold**, - lists, 1. lists, ![image](url), [text](url))
  prompts: LessonPrompt[];      // in-app responses (see §1.2)
  missionSuggestions?: string[];// Module 3 "inspiration" lists (days 12–18) → Declare suggestions that day
  visionSection?: 'reputation'|'relationships'|'career'|'health'|'wealth'|'lifestyle'|'legacy'|'smart'; // days 12–18 + 26, feeds Vivid Vision
}
export const MODULES: { number: number; title: string; days: [number, number] }[]
export const LESSONS: Lesson[]; export function lessonForDay(day): Lesson|undefined
```

### 1.1 Body clean-up rules (apply to every lesson; keep Antonio's voice intact otherwise)
Remove: "**NOTE**: Click the check icon (✔️)…" blocks; "**NOTES:** If you ever feel anything … too personal … Skool chat…" + "Antonio's Skool Profile: Click Here" lines; "Post inside the Community Tab with #… " instructions (the action becomes a Mission/response — see §1.2); "lifetime member of my exclusive Academy"; "final lesson of Module 1", "In Module 2/3…", "Great job getting through Module 3", "Congrats on completing the first two modules" navigation sentences; any "MF Points". Day 4: remove the sentence promising "a special gift from the founder" (leave a `// TODO(antonio): restore gift sentence if the gift is real` comment in the TS). Day 1: body is empty in source — write: "Welcome to your Mission. Over the next 30 days you'll learn the system behind Honor, Courage, and Commitment — one short lesson and one real-world Mission a day. Watch the video, then mark the lesson complete." Day 27–30 (Vivid Vision): rewrite the "reach out to us / we'll build it in 72h / check your email" mechanics to the in-app flow in §4; keep the motivational copy. Keep Amazon links (Day 11) and all images (download the 10 image URLs into `public/images/course/` and reference locally; the Day 30 Skool asset too).

### 1.2 Prompts (from academy-lessons.json `tasks` + Skool "Action Tasks" lists)
- `text` prompts = every ESSAY_RESPONSE (e.g. day 6 eulogy; 7/8/9 "Give three specific examples…"; 12–18 the four vision prompts: describe 3-year vision / steps / obstacles / one courageous action; 20–26 single prompts; 28 "tweaks to your Vivid Vision" → becomes the editable vision page instead, see §4).
- `commit` prompts = "I commit to…" checkboxes (days 4, 5, 19) → single tap, stored as answer 'yes'.
- `check` prompts = physical to-dos (day 10 "My shrine is set up", 11 "Ordered frame and markers", 29 "Scheduled my 3-year review date" + "Printed and framed my Vivid Vision", 30 same) → checkbox, stored 'yes'.
- The "Which Scent Trigger did you use today?" / "Today, I'll take one small courageous action…" items are NOT prompts — they are the **Today's Mission** CTA (§3.3).
- Each prompt id is stable: `${lessonId}:${n}`.

## 2. Data — migration `supabase/migrations/0005_lesson_responses.sql`
`lesson_responses(user_id uuid references auth.users on delete cascade, lesson_id text not null, prompt_id text not null, answer text not null check (char_length(answer) <= 4000), updated_at timestamptz not null default now(), primary key (user_id, lesson_id, prompt_id))` + RLS select/insert/update/delete own + `create or replace function public.get_app_data()` returning `{ profile, missions, course_progress, lesson_responses }`. Data layer: `saveLessonResponse(lessonId, promptId, answer)` (upsert), snapshot `lessonResponses`, local backend in localStorage `mission.lessonResponses`. Store patches cache. Private like reflections — never logged.

## 3. Screens

### 3.1 Course tab `/course`
H1 `THE COURSE`. Sub `One lesson a day for 30 days. Watch, reflect, then take today's Mission.` Summary `{n} of 30 complete · {n} Course Reps`. Then a **Next up** card (glass, gold border): eyebrow `NEXT UP`, `DAY {n} · {title}` + `{minutes} min` + button `OPEN LESSON`, where the lesson is the first incomplete one (progress, not calendar); once all 30 are complete the card reads `COURSE COMPLETE` / `All 30 lessons done.` and opens the Vivid Vision. Then modules as sections (eyebrow `MODULE {n}` + title), rows: `DAY {day}` small gold label, title, minutes, trigger dot, check if complete. The course runs in order: a lesson unlocks when the one before it is complete — locked rows show a lock and a `Complete the previous lesson first.` toast instead of navigating. No points, no Academy link anywhere. Remove the Settings "Academy ↗" row and `ACADEMY_URL`.

### 3.2 Lesson page `/course/[id]`
Back ‹. H1 title (no eyebrow). **Video**: 16:9 glass frame with `<iframe src="https://www.youtube-nocookie.com/embed/{id}?rel=0&modestbranding=1&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" title={title}>`; poster = `https://i.ytimg.com/vi/{id}/hqdefault.jpg` shown until the user taps play (click-to-load facade keeps the page light); lessons without video show no frame. **Body**: markdown renderer (tiny, in-repo: headings, bold, paragraphs, bullet/numbered lists, images `max-w-full rounded-[14px]`, links open in new tab). **Reflect** section (if prompts): each `text` prompt = label + textarea (autosave on blur + 800ms debounce, 4000 max, shows "Saved"), `commit`/`check` = glass row with checkbox. Exactly two CTAs: **MARK COMPLETE** primary (→ Course Rep +1, toast `Lesson complete. Course Rep +1.`) then `Completed` state, and secondary `NEXT LESSON →`, disabled with the helper `Mark this lesson complete to continue` until this lesson is done. No Today's Mission card. For `visionSection` lessons also show a link `View my Vivid Vision so far →` (§4).

### 3.3 Declare integration
`/mission/declare?trigger=x&day=N` (nothing links here from the lessons any more; the support stays): if lesson N has `missionSuggestions`, show them under an eyebrow `FROM TODAY'S LESSON` **above** the default suggestions (custom still first). Cap at 6 shown. Store `action_category = 'lesson:{day}'` when chosen.

### 3.4 Home
Replace the phase/lesson line with a **Next up** row under the Day badge (and under the active banner): `NEXT UP · DAY {n}` + the first incomplete lesson's title → `/course/{id}` (challenge mode only). Keep trigger cards, RepCounts (now one compact 4-column row), active banner. Remove the "NEW? START WITH THE COURSE" row (Today row replaces it) and the commerce card (see SIMPLIFY_SPEC §3).

### 3.5 S.T.A.R. and the loop rename
- `content/challengeLessons.ts`: replace the 5 invented phases with the 5 course modules (day ranges above) — title + one-line purpose from the module; `featuredTrigger` null except Module 2 (show all three). Home/Progress use these.
- Onboarding screen C → eyebrow `THE RITUAL`, H1 `S.T.A.R.`, rows: `S — Select: the value you want to embody. Honor, Courage, or Commitment.` `T — Take Action: apply the Scent Trigger.` `A — Anchor: close your eyes, recall a moment you lived that value. 5–15 seconds.` `R — Repeat: daily, for at least two months.` (copy from lesson 3).
- Trigger screen (`/mission/trigger`): after the briefing add an **Anchor** line in gold-300 eyebrow style: `ANCHOR: CLOSE YOUR EYES. RECALL A MOMENT YOU WERE {VALUE}. 5–15 SECONDS.` above `APPLY {NAME} NOW.`
- Anywhere the brief's "SELECT → TRIGGER → ACT → REINFORCE" appears (Privacy/Terms pages, README, welcome copy), change to `Declare → Trigger → Act → Record`. Do NOT touch the Mission screens' behavior.

## 4. Vivid Vision — `/course/vivid-vision`
Compiled from stored responses: sections Reputation, Relationships, Career & Business, Health, Wealth, Lifestyle, Social Impact & Legacy (each: "In three years…" = the *describe* answer, "Steps" = steps answer, "Obstacles" = obstacles answer) + "SMART goal" (day 26). Empty sections show `Not written yet — Day {n}` linking to that lesson. H1 `{FirstName}'S VIVID VISION` (display_name or "MY"). Each section editable inline (saves back to the same response ids). Buttons: `SAVE AS PDF / PRINT` (window.print with a print stylesheet: white background, black text, wordmark, date), `SEND TO ANTONIO` (mailto:antonio@missionfragrances.com, subject `My Vivid Vision — {name}`, body = compiled plain text; helper `Optional. Antonio's team can refine it with you.`), `ADD 3-YEAR REVIEW TO CALENDAR` (download a generated .ics dated today+3y, title "Review my Vivid Vision"). Day 27 lesson's CTA = `BUILD MY VIVID VISION` → this page. Day 28 = review/refine (page + the 80/20 & Essentialism copy). Day 29/30 = print/frame/share checklist + Share button (Web Share API if available else mailto). No AI image in V1 (mention in README as a team deliverable).

## 5. Remove / keep
Remove: link-out buttons, ACADEMY_URL, Settings Academy row, `points` field, "NEW? START WITH THE COURSE". Keep: Course Reps, RepCounts, everything in PUSH_SPEC / BUILD_SPEC otherwise.

## 6. Verify
Lint/tsc/build clean. Demo-mode walkthrough in isolated headless Chromium (Playwright in the scratchpad): Course tab shows Today card for Day 1; open Day 7 lesson → video facade renders with poster, body renders headings/lists, prompt autosaves (reload keeps it), Mark complete → Course Rep +1, START A MISSION → declare with honor preselected; Day 12 declare shows `FROM TODAY'S LESSON` suggestions; Vivid Vision page compiles after answering Day 12 prompts; print stylesheet applies; onboarding shows S.T.A.R.; Trigger screen shows Anchor line; Home shows Today row; dev override Day 30 → Today card says pick any lesson; zero console errors; 375/390/430 widths. Screenshots → `docs/screenshots/v2/`. Migration 0005 is NOT applied by you.
