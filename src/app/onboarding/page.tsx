"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { store } from "@/lib/data/store";
import { cn, todayLocal } from "@/lib/utils";

const GOALS = [
  "Confidence",
  "Career / Business",
  "Social / Relationships",
  "Health / Fitness",
  "Discipline / Follow-Through",
  "Custom",
];

const STEP_COUNT = 2;

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [pending, setPending] = useState(false);

  const nameReady = name.trim().length > 0;
  const goalReady =
    goal !== null && (goal !== "Custom" || customGoal.trim().length > 0);

  async function finish() {
    setPending(true);
    try {
      await store.updateProfile({
        display_name: name.trim(),
        primary_goal: goal === "Custom" ? customGoal.trim() : goal,
        onboarding_completed: true,
        challenge_start_date: todayLocal(),
      });
      router.replace("/home");
    } catch {
      setPending(false);
      showToast("Couldn't save that. Please try again.", { retry: finish });
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <NavAction kind="back" onClick={() => setStep(step - 1)} />
        ) : (
          <span className="h-12 w-12" />
        )}
        <div className="flex gap-2" aria-label={`Step ${step + 1} of ${STEP_COUNT}`}>
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                index === step ? "bg-[var(--gold-500)]" : "bg-[var(--line-strong)]",
              )}
            />
          ))}
        </div>
        <span className="h-12 w-12" />
      </div>

      {step === 0 && (
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

          <Eyebrow className="mt-8">WHAT ARE YOU WORKING TOWARD?</Eyebrow>
          <div role="radiogroup" className="mt-3 space-y-3">
            {GOALS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={goal === option}
                onClick={() => setGoal(option)}
                className={cn(
                  "glass flex min-h-[56px] w-full items-center rounded-[14px] px-4 text-left text-[17px]",
                  goal === option
                    ? "border-[var(--gold-500)] text-ink-0"
                    : "text-ink-1",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          {goal === "Custom" && (
            <div className="mt-4">
              <Field
                label="Your goal"
                value={customGoal}
                onChange={setCustomGoal}
                maxLength={60}
                autoFocus
              />
            </div>
          )}

          <BottomActions className="mt-8">
            <Button
              disabled={!nameReady || !goalReady}
              onClick={() => setStep(1)}
            >
              CONTINUE
            </Button>
          </BottomActions>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>YOUR 30-DAY MISSION STARTS NOW.</Headline>
          <p className="mt-4 text-[17px] text-ink-1">
            For the next 30 days, wear your fragrance with intent. One short
            lesson and one real-world Mission a day.
          </p>
          <BottomActions className="mt-8">
            <Button loading={pending} onClick={finish}>
              START MY MISSION
            </Button>
          </BottomActions>
        </div>
      )}
    </main>
  );
}
