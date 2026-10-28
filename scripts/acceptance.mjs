/* Acceptance scenarios from the curriculum revision 2 spec (C01–C12, D01–D14),
   run against the app in demo mode. Writes docs/specs/acceptance-results.md.

   Run: npm run build && PORT=3100 npm start &
        CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/acceptance.mjs

   Server-side halves (validation at the write boundary, migration, RLS,
   rollback) are in supabase/tests/curriculum_v2.test.mjs (npm run test:db);
   this report folds in its results. Synthetic data only. */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:3100";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);

const results = [];
async function scenario(id, name, run) {
  const notes = [];
  try {
    await run((note) => notes.push(note));
    results.push({ id, name, ok: true, notes });
    console.log(`PASS  ${id}  ${name}`);
  } catch (e) {
    results.push({ id, name, ok: false, notes: [...notes, String(e.message).split("\n")[0]] });
    console.log(`FAIL  ${id}  ${name}\n      ${String(e.message).split("\n")[0]}`);
  }
}
const assert = (ok, msg) => {
  if (!ok) throw new Error(msg);
};

/* ---------- state helpers (demo storage) ---------- */

const KIND = (n) =>
  n === null ? "action" : n === 6 ? "reflection" : n >= 8 && n <= 13 ? "code" : [21, 27, 30].includes(n) ? "plan" : "action";
const TRIGGERS = ["honor", "courage", "commitment"];
const day = (offset) => {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function record(n, extra = {}) {
  const at = new Date(Date.now() - 86400000 * (31 - (n ?? 31))).toISOString();
  return {
    id: `r-${n ?? "x"}-${Math.random().toString(36).slice(2)}`,
    user_id: "demo-user",
    trigger: TRIGGERS[(n ?? 0) % 3],
    action_text: `Record for ${n === null ? "a one-off" : `Mission ${n}`}`,
    reflection: `Record for ${n === null ? "a one-off" : `Mission ${n}`}`,
    action_category: n === null ? "one-off" : "mission",
    status: "completed",
    started_at: at,
    completed_at: at,
    ended_at: null,
    mission_number: n,
    question_answer: null,
    photo_url: null,
    kind: KIND(n),
    curriculum_version: 2,
    confirmed: KIND(n) === "action",
    context: {},
    focus_area: n === 21 ? "Work" : null,
    frequency: n === 27 ? "Daily" : null,
    review_date: n === 27 ? day(7) : null,
    updated_at: at,
    removed_at: null,
    history: null,
    ...extra,
  };
}

async function reset(records = [], { identity = null, drafts = [] } = {}) {
  await page.goto(`${BASE}/welcome`);
  await page.evaluate(
    ({ records, identity, drafts }) => {
      localStorage.clear();
      localStorage.setItem(
        "mission.profile",
        JSON.stringify({ display_name: "Test", onboarding_completed: true, identity_statement: identity }),
      );
      localStorage.setItem("mission.missions", JSON.stringify(records));
      localStorage.setItem("mission.drafts", JSON.stringify(drafts));
    },
    { records, identity, drafts },
  );
}
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("mission.missions") ?? "[]"));
const storedDrafts = () => page.evaluate(() => JSON.parse(localStorage.getItem("mission.drafts") ?? "[]"));
const open = async (n) => {
  await page.goto(`${BASE}/missions/${n}`);
  await page.getByText(`MISSION ${n} OF 30`).waitFor();
};
const button = (name) => page.getByRole("button", { name, exact: true });
const confirmBox = () => page.getByLabel("I have taken this action.");
const field = () => page.locator("textarea").first();
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ---------- content and interaction ---------- */

await scenario("C01", "30 Missions match the spec: 20 action, 6 code, 3 plan, 1 reflection; 3 approaches and 2 examples each", async (note) => {
  const out = execFileSync("node", ["scripts/check-copy.mjs"], { encoding: "utf8" });
  assert(out.includes("all 30 Missions match"), out);
  note("`npm run check:copy` compares every field of all 30 with docs/specs/curriculum-v2-spec.txt.");
});

