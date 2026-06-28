import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SailingLocLogo } from "@/components/brand/sailing-loc-logo";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/landing/locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations("Pages.LandingPage");

  return (
    <header className="sticky top-0 z-50 bg-[#1a2b48]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <SailingLocLogo className="[&_span:last-child]:text-white" variant="light" />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm font-medium md:flex"
        >
          <Link
            className="text-white/90 transition-colors hover:text-white"
            href="#"
          >
            {t("nav_search_boat")}
          </Link>
          <Link
            className="text-white/90 transition-colors hover:text-white"
            href="#"
          >
            {t("nav_become_owner")}
          </Link>
          <Link
            className="text-white/90 transition-colors hover:text-white"
            href="#"
          >
            {t("nav_help")}
          </Link>
          <span aria-hidden className="text-white/30">
            |
          </span>
          <LocaleSwitcher variant="dark" />
        </nav>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-md border border-white/40 bg-transparent px-5 text-white shadow-none hover:bg-white/10"
            size="sm"
            variant="ghost"
          >
            <Link href="/login">{t("nav_login")}</Link>
          </Button>
          <Button
            asChild
            className="rounded-md bg-[#D68A6E] px-5 text-white hover:bg-[#c57d5f]"
            size="sm"
          >
            <Link href="/register">{t("nav_register")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
