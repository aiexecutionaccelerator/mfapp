import type { Mission, Trigger } from "@/lib/data/types";

export const MISSION_COUNT = 30;

/**
 * Everything is counted from the Proof rows themselves — there are no stored
 * counters to desync. A Proof is a completed mission row; a structured Mission
 * is one carrying a mission_number (1–30).
 */
export interface Stats {
  /** Every completed entry by trigger — structured and free-form together. */
  proofs: Record<Trigger, number>;
  totalProofs: number;
  /** Free-form actions only — the display buckets next to Missions x/30. */
  freeform: Record<Trigger, number>;
  freeformTotal: number;
  /** Distinct structured Missions completed — the 30/30 count. */
  missionsCompleted: number;
  /**
   * Every deed counted once: free-form actions + completed Missions.
   * Honor + Courage + Commitment (free-form) + x/30 always adds up to this.
   */
  totalDeeds: number;
  actionsInProgress: number;
}

export function computeStats(missions: Mission[]): Stats {
  const completed = missions.filter((m) => m.status === "completed");
  const freeform = completed.filter((m) => m.mission_number === null);
  const structured = new Set(
    completed
      .filter((m) => m.mission_number !== null)
      .map((m) => m.mission_number as number),
  );

  const byTrigger = (rows: Mission[]): Record<Trigger, number> => ({
    honor: rows.filter((m) => m.trigger === "honor").length,
    courage: rows.filter((m) => m.trigger === "courage").length,
    commitment: rows.filter((m) => m.trigger === "commitment").length,
  });

  return {
    proofs: byTrigger(completed),
    totalProofs: completed.length,
    freeform: byTrigger(freeform),
    freeformTotal: freeform.length,
    missionsCompleted: structured.size,
    totalDeeds: freeform.length + structured.size,
    actionsInProgress: missions.filter((m) => m.status === "active").length,
  };
}

/** The set of structured Mission numbers with a given status. */
export function missionNumbersWithStatus(
  missions: Mission[],
  status: "active" | "completed",
): Set<number> {
  return new Set(
    missions
      .filter((m) => m.mission_number !== null && m.status === status)
      .map((m) => m.mission_number as number),
  );
}

/** The state row for a structured Mission, if the user has declared it. */
export function structuredMissionRow(
  missions: Mission[],
  missionNumber: number,
): Mission | null {
  // Completed beats a stray active row (the DB unique index prevents both,
  // but legacy or demo data should still resolve deterministically).
  const rows = missions.filter((m) => m.mission_number === missionNumber);
  return (
    rows.find((m) => m.status === "completed") ??
    rows.find((m) => m.status === "active") ??
    null
  );
}

/** The lowest-numbered structured Mission with no proof yet, or null at 30/30. */
export function nextMissionNumber(missions: Mission[]): number | null {
  const done = missionNumbersWithStatus(missions, "completed");
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
        m.status === "completed" &&
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
