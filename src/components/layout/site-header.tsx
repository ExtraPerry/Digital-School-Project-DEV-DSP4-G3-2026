import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SailingLocLogo } from "@/components/brand/sailing-loc-logo";
import { LocaleSwitcher } from "@/components/landing/locale-switcher";
import { SiteHeaderAuthActions } from "@/components/layout/site-header-auth-actions";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";

export async function SiteHeader() {
  const t = await getTranslations("Pages.LandingPage");
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName: string | null = null;
  let isOwner = false;
  let isAdmin = false;

  if (user) {
    const [{ data: profile }, { data: roleRow }] = await Promise.all([
      supabase
        .from("users")
        .select("first_name")
        .eq("auth_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("auth_id", user.id)
        .maybeSingle(),
    ]);

    firstName = profile?.first_name ?? null;
    isOwner =
      roleRow?.role === "OWNER" || roleRow?.role === "ADMINISTRATOR";
    isAdmin = roleRow?.role === "ADMINISTRATOR";
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1a2b48]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <SailingLocLogo variant="light" />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm font-medium md:flex"
        >
          <Link
            className="text-white/90 transition-colors hover:text-white"
            href="/search"
          >
            {t("nav_search_boat")}
          </Link>
          {/* Owners already get the coral "Owner space" button on the right. */}
          {!isOwner ? (
            <Link
              className="text-white/90 transition-colors hover:text-white"
              href="/become-owner"
            >
              {t("nav_become_owner")}
            </Link>
          ) : null}
          <span aria-hidden className="text-white/30">
            |
          </span>
          <LocaleSwitcher variant="dark" />
        </nav>
        <SiteHeaderAuthActions
          firstName={firstName}
          isAdmin={isAdmin}
          isAuthenticated={Boolean(user)}
          isOwner={isOwner}
        />
      </div>
    </header>
  );
}
