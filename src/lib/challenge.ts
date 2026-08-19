import { differenceInCalendarDays, parseISO } from "date-fns";
import {
  CHALLENGE_MODULES,
  type ChallengeModule,
} from "@/content/challengeLessons";
import { DEV_TOOLS } from "@/lib/env";
import type { Profile } from "@/lib/data/types";

export type Mode = "challenge" | "completion-pending" | "log";

export const CHALLENGE_LENGTH = 30;
const DEV_OVERRIDE_KEY = "mission.devDayOverride";

/** Dev-only day simulation. Ignored unless NEXT_PUBLIC_DEV_TOOLS === 'true'. */
export function readDevDayOverride(): number | null {
  if (!DEV_TOOLS || typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEV_OVERRIDE_KEY);
  if (!raw) return null;
  const day = Number(raw);
  return Number.isFinite(day) && day > 0 ? day : null;
}

export function setDevDayOverride(day: number | null): void {
  if (typeof window === "undefined") return;
  if (day === null) window.localStorage.removeItem(DEV_OVERRIDE_KEY);
  else window.localStorage.setItem(DEV_OVERRIDE_KEY, String(day));
}

/** Unclamped day number — can exceed 30. */
export function rawChallengeDay(profile: Profile, now: Date = new Date()): number {
  const override = readDevDayOverride();
  if (override !== null) return override;
  if (!profile.challenge_start_date) return 1;
  const day =
    differenceInCalendarDays(now, parseISO(profile.challenge_start_date)) + 1;
  return day < 1 ? 1 : day;
}

/** Day number for display, clamped to [1, 30]. */
export function challengeDay(profile: Profile, now: Date = new Date()): number {
  return Math.min(rawChallengeDay(profile, now), CHALLENGE_LENGTH);
}

export function getMode(profile: Profile, now: Date = new Date()): Mode {
  if (profile.challenge_completed_at) return "log";
  return rawChallengeDay(profile, now) >= CHALLENGE_LENGTH
    ? "completion-pending"
    : "challenge";
}

/** The course module the given day falls in. */
export function getModule(day: number): ChallengeModule {
  return (
    CHALLENGE_MODULES.find(
      (entry) => day >= entry.dayMin && day <= entry.dayMax,
    ) ?? CHALLENGE_MODULES[CHALLENGE_MODULES.length - 1]
  );
}
