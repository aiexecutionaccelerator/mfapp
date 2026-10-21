"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingScreens from "@/components/onboarding/OnboardingScreens";
import { store } from "@/lib/data/store";

/**
 * How It Works — the two onboarding screens, replayable from Settings.
 * The read is recorded like a Mission answer (slug "guide").
 */
export default function HowItWorksPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(0);

  function leave() {
    if (window.history.length > 1) router.back();
    else router.push("/missions");
  }

  function finish() {
    // Best-effort — leaving must never hang on the save.
    void store.saveLessonResponse("guide", "q", "done").catch(() => {});
    leave();
  }

  return (
    <main className="flex flex-1 flex-col pt-2 pb-8">
      <OnboardingScreens
        screen={screen}
        replay
        onBack={() => (screen === 0 ? leave() : setScreen(screen - 1))}
        onNext={() => setScreen(screen + 1)}
        onDone={finish}
      />
    </main>
  );
}
