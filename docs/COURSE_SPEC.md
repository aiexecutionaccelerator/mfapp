# V1.1 — DECLARE REWORK + COURSE TAB + COURSE REPS

Direction from Antonio (product owner). Read BUILD_SPEC.md §4 (design) and §10 first; this file amends it.

## 1. Declare screen rework (`/mission/declare?trigger=x`)

Layout, top to bottom:
1. Close ×, eyebrow `{TRIGGER}` with accent dot (unchanged).
2. **Headline** (per trigger, new copy — see §1.1).
3. **Definition** — 2–3 sentences under the headline, 15px ink-1 (content key `about`; already exists in `content/triggers.ts` — keep Honor text, update the others per §1.1).
4. **Custom first, prominent**: a glass row at the TOP of the list, accent-bordered (hairline gold), with a pencil icon (lucide `PenLine`), title `WRITE YOUR OWN` (display 18px) and sub-line `Tap to declare your own action` (13px ink-2). Tapping expands an inline `Field` (placeholder `One action. Short. Specific.`, max 140, autofocus, counter). This replaces the old "Custom" row at the bottom.
5. Eyebrow `OR CHOOSE ONE` (13px, ink-2) then 5 suggestion rows. **Each row has two lines**: the action (17px ink-0) and a one-line definition (13px ink-2). Radio behavior as before; selecting a suggestion collapses/clears Custom and vice-versa.
6. `CONTINUE` pinned (unchanged behavior; stores `action_category` = suggestion id or `custom`).

### 1.1 Content (`content/triggers.ts` + `content/actionSuggestions.ts`)
Change `actionSuggestions` shape to `{ id, trigger, text, definition }`.

**HONOR** — from the course lesson "The Importance of Honor".
- declareHeadline: `HOW WILL YOU BE A MAN OF HONOR TODAY?`
- about: `Honor is the gift a man gives himself — the standard he lives by. It isn't bestowed by anyone else; it's cultivated from within and measured by the quiet satisfaction of acting in line with your principles. Be true to your word. Stand up for what you believe in. Take responsibility for your actions.`
- suggestions:
  1. `Maintain my standards in the face of adversity` — `Hold the line on what you value when it would be easier to let it slide.`
  2. `Keep my word` — `Do exactly what you said you would do, when you said you would do it.`
  3. `Take responsibility for a mistake` — `Own it, say it plainly, and start making it right.`
  4. `Stand up for what I believe in` — `Voice your position even when it's unpopular or uncomfortable.`
  5. `Lead by example` — `Act the way you want the people around you to act.`

**COURAGE** — (placeholder until the course lesson text arrives; same voice)
- declareHeadline: `WHERE WILL YOU SHOW COURAGE TODAY?`
- about: `Courage is not the absence of fear. It's acting while the fear is still there — the call you've been avoiding, the thing you need to say, the room you need to walk into. Courage is built one uncomfortable action at a time.`
- suggestions:
  1. `Make the call I've been avoiding` — `The conversation doesn't get easier while you wait.`
  2. `Speak up` — `Say the thing you keep swallowing — in the meeting, at the table, to them.`
  3. `Introduce myself` — `Walk over. Say your name. Start the conversation.`
  4. `Ask for what I want` — `The raise, the date, the help, the answer. Ask directly.`
  5. `Have the difficult conversation` — `Address it face to face instead of letting it sit.`

**COMMITMENT** — (placeholder until the course lesson text arrives)
- declareHeadline: `WHAT WILL YOU FOLLOW THROUGH ON TODAY?`
- about: `Commitment is what carries you after motivation fades. It's keeping the promise you made to yourself — especially when nobody is checking — and finishing what you started. Stop renegotiating with the decision you already made.`
- suggestions:
  1. `Finish what I started` — `The project, the book, the set. Close it out today.`
  2. `Keep a promise I made` — `To someone else or to yourself. Deliver.`
  3. `Do the task I keep postponing` — `The one you've moved three times. Today.`
  4. `Complete my training` — `The workout, the run, the practice — all of it, no shortcuts.`
  5. `Protect a block of deep work` — `Phone away. One thing. Until it's done.`

Mark the Courage/Commitment blocks with `// (placeholder — replace with course lesson text)`.

## 2. Navigation: 5 tabs

