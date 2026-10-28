"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { PRODUCT } from "@/content/product";
import { track } from "@/lib/analytics";

/**
 * The claim-your-set prompt, at the foot of every screen in the app.
 *
 * `mt-auto` is what "pinned" means here: on a short screen it sits at the
 * bottom above the tab bar, on a long one it follows the content. It is
 * never shown on the shop itself (he is already there) and never prints.
 *
 * It goes straight to the live product page, where he can buy, not to an
 * in-app screen he'd have to tap through first.
 */
export default function BuyRow() {
  const pathname = usePathname();
  if (pathname.startsWith("/shop")) return null;

  return (
    <a
      href={PRODUCT.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("buy_row_clicked", { from: pathname })}
      className="print-hide mt-auto block pt-10"
    >
      <div className="glass flex items-center gap-3 rounded-[14px] border-[rgba(201,166,72,.35)] px-4 py-3">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] text-ink-2">
            {PRODUCT.buyRowText}
          </span>
          <span className="mt-0.5 block text-[15px] text-gold-300">
            {PRODUCT.buyRowCta}
          </span>
        </span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-2" />
      </div>
    </a>
  );
}