await scenario("C02", "every Mission fits a 375px phone: no horizontal scroll, steps and save visible, nothing under the tab bar at the end", async (note) => {
  await reset([]);
  for (let n = 1; n <= 30; n += 1) {
    await open(n);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    assert(scroll <= client, `Mission ${n} scrolls sideways (${scroll} > ${client})`);
    for (const step of ["SELECT", "TRIGGER", "ACT", "RECORD"])
      assert((await page.getByText(step, { exact: true }).count()) > 0, `Mission ${n} missing ${step}`);
    const save = page.getByRole("button", { name: "SAVE DRAFT FOR LATER" });
    await save.scrollIntoViewIfNeeded();
    const box = await save.boundingBox();
    const bar = await page.locator("nav").last().boundingBox();
    assert(box && bar && box.y + box.height <= bar.y + 1, `Mission ${n}: the save controls sit under the tab bar`);
  }
  note("Checked all 30 at 375×812.");
});

await scenario("C03", "opening approaches and examples, or changing scent, never fills, ticks or saves; the chosen scent is saved and used", async () => {
  await reset([]);
  await open(1);
  await page.getByRole("button", { name: "Choose one way to do it" }).click();
  await page.getByRole("button", { name: "Need an example?" }).click();
  await page.getByText(/I thanked my brother/).click();
  assert((await field().inputValue()) === "", "an example filled the field");
  assert(!(await confirmBox().isChecked()), "the confirmation got ticked");
  assert((await stored()).length === 0 && (await storedDrafts()).length === 0, "something was saved");
  await page.getByRole("radio", { name: "commitment" }).click();
  await field().fill("I thanked my neighbor for watching the house.");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 1").click();
  await page.getByText("You acted with Commitment.").waitFor();
  assert((await stored())[0].trigger === "commitment", "chosen scent not saved");
});

await scenario("C04", "blank text or no confirmation blocks completion in the UI; a draft is still possible; no progress or action credit", async (note) => {
  await reset([]);
  await open(2);
  await button("RECORD · COMPLETE MISSION 2").click();
  await page.getByText("Write your record first.").waitFor();
  await field().fill("I was avoiding the dentist. I booked the visit.");
  await button("RECORD · COMPLETE MISSION 2").click();
  await page.getByText(/I have taken this action/).first().waitFor();
  assert((await stored()).length === 0, "a record was created");
  await button("SAVE DRAFT FOR LATER").click();
  await page.getByText(/Draft saved/).waitFor();
  assert((await storedDrafts()).length === 1, "draft not saved");
  await page.goto(`${BASE}/progress`);
  assert((await page.getByText("0/30", { exact: true }).count()) === 1, "progress moved");
  note("Server half: test:db C04 checks.");
});

await scenario("C05", "Mission 6, a code Mission and a plan complete with their true type and message; none counts as an action", async () => {
  await reset([]);
  await open(6);
  await field().fill("I admitted a missed deadline and helped fix it. I can own my part.");
  assert((await confirmBox().count()) === 0, "reflection asks for action confirmation");
  await button("SAVE REFLECTION").click();
  await page.getByText("Your reflection is saved.").waitFor();
  await open(9);
  await field().fill("Asking for help when I am stuck.");
  await button("SAVE TO MY CODE").click();
  await page.getByText("Your Personal Code is taking shape.").waitFor();
  await open(21);
  await field().fill("I want to finish lesson one this week because it moves my qualification forward.");
  await page.getByText("Work", { exact: true }).click();
  await button("SAVE FOCUS & AIM").click();
  await page.getByText("Your focus and aim are saved.").waitFor();
  const kinds = (await stored()).map((r) => r.kind).sort();
  assert(JSON.stringify(kinds) === JSON.stringify(["code", "plan", "reflection"]), `kinds ${kinds}`);
  await page.goto(`${BASE}/progress`);
  assert((await page.getByText("3/30", { exact: true }).count()) === 1, "x/30 should be 3");
  await page.goto(`${BASE}/log`);
  await page.getByText("3 records · 0 actions").waitFor();
});

