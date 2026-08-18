# WEB PUSH REMINDERS — SPEC

Goal: "Remind Me Later" on the Mission Active screen sends a real device notification at the chosen time — on Android browsers, and on iPhone when the app is installed to the Home Screen. Keep the in-app banner as the fallback for everyone else. No marketing push, no streak messages, no campaigns. One notification type only.

Notification copy (fixed):
- title: `Mission Fragrances`
- body: `Your Mission is active. Did you do it?`
- tap → opens `/mission/checkin/{missionId}` (focus existing app window if open).

## Architecture (all inside Supabase + the Next app; no new vendors)

1. **Client** — `public/sw.js` service worker (push + notificationclick handlers) registered from the app in real mode. `src/lib/push.ts`: `getPushSupport()`, `subscribeToPush()`, `unsubscribeFromPush()`.
2. **DB** — migration `supabase/migrations/0003_push.sql`:
   - `push_subscriptions(id uuid pk default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, endpoint text not null unique, p256dh text not null, auth text not null, user_agent text, created_at timestamptz default now())` — RLS: select/insert/update/delete own (`user_id = auth.uid()`).
   - `reminders(id uuid pk default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, mission_id uuid not null references public.missions on delete cascade, send_at timestamptz not null, sent_at timestamptz, created_at timestamptz default now())` + index on `(sent_at, send_at)`. RLS: select/insert/delete own.
   - Enable `pg_cron` + `pg_net` extensions and schedule `send-reminders` Edge Function every minute (document the exact `cron.schedule` + `net.http_post` SQL with a placeholder for the project URL and the function's secret; per Supabase docs the Authorization header should carry the service role key or a dedicated `CRON_SECRET` — use a `CRON_SECRET` checked by the function).
3. **Edge Function** — `supabase/functions/send-reminders/index.ts` (Deno). Every minute: with service role, select reminders where `sent_at is null and send_at <= now()` (limit 200), join subscriptions for those users, send Web Push using `npm:web-push` with VAPID (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:antonio@missionfragrances.com` as function secrets), payload `{ title, body, url }`. Skip reminders whose mission is no longer `active` (delete them). Mark `sent_at`. On 404/410 from a push endpoint, delete that subscription. Never send anything else.
4. **Next API** — none needed for sending; the client talks to Supabase directly under RLS. Provide `GET /api/push/vapid` returning the public key? No — use `NEXT_PUBLIC_VAPID_PUBLIC_KEY` env instead. Add to `.env.example`.

## Client behavior

- `src/lib/push.ts`
  - `getPushSupport()` → `'supported' | 'ios-needs-install' | 'unsupported'`: supported = `'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window`; if iOS/iPadOS Safari and NOT `window.matchMedia('(display-mode: standalone)').matches` (and not `navigator.standalone`) → `'ios-needs-install'`.
  - `subscribeToPush()` → register `/sw.js`, `Notification.requestPermission()`, `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`, upsert row into `push_subscriptions` (on conflict endpoint do update user_id, keys). Returns `'granted' | 'denied' | 'error'`.
  - `unsubscribeFromPush()` → unsubscribe + delete row.
- Data layer: add `scheduleReminder(missionId, sendAt)` (delete existing reminders for that mission first, insert one), `cancelReminders(missionId)`. `completeMission`/`endMission` call `cancelReminders`. Local (demo) backend keeps the existing localStorage reminder behavior and no push.
- **Mission Active → REMIND ME LATER sheet** (`src/app/mission/active/[id]/page.tsx`):
  - Options unchanged: 30 minutes / 1 hour / 3 hours / Tonight (8 PM local; if already past 8 PM, tomorrow 8 AM and label it `Tomorrow morning (8 AM)`).
  - On choose: if support `'supported'`: if permission not yet granted → first show a one-screen explainer inside the sheet: eyebrow `REMINDERS`, text `We'll send one notification at the time you choose: "Your Mission is active. Did you do it?" Nothing else — no marketing, no streaks.` button `ALLOW NOTIFICATIONS` (calls subscribe) / ghost `Not now` (falls back to in-app banner only). After granted → `scheduleReminder` → toast `Reminder set for {time}.` If denied → toast `Notifications are off for this site. We'll flag the Mission in-app instead.` and still store the in-app reminder.
  - If `'ios-needs-install'`: show sheet `GET REMINDERS ON IPHONE` with steps: `1. Tap the Share button in Safari.` `2. Choose "Add to Home Screen".` `3. Open Mission Fragrances from your Home Screen and set the reminder again.` + note `iPhone only delivers notifications to installed web apps.` Button `GOT IT`. Store the in-app reminder anyway.
  - If `'unsupported'`: existing behavior (in-app banner), note text `Reminders show inside the app on this browser.`
  - Always keep the existing localStorage in-app reminder so the Home banner still works.
- **Settings → Reminders toggle**: ON → if support supported and permission not granted → same explainer → subscribe; OFF → unsubscribe. Helper text reflects state: `Device notifications on` / `In-app reminders only` / `Add to Home Screen to enable notifications on iPhone`.
- **Onboarding**: do NOT ask for permission during onboarding (brief: ask only with a clear reason). No change.
- Service worker `public/sw.js`: `push` → `self.registration.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url }, tag: 'mission-reminder' })`; `notificationclick` → close, `clients.matchAll({type:'window'})` focus one and `navigate(url)` else `clients.openWindow(url)`. No caching/offline logic (keep it minimal; don't intercept fetch).
- Register the SW in real mode from `AppShell` (or a tiny client component in root layout) — `navigator.serviceWorker.register('/sw.js')` guarded by feature checks. Next: ensure `/sw.js` served with `Service-Worker-Allowed` not needed (root scope by default). Add `public/sw.js` to ESLint ignores if it complains.

## Ops / docs

- `supabase/README.md`: how to generate VAPID keys (`npx web-push generate-vapid-keys`), set function secrets (`supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=... CRON_SECRET=...`), deploy the function (`supabase functions deploy send-reminders --no-verify-jwt`), enable pg_cron/pg_net, and the exact `select cron.schedule(...)` SQL. Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to app env docs and `.env.example`.
- Apply migration 0003 to the live DB if a DB password is available in env (`SUPABASE_DB_PASSWORD` in `.env.local`) via the scratchpad pg runner; otherwise skip and say so.
- Analytics: none. Privacy page already says "reminder setting" — add one sentence under "What we collect": push subscription endpoint (device token) when you enable notifications, deleted when you turn them off or delete your account.

## Verification

- Lint/build clean. Demo mode unchanged.
- In an isolated Chromium (Playwright, headless is fine for permission via `context.grantPermissions(['notifications'])`): sign-in not possible without OTP → test the client pieces at the module level and the sheet flows in demo mode (support detection can be forced via a query flag ONLY in dev builds — or better, unit-test `getPushSupport` with mocked UA/matchMedia). Verify the SW registers, `push` event handler shows a notification when dispatched via DevTools/`sw.dispatchEvent`, and `notificationclick` opens the checkin URL.
- Edge Function: `deno check` it; do a dry-run with a fake fetch if feasible. Report exactly what could not be exercised without a real subscription/deploy.
