"use client";

import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";

interface NavActionProps {
  kind: "back" | "close";
  href?: string;
  onClick?: () => void;
}

/** 48px back (‹) or close (×) affordance for every non-tab screen. */
export default function NavAction({ kind, href, onClick }: NavActionProps) {
  const label = kind === "back" ? "Go back" : "Close";
  const Icon = kind === "back" ? ChevronLeft : X;
  const className =
    "-ml-3 flex h-12 w-12 items-center justify-center text-ink-1";

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        <Icon size={24} aria-hidden />
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={className} onClick={onClick}>
      <Icon size={24} aria-hidden />
    </button>
  );
}
