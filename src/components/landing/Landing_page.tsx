import { Playfair_Display } from "next/font/google";
import { CalendarCheck, Search, Ship, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroSearchBar } from "@/components/landing/hero-search-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { BOAT_TYPE_GRADIENTS } from "@/lib/boats";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

// --- Sub-components ---

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

function BoatCard({
  badge,
  gradient,
  href,
  locale,
  location,
  name,
  price,
  rating,
  size,
  typeLabel,
  unitLabel,
}: {
  badge?: string;
  gradient: string;
  href: string;
  locale: string;
  location: string;
  name: string;
  price: string;
  rating: number;
  size: number;
  typeLabel: string;
  unitLabel: string;
}) {
  return (
    <Link
      className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      href={href}
    >
      <article>
        <div
          className={cn(
            "flex h-40 items-start bg-gradient-to-br p-3",
            gradient,
          )}
        >
          {badge ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1a2b48] shadow-sm">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#1a2b48]">{name}</span>
            <span className="flex items-center gap-1 text-sm font-medium text-[#1a2b48]">
              <Star aria-hidden className="size-3.5 fill-[#c9866a] text-[#c9866a]" />
              {rating.toLocaleString(locale)}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            {typeLabel} · {size.toLocaleString(locale)} m · {location}
          </p>
          <p className="mt-1">
            <span className="text-lg font-bold text-[#1a2b48]">{price}</span>
            <span className="text-sm text-neutral-500"> / {unitLabel}</span>
          </p>
        </div>
      </article>
    </Link>
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

export async function LandingPage() {
  const t = await getTranslations("Pages.LandingPage");
  const locale = await getLocale();
  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const supabase = await createSupabaseServerClient();
  const { data: ports } = await supabase
    .from("ports")
    .select("name")
    .order("name");

  const { data: boats } = await supabase
    .from("boats")
    .select("id, name, type, length_m, price_per_day, rating, badge, ports(name)")
    .order("rating", { ascending: false })
    .limit(4);

  const partnerKeys = [
    "partner_insurance",
    "partner_shop",
    "partner_port",
    "partner_payment",
  ] as const;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-800">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden bg-gradient-to-br from-[#1a2b48] via-[#243a5e] to-[#3d7a8a] text-white"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
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
              </div>
            </div>
            <div className="pt-8">
              <HeroSearchBar ports={(ports ?? []).map((port) => port.name)} />
            </div>
          </div>
        </section>

        {/* Trust stats */}
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

        {/* Boat proposition */}
        <section
          aria-labelledby="boat-proposition-heading"
          className="px-6 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2
                className={cn(
                  playfair.className,
                  "text-3xl font-bold text-[#1a2b48] md:text-4xl",
                )}
                id="boat-proposition-heading"
              >
                {t("featured_boats_title")}
              </h2>
              <Link
                className="shrink-0 text-sm font-semibold text-[#1a2b48] transition-colors hover:text-[#D68A6E]"
                href="/search"
              >
                {t("featured_boats_cta")} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(boats ?? []).map((boat) => (
                <BoatCard
                  badge={boat.badge ? t(`featured_badge_${boat.badge}`) : undefined}
                  gradient={BOAT_TYPE_GRADIENTS[boat.type]}
                  href={`/boats/${boat.id}`}
                  key={boat.id}
                  locale={locale}
                  location={boat.ports?.name ?? ""}
                  name={boat.name}
                  price={priceFormatter.format(boat.price_per_day)}
                  rating={boat.rating}
                  size={boat.length_m}
                  typeLabel={t(`search_type_${boat.type.toLowerCase()}`)}
                  unitLabel={t("featured_boats_price_unit")}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Value proposition */}
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

        {/* How it works */}
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

        {/* Testimonials & partners */}
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

      <SiteFooter />
    </div>
  );
}
