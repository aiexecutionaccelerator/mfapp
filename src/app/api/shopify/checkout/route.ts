import { NextResponse } from "next/server";
import { hasShopify } from "@/lib/env";
import { createCheckout, getProductInfo } from "@/lib/shopify";

export async function POST() {
  if (!hasShopify()) {
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 503 },
    );
  }

  try {
    const checkoutUrl = await createCheckout();
    return NextResponse.json({ checkoutUrl });
  } catch {
    return NextResponse.json(
      { error: "Could not open checkout" },
      { status: 502 },
    );
  }
}

/** Best-effort live product info. The shop page falls back to static copy. */
export async function GET() {
  if (!hasShopify()) {
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await getProductInfo());
  } catch {
    return NextResponse.json(
      { error: "Could not load product" },
      { status: 502 },
    );
  }
}
