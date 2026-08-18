import Link from "next/link";
import type { ReactNode } from "react";
import Headline from "@/components/ui/Headline";
import Wordmark from "@/components/Wordmark";

/** Shared shell for the public Privacy Policy and Terms pages. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col pt-6 pb-16">
      <div className="flex justify-center">
        <Wordmark />
      </div>
      <Headline className="mt-8">{title}</Headline>
      <p className="mt-2 text-[13px] tracking-[0.14em] text-ink-2 uppercase">
        Last updated {updated}
      </p>
      <div className="legal mt-6 space-y-6 text-[15px] leading-relaxed text-ink-1">
        {children}
      </div>
      <div className="mt-10 flex gap-6 text-[15px]">
        <Link href="/privacy" className="text-ink-2 underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-ink-2 underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        <Link href="/" className="ml-auto text-gold-300 underline-offset-4 hover:underline">
          Back to app
        </Link>
      </div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[22px] tracking-[0.02em] text-ink-0 uppercase">
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
