import {
  Anvil, Atom, BatteryFull, Power, Zap, BookOpen, Cog, Compass, Crown, Eye, Flame, FlameKindling, House,
  Infinity as InfinityIcon, Link as LinkIcon, Lock, MountainSnow, Moon, Scroll,
  ShieldCheck, Star, Sunrise, Sunset, Sword, Swords,
  Triangle, Wind, type LucideIcon,
} from "lucide-react";
import { useId } from "react";
import type { Glyph, Rarity } from "@/lib/game";
import { cn } from "@/lib/utils";

const GLYPHS: Record<Glyph, LucideIcon> = {
  sunrise: Sunrise, scroll: Scroll, triangle: Triangle, compass: Compass,
  shield: ShieldCheck, cog: Cog, book: BookOpen, crown: Crown, home: House,
  flame: Flame, flames: FlameKindling, anvil: Anvil, infinity: InfinityIcon,
  spark: Power, wildfire: Zap, pyre: BatteryFull, sword: Sword, lion: Swords,
  chain: LinkIcon, trinity: Atom, wind: Wind, moon: Moon, dawn: Sunset,
  eye: Eye, star: Star, summit: MountainSnow,
};

/**
 * Rarity sets the frame, after Path of Exile's item colours: Common is a
 * plain steel ring, Magic a blue hexagon, Rare a gold shield, Unique an
 * amber eight-point crest that glows.
 */
export const RARITY_STYLE: Record<Rarity, { rim: string; rimDark: string; glow: string; text: string }> = {
  normal: { rim: "#d9d4c7", rimDark: "#6f6b62", glow: "rgba(217,212,199,.25)", text: "#d9d4c7" },
  magic: { rim: "#8f9dff", rimDark: "#2f3a8f", glow: "rgba(130,145,255,.35)", text: "#a9b3ff" },
  rare: { rim: "#f2d35b", rimDark: "#8a6a12", glow: "rgba(242,211,91,.35)", text: "#f2d35b" },
  unique: { rim: "#e08a3c", rimDark: "#6b2f0c", glow: "rgba(224,138,60,.55)", text: "#f0a35e" },
};

const SHAPES: Record<Rarity, string> = {
  normal: "M32 4a28 28 0 1 1 0 56a28 28 0 1 1 0-56Z",
  magic: "M32 3 57 17.5v29L32 61 7 46.5v-29Z",
  rare: "M32 3 56 11v20c0 15-10 25-24 30C18 56 8 46 8 31V11Z",
  unique:
    "M32 2l7.5 10.3L52 9l-1.7 12.6L62 27.5l-9.3 8.7L56 48.5l-12.6.6L37 60l-5-3.6-5 3.6-6.4-10.9-12.6-.6 3.3-12.3L2 27.5l11.7-5.9L12 9l12.5 3.3Z",
};

export default function Badge({
  rarity,
  glyph,
  earned,
  hidden = false,
  size = 64,
  className,
}: {
  rarity: Rarity;
  glyph: Glyph;
  earned: boolean;
  /** A hidden achievement not yet earned shows a lock, not its symbol. */
  hidden?: boolean;
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const s = RARITY_STYLE[rarity];
  const Icon = !earned && hidden ? Lock : GLYPHS[glyph];
  return (
    <span
      aria-hidden
      className={cn("relative inline-flex shrink-0 items-center justify-center", !earned && "opacity-40 grayscale", className)}
      style={{ width: size, height: size, filter: earned ? `drop-shadow(0 0 ${size / 8}px ${s.glow})` : undefined }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className="absolute inset-0">
        <defs>
          <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={s.rim} />
            <stop offset="0.5" stopColor={s.rimDark} />
            <stop offset="1" stopColor={s.rim} />
          </linearGradient>
          <radialGradient id={`core-${id}`} cx="0.5" cy="0.35" r="0.75">
            <stop offset="0" stopColor={s.rimDark} stopOpacity="0.9" />
            <stop offset="1" stopColor="#07090d" />
          </radialGradient>
        </defs>
        <path d={SHAPES[rarity]} fill={`url(#core-${id})`} stroke={`url(#rim-${id})`} strokeWidth="3" strokeLinejoin="round" />
        {/* An inner hairline, like a set stone's bezel. */}
        <path
          d={SHAPES[rarity]}
          fill="none"
          stroke={s.rim}
          strokeOpacity="0.35"
          strokeWidth="1"
          transform="translate(32 32) scale(0.82) translate(-32 -32)"
        />
      </svg>
      <Icon size={size * 0.4} strokeWidth={1.75} style={{ color: s.text }} className="relative" />
    </span>
  );
}
