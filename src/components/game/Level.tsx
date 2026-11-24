"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Badge, { RARITY_STYLE } from "@/components/game/Badge";
import Sheet from "@/components/ui/Sheet";
import {
  ACHIEVEMENTS,
  LEVEL_CAP,
  RARITY_LABEL,
  RARITY_XP,
  type AchievementDef,
  type GameState,
} from "@/lib/game";
import { formatDay } from "@/lib/utils";

/** The level as a small gold hexagon with the number in it. */
export function LevelHex({ level, size = 40 }: { level: number; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size} className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id="lvl-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4dd8a" />
            <stop offset="0.5" stopColor="#9b7a26" />
            <stop offset="1" stopColor="#f4dd8a" />
          </linearGradient>
        </defs>
        <path d="M20 2 36 11v18L20 38 4 29V11Z" fill="#0d1017" stroke="url(#lvl-rim)" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <span className="font-display relative leading-none text-gold-300" style={{ fontSize: size * 0.45 }}>
        {level}
      </span>
    </span>
  );
}

/** A thin gold bar: how far into this level. */
export function XpBar({ game, className }: { game: GameState; className?: string }) {
  const pct = game.level >= LEVEL_CAP ? 100 : Math.round((game.intoLevel / game.levelSize) * 100);
  return (
    <span className={`block h-1.5 overflow-hidden rounded-full bg-[rgba(245,241,232,.1)] ${className ?? ""}`}>
      <span
        className="bg-gold-gradient block h-full rounded-full transition-[width] duration-700"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

/** Home, top right: the level and the streak, one tap to Progress. */
export function LevelChip({ game }: { game: GameState }) {
  return (
    <Link
      href="/progress#level"
      aria-label={`Level ${game.level}, ${game.title}. ${game.streak}-day streak. Open your progress.`}
      className="glass press flex shrink-0 items-center gap-2 rounded-full py-1 pr-3 pl-1"
    >
      <LevelHex level={game.level} size={30} />
      <span className="flex flex-col gap-1">
        <span className="eyebrow leading-none text-gold-300">LV {game.level}</span>
        <XpBar game={game} className="w-12" />
      </span>
      {game.streak > 0 && (
        <span className="ml-1 flex items-center gap-0.5 text-[13px] font-semibold text-ink-0">
          <Flame size={14} className={game.streakToday ? "text-[#ff8a1c]" : "text-ink-2"} aria-hidden />
          {game.streak}
        </span>
      )}
    </Link>
  );
}

/** Progress: the level card. */
export function LevelCard({ game }: { game: GameState }) {
  const toNext = game.levelSize - game.intoLevel;
  return (
    <section id="level" className="glass mt-8 scroll-mt-24 rounded-[18px] p-5">
      <div className="flex items-center gap-4">
        <LevelHex level={game.level} size={64} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-gold-300">Level {game.level} · {game.title}</p>
          <XpBar game={game} className="mt-2.5" />
          <p className="mt-2 text-[13px] text-ink-2">
            {game.level >= LEVEL_CAP
              ? `${game.xp.toLocaleString()} XP. The top level.`
              : `${game.xp.toLocaleString()} XP · ${toNext.toLocaleString()} to level ${game.level + 1}`}
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-[var(--line)] p-3">
          <p className="flex items-center gap-1.5 font-display text-[28px] leading-none text-ink-0">
            <Flame size={20} className={game.streak > 0 ? "text-[#ff8a1c]" : "text-ink-2"} aria-hidden />
            {game.streak}
          </p>
          <p className="mt-1 text-[12px] text-ink-2">
            Day streak{game.streak > 0 && !game.streakToday ? " · act today to keep it" : ""}
          </p>
        </div>
        <div className="rounded-[14px] border border-[var(--line)] p-3">
          <p className="font-display text-[28px] leading-none text-ink-0">{game.bestStreak}</p>
          <p className="mt-1 text-[12px] text-ink-2">Best streak</p>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-snug text-ink-2">
        Missions give 100 XP, Ignite actions 30 (three a day), and every day of a streak adds a little.
        Finishing the 30 Missions takes you to level 30.
      </p>
    </section>
  );
}

/** Progress: every achievement, earned ones lit, hidden ones kept secret. */
export function Achievements({ game }: { game: GameState }) {
  const [open, setOpen] = useState<AchievementDef | null>(null);
  const earned = open ? game.earnedById.get(open.id) : undefined;
  const count = game.earned.length;
  // Earned first, in the order earned; then the rest in list order.
  const ordered = [
    ...game.earned.map((e) => e.def),
    ...ACHIEVEMENTS.filter((a) => !game.earnedById.has(a.id)),
  ];
  return (
    <section id="achievements" className="mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-ink-2">Achievements</p>
        <p className="text-[13px] text-ink-2">
          {count} of {ACHIEVEMENTS.length}
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {ordered.map((a) => {
          const got = game.earnedById.has(a.id);
          const secret = a.hidden && !got;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOpen(a)}
                className="press flex w-full flex-col items-center gap-2 rounded-[14px] border border-[var(--line)] px-1 py-3 text-center"
                aria-label={`${secret ? "Hidden achievement" : a.name}${got ? ", earned" : ", not earned yet"}`}
              >
                <Badge rarity={a.rarity} glyph={a.glyph} earned={got} hidden={a.hidden} size={52} />
                <span className={`text-[12px] leading-tight ${got ? "text-ink-0" : "text-ink-2"}`}>
                  {secret ? "???" : a.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet open={open !== null} title={open ? (open.hidden && !earned ? "Hidden achievement" : open.name) : ""} onClose={() => setOpen(null)}>
        {open && (
          <div className="flex flex-col items-center text-center">
            <Badge rarity={open.rarity} glyph={open.glyph} earned={Boolean(earned)} hidden={open.hidden} size={96} />
            <p className="eyebrow mt-4" style={{ color: RARITY_STYLE[open.rarity].text }}>
              {RARITY_LABEL[open.rarity]}
              {open.level ? "" : ` · ${RARITY_XP[open.rarity]} XP`}
            </p>
            <p className="mt-3 text-[17px] leading-snug text-ink-0">
              {open.hidden && !earned ? "Keep going. You'll know it when you earn it." : open.how}
            </p>
            <p className="mt-2 text-[14px] text-ink-2">
              {earned ? `Earned ${formatDay(earned.at.slice(0, 10))}` : "Not earned yet"}
            </p>
          </div>
        )}
      </Sheet>
    </section>
  );
}

/** Under a success screen: the XP the save earned, any level-up, any badges. */
export function GainSummary({
  gain,
}: {
  gain: { xp: number; levelUp: number | null; unlocked: AchievementDef[]; after: GameState };
}) {
  if (gain.xp <= 0 && !gain.unlocked.length) return null;
  return (
    <div className="rise-in mt-6 flex flex-col items-center gap-3 text-center" style={{ animationDelay: "250ms" }}>
      <p className="font-display text-[22px] leading-none text-gold-300">+{gain.xp} XP</p>
      {gain.levelUp ? (
        <p className="flex items-center gap-2 text-[15px] text-ink-0">
          <LevelHex level={gain.levelUp} size={28} /> Level {gain.levelUp} · {gain.after.title}
        </p>
      ) : (
        <XpBar game={gain.after} className="w-40" />
      )}
      {gain.unlocked.map((a) => (
        <Link
          key={a.id}
          href="/progress#achievements"
          className="glass press flex items-center gap-3 rounded-[14px] px-3 py-2 text-left"
        >
          <Badge rarity={a.rarity} glyph={a.glyph} earned size={40} />
          <span>
            <span className="eyebrow block" style={{ color: RARITY_STYLE[a.rarity].text }}>
              Achievement unlocked
            </span>
            <span className="block text-[15px] text-ink-0">{a.name}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
