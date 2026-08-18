"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NavAction from "@/components/NavAction";
import TriggerCard from "@/components/TriggerCard";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { TRIGGER_ORDER } from "@/content/triggers";
import { data } from "@/lib/data";
import { cn, todayLocal } from "@/lib/utils";

const GOALS = [
  "Confidence",
  "Career / Business",
  "Social / Relationships",
  "Health / Fitness",
  "Discipline / Follow-Through",
  "Custom",
];

const LOOP = [
  { letter: "S", text: "SELECT — Choose how you need to show up." },
  { letter: "T", text: "TRIGGER — Apply the fragrance." },
  { letter: "A", text: "ACT — Take the action." },
  { letter: "R", text: "REINFORCE — Come back and record what you did." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [pending, setPending] = useState(false);

  const goalReady =
    goal !== null && (goal !== "Custom" || customGoal.trim().length > 0);

  async function finish() {
    setPending(true);
    try {
      await data.updateProfile({
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
    <main className="flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+8px)] pb-10">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <NavAction kind="back" onClick={() => setStep(step - 1)} />
        ) : (
          <span className="h-12 w-12" />
        )}
        <div className="flex gap-2" aria-label={`Step ${step + 1} of 4`}>
          {[0, 1, 2, 3].map((index) => (
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
          <Headline>WHAT ARE YOU WORKING TOWARD RIGHT NOW?</Headline>
          <div role="radiogroup" className="mt-6 space-y-3">
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
          <div className="mt-8">
            <Button disabled={!goalReady} onClick={() => setStep(1)}>
              CONTINUE
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>MEET YOUR THREE SCENT TRIGGERS</Headline>
          <div className="mt-6 space-y-3">
            {TRIGGER_ORDER.map((trigger) => (
              <TriggerCard key={trigger} trigger={trigger} />
            ))}
          </div>
          <div className="mt-8">
            <Button onClick={() => setStep(2)}>CONTINUE</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <Headline className="mt-2">THE LOOP</Headline>
          <div className="mt-6 space-y-4">
            {LOOP.map(({ letter, text }) => (
              <div key={letter} className="flex items-center gap-4">
                <span className="font-display w-10 shrink-0 text-[40px] leading-none text-gold-gradient">
                  {letter}
                </span>
                <p className="text-[15px] text-ink-1">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button onClick={() => setStep(3)}>CONTINUE</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>YOUR 30-DAY MISSION STARTS NOW.</Headline>
          <p className="mt-4 text-[17px] text-ink-1">
            For the next 30 days, don&apos;t just wear the fragrances. Give them
            a job.
          </p>
          <div className="mt-8">
            <Button loading={pending} onClick={finish}>
              START MY MISSION
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
