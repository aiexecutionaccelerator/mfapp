/* Database tests for migration 0010 (hardening). Run: npm run test:db

   Applies every migration to an in-process Postgres (PGlite) the way
   production got them: 0006/0007 with a real notify secret substituted in
   (here a test value), then 0009 and 0010 (twice). Calls to the
   notify-admin Edge Function are recorded instead of sent, so we can count
   admin emails. Checks run as a signed-in user ("authenticated"), the way
   the app's requests arrive. */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const DIR = new URL("../migrations/", import.meta.url);
const SECRET = "test-notify-secret-1234567890";
const db = new PGlite();
const results = [];

function check(id, name, ok, detail = "") {
  results.push({ ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id.padEnd(4)} ${name}${!ok && detail ? `\n        ${detail}` : ""}`);
}
async function expectError(sql, params, pattern) {
  try {
    await db.query(sql, params);
    return { ok: false, detail: "no error raised" };
  } catch (e) {
    return pattern.test(e.message) ? { ok: true } : { ok: false, detail: `wrong error: ${e.message}` };
  }
}
const one = async (sql, params) => (await db.query(sql, params)).rows[0];
const sql = (f) =>
  readFileSync(new URL(f, DIR), "utf8")
    .replace(/create extension[^;]*;/gi, "")
    .replaceAll("<NOTIFY_SECRET>", SECRET);

await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role authenticated;
  create role anon;
  create schema net;
  create table net.calls (body jsonb, auth text);
  create function net.http_post(url text, headers jsonb, body jsonb, timeout_milliseconds int)
    returns bigint language sql as
    $$ insert into net.calls values (body, headers->>'Authorization'); select 1::bigint $$;
`);
for (const f of readdirSync(DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f) && !f.includes("_down")).sort()) {
  await db.exec(sql(f));
}
await db.exec(sql("0010_hardening.sql")); // idempotent

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
await db.exec(`
  insert into auth.users values ('${A}', 'a@example.com'), ('${B}', 'b@example.com');
  grant usage on schema public, auth to authenticated;
  grant all on all tables in schema public to authenticated;
  grant usage on all sequences in schema public to authenticated;
  grant execute on all functions in schema public, auth to authenticated;
`);
const emails = async () => (await one(`select count(*)::int as n from net.calls`)).n;
const as = async (user) => db.exec(`set role authenticated; set request.jwt.claim.sub = '${user}';`);
const asAdmin = async () => db.exec(`reset role;`);

/* ---------- the secret ---------- */
const stored = await one(`select value from private.app_secrets where name = 'notify_secret'`);
check("S1", "the notify secret moved into the private table", stored?.value === SECRET);
const leaked = await one(
  `select count(*)::int as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and pg_get_functiondef(p.oid) like '%' || $1 || '%'`,
  [SECRET],
);
check("S1", "no public function embeds the secret any more", leaked.n === 0, `${leaked.n} functions`);
await as(A);
let r = await expectError(`select * from private.app_secrets`, [], /permission denied/);
await asAdmin();
check("S1", "a signed-in user can't read the secret", r.ok, r.detail);

/* ---------- signup email: once ---------- */
await as(A);
await db.query(`update public.profiles set onboarding_completed = true, display_name = 'Al' where id = $1`, [A]);
await asAdmin();
const call = await one(`select body, auth from net.calls limit 1`);
check("S2", "finishing onboarding sends one signup email, with the secret",
  (await emails()) === 1 && call.body.type === "signup" && call.auth === `Bearer ${SECRET}`);
