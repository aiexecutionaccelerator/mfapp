/**
 * The moment a Mission is saved: a gold seal stamps in, a check draws
 * itself, rings of light spread out and a few embers rise. About 1.5s, then
 * still. Decorative only: the words below it say what happened.
 */
const EMBERS = [
  { x: "22%", dx: "-18px", d: "500ms" },
  { x: "34%", dx: "10px", d: "650ms" },
  { x: "48%", dx: "-6px", d: "420ms" },
  { x: "58%", dx: "16px", d: "720ms" },
  { x: "70%", dx: "-12px", d: "560ms" },
  { x: "80%", dx: "8px", d: "800ms" },
];

export default function CompletionMedal({ quiet = false }: { quiet?: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto h-[132px] w-[132px]">
      <span className="burst-ring" />
      <span className="burst-ring" />
      {!quiet && <span className="burst-ring" />}
      {!quiet &&
        EMBERS.map((e) => (
          <span
            key={e.x}
            className="ember"
            style={{ "--x": e.x, "--dx": e.dx, "--d": e.d } as React.CSSProperties}
          />
        ))}
      <div className="medal-in absolute inset-[14px] flex items-center justify-center rounded-full bg-gold-gradient shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-6px_14px_rgba(0,0,0,.35),0_12px_40px_rgba(201,166,72,.35)]">
        <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[rgba(7,9,13,.35)] bg-[radial-gradient(circle_at_35%_30%,#1a2030,#07090d_70%)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              className="check-draw"
              d="M5 12.5l4.2 4.2L19 7"
              stroke="url(#medal-gold)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="medal-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#F3E3A8" />
                <stop offset="100%" stopColor="#B8912F" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
