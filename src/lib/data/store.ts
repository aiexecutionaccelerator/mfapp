"use client";

import { useEffect, useSyncExternalStore } from "react";
import { data } from "@/lib/data";
import { liveRecordFor } from "@/lib/curriculum";
import {
  ValidationError,
  type Draft,
  type LessonResponse,
  type Mission,
  type Profile,
  type RecordInput,
  type Trigger,
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
  drafts: Draft[] | null;
  error: Error | null;
}

const EMPTY: Cache = {
  profile: null,
  missions: null,
  lessonResponses: null,
  drafts: null,
  error: null,
};

let cache: Cache = EMPTY;
let loadedAt = 0;
/**
 * Bumped on every confirmed write. A background revalidate that STARTED
 * before the latest write is a stale snapshot — publishing it would undo the
 * write (the "finished onboarding, got bounced back into it" bug), so loads
 * older than the last write are dropped.
 */
let lastWriteAt = 0;
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

const incomplete = (c: Cache) =>
  c.profile === null ||
  c.missions === null ||
  c.lessonResponses === null ||
  c.drafts === null;

function load(): Promise<void> {
  if (inFlight) return inFlight;
  const startedAt = Date.now();
  let dropped = false;
  inFlight = data
    .loadAll()
    .then(({ profile, missions, lessonResponses, drafts }) => {
      if (lastWriteAt > startedAt) {
        dropped = true; // stale vs a newer write — drop
        return;
      }
      loadedAt = Date.now();
      publish({ profile, missions, lessonResponses, drafts, error: null });
    })
    .catch((cause: unknown) => {
      publish({
        ...cache,
        error: cause instanceof Error ? cause : new Error(String(cause)),
      });
    })
    .finally(() => {
      inFlight = null;
      // A dropped load must not strand a screen that is still waiting for
      // its first data (a write landed mid-load, e.g. finishing onboarding):
      // fetch again, now that the write is in.
      if (dropped && incomplete(cache)) void load();
    });
  return inFlight;
}

/** Re-fetch now. Safe to call from a retry button. */
export function refreshAppData(): Promise<void> {
  return load();
}

function ensureLoaded(): void {
  if (incomplete(cache)) {
    void load();
    return;
  }
  if (Date.now() - loadedAt > STALE_MS) void load();
}

/* ---------- cache patches (applied only after a write succeeds) ---------- */

/* A confirmed write proves the backend is reachable again, so each patch
   also clears a stale load error (screens redirect or nag while it is set). */

function putProfile(profile: Profile): void {
  lastWriteAt = Date.now();
  publish({ ...cache, profile, error: null });
}

function putMission(mission: Mission): void {
  lastWriteAt = Date.now();
  const current = cache.missions;
  if (!current) return;
  const next = current.some((m) => m.id === mission.id)
    ? current.map((m) => (m.id === mission.id ? mission : m))
    : [mission, ...current];
  next.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
  publish({ ...cache, missions: next, error: null });
}

function dropMission(id: string): void {
  lastWriteAt = Date.now();
  const current = cache.missions;
  if (!current) return;
  publish({ ...cache, missions: current.filter((m) => m.id !== id), error: null });
}

function putLessonResponse(
  lessonId: string,
  promptId: string,
  row: LessonResponse | null,
): void {
  lastWriteAt = Date.now();
  const current = cache.lessonResponses;
  if (!current) return;
  const rest = current.filter(
    (item) => !(item.lesson_id === lessonId && item.prompt_id === promptId),
  );
  publish({ ...cache, lessonResponses: row ? [...rest, row] : rest, error: null });
}

