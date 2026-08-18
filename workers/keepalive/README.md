# Supabase keep-alive worker

## Why this exists

Supabase pauses free-tier projects after **7 days with no activity**. A paused
project takes a manual click to restore and, in the meantime, the app falls over.
This Cloudflare Worker fires once a day (`0 9 * * *` UTC) and makes a single
cheap authenticated call to the Supabase REST API:

```
GET {SUPABASE_URL}/rest/v1/profiles?select=id&limit=1
  apikey: <anon key>
  Authorization: Bearer <anon key>
```

RLS means the anon role sees no rows, so the response is `200` with `[]`. That is
the expected result — it still counts as project activity, which is the whole
point. The status is logged and nothing else happens.

This folder is self-contained: it has its own `package.json` and is **not** part
of the app's root `package.json` or any workspace. Install and deploy it from
inside this directory.

## Deploy

```bash
cd workers/keepalive
npm install
npx wrangler login                      # opens a browser, one time per machine
npx wrangler secret put SUPABASE_URL      --config wrangler.toml  # https://<ref>.supabase.co
npx wrangler secret put SUPABASE_ANON_KEY --config wrangler.toml  # anon key, NOT service role
npm run deploy
```

Secrets are stored by Cloudflare and are never committed. Use the **anon** key
only — the service-role key must never leave the app's server environment.

`--config wrangler.toml` is not optional: the repo root also has a
`wrangler.jsonc` (for the Next.js app), and Wrangler's auto-discovery prefers
that ancestor JSON config over the `.toml` in this folder. The `npm run` scripts
here already pass the flag.

## Verify

- Cloudflare dashboard → **Workers & Pages** → `mission-supabase-keepalive` →
  **Settings → Trigger Events** shows the `0 9 * * *` cron.
- Same worker → **Logs** (or **Observability**) → after the next scheduled run
  you should see `keepalive: 200 OK`. Cron invocations also appear under the
  worker's **Metrics** as "Cron Triggers".
- To force a run without waiting a day: `npm run dev` then, in another shell,
  `curl "http://localhost:8787/__scheduled?cron=0+9+*+*+*"`. Local runs need the
  two values in a `.dev.vars` file (gitignored) rather than as Cloudflare secrets.
- The real proof is in Supabase: project → **Reports/Logs** shows daily API
  traffic, and the project never drops into the paused state.
