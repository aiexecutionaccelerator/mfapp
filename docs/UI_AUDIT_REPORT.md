# MISSION V1 — UI AUDIT REPORT

Audit executed against `docs/UI_AUDIT.md`, with `docs/BUILD_SPEC.md` §4 (design system) and §10 (screen copy/behaviour) as the law. No redesign, no new features, copy unchanged.

## Method

- App run in **demo mode** with `NEXT_PUBLIC_DEV_TOOLS=true` (`.env.local`, gitignored, not committed).
- Driven by an **isolated headless Chromium** (Playwright, installed in the agent scratchpad — not added to the repo) rather than the shared browser pane.
- State seeded directly into `localStorage` / `sessionStorage` (`mission.profile`, `mission.missions`, `mission.devDayOverride`, `mission.reminder`, `mission.draft`) via an init script, so every state is reproducible without clicking through.
- **58 screen/state combinations × 4 viewports = 232 captures per pass**, in `docs/screenshots/audit/before/` and `docs/screenshots/audit/after/`, named `{nn}-{screen}-{state}-{viewport}.png`. Viewports: `a390` (390×844), `b375` (375×667), `c430` (430×932), `d1280` (1280×800). Scrollable states additionally have a `…-b375-full.png` full-page capture, which is the evidence for "the last content is reachable on a short screen".
- Every capture was also machine-checked in-page for: horizontal overflow (`scrollWidth > innerWidth`), `<h1>` count, accessible names on interactive elements, tap-target size, font sizes below 12px, content occluded by fixed/sticky bottom bars at maximum scroll, console errors/warnings, and HTTP ≥ 400.
- **Real-mode-only screens** (`/welcome` email form, `/verify`) were captured by restarting the dev server with placeholder `NEXT_PUBLIC_SUPABASE_*` values so `isDemo()` is false.
- **Safe areas** were simulated for real via CDP `Emulation.setSafeAreaInsetsOverride` (top 47px / bottom 34px) — captures in `after/18-safearea-*.png`.
- **33 behaviour assertions** (double-tap guards, reload restore, sheet semantics, dev override, filters, routing, error toasts) were scripted and run against the fixed build.

---

## 1. Issues found and fixed

Grouped by where they were found. Every fix was re-verified visually and by the machine checks.

### Global / shared components

| # | Issue | Where it showed | Fix (file:line) | Status |
|---|---|---|---|---|
| G1 | **404 on every screen.** `BottleVisual`, `Wordmark` and the shop hero probed `/images/bottle-{trigger}.png`, `/images/logo.svg`, `/images/system-black-edition.png` to feature-detect real art. Those files do not exist, so every screen logged 1–4 console errors and 404s. | All 15 screens | New `src/lib/art.ts:1-14` registry; `src/components/BottleVisual.tsx:34-40`, `src/components/Wordmark.tsx:56-60`, `src/app/(app)/shop/page.tsx:17-22`. The drop-in contract is preserved — register the filename in `art.ts` in the same commit that adds the file. | Fixed |
| G2 | **Demo pill sat under the notch and double-counted the safe area.** Screens each added `env(safe-area-inset-top)` *below* a demo banner that had none, so with a notch the pill was under the status bar and the content was pushed down twice. The banner's height also made every demo screen 34px taller than `100dvh`, so every screen scrolled slightly at rest. | All screens, demo mode | Column owns the top safe area once: `src/components/AppShell.tsx:7-18`, `src/components/DemoBanner.tsx:3`. Screens changed from `min-h-dvh` + `env(...)` padding to `flex-1` + plain padding (12 files). | Fixed |
| G3 | **Close (×) button misaligned.** `NavAction` applied `-ml-3` for both kinds, so a right-aligned × sat 32px from the edge instead of on the 20px gutter. | declare, active, checkin, challenge-complete | `src/components/NavAction.tsx:17-21` — `-ml-3` for back, `-mr-3` for close. | Fixed |
| G4 | **Sheets were not modal.** No Escape handler, no focus trap, the page behind kept scrolling, focus was not returned on close, and the translucent `.glass` panel let the page's gold CTA read through the sheet. | Reminder sheet, End-Mission sheet, Delete-Account sheet | `src/components/ui/Sheet.tsx:26-63` (Escape, Tab trap, `body` scroll lock, focus restore), `:72` backdrop `black/60`→`black/70`, `:81` opaque panel surface, `:76` `aria-labelledby`. | Fixed |
| G5 | **Loading spinner shifted the button label** (spinner was in flow). | Every primary CTA | `src/components/ui/Button.tsx:38,47` — button `relative`, spinner `absolute left-5`. | Fixed |
| G6 | **Disabled buttons read as enabled** — 45% opacity on a gold gradient still looks like a live gold bar. | `/verify` VERIFY, `/shop` CTA, declare/onboarding CONTINUE | `src/components/ui/Button.tsx:43` — adds `grayscale-[.55]` when disabled (not when loading). | Fixed |
| G7 | **Toast Retry / dismiss were ~20×24px tap targets.** | Every error toast | `src/components/ui/Toast.tsx:57-76` — both now 44px, absorbed with negative margins so the toast height barely changes. | Fixed |
| G8 | **`mission/layout` added `pb-10` on top of each page's own `pb-10`**, guaranteeing 40px of pointless scroll on every Mission screen. | All `/mission/*` | `src/app/mission/layout.tsx:5`. | Fixed |