await as(A);
r = await expectError(`update public.profiles set onboarding_completed = false where id = $1`, [A], /already complete/);
check("S2", "onboarding can't be un-finished (the email-spam loop)", r.ok, r.detail);
await db.query(`update public.profiles set signup_notified_at = null where id = $1`, [A]);
r = await expectError(`update public.profiles set email = 'x@evil.com' where id = $1`, [A], /Email can't be changed/);
await asAdmin();
check("S2", "the email column can't be changed by the user", r.ok, r.detail);
check("S2", "resetting the marker doesn't re-arm the email",
  (await one(`select signup_notified_at from public.profiles where id = $1`, [A])).signup_notified_at !== null);

/* ---------- 30/30 email: once, removed records don't count ---------- */
const tomorrow = (await one(`select (current_date + 7)::text as d`)).d;
async function complete(user, n, extra = "") {
  const kind = n === 6 ? "reflection" : n >= 8 && n <= 13 ? "code" : [21, 27, 30].includes(n) ? "plan" : "action";
  await db.query(
    `insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number, confirmed, focus_area, frequency, review_date${extra ? ", removed_at" : ""})
     values ($1, 'honor', $2, $2, 'completed', now(), $3, $4, $5, $6, $7${extra ? ", now()" : ""})`,
    [user, `Mission ${n}`, n, kind === "action", n === 21 ? "Work" : null, [27, 30].includes(n) ? "Daily" : null, [27, 30].includes(n) ? tomorrow : null],
  );
}
const before30 = await emails();
for (let n = 1; n <= 29; n += 1) await complete(A, n);
await as(A);
await complete(A, 30);
await asAdmin();
check("S3", "the 30th Mission sends the completion email", (await emails()) === before30 + 1);
await as(A);
const m30 = await one(`select id from public.missions where user_id = $1 and mission_number = 30`, [A]);
await db.query(`update public.missions set removed_at = now() where id = $1`, [m30.id]);
await db.query(`update public.missions set removed_at = null where id = $1`, [m30.id]);
await asAdmin();
check("S3", "remove and restore don't send it again", (await emails()) === before30 + 1);

const beforeB = await emails();
for (let n = 1; n <= 30; n += 1) await complete(B, n, n === 5 ? "removed" : "");
check("S3", "30 records with one removed is not 30/30: no email", (await emails()) === beforeB);
await as(B);
await db.query(`update public.missions set removed_at = null where user_id = $1 and mission_number = 5`, [B]);
await asAdmin();
check("S3", "restoring the 30th live record sends it", (await emails()) === beforeB + 1);

/* ---------- missions ---------- */
await as(A);
r = await expectError(`delete from public.missions where user_id = $1 and mission_number = 3`, [A], /removed, not deleted/);
check("S4", "completed Missions can't be deleted (no delete-and-reinsert)", r.ok, r.detail);
const forged = await one(
  `insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, started_at, history)
   values ($1, 'courage', 'One-off', 'One-off', 'completed', '2020-01-01', '2020-01-01', '[{"text":"fake"}]') returning *`,
  [A],
);
check("S4", "new rows get server timestamps and no forged history",
  forged.completed_at.getFullYear() >= 2026 && forged.started_at.getFullYear() >= 2026 && forged.history === null);
r = await expectError(
  `insert into public.missions (user_id, trigger, action_text, status, photo_url) values ($1, 'honor', 'x', 'active', 'data:image/jpeg;base64,xx')`,
  [A], /Photos are for Missions 7 and 19/);
check("S4", "One-Off Actions can't carry photos", r.ok, r.detail);
const big = "x".repeat(20000);
r = await expectError(
  `insert into public.mission_drafts (user_id, mission_number, context) values ($1, 4, jsonb_build_object('aim', $2::text))`,
  [A, big + Math.random().toString(36).repeat(2000)], /mission_drafts_context_size_check/);
check("S4", "oversized draft context is refused", r.ok, r.detail);
await asAdmin();

/* ---------- reminders and push ---------- */
await as(A);
const active = await one(`insert into public.missions (user_id, trigger, action_text, status) values ($1, 'honor', 'Call', 'active') returning id`, [A]);
r = await expectError(`insert into public.reminders (user_id, mission_id, send_at) values ($1, $2, '1970-01-01')`, [A, active.id], /in the past/);
check("S5", "reminders can't be backdated (queue flooding)", r.ok, r.detail);
await asAdmin();
const otherMission = await one(`select id from public.missions where user_id = $1 limit 1`, [B]);
await as(A);
r = await expectError(`insert into public.reminders (user_id, mission_id, send_at) values ($1, $2, now() + interval '1 hour')`, [A, otherMission.id], /isn't yours/);
check("S5", "reminders only on your own Missions", r.ok, r.detail);
await db.query(`insert into public.reminders (user_id, mission_id, send_at) values ($1, $2, now() + interval '1 hour')`, [A, active.id]);
check("S5", "a normal reminder still works", true);
r = await expectError(`insert into public.push_subscriptions (user_id, endpoint, p256dh, auth) values ($1, 'https://victim.example.com/hook', 'k', 'a')`, [A], /push_subscriptions_endpoint_check/);
check("S5", "push endpoints must be a real push service (no SSRF)", r.ok, r.detail);
await db.query(`insert into public.push_subscriptions (user_id, endpoint, p256dh, auth) values ($1, 'https://fcm.googleapis.com/fcm/send/abc', 'k', 'a')`, [A]);
check("S5", "a real FCM endpoint still works", true);

/* ---------- analytics ---------- */
r = await expectError(`insert into public.analytics_events (user_id, name, props) values ($1, 'x', jsonb_build_object('blob', repeat(md5(random()::text), 400)))`, [A], /props_size_check/);
check("S6", "oversized analytics payloads are refused", r.ok, r.detail);
for (let i = 0; i < 310; i += 1)
  await db.query(`insert into public.analytics_events (user_id, name) values ($1, 'tap')`, [A]);
await asAdmin();
const events = await one(`select count(*)::int as n from public.analytics_events where user_id = $1`, [A]);
check("S6", "analytics capped at 300 an hour per user, silently", events.n === 300, `${events.n} rows`);

/* ---------- the app's normal writes still work ---------- */
await as(A);
await db.query(`update public.profiles set display_name = 'Antonio', identity_statement = 'Keeps his word.', set_status = 'ordered' where id = $1`, [A]);
const edited = await db.query(`update public.missions set reflection = 'Edited text', action_text = 'Edited text' where user_id = $1 and mission_number = 2 returning id`, [A]);
await db.query(`update public.missions set removed_at = now() where user_id = $1 and mission_number = 2`, [A]);
await asAdmin();
check("S7", "profile edits, record edits and removal still work", edited.rows.length === 1);

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} hardening checks passed.`);
process.exit(failed.length ? 1 : 0);
