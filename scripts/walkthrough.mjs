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
await page.getByText("pull up, on command").waitFor();
await page.getByText("It becomes the signal for the man you're about to be.").waitFor();
if ((await page.getByText("twenty years").count()) > 0)
  fail("the twenty-years line is back");
await shot("onboarding-1");
await page.getByRole("button", { name: "NEXT" }).click();
// S.T.A.R. on its own screen, as four separate cards
await page.getByText("HOW OLFACTORY CONDITIONING WORKS").first().waitFor();
for (const step of ["Select", "Trigger", "Act", "Record"])
  await page.getByText(step, { exact: true }).first().waitFor();
await page.getByText("it becomes hardwired").waitFor();
await page.getByText("You condition yourself to a Scent Trigger").waitFor();
await shot("onboarding-2-star");
await page.getByRole("button", { name: "NEXT" }).click();
await page.getByText("MEET YOUR SCENT TRIGGERS").waitFor();
await page.getByText("You live by a moral code").waitFor();
await page.getByText("You fulfill your responsibilities through consistent effort and perseverance.").waitFor();
await page.getByText("You have everything you need").waitFor();
await shot("onboarding-3");
await page.getByRole("button", { name: "START MISSION 1" }).click();

// D — Mission 1: one field, one click
await page.waitForURL("**/missions/1");
await page.getByText("Prove It").first().waitFor();
// The four steps, in order, with SELECT before any spray
for (const step of ["SELECT", "TRIGGER", "ACT", "RECORD"])
  await page.getByText(step, { exact: true }).first().waitFor();
await page.getByText("Spray your selected fragrance.").waitFor();
await page.getByText("This should take you less than 60 seconds.").waitFor();
await page.getByText("Let's get started with the S.T.A.R. System.").waitFor();
if ((await page.getByText("Spray your Scent Trigger").count()) > 0)
  fail("a spray instruction is back inside the Mission copy");
// The reminder opens the same four cards
await page.getByRole("button", { name: /reminder of how the S.T.A.R. System works/ }).click();
await page.getByRole("dialog", { name: "THE S.T.A.R. SYSTEM" }).waitFor();
await shot("star-reminder", { full: false });
await page.getByRole("button", { name: "GOT IT" }).click();
if ((await page.getByRole("button", { name: /DECLARE/ }).count()) > 0)
  fail("declare step is back");
if ((await page.getByText("Use a different fragrance").count()) > 0)
  fail("fragrance picker is back");
if ((await page.getByText("Private. Only you ever see this.").count()) > 0)
  fail("private-question line is back");
await shot("mission-1");
// A commitment: the field opens on "I commit to", and that alone isn't enough
const m1 = page.getByLabel("What are you going to do?");
if ((await m1.inputValue()) !== "I commit to ")
  fail("the commitment field did not open on 'I commit to'");
