"use client";

import NavAction from "@/components/NavAction";
import BottleVisual from "@/components/BottleVisual";
import MissionVideo from "@/components/MissionVideo";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { INTRO_VIDEOS } from "@/content/missions";

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
      "Fresh and clean — a fougère built on bergamot, citrus, neroli, and musk. Light enough for every day; a morning pick-me-up heading into work.",
  },
  {
    trigger: "courage" as const,
    name: "COURAGE",
    notes:
      "A citrus aromatic with galbanum, lemongrass, grapefruit, and lavender — noticeable without being loud, and it lasts most of a working day.",
  },
  {
    trigger: "commitment" as const,
    name: "COMMITMENT",
    notes:
      "The amber-woody: vetiver, cedarwood, sweet amber, vanilla, tonka, and oud. Deeper, for the evening and the lasting impression.",
  },
];

const GUIDE = [
  {
    title: "How much to apply",
    body: "Spray into the cap, breathe it in, then apply. Two or three sprays on the chest is plenty; add the wrists if you want it to last the day.",
  },
  {
    title: "You'll stop smelling it — others won't",
    body: "Within minutes your nose tunes it out. That's normal olfactory fatigue, not the fragrance fading. Others still notice it.",
  },
  {
    title: "Reapplying",
    body: "Reapply the same trigger later if you like — two or three sprays every five hours or so is the ceiling worth respecting.",
  },
  {
    title: "The travel atomizer",
    body: "It fills straight from the bottle: pop the nozzle off, press the atomizer onto it, pump a few times, replace the nozzle.",
  },
  {
    title: "Caring for the bottles",
    body: "Keep them capped, out of direct sunlight, and away from heat. A shelf or your shrine beats a bathroom windowsill.",
  },
];

export default function UsingYourSetPage() {
  return (
    <main className="pt-2 pb-10">
      <NavAction kind="back" href="/settings" />

      <Headline className="mt-6">USING YOUR SET</Headline>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        The technical side — scents, sprays, and care. None of this is required
        for your Missions.
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
