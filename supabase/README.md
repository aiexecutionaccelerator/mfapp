# Supabase setup

## 1. Create the project

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public key** from Project Settings → API into
   `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`. This key is
   server-only — it is used exclusively by `POST /api/account/delete`. Never put
   it in a `NEXT_PUBLIC_*` variable and never expose it to the browser.

As soon as the URL and anon key are set, the app leaves demo mode.

## 2. Apply the migration

**Option A — SQL editor (fastest):** open the SQL editor in the Supabase
dashboard, paste the contents of `migrations/0001_init.sql`, and run it.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

The migration creates `profiles` and `missions`, the `updated_at` triggers, the
`handle_new_user` signup trigger, and row-level-security policies that restrict
every row to `auth.uid()`.

## 3. Configure the 6-digit OTP email

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

Keep **Authentication → Providers → Email** enabled with "Confirm email" on;
`shouldCreateUser: true` means the same flow works for sign-up and sign-in.

## 4. Verify RLS with two users

1. Sign in as user A, complete onboarding, and log one Mission.
2. Sign in as user B in a different browser profile and log one Mission.
3. In the SQL editor run `select user_id, action_text from public.missions;`
   (service role bypasses RLS) and confirm both rows exist.
4. Back in the app, confirm each user's Mission Log shows only their own row.
   With RLS on and the policies above, user B cannot read or update user A's
   rows even by guessing an id.

## 5. Account deletion

`POST /api/account/delete` verifies the caller's session cookie, then uses the
service-role client to delete the user's `missions`, their `profiles` row, and
finally `auth.admin.deleteUser`. If `SUPABASE_SERVICE_ROLE_KEY` is missing the
route returns 500 and the app shows an error with a retry — it never pretends
the deletion succeeded.
