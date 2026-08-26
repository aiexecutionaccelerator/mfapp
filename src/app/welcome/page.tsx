"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import BottleVisual from "@/components/BottleVisual";
import Wordmark from "@/components/Wordmark";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { ART, artUrl } from "@/lib/art";
import { data } from "@/lib/data";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL, isDemo } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

/** Soft contact shadow that pins a bottle's base to the floor. */
function GroundShadow({ width }: { width: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -bottom-[7px] left-1/2 h-[12px] -translate-x-1/2"
      style={{
        width,
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,.6) 0%, rgba(0,0,0,.25) 45%, transparent 72%)",
        filter: "blur(2px)",
      }}
    />
  );
}

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
  const crest = artUrl(ART.crest);
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

      {/* The three Scent Triggers, Courage front and center, the crest as a
          watermark and a warm light behind them pooling on the floor. */}
      <div aria-hidden className="relative mt-8 flex items-end justify-center pb-6">
        {/* Backlight behind the bottles… */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-[240px] w-[300px] -translate-x-1/2 -translate-y-[62%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,175,55,.16) 0%, rgba(212,175,55,.05) 45%, transparent 70%)",
          }}
        />
        {crest && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={crest}
            alt=""
            className="pointer-events-none absolute top-1/2 left-1/2 w-[240px] -translate-x-1/2 -translate-y-[58%] opacity-[0.07]"
          />
        )}
        {/* Upright on one ground plane: the side bottles stand a step behind
            (their floor line sits a touch higher), Courage a step in front.
            Each base gets a contact shadow so they read as ON the floor. */}
        <div className="relative -mr-3 mb-2">
          <BottleVisual trigger="honor" size={92} />
          <GroundShadow width={78} />
        </div>
        <div className="relative z-10">
          <BottleVisual trigger="courage" size={122} />
          <GroundShadow width={106} />
        </div>
        <div className="relative -ml-3 mb-2">
          <BottleVisual trigger="commitment" size={92} />
          <GroundShadow width={78} />
        </div>
        {/* …and the light falling on the floor beneath their bases. */}
        <div
          className="pointer-events-none absolute -bottom-1 left-1/2 h-[48px] w-[330px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at center top, rgba(212,175,55,.15) 0%, rgba(212,175,55,.04) 55%, transparent 78%)",
          }}
        />
      </div>

      <p className="eyebrow mt-8 text-center text-[13px] tracking-[0.3em] text-gold-300">
        MORE THAN FRAGRANCE
      </p>

      <h1 className="font-display mt-4 text-[56px] leading-[0.95] text-ink-0 uppercase">
        Turn scent
        <br />
        into action.
      </h1>

      <p className="mt-5 text-[17px] leading-relaxed text-ink-1">
        Three fragrances. Three values. Thirty small missions that build proof
        of the man you&apos;re becoming.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <DeletedNotice />
        </Suspense>

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
