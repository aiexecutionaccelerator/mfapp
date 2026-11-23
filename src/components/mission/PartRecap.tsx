"use client";

import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import GlassCard from "@/components/ui/GlassCard";
import { getMissionDef } from "@/content/missions";
import { TRIGGERS } from "@/content/triggers";
import { aimOf, liveRecordFor, practiceOf, recordText } from "@/lib/curriculum";
import type { Mission, Profile } from "@/lib/data/types";
import { compilePersonalCode } from "@/lib/personalCode";
import { computeStats } from "@/lib/stats";
import { formatDay } from "@/lib/utils";

/**
 * "What you've learned" (revision 2.2, 19 Nov): after the last Mission of
 * each part, built from his own answers so the lesson is his, not a summary
 * he skims. Each ends on one sentence naming the principle. Mission 30's is
 * the graduation recap, which also stays on Mission 30's saved page.
 */
export const RECAP_AFTER = new Set([7, 14, 21, 30]);

const LESSONS = {
  7: "You defined each value, then put it into action. That is the whole method: decide, then do.",
  14: "Every kept promise and owned mistake is evidence. Self-trust is built from evidence, not from feeling confident.",
  21: "Values show up in how you spend your time, attention and energy, not in what you say about them.",
  30: "What you keep doing is what makes you the man you described.",
} as const;

/** The four lessons, one per part, in the order he learned them. */
const COURSE_LESSONS = [
  "Decide, then do.",
  "Self-trust is built from evidence.",
  "Values show in how you spend your time.",
  "What you keep doing makes you the man you described.",
];

export default function PartRecap({
  after,
  missions,
  profile,
}: {
  after: number;
  missions: Mission[];
  profile: Profile;
}) {
  if (!RECAP_AFTER.has(after)) return null;
  const text = (n: number) => {
    const record = liveRecordFor(missions, n);
    return record ? recordText(record) : null;
  };

  return (
    <section aria-labelledby="recap-title" className="mt-10 text-left">
      <div aria-hidden className="rule-fade" />
      <Eyebrow tone="gold" className="mt-6">
        {after === 30 ? "What you learned in 30 missions" : "What you've learned"}
      </Eyebrow>
      <h2 id="recap-title" className="font-display mt-2 text-[30px] leading-[1.1] text-ink-0 uppercase">
        {after === 7
          ? "You know your code."
          : after === 14
            ? "You've built self-trust."
            : after === 21
              ? "Your values are at work."
              : "You finished the 30."}
      </h2>

      {after === 7 && <DefinedThenDid text={text} />}
      {after === 14 && <TrustBuilt text={text} missions={missions} profile={profile} />}
      {after === 21 && <ValuesAtWork text={text} missions={missions} />}
      {after === 30 && <Graduation text={text} missions={missions} profile={profile} />}

      <p className="mt-6 border-l-2 border-[var(--gold-500)] pl-4 text-[17px] leading-snug text-ink-0">
        {LESSONS[after as keyof typeof LESSONS]}
      </p>
    </section>
  );
}

/** After 7: each definition beside the action that put it to work. */
function DefinedThenDid({ text }: { text: (n: number) => string | null }) {
  const pairs = [
    { value: "Honor", defined: 2, did: 5 },
    { value: "Courage", defined: 3, did: 6 },
    { value: "Commitment", defined: 4, did: 7 },
  ];
  return (
    <div className="mt-5 space-y-3">
      {pairs.map((p) => (
        <GlassCard key={p.value} className="p-4">
          <p className="eyebrow text-gold-300">{p.value}</p>
          <p className="mt-2 text-[13px] text-ink-2">You defined it</p>
          <p className="text-[16px] leading-snug text-ink-0">{text(p.defined) ?? "Not saved yet."}</p>
          <p className="mt-3 text-[13px] text-ink-2">Then you did it</p>
          <p className="text-[16px] leading-snug text-ink-1">{text(p.did) ?? "Not saved yet."}</p>
        </GlassCard>
      ))}
    </div>
  );
}

/** After 14: his line, what matters most, who he's becoming, and his proof. */
function TrustBuilt({
  text,
  missions,
  profile,
}: {
  text: (n: number) => string | null;
  missions: Mission[];
  profile: Profile;
}) {
  const stats = computeStats(missions);
  const rows = [
    { label: "My line", value: text(11) },
    { label: "What matters most", value: text(12) },
    { label: "I am becoming a man who…", value: profile.identity_statement ?? text(13) },
  ];
  return (
    <>
      <GlassCard className="mt-5 space-y-4 p-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-[13px] text-ink-2">{r.label}</p>
            <p className="mt-0.5 text-[16px] leading-snug whitespace-pre-wrap text-ink-0">{r.value ?? "Not saved yet."}</p>
          </div>
        ))}
      </GlassCard>
      <ProofCounts honor={stats.actions.honor} courage={stats.actions.courage} commitment={stats.actions.commitment} />
    </>
  );
}

