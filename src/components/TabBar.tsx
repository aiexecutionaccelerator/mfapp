"use client";

import { BookOpen, ScrollText, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Four tabs since logging became one click inside the Mission itself: there
// is nothing left for a Start screen to launch.
const TABS = [
  { href: "/missions", label: "Missions", Icon: BookOpen },
  { href: "/log", label: "Log", Icon: ScrollText },
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
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[60px] flex-col items-center justify-center gap-1",
                    active ? "text-gold-300" : "text-ink-2",
                  )}
                >
                  <Icon size={20} aria-hidden />
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
