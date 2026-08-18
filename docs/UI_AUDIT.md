# MISSION V1 — FULL UI AUDIT BRIEF

Goal: every screen, every state, screenshotted, audited, fixed, re-screenshotted. Output is a polished mobile-first UI with no alignment/spacing/overflow bugs, plus an audit report. Design rules in `docs/BUILD_SPEC.md` §4 remain the law; when this file and that one conflict, this file wins for visual polish details.

## 0. Method

1. Run the app in demo mode with `NEXT_PUBLIC_DEV_TOOLS=true` (`.env.local`).
2. Drive a real browser. Prefer an isolated headless Chromium via CDP/Playwright from the scratchpad (the shared browser pane may be in use). Viewports to test EVERY screen at:
   - **A: 390×844** (iPhone 14/15) — primary
   - **B: 375×667** (iPhone SE — short screen; the one that reveals cut-off CTAs)
   - **C: 430×932** (Pro Max)
   - **D: 1280×800** desktop (column centered, background bleeds, nothing stretched)
   Also test A with iOS-style safe areas simulated: add `env(safe-area-inset-bottom)` fallback check by temporarily forcing `--sat: 47px / --sab: 34px` in devtools OR by injecting a CSS override in the harness; verify fixed bars/CTAs respect it.
3. For each screen+state: capture `docs/screenshots/audit/before/{nn}-{screen}-{state}-{viewport}.png`, list issues, fix in code, capture `after/` with same name. Keep the earlier 13 top-level screenshots but regenerate them at the end from the fixed build (same filenames).
4. Do NOT redesign. Fix bugs, alignment, spacing, consistency, overflow, states. No new features. Copy is frozen (BUILD_SPEC §10) unless a string is literally broken/truncated — then fix the layout, not the string.
5. Commit at the end: `UI audit: fixes across all screens`. Do not commit `.env.local`.

## 1. Screens × states to capture (minimum)

| # | Route | States |
|---|---|---|
| 01 | /welcome | default; `?deleted=1`; (real-mode variant: mock `isDemo=false` visually is not required — but ensure the email form layout is sane by temporarily rendering it; note if skipped) |
| 02 | /verify | default; error state; resend cooldown state (real-mode-only screen: render it directly at the URL with `?email=test@x.com`) |
| 03 | /onboarding | step A (nothing selected / selected / Custom open with keyboard-height simulated), B, C, D |
| 04 | /home | Day 1 no missions; with active mission banner (commerce card hidden); with reminder-passed banner; with 3+ completed reps; featured-trigger phase (Day 5); log mode (post-challenge) |
| 05 | /mission/declare | honor/courage/commitment; suggestion selected; Custom open empty (button disabled); Custom with 140-char text (counter at limit); very long single word |
| 06 | /mission/trigger | each trigger; long declared action (140 chars) |
| 07 | /mission/active | default; reminder sheet open; long action text |
| 08 | /mission/checkin | default; YES revealed with textarea (empty and 500 chars); NOT YET view; EDIT MISSION inline; END MISSION confirm sheet |
| 09 | /mission/complete | rep #1; rep #12; long action text |
| 10 | /log | empty; list with 6+ mixed statuses (completed w/ and w/o reflection, active, ended); each filter chip; long action text 2-line clamp |
| 11 | /log/[id] | completed with reflection; active (OPEN MISSION button); ended |
| 12 | /progress | challenge mode Day 1; Day 15 with follow-through visible (≥3 denominators); Day 30 with Complete button; log mode |
| 13 | /challenge-complete | default; certificate requested state |
| 14 | /settings | default; name being edited; developer section; delete confirm sheet |
| 15 | /shop | default (Shopify not configured); scrolled to bottom (sticky CTA over content); with a fake configured state if trivial (button enabled) |
| 16 | Toast/error | force a failure (e.g., temporarily throw in local backend) to see the error toast + Retry on trigger START and on COMPLETE; then revert |
| 17 | Skeleton/loading | home skeleton state (throttle or add artificial delay temporarily) |

Seed data quickly by writing to localStorage in the harness (`mission.profile`, `mission.missions`) rather than clicking through repeatedly. Use the dev override (`mission.devDayOverride`) for day states.

## 2. Checklist — apply to every screenshot

