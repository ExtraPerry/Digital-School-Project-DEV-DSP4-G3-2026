import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function WireframeBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border border-neutral-400 bg-neutral-200 px-6 py-8 text-center text-sm font-medium text-neutral-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WireframePlaceholder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border border-dashed border-neutral-400 bg-neutral-100 text-xs text-neutral-500",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingWireframePage() {
  const t = useTranslations("Pages.LandingPage");

  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between bg-neutral-800 px-6 py-2 text-xs text-neutral-100">
          <span>{t("page_title")}</span>
          <span>{t("wireframe_label")}</span>
        </div>

        <header className="border-b border-neutral-300">
          <WireframeBlock className="min-h-14 border-x-0 border-t-0 bg-neutral-100 text-xs uppercase tracking-wide">
            Header / Navigation
          </WireframeBlock>

          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm font-semibold">{t("logo")}</span>
            <nav
              aria-label="Main navigation"
              className="flex items-center gap-6 text-sm"
            >
              <Link className="hover:underline" href="#">
                {t("nav_search")}
              </Link>
              <Link className="hover:underline" href="#">
                {t("nav_help")}
              </Link>
              <Button
                className="border-neutral-500 bg-neutral-700 text-white hover:bg-neutral-600"
                size="sm"
                variant="default"
              >
                {t("nav_login")}
              </Button>
            </nav>
          </div>
        </header>

        <main>
          <section
            aria-labelledby="hero-heading"
            className="border-b border-neutral-300"
          >
            <WireframeBlock className="min-h-[360px] flex-col gap-6 border-x-0">
              <h1
                className="max-w-3xl text-2xl font-semibold text-neutral-800"
                id="hero-heading"
              >
                {t("hero_heading")}
              </h1>
              <WireframePlaceholder className="h-40 w-full max-w-2xl rounded-sm">
                {t("hero_visual")}
              </WireframePlaceholder>
              <p className="max-w-2xl text-sm text-neutral-600">
                {t("hero_summary")}
              </p>
              <Button
                className="border-neutral-500 bg-neutral-700 px-6 text-white hover:bg-neutral-600"
                size="lg"
              >
                {t("hero_cta")}
              </Button>
            </WireframeBlock>
          </section>

          <section aria-labelledby="trust-heading">
            <h2 className="sr-only" id="trust-heading">
              {t("trust_banner")}
            </h2>
            <WireframeBlock className="min-h-20 border-x-0 text-xs uppercase tracking-wide">
              {t("trust_banner")}
            </WireframeBlock>
            <div className="grid grid-cols-2 gap-px bg-neutral-400 md:grid-cols-4">
              {(
                [
                  "trust_stat_boats",
                  "trust_stat_ports",
                  "trust_stat_users",
                  "trust_stat_rating",
                ] as const
              ).map((key) => (
                <WireframeBlock
                  className="min-h-16 border-0 bg-neutral-100 text-xs"
                  key={key}
                >
                  {t(key)}
                </WireframeBlock>
              ))}
            </div>
          </section>

          <section aria-labelledby="highlight-heading">
            <WireframeBlock className="min-h-48 flex-col gap-4 border-x-0">
              <h2
                className="text-base font-semibold uppercase tracking-wide"
                id="highlight-heading"
              >
                {t("highlight_title")}
              </h2>
              <p className="max-w-3xl text-sm text-neutral-600">
                {t("highlight_text")}
              </p>
            </WireframeBlock>
          </section>

          <section aria-labelledby="how-it-works-heading">
            <WireframeBlock className="min-h-56 flex-col gap-6 border-x-0">
              <div>
                <h2
                  className="text-base font-semibold uppercase tracking-wide"
                  id="how-it-works-heading"
                >
                  {t("how_it_works_title")}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {t("how_it_works_subtitle")}
                </p>
              </div>
              <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
                {(
                  [
                    {
                      title: "step_search_title",
                      text: "step_search_text",
                    },
                    {
                      title: "step_book_title",
                      text: "step_book_text",
                    },
                    {
                      title: "step_sail_title",
                      text: "step_sail_text",
                    },
                  ] as const
                ).map((step) => (
                  <WireframePlaceholder
                    className="min-h-28 flex-col gap-2 rounded-sm p-4"
                    key={step.title}
                  >
                    <span className="text-sm font-medium text-neutral-700">
                      {t(step.title)}
                    </span>
                    <span>{t(step.text)}</span>
                  </WireframePlaceholder>
                ))}
              </div>
            </WireframeBlock>
          </section>

          <section aria-labelledby="testimonials-heading">
            <WireframeBlock className="min-h-56 flex-col gap-6 border-x-0">
              <h2
                className="text-base font-semibold uppercase tracking-wide"
                id="testimonials-heading"
              >
                {t("testimonials_title")}
              </h2>
              <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                <WireframePlaceholder className="min-h-24 rounded-sm p-4">
                  {t("testimonial_1")}
                </WireframePlaceholder>
                <WireframePlaceholder className="min-h-24 rounded-sm p-4">
                  {t("testimonial_2")}
                </WireframePlaceholder>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <WireframePlaceholder
                    className="h-10 w-28 rounded-sm"
                    key={index}
                  >
                    {t("partner_logo")}
                  </WireframePlaceholder>
                ))}
              </div>
            </WireframeBlock>
          </section>
        </main>

        <footer className="border-t border-neutral-300">
          <WireframeBlock className="min-h-24 flex-col gap-3 border-x-0 border-b-0 bg-neutral-800 text-xs text-neutral-100">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap justify-center gap-4"
            >
              <span>{t("footer_legal")}</span>
              <span>{t("footer_terms")}</span>
              <span>{t("footer_privacy")}</span>
              <span>{t("footer_language")}</span>
              <span>{t("footer_social")}</span>
            </nav>
            <p className="max-w-2xl text-center text-[0.7rem] text-neutral-300">
              {t("footer_disclaimer")}
            </p>
          </WireframeBlock>
        </footer>
      </div>
    </div>
  );
}
