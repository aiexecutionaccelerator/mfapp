/* The Mission copy must match curriculum revision 2 word for word.
   Run: npm run check:copy. Fails (exit 1) and names every difference.

   Reads the spec (docs/specs/curriculum-v2-spec.txt) and the Missions
   (src/content/missions.ts) and checks, for each of the 30: title, stage,
   value, kind, time, hook, select, action, the three approaches, prompt, the
   two examples, Done when and the note. Also checks the totals (C01): 20
   actions, 6 code, 3 plans, 1 reflection. */
import { readFileSync } from "node:fs";

const spec = readFileSync(
  new URL("../docs/specs/curriculum-v2-spec.txt", import.meta.url),
  "utf8",
);
const source = readFileSync(
  new URL("../src/content/missions.ts", import.meta.url),
  "utf8",
);

const STAGES = {
  "Build self-trust": "self-trust",
  "Set your standards": "standards",
  "Put your values to work": "values",
  "Build lasting momentum": "momentum",
};

/* ---------- the spec's 30 Mission pages ---------- */

const lines = spec.split("\n");
const start = lines.findIndex((l) => l.startsWith("Mission 1 Give Credit"));
const end = lines.findIndex((l) => l.startsWith("Acceptance tests for content"));
const pages = [];
for (const line of lines.slice(start, end)) {
  const m = line.match(/^Mission (\d+) (.+)$/);
  if (m && Number(m[1]) === pages.length + 1) {
    pages.push({ number: Number(m[1]), title: m[2].trim(), raw: [] });
  } else pages.at(-1).raw.push(line);
}

const problems = [];

function parsePage(page) {
  const r = page.raw.filter((l) => l.trim());
  const [stage, value, kind, time] = r[0].split("|").map((s) => s.trim());
  let i = 1;
  const take = (prefix) => {
    if (!r[i].startsWith(prefix)) throw new Error(`Mission ${page.number}: expected "${prefix}", got "${r[i]}"`);
    return r[i++].slice(prefix.length).trim();
  };
  const def = {
    title: page.title,
    stage: STAGES[stage],
    recommendedTrigger: value.toLowerCase(),
    kind: kind.toLowerCase(),
    time,
    hook: take("Hook "),
    select: take("Select "),
  };
  take("Trigger ");
  i += 1; // "Act"
  def.action = r[i++];
  i += 1; // "Choose one way to do it"
  def.choices = [take("1. "), take("2. "), take("3. ")];
  i += 1; // "Record"
  def.prompt = r[i++];
  def.examples = [take("Example 1 "), take("Example 2 ")];
  def.doneWhen = take("Done when ");
  if (r[i].startsWith("User note ")) def.note = take("User note ");
  return def;
}

/* ---------- the app's Missions ---------- */

const body = source.slice(source.indexOf("export const MISSIONS"));
const blocks = body.split(/\n  \{\n/).slice(1);
const appMissions = new Map();
for (const block of blocks) {
  const n = Number(block.match(/number: (\d+)/)?.[1]);
  const str = (field) => {
    const m = block.match(new RegExp(`\\n    ${field}: ("(?:[^"\\\\]|\\\\.)*")`));
    return m ? JSON.parse(m[1]) : undefined;
  };
  const list = (field) => {
    const m = block.match(new RegExp(`\\n    ${field}: \\[([\\s\\S]*?)\\n    \\]`));
    return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => JSON.parse(`"${x[1]}"`)) : undefined;
  };
  appMissions.set(n, {
    title: str("title"),
    stage: str("stage"),
    recommendedTrigger: str("recommendedTrigger"),
    kind: str("kind"),
    time: str("time"),
    hook: str("hook"),
    select: str("select"),
    action: str("action"),
    choices: list("choices"),
    prompt: str("prompt"),
    examples: list("examples"),
    doneWhen: str("doneWhen"),
    note: str("note"),
  });
}

if (pages.length !== 30) problems.push(`spec has ${pages.length} Missions, expected 30`);
if (appMissions.size !== 30) problems.push(`app has ${appMissions.size} Missions, expected 30`);

const kinds = {};
for (const page of pages) {
  const want = parsePage(page);
  const have = appMissions.get(page.number);
  if (!have) {
    problems.push(`Mission ${page.number}: missing from missions.ts`);
    continue;
  }
  kinds[have.kind] = (kinds[have.kind] ?? 0) + 1;
  for (const [field, value] of Object.entries({ note: undefined, ...want })) {
    const a = JSON.stringify(value);
    const b = JSON.stringify(have[field]);
    if (a !== b) problems.push(`Mission ${page.number} ${field}:\n      spec: ${a}\n      app:  ${b}`);
  }
}

const expected = { action: 20, code: 6, plan: 3, reflection: 1 };
for (const [kind, count] of Object.entries(expected))
  if (kinds[kind] !== count) problems.push(`${kind}: ${kinds[kind] ?? 0} Missions, expected ${count}`);

if (problems.length) {
  console.error(`Copy check failed: ${problems.length} difference(s) from the spec:\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("Copy check passed: all 30 Missions match curriculum revision 2.");
