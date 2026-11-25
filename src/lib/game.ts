import { CODE_LINES, isLive, kindOf } from "@/lib/curriculum";
import type { Mission, Trigger } from "@/lib/data/types";

/**
 * Levels, the day streak and achievements (simplified 25 Nov 2026, after
 * Antonio's third Loom: "It should coincide with the action").
 *
 * Your level is the number of Missions you've completed: Mission 1 done is
 * level 1, all 30 is level 30. XP only starts after the course: each
 * Activate action gives 100 XP, and each level from 30 to the cap of 50 costs
 * more than the last (30 to 31 is one action, 49 to 50 about sixty; around
 * 300 actions in all, so most of a year of daily use).
 *
 * Nothing here is stored. Everything is replayed from his records in the
 * order he completed them, so it can't drift and every achievement knows
 * the day it was earned. Removing a record takes it away until restored.
 */

/* ---------- rarity (after Path of Exile's item colours) ---------- */

export type Rarity = "normal" | "magic" | "rare" | "unique";

export const RARITY_LABEL: Record<Rarity, string> = {
  normal: "Common",
  magic: "Magic",
  rare: "Rare",
  unique: "Unique",
};

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
  /** Part of finishing the course. */
  course?: boolean;
  /** Earned by reaching a level. */
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
  { id: "exalted", name: "Exalted", how: "Reach level 40.", rarity: "unique", glyph: "star", level: 40 },
  { id: "ascendant", name: "Ascendant", how: "Reach level 50, the top level.", rarity: "unique", glyph: "summit", level: 50 },
];

/* ---------- levels ---------- */

export const LEVEL_CAP = 50;
export const COURSE_LEVEL = 30;
/** XP for each Activate action logged after the course. */
export const ACTIVATE_XP = 100;
const GROWTH = 1.24;

/** XP to go from `level` to `level + 1`, for levels 30 to 49. */
export function xpToNext(level: number): number {
  return Math.round((ACTIVATE_XP * Math.pow(GROWTH, level - COURSE_LEVEL)) / 100) * 100;
}

/** Where post-course XP puts him: level, and XP into / needed for the next. */
function levelFromXp(xp: number) {
  let level = COURSE_LEVEL;
  let left = xp;
  while (level < LEVEL_CAP && left >= xpToNext(level)) {
    left -= xpToNext(level);
    level += 1;
  }
  return { level, into: left, need: level < LEVEL_CAP ? xpToNext(level) : 0 };
}

/* ---------- the replay ---------- */

export interface Earned {
  def: AchievementDef;
  at: string;
}

export interface GameState {
  /** Missions completed (0–30); after the course, from XP, up to 50. */
  level: number;
  missionsDone: number;
  /** After the course: total XP, XP into this level, XP this level needs. Null before. */
  xp: { total: number; into: number; need: number } | null;
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

  const earned: Earned[] = [];
  const has = new Set<string>();
  const done = new Set<number>();
  const actions: Record<Trigger, number> = { honor: 0, courage: 0, commitment: 0 };
  let ignites = 0;
  let xp = 0;
  const levelNow = () => (done.size < COURSE_LEVEL ? done.size : levelFromXp(xp).level);
  let streak = 0;
  let bestStreak = 0;
  let lastDay: string | null = null;

  const earn = (id: string, at: string) => {
    if (has.has(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id) as AchievementDef;
    has.add(id);
    earned.push({ def, at });
  };
  const all = (from: number, to: number) => {
    for (let n = from; n <= to; n += 1) if (!done.has(n)) return false;
    return true;
  };

  for (const r of records) {
    const at = r.completed_at as string;
    const day = localDay(at);

    // The streak: one step per day with at least one record.
    if (day !== lastDay) {
      const gap = lastDay === null ? 1 : dayNumber(day) - dayNumber(lastDay);
      if (lastDay !== null && gap >= 4) earn("second-wind", at);
      streak = gap === 1 ? streak + 1 : 1;
      bestStreak = Math.max(bestStreak, streak);
      lastDay = day;
      if (streak >= 3) earn("kindling", at);
      if (streak >= 7) earn("steady-flame", at);
      if (streak >= 14) earn("forged-in-fire", at);
      if (streak >= 30) earn("eternal-flame", at);
    }

    const n = r.mission_number;
    if (n !== null) {
      done.add(n);
    } else {
      ignites += 1;
      if (done.size >= COURSE_LEVEL) xp += ACTIVATE_XP;
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

    // Level badges: earned the moment the level is reached.
    const level = levelNow();
    for (const a of ACHIEVEMENTS) if (a.level && level >= a.level) earn(a.id, at);
  }

  // A streak is alive while its last day is today or yesterday.
  const today = localDay(now.toISOString());
  const sinceLast = lastDay ? dayNumber(today) - dayNumber(lastDay) : Infinity;
  const current = sinceLast <= 1 ? streak : 0;

  const level = levelNow();
  return {
    level,
    missionsDone: done.size,
    xp: done.size < COURSE_LEVEL ? null : { total: xp, ...(({ into, need }) => ({ into, need }))(levelFromXp(xp)) },
    streak: current,
    streakToday: sinceLast === 0,
    bestStreak,
    earned,
    earnedById: new Map(earned.map((e) => [e.def.id, e])),
  };
}

/** What one save added: XP (after the course), a level-up, and the achievements it unlocked. */
export function gainFrom(missions: Mission[], saved: Mission) {
  const before = computeGame(missions.filter((m) => m.id !== saved.id));
  const after = computeGame(missions.some((m) => m.id === saved.id) ? missions : [...missions, saved]);
  return {
    xp: after.xp && before.xp ? after.xp.total - before.xp.total : 0,
    levelUp: after.level > before.level ? after.level : null,
    unlocked: after.earned.filter((e) => !before.earnedById.has(e.def.id)).map((e) => e.def),
    after,
  };
}