await scenario("C06", "a draft survives reload without credit; completing it clears it and creates one record", async () => {
  await reset([]);
  await open(3);
  await field().fill("I promised to return the drill.");
  await button("SAVE DRAFT FOR LATER").click();
  await page.getByText(/Draft saved/).waitFor();
  await page.reload();
  await page.getByText("DRAFT SAVED", { exact: true }).waitFor();
  assert((await field().inputValue()) === "I promised to return the drill.", "draft text lost");
  assert((await stored()).length === 0, "draft earned a record");
  await field().fill("I promised to return the drill today, and I dropped it off.");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 3").click();
  await page.getByText("MISSION COMPLETE.").waitFor();
  assert((await stored()).length === 1 && (await storedDrafts()).length === 0, "not one record / draft not cleared");
});

await scenario("C07", "viewing 13 doesn't complete it; saving updates identity; a later Settings edit updates the same record", async () => {
  await reset([], { identity: "Keeps his word." });
  await open(13);
  assert((await field().inputValue()) === "Keeps his word.", "13 didn't open on his identity");
  await page.goto(`${BASE}/missions`);
  assert((await stored()).length === 0, "viewing 13 created a record");
  await open(13);
  await field().fill("Keeps his word, admits his mistakes, and makes repairs.");
  await button("SAVE TO MY CODE").click();
  await page.getByText("Your Personal Code is taking shape.").waitFor();
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("mission.profile")));
  assert(profile.identity_statement === "Keeps his word, admits his mistakes, and makes repairs.", "identity not updated");
  await page.goto(`${BASE}/settings`);
  const id = page.getByLabel("The man I am becoming");
  await id.fill("Keeps his word and follows through after setbacks.");
  await id.blur();
  await page.waitForTimeout(500);
  const rows = (await stored()).filter((r) => r.mission_number === 13);
  assert(rows.length === 1, `${rows.length} Mission 13 records`);
  assert(rows[0].reflection === "Keeps his word and follows through after setbacks.", "13 not synced");
});

await scenario("C08", "15 labels a proposal honestly; 20 says an offer alone is not completed help", async () => {
  await reset([]);
  await open(15);
  await page.getByText("Label a proposal as a proposal.", { exact: false }).waitFor();
  await page.getByText("You have contacted the person and reserved or agreed on a time.").waitFor();
  await open(20);
  await page.getByText("An offer to help later is still an intention.", { exact: false }).waitFor();
});

await scenario("C09", "17 allows an honest two-minute fallback; 23 records preparation, not the later task", async () => {
  await reset([record(21, { focus_area: "Work", reflection: "Finish lesson one this week." })]);
  await open(17);
  await page.getByText("use two deliberate minutes and record that honestly", { exact: false }).waitFor();
  await open(23);
  await page.getByText("This records preparation. Record the next practice separately", { exact: false }).waitFor();
});

await scenario("C10", "copying code lines in 29 doesn't complete it or give credit", async () => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await reset(range(8, 12).map((n) => record(n)));
  await open(29);
  await page.getByRole("checkbox").first().check();
  await button("COPY SELECTED LINES").click();
  await page.getByText("Copied. Now share it with someone you trust.").waitFor();
  assert((await stored()).filter((r) => r.mission_number === 29).length === 0, "copying completed 29");
  assert(!(await confirmBox().isChecked()), "copying ticked the confirmation");
});

await scenario("C11", "missed days keep progress; next is chosen by number; after 30 the log stays open; a One-Off changes the action count only", async () => {
  const old = (n) => record(n, { completed_at: "2026-09-01T10:00:00.000Z", started_at: "2026-09-01T10:00:00.000Z" });
  await reset([old(1), old(2), old(4)]);
  await page.goto(`${BASE}/missions`);
  await page.getByText("NEXT · MISSION 3").waitFor();
  await page.getByText("3/30 COMPLETE").waitFor();
  await reset(range(1, 30).map((n) => record(n)));
  await page.goto(`${BASE}/missions`);
  await page.getByText("All 30 Missions done. Your Proof Log stays open.").waitFor();
  await page.goto(`${BASE}/action/declare`);
  await page.locator("textarea").fill("Kept my promise to call my brother.");
  await button("LOG THIS ACTION").click();
  await page.getByText("PROOF LOGGED.").waitFor();
  await page.goto(`${BASE}/log`);
  await page.getByText("31 records · 21 actions").waitFor();
  await page.goto(`${BASE}/progress`);
  assert((await page.getByText("30/30", { exact: true }).count()) === 1, "x/30 changed");
});

