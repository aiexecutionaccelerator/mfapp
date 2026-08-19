import type { Trigger } from "@/lib/data/types";
import { slugify } from "@/lib/utils";

export interface ActionSuggestion {
  id: string;
  trigger: Trigger;
  /** The declared action, shown as the row's first line. */
  text: string;
  /** One line under it, so the man knows what he is signing up for. */
  definition: string;
}

const RAW: Record<Trigger, Array<{ text: string; definition: string }>> = {
  // From the course lesson "The Importance of Honor".
  honor: [
    {
      text: "Maintain my standards in the face of adversity",
      definition:
        "Hold the line on what you value when it would be easier to let it slide.",
    },
    {
      text: "Keep my word",
      definition:
        "Do exactly what you said you would do, when you said you would do it.",
    },
    {
      text: "Take responsibility for my actions",
      definition:
        "Own it — the outcome, the mistake, the choice — and make it right.",
    },
  ],
  // From the course lesson "The Importance of Courage".
  courage: [
    {
      text: "Face a small fear today",
      definition: "The ladder, the call, the room. Do the thing you've been avoiding.",
    },
    {
      text: "Say no to something I don't want to do",
      definition:
        "Decline it plainly. No long excuse. You won't win a medal — you'll win the fear.",
    },
    {
      text: "Make the tough decision under pressure",
      definition: "Decide what's right and act on it, stress and all.",
    },
  ],
  // From the course lesson "The Importance of Commitment".
  commitment: [
    {
      text: "Do what I planned instead of what I feel like",
      definition:
        "The gym over sleeping in. The healthy meal over fast food. Today's decision, not today's mood.",
    },
    {
      text: "Finish what I started",
      definition: "The project, the book, the set. Close it out, obstacles and all.",
    },
    {
      text: "Keep a promise I made",
      definition: "To someone else or to yourself. Fulfill the obligation.",
    },
  ],
};

export const ACTION_SUGGESTIONS: ActionSuggestion[] = (
  Object.keys(RAW) as Trigger[]
).flatMap((trigger) =>
  RAW[trigger].map(({ text, definition }) => ({
    id: `${trigger}-${slugify(text)}`,
    trigger,
    text,
    definition,
  })),
);

export function suggestionsFor(trigger: Trigger): ActionSuggestion[] {
  return ACTION_SUGGESTIONS.filter((s) => s.trigger === trigger);
}
