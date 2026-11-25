/* Rewrites the 30 Mission pages of docs/specs/curriculum-v2-spec.txt from
   src/content/missions.ts, after a content revision the team has agreed.
   Run: node scripts/write-spec-pages.mjs, then npm run check:copy. */
import { readFileSync, writeFileSync } from "node:fs";

const specUrl = new URL("../docs/specs/curriculum-v2-spec.txt", import.meta.url);
const spec = readFileSync(specUrl, "utf8");
const source = readFileSync(new URL("../src/content/missions.ts", import.meta.url), "utf8");

const STAGE = {
  standards: "Know your code",
  "self-trust": "Build self-trust",
  values: "Put your values to work",
  momentum: "Build lasting momentum",
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const body = source.slice(source.indexOf("export const MISSIONS"));
const pages = [];
for (const block of body.split(/\n  \{\n/).slice(1)) {
  const str = (field) => {
    const m = block.match(new RegExp(`\\n    ${field}: ("(?:[^"\\\\]|\\\\.)*")`));
    return m ? JSON.parse(m[1]) : undefined;
  };
  const list = (field) => {
    const m = block.match(new RegExp(`\\n    ${field}: \\[([\\s\\S]*?)\\n    \\]`));
    return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => JSON.parse(`"${x[1]}"`));
  };
  const n = Number(block.match(/number: (\d+)/)[1]);
  const choices = list("choices");
  const examples = list("examples");
  const lines = [
    `Mission ${n} ${str("title")}`,
    `${STAGE[str("stage")]}  |  ${cap(str("recommendedTrigger"))}  |  ${cap(str("kind"))}  |  ${str("time")}`,
    `Hook ${str("hook")}`,
    `Select ${str("select")}`,
    "Trigger Spray your Scent Trigger. Then begin the assigned task.",
    "Act",
    str("action"),
    "Choose one way to do it",
    ...choices.map((c, i) => `${i + 1}. ${c}`),
    "Record",
    str("prompt"),
    `Example 1 ${examples[0]}`,
    `Example 2 ${examples[1]}`,
    `Done when ${str("doneWhen")}`,
    ...(str("note") ? [`User note ${str("note")}`] : []),
    "Implementation and sequence",
    str("implementation"),
    `Revision rationale ${str("rationale")}`,
  ];
  pages.push(lines.join("\n"));
}

const lines = spec.split("\n");
const start = lines.findIndex((l) => l.startsWith("Mission 1 "));
const end = lines.findIndex((l) => l.startsWith("Acceptance tests for content"));
const out = [...lines.slice(0, start), ...pages.join("\n").split("\n"), ...lines.slice(end)].join("\n");
writeFileSync(specUrl, out);
console.log(`Wrote ${pages.length} Mission pages.`);