**Layout & alignment**
- Consistent horizontal padding (20px) on all screens; content never touches edges; nothing horizontally scrolls at any viewport (check `document.documentElement.scrollWidth <= innerWidth`).
- Vertical rhythm: consistent spacing scale (8/12/16/24/32). Headline→body→cards spacing consistent across screens.
- Fixed/sticky bottom elements (tab bar, primary CTAs on trigger/checkin/complete/shop, sheets) never cover content: scrollable content has bottom padding ≥ bar height + safe area; on 375×667 the last content is reachable.
- Full-page flows (mission/*) with bottom CTAs: on short screens content must scroll, CTA stays pinned, no overlap.
- Top bars: back/close buttons 48×48 hit area, aligned to the 20px gutter, vertically aligned with the wordmark/day badge; safe-area-top respected.
- Cards: equal heights where in a group (trigger cards), consistent radius (20/14/10), consistent border/glass treatment; accent bar/glow doesn't clip outside radius.
- Text: no orphan single letters wrapping, no clipped descenders on Bebas headlines (check line-height), no unintended all-caps from CSS on sentence-case strings, ellipsis/clamp works for long action text (2 lines) in rows, wraps (not overflows) on detail screens.
- Ghost words: clipped inside their container, never causing overflow, never over readable text.
- Icons: consistent size (20/24), optically centered in buttons/pills; chevrons vertically centered.
- Numerals: Bebas big numbers baseline-aligned in RepCounts / stats grid; equal column widths.
- Tab bar: 4 items equal width, icon+label centered, active gold, labels ≥12px, no wrap.
- Sheets/dialogs: backdrop dims page, sheet respects safe-area-bottom, buttons full-width, focus trapped, Escape/backdrop closes; page underneath doesn't scroll while open.
- Buttons: 56px height, consistent radius, loading spinner doesn't shift width, disabled state visibly disabled (not just faint), gradient direction consistent.
- Inputs: 48–56px, gold focus border, placeholder ink-2, counter aligned right and updates, iOS zoom prevented (`font-size ≥ 16px` on inputs).
- Desktop: column max 430px centered; no element escapes column; body background bleeds full-bleed; sticky bars constrained to column width (not full-window).

**Visual quality**
- Contrast: cream/ink-1 on backgrounds ≥ 4.5:1 for body; gold-500 not used for text under 15px (use gold-300).
- Glass panels look like glass (blur visible over gradient), borders hairline not chunky; no double borders.
- Consistent gold: same gradient on all primary CTAs and gradient text.
- Trigger accents: honor silver, courage gold, commitment smoke+gold trim used consistently (dot, accent bar, bottle) across Home, Declare, Trigger, Active, Checkin, Complete, Log rows, Log detail, Progress labels.
- Empty states centered, restrained, with the spec copy.
- No emoji. No confetti. No layout jump on data load (skeleton dimensions ≈ real dimensions).

**Behavior (verify while there)**
- Back/close on every non-tab screen goes where §10 says.
- Double-tap guards on START / COMPLETE / END / DELETE.
- Reload on any route restores correctly (no flash of wrong screen > 300ms; if there's a flash of /welcome before /home in demo mode, fix by rendering nothing until profile check resolves).
- Reminder passed → Home banner eyebrow `REMINDER · {TRIGGER}`.
- Commerce card hidden while an active mission exists.
- Log filter chips filter; counts correct.
- Progress follow-through hidden below 3 denominators.
- Dev override select changes Day badge, phase, progress ring, and completion routing; "New user" resets to onboarding; "Post-challenge" → log mode.
- Settings name saves on blur; toggle persists.
- Delete → welcome?deleted=1 with notice.
- Keyboard: tab order sensible, focus rings visible, Enter submits code/email.

**Accessibility**
- Every icon-only button has aria-label; trigger cards have `aria-label="Start a X Mission"`; sheets have `role="dialog"` + `aria-modal` + labelled title; status pills carry text (not color only).
- Headings hierarchy (one h1 per screen).
- `prefers-reduced-motion` disables transitions.

**Console/network**
- Zero console errors/warnings on any screen (hydration warnings included). Zero 404s (icons, manifest, fonts).

## 3. Known/likely issues to look for first (from the initial build)

- Home: rep counts and commerce card position vs tab bar on 375×667.
- Trigger screen: large empty gap between briefing and pinned CTA on tall screens — acceptable, but ensure the composition still feels intentional (e.g., bottle block vertically balanced); do not add content.
- Complete screen: two stacked buttons at bottom on 375×667 — ensure both visible without scrolling or make the page scroll cleanly.
- Onboarding Custom goal + iOS keyboard: CTA should remain reachable (use `100dvh`, not `100vh`, everywhere).
- Declare: 6 rows + custom field + CTA on 375×667 → must scroll; CTA pinned.
- Ghost word on trigger screen may overflow the container width at 430px+.
- Shop sticky CTA overlapping the "Secure checkout" note.
- Demo pill height pushing fixed top bars down inconsistently.
- Any `100vh` usage; any `text-transform: uppercase` applied to buttons with sentence-case labels.
- Middleware deprecation: if a separate task already migrated `middleware.ts`→`proxy.ts`, don't touch; otherwise leave it.

## 4. Deliverables

1. Code fixes committed.
2. `docs/screenshots/audit/before/*` and `after/*` (named as above), plus regenerated top-level 13 screenshots.
3. `docs/UI_AUDIT_REPORT.md`: table of every screen/state/viewport checked → issues found → fix (file:line) → status. Also list anything you judged intentional and left alone, and anything you could not test (with reason). Include console error summary (should be "none").