### Bottom CTAs (checklist: "on short screens content must scroll, CTA stays pinned, no overlap")

| # | Issue | Where | Fix | Status |
|---|---|---|---|---|
| B1 | **`VIEW MY PROGRESS` clipped off the bottom** on 375×667. | `/mission/complete` | New `src/components/ui/BottomActions.tsx` (sticky footer, own safe-area padding, top-fade scrim); `src/app/mission/complete/[id]/page.tsx:100`. | Fixed |
| B2 | **`CONTINUE` far below the fold** with 6 rows + custom field. | `/mission/declare` | `src/app/mission/declare/page.tsx:131`. | Fixed |
| B3 | **`START MISSION` below the fold** with a 140-char action. | `/mission/trigger` | `src/app/mission/trigger/page.tsx:109`. | Fixed |
| B4 | **`CONTINUE` below the fold** with the Custom goal field open (the iOS-keyboard case). | `/onboarding` step A | `src/app/onboarding/page.tsx:115,131,151,164`. | Fixed |
| B5 | Buttons in flow, not pinned; inconsistent with `/mission/active`. | `/mission/checkin`, `/mission/active`, `/challenge-complete` | `src/app/mission/checkin/[id]/page.tsx:163`, `src/app/mission/active/[id]/page.tsx:93`, `src/app/challenge-complete/page.tsx` BottomActions. | Fixed |

### `/shop`

| # | Issue | Fix | Status |
|---|---|---|---|
| S1 | **Sticky CTA permanently covered the `$597` price** and, because a sticky element still reserves its space in flow, left a ~150px dead gap at the bottom of the page. | `src/app/(app)/shop/page.tsx:105-127` — the bar is now `fixed`, constrained to the 430px column like the tab bar, sitting above the tab bar. | Fixed |
| S2 | Last list items were only reachable by scrolling past a bar with no matching content padding. | `src/app/(app)/shop/page.tsx:76` — `pb-[148px]` on `main`. Verified at max scroll on 375×667: the whole Included list, positioning line, CTA and both notes are visible and clear of the tab bar. | Fixed |

### `/welcome`

| # | Issue | Fix | Status |
|---|---|---|---|
| W1 | **Ghost words sat behind the headline, sub-copy and the deleted-account notice** (they were absolutely positioned over the whole screen at 26/38/50%). | `src/app/welcome/page.tsx:63-72` — the watermark now lives in a dedicated `flex-1 overflow-hidden` spacer between the wordmark and the content block, so it can only ever occupy empty space. | Fixed |
| W2 | **Ghost words were clipped mid-letter on the left** (`-left-4`/`-left-2`/`-left-6`) — "HONOR" rendered as "IONOR", "COMMITMENT" as "OMMITMENT". Reads as a rendering bug, not a watermark. | Same block — negative offsets removed; the stack is left-aligned to the gutter. | Fixed |
| W3 | **Enter did not submit the email** (spec §10.2 behaviour: "Enter submits code/email"). | `src/app/welcome/page.tsx:80` — wrapped in a `<form onSubmit>`; `continueWithEmail` takes the event and also guards re-entry while pending. | Fixed |
| W4 | Privacy / Terms links were ~18px tall tap targets. | `src/app/welcome/page.tsx:110-124`. | Fixed |

