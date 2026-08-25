import { createClient } from "@/lib/supabase/client";
import type {
  AppSnapshot,
  DataBackend,
  LessonResponse,
  Mission,
  Profile,
} from "@/lib/data/types";
import { LESSON_ANSWER_MAX } from "@/lib/data/types";

/** Supabase backend — used whenever Supabase env vars are configured. */

const MISSION_COLUMNS =
  "id,user_id,trigger,action_text,action_category,status,started_at,completed_at,ended_at,reflection,mission_number,question_answer,photo_url";

const RESPONSE_COLUMNS = "lesson_id,prompt_id,answer,updated_at";

const PROFILE_COLUMNS =
  "id,email,display_name,primary_goal,onboarding_completed,challenge_start_date,challenge_completed_at,notifications_enabled,certificate_requested,identity_statement,owns_set,set_status";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not signed in");
  return { supabase, user };
}

export const supabaseBackend: DataBackend = {
  /**
   * One RPC instead of getUser + selects. The function is security invoker,
   * so RLS still applies. Falls back to the plain selects when the RPC is not
   * updated yet (migration 0007) or fails for any other reason.
   */
  async loadAll(): Promise<AppSnapshot> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_app_data");
    if (!error && data) {
      const payload = data as {
        profile: Profile | null;
        missions: Mission[] | null;
        lesson_responses?: LessonResponse[] | null;
      };
      if (payload.profile && "owns_set" in payload.profile) {
        return {
          profile: payload.profile,
          missions: payload.missions ?? [],
          lessonResponses:
            payload.lesson_responses ??
            (await supabaseBackend.listLessonResponses().catch(() => [])),
        };
      }
    }

    const [profile, missions, lessonResponses] = await Promise.all([
      supabaseBackend.getProfile(),
      supabaseBackend.listMissions(),
      supabaseBackend.listLessonResponses().catch(() => []),
    ]);
    return { profile, missions, lessonResponses };
  },

  async getProfile(): Promise<Profile> {
    const { supabase, user } = await requireUser();

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as unknown as Profile;

    // The signup trigger normally creates this row; insert if it is missing.
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email })
      .select(PROFILE_COLUMNS)
      .single();
    if (insertError) throw insertError;
    return created as unknown as Profile;
  },

  async updateProfile(patch): Promise<Profile> {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return data as unknown as Profile;
  },

  async listMissions(): Promise<Mission[]> {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .select(MISSION_COLUMNS)
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Mission[];
  },

  async getMission(id): Promise<Mission | null> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .select(MISSION_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as Mission) ?? null;
  },

  async getActiveMission(): Promise<Mission | null> {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .select(MISSION_COLUMNS)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    return ((data ?? [])[0] as unknown as Mission) ?? null;
  },

  async createMission(input): Promise<Mission> {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .insert({
        user_id: user.id,
        trigger: input.trigger,
        action_text: input.action_text,
        action_category: input.action_category ?? null,
        mission_number: input.mission_number ?? null,
        question_answer: input.question_answer ?? null,
        status: "active",
      })
      .select(MISSION_COLUMNS)
      .single();

    if (error) {
      // Unique-index race on a structured Mission (double tap, two tabs):
      // the existing state row is the answer, not an error.
      if (input.mission_number != null && error.code === "23505") {
        const { data: existing, error: readError } = await supabase
          .from("missions")
          .select(MISSION_COLUMNS)
          .eq("user_id", user.id)
          .eq("mission_number", input.mission_number)
          .maybeSingle();
        if (readError) throw readError;
        if (existing) return existing as unknown as Mission;
      }
      throw error;
    }
    return data as unknown as Mission;
  },

  async completeMission(id, input): Promise<Mission> {
    const { supabase } = await requireUser();

    const { data, error } = await supabase
      .from("missions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        reflection: input.reflection.trim() || null,
        photo_url: input.photo_url ?? null,
      })
      .eq("id", id)
      .eq("status", "active")
      .select(MISSION_COLUMNS);
    if (error) throw error;

    const updated = (data ?? [])[0] as unknown as Mission | undefined;
    if (updated) return updated;

    // Already completed (double tap / retry) — return what is stored.
    const current = await supabaseBackend.getMission(id);
    if (!current) throw new Error("Mission not found");
    return current;
  },

  async uncompleteMission(id): Promise<Mission> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .update({
        status: "active",
        completed_at: null,
        reflection: null,
        photo_url: null,
      })
      .eq("id", id)
      .eq("status", "completed")
      .select(MISSION_COLUMNS);
    if (error) throw error;

    const updated = (data ?? [])[0] as unknown as Mission | undefined;
    if (updated) return updated;

    const current = await supabaseBackend.getMission(id);
    if (!current) throw new Error("Mission not found");
    return current;
  },

  async deleteMission(id): Promise<void> {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("missions").delete().eq("id", id);
    if (error) throw error;
  },

  async updateMission(id, patch): Promise<Mission> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .update(patch)
      .eq("id", id)
      .select(MISSION_COLUMNS)
      .single();
    if (error) throw error;
    return data as unknown as Mission;
  },

  async listLessonResponses(): Promise<LessonResponse[]> {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("lesson_responses")
      .select(RESPONSE_COLUMNS)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as LessonResponse[];
  },

  async saveLessonResponse(
    lessonId,
    promptId,
    answer,
  ): Promise<LessonResponse | null> {
    const { supabase, user } = await requireUser();
    const trimmed = answer.trim().slice(0, LESSON_ANSWER_MAX);

    // Clearing an answer removes it; an empty row is not a record of anything.
    if (!trimmed) {
      const { error } = await supabase
        .from("lesson_responses")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .eq("prompt_id", promptId);
      if (error) throw error;
      return null;
    }

    const { data, error } = await supabase
      .from("lesson_responses")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          prompt_id: promptId,
          answer: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id,prompt_id" },
      )
      .select(RESPONSE_COLUMNS)
      .single();
    if (error) throw error;
    return data as unknown as LessonResponse;
  },

  async trackEvent(name, props): Promise<void> {
    // Best-effort by contract — an analytics failure must never surface.
    try {
      const { supabase, user } = await requireUser();
      await supabase.from("analytics_events").insert({
        user_id: user.id,
        name,
        props: props ?? {},
      });
    } catch {
      /* never block on analytics */
    }
  },

  async scheduleReminder(missionId, sendAt): Promise<void> {
    const { supabase, user } = await requireUser();
    const { error: deleteError } = await supabase
      .from("reminders")
      .delete()
      .eq("mission_id", missionId);
    if (deleteError) throw deleteError;

    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      mission_id: missionId,
      send_at: sendAt.toISOString(),
    });
    if (error) throw error;
  },

  async cancelReminders(missionId): Promise<void> {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("mission_id", missionId);
    if (error) throw error;
  },

  async deleteAccount(): Promise<void> {
    const response = await fetch("/api/account/delete", { method: "POST" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? "Could not delete account");
    }
  },

  async signOut(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
