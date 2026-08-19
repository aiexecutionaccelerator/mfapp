import type { Trigger } from "@/lib/data/types";

/**
 * The five modules of the course, mapped onto the 30 days of the challenge.
 * There is one system here, not two: the day you are on is the lesson you are
 * on, and this is how Home and Progress name the stretch you are in.
 * Day ranges mirror `content/course.ts`.
 */
export interface ChallengeModule {
  id: string;
  module: number;
  dayMin: number;
  dayMax: number;
  title: string;
  body: string;
  /** Kept for the Home eyebrow; no module singles out one Scent Trigger. */
  featuredTrigger: Trigger | null;
}

export const CHALLENGE_MODULES: ChallengeModule[] = [
  {
    id: "module-1",
    module: 1,
    dayMin: 1,
    dayMax: 5,
    title: "QUICK START",
    body: "Meet your three Scent Triggers, learn the S.T.A.R. ritual, and commit to thirty days.",
    featuredTrigger: null,
  },
  {
    id: "module-2",
    module: 2,
    dayMin: 6,
    dayMax: 10,
    title: "LEGACY & CORE VALUES",
    body: "Write the eulogy you want, then put Honor, Courage, and Commitment into your own examples.",
    featuredTrigger: null,
  },
  {
    id: "module-3",
    module: 3,
    dayMin: 11,
    dayMax: 18,
    title: "THE MAN YOU KNOW YOURSELF TO BE",
    body: "Seven areas of your life, three years out. This is where your Vivid Vision gets written.",
    featuredTrigger: null,
  },
  {
    id: "module-4",
    module: 4,
    dayMin: 19,
    dayMax: 26,
    title: "LAWS OF MEN WHO GET SH*T DONE",
    body: "The frameworks that turn a vision into daily execution: 80/20, Essentialism, 1% better, identity.",
    featuredTrigger: null,
  },
  {
    id: "module-5",
    module: 5,
    dayMin: 27,
    dayMax: 30,
    title: "FORGE YOUR VIVID VISION",
    body: "Compile it, refine it, print it, frame it. The challenge ends. The Mission doesn't.",
    featuredTrigger: null,
  },
];
