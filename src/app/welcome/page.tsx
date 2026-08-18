"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Wordmark from "@/components/Wordmark";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { data } from "@/lib/data";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL, isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

function DeletedNotice() {
  const params = useSearchParams();
  if (params.get("deleted") !== "1") return null;
  return (
    <div className="glass mb-5 rounded-[14px] p-4">
      <p className="text-[15px] text-ink-0">Your account has been deleted.</p>
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const demo = isDemo();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterDemo() {
    setPending(true);
    const profile = await data.getProfile();
    router.push(profile.onboarding_completed ? "/home" : "/onboarding");
  }

  async function continueWithEmail() {
    const address = email.trim();
    if (!address) return;
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: address,
        options: { shouldCreateUser: true },
      });
      if (otpError) throw otpError;
      router.push(`/verify?email=${encodeURIComponent(address)}`);
    } catch {
      setError("We couldn't send that code. Check the address and try again.");
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col pt-[calc(env(safe-area-inset-top)+24px)] pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="ghost-word top-[26%] -left-4 text-[64px]">HONOR</span>
        <span className="ghost-word top-[38%] -left-2 text-[64px]">COURAGE</span>
        <span className="ghost-word top-[50%] -left-6 text-[64px]">
          COMMITMENT
        </span>
      </div>

      <div className="relative flex justify-center">
        <Wordmark size="lg" />
      </div>

      <div className="relative mt-auto pt-16">
        <Suspense fallback={null}>
          <DeletedNotice />
        </Suspense>

        <Headline>WELCOME TO YOUR MISSION</Headline>
        <p className="mt-4 text-[17px] text-ink-1">
          Honor. Courage. Commitment. Put them into action.
        </p>

        <div className="mt-8 space-y-4">
          {demo ? (
            <Button loading={pending} onClick={enterDemo}>
              ENTER DEMO
            </Button>
          ) : (
            <>
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              {error && (
                <p className="text-[15px] text-[var(--danger)]">{error}</p>
              )}
              <Button
                loading={pending}
                disabled={!email.trim()}
                onClick={continueWithEmail}
              >
                CONTINUE WITH EMAIL
              </Button>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-[13px] text-ink-2">
          <a href={LEGAL_PRIVACY_URL}>Privacy</a>
          <span className="px-2">·</span>
          <a href={LEGAL_TERMS_URL}>Terms</a>
        </p>
      </div>
    </main>
  );
}
