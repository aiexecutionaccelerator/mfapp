import type { Trigger } from "@/lib/data/types";
import { slugify } from "@/lib/utils";

export interface ActionSuggestion {
  id: string;
  trigger: Trigger;
  text: string;
  category: string;
}

const RAW: Record<Trigger, string[]> = {
  honor: [
    "Stay calm under pressure",
    "Be fully present",
    "Tell the truth directly",
    "Lead by example",
    "Keep my standard",
  ],
  courage: [
    "Make the call",
    "Speak up",
    "Introduce myself",
    "Have the difficult conversation",
    "Ask the question",
  ],
  commitment: [
    "Finish the workout",
    "Complete deep work",
    "Finish the project",
    "Keep the promise",
    "Do the task I keep postponing",
  ],
};

export const ACTION_SUGGESTIONS: ActionSuggestion[] = (
  Object.keys(RAW) as Trigger[]
).flatMap((trigger) =>
  RAW[trigger].map((text) => ({
    id: `${trigger}-${slugify(text)}`,
    trigger,
    text,
    category: slugify(text),
  })),
);

export function suggestionsFor(trigger: Trigger): ActionSuggestion[] {
  return ACTION_SUGGESTIONS.filter((s) => s.trigger === trigger);
}
