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
 * Antonio's rules for every word in this file (third Loom, Oct 26):
 *
 * - Native American English, his voice: visceral, cut to the core. If it
 *   can be said in five words instead of ten, use five.
 * - No walls of text. If it doesn't need saying, don't say it.
 * - The statement is WHY; the action is WHAT. Never run them together, and
 *   never put "spray your Scent Trigger" in either — the T step owns that.
 * - Every action takes under 60 seconds, two minutes at most. "Go for a
 *   walk" is a 30-minute action and doesn't belong here.
 * - Actions out in the world are logged as a COMMITMENT, not a report: the
 *   field opens on "I commit to " (`inputPrefix`) and logging it completes
 *   the Mission. Otherwise he'd have to do it, come back, and remember to log
 *   it — and he won't. Actions that happen on the screen itself (finishing a
 *   sentence, recalling a moment, clearing a counter you'll photograph) keep
 *   a plain question.
 * - About three examples, short and general, so he can tap one or write his
 *   own. One example means no example box: the field is pre-filled instead.
 * - The reader is a man in his 40s or 50s. Ninety percent don't own a
 *   business. Family, friends, health, money, home — work only now and then.
 * - Recommended values rotate. Never the same one twice in a row.
 * - The Missions build on each other: 15–20 walk the six areas of a life,
 *   21 picks one, 22 and 25 act on it, 27 sharpens the promise from 12,
 *   28 reads the whole log back. Keep those threads true.
 *
 * One reusable Mission Detail template renders these; never add a per-Mission
 * component. Edit copy here, not in screens.
 */

