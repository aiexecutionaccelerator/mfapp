"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingScreens from "@/components/onboarding/OnboardingScreens";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { store } from "@/lib/data/store";
import type { SetStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const IDENTITY_EXAMPLES = [
  "Keeps the promises he makes to himself.",
  "Speaks honestly instead of avoiding hard conversations.",
  "Shows his family how much they matter.",
  "Takes better care of his body.",
  "Finishes the work he knows he needs to do.",
];

const IDENTITY_MAX = 280;

/**
 * Setup (name + identity statement), then the four How It Works screens,
 * ending on the set-arrival question. Completed once; replayable read-only
 * from Settings → How It Works.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // -1 = profile setup; 0–3 = the four onboarding screens.
  const [step, setStep] = useState(-1);
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    track("onboarding_started");
  }, []);

  const nameReady = name.trim().length > 0;
  const identityReady = identity.trim().length > 0;

  async function saveSetup() {
    setPending(true);
    try {
      await store.updateProfile({
        display_name: name.trim(),
        identity_statement: identity.trim(),
      });
      track("profile_setup_completed");
      setStep(0);
    } catch {
      showToast("Couldn't save that. Please try again.", {
        retry: () => void saveSetup(),
      });
    } finally {
      setPending(false);
    }
  }

  async function finish(setStatus: SetStatus) {
    setPending(true);
    try {
      await store.updateProfile({
        set_status: setStatus,
        onboarding_completed: true,
      });
      track("onboarding_completed");
      track("set_status_selected", { setStatus });
      router.replace(setStatus === "arrived" ? "/missions/1" : "/missions");
    } catch {
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void finish(setStatus),
      });
    }
  }

  if (step === -1) {
    return (
      <main className="flex flex-1 flex-col pt-2">
        <div className="mt-6 flex flex-1 flex-col">
          <Eyebrow>LET&apos;S SET YOU UP</Eyebrow>
          <Headline className="mt-2">WELCOME TO YOUR MISSION</Headline>

          <div className="mt-6">
            <Field
              label="Name"
              value={name}
              onChange={setName}
              maxLength={40}
              autoComplete="name"
            />
          </div>

          <div className="mt-6">
            <Field
              label="Over the next 30 days, I am becoming a man who…"
              value={identity}
              onChange={setIdentity}
              maxLength={IDENTITY_MAX}
              multiline
              rows={3}
              placeholder="keeps his word, acts despite fear, and follows through"
            />
          </div>

          <p className="mt-1 text-[13px] text-ink-2">
            One sentence is enough. Tap an example to start from it:
          </p>
          <div className="mt-3 space-y-2">
            {IDENTITY_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setIdentity(example)}
                className={cn(
                  "glass block w-full rounded-[14px] px-4 py-3 text-left text-[15px] leading-snug",
                  identity === example
                    ? "border-[var(--gold-500)] text-ink-0"
                    : "text-ink-1",
                )}
              >
                {example}
              </button>
            ))}
          </div>

          <BottomActions className="mt-8">
            <Button
              loading={pending}
              disabled={!nameReady || !identityReady}
              onClick={() => void saveSetup()}
            >
              CONTINUE
            </Button>
          </BottomActions>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <OnboardingScreens
        screen={step}
        pending={pending}
        onBack={() => setStep(step === 0 ? -1 : step - 1)}
        onNext={() => setStep(step + 1)}
        onSetHere={() => void finish("arrived")}
        onSetOnTheWay={() => void finish("ordered")}
      />
    </main>
  );
}
