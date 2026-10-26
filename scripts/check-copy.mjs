/* Antonio's rule, enforced: Mission copy stays short and sounds like a man
   talks. Run: npm run check:copy. Fails (exit 1) and names every line over.

   Limits are words per field. They are deliberately tight — every review so
   far has said the same thing: too wordy, not American. */
import { readFileSync } from "node:fs";

const SOURCE = new URL("../src/content/missions.ts", import.meta.url);
const text = readFileSync(SOURCE, "utf8");

const LIMITS = { statement: 18, action: 12, inputLabel: 7, example: 12 };
// Tells of written-not-spoken English.
const BANNED = [
  ["—", "em-dash"],
  [";", "semicolon"],
  [/\bwhilst\b|\btowards\b|\bcolour\b|\bpractis/i, "British spelling"],
];

const problems = [];
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

function check(mission, field, value, limit) {
  if (words(value) > limit)
    problems.push(`Mission ${mission} ${field}: ${words(value)} words (max ${limit}) — "${value}"`);
  for (const [pattern, name] of BANNED) {
    const hit = typeof pattern === "string" ? value.includes(pattern) : pattern.test(value);
    if (hit) problems.push(`Mission ${mission} ${field}: ${name} — "${value}"`);
  }
}

// Walk each Mission object in the MISSIONS array.
const body = text.slice(text.indexOf("export const MISSIONS"));
for (const block of body.split(/\n  \{\n/).slice(1)) {
  const n = block.match(/number: (\d+)/)?.[1] ?? "?";
  for (const field of ["statement", "action", "inputLabel"]) {
    const value = block.match(new RegExp(`${field}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    if (value !== undefined) check(n, field, JSON.parse(`"${value}"`), LIMITS[field]);
  }
  const examples = block.match(/examples: \[([\s\S]*?)\]/)?.[1] ?? "";
  for (const m of examples.matchAll(/"((?:[^"\\]|\\.)*)"/g))
    check(n, "example", JSON.parse(`"${m[1]}"`), LIMITS.example);
}

if (problems.length) {
  console.error(`Copy check failed — ${problems.length} line(s):\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("Copy check passed: every Mission line is within limits.");
