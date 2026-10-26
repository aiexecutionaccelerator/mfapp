"use client";

import { useRouter } from "next/navigation";
import NavAction from "@/components/NavAction";
import BottleVisual from "@/components/BottleVisual";
import MissionVideo from "@/components/MissionVideo";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { INTRO_VIDEOS } from "@/content/missions";
import StarSystem from "@/components/StarSystem";

/**
 * Using Your Set — the technical fragrance material, optional and outside the
 * thirty Missions. Copy carried over from the old Set Overview and S.T.A.R.
 * lessons.
 */

const SCENTS = [
  {
    trigger: "honor" as const,
    name: "HONOR",
    notes:
      "Fresh and clean. Bergamot, citrus, neroli and musk. Light enough for every day.",
  },
  {
    trigger: "courage" as const,
    name: "COURAGE",
    notes:
      "Bright citrus. Galbanum, lemongrass, grapefruit and lavender. Noticed, never loud.",
  },
  {
    trigger: "commitment" as const,
    name: "COMMITMENT",
    notes:
      "Deep and woody. Vetiver, cedar, amber, vanilla, tonka and oud. Made for evenings.",
  },
];

const GUIDE = [
  {
    title: "How much to apply",
    body: "One spray is often enough. Apply it on your chest or your wrists.",
  },
  {
    title: "You'll stop smelling it. Others won't.",
    body: "Within 15 minutes your nose may tune out the scent. That's normal. It's called olfactory fatigue, not the fragrance fading. These fragrances are strong.",
  },
  {
    title: "Reapplying",
    body: "Reapply every few hours if you want. Don't overdo it.",
  },
  {
    title: "The travel atomizer",
    body: "Pop off the nozzle, press the atomizer on, pump a few times. Done.",
  },
  {
    title: "Caring for the bottles",
    body: "Keep them capped and out of sun and heat. Not on the bathroom windowsill.",
  },
];

export default function UsingYourSetPage() {
  const router = useRouter();
  return (
    <main className="pt-2 pb-10">
      {/* Reached from Settings AND from onboarding screen 2 — go back to
          wherever the reader came from, falling back to Settings. */}
      <NavAction
        kind="back"
        onClick={() =>
          window.history.length > 1 ? router.back() : router.push("/settings")
        }
      />

      <Headline className="mt-6">USING YOUR SET</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        Scents, sprays and care. Optional reading.
      </p>

      <MissionVideo
        youtubeId={INTRO_VIDEOS.usingYourSet}
        title="Mission Fragrances Set Overview"
        label="Watch the set overview"
      />

      <section className="mt-8 space-y-3">
        {SCENTS.map((scent) => (
          <div key={scent.trigger} className="glass rounded-[14px] p-4">
            <div className="flex items-start gap-4">
              <BottleVisual trigger={scent.trigger} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[20px] leading-none text-ink-0">
                  {scent.name}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-1">
                  {scent.notes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* The system itself — how a Scent Trigger becomes an action. */}
      <section className="mt-10">
        <h2 className="font-display text-[26px] leading-tight text-ink-0 uppercase">
          The S.T.A.R. System
        </h2>
        {/* The same four cards as onboarding and the Mission reminder. */}
        <StarSystem className="mt-4" />
        <MissionVideo
          youtubeId={INTRO_VIDEOS.star}
          title="The S.T.A.R. demonstration"
          label="Watch the S.T.A.R. demonstration"
        />
      </section>

      <section className="mt-8 space-y-5">
        {GUIDE.map((item) => (
          <div key={item.title}>
            <Eyebrow tone="gold">{item.title.toUpperCase()}</Eyebrow>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-1">
              {item.body}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