### `/verify` (real mode)

| # | Issue | Fix | Status |
|---|---|---|---|
| V1 | **No `<h1>`** — the only heading was an `<h2>`. | `Headline` gained an `as` prop (`src/components/ui/Headline.tsx:4-26`): `level` is now the visual size, `as` is the tag (default `h1`). The spec's "H2: CHECK YOUR EMAIL" sizing is unchanged. | Fixed |
| V2 | **Enter did not submit the code.** | `src/app/verify/page.tsx:83-88` — form wrapper; auto-submit at 6 digits still works. | Fixed |
| V3 | Digits were optically off-centre — `tracking-[0.3em]` adds a trailing gap after the last digit. | `src/app/verify/page.tsx:100` — `indent-[0.3em]` compensates. | Fixed |

### `/home`

| # | Issue | Fix | Status |
|---|---|---|---|
| H1 | **Layout jump on load** — skeleton cards were `h-[104px]` but a loaded `TriggerCard` is 144px (104px body + 2×20px `GlassCard` padding). | `src/app/(app)/home/page.tsx:32`. Verified: skeleton 144px vs loaded 146px. | Fixed |

### `/log` and `/log/[id]`

| # | Issue | Fix | Status |
|---|---|---|---|
| L1 | **Filter chips were 30px tall tap targets** (spec §4.2: ≥48px). | `src/app/(app)/log/page.tsx:53-59` — 48px hit area around the unchanged 30px pill; also added `aria-pressed`. | Fixed |
| L2 | **No `<h1>` on the detail screen.** | Now `h1` via the `Headline` `as` default; `src/app/(app)/log/[id]/page.tsx:59`. | Fixed |
| L3 | A 140-char action could push the display headline past the container on narrow viewports. | `src/app/(app)/log/[id]/page.tsx:59` — `break-words`. | Fixed |

### `/mission/trigger`, `/mission/checkin`

| # | Issue | Fix | Status |
|---|---|---|---|
| M1 | **No `<h1>` on `/mission/trigger`** — the declared action was a `<p>`. | `src/app/mission/trigger/page.tsx:98` — same classes, now `h1`. Visually identical. | Fixed |
| M2 | **No `<h1>` in the checkin NOT-YET / EDIT views** — the `DID YOU DO IT?` h1 is replaced in those views. | `src/app/mission/checkin/[id]/page.tsx:124` — "That's okay. The Mission isn't over." is the `h1`. Visually identical. | Fixed |

### `/settings`

| # | Issue | Fix | Status |
|---|---|---|---|
| T1 | **Reminders toggle was a 56×32 tap target.** | `src/app/(app)/settings/page.tsx:212-236` — 48px hit area wrapping the unchanged 32px track. | Fixed |
| T2 | **Legal links were top-aligned inside their 48px boxes**, producing visibly uneven gaps between Privacy Policy / Terms / Support. | `src/app/(app)/settings/page.tsx:248-264` — `block min-h-12` → `flex min-h-12 items-center`. | Fixed |

---

## 2. Checked and deliberately left alone

