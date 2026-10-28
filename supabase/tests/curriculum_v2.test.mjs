/* Database tests for curriculum revision 2 (migration 0009).
   Run: npm run test:db

   Runs every migration in supabase/migrations on an in-process Postgres
   (PGlite), with Supabase's auth schema stubbed. Seeds first-curriculum data
   BEFORE 0009, applies 0009 (twice, to prove it is idempotent), and checks
   the server-side rules and the migration of old records. Each check names
   the acceptance scenario it covers (docs/specs). */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const DIR = new URL("../migrations/", import.meta.url);
const db = new PGlite();
process.on("unhandledRejection", (e) => {
  console.error(`ERROR: ${e.message}${e.where ? `\n  at ${e.where}` : ""}`);
  process.exit(1);
});
const results = [];

function check(id, name, ok, detail = "") {
  results.push({ id, name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id.padEnd(4)} ${name}${!ok && detail ? `\n        ${detail}` : ""}`);
}

async function expectError(sql, params, pattern) {
  try {
    await db.query(sql, params);
    return { ok: false, detail: "no error raised" };
  } catch (e) {
    return pattern.test(e.message)
      ? { ok: true }
      : { ok: false, detail: `wrong error: ${e.message}` };
  }
}

const one = async (sql, params) => (await db.query(sql, params)).rows[0];

/* ---------- Supabase stubs ---------- */
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role authenticated;
  create role anon;
  create schema net;
  create function net.http_post(url text, headers jsonb, body jsonb, timeout_milliseconds int)
    returns bigint language sql as $$ select 1::bigint $$;
`);

const files = readdirSync(DIR)
  .filter((f) => /^\d{4}_.*\.sql$/.test(f) && !f.includes("_down"))
  .sort();
const before = files.filter((f) => f < "0009");
const v2 = files.find((f) => f.startsWith("0009_"));

// pgcrypto isn't bundled with PGlite; gen_random_uuid() is built in anyway.
const sql = (f) =>
  readFileSync(new URL(f, DIR), "utf8").replace(/create extension[^;]*;/gi, "");
for (const f of before) await db.exec(sql(f));

/* ---------- first-curriculum data, as it exists in production ---------- */
const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
await db.exec(`
  insert into auth.users values ('${A}', 'a@example.com'), ('${B}', 'b@example.com');
  insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number)
  values
    ('${A}', 'honor', 'I commit to thanking my wife/partner/girlfriend.', 'I commit to thanking my wife/partner/girlfriend.', 'completed', '2026-10-01', 4),
    ('${A}', 'commitment', 'Health: walk daily.', 'Health: walk daily.', 'completed', '2026-10-02', 21),
    ('${A}', 'courage', 'I commit to calling my dad.', null, 'active', '2026-10-03', 2),
    ('${A}', 'courage', 'Spoke up in the meeting.', 'Spoke up in the meeting.', 'completed', '2026-10-04', null);
`);
const beforeCount = (await one(`select count(*)::int as n from public.missions`)).n;

/* ---------- apply 0009, twice ---------- */
await db.exec(sql(v2));
await db.exec(sql(v2));

/* ---------- D10 / D11: legacy records keep their meaning ---------- */
const old4 = await one(`select * from public.missions where user_id=$1 and mission_number=4`, [A]);
check("D10", "old Mission 4 keeps its gratitude text, version 1, original date",
  old4.reflection.includes("thanking") && old4.curriculum_version === 1 &&
  old4.completed_at.toISOString().startsWith("2026-10-01"));
const after = await one(`select count(*)::int as n from public.missions`);
const backup = await one(`select count(*)::int as n from public.archive_missions_pre_0009`);
check("D10", "rerunning 0009 creates no duplicates; backup holds every row",
  after.n === beforeCount && backup.n === beforeCount, `${beforeCount} → ${after.n}, backup ${backup.n}`);
const kinds = (await db.query(`select mission_number, kind from public.missions where user_id=$1 order by mission_number nulls first`, [A])).rows;
check("C01", "kinds derived from the Mission number for old rows",
  JSON.stringify(kinds.map((k) => k.kind)) === JSON.stringify(["action", "action", "action", "plan"]),
  JSON.stringify(kinds));

const insert = (n, fields = {}) => {
  const row = {
    user_id: A, trigger: "honor", action_text: `record ${n}`, reflection: `record ${n}`,
    status: "completed", completed_at: new Date().toISOString(), mission_number: n,
    confirmed: true, ...fields,
  };
  const keys = Object.keys(row);
  return db.query(
    `insert into public.missions (${keys.join(",")}) values (${keys.map((_, i) => `$${i + 1}`).join(",")}) returning *`,
    Object.values(row),
  );
};

let r = await expectError(
  `insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'courage','Asked for help','completed',now(),22,true)`,
  [A], /Mission 21 first/);
check("D11", "a focus-only legacy 21 does not unlock 22–25", r.ok, r.detail);

/* ---------- C04: actions need confirmation and text ---------- */
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number) values ($1,'honor','Thanked my brother','completed',now(),1)`, [A], /I have taken this action/);
check("C04", "action completion without confirmation is refused", r.ok, r.detail);
r = await expectError(`insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number, confirmed) values ($1,'honor','  ','  ','completed',now(),1,true)`, [A], /Write your record first/);
check("C04", "blank record text is refused", r.ok, r.detail);
const progress = await one(`select count(*)::int as n from public.missions where user_id=$1 and mission_number=1`, [A]);
check("C04", "no progress row is left behind by refused saves", progress.n === 0);

/* ---------- kind can't be faked ---------- */
const m6 = (await insert(6, { kind: "action", confirmed: false })).rows[0];
check("C05", "Mission 6 saves as a reflection even if the client claims 'action'", m6.kind === "reflection" && m6.curriculum_version === 2);

/* ---------- D01: 14 needs all five code lines ---------- */
for (const n of [8, 9, 10, 11]) await insert(n);
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'honor','Corrected my update','completed',now(),14,true)`, [A], /five Personal Code lines/);
check("D01", "Mission 14 blocked with a code line missing", r.ok, r.detail);
const m12 = (await insert(12)).rows[0];
await db.query(`update public.missions set removed_at = now() where id = $1`, [m12.id]);
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'honor','Corrected my update','completed',now(),14,true)`, [A], /five Personal Code lines/);
check("D01", "a removed code line still blocks 14", r.ok, r.detail);
await db.query(`update public.missions set removed_at = null where id = $1`, [m12.id]);
const m14 = (await insert(14, { context: { code: [{ label: "For me, honor means…", value: "record 8" }] } })).rows[0];
check("D01", "restoring the line makes 14 completable", m14.kind === "action");

/* ---------- D12: snapshots are frozen ---------- */
await db.query(`update public.missions set reflection='new honor line', action_text='new honor line' where user_id=$1 and mission_number=8`, [A]);
await db.query(`update public.missions set context='{"code":[]}'::jsonb, completed_at=now() where id=$1`, [m14.id]);
const m14b = await one(`select * from public.missions where id=$1`, [m14.id]);
check("D12", "editing a code line doesn't change 14's snapshot; client can't replace it",
  m14b.context.code[0].value === "record 8" &&
  m14b.completed_at.getTime() === m14.completed_at.getTime());
check("D09", "edit keeps the original completion date, bumps updated_at",
  m14b.updated_at.getTime() > m14.updated_at.getTime(),
  `${m14.updated_at.toISOString()} → ${m14b.updated_at.toISOString()}`);

/* ---------- D02 / D11: 21 with focus and aim unlocks 22–25 ---------- */
const legacy21 = await one(`select * from public.missions where user_id=$1 and mission_number=21`, [A]);
r = await expectError(`update public.missions set curriculum_version=2, reflection='Walk 3 times', action_text='Walk 3 times' where id=$1`, [legacy21.id], /focus area/);
check("D02", "revised 21 needs a focus area", r.ok, r.detail);
await db.query(`update public.missions set curriculum_version=2, focus_area='Health', reflection='Walk three times this week, because I want energy.', action_text='Walk three times this week, because I want energy.', context='{}'::jsonb where id=$1`, [legacy21.id]);
const rev21 = await one(`select * from public.missions where id=$1`, [legacy21.id]);
check("D11", "the legacy 21 text is kept in history; original date kept",
  rev21.history?.[0]?.text === "Health: walk daily." &&
  rev21.completed_at.toISOString().startsWith("2026-10-02") && rev21.curriculum_version === 2);
const m22 = (await insert(22, { context: { focus: "Health", aim: "Walk three times this week" } })).rows[0];
check("D02", "22 completes once a usable aim exists", m22.kind === "action");

/* ---------- D08: one record per Mission ---------- */
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'courage','Again','completed',now(),22,true)`, [A], /duplicate key|unique/);
check("D08", "a second record for the same Mission is refused (retries reuse it)", r.ok, r.detail);

