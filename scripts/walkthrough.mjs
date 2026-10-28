/* Demo-mode walkthrough — drives the whole app end to end and captures
   screenshots into docs/screenshots/v2-rebuild/.

   Run: npm run build && PORT=3100 npm start &
        npm i --no-save playwright   # browsers come from /opt/pw-browsers or a local install
        node scripts/walkthrough.mjs */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:3100";
const OUT = new URL("../docs/screenshots/v2-rebuild", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// 1x1 red PNG for the photo-upload check.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const PHOTO = "/tmp/proof-photo.png"; // throwaway upload fixture
writeFileSync(PHOTO, PNG);

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

let step = 0;
// Full-page captures re-lay-out fixed elements, so anything modal (a sheet)
// is shot at the viewport instead — that's what a man actually sees.
async function shot(name, { full = true } = {}) {
  // Sheets rise and fade in over 220ms; don't photograph them mid-fade.
  if (!full) await page.waitForTimeout(400);
  step += 1;
  const file = `${OUT}/${String(step).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: file, fullPage: full });
  console.log("shot", file);
}
const fail = (msg) => {
  throw new Error(msg);
};

// A — Welcome
await page.goto(`${BASE}/welcome`);
await page.getByText("ENTER DEMO").waitFor();
await page.getByText("Three Scent Triggers. Three core values.").waitFor();
await page.getByText("30 action-oriented Missions").waitFor();
await shot("welcome");
if ((await page.getByRole("button", { name: "Save as an app" }).count()) > 0)
  fail("Save as an app belongs on the code screen, not Welcome");
// The Check Your Email screen carries it at the bottom
await page.goto(`${BASE}/verify?email=antonio%40example.com`);
await page.getByText("CHECK YOUR EMAIL").waitFor();
await page.getByRole("button", { name: "Save as an app" }).click();
await page.getByText("Add to Home Screen", { exact: true }).waitFor();
await page.getByText("Install app").waitFor();
await shot("save-as-app", { full: false });
await page.getByRole("button", { name: "GOT IT" }).click();
await page.goto(`${BASE}/welcome`);
await page.getByText("ENTER DEMO").click();

// B — Profile setup. The identity box opens with real, editable text in it,
// so CONTINUE is live the moment a name is typed.
await page.getByText("LET'S SET YOU UP").waitFor();
const identity = page.getByLabel(/I am becoming a man who/);
if ((await identity.inputValue()) !== "Keeps his word, acts despite fear, and follows through.")
  fail("the identity box did not open with the example in it");
await page.getByText("you can change it any time in Settings").waitFor();
await page.getByLabel("Name").fill("Antonio");
if (await page.getByRole("button", { name: "CONTINUE" }).isDisabled())
  fail("CONTINUE is still greyed out with the example in the box");
// Nothing duplicates the sentence that is already in the box
if ((await page.getByRole("button", { name: /Keeps his word/ }).count()) > 0)
  fail("the example chip is still there under a filled box");
await shot("profile-setup");
await page.getByRole("button", { name: "CONTINUE" }).click();

// C — How It Works: three screens, then straight into Mission 1
await page.getByText("MORE THAN COLOGNE").first().waitFor();
await page.getByText("Spray before you act. Do the hard thing. Log it.").waitFor();
await page.getByText("It becomes the signal for the man you're about to be.").waitFor();
if ((await page.getByText("twenty years").count()) > 0)
  fail("the twenty-years line is back");
await shot("onboarding-1");
await page.getByRole("button", { name: "NEXT" }).click();
// S.T.A.R. on its own screen, as four separate cards
await page.getByText("HOW OLFACTORY CONDITIONING WORKS").first().waitFor();
for (const step of ["Select", "Trigger", "Act", "Record"])
  await page.getByText(step, { exact: true }).first().waitFor();
// S is "Select your Scent Trigger", never "the core value"
await page.getByText("Select your Scent Trigger.").first().waitFor();
if ((await page.getByText(/core value you need/).count()) > 0)
  fail("S still says 'core value'");
await page.getByText("Repeat the practice. Let your scent remind you").first().waitFor();
await page.getByText("You condition yourself to a Scent Trigger").waitFor();
await shot("onboarding-2-star");
await page.getByRole("button", { name: "NEXT" }).click();
await page.getByText("MEET YOUR SCENT TRIGGERS").waitFor();
await page.getByText("You live by a moral code").waitFor();
await page.getByText("You fulfill your responsibilities through consistent effort and perseverance.").waitFor();
await page.getByText("You have everything you need").waitFor();
await shot("onboarding-3");
await page.getByRole("button", { name: "START MISSION 1" }).click();

// D — Mission 1 (curriculum revision 2): the S.T.A.R. steps as a form
await page.waitForURL("**/missions/1");
await page.getByText("Give Credit Where It Is Due").first().waitFor();
await page.getByText("BUILD SELF-TRUST · MISSION 1").waitFor();
for (const step of ["SELECT", "TRIGGER", "ACT", "RECORD"])
  await page.getByText(step, { exact: true }).first().waitFor();
await page.getByText("Spray the fragrance and breathe it in. Then begin the assigned task.").waitFor();
await page.getByText("About 2 minutes · Action").waitFor();
await page.getByText("DONE WHEN").waitFor();
await page.getByText("Let's get started with the S.T.A.R. System.").waitFor();
// The reminder opens the same four cards, at the TOP
await page.getByRole("button", { name: /reminder of how the S.T.A.R. System works/ }).click();
const starSheet = page.getByRole("dialog", { name: "THE S.T.A.R. SYSTEM" });
await starSheet.waitFor();
await page.waitForTimeout(400);
if ((await starSheet.evaluate((el) => el.scrollTop)) !== 0)
  fail("the S.T.A.R. reminder opened scrolled down instead of at the top");
await shot("star-reminder", { full: false });
await page.getByRole("button", { name: "GOT IT" }).click();
await shot("mission-1");
// The field opens blank. Options and examples are help: opening them never
// fills, ticks or saves anything (C03).
const m1 = page.getByLabel("Who did you thank, and what did you tell them?");
if ((await m1.inputValue()) !== "") fail("Mission 1's field should open blank");
await page.getByRole("button", { name: "Choose one way to do it" }).click();
await page.getByText("Give a coworker credit for something they made easier.").waitFor();
await page.getByRole("button", { name: "Need an example?" }).click();
await page.getByText("For inspiration. Write what is true for you.").waitFor();
await page.getByText(/I thanked my brother for checking in/).waitFor();
if ((await m1.inputValue()) !== "") fail("opening the examples filled the field");
if (await page.getByLabel("I have taken this action.").isChecked())
  fail("the action confirmation is ticked by default");
await shot("mission-1-options-and-examples");
// Honest completion: text AND confirmation (C04)
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 1" }).click();
await page.getByText("Write your record first.").waitFor();
await m1.fill("I thanked my brother for checking in on me during a rough week.");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 1" }).click();
await page.getByText(/Check “I have taken this action.”/).waitFor();
await shot("mission-1-confirm-required");
await page.getByLabel("I have taken this action.").check();
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 1" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();
await page.getByText("You acted with Honor.").waitFor();
await shot("mission-1-complete");

// E — Mission 2: change the scent, save a draft, come back, finish
await page.getByRole("button", { name: "CONTINUE TO MISSION 2" }).click();
await page.waitForURL("**/missions/2");
await page.getByText("Break the Avoidance Loop").first().waitFor();
await page.getByText("Let's use the S.T.A.R. System.").waitFor();
if ((await page.getByText("Let's get started with the S.T.A.R. System.").count()) > 0)
  fail("'get started' belongs on Mission 1 only");
await page.getByText("Recommended", { exact: true }).waitFor();
await page.getByRole("radio", { name: "honor" }).click();
if ((await page.getByRole("radio", { name: "honor" }).getAttribute("aria-checked")) !== "true")
  fail("switching fragrance did not stick");
await page.getByText("Recommended", { exact: true }).waitFor();
await shot("mission-2-fragrance-switched");
await page.getByRole("radio", { name: "courage" }).click();
const m2 = page.getByLabel("What were you avoiding, and what first step did you take?");
await m2.fill("I was avoiding the insurance call.");
await page.getByRole("button", { name: "SAVE DRAFT FOR LATER" }).click();
await page.getByText(/Draft saved .* It doesn't count as complete./).waitFor();
await page.goto(`${BASE}/missions/2`);
await page.getByText("DRAFT SAVED", { exact: true }).waitFor();
if ((await m2.inputValue()) !== "I was avoiding the insurance call.")
  fail("the draft didn't survive a reload");
await shot("mission-2-draft");
await m2.fill("I was avoiding the insurance call. I called and opened the claim.");
await page.getByLabel("I have taken this action.").check();
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 2" }).click();
await page.getByText("You acted with Courage.").waitFor();
await page.goto(`${BASE}/missions/2`);
await page.getByText("COMPLETE", { exact: true }).first().waitFor();
await page.getByText("opened the claim").waitFor();
await shot("mission-2-complete");

// F — Mission list: next by number, all 30 in their four stages
await page.goto(`${BASE}/missions`);
await page.getByText("YOUR 30-DAY MISSION").first().waitFor();
await page.getByText("2/30 COMPLETE").waitFor();
await page.getByText("NEXT · MISSION 3").waitFor();
await shot("mission-list");
await page.getByRole("button", { name: /SHOW ALL 30 MISSIONS/ }).click();
for (const stage of ["Build self-trust · 1–7", "Set your standards · 8–14", "Put your values to work · 15–21", "Build lasting momentum · 22–30"])
  await page.getByText(stage, { exact: true }).waitFor();
await shot("mission-list-all", { full: true });
await page.getByRole("button", { name: /SHOW LESS/ }).click();
await page.getByText("YOUR THREE SCENT TRIGGERS").waitFor();
await page.getByRole("button", { name: /What courage is for/i }).click();
await page.getByText("You do what you know is right despite fear, danger, or pressure to do otherwise.").first().waitFor();
await shot("fragrance-trio");

// G — Mission 7 carries the optional photo
await page.goto(`${BASE}/missions/7`);
await page.getByText("Give Your Practice a Place").first().waitFor();
await page
  .getByLabel("Where did you put it, and after what everyday event will you begin?")
  .fill("I put Honor beside my watch. After getting dressed, I will open the next mission.");
await page.locator('input[type="file"]').setInputFiles(PHOTO);
await page.getByLabel("Remove photo").waitFor();
await page.getByLabel("I have taken this action.").check();
await shot("mission-7-with-photo");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 7" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();

// H — A code Mission saves to the Personal Code, and isn't praised as a deed
await page.goto(`${BASE}/missions/8`);
await page.getByText("3–5 minutes · Code").waitFor();
if ((await page.getByLabel("I have taken this action.").count()) > 0)
  fail("a code Mission asks for action confirmation");
await page.getByLabel("For me, honor means…").fill("Telling the truth about my mistakes and fixing what I can.");
await page.getByRole("button", { name: "SAVE TO MY CODE" }).click();
await page.getByText("Your Personal Code is taking shape.").waitFor();
await shot("mission-8-code-saved");
await page.goto(`${BASE}/personal-code`);
await page.getByText("MY PERSONAL CODE").first().waitFor();
await page.getByText("Telling the truth about my mistakes").waitFor();
await page.getByText("LIVE IT EVERY DAY").waitFor();
await shot("personal-code");

// Mission 13: his identity statement pre-filled; viewing doesn't complete it
await page.goto(`${BASE}/missions/13`);
const m13 = page.getByLabel("I am becoming a man who…");
await m13.waitFor();
if ((await m13.inputValue()) !== "Keeps his word, acts despite fear, and follows through.")
  fail("Mission 13 didn't pre-fill his identity statement");
await page.getByText("NOT STARTED", { exact: true }).waitFor();
await shot("mission-13");
await page.goto(`${BASE}/missions`);
await page.getByText("4/30 COMPLETE").waitFor();

// Mission 22 explains what it needs and links back to 21
await page.goto(`${BASE}/missions/22`);
await page.getByText("BEFORE YOU COMPLETE THIS MISSION").waitFor();
await page.getByRole("link", { name: /GO TO MISSION 21/ }).waitFor();
await shot("mission-22-needs-aim");

// I — One-off Action: value, one field, one click
await page.goto(`${BASE}/missions`);
await page.getByText("ONE-OFF ACTION").first().click();
await page.waitForURL("**/action/declare");
await page.getByRole("radio", { name: "courage" }).click();
await page.getByLabel("What did you do?").fill("Made the call I'd been dodging.");
await shot("one-off-action");
await page.getByRole("button", { name: "LOG THIS ACTION" }).click();
await page.getByText("PROOF LOGGED.").waitFor();
await page.getByRole("button", { name: "DONE" }).click();
await page.waitForURL("**/missions");

// Claim Your Set: regular price struck through, sale price, and the saving
await page.goto(`${BASE}/shop`);
// Each price carries a screen-reader label ("Regular price $597"), so match
// on how the text ends rather than the whole string.
await page.getByText(/\$297$/).waitFor();
await page.getByText(/\$597$/).waitFor();
await page.getByText("YOU SAVE $300").waitFor();
await shot("claim-your-set");

// The claim-your-set row is at the foot of every screen in the app
for (const path of ["/missions", "/log", "/progress", "/settings"]) {
  await page.goto(`${BASE}${path}`);
  if ((await page.getByText("Click here to claim your set").count()) === 0)
    fail(`no buy row on ${path}`);
}

// J — Proof Log: every record, labelled with what it is
await page.goto(`${BASE}/log`);
await page.getByText("5 records · 4 actions").waitFor();
const oneOffRow = page.getByRole("link").filter({ hasText: "ONE-OFF ACTION" }).first();
if ((await oneOffRow.count()) === 0) fail("no one-off entry");
await page.getByText("MISSION 2 · BREAK THE AVOIDANCE LOOP").waitFor();
const codeRow = page.getByRole("link").filter({ hasText: "MISSION 8 · DEFINE YOUR HONOR" });
if ((await codeRow.getByText("CODE", { exact: true }).count()) !== 1)
  fail("Mission 8 isn't labelled as Code in the log");
await shot("log");

// Edit a one-off entry
await oneOffRow.click();
await page.getByRole("button", { name: "Edit this entry" }).click();
await page.getByLabel("What you did").fill("Made the call I'd been dodging for a month.");
await page.getByRole("button", { name: "SAVE", exact: true }).click();
await page.getByText("Made the call I'd been dodging for a month.").first().waitFor();
await shot("log-entry-edited");

// Remove a record, then restore it: same record, same date (D09)
await page.goto(`${BASE}/log`);
await codeRow.click();
await page.getByRole("button", { name: "Remove this record" }).click();
await page.getByText("Your words and date are kept").waitFor();
await shot("log-remove-confirm", { full: false });
await page.getByRole("button", { name: "REMOVE", exact: true }).click();
await page.getByRole("button", { name: "RESTORE" }).waitFor();
await page.goto(`${BASE}/missions/8`);
await page.getByText("REMOVED", { exact: true }).first().waitFor();
await page.goto(`${BASE}/missions`);
await page.getByText("3/30 COMPLETE").waitFor();
await page.goto(`${BASE}/missions/8`);
await page.getByRole("button", { name: "RESTORE" }).click();
await page.getByText("Restored.").waitFor();
await page.getByText("Telling the truth about my mistakes").waitFor();
await page.goto(`${BASE}/missions`);
await page.getByText("4/30 COMPLETE").waitFor();

// K — Progress: actions only (Missions 1, 2, 7 and the one-off); x/30 counts
// the code Mission too
await page.goto(`${BASE}/progress`);
await page.getByText("YOUR PROGRESS").waitFor();
const tile = (label) =>
  page
    .locator("div.glass", { has: page.getByText(label, { exact: true }) })
    .first()
    .locator("p")
    .first()
    .innerText();
const honor = Number(await tile("Honor"));
const courage = Number(await tile("Courage"));
const commitment = Number(await tile("Commitment"));
if (honor + courage + commitment !== 4)
  fail(`action tiles sum to ${honor + courage + commitment}, expected 4 (code isn't an action)`);
if ((await tile("Missions Completed")) !== "4/30") fail("Missions Completed should read 4/30");
await shot("progress");

// L — Settings and the guides
await page.goto(`${BASE}/settings`);
await page.getByText("The man I am becoming").waitFor();
await shot("settings");
// Returning men land on the S.T.A.R. System, not the pitch
await page.getByText("How It Works: The S.T.A.R. System").click();
await page.getByText("HOW OLFACTORY CONDITIONING WORKS").first().waitFor();
await shot("how-it-works");
await page.goto(`${BASE}/using-your-set`);
await page.getByText("USING YOUR SET").waitFor();
await page.getByText("One spray is often enough.").waitFor();
await page.getByText("These fragrances are strong.").waitFor();
if ((await page.getByText("The fragrance is the reminder.").count()) > 0)
  fail("the reminder/evidence line is back on Using Your Set");
await shot("using-your-set");

// Share: the three Settings rows, the share screen, and the images it sends
await page.goto(`${BASE}/settings`);
await page.getByText("The man I am becoming").waitFor();
for (const row of ["Share the app", "Share on social", "Save as an app on your phone"])
  if ((await page.getByRole("button", { name: row, exact: true }).count()) !== 1)
    fail(`Settings is missing the "${row}" row`);
await page.getByRole("button", { name: "Save as an app on your phone" }).click();
await page.getByText("SAVE IT AS AN APP").waitFor();
await shot("settings-save-as-app", { full: false });
await page.getByRole("button", { name: "GOT IT" }).click();
await page.getByRole("button", { name: "Share on social", exact: true }).click();
await page.getByRole("heading", { name: "SHARE THE APP" }).waitFor();
for (const label of ["Messages", "WhatsApp", "Instagram", "Facebook", "X", "LinkedIn", "Email", "COPY"])
  if ((await page.getByText(label, { exact: true }).count()) < 1)
    fail(`the share screen is missing ${label}`);
const wa = await page.getByRole("link", { name: "WhatsApp" }).getAttribute("href");
if (!wa?.startsWith("https://wa.me/?text=") || !wa.includes("missionfragrances.com"))
  fail(`WhatsApp link is wrong: ${wa}`);
await page.waitForFunction(() => {
  const img = document.querySelector('img[src="/share-card.png"]');
  return img && img.complete && img.naturalWidth === 1080;
});
await shot("share", { full: true });
for (const path of ["/share-card.png", "/opengraph-image", "/twitter-image"]) {
  const res = await page.request.get(`${BASE}${path}`);
  if (res.status() !== 200 || res.headers()["content-type"] !== "image/png")
    fail(`${path} is not a PNG (${res.status()} ${res.headers()["content-type"]})`);
}

// M — 30/30: seed 1–29 as valid revision 2 records, then finish 30 for real
await page.evaluate(() => {
  const read = JSON.parse(localStorage.getItem("mission.missions") ?? "[]");
  const now = Date.now();
  const triggers = ["honor", "courage", "commitment"];
  const kind = (n) =>
    n === 6 ? "reflection" : n >= 8 && n <= 13 ? "code" : [21, 27, 30].includes(n) ? "plan" : "action";
  const tomorrow = new Date(now + 86400000).toISOString().slice(0, 10);
  for (let n = 1; n <= 29; n += 1) {
    if (read.some((m) => m.mission_number === n && m.status === "completed")) continue;
    const at = new Date(now - (30 - n) * 86400000).toISOString();
    read.push({
      id: crypto.randomUUID(), user_id: "demo-user", trigger: triggers[n % 3],
      action_text: `Seeded record for Mission ${n}`, reflection: `Seeded record for Mission ${n}`,
      action_category: "dev-seed", status: "completed", started_at: at, completed_at: at,
      ended_at: null, mission_number: n, question_answer: null, photo_url: null,
      kind: kind(n), curriculum_version: 2, confirmed: kind(n) === "action", context: {},
      focus_area: n === 21 ? "Work" : null, frequency: n === 27 ? "Daily" : null,
      review_date: n === 27 ? tomorrow : null, updated_at: at, removed_at: null, history: null,
    });
  }
  localStorage.setItem("mission.missions", JSON.stringify(read));
});
await page.goto(`${BASE}/missions/30`);
await page.getByText("Carry Your Momentum Forward").first().waitFor();
// 30 shows the practice from 27 and recent actions as context
await page.getByText("YOUR PRACTICE · MISSION 27").waitFor();
await page.getByText("YOUR RECENT ACTIONS").waitFor();
await page
  .getByLabel("I learned ____. After ____, I will ____. If I miss, I will ____.")
  .fill("I learned mornings work best. After breakfast, I will study ten minutes. If I miss, I will do one exercise at the next opportunity.");
await page.getByText("Daily", { exact: true }).click();
if (!(await page.getByRole("radio", { name: "Daily" }).isChecked())) fail("frequency did not select");
await page.getByRole("button", { name: "SAVE PRACTICE PLAN" }).click();
await page.getByText("Choose a review date.").waitFor();
const inAWeek = new Date(Date.now() + 7 * 86400000);
await page
  .getByLabel("REVIEW DATE")
  .fill(`${inAWeek.getFullYear()}-${String(inAWeek.getMonth() + 1).padStart(2, "0")}-${String(inAWeek.getDate()).padStart(2, "0")}`);
await shot("mission-30-plan");
await page.getByRole("button", { name: "SAVE PRACTICE PLAN" }).click();
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await page.getByText("Your practice plan is saved.").waitFor();
await shot("mission-30-complete");
await page.goto(`${BASE}/progress`);
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await shot("progress-30-of-30");
await page.goto(`${BASE}/missions`);
await page.getByText("All 30 Missions done. Your Proof Log stays open.").waitFor();
await shot("mission-list-complete");

// N — Old routes still land somewhere real
await page.goto(`${BASE}/course`);
await page.waitForURL("**/missions");
await page.goto(`${BASE}/home`);
await page.waitForURL("**/missions");

// O — Desktop width sanity
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${BASE}/missions`);
await page.getByText("YOUR 30-DAY MISSION").first().waitFor();
await shot("desktop-missions");

await browser.close();
console.log("WALKTHROUGH PASSED");
