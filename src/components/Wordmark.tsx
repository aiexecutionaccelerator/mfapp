"use client";

import { useState } from "react";
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

/** Real logo drops in at /images/logo.svg — used automatically once it exists. */
export default function Wordmark({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const textSize = size === "lg" ? "text-[34px]" : "text-[22px]";
  const crestSize = size === "lg" ? 30 : 20;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {imageLoaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/logo.svg"
          alt="Mission"
          className={size === "lg" ? "h-9" : "h-6"}
        />
      ) : (
        <>
          <Crest size={crestSize} />
          <span
            className={cn(
              "font-display tracking-[0.14em] text-gold-gradient",
              textSize,
            )}
          >
            MISSION
          </span>
        </>
      )}
      {!imageLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/logo.svg"
          alt=""
          className="hidden"
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
}
