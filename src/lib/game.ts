import { CODE_LINES, isLive, kindOf } from "@/lib/curriculum";
import type { Mission, Trigger } from "@/lib/data/types";

/**
 * Levels, XP, the day streak and achievements (24 Nov 2026).
 *
 * Nothing here is stored. Everything is replayed from his records in the
 * order he completed them, so it can't drift, can't be gamed by editing a
 * counter, and every achievement knows the day it was earned. Removing a
 * record takes its XP away until it is restored.
 *
 * Level 30 lands with the course: the XP for level 30 is exactly what the
 * 30 Missions and the course achievements give together. Streaks, Activate
 * actions and the other achievements are extra, so most men will reach 30 a
 * little before Mission 30. The cap is 100. Each level costs more than the
 * last (the curve's exponent is 1.618); one Activate action a day with a
 * streak going reaches 100 in about a year after the course.
 */

/* ---------- rarity (after Path of Exile's item colours) ---------- */

export type Rarity = "normal" | "magic" | "rare" | "unique";

export const RARITY_XP: Record<Rarity, number> = {
  normal: 25,
  magic: 50,
  rare: 100,
  unique: 250,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  normal: "Common",
  magic: "Magic",
  rare: "Rare",
  unique: "Unique",
};

/* ---------- XP sources ---------- */

export const MISSION_XP = 100;
export const ACTIVATE_XP = 30;
/** Activate actions past this many in one day still count as proof, not XP. */
export const ACTIVATE_XP_PER_DAY = 3;
/** Each day of a streak after the first adds 2 XP to that day, up to 20. */
const streakBonus = (streak: number) => Math.min(Math.max(streak - 1, 0), 10) * 2;

/* ---------- achievements ---------- */

export type Glyph =
  | "sunrise" | "scroll" | "triangle" | "compass" | "shield" | "cog" | "book"
  | "crown" | "home" | "flame" | "flames" | "anvil" | "infinity" | "spark"
  | "wildfire" | "pyre" | "sword" | "lion" | "chain" | "trinity" | "wind"
  | "moon" | "dawn" | "eye" | "star" | "summit";

export interface AchievementDef {
  id: string;
  name: string;
  /** What earns it. Hidden ones show "???" until earned. */
  how: string;
  rarity: Rarity;
  glyph: Glyph;
  hidden?: boolean;
  /** Part of finishing the course: counted into the level-30 line. */
  course?: boolean;
  /** Earned by reaching a level: a badge only, no XP (no feedback loop). */
  level?: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // The course
  { id: "first-light", name: "First Light", how: "Complete Mission 1.", rarity: "normal", glyph: "sunrise", course: true },
  { id: "oathbound", name: "Oathbound", how: "Save your first line of code.", rarity: "normal", glyph: "scroll", course: true },
  { id: "three-virtues", name: "The Three Virtues", how: "Define Honor, Courage and Commitment.", rarity: "magic", glyph: "triangle", course: true },
  { id: "know-your-code", name: "Know Your Code", how: "Finish Part 1, Missions 1 to 7.", rarity: "magic", glyph: "compass", course: true },
  { id: "proof-of-self", name: "Proof of Self", how: "Finish Part 2, Missions 8 to 14.", rarity: "rare", glyph: "shield", course: true },
  { id: "values-in-motion", name: "Values in Motion", how: "Finish Part 3, Missions 15 to 21.", rarity: "rare", glyph: "cog", course: true },
  { id: "codex", name: "Codex Complete", how: "Save all five lines of your Personal Code.", rarity: "rare", glyph: "book", course: true },
  { id: "the-thirty", name: "The Thirty", how: "Complete all 30 Missions.", rarity: "unique", glyph: "crown", course: true },
  { id: "shrine-keeper", name: "Shrine Keeper", how: "Add a photo of your shrine to Mission 1.", rarity: "normal", glyph: "home" },
  // The streak
  { id: "kindling", name: "Kindling", how: "Act three days in a row.", rarity: "normal", glyph: "flame" },
  { id: "steady-flame", name: "Steady Flame", how: "Act seven days in a row.", rarity: "magic", glyph: "flames" },
  { id: "forged-in-fire", name: "Forged in Fire", how: "Act 14 days in a row.", rarity: "rare", glyph: "anvil" },
  { id: "eternal-flame", name: "Eternal Flame", how: "Act 30 days in a row.", rarity: "unique", glyph: "infinity" },
  // Activate (the power button)
  { id: "strike-the-flint", name: "Power On", how: "Log your first Activate action.", rarity: "normal", glyph: "spark" },
  { id: "wildfire", name: "Overdrive", how: "Log 25 Activate actions.", rarity: "rare", glyph: "wildfire" },
  { id: "a-hundred-fires", name: "Full Power", how: "Log 100 Activate actions.", rarity: "unique", glyph: "pyre" },
  // The three values
  { id: "honor-bound", name: "Honor Bound", how: "Take 10 actions with Honor.", rarity: "magic", glyph: "sword" },
  { id: "fearless", name: "Fearless", how: "Take 10 actions with Courage.", rarity: "magic", glyph: "lion" },
  { id: "unbroken", name: "Unbroken", how: "Take 10 actions with Commitment.", rarity: "magic", glyph: "chain" },
  { id: "the-trinity", name: "The Trinity", how: "Take 10 actions with each of the three.", rarity: "rare", glyph: "trinity" },
  // Hidden
  { id: "second-wind", name: "Second Wind", how: "Come back after three or more days away.", rarity: "magic", glyph: "wind", hidden: true },
  { id: "first-watch", name: "First Watch", how: "Log an action before 6 AM.", rarity: "normal", glyph: "dawn", hidden: true },
  { id: "night-watch", name: "Night Watch", how: "Log an action after 11 PM.", rarity: "normal", glyph: "moon", hidden: true },
  // Levels
  { id: "awakened", name: "Awakened", how: "Reach level 10.", rarity: "magic", glyph: "eye", level: 10 },
  { id: "exemplar", name: "Exemplar", how: "Reach level 30.", rarity: "rare", glyph: "star", level: 30 },
  { id: "exalted", name: "Exalted", how: "Reach level 50.", rarity: "unique", glyph: "star", level: 50 },
  { id: "ascendant", name: "Ascendant", how: "Reach level 100.", rarity: "unique", glyph: "summit", level: 100 },
];

