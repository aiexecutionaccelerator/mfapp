/* V2 demo-mode walkthrough — drives the README acceptance script end to end
   and captures screenshots into docs/screenshots/v2-rebuild/.

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
async function shot(name) {
  step += 1;
  const file = `${OUT}/${String(step).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log("shot", file);
}
const fail = (msg) => {
  throw new Error(msg);
};

// A — Welcome
await page.goto(`${BASE}/welcome`);
await page.getByText("ENTER DEMO").waitFor();
await shot("welcome");
await page.getByText("ENTER DEMO").click();

// B — Profile setup
await page.getByText("LET'S SET YOU UP").waitFor();
await page.getByLabel("Name").fill("Antonio");
await page.getByText("Keeps the promises he makes to himself.").click();
await shot("profile-setup");
await page.getByRole("button", { name: "CONTINUE" }).click();

// Onboarding screens 1–4
await page.getByText("THIS IS MORE THAN FRAGRANCE").waitFor();
await shot("onboarding-1");
await page.getByRole("button", { name: "NEXT" }).click();
await page.getByText("MEET YOUR SCENT TRIGGERS").waitFor();
await shot("onboarding-2");
await page.getByRole("button", { name: "NEXT" }).click();
await page.getByText("USE S.T.A.R.").waitFor();
await shot("onboarding-3");
await page.getByRole("button", { name: "NEXT" }).click();
await page.getByText("TAKE YOUR FIRST ACTION").waitFor();
await shot("onboarding-4");
await page.getByRole("button", { name: "NOT YET — LET ME EXPLORE" }).click();

// Mission list, set on the way; all 30 visible, no locks
await page.getByText("YOUR 30-DAY MISSION").first().waitFor();
await page.getByText("Your set is on the way").waitFor();
if ((await page.getByText("MISSION 30").count()) === 0) fail("Mission 30 not visible");
await shot("mission-list-ordered");

// Out-of-order access: open Mission 10, read it, leave — nothing completes
await page.goto(`${BASE}/missions/10`);
await page.getByText("Commitment, in Your Words").first().waitFor();
await shot("mission-10-open");
await page.goto(`${BASE}/missions`);
if ((await page.getByText("COMPLETE", { exact: true }).count()) > 0)
  fail("reading completed something");

// Mark the set arrived from the banner
await page.getByRole("button", { name: "MY SET HAS ARRIVED" }).click();
await page.getByText("Your set is on the way").waitFor({ state: "detached" });

// Mission 2 — answer, pick STANDARD, declare, STAR sheet, go
await page.goto(`${BASE}/missions/2`);
await page.getByText("Send the Message").first().waitFor();
await page
  .getByLabel("What conversation, email, or message have you been avoiding?")
  .fill("The email to my business partner.");
await page.getByText("Send the email or message you have been postponing.").click();
await shot("mission-2-brief");
await page.getByRole("button", { name: "DECLARE MY ACTION" }).click();
await page.getByText("I'M GOING TO DO IT").waitFor();
await shot("mission-2-star-sheet");
await page.getByRole("button", { name: "I'M GOING TO DO IT" }).click();
await page.getByText("YOUR ACTION").waitFor();
await shot("mission-2-in-progress");

// Persistence across reload
await page.reload();
await page.getByText("YOUR ACTION").waitFor();

// Start shows ACTION IN PROGRESS → I DID IT → proof form
await page.goto(`${BASE}/home`);
await page.getByText("ACTION IN PROGRESS").waitFor();
await shot("start-action-in-progress");
await page.getByRole("button", { name: "I DID IT" }).click();
await page.getByText("RECORD THE EVIDENCE").waitFor();
await page.getByText("What did you do?").waitFor();
await page
  .getByLabel("What did you do?")
  .fill("I sent the email and asked for the conversation.");
await shot("mission-2-proof-form");
await page.getByRole("button", { name: "LOG THE PROOF" }).click();
await page.getByText("You acted with Courage.").waitFor();
await shot("mission-2-proof-logged");
await page.getByRole("button", { name: "VIEW MY MISSION LOG" }).click();
await page.getByText("MISSION LOG").waitFor();

// Free-form Mission from Start, with a photo
await page.goto(`${BASE}/home`);
await page.getByText("NEXT MISSION · MISSION 1").waitFor(); // state B is back
await page.getByLabel(/Start a Courage Mission/).click();
await page.getByText("WRITE MY OWN ACTION").click();
await page.locator('input[aria-label="Your action"]').fill("Make the difficult call to Yuri.");
await page.getByRole("button", { name: "CONTINUE" }).click();
await page.getByRole("button", { name: "START MISSION" }).click();
await page.getByText("MISSION ACTIVE").waitFor();
await shot("freeform-active-stoic");
await page.getByRole("button", { name: "CHECK IN NOW" }).click();
await page.getByRole("button", { name: "YES — I DID IT" }).click();
await page.getByLabel("What did you do?").fill("Called and settled it.");
await page.locator('input[type="file"]').setInputFiles(PHOTO);
await page.getByLabel("Remove photo").waitFor();
await shot("freeform-proof-with-photo");
await page.getByRole("button", { name: "LOG THE PROOF" }).click();
await page.getByText("PROOF #2 LOGGED").first().waitFor();
await shot("freeform-complete");

// Log — both entries, filters, edit, delete-reverts
await page.goto(`${BASE}/log`);
await page.getByText("2 proofs logged").waitFor();
if ((await page.getByText("PERSONAL MISSION").count()) === 0) fail("no free-form entry");
if ((await page.getByText("MISSION 2 · SEND THE MESSAGE").count()) === 0)
  fail("no structured entry");
await shot("log-both-entries");
await page.getByText("HONOR", { exact: true }).click();
if ((await page.getByText("PERSONAL MISSION").count()) > 0) fail("filter failed");
await page.getByText("ALL", { exact: true }).click();

// Edit the free-form entry
await page.getByText("PERSONAL MISSION").first().click();
await page.getByRole("button", { name: "Edit entry" }).click();
await page.getByLabel("Declared action").fill("Make the difficult call to Yuri today.");
await page.getByRole("button", { name: "SAVE", exact: true }).click();
await page.getByText("Make the difficult call to Yuri today.").waitFor();
await shot("log-entry-edited");

// Delete the structured proof → Mission 2 reverts to in progress
await page.goto(`${BASE}/log`);
await page.getByText("MISSION 2 · SEND THE MESSAGE").click();
await page.getByRole("button", { name: "Delete entry" }).click();
await page.getByText("goes back to in progress").waitFor();
await shot("log-delete-confirm");
await page.getByRole("button", { name: "DELETE ENTRY", exact: true }).click();
await page.getByText("MISSION LOG").waitFor();
await page.goto(`${BASE}/missions/2`);
await page.getByText("YOUR ACTION").waitFor(); // reverted to in progress
await shot("mission-2-reverted");
// Re-complete it for the numbers below
await page.getByRole("button", { name: "I DID IT" }).click();
await page.getByLabel("What did you do?").fill("Sent it. Conversation booked.");
await page.getByRole("button", { name: "LOG THE PROOF" }).click();
await page.getByText("You acted with Courage.").waitFor();

// Progress + Personal Code
await page.goto(`${BASE}/progress`);
await page.getByText("YOUR PROGRESS").waitFor();
await shot("progress");
await page.goto(`${BASE}/personal-code`);
await page.getByText("MY PERSONAL CODE").waitFor();
await shot("personal-code");

// Settings, How It Works replay, Using Your Set
await page.goto(`${BASE}/settings`);
await page.getByText("The man I am becoming").waitFor();
await shot("settings");
await page.getByText("How It Works").click();
await page.getByText("THIS IS MORE THAN FRAGRANCE").waitFor();
await shot("how-it-works");
await page.goto(`${BASE}/using-your-set`);
await page.getByText("USING YOUR SET").waitFor();
await shot("using-your-set");

// 30/30: seed 1–29 straight into demo storage, then finish Mission 30 for real
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
      action_text: `Seeded action for Mission ${n}`,
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
  .getByLabel(/next 30-day commitment/)
  .fill("Walk twenty minutes, four times a week — anchored to Commitment.");
await page.getByText("Write the next commitment.").click();
await page.getByRole("button", { name: "DECLARE MY ACTION" }).click();
await page.getByRole("button", { name: "I'M GOING TO DO IT" }).click();
await page.getByText("YOUR ACTION").waitFor();
await page.getByRole("button", { name: "I DID IT" }).click();
await page.getByLabel("What did you do?").fill("Wrote it down and scheduled week one.");
await page.getByRole("button", { name: "LOG THE PROOF" }).click();
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await shot("mission-30-complete");
await page.goto(`${BASE}/progress`);
await page.getByText("30-DAY MISSION COMPLETE").waitFor();
await shot("progress-30-of-30");
await page.goto(`${BASE}/home`);
await page.getByText("Keep Building the Evidence").waitFor();
await shot("start-state-d");
await page.goto(`${BASE}/missions`);
await shot("mission-list-complete");

// Old route redirects
await page.goto(`${BASE}/course`);
await page.waitForURL("**/missions");

// Desktop width sanity
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${BASE}/missions`);
await page.getByText("YOUR 30-DAY MISSION").first().waitFor();
await shot("desktop-missions");

await browser.close();
console.log("WALKTHROUGH PASSED");
