"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingScreens from "@/components/onboarding/OnboardingScreens";

/** Settings → How It Works: replay the four onboarding screens, read-only. */
export default function HowItWorksPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);

  return (
    <main className="flex flex-1 flex-col pt-2 pb-8">
      <OnboardingScreens
        screen={screen}
        replay
        onBack={() =>
          screen === 0 ? router.push("/settings") : setScreen(screen - 1)
        }
        onNext={() => setScreen(screen + 1)}
        onDone={() => router.push("/settings")}
      />
    </main>
  );
}
