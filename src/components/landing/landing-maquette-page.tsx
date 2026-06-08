import { Playfair_Display } from "next/font/google";
import { CalendarCheck, Search, Ship, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SailingLocLogo } from "@/components/brand/sailing-loc-logo";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/landing/locale-switcher";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function TrustStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
      <span
        className={cn(
          playfair.className,
          "text-3xl font-bold text-[#1a2b48] md:text-4xl",
        )}
      >
        {value}
      </span>
      <span className="text-sm text-neutral-500">{label}</span>
    </div>
  );
}

function StepCard({
  icon: Icon,
  step,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: number;
  title: string;
  text: string;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#1a2b48]/10 text-[#1a2b48]">
          <Icon aria-hidden className="size-5" />
        </span>
        <span className="text-sm font-semibold text-[#c9866a]">
          {String(step).padStart(2, "0")}
        </span>
      </div>
      <h3
        className={cn(playfair.className, "text-xl font-semibold text-[#1a2b48]")}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-600">{text}</p>
    </article>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
}: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div aria-hidden className="flex gap-0.5 text-[#c9866a]">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star className="size-4 fill-current" key={index} />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold text-[#1a2b48]">{name}</p>
        <p className="text-xs text-neutral-500">{role}</p>
      </div>
    </article>
  );
}

export function LandingMaquettePage() {
  const t = useTranslations("Pages.LandingPage");

  const partnerKeys = [
    "partner_insurance",
    "partner_shop",
    "partner_port",
    "partner_payment",
  ] as const;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-800">
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

      <main>
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden bg-gradient-to-br from-[#1a2b48] via-[#243a5e] to-[#3d7a8a] text-white"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div className="flex flex-col gap-6">
              <p
                className={cn(
                  playfair.className,
                  "text-lg font-semibold italic text-[#e8c4b0]",
                )}
              >
                {t("hero_tagline")}
              </p>
              <h1
                className={cn(
                  playfair.className,
                  "text-3xl font-bold leading-tight md:text-4xl lg:text-5xl",
                )}
                id="hero-heading"
              >
                {t("hero_heading")}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-white/85">
                {t("hero_summary")}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  className="rounded-full bg-[#c9866a] px-6 text-white hover:bg-[#b5745a]"
                  size="lg"
                >
                  <Link href="#">{t("hero_cta")}</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full border-white/30 bg-white/10 px-6 text-white hover:bg-white/20"
                  size="lg"
                  variant="outline"
                >
                  <Link href="#">{t("hero_cta_owner")}</Link>
                </Button>
              </div>
            </div>

            <div
              aria-label={t("hero_image_alt")}
              className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-[#4a90a4]/40 to-[#c9866a]/30 shadow-2xl md:min-h-80"
              role="img"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15),transparent_60%)]" />
              <Ship
                aria-hidden
                className="size-32 text-white/25 md:size-40"
                strokeWidth={1}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="trust-heading">
          <h2 className="sr-only" id="trust-heading">
            {t("trust_boats_label")}
          </h2>
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-neutral-100 md:grid-cols-4">
              <TrustStat
                label={t("trust_boats_label")}
                value={t("trust_boats_value")}
              />
              <TrustStat
                label={t("trust_ports_label")}
                value={t("trust_ports_value")}
              />
              <TrustStat
                label={t("trust_users_label")}
                value={t("trust_users_value")}
              />
              <TrustStat
                label={t("trust_rating_label")}
                value={t("trust_rating_value")}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="highlight-heading"
          className="px-6 py-16 md:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div className="flex flex-col gap-4">
              <h2
                className={cn(
                  playfair.className,
                  "text-3xl font-bold text-[#1a2b48] md:text-4xl",
                )}
                id="highlight-heading"
              >
                {t("highlight_title")}
              </h2>
              <p className="leading-relaxed text-neutral-600">
                {t("highlight_text")}
              </p>
            </div>
            <div className="grid gap-4">
              <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-[#1a2b48]">
                  {t("highlight_owner_title")}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {t("highlight_owner_text")}
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-[#1a2b48]">
                  {t("highlight_renter_title")}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {t("highlight_renter_text")}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="how-it-works-heading"
          className="bg-white px-6 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2
                className={cn(
                  playfair.className,
                  "text-3xl font-bold text-[#1a2b48] md:text-4xl",
                )}
                id="how-it-works-heading"
              >
                {t("how_it_works_title")}
              </h2>
              <p className="mt-2 text-neutral-500">{t("how_it_works_subtitle")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                icon={Search}
                step={1}
                text={t("step_search_text")}
                title={t("step_search_title")}
              />
              <StepCard
                icon={CalendarCheck}
                step={2}
                text={t("step_book_text")}
                title={t("step_book_title")}
              />
              <StepCard
                icon={Ship}
                step={3}
                text={t("step_sail_text")}
                title={t("step_sail_title")}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="testimonials-heading"
          className="px-6 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              className={cn(
                playfair.className,
                "mb-10 text-center text-3xl font-bold text-[#1a2b48] md:text-4xl",
              )}
              id="testimonials-heading"
            >
              {t("testimonials_title")}
            </h2>
            <div className="mb-12 grid gap-6 md:grid-cols-2">
              <TestimonialCard
                name={t("testimonial_1_name")}
                quote={t("testimonial_1_quote")}
                role={t("testimonial_1_role")}
              />
              <TestimonialCard
                name={t("testimonial_2_name")}
                quote={t("testimonial_2_quote")}
                role={t("testimonial_2_role")}
              />
            </div>
            <div className="text-center">
              <p className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-400">
                {t("partners_title")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {partnerKeys.map((key) => (
                  <span
                    className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-500 shadow-sm"
                    key={key}
                  >
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1a2b48] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
          <SailingLocLogo variant="light" />
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center gap-6 text-sm text-white/70"
          >
            <Link className="transition-colors hover:text-white" href="#">
              {t("footer_legal")}
            </Link>
            <Link className="transition-colors hover:text-white" href="#">
              {t("footer_terms")}
            </Link>
            <Link className="transition-colors hover:text-white" href="#">
              {t("footer_privacy")}
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
    </div>
  );
}
