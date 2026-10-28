import { CURRICULUM_VERSION } from "@/content/missions";
import {
  isLegacy,
  kindFor,
  recordFor,
  recordText,
  textLimitFor,
  validateRecord,
} from "@/lib/curriculum";
import {
  ConflictError,
  LESSON_ANSWER_MAX,
  ValidationError,
  type DataBackend,
  type Draft,
  type LessonResponse,
  type Mission,
  type Profile,
  type Trigger,
} from "@/lib/data/types";

/** Demo backend — everything lives in localStorage on this device. */

const PROFILE_KEY = "mission.profile";
const MISSIONS_KEY = "mission.missions";
const RESPONSES_KEY = "mission.lessonResponses";
const DRAFTS_KEY = "mission.drafts";
const DEMO_USER_ID = "demo-user";
const DEMO_EMAIL = "demo@mission.local";

const EMPTY_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  display_name: null,
  primary_goal: null,
  identity_statement: null,
  owns_set: true,
  set_status: "none",
  onboarding_completed: false,
  challenge_start_date: null,
  challenge_completed_at: null,
  notifications_enabled: true,
  certificate_requested: false,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readProfile(): Profile {
  return { ...EMPTY_PROFILE, ...read<Partial<Profile>>(PROFILE_KEY, {}) };
}

/**
 * Older rows lack the newer columns: backfill them the way migrations 0007
 * and 0009 do. A row with no curriculum_version was made under the first
 * curriculum's wording.
 */
function readMissions(): Mission[] {
  return read<Partial<Mission>[]>(MISSIONS_KEY, []).map((m) => {
    const mission_number = m.mission_number ?? null;
    return {
      question_answer: null,
      photo_url: null,
      kind: kindFor(mission_number),
      curriculum_version: 1,
      confirmed: false,
      context: null,
      focus_area: null,
      frequency: null,
      review_date: null,
      updated_at: m.completed_at ?? m.started_at ?? new Date().toISOString(),
      removed_at: null,
      history: null,
      ...m,
      mission_number,
    };
  }) as Mission[];
}

/** Stamps every write, like the database's updated_at trigger. */
function touch(mission: Mission): Mission {
  // Strictly increasing, so two writes in the same millisecond still differ
  // and the edit guard can tell them apart.
  const now = Math.max(Date.now(), new Date(mission.updated_at).getTime() + 1);
  return { ...mission, updated_at: new Date(now).toISOString() };
}

function readDrafts(): Draft[] {
  return read<Draft[]>(DRAFTS_KEY, []);
}

function dropDraft(missionNumber: number): void {
  write(
    DRAFTS_KEY,
    readDrafts().filter((d) => d.mission_number !== missionNumber),
  );
}

function readResponses(): LessonResponse[] {
  return [...read<LessonResponse[]>(RESPONSES_KEY, [])].sort(
    (a, b) =>
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );
}

