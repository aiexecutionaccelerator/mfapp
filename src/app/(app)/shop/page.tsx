"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import BottleVisual from "@/components/BottleVisual";
import NavAction from "@/components/NavAction";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import { useToast } from "@/components/ui/Toast";
import { PRODUCT } from "@/content/product";
import { TRIGGER_ORDER } from "@/content/triggers";
import { hasShopify } from "@/lib/env";

function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="glass relative mt-6 flex items-end justify-center gap-4 overflow-hidden rounded-[20px] px-5 py-8">
      {!imageLoaded && (
        <>
          {TRIGGER_ORDER.map((trigger) => (
            <BottleVisual key={trigger} trigger={trigger} size={64} />
          ))}
          <div
            aria-hidden
            className="absolute right-5 bottom-5 h-12 w-12 rounded-full border-2"
            style={{ borderColor: "var(--gold-500)" }}
          />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PRODUCT.heroImage}
        alt=""
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? "w-full" : "hidden"}
      />
    </div>
  );
}

export default function ShopPage() {
  const { showToast } = useToast();
  const configured = hasShopify();

  const [price, setPrice] = useState<string>(PRODUCT.price);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!configured) return;
    fetch("/api/shopify/checkout")
      .then((response) => (response.ok ? response.json() : null))
      .then((info: { price?: string | null } | null) => {
        if (info?.price) setPrice(info.price);
      })
      .catch(() => {
        // Static price stays. Never block render on Shopify.
      });
  }, [configured]);

  async function checkout() {
    setPending(true);
    try {
      const response = await fetch("/api/shopify/checkout", { method: "POST" });
      if (!response.ok) throw new Error("checkout failed");
      const { checkoutUrl } = (await response.json()) as {
        checkoutUrl: string;
      };
      window.location.assign(checkoutUrl);
    } catch {
      setPending(false);
      showToast("Couldn't open checkout. Please try again.");
    }
  }

  return (
    <main className="pt-[calc(env(safe-area-inset-top)+8px)]">
      <NavAction kind="back" href="/home" />

      <Eyebrow className="mt-4">{PRODUCT.eyebrow}</Eyebrow>
      <Headline className="mt-3">{PRODUCT.headline}</Headline>

      <Hero />

      <div className="mt-6">
        <p className="font-display text-[64px] leading-none text-gold-gradient">
          {price}
        </p>
        <p className="mt-1 text-[15px] text-ink-1">{PRODUCT.edition}</p>
      </div>

      <ul className="mt-6 space-y-3">
        {PRODUCT.included.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px] text-ink-1">
            <Check
              aria-hidden
              size={18}
              className="mt-0.5 shrink-0 text-gold-300"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[17px] text-ink-0">{PRODUCT.positioning}</p>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+76px)] -mx-5 mt-8 bg-[rgba(7,9,13,0.92)] px-5 py-3 backdrop-blur-md">
        <Button loading={pending} disabled={!configured} onClick={checkout}>
          {PRODUCT.cta}
        </Button>
        {!configured && (
          <p className="mt-2 text-center text-[13px] text-ink-2">
            {PRODUCT.notConfigured}
          </p>
        )}
        <p className="mt-2 text-center text-[13px] text-ink-2">
          {PRODUCT.ctaNote}
        </p>
      </div>
    </main>
  );
}
