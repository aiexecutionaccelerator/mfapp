"use client";

import {
  BookOpen,
  ScrollText,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Start", Icon: Target },
  { href: "/log", label: "Log", Icon: ScrollText },
  { href: "/missions", label: "Mission", Icon: BookOpen },
  { href: "/progress", label: "Progress", Icon: TrendingUp },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="print-hide fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div className="glass w-full max-w-[430px] rounded-t-[20px] pb-[env(safe-area-inset-bottom)]">
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
                  {/* Five items at 375px: 12px is the floor, so the tracking
                      gives way before the type size does. */}
                  <span className="text-[12px] tracking-[0.04em] whitespace-nowrap uppercase">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
