import {
  FOCUS_AREAS,
  FREQUENCIES,
  MISSIONS,
  getMissionDef,
  type MissionDef,
} from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import {
  IDENTITY_MAX,
  PROOF_TEXT_MAX,
  type Mission,
  type MissionContext,
  type RecordInput,
  type RecordKind,
} from "@/lib/data/types";
import { todayLocal } from "@/lib/utils";

/**
 * The rules that connect the 30 Missions (curriculum revision 2): what kind
 * of record each one saves, which saved work it needs first, which saved
 * work it shows, and what a valid save looks like.
 *
 * Pure functions over the records, shared by the screens and the demo
 * backend. The Supabase trigger in migration 0009 enforces the same rules
 * at the trusted write boundary; keep the two in step.
 */

/* ---------- kinds ---------- */

const KIND_BY_NUMBER = new Map(MISSIONS.map((m) => [m.number, m.kind]));

/** One-Off Actions (no number) are always actions. */
export function kindFor(missionNumber: number | null): RecordKind {
  if (missionNumber === null) return "action";
  return KIND_BY_NUMBER.get(missionNumber) ?? "action";
}

/** The record's kind, for rows saved before kinds existed too. */
export function kindOf(record: Mission): RecordKind {
  return record.kind ?? kindFor(record.mission_number);
}

/* ---------- records ---------- */

/** Completed and not removed: the records that count. */
export function isLive(record: Mission): boolean {
  return record.status === "completed" && !record.removed_at;
}

/** The one canonical record for a Mission, whatever its state. */
export function recordFor(
  missions: Mission[],
  missionNumber: number,
): Mission | null {
  const rows = missions.filter((m) => m.mission_number === missionNumber);
  return (
    rows.find((m) => m.status === "completed") ??
    rows.find((m) => m.status === "active") ??
    null
  );
}

export function liveRecordFor(
  missions: Mission[],
  missionNumber: number,
): Mission | null {
  const record = recordFor(missions, missionNumber);
  return record && isLive(record) ? record : null;
}

export const recordText = (record: Mission): string =>
  record.reflection ?? record.action_text;

/** A record made under the first curriculum's wording. */
export const isLegacy = (record: Mission): boolean =>
  (record.curriculum_version ?? 1) < 2;

/* ---------- saved context ---------- */

/** The five Personal Code lines, Missions 8–12. */
export const CODE_LINES = [
  { number: 8, label: "For me, honor means…" },
  { number: 9, label: "For me, courage means…" },
  { number: 10, label: "For me, commitment means…" },
  { number: 11, label: "My boundary" },
  { number: 12, label: "My promise" },
] as const;

export function codeLines(missions: Mission[]) {
  return CODE_LINES.map((line) => {
    const record = liveRecordFor(missions, line.number);
    return { ...line, value: record ? recordText(record) : null };
  });
}

/** Mission 12. */
export function promiseOf(missions: Mission[]): string | null {
  const record = liveRecordFor(missions, 12);
  return record ? recordText(record) : null;
}

export type AimState =
  | { status: "none" }
  /** A first-curriculum Mission 21: a focus choice with no seven-day aim. */
  | { status: "legacy"; record: Mission }
  | { status: "set"; focus: string; aim: string; record: Mission };

/** Mission 21: the focus area and seven-day aim that 22–25 work toward. */
export function aimOf(missions: Mission[]): AimState {
  const record = liveRecordFor(missions, 21);
  if (!record) return { status: "none" };
  if (isLegacy(record) || !record.focus_area) return { status: "legacy", record };
  return {
    status: "set",
    focus: record.focus_area,
    aim: recordText(record),
    record,
  };
}

/** Mission 27's practice plan, shown on 28–30. */
export function practiceOf(missions: Mission[]): MissionContext["practice"] {
  const record = liveRecordFor(missions, 27);
  if (!record || isLegacy(record)) return null;
  return {
    text: recordText(record),
    frequency: record.frequency,
    review_date: record.review_date,
    trigger: record.trigger,
  };
}

/** Completed actions, newest first: Missions and One-Off Actions alike. */
export function recentActions(
  missions: Mission[],
  { exclude, limit = 3 }: { exclude?: number; limit?: number } = {},
): Mission[] {
  return missions
    .filter(
      (m) =>
        isLive(m) &&
        kindOf(m) === "action" &&
        (exclude === undefined || m.mission_number !== exclude),
    )
    .sort(
      (a, b) =>
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime(),
    )
    .slice(0, limit);
}

/** What each Mission shows under Act. Saved with the record on completion. */
export function contextFor(
  missionNumber: number,
  missions: Mission[],
): MissionContext {
  const context: MissionContext = {};
  if (missionNumber === 14 || missionNumber === 29) {
    context.code = codeLines(missions)
      .filter((line) => line.value)
      .map((line) => ({ label: line.label, value: line.value as string }));
  }
  if (missionNumber >= 15 && missionNumber <= 21) {
    context.promise = promiseOf(missions);
  }
  if (missionNumber >= 22) {
    const aim = aimOf(missions);
    if (aim.status === "set") {
      context.focus = aim.focus;
      context.aim = aim.aim;
    }
  }
  if (missionNumber >= 28) context.practice = practiceOf(missions);
  return context;
}

/** Missions that offer recent actions as evidence. */
export const SHOWS_RECENT_ACTIONS = new Set([21, 28, 30]);

