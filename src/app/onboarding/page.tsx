"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import OnboardingScreens from "@/components/onboarding/OnboardingScreens";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { store, useAppData } from "@/lib/data/store";

/**
 * The box opens with this sentence already in it — real, editable text, not
 * grey placeholder a man can't use. He continues straight away or makes it
 * his own.
 */
const IDENTITY_EXAMPLE = "Keeps his word, acts despite fear, and follows through.";

const IDENTITY_MAX = 280;
const STEP_KEY = "mission.onboardingStep";
const NAME_KEY = "mission.onboardingName";
const IDENTITY_KEY = "mission.onboardingIdentity";

/** Survives an accidental refresh mid-onboarding. */
function readStep(): number {
  if (typeof window === "undefined") return -1;
  const raw = window.sessionStorage.getItem(STEP_KEY);
  const step = raw === null ? NaN : Number(raw);
  return Number.isInteger(step) && step >= -1 && step <= 2 ? step : -1;
}

/**
 * Setup (name + identity statement), then the three How It Works screens,
 * ending in Mission 1. Completed once; replayable from Settings.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAppData();

  // -1 = profile setup; 0–2 = the three How It Works screens.
  const [step, setStepState] = useState(-1);
  const [name, setNameState] = useState("");
  const [identity, setIdentityState] = useState("");
  const [pending, setPending] = useState(false);
  const finishing = useRef(false);

  // Restoring the saved step and typed drafts out of sessionStorage on mount
  // is the "sync with an external system" case.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setStepState(readStep());
    setNameState(window.sessionStorage.getItem(NAME_KEY) ?? "");
    // A saved draft wins; otherwise the box starts with the example in it.
    setIdentityState(
      window.sessionStorage.getItem(IDENTITY_KEY) ?? IDENTITY_EXAMPLE,
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Already onboarded? This page must never show again (belt to the store's
  // stale-read suspenders) — except while finish() itself is redirecting.
  useEffect(() => {
    if (profile?.onboarding_completed && !finishing.current) {
      router.replace("/missions");
    }
  }, [profile, router]);

  function setStep(next: number) {
    window.sessionStorage.setItem(STEP_KEY, String(next));
    setStepState(next);
  }

  /** Every keystroke is kept — a bounce or refresh must never lose typing. */
  function setName(next: string) {
    window.sessionStorage.setItem(NAME_KEY, next);
    setNameState(next);
  }

  function setIdentity(next: string) {
    window.sessionStorage.setItem(IDENTITY_KEY, next);
    setIdentityState(next);
  }

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

  /** Straight into Mission 1 — the first action is the point. */
  async function finish() {
    finishing.current = true;
    setPending(true);
    try {
      await store.updateProfile({ onboarding_completed: true });
      window.sessionStorage.removeItem(STEP_KEY);
      window.sessionStorage.removeItem(NAME_KEY);
      window.sessionStorage.removeItem(IDENTITY_KEY);
      track("onboarding_completed");
      router.replace("/missions/1");
    } catch {
      finishing.current = false;
      setPending(false);
      showToast("Couldn't save that. Please try again.", {
        retry: () => void finish(),
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
            />
          </div>

          {/* The sentence is already in the box, so there is nothing to offer
              him a copy of — one line is all this needs. */}
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            One sentence is enough. Keep this one or write your own — you can
            change it any time in Settings.
          </p>

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
        onStart={() => void finish()}
      />
    </main>
  );
}
