# MISSION APP V1 — WEB BUILD SPEC (source of truth for the build agent)

Mobile-first web app (PWA) for Mission Fragrances. Turns the three fragrances — HONOR, COURAGE, COMMITMENT — into a behavior trigger system: SELECT → TRIGGER → ACT → REINFORCE. The app rewards the completed real-world action, never the spray. First 30 days = guided challenge; after Day 30 = permanent Mission Log.

Read this whole file before writing code. Anything not in here is out of scope for V1.

---

## 0. Ground rules

- Keep it boring and obvious. No framework experiments, no abstractions for single-use code, no speculative features.
- Premium, masculine, Apple-clean, dark. NOT gamified. No XP, streaks, badges, confetti, shame language, "confidence score".
- A Rep counts ONLY when a Mission's status becomes `completed`. Starting, spraying, reading = 0.
- The phone should get out of the way after "Start Mission".
- Privacy: action text / reflections are personal. Never log them, never send them anywhere but Supabase.
- Never commit secrets. Only `NEXT_PUBLIC_*` values that are client-safe go to the client. Service-role key ONLY in server routes.
- Copy strings from this spec are FINAL for V1 unless marked (placeholder). Do not paraphrase them.
- Every user write must have a visible error + retry state. Never silently discard a Mission action.

## 1. Stack