- **Ghost word on `/mission/trigger` is clipped left and right at 375px.** It is a `.ghost-word` watermark inside an `overflow-hidden` container — the spec explicitly says it is "clipped by container". Symmetric clipping reads as a bleed, not a bug. Unlike the welcome-screen case, it is not missing a single leading letter and it is not behind readable text.
- **The welcome watermark clips at the top in real mode**, where the taller email form shrinks the spacer. Clipping is the specified behaviour and the words are never behind text.
- **Large empty gap between the briefing block and the pinned CTA on `/mission/trigger` at 430×932 and on the checkin NOT-YET view.** Called out in the brief as acceptable; the bottle block is vertically balanced and the brief forbids adding content.
- **`COMPLETE THE 30-DAY MISSION` on `/progress` sits under the tab bar at rest** on viewports where the content happens to end in the last 60px. The `(app)` wrapper's bottom padding (92px + safe area) exceeds the 60px bar, so the button always scrolls clear — verified in `after/12-progress-day30-b375-full.png`. This is ordinary scrolling-screen behaviour and the checklist rule ("bottom padding ≥ bar height + safe area") is satisfied. Pinning it would mean adding a second fixed bar above the tab bar on a tab screen, which is a redesign.
- **`$597` on `/shop` sits at the fold under the CTA scrim on 375×667 only.** On 390/430/1280 it is fully clear. On the SE the header + hero simply fill the space above a pinned CTA; the scrim fades rather than hard-cuts, and one scroll reveals it.
- **Toast is offset 96px from the bottom on Mission screens that have no tab bar.** It clears the pinned CTA there, so the offset is doing useful work on both kinds of screen; a per-screen offset would be more machinery than the problem is worth.
- **5-item stat grids on `/progress` (log mode) and `/challenge-complete` leave the last cell half-width.** Grid rows equalise within a row, which is what the checklist asks for; a 5th full-width cell would be a design change.
- **Tab bar labels are 12px.** Spec §4.3 sets 12px as the explicit minimum for the tab bar.
- **`middleware.ts` → `proxy.ts` deprecation warning** on dev/build. Owned by a separate task, per the brief. Not touched.

---

## 3. Not tested, and why

- **Real Supabase auth flows.** `/welcome` (real mode) and `/verify` were rendered and audited with placeholder `NEXT_PUBLIC_SUPABASE_*` values so `isDemo()` is false, which covers all layout/a11y/behaviour concerns. The actual OTP round-trip cannot run without real credentials, so the *success* path of `signInWithOtp` / `verifyOtp` is unverified. The **error** path is verified (unresolvable host → the spec error string renders).
- **`/shop` with Shopify configured (enabled CTA).** Requires real Storefront credentials. The disabled state, the `Checkout not configured` note and the error toast path are all verified; the enabled button is the same `Button` component in its default state, exercised on every other screen.
- **`POST /api/account/delete` against a real service-role key.** Demo-mode deletion (clears `localStorage`, routes to `/welcome?deleted=1` with the notice) is verified.
- **Real iOS Safari.** Safe areas were simulated through CDP with genuine `env(safe-area-inset-*)` values (47/34px) rather than a CSS approximation, and `100dvh` is used throughout (no `100vh` anywhere in the codebase), but on-device Safari behaviour — in particular the visual-viewport shift when the keyboard opens — is not reproducible headlessly.
- **Push reminders.** Out of scope for V1 by spec §10.7.

---

## 4. Verification results

### Machine checks — 232 captures × the full checklist

| Check | Before | After |
|---|---|---|
| Horizontal overflow at any viewport | 0 | 0 |
| Console errors / warnings | **68 captures** (missing-art 404s) | **0** |
| HTTP ≥ 400 | **5 distinct URLs, 68 captures** | **0** |
| Screens with ≠ 1 `<h1>` | **40 captures** (10 states) | 0 |
| Interactive elements < 44px | **44 captures** (7 kinds) | 0 |
| Text below 12px | 0 | 0 |
| Content occluded by a bottom bar at max scroll | 0 | 0 |
| Interactive elements with no accessible name | 0 | 0 |

The one remaining line in the after-summary is `14-settings-deleteconfirm → COVERED@BOTTOM`, which is a **false positive**: the detector treats the delete-confirm sheet as a bottom bar and then reports the sheet's own buttons as being behind it. Confirmed visually in `after/14-settings-deleteconfirm-b375.png` — the sheet's buttons are correctly inside the sheet with safe-area bottom padding.

### Behaviour suite — 33/33 pass

Double-tap guard on START (exactly 1 Mission) and on COMPLETE (idempotent); reload on `/mission/active/[id]` restores; `/` routes an onboarded demo user to `/home` with no flash of `/welcome`; sheet locks background scroll, moves focus inside, is a labelled `aria-modal` dialog, closes on Escape and on backdrop click and restores focus; passed reminder shows `REMINDER · COURAGE`; commerce card hidden while a Mission is active; log filter chips filter with correct counts; Settings name saves on blur; Reminders toggle persists across reload; dev override updates the Day badge **and** the phase; Day 30 + not completed routes Home to `/challenge-complete` per spec §10.4; Post-challenge switches Home to log mode; dev "New user" resets the profile and routes to `/onboarding`; delete routes to `/welcome?deleted=1` with the notice; declare tab order is Close → suggestions; focus ring visible (3px); back/close destinations correct on declare, active, checkin, log detail and shop.