await scenario("C12", "keyboard and screen reader: labelled fields, expand state, selection state, errors announced and focused", async (note) => {
  await reset([]);
  await open(27);
  const disclosure = page.getByRole("button", { name: "Choose one way to do it" });
  assert((await disclosure.getAttribute("aria-expanded")) === "false", "no aria-expanded");
  await disclosure.focus();
  await page.keyboard.press("Enter");
  assert((await disclosure.getAttribute("aria-expanded")) === "true", "Enter didn't expand");
  assert((await page.getByRole("radio", { name: "courage" }).getAttribute("aria-checked")) === "false", "no selection state");
  assert((await page.getByLabel("After ____, I will ____. If that is not possible, I will ____.").count()) === 1, "Record field has no label");
  assert((await page.getByLabel("REVIEW DATE").count()) === 1, "date has no label");
  await page.getByRole("group", { name: "HOW OFTEN" }).waitFor();
  await button("SAVE PRACTICE PLAN").focus();
  await page.keyboard.press("Enter");
  const alert = page.getByRole("alert").filter({ hasText: "Write your record first." });
  await alert.waitFor();
  assert(await alert.evaluate((el) => document.activeElement === el), "focus didn't move to the error");
  note("Automated checks only; a pass with VoiceOver/TalkBack on a real phone is still recommended.");
});

/* ---------- state ---------- */

await scenario("D01", "14 or 29 blocked with a code line missing or removed, with a route back; restoring makes it available", async () => {
  const lines = range(8, 12).map((n) => record(n));
  lines[2].removed_at = new Date().toISOString();
  await reset(lines);
  await open(14);
  await page.getByText("Your code line from Mission 10 isn't saved yet.").waitFor();
  await page.getByRole("link", { name: /GO TO MISSION 10/ }).waitFor();
  await field().fill("My line is to own mistakes. I corrected an update I had sent.");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 14").click();
  await page.getByText("Your code line from Mission 10 isn't saved yet.").nth(1).waitFor();
  await open(10);
  await button("RESTORE").click();
  await page.getByText("Restored.").waitFor();
  await open(14);
  assert((await page.getByText("BEFORE YOU COMPLETE THIS MISSION").count()) === 0, "still blocked after restore");
});

await scenario("D02", "22–25 blocked until a usable aim exists; then each shows the same direction", async () => {
  await reset([]);
  for (const n of [22, 23, 24, 25]) {
    await open(n);
    await page.getByText("Choose your focus and aim in Mission 21 first.", { exact: false }).waitFor();
  }
  await open(21);
  await field().fill("I want to complete lesson one this week because it moves my qualification forward.");
  await page.getByText("Work", { exact: true }).click();
  await button("SAVE FOCUS & AIM").click();
  await page.getByText("Your focus and aim are saved.").waitFor();
  for (const n of [22, 23, 24, 25]) {
    await open(n);
    await page.getByText("YOUR FOCUS & SEVEN-DAY AIM · MISSION 21").waitFor();
    await page.getByText("I want to complete lesson one this week", { exact: false }).waitFor();
    assert((await page.getByText("BEFORE YOU COMPLETE THIS MISSION").count()) === 0, `${n} still blocked`);
  }
});

await scenario("D03", "a 22 draft made before 21 picks up the newly saved aim, keeps its text, and saves the aim with the record", async () => {
  await reset([]);
  await open(22);
  await field().fill("I asked the tutor about the exercise I didn't understand.");
  await button("SAVE DRAFT FOR LATER").click();
  await page.getByText(/Draft saved/).waitFor();
  await open(21);
  await field().fill("Finish lesson one this week, because it moves my qualification forward.");
  await page.getByText("Work", { exact: true }).click();
  await button("SAVE FOCUS & AIM").click();
  await page.getByText("Your focus and aim are saved.").waitFor();
  await open(22);
  await page.getByText("Finish lesson one this week", { exact: false }).first().waitFor();
  assert((await field().inputValue()).startsWith("I asked the tutor"), "draft text lost");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 22").click();
  await page.getByText("MISSION COMPLETE.").waitFor();
  const r22 = (await stored()).find((r) => r.mission_number === 22);
  assert(r22.context?.aim?.startsWith("Finish lesson one"), "aim not captured");
});