- **Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS v4** — scaffold with `create-next-app` (`--ts --tailwind --eslint --app --src-dir --import-alias "@/*"`).
- **Supabase**: `@supabase/supabase-js` + `@supabase/ssr` for auth (email OTP 6-digit code), Postgres, RLS.
- **Shopify Storefront API** (GraphQL via `fetch`, no SDK): `cartCreate` → `checkoutUrl` → full-page redirect.
- **PWA**: `public/manifest.webmanifest`, apple-touch-icon, `display: standalone`, theme-color. No service worker push in V1. A minimal service worker is NOT required; skip unless trivial.
- **Deploy target**: Vercel. Must `npm run build` cleanly with zero TS errors and zero ESLint errors.
- Fonts via `next/font/google`: **Bebas Neue** (display/headlines) + **Inter** (body). Load once in root layout, expose as CSS vars `--font-display`, `--font-body`.
- Icons: `lucide-react` only where truly needed (tab bar, chevrons, check). Keep icon use minimal.
- Dates: `date-fns`.
- No state library. React state + server data via small `lib/data` module. No React Query unless the agent finds it truly necessary (it isn't).

## 2. Environment variables (`.env.example` — commit this; `.env.local` — never commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server-only, used ONLY by /api/account/delete
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=     # e.g. mission-fragrances.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN= # client-safe Storefront token
NEXT_PUBLIC_SHOPIFY_MISSION_VARIANT_ID= # gid://shopify/ProductVariant/XXXX
NEXT_PUBLIC_APP_URL=                  # https://app.missionfragrances.com
NEXT_PUBLIC_DEV_TOOLS=false           # "true" enables hidden dev override (challenge day simulation)
```

### 2.1 DEMO MODE (required — credentials do not exist yet)
If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing/empty, the app runs in **demo mode**:
- No sign-in screen gating: a fake local user (`demo-user`) is used; Welcome screen still renders but its button says "ENTER DEMO" and goes straight to onboarding/home.
- Profile + missions persist in `localStorage` under keys `mission.profile` and `mission.missions`.
- A small persistent pill at the very top of the screen reads `DEMO MODE — data stored on this device` (thin, unobtrusive, gold text on dark).
- Delete Account in demo mode clears localStorage.
- Implement via a single data-access module with two backends (see §6). Screens never know which backend is active.
- Demo mode must never activate if env vars are present.

If Shopify env vars are missing, the product screen still renders with static copy and the CTA shows an inline note "Checkout not configured" instead of a broken redirect.

## 3. Project structure

```
src/
  app/
    layout.tsx                 # fonts, metadata, manifest, viewport, <AppShell>
    globals.css                # tokens + Tailwind theme + glass utilities
    page.tsx                   # router: redirects to /welcome | /onboarding | /home based on session/profile
    welcome/page.tsx           # 6.1
    verify/page.tsx            # OTP code entry (real mode only)
    onboarding/page.tsx        # 6.2 (4 steps in one client component)
    (app)/                     # authenticated + onboarded; layout renders bottom TabBar
      layout.tsx
      home/page.tsx            # 6.3
      log/page.tsx             # 6.9
      log/[id]/page.tsx        # 6.9 detail
      progress/page.tsx        # 6.10
      settings/page.tsx        # 6.12
      shop/page.tsx            # 6.13
    mission/                   # focused flow, NO tab bar, has back/close
      layout.tsx
      declare/page.tsx         # 6.4  ?trigger=courage
      trigger/page.tsx         # 6.5  (reads draft from sessionStorage)
      active/[id]/page.tsx     # 6.6
      checkin/[id]/page.tsx    # 6.7
      complete/[id]/page.tsx   # 6.8
    challenge-complete/page.tsx# 6.11
    api/account/delete/route.ts# server: verifies user JWT, deletes data + auth user with service role
    api/shopify/checkout/route.ts # server: creates cart, returns checkoutUrl (keeps token usage server-side; token is public-safe anyway)
  components/
    ui/        Button, GlassCard, Headline, Eyebrow, Field, Pill, ProgressRing, Toast, EmptyState, Spinner
    TriggerCard.tsx, TabBar.tsx, RepCounts.tsx, MissionRow.tsx, DayBadge.tsx, DemoBanner.tsx, Wordmark.tsx, BottleVisual.tsx
  content/
    triggers.ts        # names, taglines, accents
    actionSuggestions.ts
    missionBriefings.ts
    completionLines.ts
    challengeLessons.ts
    product.ts         # static product copy for shop screen
  lib/
    supabase/client.ts, server.ts, middleware.ts
    data/index.ts      # exports the active backend
    data/types.ts      # Profile, Mission, MissionDraft
    data/supabase.ts   # backend A
    data/local.ts      # backend B (demo)
    challenge.ts       # day math, phases, mode
    stats.ts           # derived reps, follow-through, etc.
    shopify.ts
    env.ts             # typed env access + isDemo(), hasShopify()
    utils.ts           # cn(), formatters
  types/               # (fold into lib/data/types.ts — don't over-split)
supabase/
  migrations/0001_init.sql
  README.md            # how to apply, how to configure OTP email template
docs/BUILD_SPEC.md     # this file
README.md
public/
  manifest.webmanifest, icons/ (placeholder generated icons 192/512 + apple-touch-icon 180), images/ (placeholders)
```

## 4. Design system

### 4.1 Reference (from brand imagery)
Near-black navy/charcoal backgrounds with soft radial glow, warm gold gradient text and CTAs, MFJ shield-and-sword crest, condensed uppercase display type, ghosted outlined "HONOR / COURAGE / COMMITMENT" background words, glass panels with hairline gold/white borders. Bottles: **Honor = silver/chrome**, **Courage = gold**, **Commitment = black/smoke with gold trim**. Feels like a $597 product, not an app.

### 4.2 Tokens (CSS variables in `globals.css`, exposed to Tailwind via `@theme`)
```
--bg-0: #07090D        /* page base */
--bg-1: #0B0E14
--bg-2: #121722        /* raised */
--bg-3: #1A2030        /* glass fill base */
--ink-0: #F5F1E8       /* warm white / cream — primary text */
--ink-1: #C9C4B8       /* secondary */
--ink-2: #8B8779       /* tertiary / placeholder */
--gold-300: #E8D28A
--gold-500: #C9A648
--gold-700: #8F6E1E
--honor: #C9CDD3       /* silver */
--honor-glow: rgba(201,205,211,.18)
--courage: #D4AF37     /* gold */
--courage-glow: rgba(212,175,55,.22)
--commitment: #050609  /* black (matches the bottle); rendered with a faint light edge */
--commitment-glow: rgba(212,175,55,.10)
--success: #7FB77E
--danger: #C96B5B
--line: rgba(245,241,232,.10)
--line-strong: rgba(245,241,232,.18)
--radius-lg: 20px; --radius-md: 14px; --radius-sm: 10px
```
- Gold gradient (text + CTA): `linear-gradient(135deg,#8F6E1E 0%,#D4AF37 45%,#E8D28A 70%,#B8912F 100%)`. Utility `.text-gold-gradient` (background-clip:text) and `.bg-gold-gradient`.
- Page background: `radial-gradient(120% 80% at 50% -10%, #1A2030 0%, #0B0E14 55%, #07090D 100%)` fixed on `body`.
- Glass: `.glass { background: linear-gradient(180deg, rgba(26,32,48,.72), rgba(18,23,34,.55)); backdrop-filter: blur(18px) saturate(120%); border:1px solid var(--line); box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35); }`
- Ghost text watermark utility `.ghost-word`: huge uppercase display text, `-webkit-text-stroke: 1px rgba(245,241,232,.08)`, transparent fill, absolute, non-interactive, clipped by container.
- Type scale: display (Bebas): h1 40–48px, h2 30–34px, big numerals 64–88px, letter-spacing .02em; body (Inter): 17px base, 15px secondary, 13px eyebrow uppercase with letter-spacing .14em. Never below 13px.
- Tap targets ≥ 48px. Buttons full-width, height 56px, radius 14px.
- Motion: 150–250ms ease-out fades/slides only. Respect `prefers-reduced-motion`.
- Layout: everything inside a centered column `max-w-[430px] w-full min-h-dvh` with `px-5`; on desktop the dark background bleeds full-bleed and the column sits centered. Safe-area padding: `padding-bottom: env(safe-area-inset-bottom)` on tab bar; `padding-top: env(safe-area-inset-top)` on top bars. Set `viewport-fit=cover`.
- Focus rings visible (gold, 2px) for keyboard users. All icon-only buttons have `aria-label`.
- Contrast: cream on bg passes AAA; gold-500 on bg-1 ≥ 4.5:1 for text ≥ 15px; use gold-300 for small gold text.

### 4.3 Components (props kept minimal)
- `Button` variants: `primary` (gold gradient bg, near-black text, subtle top highlight), `secondary` (glass, cream text, hairline border), `ghost` (text only), `danger` (outlined danger). Props: `loading`, `disabled`, `full` (default true).
- `GlassCard` — the `.glass` panel with `p-5 rounded-[20px]`; optional `accent: 'honor'|'courage'|'commitment'` adds a 2px left/top accent bar + faint matching glow.
- `TriggerCard` — large (min-h 104px) tappable card: left = `BottleVisual` (56px), middle = name (display 26px) + tagline (13px ink-1), right = chevron. Accent per trigger. Whole card is a link. Also renders `aria-label="Start a {Name} Mission"`.
- `BottleVisual` — placeholder rounded-rect "bottle" silhouette with the trigger finish (silver/gold/black gradient) and a tiny gold cap; renders `<img>` from `/images/bottle-{trigger}.png` if that file exists (feature-detect via onError fallback). This is where the real bottle art drops in later.
- `Wordmark` — text "MISSION" in Bebas with a small inline crest placeholder (simple SVG shield+sword outline in gold); swap for `/images/logo.svg` later via same onError pattern.
- `DayBadge` — pill "DAY 7 OF 30" gold-300 text on glass; after challenge: "YOUR MISSION CONTINUES".
- `RepCounts` — one compact glass row, four columns (HONOR / COURAGE / COMMITMENT / COURSE): 22px numeral + 12px label, each with its accent dot (never color alone).
- `TabBar` — glass, fixed bottom, 4 items: Home, Log, Progress, Settings; active = gold; icons + 11px labels (exception to 13px rule is NOT allowed — use 12px min).
- `Field` — label + input/textarea, glass fill, cream text, gold focus border, char counter when `maxLength` provided.
- `Toast` — bottom toast for errors with optional "Retry" action.
- `ProgressRing` — SVG ring, gold stroke, used for Day X of 30 on Progress.

## 5. Data model & security

### 5.1 `supabase/migrations/0001_init.sql`
```sql
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  primary_goal text,
  onboarding_completed boolean not null default false,
  challenge_start_date date,
  challenge_completed_at timestamptz,
  notifications_enabled boolean not null default true,
  certificate_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger text not null check (trigger in ('honor','courage','commitment')),
  action_text text not null check (char_length(action_text) between 1 and 140),
  action_category text,
  status text not null check (status in ('active','completed','ended')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  ended_at timestamptz,
  reflection text check (reflection is null or char_length(reflection) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index missions_user_started_idx on public.missions (user_id, started_at desc);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger missions_updated_at before update on public.missions for each row execute function public.set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.missions enable row level security;

create policy "profiles select own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "missions select own" on public.missions for select to authenticated using (user_id = auth.uid());
create policy "missions insert own" on public.missions for insert to authenticated with check (user_id = auth.uid());
create policy "missions update own" on public.missions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "missions delete own" on public.missions for delete to authenticated using (user_id = auth.uid());
```
No other tables. No counters. Reps are derived.

### 5.2 Auth (real mode)
- `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })` then `verifyOtp({ email, token, type: 'email' })`. `supabase/README.md` must instruct: in Supabase Auth → Email Templates → "Magic Link", set body to include `{{ .Token }}` so a 6-digit code is emailed (document exact template snippet).
- Session handled by `@supabase/ssr` cookies; `middleware.ts` refreshes session and redirects: unauthenticated → `/welcome` for any `(app)`/`mission` route; authenticated but `onboarding_completed=false` → `/onboarding`.
- Sign out in Settings.

### 5.3 Account deletion — `POST /api/account/delete`
- Reads user from the request cookies (server client). 401 if none.
- Uses a service-role admin client (server-only env) to: delete `missions` where user_id, delete `profiles`, then `auth.admin.deleteUser(id)`.
- Client then calls `signOut()` and routes to `/welcome?deleted=1` which shows "Your account has been deleted."
- If `SUPABASE_SERVICE_ROLE_KEY` is missing → 500 with message; UI shows error + retry (never pretend success).

## 6. Data layer

`lib/data/types.ts`
```ts
export type Trigger = 'honor' | 'courage' | 'commitment';
export type MissionStatus = 'active' | 'completed' | 'ended';
export interface Profile { id: string; email: string|null; display_name: string|null; primary_goal: string|null; onboarding_completed: boolean; challenge_start_date: string|null; challenge_completed_at: string|null; notifications_enabled: boolean; certificate_requested: boolean; }
export interface Mission { id: string; user_id: string; trigger: Trigger; action_text: string; action_category: string|null; status: MissionStatus; started_at: string; completed_at: string|null; ended_at: string|null; reflection: string|null; }
export interface DataBackend {
  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Profile>): Promise<Profile>;
  listMissions(): Promise<Mission[]>;              // newest first
  getMission(id: string): Promise<Mission|null>;
  getActiveMission(): Promise<Mission|null>;       // most recent status='active'
  createMission(input: { trigger: Trigger; action_text: string; action_category?: string|null }): Promise<Mission>;
  completeMission(id: string, reflection?: string|null): Promise<Mission>;  // idempotent: if already completed, return as-is
  endMission(id: string): Promise<Mission>;
  updateMissionAction(id: string, action_text: string): Promise<Mission>;
  deleteAccount(): Promise<void>;
  signOut(): Promise<void>;
}
```
`lib/data/index.ts` exports `data: DataBackend` chosen by `isDemo()`. Screens are client components that call `data.*` inside `useEffect`/handlers with loading + error states. Keep it simple; a tiny `useAsync` helper is fine.

Idempotency: `completeMission` must not double-complete on double tap — disable the button while pending AND check status server-side (`.eq('status','active')` in the update; if 0 rows, re-fetch and return current).

## 7. Content files (all copy lives here, not in screens)

`content/triggers.ts`
```ts
export const TRIGGERS = {
  honor:      { name: 'HONOR',      tagline: 'Presence · Standards · Composure',           declareHeadline: 'WHAT STANDARD ARE YOU PRACTICING RIGHT NOW?', applyLine: 'Apply Honor now.' },
  courage:    { name: 'COURAGE',    tagline: 'Action · Boldness · Move Through Hesitation', declareHeadline: 'WHAT REQUIRES COURAGE RIGHT NOW?',             applyLine: 'Apply Courage now.' },
  commitment: { name: 'COMMITMENT', tagline: 'Follow-Through · Discipline · Finish',        declareHeadline: 'WHAT ARE YOU COMMITTED TO FINISHING?',         applyLine: 'Apply Commitment now.' },
} as const;
```

`content/actionSuggestions.ts` — 5 per trigger + Custom handled by UI:
- honor: Stay calm under pressure / Be fully present / Tell the truth directly / Lead by example / Keep my standard
- courage: Make the call / Speak up / Introduce myself / Have the difficult conversation / Ask the question
- commitment: Finish the workout / Complete deep work / Finish the project / Keep the promise / Do the task I keep postponing
Shape: `{ id, trigger, text, category }` where category = slug of text.

`content/missionBriefings.ts` — shape `{ id, trigger, type:'briefing', text, audioUrl: null }`. Ship these (5 each; the file structure supports 10 — add 5 more per trigger marked `// (placeholder)` in the same voice, short, no fluff):
- honor: "Stand tall. Be present. Act like your standards matter." / "Nobody may notice the choice you're about to make. You will." / "Honor isn't about being impressive. It's about being aligned." / "Slow down. Be fully present. Do the right thing cleanly." / "Lead yourself first."
- courage: "Courage isn't the absence of hesitation. It's acting while hesitation is still there." / "You've thought enough. Take the action." / "Nervous doesn't get the vote." / "The conversation doesn't get easier while you avoid it." / "Move before your excuses reorganize."
- commitment: "You already made the decision. Stop renegotiating with yourself." / "Motivation got you started. Commitment finishes." / "Finish what you started." / "Keep the promise, especially when nobody is checking." / "The work still counts when the excitement is gone."
Selection: deterministic rotation — pick index = (number of that user's missions for that trigger) mod length, so briefings cycle instead of repeating randomly. `pickBriefing(trigger, count)`.

`content/completionLines.ts`: "Confidence is evidence. Keep building it." / "You said you would. You did." / "One rep doesn't change your life. Repetition can change how you see yourself." / "Record the win. Then move on." / "Build the evidence." — pick by (total completed) mod length.

`content/challengeLessons.ts` — one lesson per phase, shape `{ id, phase, dayMin, dayMax, title, body, featuredTrigger: Trigger|null, suggestedActions: string[] }`:
1. Days 1–3 "LEARN THE LOOP": "A Scent Trigger is a fragrance you've given a job. Select how you need to show up. Apply it. Act. Come back and record what you did. Complete your first Mission today." featured null.
2. Days 4–10 "COURAGE": "Courage is action, not the absence of fear." featured courage; suggested: Make the call. Speak up. Ask. Introduce yourself. Have the conversation.
3. Days 11–17 "HONOR": "Honor is what you do when the standard matters more than convenience." featured honor; suggested: Stay calm. Tell the truth directly. Be fully present. Lead by example. Keep a standard.
4. Days 18–24 "COMMITMENT": "Stop renegotiating with the decision you already made." featured commitment; suggested: Finish the workout. Finish the project. Complete deep work. Keep the promise. Do the postponed task.
5. Days 25–30 "BUILD YOUR SYSTEM": "Decide how Honor, Courage, and Commitment fit your life going forward. Use all three freely. The challenge ends. Your Mission Log begins." featured null.

`content/product.ts` — static copy for §6.13.

## 8. Challenge logic (`lib/challenge.ts`)
- `challengeDay(profile, now)`: if no `challenge_start_date` → treat as day 1 and (in real mode) backfill `challenge_start_date = today` once. Else `differenceInCalendarDays(now, start) + 1` using local calendar days. Clamp to `[1, 30]` for display.
- `getMode(profile, now)`: `'challenge'` if `!challenge_completed_at && rawDay <= 30`; `'completion-pending'` if `!challenge_completed_at && rawDay >= 30` (show Day-30 completion card on next return; the card is shown when rawDay >= 30, still counts as day 30 in the badge); `'log'` if `challenge_completed_at` set.
- `getPhase(day)` → lesson from `challengeLessons` by dayMin/dayMax.
- **Dev override**: when `NEXT_PUBLIC_DEV_TOOLS === 'true'`, Settings shows a "Developer" section with a select: New user / Day 1 / 5 / 10 / 15 / 20 / 25 / 30 / Post-challenge. Setting it writes `mission.devDayOverride` to localStorage (or resets profile for "New user": clears onboarding + challenge fields; "Post-challenge": sets `challenge_completed_at`). `challengeDay()` reads the override first. This section must not render at all when the flag is not `'true'`. Default `.env.example` value: `false`; document that Vercel preview can set it `true`.
- Never punish missed days. No streaks anywhere.

## 9. Derived stats (`lib/stats.ts`)
From `Mission[]`: `reps = { honor, courage, commitment }` = count status=completed per trigger; `started` = all missions; `completed`; `ended`; `followThroughRate` = completed / (completed + ended) — only show when denominator ≥ 3; `last30DaysCompleted`; `repNumberFor(mission)` = 1-based index of this completed mission among completed missions of same trigger ordered by completed_at (used for "COURAGE REP #8 COMPLETE").

## 10. Screens — exact copy & behavior

Global: back/close affordance on every non-tab screen (top-left "‹" or top-right "×", 48px). Loading = subtle inline spinner or skeleton, never a full-page blocker after first paint. Errors = Toast with Retry.

### 10.1 `/welcome`
- Wordmark centered top. Ghost words "HONOR COURAGE COMMITMENT" faint behind.
- H1: `WELCOME TO YOUR MISSION`
- Sub: `Honor. Courage. Commitment. Put them into action.`
- Real mode: email field + primary button `CONTINUE WITH EMAIL` → calls signInWithOtp → route `/verify?email=…`. Inline error text on failure. Loading state on button.
- Demo mode: primary button `ENTER DEMO`.
- Bottom: small links `Privacy` · `Terms` (href from constants `LEGAL_PRIVACY_URL`, `LEGAL_TERMS_URL` in `lib/env.ts`, default `#` with a TODO comment).
- If `?deleted=1`, show a small glass notice: `Your account has been deleted.`

### 10.2 `/verify`
- H2: `CHECK YOUR EMAIL`; body: `We sent a 6-digit code to {email}.`
- 6-digit code input (single input, `inputMode="numeric"`, `autoComplete="one-time-code"`, big display type, auto-submit at 6 digits). Buttons: `VERIFY`, ghost `Resend code` (30s cooldown), ghost `Use a different email`.
- Errors: wrong/expired code → `That code didn't work. Check it and try again, or resend.`
- On success → `/` (router decides onboarding vs home).

### 10.3 `/onboarding` (one client component, 2 steps, progress dots, back arrow from step 2+)
- A: eyebrow `LET'S SET YOU UP`, H1 `WELCOME TO YOUR MISSION`. `First name` field (stored as `display_name`), then eyebrow `WHAT ARE YOU WORKING TOWARD?` over selectable glass rows — exactly `Confidence`, `Career / Business`, `Social / Relationships`, `Health / Fitness`, `Discipline / Follow-Through`, `Custom` (Custom reveals a text field, max 60). Store `primary_goal`. Button `CONTINUE` disabled until name + goal.
- B: H1 `YOUR 30-DAY MISSION STARTS NOW.` Body `For the next 30 days, don't just wear the fragrances. Give them a job. One short lesson and one real-world Mission a day.` Button `START MY MISSION` → `updateProfile({ display_name, primary_goal, onboarding_completed: true, challenge_start_date: today (yyyy-MM-dd local) })` → `/home`. Error → toast + retry, stay on step.
- The Scent Triggers and S.T.A.R. screens are gone — the Day 2 and Day 3 lessons teach them.

### 10.4 `/home`
- Top row: `Wordmark` (small, left) + `DayBadge` (right).
- **Active Mission banner** (if one exists): glass card directly under the top row, accent by trigger: eyebrow `MISSION ACTIVE · {TRIGGER}` (`REMINDER · {TRIGGER}` once a stored reminder is due), action text (display 22px), button `CHECK IN NOW` → `/mission/checkin/{id}`, ghost `Open Mission` → `/mission/active/{id}`. Trigger cards remain usable (starting a new Mission while one is active is allowed; do not block).
- Today card (challenge mode only): eyebrow `DAY {d}` + today's lesson title + chevron → `/course/{id}`. In log mode: omit.
- H1: `WHAT DO YOU NEED TODAY?`
- Three `TriggerCard`s stacked (order: honor, courage, commitment). No phase copy, no featured eyebrow.
- Below cards: `RepCounts` as one compact glass row. Nothing else — no Missions-completed line, no commerce card (Settings has "Get Mission Fragrances"; the Day 2 lesson ends with a `/shop` link).
- Home must load fast: fetch profile + missions in parallel; render skeleton cards meanwhile.
- If mode is `completion-pending`, on mount route to `/challenge-complete` (once per session — use sessionStorage flag `mission.completionShown` so the user can navigate away and back without a loop; the card is reachable again from Progress).

### 10.5 `/mission/declare?trigger=x` (invalid/missing trigger → redirect `/home`)
- Top: close ×. Eyebrow `{TRIGGER}` with accent dot. H1 = `TRIGGERS[trigger].declareHeadline`.
- Suggestions: `WRITE YOUR OWN` row first (reveals a `Field` — placeholder `One action. Short. Specific.`, `maxLength=140`, autofocus, counter), then up to 3 rows from today's lesson under `FROM TODAY'S LESSON`, then the 3 default rows under `OR CHOOSE ONE` (radio behavior throughout).
- Button `CONTINUE` disabled until a suggestion selected or custom text trimmed length ≥ 1. On continue: store draft `{ trigger, action_text, action_category }` in `sessionStorage['mission.draft']` → `/mission/trigger`.
- Whitespace-only custom = blank; trim before save.

### 10.6 `/mission/trigger` (no draft → `/home`)
- Back ‹ (returns to declare with the draft restored).
- Big `BottleVisual` (120px) centered, ghost word of the trigger name behind, accent glow.
- Eyebrow `{TRIGGER}`; declared action in display type (`"Make the call."` — render as typed, no auto punctuation).
- Briefing (Inter 17px, ink-0, italic not required) from `pickBriefing`.
- Instruction line (gold-300, 15px, uppercase eyebrow style): `APPLY {NAME} NOW.`
- Button `START MISSION`: disabled+loading while pending; guards double tap with a ref. On success: clear draft, → `/mission/active/{id}`. On failure: toast `Couldn't start your Mission. Check your connection and try again.` with Retry (draft is preserved).

### 10.7 `/mission/active/[id]` (mission not found or not active → `/home`; if completed → `/mission/complete/{id}`)
- Close × → `/home` (Mission stays active).
- H1 `MISSION ACTIVE`. Eyebrow `{TRIGGER}` + accent. Action text display 28px.
- Instruction: `Phone down. Go do it.` (ink-1, 17px). Small line: `Started {relative time}`.
- Primary `CHECK IN NOW` → `/mission/checkin/{id}`.
- Secondary `REMIND ME LATER` → opens a small glass sheet with 4 options: `30 minutes` / `1 hour` / `3 hours` / `Tonight (8 PM)`. Choosing one stores `mission.reminder = { missionId, at: ISO }` in localStorage and shows toast `We'll flag this Mission when you're back.` (V1 has no push; the Home active-Mission banner surfaces it. Add a small note under the sheet title: `Reminders show inside the app in this version.`). If reminder time has passed when Home renders, banner eyebrow becomes `REMINDER · {TRIGGER}`.
- Nothing else on this screen. No content, no scrolling.

### 10.8 `/mission/checkin/[id]`
- H1 `DID YOU DO IT?` Action text below.
- Primary `YES — MISSION COMPLETE` → reveals `Field` textarea `What happened? (optional)` maxLength 500 + button `COMPLETE MISSION` (loading/disabled while pending; idempotent). Success → `/mission/complete/{id}`. Failure → toast + retry; the typed reflection must not be lost.
- Secondary `NOT YET` → replaces content with: `That's okay. The Mission isn't over.` and two buttons: `TRY AGAIN` (→ back to `/mission/active/{id}`) and `END MISSION` (confirm sheet: `End this Mission? It will be recorded as ended, not completed.` `END MISSION` / `Keep going` → `endMission` → `/home` with toast `Mission ended. No penalty. Start again anytime.`).
- Also clear any localStorage reminder for this mission on complete/end.

### 10.9 `/mission/complete/[id]` (must be completed, else redirect)
- Restrained success: gold ring/coin visual (simple SVG circle with gold gradient stroke and a check), 300ms fade-in. No confetti.
- H1: `{TRIGGER} REP #{n} COMPLETE`
- Block: eyebrow `YOU SAID YOU WOULD:` action text (display 26px) then `AND YOU DID.` (display, gold gradient).
- Completion line from `completionLines`.
- Buttons: `DONE` → `/home`; secondary `VIEW MY PROGRESS` → `/progress`.

### 10.10 `/log`
- H1 `MISSION LOG`. Filter chips `ALL / HONOR / COURAGE / COMMITMENT` (glass pills, active gold). List newest first of `MissionRow`: date (`MMM d` + `h:mm a`), accent dot + trigger label, action text (2-line clamp), status pill (`COMPLETED` success-tinted / `ACTIVE` gold / `ENDED` ink-2), small quote icon or `Reflection` marker if reflection exists.
- Empty: `No Missions yet.` `Start with one action today.` button `START A MISSION` → `/home`.
- Row → `/log/{id}`: trigger, action, status, started, completed/ended time, reflection (glass quote block). No editing, no delete. If status active → button `OPEN MISSION`.

### 10.11 `/progress`
Challenge mode:
- H1 `YOUR 30-DAY MISSION`; `ProgressRing` with `DAY X` inside and `of 30` under; phase title + lesson body in a GlassCard.
- Stats grid (2 cols): Honor Reps / Courage Reps / Commitment Reps / Missions Started / Missions Completed / Follow-Through Rate (only if denominator ≥ 3, as `%`).
- If day ≥ 30 and not completed: button `COMPLETE THE 30-DAY MISSION` → `/challenge-complete`.
Log mode:
- H1 `BUILD THE EVIDENCE`; stats: All-time Honor / Courage / Commitment Reps, Total completed Missions, Completed in last 30 days.
No charts.

### 10.12 `/challenge-complete` (only reachable when rawDay ≥ 30 or already completed; else `/home`)
- H1 `30-DAY MISSION COMPLETE`. Stats: Missions Started, Missions Completed, Honor / Courage / Commitment Reps.
- Copy: `You've spent 30 days turning scent into action. The challenge ends here. The Mission doesn't.`
- Primary `CONTINUE THE MISSION` → `updateProfile({ challenge_completed_at: now })` → `/home` (now log mode).
- Secondary `GET MY CERTIFICATE` → `updateProfile({ certificate_requested: true })` → button becomes disabled text `CERTIFICATE REQUESTED — we'll send it to {email}`. (Manual fulfillment in V1.)

### 10.13 `/settings`
- H1 `SETTINGS`. Sections (glass groups):
  - Profile: Name (inline editable `Field`, save on blur → `display_name`), Email (read-only).
  - Notifications: toggle `notifications_enabled` (label `Reminders`; helper `In-app reminders for active Missions.`).
  - `Get Mission Fragrances` row → `/shop`.
  - Legal & support: `Privacy Policy`, `Terms`, `Support` (mailto `SUPPORT_EMAIL` const).
  - Developer (ONLY when `NEXT_PUBLIC_DEV_TOOLS==='true'`): challenge state select per §8.
  - Account: `Sign out` (secondary), `Delete Account` (danger) → confirm sheet: title `DELETE YOUR ACCOUNT?` body `This permanently deletes your profile and every Mission you've logged. This can't be undone.` buttons `DELETE MY ACCOUNT` (danger, loading) / `Cancel`. Success → sign out → `/welcome?deleted=1`. Failure → toast `Couldn't delete your account. Please try again.` + Retry.
  - Footer: `Mission v{version}` from package.json (import JSON) — small ink-2.

### 10.14 `/shop`
- Back ‹. Eyebrow `MISSION FRAGRANCES`. H1 `THE MISSION SCENT TRIGGER SYSTEM`.
- Hero: placeholder product visual (glass panel with three `BottleVisual`s in a row + gold coin circle) — swap-in target `/images/system-black-edition.png` via same onError pattern.
- Price line: `$597` big gold numerals, sub `Black Edition`.
- Included (checkmark list): `Honor Eau de Parfum · 50ml`, `Courage Eau de Parfum · 50ml`, `Commitment Eau de Parfum · 50ml`, `Premium presentation case`, `3 travel atomizers`, `Mission challenge coin`, `The Mission app + 30-Day Mission`, `30-Day Wear-It Guarantee`.
- Positioning line: `Three Scent Triggers. One system. Give your fragrance a job.` (placeholder)
- Primary sticky-bottom `GET THE MISSION SYSTEM — $597`. On tap: `POST /api/shopify/checkout` → `{ checkoutUrl }` → `window.location.assign(checkoutUrl)`. Loading state on button. Error → toast `Couldn't open checkout. Please try again.` Shopify not configured → button disabled + note `Checkout not configured`.
- Under CTA: `Secure checkout by Shopify. Shipping and taxes calculated at checkout.`
- Do not create any order record anywhere. Do not attempt to observe completion (document as V1 limitation). Cancel/back from Shopify simply returns to this page via browser back.

### 10.15 `/api/shopify/checkout` (route handler)
- Storefront GraphQL `cartCreate` with `lines: [{ merchandiseId: VARIANT_ID, quantity: 1 }]`, API version `2025-01`, header `X-Shopify-Storefront-Access-Token`. Return `{ checkoutUrl }`. Also (best-effort) `GET` handler that fetches variant `price`, `availableForSale`, product `title` + first image, so the shop page can show live price if available — fall back to static `$597` on any error. Never block render on it.

## 11. Root router `/` and middleware
- `/`: server component; real mode: read session → no user → `/welcome`; user → load profile → `onboarding_completed ? /home : /onboarding`. Demo mode: client-side same decision from localStorage.
- Middleware (real mode only) protects `/home /log /progress /settings /shop /mission/* /onboarding /challenge-complete` and refreshes tokens per `@supabase/ssr` docs.

## 12. PWA / metadata
- `manifest.webmanifest`: name `Mission`, short_name `Mission`, `display: standalone`, `background_color: #07090D`, `theme_color: #07090D`, `start_url: /`, icons 192/512 (generate simple placeholder PNGs: dark square with gold "M" — a tiny node script using no external deps is fine, or commit generated PNGs).
- Root `metadata`: title template `%s · Mission`, `appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Mission' }`, `viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#07090D' }`, apple-touch-icon.

## 13. README.md must cover
Local setup; env vars; demo mode; Supabase setup (create project → run migration via SQL editor or `supabase db push` → set OTP email template with `{{ .Token }}` → copy URL/anon key → service role key to Vercel server env only); Shopify setup (custom app → Storefront token with `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts` scopes; find variant GID); Vercel deploy + domain; dev tools flag; two-user RLS test steps; acceptance test script (A–I adapted for web); known V1 limitations (no push reminders, checkout completion not observed, certificate manual, demo mode is device-local).

## 14. Verification the agent MUST perform before reporting done
1. `npm run lint` and `npm run build` pass with zero errors/warnings that matter.
2. `npm run dev` in demo mode; walk in the browser (mobile viewport 390×844): welcome → onboarding (4 steps) → home shows Day 1 of 30 → Courage → "Make the call" → trigger shows a Courage briefing → Start → active → close × → home shows Active banner and hides commerce card → Check in → Not yet → Try again → Check in → Yes + reflection → complete screen says `COURAGE REP #1 COMPLETE` → home shows Courage 1 rep → Log shows entry → detail shows reflection → Progress shows 1/1 → Settings dev select Day 30 → Progress shows Complete button → challenge-complete → Continue → home shows `YOUR MISSION CONTINUES` → Progress shows `BUILD THE EVIDENCE` → Shop renders with $597 and disabled CTA note → Settings → Delete → back at welcome with deleted notice.
3. Reload mid-Mission: active Mission persists (localStorage in demo).
4. Double-tap Start / Complete does not create duplicates.
5. Check desktop viewport: column centered, dark bleed, nothing broken.
6. Take screenshots of home, trigger, active, complete, shop into `docs/screenshots/` (via the browser tools if available; otherwise skip and say so).
Report exactly what was verified and anything skipped.