/* ---------- prerequisites ---------- */

export interface Blocker {
  message: string;
  href: string;
  cta: string;
}

/**
 * What must be saved before this Mission can be completed. Only genuine
 * prerequisites block; browsing and drafts never do.
 */
export function blockersFor(
  missionNumber: number,
  missions: Mission[],
): Blocker[] {
  const blockers: Blocker[] = [];

  if (missionNumber === 14 || missionNumber === 29) {
    for (const line of codeLines(missions)) {
      if (line.value) continue;
      const def = getMissionDef(line.number) as MissionDef;
      blockers.push({
        message: `Your code line from Mission ${line.number} isn't saved yet.`,
        href: `/missions/${line.number}`,
        cta: `GO TO MISSION ${line.number}: ${def.title.toUpperCase()}`,
      });
    }
  }

  if (missionNumber >= 22 && missionNumber <= 25) {
    const aim = aimOf(missions);
    if (aim.status === "none") {
      blockers.push({
        message:
          "This Mission works on your seven-day aim. Choose your focus and aim in Mission 21 first.",
        href: "/missions/21",
        cta: "GO TO MISSION 21: CHOOSE ONE DIRECTION",
      });
    } else if (aim.status === "legacy") {
      blockers.push({
        message:
          "Your Mission 21 was saved under the earlier wording, without a seven-day aim. Add a current aim first. Your earlier record stays as it is.",
        href: "/missions/21",
        cta: "ADD A CURRENT AIM",
      });
    }
  }

  if (missionNumber === 28 && recentActions(missions, { exclude: 28 }).length === 0) {
    blockers.push({
      message:
        "This Mission repeats an action from your Proof Log. Complete an action first, then come back.",
      href: "/missions",
      cta: "BACK TO MISSIONS",
    });
  }

  return blockers;
}

/* ---------- validation ---------- */

/** A real calendar date, YYYY-MM-DD. */
export function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function textLimitFor(missionNumber: number | null): number {
  return missionNumber === 13 ? IDENTITY_MAX : PROOF_TEXT_MAX;
}

/**
 * Why this save can't be accepted, or null if it can. The same checks run
 * in the database for Supabase (migration 0009).
 *
 * `previousReviewDate`: when editing a saved plan, an unchanged review date
 * may be in the past.
 */
export function validateRecord(
  input: RecordInput,
  missions: Mission[],
  {
    previousReviewDate = null,
    today = todayLocal(),
    skipPrerequisites = false,
    textOnly = false,
  }: {
    previousReviewDate?: string | null;
    today?: string;
    /** Editing a saved record: prerequisites gate completing, not editing. */
    skipPrerequisites?: boolean;
    /**
     * Editing a first-curriculum record: only its words are checked. Its
     * task never had the revised fields (focus, frequency, review date), and
     * the server checks only the text too.
     */
    textOnly?: boolean;
  } = {},
): string | null {
  const def = getMissionDef(input.mission_number);
  if (!def) return "That Mission doesn't exist.";
  if (!(input.trigger in TRIGGERS)) return "Choose Honor, Courage, or Commitment.";

  const text = input.text.trim();
  if (!text) return "Write your record first.";
  const limit = textLimitFor(def.number);
  if (text.length > limit) return `Keep it under ${limit.toLocaleString()} characters.`;
  if (textOnly) return null;

  if (def.kind === "action" && !input.confirmed)
    return "Check “I have taken this action.” once you've done it.";

  if (!skipPrerequisites) {
    const blockers = blockersFor(def.number, missions);
    if (blockers.length) return blockers[0].message;
  }

  if (def.number === 21 && !FOCUS_AREAS.includes(input.focus_area as never))
    return "Choose a focus area.";

  if (def.number === 27 || def.number === 30) {
    if (!FREQUENCIES.includes(input.frequency as never))
      return "Choose how often you'll practice.";
    const date = input.review_date ?? "";
    if (!isRealDate(date)) return "Choose a review date.";
    const unchanged = previousReviewDate !== null && date === previousReviewDate;
    if (!unchanged && date <= today) return "Choose a review date after today.";
  }
  return null;
}

/* ---------- labels ---------- */

export function primaryLabel(def: MissionDef, editing: boolean): string {
  if (editing) return "SAVE CHANGES";
  if (def.number === 21) return "SAVE FOCUS & AIM";
  switch (def.kind) {
    case "reflection":
      return "SAVE REFLECTION";
    case "code":
      return "SAVE TO MY CODE";
    case "plan":
      return "SAVE PRACTICE PLAN";
    default:
      return `RECORD · COMPLETE MISSION ${def.number}`;
  }
}

/** The line under MISSION COMPLETE. A plan or code is never praised as a deed. */
export function successLine(def: MissionDef, record: Mission): string {
  if (def.number === 21) return "Your focus and aim are saved.";
  switch (def.kind) {
    case "reflection":
      return "Your reflection is saved.";
    case "code":
      return "Your Personal Code is taking shape.";
    case "plan":
      return "Your practice plan is saved.";
    default:
      return `You acted with ${TRIGGERS[record.trigger].provedWith}.`;
  }
}

export const KIND_LABELS: Record<RecordKind, string> = {
  action: "Action",
  reflection: "Reflection",
  code: "Code",
  plan: "Plan",
};
