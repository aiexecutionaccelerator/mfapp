import { createClient } from "@/lib/supabase/client";
import type { DataBackend, Mission, Profile } from "@/lib/data/types";

/** Supabase backend — used whenever Supabase env vars are configured. */

const MISSION_COLUMNS =
  "id,user_id,trigger,action_text,action_category,status,started_at,completed_at,ended_at,reflection";

const PROFILE_COLUMNS =
  "id,email,display_name,primary_goal,onboarding_completed,challenge_start_date,challenge_completed_at,notifications_enabled,certificate_requested";

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
        status: "active",
      })
      .select(MISSION_COLUMNS)
      .single();
    if (error) throw error;
    return data as unknown as Mission;
  },

  async completeMission(id, reflection): Promise<Mission> {
    const { supabase } = await requireUser();
    const trimmed = reflection?.trim() ? reflection.trim() : null;

    const { data, error } = await supabase
      .from("missions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        reflection: trimmed,
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

  async endMission(id): Promise<Mission> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "active")
      .select(MISSION_COLUMNS);
    if (error) throw error;

    const updated = (data ?? [])[0] as unknown as Mission | undefined;
    if (updated) return updated;

    const current = await supabaseBackend.getMission(id);
    if (!current) throw new Error("Mission not found");
    return current;
  },

  async updateMissionAction(id, action_text): Promise<Mission> {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("missions")
      .update({ action_text })
      .eq("id", id)
      .select(MISSION_COLUMNS)
      .single();
    if (error) throw error;
    return data as unknown as Mission;
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
