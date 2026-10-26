import type { Trigger } from "@/lib/data/types";

/**
 * Your 30-Day Mission — the thirty Missions.
 *
 * Every Mission screen is the S.T.A.R. System, in order:
 *
 *   statement  — why it matters. One or two lines. Never the instructions.
 *   (link)     — a reminder of how S.T.A.R. works, so no Mission has to
 *                re-explain spraying.
 *   S Select   — the Scent Trigger shelf, recommendation marked.
 *   T Trigger  — "Spray your selected fragrance." Same for every Mission.
 *   A Act      — `action`, plus "This should take you less than 60 seconds."
 *   R Record   — `inputLabel`, up to three tap-to-use `examples`, the field,
 *                and RECORD · COMPLETE MISSION N.
 *
 * Antonio's rules for every word in this file. He has said it in every
 * review: too wordy, and it doesn't sound American. So these are hard limits,
 * not suggestions:
 *
 * - Antonio's own words are the spec. Where he gave exact wording, use it
 *   verbatim — these limits cut OUR copy, never his.
 * - Statement: every Mission has one. One short sentence, two at most.
 * - Action: one sentence. About 10 words.
 * - Question: under 7 words.
 * - Examples: under 10 words. Three of them. Exactly one means no example
 *   box; the field is pre-filled instead.
 * - Talk like a guy from Ohio, not a novelist. Contractions. Plain words.
 *   No em-dashes, no semicolons, no metaphors he'd have to decode.
 * - Read every line out loud. If you wouldn't say it to a buddy, cut it.
 * - Never say "spray" in a statement or action. The Trigger step owns that.
 * - Every action takes under 60 seconds.
 * - World actions are commitments: the field opens on "I commit to ". On-
 *   screen actions (finish a sentence, remember something) ask plainly.
 * - Readers are men in their 40s and 50s. 90% don't own a business.
 * - Recommended values rotate. Never the same one twice in a row.
 * - 15–20 cover relationships, health, work, money, home and service; 21
 *   picks one; 22 acts on it; 27 sharpens the promise from 12.
 *
 * One reusable Mission Detail template renders these; never add a per-Mission
 * component. Edit copy here, not in screens.
 */

export interface MissionDef {
  number: number;
  /** Stable answer key: lesson_id in lesson_responses is this slug. */
  slug: string;
  title: string;
  /**
   * Why it matters, in ONE short sentence. Required: a Mission that opens
   * without one looks broken next to the twenty-nine that have one.
   */
  statement: string;
  /** What to do. Under 60 seconds. */
  action: string;
  /** The Scent Trigger this Mission recommends. He can wear another. */
  recommendedTrigger: Trigger;
  /** The Record step's question. */
  inputLabel: string;
  /** The field opens with this ("I commit to ") for actions out in the world. */
  inputPrefix?: string;
  /**
   * Tap-to-use answers, complete as they'll be logged (prefix included).
   * Three is the target. Exactly one means no example box — the field is
   * pre-filled with it instead.
   */
  examples?: string[];
  /** An optional photo alongside the sentence — only where it earns its place. */
  photoEncouraged?: boolean;
  /** Mission 13: open the field with the identity statement already in it. */
  prefillIdentity?: boolean;
  /** Missions 14 and 29: show the compiled Personal Code in the Act step. */
  showPersonalCode?: boolean;
  /** Optional, collapsed, never required. */
  youtubeId: string | null;
}

/** The commitment opener for actions out in the world. */
export const COMMIT = "I commit to ";

/** Optional intro videos reused from the old library. Never block progress. */
export const INTRO_VIDEOS = {
  moreThanFragrance: "p1VGPvExpx0",
  star: "_xs_ANlHjJ8",
  usingYourSet: "FCZ7-xwRPWI",
} as const;

/** Antonio explaining each value — shown under the Meet Your Scent Triggers
    cards (the same videos Missions 8–10 carry). */
export const TRIGGER_VIDEOS: Record<Trigger, string> = {
  honor: "a9yG3pylUKY",
  courage: "NCeKnEezPWs",
  commitment: "ihWgFp5H0DU",
};

/**
 * The Missions whose answer is also a line of the Personal Code. Logging one
 * writes the sentence to `lesson_responses` as well as the Proof Log, so the
 * code compiles from the same words the man typed.
 */