Bottom tab bar becomes: **Start** (`/home`, icon `Sparkles`→ use `Target`), **Course** (`/course`, icon `Play` or `BookOpen`), **Log** (`/log`), **Progress** (`/progress`), **Settings** (`/settings`). Labels 11–12px are NOT allowed below 12px; five items at 390px is fine (each ~78px). Keep glass style. Active = gold.

## 3. Course

### 3.1 Content — `content/course.ts`
```ts
export interface Lesson { id: string; order: number; title: string; minutes: number; summary: string; body: string[]; video: { provider: 'vimeo'|'youtube'|'wistia'|'mp4'|null; id?: string; url?: string } | null; trigger: Trigger | null }
```
Ship placeholder lessons (mark `// (placeholder — real course content + video IDs to come)`):
1. `Start Here: Your Mission` — what the Scent Trigger system is; how to use this app. trigger null.
2. `What Is a Scent Trigger?` — scent + state + action. null.
3. `The Importance of Honor` — body = the Honor lesson text (paragraphs: definition, Rob Roy reference, why it matters, cultivating honor bullet list). trigger honor. video null.
4. `The Importance of Courage` — placeholder. courage.
5. `The Importance of Commitment` — placeholder. commitment.
6. `Building Your 30-Day System` — null.
`minutes` are estimates. `video: null` renders a "Video coming soon" placeholder panel; when set, render an embed (iframe for vimeo/youtube/wistia using standard embed URLs, `<video controls>` for mp4) inside a 16:9 glass frame.

### 3.2 Data
Migration `supabase/migrations/0004_course.sql`: `course_progress(user_id uuid references auth.users on delete cascade, lesson_id text not null, completed_at timestamptz not null default now(), primary key (user_id, lesson_id))`, RLS select/insert/delete own. Update `get_app_data()` to also return `course_progress` (array of `{lesson_id, completed_at}`) — `create or replace` in the same migration. Data layer: `AppSnapshot.courseProgress`, `completeLesson(lessonId)` (idempotent upsert), `uncompleteLesson(lessonId)` (not exposed in UI; keep for dev). Local (demo) backend in localStorage `mission.course`. Store patches cache.

### 3.3 Screens
- `/course` (tab): H1 `THE COURSE`; sub-line `Short lessons behind the system. Watch, then put it into action.`; a small summary row `{n} of {total} complete · {n} Course Reps`; list of lesson cards (glass): order number (gold display), title, `{minutes} min`, trigger accent dot if any, check mark if complete. Tap → `/course/[id]`.
- `/course/[id]`: back ‹ → `/course`; eyebrow `LESSON {order}`; H1 title; video frame; body paragraphs; bullet lists render as lists; bottom pinned: primary `MARK COMPLETE` (→ `completeLesson`, button becomes secondary `COMPLETED ✓` disabled-looking but still a button that says `Completed`), plus if the lesson has a trigger, a secondary `START A {TRIGGER} MISSION` → `/mission/declare?trigger=x`. "Next lesson →" ghost link at the bottom when not last.
- Completing a lesson = **+1 Course Rep**. No other rewards. Completion toast `Lesson complete. Course Rep +1.`

### 3.4 Reps everywhere
- `lib/stats.ts`: `reps.course = courseProgress.length`. `RepCounts` shows four columns: HONOR / COURAGE / COMMITMENT / COURSE (course uses gold accent dot). Keep numerals aligned; at 375px reduce numeral size so four fit.
- Home: RepCounts (4 cols). Under the trigger cards, if the user has 0 course lessons complete, show a small glass row `NEW? START WITH THE COURSE` → `/course` (hide after first completion).
- Progress (both modes): add `Course Reps` and `Lessons completed {n}/{total}` tiles. Keep `Missions Started`, `Missions Completed`, `Follow-Through Rate` (explain denominators in a 13px helper: `completed ÷ (completed + ended)`).
- Day 30 completion card and challenge-complete page: add Course Reps line.

## 4. Keep
Everything else in BUILD_SPEC/PUSH_SPEC unchanged. No points economy, no badges, no streaks — Course Reps are the same kind of evidence as the others.

## 5. Verify
Lint/build/tsc clean; demo-mode walkthrough: Declare (Honor) shows new headline/definition/custom-on-top/5 two-line suggestions; selecting custom vs suggestion toggles correctly; Course list → lesson → Mark complete → Course Rep +1 on Home/Progress; tab bar 5 items at 375/390/430 without wrap; zero console errors. Screenshots into `docs/screenshots/v1.1/`. Apply migration 0004 to live DB is NOT your job (no password) — I will.