export interface MissionDef {
  number: number;
  /** Stable answer key: lesson_id in lesson_responses is this slug. */
  slug: string;
  title: string;
  /** Why it matters. One or two short lines. */
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
    statement:
      "You don't become a better man by thinking about it. You become a better man by taking action.",
    action: "Today's Mission is to get started. Do one honorable thing.",
    recommendedTrigger: "honor",
    inputLabel: "What are you going to do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to texting someone to tell them I'm proud of them.",
      "I commit to calling an old friend, and leaving a message if he doesn't pick up.",
      "I commit to apologizing for the argument and telling them they matter to me.",
    ],
    youtubeId: null,
  },
  {
    number: 2,
    slug: "m2",
    title: "Stop Putting It Off",
    statement:
      "Everyone has one thing they keep putting off. Every day you dodge it, it gets heavier.",
    action: "Pick the thing you've been avoiding and do the first 60 seconds of it.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to stop putting off?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to making the phone call I've been dodging.",
      "I commit to opening the bill I've been ignoring.",
      "I commit to booking the doctor's appointment I keep pushing back.",
    ],
    youtubeId: null,
  },
  {
    number: 3,
    slug: "m3",
    title: "Keep Your Word",
    statement:
      "Every promise you break teaches you that your word doesn't count.",
    action: "Make one promise that matters to someone, and keep it.",
    recommendedTrigger: "commitment",
    inputLabel: "What promise are you going to keep?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to being home for dinner tonight, phone in the other room.",
      "I commit to calling my dad back tonight like I said I would.",
      "I commit to being at my kid's game this weekend. No excuses.",
    ],
    youtubeId: null,
  },
  {
    number: 4,
    slug: "m4",
    title: "Honor Someone Who Matters",
    statement:
      "Someone in your life has no idea how much they matter to you. You assume they know. They don't.",
    action: "Tell one person exactly what they did and why it mattered. Be specific.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you going to tell, and what will you say?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to telling my wife the one thing she does that holds us together.",
      "I commit to thanking my old coach for not giving up on me.",
      "I commit to telling my mother what she taught me that I still use.",
    ],
    youtubeId: null,
  },
  {
    number: 5,
    slug: "m5",
    title: "Act Before You Feel Ready",
    statement: "Ready is a feeling. It shows up after you start, never before.",
    action: "Take the smallest real step on the thing you've been waiting to feel ready for.",
    recommendedTrigger: "courage",
    inputLabel: "What step are you going to take?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to signing up for the class I keep looking at.",
      "I commit to asking the question I've been sitting on.",
      "I commit to sending the message I've rewritten three times.",
    ],
    youtubeId: null,
  },
  {
    number: 6,
    slug: "m6",
    title: "Remember the Man You've Been",
    statement:
      "You've already lived Honor, Courage and Commitment. You've just stopped giving yourself credit.",
    action: "Bring back one time you stood up, held on, or kept your word. Hold it while the scent is fresh.",
    recommendedTrigger: "honor",
    inputLabel: "What moment did you bring back?",
    examples: [
      "The year I worked two jobs to keep the house.",
      "The time I told the truth and it cost me.",
      "Sitting with my father in the hospital every night.",
    ],
    youtubeId: null,
  },
  {
    number: 7,
    slug: "m7",
    title: "Build Your Shrine",
    statement: "The man you're becoming needs a place in your house.",
    action: "Pick one spot — a dresser, a shelf — and put your three bottles there with one thing that means something to you.",
    recommendedTrigger: "commitment",
    inputLabel: "Where is it, and what's on it?",
    examples: [
      "On my dresser. The bottles and my grandfather's watch.",
      "Corner of my desk. The bottles and a photo of my kids.",
      "Bedroom bookshelf. The bottles and my dad's old pocketknife.",
    ],
    photoEncouraged: true,
    youtubeId: "GCpsEfFp_E8",
  },
  {
    number: 8,
    slug: "m8",
    title: "Honor, in Your Words",
    statement:
      "Honor isn't a dictionary word. It's your word, and it only counts when doing right costs you something.",
    action: "Finish the sentence the way you'd say it to your son. It becomes the first line of your Personal Code.",
    recommendedTrigger: "honor",
    inputLabel: "For me, honor means…",
    examples: [
      "Doing what I said I'd do, even when it costs me.",
      "Telling the truth when a lie would be easier.",
      "Owning my mistakes before anyone points them out.",
    ],
    youtubeId: "a9yG3pylUKY",
  },
  {
    number: 9,
    slug: "m9",
    title: "Courage, in Your Words",
    statement:
      "Courage isn't the absence of fear. It's deciding fear doesn't get the final vote.",
    action: "Finish the sentence in your own words. It becomes the second line of your Personal Code.",
    recommendedTrigger: "courage",
    inputLabel: "For me, courage means…",
    examples: [
      "Saying the honest thing while my voice is shaking.",
      "Doing the right thing when nobody's backing me up.",
      "Going first when everyone else is waiting.",
    ],
    youtubeId: "NCeKnEezPWs",
  },
  {
    number: 10,
    slug: "m10",
    title: "Commitment, in Your Words",
    statement:
      "Commitment starts the day the excitement dies. Anybody can show up on day one.",
    action: "Finish the sentence in your own words. It becomes the third line of your Personal Code.",
    recommendedTrigger: "commitment",
    inputLabel: "For me, commitment means…",
    examples: [
      "Doing it after the motivation is gone.",
      "Showing up on the days I don't feel like it.",
      "Finishing what I start, even when nobody's watching.",
    ],
    youtubeId: "ihWgFp5H0DU",
  },
  {
    number: 11,
    slug: "m11",
    title: "Your Non-Negotiable",
    statement:
      "Most men negotiate with themselves all day and lose. One line you won't cross ends the argument.",
    action: "Name the one thing you won't trade for convenience, money or approval.",
    recommendedTrigger: "honor",
    inputLabel: "The line I won't cross is…",
    examples: [
      "I don't lie to my wife, even about small things.",
      "I don't break a promise to my kids.",
      "I don't take what isn't mine.",
    ],
    youtubeId: null,
  },
  {
    number: 12,
    slug: "m12",
    title: "The Promise That Matters Most",
    statement: "Ten goals is noise. One promise is direction.",
    action: "Name the one promise that would make everything else easier if you kept it.",
    recommendedTrigger: "commitment",
    inputLabel: "The promise I'm keeping is…",
    examples: [
      "Home for dinner, phone in the other room, every weeknight.",
      "No drinking on weeknights.",
      "In bed by 10:30 so I'm up before the house.",
    ],
    youtubeId: null,
  },
  {
    number: 13,
    slug: "m13",
    title: "The Man You're Becoming",
    statement: "You wrote this sentence on day one. You know more now.",
    action: "Read it again. Cut what isn't true. Make it something you'd say out loud.",
    recommendedTrigger: "courage",
    inputLabel: "I am becoming a man who…",
    prefillIdentity: true,
    youtubeId: null,
  },
  {
    number: 14,
    slug: "m14",
    title: "Your Personal Code",
    statement:
      "That's your Personal Code, in your own words. Most men go their whole lives without one.",
    action: "Read it through. Pick the one line you need most today.",
    recommendedTrigger: "honor",
    inputLabel: "Which line are you going to live today?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to the honor line: no white lies today.",
      "I commit to the promise line: home for dinner, phone away.",
      "I commit to the courage line: saying what I've been holding back.",
    ],
    showPersonalCode: true,
    youtubeId: null,
  },
  {
    number: 15,
    slug: "m15",
    title: "Strengthen a Relationship",
    statement:
      "The people you work for get whatever's left at the end of the day. Usually nothing.",
    action: "Put time with one person on the calendar: a dinner, a drive, an hour with no phone.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you putting on the calendar, and when?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to breakfast with my daughter Saturday at 8.",
      "I commit to a drive with my son Sunday, phones off.",
      "I commit to date night Friday. Sitter's booked.",
    ],
    youtubeId: "NGi4l1rNc50",
  },
  {
    number: 16,
    slug: "m16",
    title: "Respect Your Body",
    statement: "This isn't vanity. The people who depend on you need you around.",
    action: "Do one thing the healthier version of you would respect.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to do for your body?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to booking the physical I've been putting off.",
      "I commit to skipping the second drink tonight.",
      "I commit to ten push-ups before I put the phone down.",
    ],
    youtubeId: "co2ZBwcMsjM",
  },
  {
    number: 17,
    slug: "m17",
    title: "Do the Important Thing",
    statement: "Easy jobs feel like progress. That's why you keep choosing them.",
    action: "Name the job you've been burying under smaller ones, and give it the next 60 seconds.",
    recommendedTrigger: "commitment",
    inputLabel: "What important thing are you going to start?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to starting the will we keep saying we need.",
      "I commit to calling about the roof leak.",
      "I commit to clearing the garage one shelf at a time, starting now.",
    ],
    youtubeId: "8UbE1PcGqC0",
  },
  {
    number: 18,
    slug: "m18",
    title: "Face the Numbers",
    statement:
      "Money problems grow in the dark. Not looking is a choice you make every day.",
    action: "Open the account you've been avoiding and look at the real number.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to look at?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to opening the credit card statement I've been ignoring.",
      "I commit to checking what's actually in our retirement.",
      "I commit to writing down exactly what we owe.",
    ],
    youtubeId: "GqQmxeLr6GI",
  },
  {
    number: 19,
    slug: "m19",
    title: "Fix Your Space",
    statement: "Your house is either helping you or working against you.",
    action: "Fix one small thing: one counter, one drawer, one screen.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you clear or fix?",
    examples: [
      "Cleared the kitchen counter.",
      "Deleted the apps that eat my evenings.",
      "Cleaned out the junk in the truck.",
    ],
    photoEncouraged: true,
    youtubeId: null,
  },
  {
    number: 20,
    slug: "m20",
    title: "Be Useful to Someone",
    statement: "You'll be remembered for what you were useful for.",
    action: "Help one person with something you could solve in a minute: a name, a number, a hand.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you going to help, and how?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to sending my neighbor the name of my mechanic.",
      "I commit to helping my buddy move his couch Saturday.",
      "I commit to calling my nephew about the job he's after.",
    ],
    youtubeId: "oU7fHhMoXoY",
  },
  {
    number: 21,
    slug: "m21",
    title: "Pick Your One Area",
    statement:
      "The last six Missions touched six areas: relationships, health, work, money, home, service. You can't fix all six at once.",
    action: "Pick the one that would lift the other five.",
    recommendedTrigger: "commitment",
    inputLabel: "Which area are you going to focus on?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to my health. Everything else gets easier if I'm stronger.",
      "I commit to my marriage. It's been running on fumes.",
      "I commit to our money. I'm tired of not knowing.",
    ],
    youtubeId: null,
  },
  {
    number: 22,
    slug: "m22",
    title: "One Thing Beats Nothing",
    statement: "Starting is the hard part. Once you're moving, you keep moving.",
    action: "Take the area you picked last Mission and do the smallest piece of it now.",
    recommendedTrigger: "courage",
    inputLabel: "What's the smallest piece you're going to do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to ten push-ups before I put the phone down.",
      "I commit to texting my wife one thing I love about her.",
      "I commit to writing down every subscription we pay for.",
    ],
    youtubeId: "FaJhvhVPb9c",
  },
  {
    number: 23,
    slug: "m23",
    title: "Get 1% Better",
    statement: "You won't feel 1% better today. That's exactly why it works.",
    action: "Take one thing you do every day and make it slightly better.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you going to make 1% better?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to charging my phone in the kitchen, not by the bed.",
      "I commit to setting the alarm 15 minutes earlier.",
      "I commit to one more set than last time.",
    ],
    youtubeId: "MePOS7sTKH0",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect What Matters",
    statement: "Every yes spends something you don't get back.",
    action: "Say no to one thing that's merely good, so there's room for what matters.",
    recommendedTrigger: "courage",
    inputLabel: "What are you going to say no to?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to skipping Saturday golf so I'm at my daughter's game.",
      "I commit to saying no to the extra shift this week.",
      "I commit to turning off the game and going to bed.",
    ],
    youtubeId: "VkA4H2mZNII",
  },
  {
    number: 25,
    slug: "m25",
    title: "Cut the Dead Weight",
    statement:
      "A handful of what you do produces almost everything you get. The rest is just motion.",
    action: "Name one habit in a normal week that gives you nothing back, and drop it this week.",
    recommendedTrigger: "commitment",
    inputLabel: "What are you going to drop?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to dropping the late-night scrolling.",
      "I commit to skipping the morning news.",
      "I commit to cutting the Sunday TV binge.",
    ],
    youtubeId: "CiNTVRxOgyY",
  },
  {
    number: 26,
    slug: "m26",
    title: "What Would He Do?",
    statement:
      "Goals ask what you want. Your Personal Code asks what a man like you does next.",
    action: "Think of a decision you're facing. Ask what an honorable, courageous, committed man would do.",
    recommendedTrigger: "honor",
    inputLabel: "What's the decision, and what will you do?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to telling my son the truth about why I got it wrong.",
      "I commit to paying my brother back this month like I said.",
      "I commit to owning my mistake before anyone finds it.",
    ],
    youtubeId: "ZMBy99RiuvM",
  },
  {
    number: 27,
    slug: "m27",
    title: "Make One Real Commitment",
    statement: "A commitment you can't measure is a wish wearing a suit.",
    action: "Take the promise you named earlier. Give it one behavior, one number, one deadline.",
    recommendedTrigger: "commitment",
    inputLabel: "What's your commitment?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to walking 20 minutes, four days a week, through the end of next month.",
      "I commit to no drinking on weeknights until Thanksgiving.",
      "I commit to dinner with no phones, five nights a week, for 30 days.",
    ],
    youtubeId: "QZQjcgh26jA",
  },
  {
    number: 28,
    slug: "m28",
    title: "Review the Evidence",
    statement:
      "Your Proof Log isn't intentions. It's things you did, with dates on them.",
    action: "Read it. Find the entry that changed how you see yourself, and do it again, bigger.",
    recommendedTrigger: "courage",
    inputLabel: "Which one are you going to repeat, and how?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to calling my dad again, this time for an hour.",
      "I commit to keeping the dinner promise all week, not just one night.",
      "I commit to having the next hard conversation I've been avoiding.",
    ],
    youtubeId: null,
  },
  {
    number: 29,
    slug: "m29",
    title: "Share Your Personal Code",
    statement:
      "Your Personal Code should sound like the man these weeks proved you are.",
    action: "Read it once more. Change what needs changing. Send it to one man who'll hold you to it.",
    recommendedTrigger: "honor",
    inputLabel: "Who are you going to send it to?",
    inputPrefix: COMMIT,
    examples: [
      "I commit to sending it to my brother tonight.",
      "I commit to reading it to my wife after dinner.",
      "I commit to sending it to my oldest friend.",
    ],
    showPersonalCode: true,
    youtubeId: null,
  },
  {
    number: 30,
    slug: "m30",
    title: "Choose the Next Mission",
    statement:
      "Thirty Missions. Thirty pieces of evidence. The challenge ends here. The man doesn't.",
    action: "Choose what you're building next and tie it to one of your three Scent Triggers.",
    recommendedTrigger: "commitment",
    inputLabel: "What's next, and which Scent Trigger carries it?",
    examples: [
      "Courage. One hard conversation a week for 30 days.",
      "Commitment. In bed by 10:30 every night for 30 days.",
      "Honor. One call a week to someone who matters.",
    ],
    youtubeId: null,
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}