/* ---------- D05 / D06: 28 needs a prior action ---------- */
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'courage','Repeated it','completed',now(),28,true)`, [B], /Complete an action first/);
check("D06", "28 blocked with no prior action", r.ok, r.detail);
await db.query(`insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number, confirmed) values ($1,'commitment','Plan','Plan','completed',now(),27,true)`, [B]).catch(() => {});
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed) values ($1,'courage','Repeated it','completed',now(),28,true)`, [B], /Complete an action first/);
check("D06", "plans and code don't satisfy 28", r.ok, r.detail);
await db.query(`insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number) values ($1,'courage','Called my brother','Called my brother','completed',now(),null)`, [B]);
await db.query(`insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number, confirmed) values ($1,'courage','Repeated the call','Repeated the call','completed',now(),28,true)`, [B]);
check("D06", "28 completes after a real action (a One-Off counts)", true);

/* ---------- D07: review dates ---------- */
const plan = (date, fields = {}) => insert(27, { user_id: B, frequency: "Daily", review_date: date, confirmed: false, ...fields });
r = await expectError(`select 1 from (select $1::date) d`, ["2026-02-30"], /out of range|invalid/);
check("D07", "an impossible date is rejected", r.ok, r.detail);
const today = (await one(`select (now() at time zone 'UTC')::date::text as d`)).d;
const past = (await one(`select ((now() at time zone 'Etc/GMT+12')::date - 1)::text as d`)).d;
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, frequency, review_date) values ($1,'commitment','Plan','completed',now(),27,'Daily',$2)`, [B, past], /after today/);
check("D07", "a past review date is rejected", r.ok, r.detail);
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, review_date) values ($1,'commitment','Plan','completed',now(),27,$2)`, [B, "2099-01-01"], /how often/);
check("D07", "a plan needs a frequency", r.ok, r.detail);
const future = (await one(`select ((now() at time zone 'UTC')::date + 7)::text as d`)).d;
const m27 = (await plan(future)).rows[0];
check("D07", "a real future date is accepted", m27.kind === "plan" && m27.frequency === "Daily");
await db.query(`update public.missions set review_date = $2::date - 30 where id = $1`, [m27.id, today]).catch(() => {});
await db.exec(`alter table public.missions disable trigger missions_validate`);
await db.query(`update public.missions set review_date = '2026-01-01' where id = $1`, [m27.id]);
await db.exec(`alter table public.missions enable trigger missions_validate`);
await db.query(`update public.missions set reflection = 'After breakfast, I will study ten minutes.', action_text = 'After breakfast, I will study ten minutes.' where id = $1`, [m27.id]);
check("D07", "editing a historical plan keeps its unchanged past review date", true);
r = await expectError(`update public.missions set review_date = $2 where id = $1`, [m27.id, past], /after today/);
check("D07", "changing it to a new past date is rejected", r.ok, r.detail);