await scenario("D04", "changing 21 while a 22 draft and a completed 23 exist: the draft offers a choice; 23 keeps the old aim and date", async () => {
  const r21 = record(21, { reflection: "Old aim: finish lesson one.", action_text: "Old aim: finish lesson one." });
  const r23 = record(23, { context: { focus: "Work", aim: "Old aim: finish lesson one." } });
  await reset([r21, r23], {
    drafts: [{ mission_number: 22, curriculum_version: 2, text: "Draft step.", trigger: "courage", focus_area: null, frequency: null, review_date: null, context: { focus: "Work", aim: "Old aim: finish lesson one." }, updated_at: new Date().toISOString() }],
  });
  await open(21);
  await button("EDIT").click();
  await field().fill("New aim: two unhurried conversations this week.");
  await button("SAVE CHANGES").click();
  await page.getByText("Changes saved.").waitFor();
  await open(22);
  await page.getByText("YOUR AIM CHANGED").waitFor();
  assert((await field().inputValue()) === "Draft step.", "draft text lost");
  await page.getByLabel(/The aim I started with/).check();
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 22").click();
  await page.getByText("MISSION COMPLETE.").waitFor();
  const rows = await stored();
  assert(rows.find((r) => r.mission_number === 22).context.aim === "Old aim: finish lesson one.", "chosen aim not saved");
  const after23 = rows.find((r) => r.mission_number === 23);
  assert(after23.context.aim === "Old aim: finish lesson one." && after23.completed_at === r23.completed_at, "23 changed");
});

await scenario("D05", "27 saved without 21: 28–30 show the practice; 28 still needs an action; no invented focus", async () => {
  await reset([record(27)]);
  for (const n of [28, 29, 30]) {
    await open(n);
    if (n !== 29) await page.getByText("YOUR PRACTICE · MISSION 27").waitFor();
    assert((await page.getByText("YOUR FOCUS & SEVEN-DAY AIM").count()) === 0, `${n} invented an aim`);
  }
  await open(28);
  await page.getByText("Complete an action first, then come back.", { exact: false }).waitFor();
});

await scenario("D06", "28 blocked with only code and plans; available after a real action; viewing doesn't complete it", async () => {
  await reset([record(8), record(21), record(27)]);
  await open(28);
  await page.getByText("BEFORE YOU COMPLETE THIS MISSION").waitFor();
  await reset([record(8), record(21), record(27), record(null)]);
  await open(28);
  assert((await page.getByText("BEFORE YOU COMPLETE THIS MISSION").count()) === 0, "still blocked");
  await page.getByText("FROM YOUR PROOF LOG").waitFor();
  assert((await stored()).every((r) => r.mission_number !== 28), "viewing completed 28");
});

await scenario("D07", "review dates: missing, today and past refused; a future date accepted; an unchanged past date kept on edit", async (note) => {
  await reset([]);
  await open(27);
  await field().fill("After breakfast, I will study for ten minutes. On a difficult day, I will complete one exercise.");
  await page.getByText("Daily", { exact: true }).click();
  await button("SAVE PRACTICE PLAN").click();
  await page.getByText("Choose a review date.").waitFor();
  for (const bad of [day(0), day(-3)]) {
    await page.getByLabel("REVIEW DATE").fill(bad);
    await button("SAVE PRACTICE PLAN").click();
    await page.getByText("Choose a review date after today.").waitFor();
  }
  await page.getByLabel("REVIEW DATE").fill(day(7));
  await button("SAVE PRACTICE PLAN").click();
  await page.getByText("Your practice plan is saved.").waitFor();
  await reset([record(27, { review_date: day(-10) })]);
  await open(27);
  await button("EDIT").click();
  await field().fill("After lunch, I will study for ten minutes.");
  await button("SAVE CHANGES").click();
  await page.getByText("Changes saved.").waitFor();
  note("Impossible dates can't be typed into the date picker; the server rejects them (test:db D07). Server bound is UTC-12 'today'; the app checks his local day.");
});

