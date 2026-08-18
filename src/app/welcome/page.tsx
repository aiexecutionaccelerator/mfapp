"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import Wordmark from "@/components/Wordmark";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Headline from "@/components/ui/Headline";
import { ART, artUrl } from "@/lib/art";
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
  const hero = artUrl(ART.hero);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterDemo() {
    setPending(true);
    const profile = await data.getProfile();
    router.push(profile.onboarding_completed ? "/home" : "/onboarding");
  }

  async function continueWithEmail(event?: FormEvent) {
    event?.preventDefault();
    const address = email.trim();
    if (!address || pending) return;
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
    <main className="flex flex-1 flex-col pt-6 pb-10">
      <div className="flex justify-center">
        <Wordmark size="lg" />
      </div>

      {/* Hero lives in the empty space only — never behind readable text. */}
      <div
        aria-hidden
        className="pointer-events-none relative min-h-16 flex-1 overflow-hidden"
      >
        <div className="absolute top-1/2 left-0 -translate-y-1/2 space-y-1">
          <p className="ghost-word relative text-[64px]">HONOR</p>
          <p className="ghost-word relative text-[64px]">COURAGE</p>
          <p className="ghost-word relative text-[64px]">COMMITMENT</p>
        </div>
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            className="absolute inset-0 m-auto h-[92%] max-h-[420px] w-auto object-contain"
            style={{ filter: "drop-shadow(0 24px 40px rgba(0,0,0,.55))" }}
          />
        )}
      </div>

      <div className="pt-10">
        <Suspense fallback={null}>
          <DeletedNotice />
        </Suspense>

        <Headline>WELCOME TO YOUR MISSION</Headline>
        <p className="mt-4 text-[17px] text-ink-1">
          Honor. Courage. Commitment. Put them into action.
        </p>

        <div className="mt-8">
          {demo ? (
            <Button loading={pending} onClick={enterDemo}>
              ENTER DEMO
            </Button>
          ) : (
            <form className="space-y-4" onSubmit={continueWithEmail}>
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
              <Button type="submit" loading={pending} disabled={!email.trim()}>
                CONTINUE WITH EMAIL
              </Button>
            </form>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center text-[13px] text-ink-2">
          <a
            href={LEGAL_PRIVACY_URL}
            className="inline-flex min-h-12 items-center px-3"
          >
            Privacy
          </a>
          <span aria-hidden>·</span>
          <a
            href={LEGAL_TERMS_URL}
            className="inline-flex min-h-12 items-center px-3"
          >
            Terms
          </a>
        </div>
      </div>
    </main>
  );
}
