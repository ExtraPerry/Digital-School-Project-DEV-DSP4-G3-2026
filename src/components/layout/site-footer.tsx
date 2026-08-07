import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SailingLocLogo } from "@/components/brand/sailing-loc-logo";
import { LocaleSwitcher } from "@/components/landing/locale-switcher";

export async function SiteFooter() {
  const t = await getTranslations("Pages.LandingPage");

  return (
    <footer className="bg-[#1a2b48] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <SailingLocLogo variant="light" />
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap justify-center gap-6 text-sm text-white/70"
        >
          <Link className="transition-colors hover:text-white" href="/legal">
            {t("footer_legal")}
          </Link>
          <Link
            className="transition-colors hover:text-white"
            href="/terms-of-use"
          >
            {t("footer_terms")}
          </Link>
          <Link
            className="transition-colors hover:text-white"
            href="/terms-of-sales"
          >
            {t("footer_cgv")}
          </Link>
          <Link className="transition-colors hover:text-white" href="/privacy">
            {t("footer_privacy")}
          </Link>
          <Link className="transition-colors hover:text-white" href="/cookies">
            {t("footer_cookies")}
          </Link>
        </nav>
        <LocaleSwitcher variant="dark" />
        <p className="text-center text-sm text-white/60">
          {t("footer_copyright")}
        </p>
        <p className="max-w-xl text-center text-xs text-white/40">
          {t("footer_disclaimer")}
        </p>
      </div>
    </footer>
  );
}
