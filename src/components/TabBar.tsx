"use client";

import { House, ScrollText, Settings, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/log", label: "Log", Icon: ScrollText },
  { href: "/progress", label: "Progress", Icon: Target },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
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
                  <span className="text-[12px] tracking-[0.08em] uppercase">
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
