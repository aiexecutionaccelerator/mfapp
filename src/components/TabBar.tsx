"use client";

import { BookOpen, Flame, ScrollText, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Live It sits in the middle (Antonio, 23 Nov): a day he wears the fragrance
// outside the 30, one tap from anywhere.
const TABS = [
  { href: "/missions", label: "Missions", Icon: BookOpen },
  { href: "/log", label: "Log", Icon: ScrollText },
  { href: "/live", label: "Live It", Icon: Flame, center: true },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="print-hide fixed inset-x-0 bottom-0 z-30 flex justify-center">
      {/* Solid, not glass: content scrolling underneath must never show
          through the navigation, and it fades out before reaching the bar. */}
      <div className="relative w-full max-w-[430px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-[linear-gradient(180deg,transparent,var(--bg-0))]"
        />
        <div className="rounded-t-[20px] border border-[var(--line)] bg-[var(--bg-1)] pb-[env(safe-area-inset-bottom)]">
        <ul className="flex">
          {TABS.map(({ href, label, Icon, center }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            if (center)
              return (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-[60px] flex-col items-center justify-end gap-1 pb-2 transition-colors duration-200",
                      active ? "text-gold-300" : "text-ink-1 hover:text-ink-0",
                    )}
                  >
                    {/* The raised gold button: the one action outside the 30. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient text-[#07090D] shadow-[0_6px_20px_rgba(201,166,72,.3)] ring-4 ring-[var(--bg-1)] transition-transform duration-300",
                        active && "scale-105",
                      )}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="text-[12px] tracking-[0.04em] whitespace-nowrap uppercase">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-[60px] flex-col items-center justify-center gap-1 transition-colors duration-200",
                    active ? "text-gold-300" : "text-ink-2 hover:text-ink-1",
                  )}
                >
                  {/* A short bar of gold light over the active tab. */}
                  {active && (
                    <span
                      aria-hidden
                      className="tab-active-bar absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gold-gradient shadow-[0_0_12px_rgba(212,175,55,.8)]"
                    />
                  )}
                  <Icon
                    size={20}
                    aria-hidden
                    className={cn(
                      "transition-transform duration-300",
                      active && "-translate-y-px drop-shadow-[0_0_6px_rgba(212,175,55,.55)]",
                    )}
                  />
                  {/* 12px is the floor; the tracking gives way first. */}
                  <span className="text-[12px] tracking-[0.04em] whitespace-nowrap uppercase">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </nav>
  );
}
