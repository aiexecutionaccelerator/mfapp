import type { ReactNode } from "react";
import DemoBanner from "@/components/DemoBanner";
import { isDemo } from "@/lib/env";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center">
      <div className="relative w-full max-w-[430px] px-5">
        {isDemo() && <DemoBanner />}
        {children}
      </div>
    </div>
  );
}
