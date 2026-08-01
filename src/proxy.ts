import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/updateSupabaseSession";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/search",
  "/boats",
  "/become-owner",
] as const;
const AUTHENTICATED_ROUTES = ["/owner"] as const; // e.g. "/dashboard", "/profile", "/bookings"
const ADMIN_ROUTES = [] as const; // e.g. "/admin"

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split("/")[1];

  if (routing.locales.includes(segment as (typeof routing.locales)[number])) {
    return segment;
  }

  return routing.defaultLocale;
}

function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}

function matchesRoute(
  normalizedPath: string,
  routes: readonly string[],
): boolean {
  return routes.some(
    (route) =>
      normalizedPath === route ||
      (route !== "/" && normalizedPath.startsWith(`${route}/`)),
  );
}

function applySessionCookies(
  sessionResponse: NextResponse,
  targetResponse: NextResponse,
): NextResponse {
  sessionResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return targetResponse;
}

function redirectToHome(
  request: NextRequest,
  locale: string,
  sessionResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(
    new URL(`/${locale}`, request.url),
  );

  return applySessionCookies(sessionResponse, redirectResponse);
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth")) {
    const { response } = await updateSupabaseSession(request);
    return response;
  }

  const { supabase, response: sessionResponse, user } =
    await updateSupabaseSession(request);

  const pathname = request.nextUrl.pathname;
  const normalizedPath = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);

  const isPublicRoute = matchesRoute(normalizedPath, PUBLIC_ROUTES);
  const isAuthenticatedRoute = matchesRoute(
    normalizedPath,
    AUTHENTICATED_ROUTES,
  );
  const isAdminRoute = matchesRoute(normalizedPath, ADMIN_ROUTES);

  let isAllowed = false;

  if (isPublicRoute) {
    isAllowed = true;
  } else if (isAuthenticatedRoute) {
    isAllowed = !!user;
  } else if (isAdminRoute) {
    if (user) {
      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      isAllowed = userRoleData?.role === "ADMINISTRATOR";
    }
  }

  if (!isAllowed) {
    return redirectToHome(request, locale, sessionResponse);
  }

  const intlResponse = intlMiddleware(request);

  return applySessionCookies(sessionResponse, intlResponse);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
