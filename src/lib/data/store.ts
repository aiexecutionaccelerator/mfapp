"use client";

import { useEffect, useSyncExternalStore } from "react";
import { data } from "@/lib/data";
import type {
  LessonResponse,
  Mission,
  Profile,
  Trigger,
} from "@/lib/data/types";

/**
 * One shared, in-memory copy of the signed-in user's profile + missions.
 *
 * Screens read it synchronously, so a tab switch renders instantly instead of
 * flashing a skeleton while it re-fetches. The first read loads; later reads
 * revalidate in the background once the copy is older than STALE_MS. Writes go
 * through `store.*`, which patches the copy after the backend confirms, so the
 * other screens are already correct when you get there.
 *
 * It sits above `lib/data`, so demo (localStorage) and Supabase both use it.
 */

const STALE_MS = 30_000;

interface Cache {
  profile: Profile | null;
  missions: Mission[] | null;
  lessonResponses: LessonResponse[] | null;
  error: Error | null;
}

const EMPTY: Cache = {
  profile: null,
  missions: null,
  lessonResponses: null,
  error: null,
};

let cache: Cache = EMPTY;
let loadedAt = 0;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: Cache): void {
  cache = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Cache {
  return cache;
}

function getServerSnapshot(): Cache {
  return EMPTY;
}

function load(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = data
    .loadAll()
    .then(({ profile, missions, lessonResponses }) => {
      loadedAt = Date.now();
      publish({ profile, missions, lessonResponses, error: null });
    })
    .catch((cause: unknown) => {
      publish({
        ...cache,
        error: cause instanceof Error ? cause : new Error(String(cause)),
      });
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Re-fetch now. Safe to call from a retry button. */
export function refreshAppData(): Promise<void> {
  return load();
}

function ensureLoaded(): void {
  if (
    cache.profile === null ||
    cache.missions === null ||
    cache.lessonResponses === null
  ) {
    void load();
    return;
  }
  if (Date.now() - loadedAt > STALE_MS) void load();
}

/* ---------- cache patches (applied only after a write succeeds) ---------- */

function putProfile(profile: Profile): void {
  publish({ ...cache, profile });
}

function putMission(mission: Mission): void {
  const current = cache.missions;
  if (!current) return;
  const next = current.some((m) => m.id === mission.id)
    ? current.map((m) => (m.id === mission.id ? mission : m))
    : [mission, ...current];
  next.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
  publish({ ...cache, missions: next });
}

function dropMission(id: string): void {
  const current = cache.missions;
  if (!current) return;
  publish({ ...cache, missions: current.filter((m) => m.id !== id) });
}

function putLessonResponse(
  lessonId: string,
  promptId: string,
  row: LessonResponse | null,
): void {
  const current = cache.lessonResponses;
  if (!current) return;
  const rest = current.filter(
    (item) => !(item.lesson_id === lessonId && item.prompt_id === promptId),
  );
  publish({ ...cache, lessonResponses: row ? [...rest, row] : rest });
}

function clearCache(): void {
  loadedAt = 0;
  publish(EMPTY);
}

/**
 * A Mission that is over must never fire a push. A failure here must not fail
 * the completion the user just made, so it is best-effort.
 */
async function dropReminders(missionId: string): Promise<void> {
  try {
    await data.cancelReminders(missionId);
  } catch {
    /* the Edge Function drops reminders for non-active Missions too */
  }
}

/* ---------- writes ---------- */

export const store = {
  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const profile = await data.updateProfile(patch);
    putProfile(profile);
    return profile;
  },

  async createMission(input: {
    trigger: Trigger;
    action_text: string;
    action_category?: string | null;
    mission_number?: number | null;
    question_answer?: string | null;
  }): Promise<Mission> {
    const mission = await data.createMission(input);
    putMission(mission);
    return mission;
  },

  async completeMission(
    id: string,
    input: { reflection: string; photo_url?: string | null },
  ): Promise<Mission> {
    const mission = await data.completeMission(id, input);
    putMission(mission);
    await dropReminders(id);
    return mission;
  },

  /** Deletes the proof, keeps the declared action — back to in progress. */
  async uncompleteMission(id: string): Promise<Mission> {
    const mission = await data.uncompleteMission(id);
    putMission(mission);
    return mission;
  },

  /** Removes the row entirely — free-form delete, or structured abandon. */
  async deleteMission(id: string): Promise<void> {
    await data.deleteMission(id);
    dropMission(id);
    await dropReminders(id);
  },

  async updateMission(
    id: string,
    patch: Partial<
      Pick<
        Mission,
        "action_text" | "reflection" | "question_answer" | "photo_url" | "trigger"
      >
    >,
  ): Promise<Mission> {
    const mission = await data.updateMission(id, patch);
    putMission(mission);
    return mission;
  },

  scheduleReminder(missionId: string, sendAt: Date): Promise<void> {
    return data.scheduleReminder(missionId, sendAt);
  },

  cancelReminders(missionId: string): Promise<void> {
    return data.cancelReminders(missionId);
  },

  /**
   * Autosaved from the Mission question. A blank answer clears it. Never log
   * the answer — this is the private half of the experience.
   */
  async saveLessonResponse(
    lessonId: string,
    promptId: string,
    answer: string,
  ): Promise<LessonResponse | null> {
    const row = await data.saveLessonResponse(lessonId, promptId, answer);
    putLessonResponse(lessonId, promptId, row);
    return row;
  },

  async signOut(): Promise<void> {
    await data.signOut();
    clearCache();
  },

  async deleteAccount(): Promise<void> {
    await data.deleteAccount();
    clearCache();
  },
};

/* ---------- read ---------- */

export interface AppData {
  profile: Profile | null;
  missions: Mission[] | null;
  lessonResponses: LessonResponse[] | null;
  /** True only until the first successful load — never during a revalidate. */
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAppData(): AppData {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    ensureLoaded();
  }, []);

  return {
    profile: snapshot.profile,
    missions: snapshot.missions,
    lessonResponses: snapshot.lessonResponses,
    loading:
      snapshot.profile === null ||
      snapshot.missions === null ||
      snapshot.lessonResponses === null,
    error: snapshot.error,
    refresh: refreshAppData,
  };
}
