/**
 * The three Scent Triggers. ONE description each, shown everywhere a value is
 * described — onboarding's Meet Your Scent Triggers and the three bottles on
 * the Missions list read the same words. There used to be a second set here
 * (tagline/about) that drifted from the first; don't add another.
 */
export const TRIGGERS = {
  honor: {
    name: "HONOR",
    /** The definition from the missionfragrances.com sales page. */
    definition:
      "You live by a moral code, tell the truth, keep promises, and own your actions.",
    /** The keyword tags under the definition. */
    words: "Integrity · Responsibility · Respect",
    /** "You acted with Honor." */
    provedWith: "Honor",
  },
  courage: {
    name: "COURAGE",
    definition:
      "You do what you know is right despite fear, danger, or pressure to do otherwise.",
    words: "Speak Honestly · Move First · Act Despite Fear",
    provedWith: "Courage",
  },
  commitment: {
    name: "COMMITMENT",
    definition:
      "You fulfill your responsibilities through consistent effort and perseverance.",
    words: "Discipline · Consistency · Follow-Through",
    provedWith: "Commitment",
  },
} as const;

export const TRIGGER_ORDER = ["honor", "courage", "commitment"] as const;

/**
 * The S.T.A.R. System — ONE definition, used everywhere it appears: the
 * onboarding slide, the reminder sheet on every Mission, Settings → How It
 * Works and Using Your Set. Wording from curriculum revision 2 (Oct 28): Trigger is the spray
 * itself; the recall lives in Act, because remembering a time you lived the
 * value works almost as well as doing something new.
 */
export const STAR_STEPS = [
  // S is "Select your Scent Trigger" — the bottle, not an abstract value.
  { letter: "S", name: "Select", text: "Select your Scent Trigger." },
  {
    letter: "T",
    name: "Trigger",
    text: "Spray the fragrance and breathe it in.",
  },
  {
    letter: "A",
    name: "Act",
    text: "Take one small action that's aligned with the value, or recall a time you lived it.",
    example: "Example: spray Honor, then do or remember something honorable.",
  },
  {
    letter: "R",
    name: "Record",
    // Curriculum revision 2: Record covers reflections, code and plans too,
    // and is honest about which of them are evidence.
    text: "Log what you did, recalled, defined, or planned. Completed actions build your evidence; plans describe practice still ahead.",
  },
] as const;

/** Under the four steps, wherever they appear. */
export const STAR_CLOSER =
  "Repeat the practice. Let your scent remind you of the values you choose to live.";

/**
 * Accents match the bottles: Honor = silver, Courage = gold, Commitment = black.
 *
 * `color`/`glow` are the bottle's own finish — right for a fill, such as the
 * dot beside an eyebrow, where black reads as black against a light ring
 * (`edge`). `ui`/`uiGlow` are for borders, rims and glows, where black has
 * nothing to show: Commitment takes a warm ivory rim there, because a black
 * bottle is read by the light on its edge rather than by its color.
 */
export const TRIGGER_ACCENTS = {
  honor: {
    color: "var(--honor)",
    glow: "var(--honor-glow)",
    edge: null,
    ui: "var(--honor)",
    uiGlow: "var(--honor-glow)",
  },
  courage: {
    color: "var(--courage)",
    glow: "var(--courage-glow)",
    edge: null,
    ui: "var(--courage)",
    uiGlow: "var(--courage-glow)",
  },
  commitment: {
    color: "var(--commitment)",
    glow: "var(--commitment-glow)",
    edge: "rgba(245,241,232,.32)",
    ui: "var(--commitment-ui)",
    uiGlow: "var(--commitment-ui-glow)",
  },
} as const;