export const PERSONAL_CODE_SLUGS = new Set([
  "m8",
  "m9",
  "m10",
  "m11",
  "m12",
  "m13",
  "m30",
]);

export const MISSIONS: MissionDef[] = [
  {
    number: 1,
    slug: "m1",
    title: "Prove It",
    statement: "You don't become a better man by thinking about it. You become a better man by taking action.",
    action: "Today's Mission is to get started. Do one honorable thing.",
    recommendedTrigger: "honor",
    inputLabel: "What are you going to do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to telling someone I'm proud of them.",
      "I commit to calling a friend I've lost touch with.",
      "I commit to apologizing for our last fight.",
    ],
    youtubeId: null,
  },
  {
    number: 2,
    slug: "m2",
    title: "Stop Putting It Off",
    statement: "The thing you keep avoiding gets heavier every day.",
    action: "Start it right now. Just the first step.",
    recommendedTrigger: "courage",
    inputLabel: "What are you done putting off?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to making that phone call.",
      "I commit to opening that bill.",
      "I commit to booking my doctor's appointment.",
    ],
    youtubeId: null,
  },
  {
    number: 3,
    slug: "m3",
    title: "Keep Your Word",
    statement: "Your word only counts if you keep it.",
    action: "Make one promise to someone. Keep it.",
    recommendedTrigger: "commitment",
    inputLabel: "What promise are you going to keep?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to being home for dinner tonight.",
      "I commit to calling my dad back tonight.",
      "I commit to making my kid's game Saturday.",
    ],
    youtubeId: null,
  },
  {
    number: 4,
    slug: "m4",
    title: "Honor Someone Who Matters",
    statement: "Someone you love doesn't know how much they matter to you.",
    action: "Tell them exactly what they did and why it mattered.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you going to tell?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to thanking my wife for all she carries.",
      "I commit to thanking my old coach.",
      "I commit to telling my mom what she taught me.",
    ],
    youtubeId: null,
  },
  {
    number: 5,
    slug: "m5",
    title: "Act Before You're Ready",
    statement: "Ready shows up after you start. Never before.",
    action: "Take the smallest real step on it now.",
    recommendedTrigger: "courage",
    inputLabel: "What's your first step?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to signing up for that class.",
      "I commit to asking the question I've been sitting on.",
      "I commit to sending that message.",
    ],
    youtubeId: null,
  },
  {
    number: 6,
    slug: "m6",
    title: "Remember Who You've Been",
    statement: "You've already been brave, honest and steady. Remember it.",
    action: "Think of one time you did the right thing.",
    recommendedTrigger: "honor",
    inputLabel: "What do you remember?",
    examples: [
      "Working two jobs to keep the house.",
      "Telling the truth when it cost me.",
      "Staying with my dad in the hospital.",
    ],
    youtubeId: null,
  },
  {
    number: 7,
    slug: "m7",
    title: "Build Your Shrine",
    statement: "The man you're becoming needs a spot in your house.",
    action: "Put your bottles where you'll see them every morning.",
    recommendedTrigger: "commitment",
    inputLabel: "Where did you put them?",
    examples: [
      "On my dresser, next to my granddad's watch.",
      "On my desk, by a photo of my kids.",
      "On the shelf in my bedroom.",
    ],
    photoEncouraged: true,
    youtubeId: "GCpsEfFp_E8",
  },
  {
    number: 8,
    slug: "m8",
    title: "Honor, in Your Words",
    statement: "Honor only counts when it costs you something.",
    action: "Finish the sentence. It's line one of your Personal Code.",
    recommendedTrigger: "honor",
    inputLabel: "For me, honor means…",
    examples: [
      "Doing what I said, even when it costs me.",
      "Telling the truth when lying is easier.",
      "Owning my mistakes first.",
    ],
    youtubeId: "a9yG3pylUKY",
  },
  {
    number: 9,
    slug: "m9",
    title: "Courage, in Your Words",
    statement: "Fear is normal. Courage is acting anyway.",
    action: "Finish the sentence. It's line two of your Personal Code.",
    recommendedTrigger: "courage",
    inputLabel: "For me, courage means…",
    examples: [
      "Saying the hard thing anyway.",
      "Doing what's right when nobody backs me up.",
      "Going first.",
    ],
    youtubeId: "NCeKnEezPWs",
  },
  {
    number: 10,
    slug: "m10",
    title: "Commitment, in Your Words",
    statement: "Commitment is showing up after the excitement wears off.",
    action: "Finish the sentence. It's line three of your Personal Code.",
    recommendedTrigger: "commitment",
    inputLabel: "For me, commitment means…",
    examples: [
      "Doing it after the motivation's gone.",
      "Showing up when I don't feel like it.",
      "Finishing what I start.",
    ],
    youtubeId: "ihWgFp5H0DU",
  },
  {
    number: 11,
    slug: "m11",
    title: "The Line You Won't Cross",
    statement: "Draw one line, and stop arguing with yourself.",
    action: "Name the one thing you won't do. Period.",
    recommendedTrigger: "honor",
    inputLabel: "The line I won't cross is…",
    examples: [
      "Lying to my wife.",
      "Breaking a promise to my kids.",
      "Taking what isn't mine.",
    ],
    youtubeId: null,
  },
  {
    number: 12,
    slug: "m12",
    title: "The Promise That Matters Most",
    statement: "Ten goals is noise. One promise is direction.",
    action: "Name the one promise that would fix the most.",
    recommendedTrigger: "commitment",
    inputLabel: "The promise I'm keeping is…",
    examples: [
      "Home for dinner, phone away, every weeknight.",
      "No drinking on weeknights.",
      "In bed by 10:30.",
    ],
    youtubeId: null,
  },
  {
    number: 13,
    slug: "m13",
    title: "The Man You're Becoming",
    statement: "You wrote this on day one. You know more now.",
    action: "Read it. Fix what isn't true.",
    recommendedTrigger: "courage",
    inputLabel: "I am becoming a man who…",
    prefillIdentity: true,
    youtubeId: null,
  },
  {
    number: 14,
    slug: "m14",
    title: "Your Personal Code",
    statement: "Most men never write one. You just did.",
    action: "Read it. Pick the line you need today.",
    recommendedTrigger: "honor",
    inputLabel: "Which line are you living by today?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to no white lies today.",
      "I commit to dinner at home, phone away.",
      "I commit to saying what I've been holding back.",
    ],
    showPersonalCode: true,
    youtubeId: null,
  },
  {
    number: 15,
    slug: "m15",
    title: "Make Time for Them",
    statement: "The people you work for get your leftovers.",
    action: "Put time with one of them on the calendar.",
    recommendedTrigger: "commitment",
    inputLabel: "Who, and when?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to breakfast with my daughter Saturday.",
      "I commit to a drive with my son Sunday.",
      "I commit to date night Friday.",
    ],
    youtubeId: "NGi4l1rNc50",
  },
  {
    number: 16,
    slug: "m16",
    title: "Respect Your Body",
    statement: "Your family needs you around for a long time.",
    action: "Do one thing your body will thank you for.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to booking my physical.",
      "I commit to skipping the second drink tonight.",
      "I commit to 10 push-ups right now.",
    ],
    youtubeId: "co2ZBwcMsjM",
  },
  {
    number: 17,
    slug: "m17",
    title: "Do the Important Thing",
    statement: "Easy jobs feel like progress. They aren't.",
    action: "Start the job you keep dodging. Right now.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you going to start?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to starting our will.",
      "I commit to calling about the roof.",
      "I commit to cleaning out one garage shelf.",
    ],
    youtubeId: "8UbE1PcGqC0",
  },
  {
    number: 18,
    slug: "m18",
    title: "Face the Numbers",
    statement: "Money problems grow when you don't look.",
    action: "Open the account you've been avoiding.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to look at?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to opening my credit card statement.",
      "I commit to checking our retirement account.",
      "I commit to writing down what we owe.",
    ],
    youtubeId: "GqQmxeLr6GI",
  },
  {
    number: 19,
    slug: "m19",
    title: "Fix Your Space",
    statement: "A messy space makes for a messy head.",
    action: "Fix one small thing in the next minute.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you fix?",
    examples: [
      "Cleared the kitchen counter.",
      "Deleted the apps that eat my nights.",
      "Cleaned out my truck.",
    ],
    photoEncouraged: true,
    youtubeId: null,
  },
  {
    number: 20,
    slug: "m20",
    title: "Be Useful",
    statement: "You'll be remembered for how you helped.",
    action: "Help one person with something quick.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you going to help?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to sending my neighbor my mechanic's number.",
      "I commit to helping my buddy move Saturday.",
      "I commit to calling my nephew about that job.",
    ],
    youtubeId: "oU7fHhMoXoY",
  },
  {
    number: 21,
    slug: "m21",
    title: "Pick Your One Area",
    statement: "Relationships, health, work, money, home, service. You can't fix all six at once.",
    action: "Pick the one that would lift the rest.",
    recommendedTrigger: "commitment",
    inputLabel: "Which one?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to my health.",
      "I commit to my marriage.",
      "I commit to our money.",
    ],
    youtubeId: null,
  },
  {
    number: 22,
    slug: "m22",
    title: "One Thing Beats Nothing",
    statement: "Starting is the hard part.",
    action: "Do the smallest piece of the area you picked.",
    recommendedTrigger: "courage",
    inputLabel: "What's the smallest piece?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to 10 push-ups now.",
      "I commit to texting my wife something sweet.",
      "I commit to listing every subscription we pay for.",
    ],
    youtubeId: "FaJhvhVPb9c",
  },
  {
    number: 23,
    slug: "m23",
    title: "Get 1% Better",
    statement: "You won't feel 1% better today. Do it anyway.",
    action: "Make one daily habit a little better.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you going to improve?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to charging my phone outside the bedroom.",
      "I commit to getting up 15 minutes earlier.",
      "I commit to one more set.",
    ],
    youtubeId: "MePOS7sTKH0",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect What Matters",
    statement: "Every yes costs you something.",
    action: "Say no to one thing that doesn't matter.",
    recommendedTrigger: "courage",
    inputLabel: "What are you saying no to?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to skipping golf for my daughter's game.",
      "I commit to turning down the extra shift.",
      "I commit to turning off the TV and going to bed.",
    ],
    youtubeId: "VkA4H2mZNII",
  },
  {
    number: 25,
    slug: "m25",
    title: "Cut the Dead Weight",
    statement: "Every habit costs you time. Some give nothing back.",
    action: "Pick one of those and drop it this week.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you going to drop?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to no phone in bed.",
      "I commit to skipping the morning news.",
      "I commit to cutting the Sunday TV binge.",
    ],
    youtubeId: "CiNTVRxOgyY",
  },
  {
    number: 26,
    slug: "m26",
    title: "What Would He Do?",
    statement: "Don't ask what's easy. Ask what the man you're becoming would do.",
    action: "Think of a decision you're facing. Do what he would do.",
    recommendedTrigger: "honor",
    inputLabel: "What are you going to do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to telling my son I was wrong.",
      "I commit to paying my brother back this month.",
      "I commit to owning my mistake at work.",
    ],
    youtubeId: "ZMBy99RiuvM",
  },
  {
    number: 27,
    slug: "m27",
    title: "Make One Real Commitment",
    statement: "If you can't measure it, it's just a wish.",
    action: "Give your big promise a number and a deadline.",
    recommendedTrigger: "commitment",
    inputLabel: "What's your commitment?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to a 20-minute walk, 4 days a week.",
      "I commit to no drinking on weeknights until Thanksgiving.",
      "I commit to phone-free dinners, 5 nights a week.",
    ],
    youtubeId: "QZQjcgh26jA",
  },
  {
    number: 28,
    slug: "m28",
    title: "Review the Evidence",
    statement: "Your Proof Log is real. Dates and all.",
    action: "Read it. Pick your best one and do it again, bigger.",
    recommendedTrigger: "courage",
    inputLabel: "Which one are you going to repeat?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to calling my dad again.",
      "I commit to keeping the dinner promise all week.",
      "I commit to the next hard conversation.",
    ],
    youtubeId: null,
  },
  {
    number: 29,
    slug: "m29",
    title: "Share Your Personal Code",
    statement: "A code nobody sees is easy to break.",
    action: "Send it to one man who'll hold you to it.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you sending it to?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to sending it to my brother.",
      "I commit to reading it to my wife.",
      "I commit to sending it to my best friend.",
    ],
    showPersonalCode: true,
    youtubeId: null,
  },
  {
    number: 30,
    slug: "m30",
    title: "Choose the Next Mission",
    statement: "30 Missions. 30 proofs. You're not done.",
    action: "Pick your next goal and the Scent Trigger that goes with it.",
    recommendedTrigger: "commitment",
    inputLabel: "What's next?",
    examples: [
      "Courage: one hard conversation a week.",
      "Commitment: in bed by 10:30 for 30 days.",
      "Honor: one call a week to someone who matters.",
    ],
    youtubeId: null,
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}
