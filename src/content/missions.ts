import type { Trigger } from "@/lib/data/types";

/**
 * Your 30-Day Mission — the thirty Missions.
 *
 * One input, one click. The Mission screen is: why this matters (in Antonio's
 * voice), the recommended fragrance, one field, one button. Submitting the
 * field completes the Mission and writes the Proof — there is no declare step,
 * no in-progress state and no separate "record the evidence" screen.
 *
 * Every action should be doable in one or two minutes. Prompts and examples
 * belong inside `idea`, never as canned options — options limit the man and
 * usually don't fit his life.
 *
 * One reusable Mission Detail template renders these; never add a per-Mission
 * component. Edit copy here, not in screens.
 */

export interface MissionDef {
  number: number;
  /** Stable answer key: lesson_id in lesson_responses is this slug. */
  slug: string;
  title: string;
  /** The why, in Antonio's voice, ending with what to do today. */
  idea: string;
  /** The fragrance this Mission recommends. Shown, not chosen. */
  recommendedTrigger: Trigger;
  /** The single field's label — what he writes to complete the Mission. */
  inputLabel: string;
  inputPlaceholder?: string;
  /** Longer answers (the Personal Code lines) get a taller field. */
  multiline?: boolean;
  /** An optional photo alongside the sentence — only where it earns its place. */
  photoEncouraged?: boolean;
  /** Mission 13: open the field with the identity statement already in it. */
  prefillIdentity?: boolean;
  /** Missions 14 and 29: show the compiled Personal Code above the field. */
  showPersonalCode?: boolean;
  /** Optional, collapsed, never required. */
  youtubeId: string | null;
}

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
    title: "Your First Step",
    idea: "You don't become a better man by thinking about it. You become him by doing one small thing, today, while the thought is still warm. So do it now — send the text you keep meaning to send, make the call, say the thing you've been holding. Two minutes is enough. Then write it down below, because this is the first piece of evidence in a file that's about to get thick.",
    recommendedTrigger: "courage",
    inputLabel: "What did you do?",
    inputPlaceholder: "Texted my brother to tell him I'm proud of him.",
    youtubeId: null,
  },
  {
    number: 2,
    slug: "m2",
    title: "Send the Message",
    idea: "Most likely there's a message you need to send. Everyone has someone — business, personal, or someone you haven't reached out to in years. Today you need the courage to send that message. It may mean confronting someone, or being vulnerable, and you have to send it knowing you may never get a response. Send it now, before you talk yourself out of it.",
    recommendedTrigger: "courage",
    inputLabel: "Who did you send it to, and what did you say?",
    inputPlaceholder: "My old business partner — asked if we could talk this week.",
    youtubeId: null,
  },
  {
    number: 3,
    slug: "m3",
    title: "Keep One Promise",
    idea: "You keep your word to everyone but yourself. The promises you break in private are the expensive ones, because you're the one keeping score — and every broken one teaches you that your word is negotiable. Pick the smallest promise you've been breaking: the ten minutes, the walk, the call. Keep it right now. It doesn't have to be impressive. It has to be kept.",
    recommendedTrigger: "commitment",
    inputLabel: "What promise did you keep?",
    inputPlaceholder: "Walked for ten minutes instead of scrolling.",
    youtubeId: null,
  },
  {
    number: 4,
    slug: "m4",
    title: "Honor Someone Who Matters",
    idea: "There is someone in your life who has no idea how much they matter to you. You assume they know. They don't — not specifically, not in words. Tell one person right now exactly what they did and why it mattered. Not “thanks for everything.” Be specific. It costs you sixty seconds and they'll carry it for years.",
    recommendedTrigger: "honor",
    inputLabel: "Who did you honor, and what did you say?",
    inputPlaceholder: "Called my mother and told her the one thing she taught me that stuck.",
    youtubeId: null,
  },
  {
    number: 5,
    slug: "m5",
    title: "Act Before You Feel Ready",
    idea: "Ready is a feeling, and it arrives after you start — never before. Whatever you've been waiting to feel ready for, take the smallest real step on it in the next two minutes. Open the document. Send the application. Ask the question. You can be nervous and still be moving; what you can't do is wait your way into confidence.",
    recommendedTrigger: "courage",
    inputLabel: "What step did you take?",
    inputPlaceholder: "Sent the proposal I've had sitting in drafts for a month.",
    youtubeId: null,
  },
  {
    number: 6,
    slug: "m6",
    title: "Remember the Man You Have Already Been",
    idea: "You're not building Honor, Courage and Commitment out of nothing. You've already lived them — a hard season you got through, a promise you kept when nobody was watching, a time you stood up and it cost you something. You've just stopped giving yourself credit for it. Bring one of those moments back to mind, then do a small version of that same thing today.",
    recommendedTrigger: "honor",
    inputLabel: "What did you remember, and what did you do today?",
    inputPlaceholder: "The year I worked two jobs — today I did the hard task first.",
    youtubeId: null,
  },
  {
    number: 7,
    slug: "m7",
    title: "Build Your Shrine to Self-Improvement",
    idea: "The man you're becoming needs somewhere to live in your house. Pick one surface — a dresser, a shelf, the corner of your desk — and put your three bottles there along with one object that means something: a photograph, a coin, a book, something your father gave you. This isn't decoration. It's the first thing you'll see on the mornings you'd rather not be him. Two minutes, then photograph it.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you set up, and where?",
    inputPlaceholder: "Top of the dresser — the three bottles, my grandfather's watch.",
    photoEncouraged: true,
    youtubeId: "GCpsEfFp_E8",
  },
  {
    number: 8,
    slug: "m8",
    title: "Honor, in Your Words",
    idea: "Honor isn't a dictionary word, it's your word — and it only does any work when doing the right thing is expensive. When nobody would ever know. When it costs you money, or the sale, or the easier evening. Finish the sentence in your own language, the way you'd say it to your son, then live by it for the rest of today. This becomes a line of your Personal Code.",
    recommendedTrigger: "honor",
    inputLabel: "Honor means…",
    inputPlaceholder: "Doing what I said I'd do, even when it costs me.",
    multiline: true,
    youtubeId: "a9yG3pylUKY",
  },
  {
    number: 9,
    slug: "m9",
    title: "Courage, in Your Words",
    idea: "Courage isn't the absence of fear. If you're not afraid, you're not being brave — you're just comfortable. Courage is deciding that fear doesn't get the final vote. Write what that means for you, in your words, and then act on it once before the day is over. This becomes a line of your Personal Code.",
    recommendedTrigger: "courage",
    inputLabel: "Courage means…",
    inputPlaceholder: "Saying the honest thing while my voice is shaking.",
    multiline: true,
    youtubeId: "NCeKnEezPWs",
  },
  {
    number: 10,
    slug: "m10",
    title: "Commitment, in Your Words",
    idea: "Commitment starts the day the excitement dies. Anybody can show up on day one — you're defining what follow-through looks like on day eighteen, when nothing feels different yet and nobody is clapping. Write it in your own words, then prove the definition with one small action today. This becomes a line of your Personal Code.",
    recommendedTrigger: "commitment",
    inputLabel: "Commitment means…",
    inputPlaceholder: "Doing it after the motivation is gone.",
    multiline: true,
    youtubeId: "ihWgFp5H0DU",
  },
  {
    number: 11,
    slug: "m11",
    title: "Your Non-Negotiable",
    idea: "Most men negotiate with themselves all day long, and lose. One standard that simply isn't up for discussion ends the argument before it starts. Choose yours — the one thing you will not trade for convenience, money or approval. One sentence. Then make one decision today that proves it's true.",
    recommendedTrigger: "honor",
    inputLabel: "My non-negotiable is…",
    inputPlaceholder: "I tell the truth, even when the lie would be easier.",
    multiline: true,
    youtubeId: null,
  },
  {
    number: 12,
    slug: "m12",
    title: "The Promise That Matters Most",
    idea: "Ten goals is noise. One promise is direction. Out of everything you'd like to change, there's one that would make the rest easier if you simply kept it for thirty days — you already know which one it is. Name it, and take the first step on it right now. Not tomorrow. Now, even if the step is small enough to feel silly.",
    recommendedTrigger: "commitment",
    inputLabel: "The promise I'm keeping is…",
    inputPlaceholder: "I'm home for dinner, phone in the other room, every weeknight.",
    multiline: true,
    youtubeId: null,
  },
  {
    number: 13,
    slug: "m13",
    title: "The Man You Are Becoming",
    idea: "You wrote this sentence the day you started. You know more now. Read it again, cut what's no longer true, and make it something you'd be willing to say out loud to someone who knows you well. Identity is what makes the next decision easy — a man like you simply doesn't do certain things. Then do one thing in the next two minutes that proves it.",
    recommendedTrigger: "honor",
    inputLabel: "I am becoming a man who…",
    inputPlaceholder: "keeps his word, acts despite fear, and follows through.",
    multiline: true,
    prefillIdentity: true,
    youtubeId: null,
  },
  {
    number: 14,
    slug: "m14",
    title: "Build My Personal Code",
    idea: "Look at what you've written: who you're becoming, what your three values actually mean, the standard you won't trade, the promise you're keeping. That isn't a worksheet. That's your code, in your own handwriting, and most men go their whole lives without one. Read it through. Then pick the single line you most need today and act on it before you put the phone down.",
    recommendedTrigger: "honor",
    inputLabel: "Which line did you act on, and what did you do?",
    showPersonalCode: true,
    youtubeId: null,
  },
  {
    number: 15,
    slug: "m15",
    title: "Strengthen a Relationship",
    idea: "You work, you provide, you solve problems — and the people all of that is for get whatever's left at the end of the day, which is usually nothing. One relationship is thinner than it should be right now, and you know exactly whose it is. Send the message or make the call today. Sixty seconds of real attention beats another month of meaning to.",
    recommendedTrigger: "honor",
    inputLabel: "Who did you show up for, and how?",
    inputPlaceholder: "Called my daughter just to ask about her week.",
    youtubeId: "NGi4l1rNc50",
  },
  {
    number: 16,
    slug: "m16",
    title: "Respect Your Body",
    idea: "This isn't vanity. You're carrying the only body you get, and the people who depend on you need it to last. Don't overhaul anything today. Do one thing the healthier version of you would respect — the water, the ten-minute walk, the appointment you keep postponing, the second drink you don't pour.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you do for your body?",
    inputPlaceholder: "Booked the physical I've been putting off since spring.",
    youtubeId: "co2ZBwcMsjM",
  },
  {
    number: 17,
    slug: "m17",
    title: "Do the Important Work",
    idea: "Easy work feels like progress, which is exactly why you keep choosing it. There's one task you've been burying under smaller, safer ones — the one that shows up in your head in the shower. Give it ten honest minutes right now. Not the whole thing. Ten minutes, and then you'll know whether it was ever as big as you made it.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you work on?",
    inputPlaceholder: "Ten minutes on the contract I've been avoiding for three weeks.",
    youtubeId: "8UbE1PcGqC0",
  },
  {
    number: 18,
    slug: "m18",
    title: "Face the Numbers",
    idea: "Money problems grow in the dark, and not looking is a decision you're making every single day. Open the account. Read the statement. Look at the real number, whatever it turns out to be. This isn't a financial act, it's a courage act — and everything downstream of it gets easier the moment you've actually seen it.",
    recommendedTrigger: "courage",
    inputLabel: "What did you look at or take care of?",
    inputPlaceholder: "Opened every account and wrote down the real total.",
    youtubeId: "GqQmxeLr6GI",
  },
  {
    number: 19,
    slug: "m19",
    title: "Improve Your Environment",
    idea: "Your rooms are either helping you or quietly working against you. The pile you walk past. The desk you can't actually work at. The phone full of things that pull you sideways. Fix one of them today — one surface, one drawer, one screen. Two minutes is enough to change how a room feels when you walk into it tomorrow.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you clear or fix?",
    inputPlaceholder: "Cleared the desk and deleted the apps that eat my evenings.",
    photoEncouraged: true,
    youtubeId: null,
  },
  {
    number: 20,
    slug: "m20",
    title: "Be Useful to Someone",
    idea: "You'll be remembered for what you were useful for. Somebody in your circle is stuck on something you could solve in five minutes — an introduction, a name, a piece of advice you've already paid for, a hand with something heavy. Do it today, and don't mention it afterwards.",
    recommendedTrigger: "honor",
    inputLabel: "Who did you help, and how?",
    inputPlaceholder: "Introduced Dave to the contractor who did my roof.",
    youtubeId: "oU7fHhMoXoY",
  },
  {
    number: 21,
    slug: "m21",
    title: "Choose the Area That Changes Everything",
    idea: "Not everything deserves your attention right now, and trying to fix all of it at once is why nothing moves. One area — relationships, health, work, money, your home, service — would lift every other one if you gave it consistent attention for a month. Choose it, say it plainly, and take one small step on it today so the choice is real and not just a thought.",
    recommendedTrigger: "commitment",
    inputLabel: "Which area did you choose, and what did you do?",
    inputPlaceholder: "Health — walked at lunch instead of eating at my desk.",
    youtubeId: null,
  },
  {
    number: 22,
    slug: "m22",
    title: "One Thing Beats Nothing",
    idea: "The smallest version of the right action beats the perfect plan you never start. Two minutes of the workout. One paragraph. One phone call. Take the smallest honest piece of something that matters and do it right now — and notice how often you keep going once you're already moving.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you do?",
    inputPlaceholder: "Two minutes of push-ups. Ended up doing fifteen.",
    youtubeId: "FaJhvhVPb9c",
  },
  {
    number: 23,
    slug: "m23",
    title: "Get 1% Better",
    idea: "You won't feel a one percent improvement today. That's the whole problem with it — and the whole power of it. Take one thing you already do every day and make it slightly better: one more rep, one less scroll, one earlier alarm, one honest sentence. Small enough that you can't talk yourself out of it tomorrow either.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you improve?",
    inputPlaceholder: "Phone charges in the kitchen now, not next to the bed.",
    youtubeId: "MePOS7sTKH0",
  },
  {
    number: 24,
    slug: "m24",
    title: "Protect What Matters",
    idea: "Every yes spends something you can't get back. Most men say yes because no feels rude, then quietly resent the person they said it to. Today, say no to one thing that's merely good so there's room for the thing that's important. Decline it, cancel it, or hand it to someone who should have had it in the first place.",
    recommendedTrigger: "courage",
    inputLabel: "What did you say no to?",
    inputPlaceholder: "Declined the Saturday meeting. That's my daughter's game.",
    youtubeId: "VkA4H2mZNII",
  },
  {
    number: 25,
    slug: "m25",
    title: "Find the 20% That Matters",
    idea: "A small handful of what you do produces almost everything you get. The rest is motion that feels like work. Name the one action that moves your life most right now, and spend the next few minutes on it before anything else gets its hands on your day.",
    recommendedTrigger: "commitment",
    inputLabel: "What high-value action did you take?",
    inputPlaceholder: "Called the three clients instead of reorganizing the inbox.",
    youtubeId: "CiNTVRxOgyY",
  },
  {
    number: 26,
    slug: "m26",
    title: "Make the Identity-Based Choice",
    idea: "Goals ask what you want. Identity asks what a man like you does next. You're facing a decision right now — small or large, you thought of it as you read that. Don't ask what's easiest. Ask what an honorable, courageous, committed man does here, and then go do that, today, while it's still in front of you.",
    recommendedTrigger: "honor",
    inputLabel: "What did you decide, and what did you do?",
    inputPlaceholder: "Told the client the mistake was mine before he found it.",
    youtubeId: "ZMBy99RiuvM",
  },
  {
    number: 27,
    slug: "m27",
    title: "Make One Real Commitment",
    idea: "A commitment you can't measure is a wish wearing a suit. Make this one clear enough that anybody could tell whether you kept it: one behavior, one number, one timeframe. “I'll walk twenty minutes, four days a week, for thirty days.” Write yours that plainly — then do the first one now, not on Monday.",
    recommendedTrigger: "commitment",
    inputLabel: "What did you commit to, and what was your first action?",
    inputPlaceholder: "Twenty minutes of reading, five nights a week. Did tonight's.",
    multiline: true,
    youtubeId: "QZQjcgh26jA",
  },
  {
    number: 28,
    slug: "m28",
    title: "Review the Evidence",
    idea: "Open your Proof Log and actually read it. Those aren't intentions — they're things you did, with dates on them. Most men have no such record of themselves and no idea what they're capable of because of it. One of those entries changed how you see yourself more than the others. Find it, and do that same thing again today, one size larger.",
    recommendedTrigger: "commitment",
    inputLabel: "Which proof mattered most, and what did you do today?",
    youtubeId: null,
  },
  {
    number: 29,
    slug: "m29",
    title: "Finalize and Share Your Personal Code",
    idea: "Your code should sound like the man these weeks proved you are, not the one you hoped you'd be on the first day. Read it once more and change whatever the evidence has earned. Then send it to one person who will hold you to it — that's the part that makes it real, and it's the part most men skip.",
    recommendedTrigger: "honor",
    inputLabel: "What did you change, and who did you send it to?",
    showPersonalCode: true,
    multiline: true,
    youtubeId: null,
  },
  {
    number: 30,
    slug: "m30",
    title: "Choose the Next Mission",
    idea: "Thirty days. Thirty pieces of evidence with your name on them. The challenge ends here; the man doesn't. Choose what you're building over the next thirty days and tie it to one of your three bottles, so the scent keeps doing the work of reminding you. Name it, and take the first step today.",
    recommendedTrigger: "commitment",
    inputLabel: "What's your next 30-day commitment?",
    inputPlaceholder: "Courage — one hard conversation a week, for thirty days.",
    multiline: true,
    youtubeId: null,
  },
];

export function getMissionDef(number: number): MissionDef | undefined {
  return MISSIONS.find((mission) => mission.number === number);
}
