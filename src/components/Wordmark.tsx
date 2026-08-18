import { ART, artUrl } from "@/lib/art";
import { cn } from "@/lib/utils";

function Crest({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M12 2.5 20 5.5v6.2c0 4.4-3.2 8.2-8 9.8-4.8-1.6-8-5.4-8-9.8V5.5L12 2.5Z"
        stroke="var(--gold-500)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.4v9.4M9.6 9.1h4.8M12 15.8l-1.3 1.6h2.6L12 15.8Z"
        stroke="var(--gold-300)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Brand wordmark image; falls back to typeset MISSION ⟡ FRAGRANCES. */
export default function Wordmark({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const textSize = size === "lg" ? "text-[30px]" : "text-[18px]";
  const crestSize = size === "lg" ? 30 : 20;
  const logo = artUrl(ART.wordmark);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="Mission Fragrances" className={size === "lg" ? "h-9 w-auto" : "h-[22px] w-auto"} />
      ) : (
        <>
          <span
            className={cn(
              "font-display tracking-[0.14em] text-gold-gradient",
              textSize,
            )}
          >
            MISSION
          </span>
          <Crest size={crestSize} />
          <span
            className={cn(
              "font-display tracking-[0.14em] text-gold-gradient",
              textSize,
            )}
          >
            FRAGRANCES
          </span>
        </>
      )}
    </div>
  );
}
