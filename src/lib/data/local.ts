import type {
  DataBackend,
  Mission,
  Profile,
  Trigger,
} from "@/lib/data/types";

/** Demo backend — everything lives in localStorage on this device. */

const PROFILE_KEY = "mission.profile";
const MISSIONS_KEY = "mission.missions";
const DEMO_USER_ID = "demo-user";
const DEMO_EMAIL = "demo@mission.local";

const EMPTY_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  display_name: null,
  primary_goal: null,
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

function readMissions(): Mission[] {
  return read<Mission[]>(MISSIONS_KEY, []);
}

function sorted(missions: Mission[]): Mission[] {
  return [...missions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
}

function saveMission(next: Mission): Mission {
  const missions = readMissions().map((m) => (m.id === next.id ? next : m));
  write(MISSIONS_KEY, missions);
  return next;
}

function requireMission(id: string): Mission {
  const mission = readMissions().find((m) => m.id === id);
  if (!mission) throw new Error("Mission not found");
  return mission;
}

export const localBackend: DataBackend = {
  async loadAll() {
    return { profile: readProfile(), missions: sorted(readMissions()) };
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
    };
    write(MISSIONS_KEY, [mission, ...readMissions()]);
    return mission;
  },

  async completeMission(id, reflection) {
    const mission = requireMission(id);
    if (mission.status !== "active") return mission;
    return saveMission({
      ...mission,
      status: "completed",
      completed_at: new Date().toISOString(),
      reflection: reflection?.trim() ? reflection.trim() : null,
    });
  },

  async endMission(id) {
    const mission = requireMission(id);
    if (mission.status !== "active") return mission;
    return saveMission({
      ...mission,
      status: "ended",
      ended_at: new Date().toISOString(),
    });
  },

  async updateMissionAction(id, action_text) {
    return saveMission({ ...requireMission(id), action_text });
  },

  async deleteAccount() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(MISSIONS_KEY);
    window.localStorage.removeItem("mission.reminder");
    window.localStorage.removeItem("mission.devDayOverride");
    window.sessionStorage.clear();
  },

  async signOut() {
    // Demo mode has no session; data stays on the device.
  },
};
