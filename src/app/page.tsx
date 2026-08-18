import { redirect } from "next/navigation";
import DemoRouter from "@/app/DemoRouter";
import { isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  if (isDemo()) return <DemoRouter />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? "/home" : "/onboarding");
}
