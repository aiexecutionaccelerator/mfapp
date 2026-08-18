import type { ReactNode } from "react";
import DemoBanner from "@/components/DemoBanner";
import { isDemo } from "@/lib/env";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full justify-center">
      {/* The column owns the top safe area once, so screens never double it. */}
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col px-5">
        {isDemo() ? (
          <DemoBanner />
        ) : (
          <div aria-hidden className="h-[env(safe-area-inset-top)] shrink-0" />
        )}
        {children}
      </div>
    </div>
  );
}
