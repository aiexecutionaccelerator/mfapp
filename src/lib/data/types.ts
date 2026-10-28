export type Trigger = "honor" | "courage" | "commitment";

/**
 * What a saved record IS (curriculum revision 2). Only `action` is evidence
 * of something done: reflections recall, code defines, plans look ahead.
 * Derived from the Mission number by the server, never chosen by the client.
 * One-Off Actions are always `action`.
 */
export type RecordKind = "action" | "reflection" | "code" | "plan";

/**
 * The saved context a record was made with (curriculum revision 2): his
 * promise, focus and aim, practice plan, Personal Code. Frozen when the
 * Mission is completed, so a later edit never rewrites what an older record
 * was working toward.
 */
export interface MissionContext {
  promise?: string | null;
  focus?: string | null;
  aim?: string | null;
  practice?: {
    text: string;
    frequency: string | null;
    review_date: string | null;
    trigger: Trigger;
  } | null;
  code?: { label: string; value: string }[] | null;
}

/** A record's earlier wording, kept when he moved it to the revised task. */
export interface PreviousVersion {
  curriculum_version: number;
  text: string;
  trigger: Trigger;
  completed_at: string | null;
}

/**
 * 'active' = declared and in progress. 'completed' = proof logged.
 * 'ended' is legacy (pre-V2 "End Mission") — kept readable, never written.
 */
export type MissionStatus = "active" | "completed" | "ended";

/** none → MARK ORDERED → ordered ("on the way") → MARK RECEIVED → arrived. */
export type SetStatus = "none" | "ordered" | "arrived";

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
  /* ---- curriculum revision 2 ---- */
  /** Set by the server from the Mission number. One-Off Actions: action. */
  kind: RecordKind;
  /** 1 = the first curriculum's wording; 2 = revision 2. */
  curriculum_version: number;
  /** "I have taken this action." Required on a completed action Mission. */
  confirmed: boolean;
  context: MissionContext | null;
  /** Mission 21. */
  focus_area: string | null;
  /** Missions 27 and 30. */
  frequency: string | null;
  /** Missions 27 and 30: YYYY-MM-DD, in the future when first saved. */
  review_date: string | null;
  updated_at: string;
  /** Removed records keep their place and date; restore brings them back. */
  removed_at: string | null;
  /** Earlier wording he replaced on purpose (a legacy record moved to rev 2). */
  history: PreviousVersion[] | null;
}

/**
 * Work saved for later on an unfinished Mission. Kept apart from the record
 * so it never earns progress. `context` is what he was working toward when
 * he saved it (null = nothing was saved yet): if his aim has changed since,
 * the Mission asks which one to use.
 */
export interface Draft {
  mission_number: number;
  curriculum_version: number;
  text: string;
  trigger: Trigger | null;
  focus_area: string | null;
  frequency: string | null;
  review_date: string | null;
  context: MissionContext | null;
  updated_at: string;
}

/** The fields a Mission saves, whatever its kind. */
export interface RecordInput {
  mission_number: number;
  trigger: Trigger;
  text: string;
  confirmed: boolean;
  context: MissionContext | null;
  focus_area?: string | null;
  frequency?: string | null;
  review_date?: string | null;
  photo_url?: string | null;
}

/** A save that lost a race with another tab or device. */
export class ConflictError extends Error {
  constructor(message = "This was changed somewhere else.") {
    super(message);
    this.name = "ConflictError";
  }
}

/** A save the rules refuse (missing prerequisite, no confirmation…). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
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
/** Record text limit (revision 2): 1,000 characters, 280 on Mission 13. */
export const PROOF_TEXT_MAX = 1000;
export const IDENTITY_MAX = 280;

export interface AppSnapshot {
  profile: Profile;
  missions: Mission[];
  lessonResponses: LessonResponse[];
  drafts: Draft[];
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
  /**
   * Completes a Mission (revision 2): one canonical record per Mission. A
   * retry of the same save returns the stored record; a different save that
   * lost a race throws ConflictError. A legacy record is moved to the
   * revised task only through `reviseLegacy`.
   */
  saveRecord(input: RecordInput): Promise<Mission>;
  /**
   * Edits a saved record (SAVE CHANGES). Its completion date, kind, wording
   * version and context stay as they were. `expectedUpdatedAt` guards
   * against overwriting an edit made in another tab.
   */
  editRecord(
    id: string,
    patch: Partial<
      Pick<Mission, "trigger" | "focus_area" | "frequency" | "review_date" | "photo_url">
    > & { text?: string },
    expectedUpdatedAt: string,
  ): Promise<Mission>;
  /** Moves a revision 1 record to the revised task; the old text is kept in `history`. */
  reviseLegacy(id: string, input: RecordInput, expectedUpdatedAt: string): Promise<Mission>;
  setRemoved(id: string, removed: boolean): Promise<Mission>;
  listDrafts(): Promise<Draft[]>;
  saveDraft(draft: Omit<Draft, "updated_at">): Promise<Draft>;
  deleteDraft(missionNumber: number): Promise<void>;
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
