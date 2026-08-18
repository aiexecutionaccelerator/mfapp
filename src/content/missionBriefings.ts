import type { Trigger } from "@/lib/data/types";

export interface MissionBriefing {
  id: string;
  trigger: Trigger;
  type: "briefing";
  text: string;
  audioUrl: string | null;
}

const RAW: Record<Trigger, string[]> = {
  honor: [
    "Stand tall. Be present. Act like your standards matter.",
    "Nobody may notice the choice you're about to make. You will.",
    "Honor isn't about being impressive. It's about being aligned.",
    "Slow down. Be fully present. Do the right thing cleanly.",
    "Lead yourself first.",
    "Your standard doesn't lower because you're tired.", // (placeholder)
    "Composure is a decision you make before you need it.", // (placeholder)
    "Be the same man in the room and out of it.", // (placeholder)
    "Do it right, even when quicker is available.", // (placeholder)
    "Presence is the rarest thing you can give anyone.", // (placeholder)
  ],
  courage: [
    "Courage isn't the absence of hesitation. It's acting while hesitation is still there.",
    "You've thought enough. Take the action.",
    "Nervous doesn't get the vote.",
    "The conversation doesn't get easier while you avoid it.",
    "Move before your excuses reorganize.",
    "Say the thing you've been rehearsing.", // (placeholder)
    "The risk is smaller than the regret.", // (placeholder)
    "Do it badly rather than not at all.", // (placeholder)
    "Discomfort is the price. Pay it.", // (placeholder)
    "One step now beats a better plan tomorrow.", // (placeholder)
  ],
  commitment: [
    "You already made the decision. Stop renegotiating with yourself.",
    "Motivation got you started. Commitment finishes.",
    "Finish what you started.",
    "Keep the promise, especially when nobody is checking.",
    "The work still counts when the excitement is gone.",
    "Show up at the same standard on a bad day.", // (placeholder)
    "Discipline is just the promise you kept.", // (placeholder)
    "Almost finished is not finished.", // (placeholder)
    "Do the last ten percent.", // (placeholder)
    "The result lives on the other side of the boring part.", // (placeholder)
  ],
};

export const MISSION_BRIEFINGS: MissionBriefing[] = (
  Object.keys(RAW) as Trigger[]
).flatMap((trigger) =>
  RAW[trigger].map((text, index) => ({
    id: `${trigger}-briefing-${index + 1}`,
    trigger,
    type: "briefing" as const,
    text,
    audioUrl: null,
  })),
);

/**
 * Deterministic rotation: `count` is how many Missions the user already has
 * for this trigger, so briefings cycle instead of repeating at random.
 */
export function pickBriefing(trigger: Trigger, count: number): MissionBriefing {
  const list = MISSION_BRIEFINGS.filter((b) => b.trigger === trigger);
  const index = ((count % list.length) + list.length) % list.length;
  return list[index];
}
