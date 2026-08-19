import { differenceInCalendarDays } from "date-fns";
import type { CourseProgress, Mission, Trigger } from "@/lib/data/types";

/** A rep is a rep: three from Missions, one from finishing a course lesson. */
export type RepKey = Trigger | "course";

export const REP_ORDER: RepKey[] = [
  "honor",
  "courage",
  "commitment",
  "course",
];

export interface Stats {
  reps: Record<RepKey, number>;
  started: number;
  completed: number;
  ended: number;
  /** completed / (completed + ended) — only meaningful when denominator >= 3 */
  followThroughRate: number | null;
  last30DaysCompleted: number;
  lessonsCompleted: number;
}

export function computeStats(
  missions: Mission[],
  courseProgress: CourseProgress[] = [],
  now: Date = new Date(),
): Stats {
  const completedMissions = missions.filter((m) => m.status === "completed");
  const ended = missions.filter((m) => m.status === "ended").length;
  const denominator = completedMissions.length + ended;

  return {
    reps: {
      honor: completedMissions.filter((m) => m.trigger === "honor").length,
      courage: completedMissions.filter((m) => m.trigger === "courage").length,
      commitment: completedMissions.filter((m) => m.trigger === "commitment")
        .length,
      course: courseProgress.length,
    },
    started: missions.length,
    completed: completedMissions.length,
    ended,
    followThroughRate:
      denominator >= 3 ? completedMissions.length / denominator : null,
    last30DaysCompleted: completedMissions.filter(
      (m) =>
        m.completed_at &&
        differenceInCalendarDays(now, new Date(m.completed_at)) <= 30,
    ).length,
    lessonsCompleted: courseProgress.length,
  };
}

/** 1-based index of this Mission among completed Missions of the same trigger. */
export function repNumberFor(missions: Mission[], mission: Mission): number {
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
