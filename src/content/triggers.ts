export const TRIGGERS = {
  honor: {
    name: "HONOR",
    tagline: "Presence · Standards · Composure",
    declareHeadline: "HOW WILL YOU BE A MAN OF HONOR TODAY?",
    // From the Mission Fragrances course — "The Importance of Honor".
    about:
      "Honor is the gift a man gives himself — the standard he lives by. It isn't bestowed by anyone else; it's cultivated from within and measured by the quiet satisfaction of acting in line with your principles. Be true to your word. Stand up for what you believe in. Take responsibility for your actions.",
    applyLine: "Apply Honor now.",
    /** For the Anchor line: "recall a moment you were HONORABLE". */
    anchorWord: "HONORABLE",
  },
  courage: {
    name: "COURAGE",
    tagline: "Action · Boldness · Move Through Hesitation",
    declareHeadline: "HOW WILL YOU PRACTICE COURAGE TODAY?",
    // From the Mission Fragrances course — "The Importance of Courage".
    about:
      "Courage isn't a switch you flip in a crisis. It's built through the daily practice of mastering your fear — mental, moral, and physical strength earned by doing the hard thing anyway. Not every brave act is audacious: sticking to the plan, saying no, climbing the ladder. Every small act builds a courageous man.",
    applyLine: "Apply Courage now.",
    anchorWord: "COURAGEOUS",
  },
  commitment: {
    name: "COMMITMENT",
    tagline: "Follow-Through · Discipline · Finish",
    declareHeadline: "WHAT WILL YOU COMMIT TO TODAY?",
    // From the Mission Fragrances course — "The Importance of Commitment".
    about:
      "Commitment is more than a promise. It's a conscious decision to stick to a goal or task in the face of adversity — the spirit of determination and dedication that leads to the mastery of self. It doesn't come and go with your moods. It starts small: daily decisions that line up with what you said you wanted.",
    applyLine: "Apply Commitment now.",
    anchorWord: "COMMITTED",
  },
} as const;

export const TRIGGER_ORDER = ["honor", "courage", "commitment"] as const;

/**
 * Accents match the bottles: Honor = silver, Courage = gold, Commitment = black.
 * Black needs a faint light edge to read against the dark UI (`edge`).
 */
export const TRIGGER_ACCENTS = {
  honor: { color: "var(--honor)", glow: "var(--honor-glow)", edge: null },
  courage: { color: "var(--courage)", glow: "var(--courage-glow)", edge: null },
  commitment: {
    color: "var(--commitment)",
    glow: "var(--commitment-glow)",
    edge: "rgba(245,241,232,.32)",
  },
} as const;