/** After 21: the seven areas he worked on, and the aim he chose. */
function ValuesAtWork({ text, missions }: { text: (n: number) => string | null; missions: Mission[] }) {
  const aim = aimOf(missions);
  const areas = [15, 16, 17, 18, 19, 20];
  return (
    <>
      <ul className="mt-5 space-y-2">
        {areas.map((n) => {
          const def = getMissionDef(n);
          const done = Boolean(text(n));
          return (
            <li key={n} className="flex items-start gap-3 text-[15px] leading-snug">
              <span aria-hidden className={done ? "text-gold-300" : "text-ink-2"}>{done ? "✓" : "·"}</span>
              <span className={done ? "text-ink-0" : "text-ink-2"}>{def?.title}</span>
            </li>
          );
        })}
      </ul>
      {aim.status === "set" && (
        <GlassCard className="mt-5 p-4">
          <p className="eyebrow text-gold-300">Your seven-day aim · {aim.focus}</p>
          <p className="mt-2 text-[16px] leading-snug text-ink-0">{aim.aim}</p>
        </GlassCard>
      )}
    </>
  );
}

/** After 30: the page he keeps. */
function Graduation({
  text,
  missions,
  profile,
}: {
  text: (n: number) => string | null;
  missions: Mission[];
  profile: Profile;
}) {
  const stats = computeStats(missions);
  const code = compilePersonalCode(profile, missions).filter((line) => line.key !== "practice");
  // The plan from 27 (his practice); 30's own words show under "In your words".
  const practice = liveRecordFor(missions, 27);
  const plan = practiceOf(missions);
  const learned = text(30);
  const sameAsPlan = Boolean(practice && learned && recordText(practice) === learned);
  return (
    <>
      <GlassCard className="mt-5 p-4">
        <p className="eyebrow text-gold-300">Your Personal Code</p>
        <dl className="mt-3 space-y-3">
          {code.map((line) => (
            <div key={line.key}>
              <dt className="text-[13px] text-ink-2">{line.label}</dt>
              <dd className="mt-0.5 text-[16px] leading-snug whitespace-pre-wrap text-ink-0">{line.value ?? "Not saved yet."}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>

      <ProofCounts honor={stats.actions.honor} courage={stats.actions.courage} commitment={stats.actions.commitment} />

      <GlassCard className="mt-4 p-4">
        <p className="eyebrow text-gold-300">Four lessons</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[16px] leading-snug text-ink-0">
          {COURSE_LESSONS.map((lesson) => (
            <li key={lesson}>{lesson}</li>
          ))}
        </ol>
      </GlassCard>

      {practice && (
        <GlassCard className="mt-4 p-4">
          <p className="eyebrow text-gold-300">Your practice</p>
          <p className="mt-2 text-[16px] leading-snug whitespace-pre-wrap text-ink-0">{recordText(practice)}</p>
          {(practice.frequency || practice.review_date || plan?.frequency) && (
            <p className="mt-2 text-[14px] text-ink-1">
              {[
                practice.frequency ?? plan?.frequency,
                (practice.review_date ?? plan?.review_date) && `Review ${formatDay((practice.review_date ?? plan?.review_date) as string)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </GlassCard>
      )}

      {learned && !sameAsPlan && (
        <GlassCard className="mt-4 p-4">
          <p className="eyebrow text-gold-300">In your words</p>
          <p className="mt-2 text-[16px] leading-snug whitespace-pre-wrap text-ink-0">{learned}</p>
        </GlassCard>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 text-center text-[14px]">
        <Link href="/live" className="press rounded-[14px] border border-[var(--line-strong)] px-3 py-3 text-ink-0">
          Keep logging in Live It
        </Link>
        <Link href="/personal-code" className="press rounded-[14px] border border-[var(--line-strong)] px-3 py-3 text-ink-0">
          Share your code with someone you trust
        </Link>
      </div>
    </>
  );
}

function ProofCounts({ honor, courage, commitment }: { honor: number; courage: number; commitment: number }) {
  const cells = [
    { label: TRIGGERS.honor.provedWith, n: honor },
    { label: TRIGGERS.courage.provedWith, n: courage },
    { label: TRIGGERS.commitment.provedWith, n: commitment },
  ];
  return (
    <div className="mt-4">
      <p className="eyebrow text-ink-2">Your proof: actions by value</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {cells.map((c) => (
          <div key={c.label} className="glass rounded-[14px] p-3 text-center">
            <p className="font-display text-[30px] leading-none text-ink-0">{c.n}</p>
            <p className="mt-1 text-[12px] text-ink-2">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