/* ---------- photos only on 7 and 19 ---------- */
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, completed_at, mission_number, confirmed, photo_url) values ($1,'honor','x','completed',now(),5,true,'data:image/png;base64,xx')`, [B], /Photos are for Missions 7 and 19/);
check("D13", "photos are refused outside Missions 7 and 19", r.ok, r.detail);

/* ---------- D09: remove / restore ---------- */
r = await expectError(`update public.missions set status='active' where id=$1`, [m22.id], /removed and restored/);
check("D09", "a completed record can't be silently reopened", r.ok, r.detail);
await db.query(`update public.missions set removed_at = now() where id=$1`, [m22.id]);
await db.query(`update public.missions set removed_at = null where id=$1`, [m22.id]);
const restored = await one(`select * from public.missions where id=$1`, [m22.id]);
check("D09", "remove then restore keeps the same record and date",
  restored.id === m22.id && restored.completed_at.getTime() === m22.completed_at.getTime());

/* ---------- drafts ---------- */
await db.query(`insert into public.mission_drafts (user_id, mission_number, text) values ($1, 23, 'half-written')`, [A]);
await db.query(`insert into public.missions (user_id, trigger, action_text, reflection, status, completed_at, mission_number, confirmed) values ($1,'commitment','Opened lesson two','Opened lesson two','completed',now(),23,true)`, [A]);
const leftover = await one(`select count(*)::int as n from public.mission_drafts where user_id=$1 and mission_number=23`, [A]);
check("C06", "completing a Mission clears its draft", leftover.n === 0);

/* ---------- finishing an old in-progress row ---------- */
r = await expectError(`update public.missions set status='completed', completed_at=now(), reflection='Called him' where user_id=$1 and mission_number=2`, [A], /I have taken this action/);
check("C04", "finishing an old two-step row needs confirmation too", r.ok, r.detail);
await db.query(`update public.missions set status='completed', completed_at=now(), reflection='Called him', confirmed=true where user_id=$1 and mission_number=2`, [A]);
const m2 = await one(`select * from public.missions where user_id=$1 and mission_number=2`, [A]);
check("C11", "an old in-progress row completes under the revised wording", m2.curriculum_version === 2);

/* ---------- D13: user isolation (RLS) ---------- */
await db.exec(`grant usage on schema public, auth to authenticated; grant all on all tables in schema public to authenticated; grant execute on all functions in schema public, auth to authenticated;`);
await db.exec(`set role authenticated; set request.jwt.claim.sub = '${B}';`);
const seen = await one(`select count(*)::int as n from public.missions where user_id = '${A}'`);
const drafts = await one(`select count(*)::int as n from public.mission_drafts where user_id = '${A}'`);
r = await expectError(`insert into public.missions (user_id, trigger, action_text, status, mission_number) values ('${A}','honor','x','active',3)`, [], /row-level security/);
const app = await one(`select get_app_data() as d`);
await db.exec(`reset role;`);
check("D13", "user B can't read or write user A's records or drafts",
  seen.n === 0 && drafts.n === 0 && r.ok, `${seen.n} rows, ${drafts.n} drafts, ${r.detail ?? ""}`);
check("D13", "get_app_data returns only the caller's rows, with drafts",
  app.d.missions.every((m) => m.user_id === B) && Array.isArray(app.d.drafts) && "kind" in app.d.missions[0]);

/* ---------- D14: rollback keeps revision 2 data ---------- */
const v2Before = await one(`select count(*)::int as n from public.missions where curriculum_version = 2`);
await db.exec(sql("0009_down.sql"));
const v2After = await one(`select count(*)::int as n from public.missions where curriculum_version = 2`);
// The earlier app's two-step write still works after rollback.
const oldApp = await one(`insert into public.missions (user_id, trigger, action_text, status, mission_number) values ($1,'honor','Thanked my coach','active',1) returning *`, [B]);
await db.query(`update public.missions set status='completed', completed_at=now(), reflection='Thanked my coach' where id=$1`, [oldApp.id]);
const oldRow = await one(`select * from public.missions where id=$1`, [oldApp.id]);
check("D14", "rollback keeps every revision 2 record and snapshot",
  v2Before.n === v2After.n && (await one(`select context from public.missions where id=$1`, [m14.id])).context.code[0].value === "record 8");
check("D14", "after rollback the earlier app writes version 1 rows with a kind",
  oldRow.curriculum_version === 1 && oldRow.kind === "action" && oldRow.status === "completed");

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} database checks passed.`);
process.exit(failed.length ? 1 : 0);
