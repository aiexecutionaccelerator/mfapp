import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PRODUCT } from "@/content/product";

/** Slim commerce card for the bottom of the main tabs. Opens the shop page. */
export default function BuyRow() {
  return (
    <Link href="/shop" className="mt-10 block">
      <div className="glass flex items-center gap-3 rounded-[14px] border-[rgba(201,166,72,.35)] px-4 py-3">
        <span className="min-w-0 flex-1 text-[13px] text-ink-2">
          {PRODUCT.buyRowText}
        </span>
        <span className="shrink-0 text-[13px] text-gold-300">
          {PRODUCT.buyRowCta}
        </span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-2" />
      </div>
    </Link>
  );
}
