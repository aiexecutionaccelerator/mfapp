"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import { data } from "@/lib/data";

/** Demo mode: the same routing decision, taken from localStorage. */
export default function DemoRouter() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    data.getProfile().then((profile) => {
      if (cancelled) return;
      router.replace(profile.onboarding_completed ? "/home" : "/welcome");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center text-ink-2">
      <Spinner />
    </div>
  );
}
