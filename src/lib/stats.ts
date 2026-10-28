import { isLive, kindOf } from "@/lib/curriculum";
import type { Mission, Trigger } from "@/lib/data/types";

export const MISSION_COUNT = 30;

/**
 * Everything is counted from the records themselves; there are no stored
 * counters to desync. Removed records don't count until restored.
 *
 * Curriculum revision 2 separates two numbers:
 *   - Missions completed (x/30): every kind counts, because every Mission's
 *     assignment is done when its record is saved.
 *   - Actions: only things DONE. Action Missions and One-Off Actions.
 *     Reflections, code and plans never count as actions.
 * A One-Off Action never advances x/30.
 */
export interface Stats {
  /** Actions by the Scent Trigger he used: Missions and One-Offs together. */
  actions: Record<Trigger, number>;
  totalActions: number;
  /** One-Off Actions only. */
  oneOffs: number;
  /** Distinct Missions completed, any kind: the x/30 count. */
  missionsCompleted: number;
  /** Every live record, any kind: what the Proof Log holds. */
  totalRecords: number;
}

export function computeStats(missions: Mission[]): Stats {
  const live = missions.filter(isLive);
  const actions = live.filter((m) => kindOf(m) === "action");
  const byTrigger = (rows: Mission[]): Record<Trigger, number> => ({
    honor: rows.filter((m) => m.trigger === "honor").length,
    courage: rows.filter((m) => m.trigger === "courage").length,
    commitment: rows.filter((m) => m.trigger === "commitment").length,
  });
  return {
    actions: byTrigger(actions),
    totalActions: actions.length,
    oneOffs: actions.filter((m) => m.mission_number === null).length,
    missionsCompleted: new Set(
      live
        .filter((m) => m.mission_number !== null)
        .map((m) => m.mission_number as number),
    ).size,
    totalRecords: live.length,
  };
}

/** Mission numbers whose record counts (completed, not removed). */
export function completedMissionNumbers(missions: Mission[]): Set<number> {
  return new Set(
    missions
      .filter((m) => m.mission_number !== null && isLive(m))
      .map((m) => m.mission_number as number),
  );
}

/** The lowest-numbered structured Mission with no proof yet, or null at 30/30. */
export function nextMissionNumber(missions: Mission[]): number | null {
  const done = completedMissionNumbers(missions);
  for (let n = 1; n <= MISSION_COUNT; n += 1) {
    if (!done.has(n)) return n;
  }
  return null;
}

/** 1-based index of this Proof among completed Proofs of the same trigger. */
export function proofNumberFor(missions: Mission[], mission: Mission): number {
  const ordered = missions
    .filter(
      (m) =>
        isLive(m) &&
        m.trigger === mission.trigger &&
        m.completed_at,
    )
    .sort(
      (a, b) =>
        new Date(a.completed_at as string).getTime() -
        new Date(b.completed_at as string).getTime(),
    );
  const index = ordered.findIndex((m) => m.id === mission.id);
  return index === -1 ? ordered.length + 1 : index + 1;
}
