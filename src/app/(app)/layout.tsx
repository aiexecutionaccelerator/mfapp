"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import TabBar from "@/components/TabBar";
import { useAppData } from "@/lib/data/store";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Shared cache — the screens below use the same copy, so this costs no request.
  const { profile, error } = useAppData();

  useEffect(() => {
    if (profile && !profile.onboarding_completed) router.replace("/onboarding");
  }, [profile, router]);

  useEffect(() => {
    if (error) router.replace("/welcome");
  }, [error, router]);

  return (
    <>
      <div className="flex flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+92px)]">
        {children}
      </div>
      <TabBar />
    </>
  );
}
