// Per-request session refresh helper. Called from middleware.ts on every
// request that matches the matcher so the auth cookie stays fresh and
// downstream server components see the current user.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No Supabase wired up yet: skip auth gating so the site is browseable
  // against fixture data. /admin and /account will just render their pages
  // (and fail with a clearer error if the page itself queries Supabase).
  if (!hasSupabase()) return response;

  const supabase = createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // /admin: must be signed in AND admin role.
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // /account: signed-in only.
  if (path.startsWith("/account") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