const xpOf = (a: AchievementDef) => (a.level ? 0 : RARITY_XP[a.rarity]);

/* ---------- levels ---------- */

export const LEVEL_CAP = 100;
export const COURSE_LEVEL = 30;
const CURVE = 1.618;

/** XP that finishing the course gives: the level-30 line. */
export const COURSE_XP =
  30 * MISSION_XP + ACHIEVEMENTS.filter((a) => a.course).reduce((n, a) => n + xpOf(a), 0);

/** Total XP needed to reach a level (level 1 = 0). */
export function xpForLevel(level: number): number {
  const l = Math.min(Math.max(level, 1), LEVEL_CAP);
  if (l === COURSE_LEVEL) return COURSE_XP;
  return Math.round(COURSE_XP * Math.pow((l - 1) / (COURSE_LEVEL - 1), CURVE));
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < LEVEL_CAP && xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

/** A name for each band of ten levels, shown beside the number. */
export function titleForLevel(level: number): string {
  const titles = [
    "Initiate", // 1–9
    "Seeker", // 10–19
    "Warden", // 20–29
    "Exemplar", // 30–39
    "Vanguard", // 40–49
    "Exalted", // 50–59
    "Paragon", // 60–69
    "Sovereign", // 70–79
    "Mythic", // 80–89
    "Eternal", // 90–99
  ];
  return level >= LEVEL_CAP ? "Ascendant" : titles[Math.floor(level / 10)];
}

/* ---------- the replay ---------- */

export interface Earned {
  def: AchievementDef;
  at: string;
}

export interface GameState {
  xp: number;
  level: number;
  title: string;
  /** XP into this level, and the size of this level. */
  intoLevel: number;
  levelSize: number;
  /** Consecutive days with at least one completed record, ending today or yesterday. */
  streak: number;
  /** True when today already counts. */
  streakToday: boolean;
  bestStreak: number;
  earned: Earned[];
  /** id -> earned record, for quick lookup. */
  earnedById: Map<string, Earned>;
}

const localDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayNumber = (day: string) => Math.round(new Date(`${day}T12:00:00`).getTime() / 86400000);

export function computeGame(missions: Mission[], now: Date = new Date()): GameState {
  const records = missions
    .filter((m) => isLive(m) && m.completed_at)
    .sort((a, b) => new Date(a.completed_at as string).getTime() - new Date(b.completed_at as string).getTime());

  let xp = 0;
  const earned: Earned[] = [];
  const has = new Set<string>();
  const done = new Set<number>();
  const actions: Record<Trigger, number> = { honor: 0, courage: 0, commitment: 0 };
  let ignites = 0;
  const ignitesByDay = new Map<string, number>();
  let streak = 0;
  let bestStreak = 0;
  let lastDay: string | null = null;

  const earn = (id: string, at: string) => {
    if (has.has(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id) as AchievementDef;
    has.add(id);
    earned.push({ def, at });
    xp += xpOf(def);
  };
  const all = (from: number, to: number) => {
    for (let n = from; n <= to; n += 1) if (!done.has(n)) return false;
    return true;
  };

  for (const r of records) {
    const at = r.completed_at as string;
    const day = localDay(at);

    // The streak, and the XP it adds on the first record of each day.
    if (day !== lastDay) {
      const gap = lastDay === null ? 1 : dayNumber(day) - dayNumber(lastDay);
      if (lastDay !== null && gap >= 4) earn("second-wind", at);
      streak = gap === 1 ? streak + 1 : 1;
      bestStreak = Math.max(bestStreak, streak);
      xp += streakBonus(streak);
      lastDay = day;
      if (streak >= 3) earn("kindling", at);
      if (streak >= 7) earn("steady-flame", at);
      if (streak >= 14) earn("forged-in-fire", at);
      if (streak >= 30) earn("eternal-flame", at);
    }

    const n = r.mission_number;
    if (n !== null) {
      if (!done.has(n)) {
        done.add(n);
        xp += MISSION_XP;
      }
    } else {
      ignites += 1;
      const today = (ignitesByDay.get(day) ?? 0) + 1;
      ignitesByDay.set(day, today);
      if (today <= ACTIVATE_XP_PER_DAY) xp += ACTIVATE_XP;
      earn("strike-the-flint", at);
      if (ignites >= 25) earn("wildfire", at);
      if (ignites >= 100) earn("a-hundred-fires", at);
    }

    if (kindOf(r) === "action") {
      actions[r.trigger] += 1;
      const hour = new Date(at).getHours();
      if (hour < 6) earn("first-watch", at);
      if (hour >= 23) earn("night-watch", at);
    }
    if (actions.honor >= 10) earn("honor-bound", at);
    if (actions.courage >= 10) earn("fearless", at);
    if (actions.commitment >= 10) earn("unbroken", at);
    if (actions.honor >= 10 && actions.courage >= 10 && actions.commitment >= 10) earn("the-trinity", at);

    if (done.has(1)) earn("first-light", at);
    if (n === 1 && r.photo_url) earn("shrine-keeper", at);
    if (CODE_LINES.some((l) => done.has(l.number))) earn("oathbound", at);
    if (done.has(2) && done.has(3) && done.has(4)) earn("three-virtues", at);
    if (all(1, 7)) earn("know-your-code", at);
    if (all(8, 14)) earn("proof-of-self", at);
    if (all(15, 21)) earn("values-in-motion", at);
    if (CODE_LINES.every((l) => done.has(l.number))) earn("codex", at);
    if (all(1, 30)) earn("the-thirty", at);

    // Level badges: earned the moment the XP crosses the line.
    const level = levelForXp(xp);
    for (const a of ACHIEVEMENTS) if (a.level && level >= a.level) earn(a.id, at);
  }

  // A streak is alive while its last day is today or yesterday.
  const today = localDay(now.toISOString());
  const sinceLast = lastDay ? dayNumber(today) - dayNumber(lastDay) : Infinity;
  const current = sinceLast <= 1 ? streak : 0;

  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const next = level >= LEVEL_CAP ? floor : xpForLevel(level + 1);
  return {
    xp,
    level,
    title: titleForLevel(level),
    intoLevel: xp - floor,
    levelSize: next - floor,
    streak: current,
    streakToday: sinceLast === 0,
    bestStreak,
    earned,
    earnedById: new Map(earned.map((e) => [e.def.id, e])),
  };
}

/** What one save added: XP, a level-up, and the achievements it unlocked. */
export function gainFrom(missions: Mission[], saved: Mission) {
  const before = computeGame(missions.filter((m) => m.id !== saved.id));
  const after = computeGame(missions.some((m) => m.id === saved.id) ? missions : [...missions, saved]);
  return {
    xp: after.xp - before.xp,
    levelUp: after.level > before.level ? after.level : null,
    unlocked: after.earned.filter((e) => !before.earnedById.has(e.def.id)).map((e) => e.def),
    after,
  };
}
