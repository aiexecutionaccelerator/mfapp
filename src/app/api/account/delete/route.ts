import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Account deletion is not configured" },
      { status: 500 },
    );
  }

  try {
    const admin = createAdminClient();

    const missions = await admin.from("missions").delete().eq("user_id", user.id);
    if (missions.error) throw missions.error;

    const profile = await admin.from("profiles").delete().eq("id", user.id);
    if (profile.error) throw profile.error;

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete your account" },
      { status: 500 },
    );
  }
}
