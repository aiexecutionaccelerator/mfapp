"use client";

import BottleVisual from "@/components/BottleVisual";
import MissionVideo from "@/components/MissionVideo";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Headline from "@/components/ui/Headline";
import { INTRO_VIDEOS, TRIGGER_VIDEOS } from "@/content/missions";
import { TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";

export const ONBOARDING_SCREEN_COUNT = 2;

/**
 * How It Works — two screens, shown once after profile setup and replayable
 * from Settings.
 *
 * Screen 1 explains what the set is and how the S.T.A.R. system conditions
 * you to it; its video is open on arrival because it is the single best
 * explanation we have. Screen 2 introduces the three fragrances, with
 * Antonio's per-value videos collapsed, and ends by handing the man his
 * first Mission. There is no fourth screen — the first Mission is the thing
 * to do, so we take him to it instead of describing it.
 */
export default function OnboardingScreens({
  screen,
  replay = false,
  onBack,
  onNext,
  onStart,
  onDone,
  pending = false,
}: {
  /** 0–1 */
  screen: number;
  replay?: boolean;
  onBack: () => void;
  onNext: () => void;
  /** Real onboarding only: into Mission 1. */
  onStart?: () => void;
  /** Replay only: close the final screen. */
  onDone?: () => void;
  pending?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        {screen > 0 || replay ? (
          <NavAction kind="back" onClick={onBack} />
        ) : (
          <span className="h-12 w-12" />
        )}
        <div
          className="flex gap-2"
          aria-label={`Screen ${screen + 1} of ${ONBOARDING_SCREEN_COUNT}`}
        >
          {Array.from({ length: ONBOARDING_SCREEN_COUNT }, (_, index) => (
            <span
              key={index}
              className={
                index === screen
                  ? "h-1.5 w-1.5 rounded-full bg-[var(--gold-500)]"
                  : "h-1.5 w-1.5 rounded-full bg-[var(--line-strong)]"
              }
            />
          ))}
        </div>
        <span className="h-12 w-12" />
      </div>

      {screen === 0 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>MORE THAN COLOGNE</Headline>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-1">
            Mission Fragrances are Scent Triggers: colognes with a job. They
            work through olfactory conditioning. Scent is the one sense wired
            straight to memory and emotion, which is why a smell can put you
            somewhere you haven&apos;t been in twenty years.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-1">
            You condition yourself to a Scent Trigger with the S.T.A.R.
            System. <span className="text-ink-0">Select</span> the value you
            need. <span className="text-ink-0">Trigger</span> it: spray, and
            recall a moment you lived that value.{" "}
            <span className="text-ink-0">Act</span> on it.{" "}
            <span className="text-ink-0">Record</span> what you did. Do it
            enough times and the scent stops being something you put on in the
            morning.
          </p>
          <p className="font-display text-gold-gradient mt-6 text-[22px] leading-snug">
            It becomes the signal for the man you&apos;re about to be.
          </p>
          <MissionVideo
            youtubeId={INTRO_VIDEOS.moreThanFragrance}
            title="This Is More Than Fragrance"
            defaultOpen
          />
          <BottomActions className="mt-8">
            <Button onClick={onNext}>NEXT</Button>
          </BottomActions>
        </div>
      )}

      {screen === 1 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>MEET YOUR SCENT TRIGGERS</Headline>
          <div className="mt-6 space-y-3">
            {TRIGGER_ORDER.map((trigger) => {
              const meta = TRIGGERS[trigger];
              const name = meta.name[0] + meta.name.slice(1).toLowerCase();
              return (
                <div key={trigger} className="glass rounded-[14px] p-4">
                  <div className="flex items-center gap-4">
                    <BottleVisual trigger={trigger} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[20px] leading-none text-ink-0">
                        {meta.name}
                      </p>
                      <p className="mt-2 text-[14px] leading-snug text-ink-1">
                        {meta.onboardingLine}
                      </p>
                      <p className="eyebrow mt-2 text-gold-300">
                        {meta.onboardingWords}
                      </p>
                    </div>
                  </div>
                  <MissionVideo
                    youtubeId={TRIGGER_VIDEOS[trigger]}
                    title={`Antonio explains ${name}`}
                    label={`Watch Antonio explain ${name}`}
                  />
                </div>
              );
            })}
          </div>

          <p className="font-display mt-8 text-[22px] leading-snug text-ink-0">
            You have everything you need. Let&apos;s get started.
          </p>

          <BottomActions className="mt-5">
            {replay ? (
              <Button onClick={onDone}>GOT IT</Button>
            ) : (
              <Button loading={pending} onClick={onStart}>
                START MISSION 1
              </Button>
            )}
          </BottomActions>
        </div>
      )}
    </div>
  );
}