function sorted(missions: Mission[]): Mission[] {
  return [...missions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
}

function saveMission(next: Mission): Mission {
  const stamped = touch(next);
  const missions = readMissions().map((m) => (m.id === next.id ? stamped : m));
  write(MISSIONS_KEY, missions);
  return stamped;
}

function requireMission(id: string): Mission {
  const mission = readMissions().find((m) => m.id === id);
  if (!mission) throw new Error("Mission not found");
  return mission;
}

export const localBackend: DataBackend = {
  async loadAll() {
    return {
      profile: readProfile(),
      missions: sorted(readMissions()),
      lessonResponses: readResponses(),
      drafts: readDrafts(),
    };
  },

  async getProfile() {
    return readProfile();
  },

  async updateProfile(patch) {
    const next = { ...readProfile(), ...patch, id: DEMO_USER_ID };
    write(PROFILE_KEY, next);
    return next;
  },

  async listMissions() {
    return sorted(readMissions());
  },

  async getMission(id) {
    return readMissions().find((m) => m.id === id) ?? null;
  },

  async getActiveMission() {
    return sorted(readMissions()).find((m) => m.status === "active") ?? null;
  },

  async createMission(input) {
    const missions = readMissions();
    // Same guarantee as the DB partial unique index: one state row per
    // structured Mission.
    if (input.mission_number != null) {
      const existing = missions.find(
        (m) => m.mission_number === input.mission_number,
      );
      if (existing) return existing;
    }
    const now = new Date().toISOString();
    const mission: Mission = {
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      trigger: input.trigger as Trigger,
      action_text: input.action_text,
      action_category: input.action_category ?? null,
      status: "active",
      started_at: now,
      completed_at: null,
      ended_at: null,
      reflection: null,
      mission_number: input.mission_number ?? null,
      question_answer: input.question_answer ?? null,
      photo_url: null,
      kind: kindFor(input.mission_number ?? null),
      curriculum_version: CURRICULUM_VERSION,
      confirmed: input.mission_number == null,
      context: null,
      focus_area: null,
      frequency: null,
      review_date: null,
      updated_at: now,
      removed_at: null,
      history: null,
    };
    write(MISSIONS_KEY, [mission, ...missions]);
    return mission;
  },

  async saveRecord(input) {
    const missions = readMissions();
    const problem = validateRecord(input, missions);
    if (problem) throw new ValidationError(problem);
    const text = input.text.trim();
    const existing = recordFor(missions, input.mission_number);

    if (existing?.status === "completed") {
      // The same save again (double tap, retry) is not a conflict.
      if (recordText(existing) === text && existing.trigger === input.trigger)
        return existing;
      throw new ConflictError(
        "This Mission was already completed in another tab or device.",
      );
    }

    const now = new Date().toISOString();
    const fields = {
      trigger: input.trigger,
      action_text: text,
      reflection: text,
      status: "completed" as const,
      completed_at: now,
      kind: kindFor(input.mission_number),
      curriculum_version: CURRICULUM_VERSION,
      confirmed: input.confirmed,
      context: input.context,
      focus_area: input.focus_area ?? null,
      frequency: input.frequency ?? null,
      review_date: input.review_date ?? null,
      photo_url: input.photo_url ?? null,
    };

    let saved: Mission;
    if (existing) {
      // A row left in progress by the old two-step flow: finish it.
      saved = saveMission({ ...existing, ...fields });
    } else {
      saved = {
        id: crypto.randomUUID(),
        user_id: DEMO_USER_ID,
        action_category: "mission",
        started_at: now,
        ended_at: null,
        mission_number: input.mission_number,
        question_answer: null,
        updated_at: now,
        removed_at: null,
        history: null,
        ...fields,
      };
      write(MISSIONS_KEY, [saved, ...missions]);
    }
    dropDraft(input.mission_number);
    return saved;
  },

  async editRecord(id, patch, expectedUpdatedAt) {
    const missions = readMissions();
    const existing = requireMission(id);
    if (existing.updated_at !== expectedUpdatedAt)
      throw new ConflictError(
        "This record changed in another tab or device. Reload to see the latest.",
      );
    const { text: rawText, ...rest } = patch;
    const text = rawText?.trim() ?? recordText(existing);
    if (!text) throw new ValidationError("Write your record first.");
    if (text.length > textLimitFor(existing.mission_number))
      throw new ValidationError("That's too long.");

    if (existing.mission_number !== null && !isLegacy(existing)) {
      const problem = validateRecord(
        {
          mission_number: existing.mission_number,
          trigger: rest.trigger ?? existing.trigger,
          text,
          confirmed: true,
          context: existing.context,
          focus_area: rest.focus_area ?? existing.focus_area,
          frequency: rest.frequency ?? existing.frequency,
          review_date: rest.review_date ?? existing.review_date,
        },
        missions,
        { previousReviewDate: existing.review_date, skipPrerequisites: true },
      );
      if (problem) throw new ValidationError(problem);
    }
    // The completion date, kind, wording version and context never change.
    return saveMission({
      ...existing,
      ...rest,
      action_text: text,
      reflection: existing.status === "completed" ? text : existing.reflection,
    });
  },

  async reviseLegacy(id, input, expectedUpdatedAt) {
    const missions = readMissions();
    const existing = requireMission(id);
    if (existing.updated_at !== expectedUpdatedAt)
      throw new ConflictError(
        "This record changed in another tab or device. Reload to see the latest.",
      );
    if (!isLegacy(existing))
      throw new ValidationError("This record already uses the revised task.");
    const problem = validateRecord(input, missions);
    if (problem) throw new ValidationError(problem);
    const text = input.text.trim();
    const saved = saveMission({
      ...existing,
      history: [
        ...(existing.history ?? []),
        {
          curriculum_version: existing.curriculum_version,
          text: recordText(existing),
          trigger: existing.trigger,
          completed_at: existing.completed_at,
        },
      ],
      trigger: input.trigger,
      action_text: text,
      reflection: text,
      kind: kindFor(input.mission_number),
      curriculum_version: CURRICULUM_VERSION,
      confirmed: input.confirmed,
      context: input.context,
      focus_area: input.focus_area ?? null,
      frequency: input.frequency ?? null,
      review_date: input.review_date ?? null,
      photo_url: input.photo_url ?? existing.photo_url,
    });
    dropDraft(input.mission_number);
    return saved;
  },

  async setRemoved(id, removed) {
    const existing = requireMission(id);
    return saveMission({
      ...existing,
      removed_at: removed ? (existing.removed_at ?? new Date().toISOString()) : null,
    });
  },

  async listDrafts() {
    return readDrafts();
  },

  async saveDraft(draft) {
    const saved: Draft = { ...draft, updated_at: new Date().toISOString() };
    write(DRAFTS_KEY, [
      ...readDrafts().filter((d) => d.mission_number !== draft.mission_number),
      saved,
    ]);
    return saved;
  },

  async deleteDraft(missionNumber) {
    dropDraft(missionNumber);
  },

  async completeMission(id, input) {
    const mission = requireMission(id);
    if (mission.status !== "active") return mission;
    return saveMission({
      ...mission,
      status: "completed",
      completed_at: new Date().toISOString(),
      reflection: input.reflection.trim() || null,
      photo_url: input.photo_url ?? null,
    });
  },

  async uncompleteMission(id) {
    const mission = requireMission(id);
    if (mission.status !== "completed") return mission;
    return saveMission({
      ...mission,
      status: "active",
      completed_at: null,
      reflection: null,
      photo_url: null,
    });
  },

  async deleteMission(id) {
    write(
      MISSIONS_KEY,
      readMissions().filter((m) => m.id !== id),
    );
  },

  async updateMission(id, patch) {
    return saveMission({ ...requireMission(id), ...patch });
  },

  async listLessonResponses() {
    return readResponses();
  },

  async saveLessonResponse(lessonId, promptId, answer) {
    const trimmed = answer.trim().slice(0, LESSON_ANSWER_MAX);
    const rest = readResponses().filter(
      (row) => !(row.lesson_id === lessonId && row.prompt_id === promptId),
    );
    if (!trimmed) {
      write(RESPONSES_KEY, rest);
      return null;
    }
    const row: LessonResponse = {
      lesson_id: lessonId,
      prompt_id: promptId,
      answer: trimmed,
      updated_at: new Date().toISOString(),
    };
    write(RESPONSES_KEY, [...rest, row]);
    return row;
  },

  // Demo mode keeps no analytics — nothing leaves the device.
  async trackEvent() {},

  // Demo mode has no server to push from — the localStorage reminder written
  // by the Mission Active screen still drives the Home banner.
  async scheduleReminder() {},

  async cancelReminders() {},

  async deleteAccount() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(MISSIONS_KEY);
    window.localStorage.removeItem(RESPONSES_KEY);
    window.localStorage.removeItem(DRAFTS_KEY);
    window.localStorage.removeItem("mission.course");
    window.localStorage.removeItem("mission.reminder");
    window.localStorage.removeItem("mission.devDayOverride");
    window.sessionStorage.clear();
  },

  async signOut() {
    // Demo mode has no session; data stays on the device.
  },
};
