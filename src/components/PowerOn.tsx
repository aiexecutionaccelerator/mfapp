"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

/**
 * The Activate button's power-on (24 Nov). Electric signals leave the power
 * button and run up circuit traces to the top of the screen; behind them a
 * line of light rises and the screen above it comes on. Only inside the
 * app's phone-width column, never the whole desktop screen. About a second,
 * then it removes itself. Styles: "Power" in globals.css.
 */
export default function PowerOn({
  origin,
  onDone,
}: {
  /** The power button's centre, in viewport pixels. */
  origin: { x: number; y: number };
  onDone: () => void;
}) {
  const column = Math.min(window.innerWidth, 430);
  const left = (window.innerWidth - column) / 2;
  const height = window.innerHeight;
  const ox = origin.x - left;
  const oy = origin.y;

  // Circuit traces: up from the button, a right-angle jog out to a lane,
  // up again, a second jog, and on to the top edge.
  const traces = useMemo(() => {
    const lanes = [0.08, 0.2, 0.33, 0.44, 0.56, 0.67, 0.8, 0.92];
    return lanes.map((lane, i) => {
      const x1 = lane * column;
      const rise1 = 18 + (i % 3) * 14;
      const y2 = oy - rise1 - (0.18 + ((i * 37) % 23) / 100) * oy;
      const x2 = x1 + (i % 2 ? 1 : -1) * (10 + (i % 4) * 6);
      const y3 = y2 - (0.2 + ((i * 53) % 19) / 100) * oy;
      return {
        d: `M${ox} ${oy - 20} V${oy - 20 - rise1} H${x1} V${y2} H${x2} V${y3} H${x1} V0`,
        delay: (i % 4) * 40 + (Math.abs(lane - 0.5) * 120),
        end: x1,
      };
    });
  }, [column, ox, oy]);

  return createPortal(
    <div
      aria-hidden
      className="power-on"
      style={{ left, width: column }}
      onAnimationEnd={(e) => {
        if ((e.target as HTMLElement).classList.contains("power-on")) onDone();
      }}
    >
      {/* The screen above the rising line is still dark. */}
      <div className="power-on-dark" />
      <div className="power-on-line" />
      <svg className="power-on-svg" viewBox={`0 0 ${column} ${height}`} width={column} height={height}>
        {traces.map((t, i) => (
          <g key={i}>
            <path d={t.d} pathLength={1} className="power-trace" style={{ animationDelay: `${t.delay}ms` }} />
            <path d={t.d} pathLength={1} className="power-signal" style={{ animationDelay: `${t.delay}ms` }} />
            <circle cx={t.end} cy={2} r={2.5} className="power-node" style={{ animationDelay: `${t.delay + 380}ms` }} />
          </g>
        ))}
        <circle cx={ox} cy={oy} r={26} className="power-ring" />
      </svg>
    </div>,
    document.body,
  );
}