await scenario("D08", "double click and a second tab: one record, no false success, text kept with a clear message", async () => {
  await reset([]);
  await open(3);
  await field().fill("I promised to call back and I did.");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 3").dblclick();
  await page.getByText("MISSION COMPLETE.").waitFor();
  assert((await stored()).filter((r) => r.mission_number === 3).length === 1, "double click duplicated");
  const tab = await context.newPage();
  await open(4);
  await tab.goto(`${BASE}/missions/4`);
  await tab.getByText("MISSION 4 OF 30").waitFor();
  await field().fill("I corrected the wrong date I sent.");
  await confirmBox().check();
  await button("RECORD · COMPLETE MISSION 4").click();
  await page.getByText("MISSION COMPLETE.").waitFor();
  await tab.locator("textarea").first().fill("I apologized and cleaned the kitchen.");
  await tab.getByLabel("I have taken this action.").check();
  await tab.getByRole("button", { name: "RECORD · COMPLETE MISSION 4", exact: true }).click();
  await tab.getByText("already completed in another tab or device", { exact: false }).waitFor();
  assert((await tab.locator("textarea").first().inputValue()) === "I apologized and cleaned the kitchen.", "text lost");
  assert((await stored()).filter((r) => r.mission_number === 4).length === 1, "second tab duplicated");
  await tab.close();
});

await scenario("D09", "edit, remove, restore, reload: one record, original date, counters agree", async () => {
  const r = record(5);
  await reset([r]);
  await open(5);
  await button("EDIT").click();
  await field().fill("I asked my colleague to explain the step.");
  await button("SAVE CHANGES").click();
  await page.getByText("Changes saved.").waitFor();
  let row = (await stored())[0];
  assert(row.completed_at === r.completed_at && row.updated_at !== r.updated_at, "dates wrong after edit");
  await page.goto(`${BASE}/log/${r.id}`);
  await button("Remove this record").click();
  await button("REMOVE").click();
  await button("RESTORE").waitFor();
  await page.goto(`${BASE}/progress`);
  assert((await page.getByText("0/30", { exact: true }).count()) === 1, "removed record still counts");
  await page.goto(`${BASE}/log/${r.id}`);
  await button("RESTORE").click();
  await page.reload();
  await page.goto(`${BASE}/progress`);
  assert((await page.getByText("1/30", { exact: true }).count()) === 1, "restore didn't count");
  row = (await stored())[0];
  assert((await stored()).length === 1 && row.id === r.id && row.completed_at === r.completed_at, "not the same record");
});

await scenario("D10", "an old Mission 4 keeps its gratitude wording and credit, with an earlier-wording notice; the revised task is viewable separately", async (note) => {
  await reset([record(4, { curriculum_version: 1, reflection: "I commit to thanking my coach.", action_text: "I commit to thanking my coach.", context: null })]);
  await open(4);
  await page.getByText("SAVED UNDER EARLIER WORDING").waitFor();
  await page.getByText("“Honor Someone Who Matters”").waitFor();
  await page.getByText("I commit to thanking my coach.").waitFor();
  await page.getByRole("button", { name: "See the revised task" }).click();
  await page.getByText("You don't need to redo it.", { exact: false }).waitFor();
  await page.goto(`${BASE}/log`);
  await page.getByText("MISSION 4 · HONOR SOMEONE WHO MATTERS").waitFor();
  note("Migration half (backup, idempotent rerun, no relabel): test:db D10.");
});

