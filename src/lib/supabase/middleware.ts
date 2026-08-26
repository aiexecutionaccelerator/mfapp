import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemo } from "@/lib/env";

const PROTECTED = [
  "/home",
  "/course",
  "/missions",
  "/log",
  "/progress",
  "/settings",
  "/shop",
  "/mission",
  "/onboarding",
  "/personal-code",
  "/how-it-works",
  "/using-your-set",
];

/**
 * Once onboarding is complete it never un-completes in production, so the
 * verdict is cached in a cookie keyed by user id — the per-navigation
 * profiles query happens once per device, not once per page.
 */
const ONBOARDED_COOKIE = "mf-onboarded";

function isProtected(pathname: string): boolean {
  return PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  // Demo mode has no server session; everything is decided on the device.
  if (isDemo()) return NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Public pages (welcome, verify, legal, root) skip Supabase entirely —
  // no auth round-trip on the routes people hit before signing in. Token
  // refresh still happens on the very next protected navigation.
  if (!isProtected(pathname)) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Using Your Set is reachable from onboarding screen 2 ("Learn about the
  // fragrances"), so it must not bounce back to /onboarding like other pages.
  if (pathname !== "/onboarding" && pathname !== "/using-your-set") {
    const cached = request.cookies.get(ONBOARDED_COOKIE)?.value === user.id;
    if (!cached) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        url.search = "";
        return NextResponse.redirect(url);
      }

      response.cookies.set(ONBOARDED_COOKIE, user.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  return response;
}
