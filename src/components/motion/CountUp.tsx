"use client";

import { useEffect, useState } from "react";

/**
 * Counts up to `value` when it first shows (ease-out, ~1s), so a number
 * reads as earned rather than printed. Respects reduced motion.
 */
export default function CountUp({
  value,
  duration = 1100,
}: {
  value: number;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduce || value === 0 ? 1 : Math.min((now - start) / duration, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{shown}</>;
}