if (!(await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 1" }).isDisabled()))
  fail("the bare 'I commit to' was accepted as an answer");
// Three examples to tap; one tap fills the field and they all go
if ((await page.getByRole("button", { name: /Use this example/ }).count()) !== 3)
  fail("Mission 1 should offer three examples");
await page.getByRole("button", { name: /Use this example/ }).first().click();
if (!(await m1.inputValue()).startsWith("I commit to telling someone"))
  fail("tapping the example did not fill the field");
if ((await page.getByRole("button", { name: /Use this example/ }).count()) > 0)
  fail("the examples are still there once the field has an answer");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 1" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();
await page.getByText("You acted with Honor.").waitFor();
await shot("mission-1-complete");

// It must land as a Proof straight away, with the Mission marked complete
await page.getByRole("button", { name: "CONTINUE TO THE NEXT MISSION" }).click();
await page.waitForURL("**/missions/2");
await page.getByText("Stop Putting It Off").first().waitFor();
// The fragrance cue carries the T of S.T.A.R. now the ritual screen is gone
await page.getByText("Recommended", { exact: true }).waitFor();
await shot("mission-2");
// All three bottles are on screen under the Select step
await page.getByText("Select your Scent Trigger.").waitFor();
// One tap changes the one he is wearing
await page.getByRole("radio", { name: "honor" }).click();
// The recommendation stays marked on its own tile even once he overrides it
await page.getByText("Recommended", { exact: true }).waitFor();
if ((await page.getByRole("radio", { name: "honor" }).getAttribute("aria-checked")) !== "true")
  fail("switching fragrance did not stick");
await shot("mission-2-fragrance-switched");
await page.getByRole("radio", { name: "courage" }).click();
await page.getByText("Recommended", { exact: true }).waitFor();

// E — Mission 2, completed from the list side
await page
  .getByLabel("What are you done putting off?")
  .fill("I commit to calling the insurance company about the claim.");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 2" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();

await page.goto(`${BASE}/missions/2`);
await page.getByText("COMPLETE", { exact: true }).first().waitFor();
if ((await page.getByText("calling the insurance company").count()) === 0)
  fail("the proof is not shown on the completed Mission");
await shot("mission-2-complete");

// F — Mission list: Complete / Not Started only, all 30 one tap away
await page.goto(`${BASE}/missions`);
await page.getByText("YOUR 30-DAY MISSION").first().waitFor();
await page.getByText("2/30 COMPLETE").waitFor();
if ((await page.getByText("IN PROGRESS").count()) > 0)
  fail("an in-progress state survived");
await shot("mission-list");
await page.getByRole("button", { name: /SHOW ALL 30 MISSIONS/ }).click();
await page.getByText("ALL MISSIONS").waitFor();
if ((await page.getByText("MISSION 30").count()) === 0)
  fail("Mission 30 not reachable");

// The three bottles at the foot of the list: side by side, tap to read
await page.getByRole("button", { name: /SHOW LESS/ }).click();
await page.getByText("YOUR THREE SCENT TRIGGERS").waitFor();
await page.getByRole("button", { name: /What courage is for/i }).click();
if ((await page.getByText("Courage is built, not born.").count()) === 0)
  fail("the bottle did not open its description");
await shot("fragrance-trio");

// G — A Mission that carries a photo (Mission 7)
await page.goto(`${BASE}/missions/7`);
await page.getByText("Build Your Shrine").first().waitFor();
await page
  .getByLabel("Where did you put them?")
  .fill("Top of the dresser — three bottles and my grandfather's watch.");
await page.locator('input[type="file"]').setInputFiles(PHOTO);
await page.getByLabel("Remove photo").waitFor();
await shot("mission-7-with-photo");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 7" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();

// H — A Personal Code Mission writes its answer through to the code
await page.goto(`${BASE}/missions/8`);
await page.getByLabel("For me, honor means…").fill("Doing what I said I'd do, even when it costs me.");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 8" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();
await page.goto(`${BASE}/personal-code`);
await page.getByText("MY PERSONAL CODE").first().waitFor();
if ((await page.getByText("Doing what I said I'd do").count()) === 0)
  fail("Mission 8's answer did not reach the Personal Code");
await shot("personal-code");

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

// J — Proof Log: every proof, Missions and one-offs together
await page.goto(`${BASE}/log`);
await page.getByText("5 proofs logged").waitFor();
// The intro line mentions One-Off Actions too, so match the row itself
const oneOffRow = page
  .getByRole("link")
  .filter({ hasText: "ONE-OFF ACTION" })
  .first();
if ((await oneOffRow.count()) === 0) fail("no one-off entry");
if ((await page.getByText("MISSION 2 · STOP PUTTING IT OFF").count()) === 0)
  fail("no Mission entry");
await shot("log");

// Edit an entry
await oneOffRow.click();
await page.getByRole("button", { name: "Edit or delete this entry" }).click();
if ((await page.getByText("ADD A PHOTO").count()) > 0)
  fail("the photo option is back in the Proof Log editor");
await page.getByLabel("What you did").fill("Made the call I'd been dodging for a month.");
await page.getByRole("button", { name: "SAVE", exact: true }).click();
await page.getByText("Made the call I'd been dodging for a month.").first().waitFor();
await shot("log-entry-edited");

// Delete a Mission proof → that Mission reads Not Started again
await page.goto(`${BASE}/log`);
await page.getByText("MISSION 8 · HONOR, IN YOUR WORDS").click();
await page.getByRole("button", { name: "Edit or delete this entry" }).click();
await page.getByRole("button", { name: "Delete entry" }).click();
await page.getByText("reads Not Started again").waitFor();
await shot("log-delete-confirm");
await page.getByRole("button", { name: "DELETE ENTRY", exact: true }).click();
await page.getByText("PROOF LOG").first().waitFor();
await page.goto(`${BASE}/missions/8`);
await page.getByText("NOT STARTED").first().waitFor();
// Re-log it for the numbers below
await page.getByLabel("For me, honor means…").fill("Doing what I said I'd do, even when it costs me.");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 8" }).click();
await page.getByText("MISSION COMPLETE.").waitFor();

// K — Progress: the value tiles count Missions, not just one-offs
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
if (honor + courage + commitment !== 5)
  fail(`value tiles sum to ${honor + courage + commitment}, expected 5`);
if (honor === 0) fail("Honor is 0 though Mission 8 was logged with Honor");
if ((await page.getByText("Actions In Progress").count()) > 0)
  fail("the Actions In Progress tile survived");
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

// M — 30/30: seed the rest straight into demo storage, then finish 30 for real
await page.evaluate(() => {
  const read = JSON.parse(localStorage.getItem("mission.missions") ?? "[]");
  const now = Date.now();
  const triggers = ["honor", "courage", "commitment"];
  for (let n = 1; n <= 29; n += 1) {
    if (read.some((m) => m.mission_number === n && m.status === "completed"))
      continue;
    read.push({
      id: crypto.randomUUID(),
      user_id: "demo-user",
      trigger: triggers[n % 3],
      action_text: `Seeded proof for Mission ${n}`,
      action_category: "dev-seed",
      status: "completed",
      started_at: new Date(now - (30 - n) * 86400000).toISOString(),
      completed_at: new Date(now - (30 - n) * 86400000 + 3600000).toISOString(),
      ended_at: null,
      reflection: `Seeded proof for Mission ${n}`,
      mission_number: n,
      question_answer: null,
      photo_url: null,
    });
  }
  localStorage.setItem("mission.missions", JSON.stringify(read));
});
await page.goto(`${BASE}/missions/30`);
await page.getByText("Choose the Next Mission").first().waitFor();
await page
  .getByLabel("What's next?")
  .fill("Courage — one hard conversation a week, for thirty days.");
await page.getByRole("button", { name: "RECORD · COMPLETE MISSION 30" }).click();
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await shot("mission-30-complete");
await page.goto(`${BASE}/progress`);
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await shot("progress-30-of-30");
await page.goto(`${BASE}/missions`);
await page.getByText("30 Missions. 30 proofs. Your Proof Log stays open.").waitFor();
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
