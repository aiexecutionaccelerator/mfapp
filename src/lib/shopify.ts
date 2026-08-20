// Unused by the app today (the Shop CTA links straight to the product page) — kept for a future Storefront-API integration.
import {
  SHOPIFY_MISSION_VARIANT_ID,
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
} from "@/lib/env";

const API_VERSION = "2025-01";

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error(`Shopify returned ${response.status}`);

  const body = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (body.errors?.length) throw new Error(body.errors[0].message);
  if (!body.data) throw new Error("Shopify returned no data");
  return body.data;
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

export async function createCheckout(): Promise<string> {
  const result = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE, {
    lines: [{ merchandiseId: SHOPIFY_MISSION_VARIANT_ID, quantity: 1 }],
  });

  const { cart, userErrors } = result.cartCreate;
  if (!cart?.checkoutUrl) {
    throw new Error(userErrors[0]?.message ?? "Could not create a checkout");
  }
  return cart.checkoutUrl;
}

const VARIANT_QUERY = /* GraphQL */ `
  query Variant($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        availableForSale
        price {
          amount
          currencyCode
        }
        product {
          title
          featuredImage {
            url
          }
        }
      }
    }
  }
`;

export interface ProductInfo {
  title: string | null;
  price: string | null;
  availableForSale: boolean;
  imageUrl: string | null;
}

export async function getProductInfo(): Promise<ProductInfo> {
  const result = await storefront<{
    node: {
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
      product: { title: string; featuredImage: { url: string } | null };
    } | null;
  }>(VARIANT_QUERY, { id: SHOPIFY_MISSION_VARIANT_ID });

  const node = result.node;
  if (!node) throw new Error("Variant not found");

  const amount = Number(node.price.amount);
  return {
    title: node.product.title,
    price: Number.isFinite(amount)
      ? `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : null,
    availableForSale: node.availableForSale,
    imageUrl: node.product.featuredImage?.url ?? null,
  };
}