await scenario("D11", "a focus-only legacy 21 keeps its history; he adds a current aim before 22–25; no aim is invented", async () => {
  await reset([record(21, { curriculum_version: 1, focus_area: null, reflection: "Health", action_text: "Health", context: null })]);
  await open(22);
  await page.getByText("saved under the earlier wording, without a seven-day aim", { exact: false }).waitFor();
  await open(21);
  await button("ADD A CURRENT AIM").click();
  assert((await field().inputValue()) === "", "an aim was pre-filled from the old focus");
  await field().fill("Walk three times this week, because I want more energy.");
  await page.getByText("Health", { exact: true }).click();
  await button("SAVE FOCUS & AIM").click();
  await page.getByText("Your focus and aim are saved.").waitFor();
  const row = (await stored())[0];
  assert(row.history?.[0]?.text === "Health" && row.curriculum_version === 2, "history not kept");
  await open(22);
  assert((await page.getByText("BEFORE YOU COMPLETE THIS MISSION").count()) === 0, "22 still blocked");
});

await scenario("D12", "editing code after 14 or 29 keeps their historical code; future eligibility updates", async () => {
  const code = range(8, 12).map((n) => record(n));
  const r14 = record(14, { context: { code: [{ label: "For me, honor means…", value: "Record for Mission 8" }] } });
  await reset([...code, r14]);
  await page.goto(`${BASE}/personal-code`);
  await page.getByRole("button", { name: "Record for Mission 8" }).click();
  await page.getByLabel("For me, honor means…").fill("Owning my mistakes quickly.");
  await button("SAVE").click();
  await page.getByText("Owning my mistakes quickly.").waitFor();
  await open(14);
  await page.getByText("WHAT IT WORKED WITH").waitFor();
  await page.getByText("Record for Mission 8").waitFor();
  await page.goto(`${BASE}/log/${code[0].id}`);
  await button("Remove this record").click();
  await button("REMOVE").click();
  await button("RESTORE").waitFor();
  await open(29);
  await page.getByText("Your code line from Mission 8 isn't saved yet.").waitFor();
  await open(14);
  await page.getByText("Record for Mission 8").waitFor();
});

for (const [id, name] of [
  ["D13", "cross-user reads/writes and photo rules"],
  ["D14", "rollback with revision 2 records present"],
]) {
  await scenario(id, `${name} (database; see test:db)`, async (note) => {
    note("Covered by supabase/tests/curriculum_v2.test.mjs, folded in below.");
  });
}

await browser.close();

/* ---------- fold in the database checks and write the report ---------- */

let db = "";
let dbOk = true;
try {
  db = execFileSync("node", ["supabase/tests/curriculum_v2.test.mjs"], { encoding: "utf8" });
} catch (e) {
  db = e.stdout ?? String(e);
  dbOk = false;
}
const dbLines = db.split("\n").filter((l) => /^(PASS|FAIL)/.test(l));

const passed = results.filter((r) => r.ok).length;
const md = `# Curriculum revision 2: acceptance results

Generated by \`scripts/acceptance.mjs\` on ${new Date().toISOString().slice(0, 10)} against a
production build in demo mode (on-device storage), plus \`npm run test:db\`
(every migration on an in-process Postgres with first-curriculum data, then
0009). Synthetic data only.

**App scenarios: ${passed}/${results.length} pass. Database checks: ${dbLines.filter((l) => l.startsWith("PASS")).length}/${dbLines.length} pass.**

| ID | Scenario | Result | Notes |
|---|---|---|---|
${results.map((r) => `| ${r.id} | ${r.name} | ${r.ok ? "PASS" : "**FAIL**"} | ${r.notes.join(" ").replace(/\|/g, "\\|")} |`).join("\n")}

## Database checks (\`npm run test:db\`)

\`\`\`
${dbLines.join("\n")}
\`\`\`

## Not covered here

- Real devices (iOS Safari, Android Chrome) and screen readers, beyond the
  automated keyboard and ARIA checks in C12.
- A live Supabase project: the database tests run the real migrations on
  PGlite (Postgres 16) with Supabase's auth stubbed. Apply 0009 to a staging
  project and repeat C01–D12 there before release.
`;
writeFileSync(new URL("../docs/specs/acceptance-results.md", import.meta.url), md);
console.log(`\n${passed}/${results.length} app scenarios passed; database ${dbOk ? "passed" : "FAILED"}.`);
process.exit(passed === results.length && dbOk ? 0 : 1);
