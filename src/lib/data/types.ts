export type Trigger = "honor" | "courage" | "commitment";
export type MissionStatus = "active" | "completed" | "ended";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  primary_goal: string | null;
  onboarding_completed: boolean;
  challenge_start_date: string | null;
  challenge_completed_at: string | null;
  notifications_enabled: boolean;
  certificate_requested: boolean;
}

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
}

export interface MissionDraft {
  trigger: Trigger;
  action_text: string;
  action_category: string | null;
}

export interface AppSnapshot {
  profile: Profile;
  missions: Mission[];
}

export interface DataBackend {
  /** Profile + missions in one round-trip — used for the initial load. */
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
  }): Promise<Mission>;
  /** idempotent: if already completed, returns it as-is */
  completeMission(id: string, reflection?: string | null): Promise<Mission>;
  endMission(id: string): Promise<Mission>;
  updateMissionAction(id: string, action_text: string): Promise<Mission>;
  /** Replaces any pending push reminder for this Mission. No-op in demo. */
  scheduleReminder(missionId: string, sendAt: Date): Promise<void>;
  cancelReminders(missionId: string): Promise<void>;
  deleteAccount(): Promise<void>;
  signOut(): Promise<void>;
}
