export const TRIGGERS = {
  honor: {
    name: "HONOR",
    tagline: "Presence · Standards · Composure",
    declareHeadline: "WHAT STANDARD ARE YOU PRACTICING RIGHT NOW?",
    applyLine: "Apply Honor now.",
  },
  courage: {
    name: "COURAGE",
    tagline: "Action · Boldness · Move Through Hesitation",
    declareHeadline: "WHAT REQUIRES COURAGE RIGHT NOW?",
    applyLine: "Apply Courage now.",
  },
  commitment: {
    name: "COMMITMENT",
    tagline: "Follow-Through · Discipline · Finish",
    declareHeadline: "WHAT ARE YOU COMMITTED TO FINISHING?",
    applyLine: "Apply Commitment now.",
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
