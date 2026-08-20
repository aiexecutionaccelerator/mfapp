# Supabase setup

## 1. Create the project

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public key** from Project Settings → API into
   `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`. This key is
   server-only — it is used exclusively by `POST /api/account/delete`. Never put
   it in a `NEXT_PUBLIC_*` variable and never expose it to the browser.

As soon as the URL and anon key are set, the app leaves demo mode.

## 2. Apply the migrations

**Option A — SQL editor (fastest):** open the SQL editor in the Supabase
dashboard and run every file in `migrations/` in order (`0001` … `0005`).

**Option B — Supabase CLI:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

`0001` creates `profiles` and `missions`, the `updated_at` triggers, the
`handle_new_user` signup trigger, and row-level-security policies that restrict
every row to `auth.uid()`. `0002` adds the single-round-trip `get_app_data()`
function, `0003` the push `reminders`, `0004` `course_progress`, and `0005`
`lesson_responses` — the private answers a man writes inside a lesson, which the
Vivid Vision page compiles. `0002`, `0004` and `0005` each replace
`get_app_data()`, so run them in order.

## 3. Configure the OTP code email

The app signs in with `signInWithOtp` + `verifyOtp`, so the email must contain a
**code**, not a magic link.

Go to **Authentication → Email Templates → Magic Link** and set the body to
include `{{ .Token }}`:

```html
<h2>Your Mission code</h2>
<p>Enter this code to sign in:</p>
<p style="font-size:28px;letter-spacing:6px;"><strong>{{ .Token }}</strong></p>
<p>The code expires in 60 minutes. If you didn't request it, ignore this email.</p>
```

Then go to **Authentication → Sign In / Providers → Email** and turn **"Confirm
email" OFF**. With it on, brand-new users receive the *Confirm sign up* template
(a link) instead of the OTP template above. The OTP code already verifies the
address, so confirmation adds nothing. `shouldCreateUser: true` means the same
flow works for sign-up and sign-in.

Code length: Supabase defaults to an 8-digit OTP (configurable 6–10 under
Authentication → Settings → "Email OTP length"). The app accepts any length in
that range.

Custom SMTP is required: Supabase's built-in mailer only delivers to project
team members. Configure **Authentication → SMTP Settings** with Brevo (free,
`smtp-relay.brevo.com:587`) or Resend (`smtp.resend.com:465`, user `resend`).

## 4. Verify RLS with two users

1. Sign in as user A, complete onboarding, and log one Mission.
2. Sign in as user B in a different browser profile and log one Mission.
3. In the SQL editor run `select user_id, action_text from public.missions;`
   (service role bypasses RLS) and confirm both rows exist.
4. Back in the app, confirm each user's Mission Log shows only their own row.
   With RLS on and the policies above, user B cannot read or update user A's
   rows even by guessing an id.

## 5. Web Push reminders

Only one notification is ever sent: **"Your Mission is active. Did you do it?"**
at the time the user picked on the Mission Active screen. Tapping it opens
`/mission/checkin/{missionId}`. No marketing, no streaks, no campaigns.

### 5.1 Apply migration 0003

Run `migrations/0003_push.sql` (SQL editor or `supabase db push`). It creates
`push_subscriptions` and `reminders` with RLS that scopes every row to
`auth.uid()`. The pg_cron schedule at the bottom of that file is commented out
on purpose — it carries placeholders and is step 5.5 below.

### 5.2 Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Put the **public** key in the app environment as
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` (it is baked into the client bundle at build
time, so it must be set before `next build` / `cf:build`). The **private** key
never leaves the function secrets.

### 5.3 Set the function secrets

`CRON_SECRET` is any long random string — generate one with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

```bash
supabase link --project-ref <PROJECT_REF>
supabase secrets set \
  VAPID_PUBLIC_KEY=<public key> \
  VAPID_PRIVATE_KEY=<private key> \
  VAPID_SUBJECT=mailto:antonio@missionfragrances.com \
  CRON_SECRET=<random string>
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions
automatically — do not set them by hand.

### 5.4 Deploy the function

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

`--no-verify-jwt` is required because pg_cron calls it with the `CRON_SECRET`
bearer token instead of a user JWT; the function rejects any request whose
`Authorization` header is not `Bearer <CRON_SECRET>`.

### 5.5 Enable pg_cron / pg_net and schedule it

Dashboard → **Database → Extensions** → enable `pg_cron` and `pg_net` (or run
`create extension if not exists pg_cron;` and
`create extension if not exists pg_net with schema extensions;`).

Then, in the SQL editor, with `<PROJECT_REF>` and `<CRON_SECRET>` replaced:

```sql
select cron.schedule(
  'send-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
```

Check it with `select * from cron.job;` and
`select * from cron.job_run_details order by start_time desc limit 10;`.
Remove it with `select cron.unschedule('send-reminders');`.

### 5.6 What the function does each minute

1. Selects up to 200 reminders with `sent_at is null and send_at <= now()`.
2. Deletes any whose Mission is no longer `active`.
3. Sends the notification to every `push_subscriptions` row of those users.
4. Marks the reminders `sent_at`.
5. Deletes any subscription whose endpoint returned 404 or 410.

### 5.7 Verify end to end

1. On Android Chrome (or desktop Chrome), sign in, start a Mission, tap
   **REMIND ME LATER → 30 minutes → ALLOW NOTIFICATIONS**.
2. `select * from public.push_subscriptions;` shows one row for your user.
3. `select * from public.reminders;` shows one unsent row.
4. `update public.reminders set send_at = now() where sent_at is null;` and wait
   for the next minute — the notification arrives and `sent_at` fills in.
5. On iPhone the app must first be added to the Home Screen; Safari itself
   cannot receive Web Push.

## 6. Account deletion

`POST /api/account/delete` verifies the caller's session cookie, then uses the
service-role client to delete the user's `missions`, their `profiles` row, and
finally `auth.admin.deleteUser`. If `SUPABASE_SERVICE_ROLE_KEY` is missing the
route returns 500 and the app shows an error with a retry — it never pretends
the deletion succeeded.

## 7. Admin notifications

Migration `0006_admin_notifications.sql` adds two triggers that call the
`notify-admin` Edge Function: one when a user completes onboarding ("signup"),
one when their 30th lesson row is inserted ("course complete"). Both emails go
to antonio@missionfragrances.com with the user's name in the subject, using the
branded dark template.

The committed migration carries a `<NOTIFY_SECRET>` placeholder — apply it with
the real value substituted; the same value must be set as the function secret.
Function secrets: `NOTIFY_SECRET`, `NOTIFY_FROM` (verified Brevo sender), and
`BREVO_API_KEY` (Brevo → SMTP & API → API Keys — the v3 API key, not the SMTP
key). Deploy with `supabase functions deploy notify-admin --no-verify-jwt`.