Error states (`docs/screenshots/audit/after/16-toast-*.png`) were forced by making `localStorage.setItem` throw for the missions key. Both toasts render the exact spec copy with a Retry action; the Mission draft survives a failed START and the typed reflection survives a failed COMPLETE.

### Accessibility

- Contrast measured against `#0B0E14`: lowest ratio in the UI is **5.37:1** (`--ink-2` at 13px), above AA. `--gold-500` is never used as a text colour; small gold text is `--gold-300` at 12.89:1.
- `prefers-reduced-motion: reduce` collapses animation and transition durations to ~0 (measured on the complete screen's `fade-in` and on a Button).
- Trigger cards carry `aria-label="Start a Honor Mission"` etc.; status pills carry text, not colour alone; the progress ring is `role="img"` with `Day X of 30`.

### Safe areas (simulated 47px top / 34px bottom)

Demo pill `padding-top: 55px` (clears the notch); tab bar `padding-bottom: 34px` and flush to the viewport bottom; sheets `padding-bottom: 54px`; pinned CTAs `padding-bottom: 50px`; first content lands at y≈87–95px. Captures in `after/18-safearea-*.png`.

### Lint / build

- `npx eslint .` → **clean, exit 0** (excluding `.claude/**`, see note below).
- `npm run build` → **clean**: compiled, TypeScript passed, 16/16 static pages generated, zero errors. The only warning is the pre-existing `middleware` → `proxy` deprecation, which belongs to a separate task.
- `npx tsc --noEmit` → clean.

> **Note on `npm run lint` in this working copy.** A concurrent session's git worktree at `.claude/worktrees/…` contains its own `.next/` build output. That path is gitignored but not eslint-ignored, so a bare `npm run lint` in *this* checkout lints ~700 generated files and reports thousands of errors from them. It does not exist in a clean checkout, and `npx eslint . --ignore-pattern ".claude/**"` exits 0 with no output. Adding `".claude/**"` to `eslint.config.mjs` would fix it permanently, but that file has uncommitted edits from the concurrent Cloudflare task, so it was left untouched.

---

## 5. Screens × states × viewports covered

All at `a390` / `b375` / `c430` / `d1280`.

| # | Route | States captured |
|---|---|---|
| 01 | `/welcome` | default, `?deleted=1`, real-mode, real-mode with email typed |
| 02 | `/verify` | default, error, resend cooldown |
| 03 | `/onboarding` | A empty, A selected, A custom open, B, C, D |
| 04 | `/home` | Day 1 no missions, active mission, reminder passed, with reps, Day 5 featured trigger, log mode |
| 05 | `/mission/declare` | honor, courage, commitment, suggestion selected, custom empty (CTA disabled), custom at 140 chars, very long single word |
| 06 | `/mission/trigger` | honor, courage, commitment, 140-char action |
| 07 | `/mission/active` | default, reminder sheet open, long action |
| 08 | `/mission/checkin` | default, YES empty, YES at 500 chars, NOT YET, EDIT MISSION, END MISSION confirm, long action |
| 09 | `/mission/complete` | rep #1, rep #12, long action |
| 10 | `/log` | empty, 7 mixed statuses, each of the 4 filter chips |
| 11 | `/log/[id]` | completed with reflection, active (OPEN MISSION), ended |
| 12 | `/progress` | Day 1, Day 15 with follow-through, Day 30 with Complete button, log mode |
| 13 | `/challenge-complete` | default, certificate requested |
| 14 | `/settings` | default, name being edited, developer section, delete confirm sheet |
| 15 | `/shop` | default (Shopify not configured), scrolled to bottom |
| 16 | Error toasts | forced failure on START and on COMPLETE (`a390`) |
| 17 | Skeleton | `/home` under 20× CPU throttling (`a390`) |
| 18 | Safe areas | home, trigger, shop, active + sheet at 47/34px insets (`a390`) |

The 13 top-level `docs/screenshots/*.png` were regenerated from the fixed build at their original filenames and dimensions (390×844 @2× mobile, 1280×800 desktop).
