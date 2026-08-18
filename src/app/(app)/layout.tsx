"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import TabBar from "@/components/TabBar";
import { data } from "@/lib/data";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    data
      .getProfile()
      .then((profile) => {
        if (!profile.onboarding_completed) router.replace("/onboarding");
      })
      .catch(() => router.replace("/welcome"));
  }, [router]);

  return (
    <>
      <div className="pb-[calc(env(safe-area-inset-bottom)+92px)]">
        {children}
      </div>
      <TabBar />
    </>
  );
}
