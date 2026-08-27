"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import BottleVisual from "@/components/BottleVisual";
import MissionVideo from "@/components/MissionVideo";
import NavAction from "@/components/NavAction";
import BottomActions from "@/components/ui/BottomActions";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { INTRO_VIDEOS, TRIGGER_VIDEOS } from "@/content/missions";
import { STAR_STEPS, TRIGGERS, TRIGGER_ORDER } from "@/content/triggers";
import { cn } from "@/lib/utils";

export const ONBOARDING_SCREEN_COUNT = 4;

/**
 * The four How It Works screens — shown once after profile setup, replayable
 * any time from Settings. Videos are optional and never block progress. In
 * replay mode the final screen closes instead of asking about the set.
 */
export default function OnboardingScreens({
  screen,
  replay = false,
  onBack,
  onNext,
  onSetHere,
  onSetOnTheWay,
  onDone,
  pending = false,
}: {
  /** 0–3 */
  screen: number;
  replay?: boolean;
  onBack: () => void;
  onNext: () => void;
  /** Real onboarding only: "YES — START MISSION 1". */
  onSetHere?: () => void;
  /** Real onboarding only: "NOT YET — LET ME EXPLORE". */
  onSetOnTheWay?: () => void;
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
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                index === screen
                  ? "bg-[var(--gold-500)]"
                  : "bg-[var(--line-strong)]",
              )}
            />
          ))}
        </div>
        <span className="h-12 w-12" />
      </div>

      {screen === 0 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>THIS IS MORE THAN FRAGRANCE</Headline>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-1">
            You did not buy three ordinary bottles of cologne. You bought three
            reminders of the man you want to be. Over the next 30 Missions, you
            will choose a value, activate it with scent, take one small action,
            and record the evidence.
          </p>
          <p className="font-display mt-6 text-[22px] leading-snug text-gold-gradient">
            Wear the value. Take the action. Become the man.
          </p>
          <MissionVideo
            youtubeId={INTRO_VIDEOS.moreThanFragrance}
            title="This Is More Than Fragrance"
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
              const name =
                meta.name[0] + meta.name.slice(1).toLowerCase();
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
          <Link
            href="/using-your-set"
            className="mt-4 flex min-h-12 items-center gap-2 text-[15px] text-gold-300"
          >
            Learn about the fragrances
            <ArrowRight aria-hidden size={16} />
          </Link>
          <BottomActions className="mt-6">
            <Button onClick={onNext}>NEXT</Button>
          </BottomActions>
        </div>
      )}

      {screen === 2 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>USE S.T.A.R.</Headline>
          <div className="mt-6 space-y-3">
            {STAR_STEPS.map((step) => (
              <div
                key={step.letter}
                className="glass flex items-center gap-4 rounded-[14px] p-4"
              >
                <span className="font-display text-gold-gradient w-8 shrink-0 text-center text-[28px] leading-none">
                  {step.letter}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] text-ink-0">{step.name}</p>
                  <p className="mt-1 text-[14px] leading-snug text-ink-1">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[15px] text-ink-1">
            The fragrance is the reminder. The action is the evidence.
          </p>
          <MissionVideo
            youtubeId={INTRO_VIDEOS.star}
            title="The S.T.A.R. demonstration"
            label="Watch the S.T.A.R. demonstration"
            defaultOpen
          />
          <BottomActions className="mt-6">
            <Button onClick={onNext}>NEXT</Button>
          </BottomActions>
        </div>
      )}

      {screen === 3 && (
        <div className="mt-6 flex flex-1 flex-col">
          <Headline>TAKE YOUR FIRST ACTION</Headline>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-1">
            Your first Mission will help you choose the value you need, use the
            scent, take one small action, and record your first proof.
          </p>
          {replay ? (
            <BottomActions className="mt-8">
              <Button onClick={onDone}>GOT IT</Button>
            </BottomActions>
          ) : (
            <>
              <Eyebrow tone="gold" className="mt-8">
                IS YOUR SET WITH YOU NOW?
              </Eyebrow>
              <BottomActions className="mt-4">
                <Button loading={pending} onClick={onSetHere}>
                  YES — START MISSION 1
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={onSetOnTheWay}
                >
                  NOT YET — LET ME EXPLORE
                </Button>
              </BottomActions>
            </>
          )}
        </div>
      )}
    </div>
  );
}
