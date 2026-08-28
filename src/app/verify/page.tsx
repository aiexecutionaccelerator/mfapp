"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Headline from "@/components/ui/Headline";
import { createClient } from "@/lib/supabase/client";

const MIN_CODE_LENGTH = 6;
const MAX_CODE_LENGTH = 10;
const RESEND_COOLDOWN = 30;

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const verify = useCallback(
    async (token: string) => {
      if (submitting.current || token.length < MIN_CODE_LENGTH) return;
      submitting.current = true;
      setPending(true);
      setError(null);
      try {
        const supabase = createClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        if (verifyError) throw verifyError;
        router.replace("/");
      } catch {
        setError("That code didn't work. Check it and try again, or resend.");
        setPending(false);
        submitting.current = false;
      }
    },
    [email, router],
  );

  function onCodeChange(value: string) {
    // Supabase OTP length is configurable (6–10 digits); accept the range and
    // let the user submit explicitly rather than guessing when it's complete.
    const digits = value.replace(/\D/g, "").slice(0, MAX_CODE_LENGTH);
    setCode(digits);
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    setCooldown(RESEND_COOLDOWN);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (otpError) {
      setError("Couldn't resend the code. Wait a moment and try again.");
    }
  }

  return (
    <main className="flex flex-1 flex-col pt-2 pb-10">
      <NavAction kind="back" href="/welcome" />

      <div className="mt-8">
        <Headline level={2}>CHECK YOUR EMAIL</Headline>
        <p className="mt-3 text-[17px] text-ink-1">
          We sent a sign-in code to {email}.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verify(code);
          }}
        >
          <input
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Sign-in code"
            autoFocus
            // The tracking adds a trailing gap; indent by the same amount so
            // the digits sit optically centred.
            className="font-display mt-8 w-full rounded-[14px] border border-[var(--line)] bg-[rgba(18,23,34,.6)] px-4 py-4 text-center text-[40px] tracking-[0.3em] indent-[0.3em] text-ink-0 outline-none focus:border-[var(--gold-500)]"
          />

          {error && (
            <p className="mt-3 text-[15px] text-[var(--danger)]">{error}</p>
          )}

          <div className="mt-6 space-y-2">
            <Button type="submit" loading={pending} disabled={code.length < MIN_CODE_LENGTH}>
              VERIFY
            </Button>
            <Button variant="ghost" disabled={cooldown > 0} onClick={resend}>
              {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/welcome")}>
              Use a different email
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