function putDraft(missionNumber: number, draft: Draft | null): void {
  lastWriteAt = Date.now();
  const current = cache.drafts;
  if (!current) return;
  const rest = current.filter((d) => d.mission_number !== missionNumber);
  publish({ ...cache, drafts: draft ? [...rest, draft] : rest, error: null });
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

  /**
   * The identity statement has one home with two doors: the profile and
   * Mission 13. Editing it in Settings updates the same Mission 13 record
   * (never a second one), and saving 13 updates the profile.
   */
  async updateIdentity(statement: string | null): Promise<Profile> {
    const record = cache.missions ? liveRecordFor(cache.missions, 13) : null;
    if (record && !statement)
      throw new ValidationError(
        "Your statement is saved in Mission 13. Edit it there or here, but it can't be blank.",
      );
    // The record first: if it fails, the profile is untouched, so the two
    // never drift and a retry still sees a change to make.
    if (record && statement && statement !== (record.reflection ?? record.action_text)) {
      const updated = await data.editRecord(record.id, { text: statement }, record.updated_at);
      putMission(updated);
    }
    return store.updateProfile({ identity_statement: statement });
  },

  /** Completes a Mission (any kind). Clears its draft. */
  async saveRecord(input: RecordInput): Promise<Mission> {
    const record = await data.saveRecord(input);
    putMission(record);
    putDraft(input.mission_number, null);
    if (input.mission_number === 13)
      putProfile(await data.updateProfile({ identity_statement: record.reflection }));
    return record;
  },

  async editRecord(
    record: Mission,
    patch: Parameters<typeof data.editRecord>[1],
  ): Promise<Mission> {
    const updated = await data.editRecord(record.id, patch, record.updated_at);
    putMission(updated);
    if (updated.mission_number === 13 && patch.text !== undefined)
      putProfile(await data.updateProfile({ identity_statement: updated.reflection }));
    return updated;
  },

  async reviseLegacy(record: Mission, input: RecordInput): Promise<Mission> {
    const updated = await data.reviseLegacy(record.id, input, record.updated_at);
    putMission(updated);
    putDraft(input.mission_number, null);
    return updated;
  },

  async setRemoved(id: string, removed: boolean): Promise<Mission> {
    const updated = await data.setRemoved(id, removed);
    putMission(updated);
    return updated;
  },

  async saveDraft(draft: Omit<Draft, "updated_at">): Promise<Draft> {
    const saved = await data.saveDraft(draft);
    putDraft(draft.mission_number, saved);
    return saved;
  },

  async deleteDraft(missionNumber: number): Promise<void> {
    await data.deleteDraft(missionNumber);
    putDraft(missionNumber, null);
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

  /**
   * One input, one click. Writes the Proof and completes the Mission in a
   * single step — there is no in-progress state to pass through any more.
   * `existingId` finishes a row left behind by the old declare-then-record
   * flow; without it a fresh row is created, and if completing that row fails
   * it is removed so no half-written Mission can survive.
   */
  async logProof(input: {
    trigger: Trigger;
    action_text: string;
    action_category?: string | null;
    mission_number?: number | null;
    photo_url?: string | null;
    existingId?: string | null;
  }): Promise<Mission> {
    const { existingId, photo_url = null, action_text, trigger } = input;

    if (existingId) {
      // Keep what was declared (action_text); the proof is the reflection.
      await data.updateMission(existingId, { trigger });
      const done = await data.completeMission(existingId, {
        reflection: action_text,
        photo_url,
      });
      putMission(done);
      await dropReminders(done.id);
      return done;
    }

    const created = await data.createMission({
      trigger,
      action_text,
      action_category: input.action_category ?? null,
      mission_number: input.mission_number ?? null,
    });
    try {
      const done = await data.completeMission(created.id, {
        reflection: action_text,
        photo_url,
      });
      putMission(done);
      return done;
    } catch (error) {
      await data.deleteMission(created.id).catch(() => {});
      dropMission(created.id);
      throw error;
    }
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
  drafts: Draft[] | null;
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
    drafts: snapshot.drafts,
    loading:
      snapshot.profile === null ||
      snapshot.missions === null ||
      snapshot.lessonResponses === null ||
      snapshot.drafts === null,
    error: snapshot.error,
    refresh: refreshAppData,
  };
}
