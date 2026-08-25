export type Trigger = "honor" | "courage" | "commitment";

/**
 * 'active' = declared and in progress. 'completed' = proof logged.
 * 'ended' is legacy (pre-V2 "End Mission") — kept readable, never written.
 */
export type MissionStatus = "active" | "completed" | "ended";

export type SetStatus = "ordered" | "arrived";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  /** Deprecated (pre-V2 goal categories). Kept in the DB, never shown. */
  primary_goal: string | null;
  /** "I am becoming a man who…" — the first line of the Personal Code. */
  identity_statement: string | null;
  owns_set: boolean;
  set_status: SetStatus;
  onboarding_completed: boolean;
  /** Deprecated (pre-V2 day pacing). Missions are self-paced now. */
  challenge_start_date: string | null;
  challenge_completed_at: string | null;
  notifications_enabled: boolean;
  certificate_requested: boolean;
}

/**
 * One Proof — the unified log entry. A structured Mission's state IS its row:
 * `mission_number` set (1–30) means one of the thirty Missions; null means a
 * free-form action from Start. `action_text` is the declared action;
 * `reflection` is the proof ("What did you do?"); `photo_url` is an optional
 * size-capped data URL.
 */
export interface Mission {
  id: string;
  user_id: string;
  trigger: Trigger;
  action_text: string;
  action_category: string | null;
  status: MissionStatus;
  started_at: string;
  completed_at: string | null;
  ended_at: string | null;
  reflection: string | null;
  mission_number: number | null;
  question_answer: string | null;
  photo_url: string | null;
}

export interface MissionDraft {
  trigger: Trigger;
  action_text: string;
  action_category: string | null;
}

/**
 * One answered Mission question. Private — never shown to anyone else and
 * never logged. The table predates V2, so the columns keep their old names:
 * `lesson_id` holds the Mission slug (`m8`), `prompt_id` the prompt key (`q`).
 */
export interface LessonResponse {
  lesson_id: string;
  prompt_id: string;
  answer: string;
  updated_at: string;
}

export const LESSON_ANSWER_MAX = 4000;
export const PROOF_TEXT_MAX = 500;

export interface AppSnapshot {
  profile: Profile;
  missions: Mission[];
  lessonResponses: LessonResponse[];
}

export interface DataBackend {
  /** Profile + missions + responses in one round-trip (initial load). */
  loadAll(): Promise<AppSnapshot>;
  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Profile>): Promise<Profile>;
  /** newest first */
  listMissions(): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | null>;
  /** most recent status='active' */
  getActiveMission(): Promise<Mission | null>;
  createMission(input: {
    trigger: Trigger;
    action_text: string;
    action_category?: string | null;
    mission_number?: number | null;
    question_answer?: string | null;
  }): Promise<Mission>;
  /** idempotent: if already completed, returns it as-is */
  completeMission(
    id: string,
    input: { reflection: string; photo_url?: string | null },
  ): Promise<Mission>;
  /**
   * Deletes the proof but keeps the declared action — the structured Mission
   * reverts to in progress (spec: deleting a structured proof reverts state).
   */
  uncompleteMission(id: string): Promise<Mission>;
  /** Removes the row entirely — free-form delete, or structured abandon. */
  deleteMission(id: string): Promise<void>;
  updateMission(
    id: string,
    patch: Partial<
      Pick<Mission, "action_text" | "reflection" | "question_answer" | "photo_url" | "trigger">
    >,
  ): Promise<Mission>;
  /** oldest first */
  listLessonResponses(): Promise<LessonResponse[]>;
  /** Upsert — one answer per (lesson, prompt). Blank answers are deleted. */
  saveLessonResponse(
    lessonId: string,
    promptId: string,
    answer: string,
  ): Promise<LessonResponse | null>;
  /** Fire-and-forget analytics event. No-op in demo. */
  trackEvent(name: string, props?: Record<string, unknown>): Promise<void>;
  /** Replaces any pending push reminder for this Mission. No-op in demo. */
  scheduleReminder(missionId: string, sendAt: Date): Promise<void>;
  cancelReminders(missionId: string): Promise<void>;
  deleteAccount(): Promise<void>;
  signOut(): Promise<void>;
}
