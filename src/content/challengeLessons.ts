import type { Trigger } from "@/lib/data/types";

export interface ChallengeLesson {
  id: string;
  phase: number;
  dayMin: number;
  dayMax: number;
  title: string;
  body: string;
  featuredTrigger: Trigger | null;
  suggestedActions: string[];
}

export const CHALLENGE_LESSONS: ChallengeLesson[] = [
  {
    id: "phase-1",
    phase: 1,
    dayMin: 1,
    dayMax: 3,
    title: "LEARN THE LOOP",
    body: "A Scent Trigger is a fragrance you've given a job. Select how you need to show up. Apply it. Act. Come back and record what you did. Complete your first Mission today.",
    featuredTrigger: null,
    suggestedActions: [],
  },
  {
    id: "phase-2",
    phase: 2,
    dayMin: 4,
    dayMax: 10,
    title: "COURAGE",
    body: "Courage is action, not the absence of fear.",
    featuredTrigger: "courage",
    suggestedActions: [
      "Make the call.",
      "Speak up.",
      "Ask.",
      "Introduce yourself.",
      "Have the conversation.",
    ],
  },
  {
    id: "phase-3",
    phase: 3,
    dayMin: 11,
    dayMax: 17,
    title: "HONOR",
    body: "Honor is what you do when the standard matters more than convenience.",
    featuredTrigger: "honor",
    suggestedActions: [
      "Stay calm.",
      "Tell the truth directly.",
      "Be fully present.",
      "Lead by example.",
      "Keep a standard.",
    ],
  },
  {
    id: "phase-4",
    phase: 4,
    dayMin: 18,
    dayMax: 24,
    title: "COMMITMENT",
    body: "Stop renegotiating with the decision you already made.",
    featuredTrigger: "commitment",
    suggestedActions: [
      "Finish the workout.",
      "Finish the project.",
      "Complete deep work.",
      "Keep the promise.",
      "Do the postponed task.",
    ],
  },
  {
    id: "phase-5",
    phase: 5,
    dayMin: 25,
    dayMax: 30,
    title: "BUILD YOUR SYSTEM",
    body: "Decide how Honor, Courage, and Commitment fit your life going forward. Use all three freely. The challenge ends. Your Mission Log begins.",
    featuredTrigger: null,
    suggestedActions: [],
  },
];
