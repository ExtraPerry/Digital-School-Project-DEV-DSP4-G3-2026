import { Playfair_Display } from "next/font/google";
import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BoatGallery, type BoatGalleryImage } from "@/components/boats/boat-gallery";
import { BoatReviewPanel } from "@/components/boats/boat-review-panel";
import { BookingCalendar } from "@/components/boats/booking-calendar";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { BoatMediaKind, toBoatImageSet } from "@/lib/boats";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

async function getBoat(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: boat } = await supabase
    .from("boats")
    .select(
      "id, name, type, length_m, width_m, draft_m, capacity, motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description, ports(name), boat_media(storage_bucket, storage_path, kind, focal_point, alt_text)",
    )
    .eq("id", id)
    // The hero reads the cover and the strip below it reads the rest, so the
    // gallery has to arrive in the order the owner set.
    .order("sort_order", { referencedTable: "boat_media", ascending: true })
    .maybeSingle();

  if (!boat) {
    return null;
  }

  // Resolving the Storage URLs here keeps the Supabase client in the data layer
  // and hands the page something it can render directly.
  return { ...boat, images: toBoatImageSet(supabase, boat.boat_media) };
}

async function getBoatReviews(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: reviews } = await supabase
    .from("boat_reviews")
    .select("id, author_name, rating, comment")
    .eq("boat_id", id)
    .order("created_at", { ascending: false });

  return reviews ?? [];
}

/**
 * The review panel needs to know whether there is a session before it can say
 * anything useful, and the client-side current-user query rejects for a visitor
 * — it would only settle after its retries. Reading the session here keeps the
 * panel correct from the first paint.
 */
async function getIsAuthenticated() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.BoatPage" });
  const boat = await getBoat(id);

  if (!boat) {
    return { title: t("not_found_title") };
  }

  return {
    title: t("meta_title", { name: boat.name }),
    description: t("meta_description", {
      name: boat.name,
      type: boat.type.toLowerCase(),
      location: boat.ports?.name ?? "",
    }),
  };
}

export default async function BoatPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Pages.BoatPage");
  const tLanding = await getTranslations("Pages.LandingPage");
  const boat = await getBoat(id);

  if (!boat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f8fa] px-6 text-center text-neutral-800">
        <h1 className="text-2xl font-bold text-[#1a2b48]">
          {t("not_found_title")}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-neutral-600">
          {t("not_found_text")}
        </p>
        <Link
          className="rounded-md bg-[#D68A6E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#c57d5f]"
          href="/"
        >
          {t("not_found_link")}
        </Link>
      </div>
    );
  }

  const [reviews, isAuthenticated] = await Promise.all([
    getBoatReviews(id),
    getIsAuthenticated(),
  ]);

  const typeLabel = tLanding(`search_type_${boat.type.toLowerCase()}`);
  const badgeLabel = boat.badge
    ? tLanding(`featured_badge_${boat.badge}`)
    : null;
  const location = boat.ports?.name ?? "";
  const boatImageAlt = t("boat_image_alt", {
    name: boat.name,
    type: typeLabel,
    location,
  });
  // Demo listings store no alt_text, so each shot falls back to a localized
  // label chosen by its kind. Owner-written alt text wins when present.
  const mediaAlts: Record<BoatMediaKind, string> = {
    COVER: boatImageAlt,
    COCKPIT: t("gallery_cockpit_alt", { name: boat.name }),
    INTERIOR: t("gallery_interior_alt", { name: boat.name }),
    ONBOARD: t("gallery_onboard_alt", { name: boat.name }),
    EXTERIOR: t("gallery_exterior_alt", { name: boat.name }),
  };
  // The gallery is one browsable set: the cover leads, the other shots follow
  // in the order the owner gave them. Alternative text is resolved here so the
  // client component never needs the translations.
  const galleryImages: BoatGalleryImage[] = [
    ...(boat.images.cover ? [boat.images.cover] : []),
    ...boat.images.gallery,
  ].map((image) => ({
    ...image,
    alt: image.altText ?? mediaAlts[image.kind],
  }));

  const characteristics = [
    { label: t("type_label"), value: typeLabel },
    {
      label: t("length_label"),
      value: t("length_value", { length: boat.length_m.toLocaleString(locale) }),
    },
    {
      label: t("width_label"),
      value: t("length_value", { length: boat.width_m.toLocaleString(locale) }),
    },
    {
      label: t("draft_label"),
      value: t("length_value", { length: boat.draft_m.toLocaleString(locale) }),
    },
    { label: t("motorization_label"), value: boat.motorization ?? "—" },
    { label: t("skipper_label"), value: t(`skipper_${boat.skipper_option}`) },
    {
      label: t("capacity_label"),
      value: t("capacity_value", { count: boat.capacity }),
    },
    { label: t("location_label"), value: location },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-800">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-neutral-500">
        <Link className="hover:text-[#1a2b48]" href="/">
          {t("breadcrumb_home")}
        </Link>
        <span className="mx-2">›</span>
        <span>{location}</span>
        <span className="mx-2">›</span>
        <span className="font-medium text-[#1a2b48]">
          {t("breadcrumb_current", {
            type: typeLabel,
            name: boat.name,
            length: boat.length_m.toLocaleString(locale),
          })}
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-3 lg:items-start">
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-2">
            <BoatGallery badgeLabel={badgeLabel} images={galleryImages} />

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2
                className={cn(
                  playfair.className,
                  "mb-4 text-xl font-semibold text-[#1a2b48]",
                )}
              >
                {t("characteristics_heading")}
              </h2>
              <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {characteristics.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-semibold text-[#1a2b48]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {boat.description ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2
                  className={cn(
                    playfair.className,
                    "mb-3 text-xl font-semibold text-[#1a2b48]",
                  )}
                >
                  {t("description_heading")}
                </h2>
                <p className="leading-relaxed text-neutral-600">
                  {boat.description}
                </p>
              </div>
            ) : null}

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2
                className={cn(
                  playfair.className,
                  "mb-4 text-xl font-semibold text-[#1a2b48]",
                )}
              >
                {t("reviews_heading", { count: reviews.length })}
              </h2>
              <div className="flex flex-col gap-5">
                {reviews.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {t("reviews_empty")}
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#1a2b48]">
                          {review.author_name}
                        </span>
                        <div
                          aria-label={t("review_rating_value", {
                            rating: review.rating.toLocaleString(locale),
                          })}
                          className="flex gap-0.5 text-[#c9866a]"
                          role="img"
                        >
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              aria-hidden
                              className={cn(
                                "size-3.5",
                                index < Math.round(review.rating)
                                  ? "fill-current"
                                  : "fill-none",
                              )}
                              key={index}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  ))
                )}

                <BoatReviewPanel
                  boatId={boat.id}
                  boatName={boat.name}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1">
                <h1
                  className={cn(
                    playfair.className,
                    "text-2xl font-bold text-[#1a2b48]",
                  )}
                >
                  {boat.name}
                </h1>
                <p className="text-sm text-neutral-500">
                  {typeLabel} · {t("length_value", { length: boat.length_m.toLocaleString(locale) })} ·{" "}
                  {location}
                </p>
                <p className="flex items-center gap-1 text-sm font-medium text-[#1a2b48]">
                  <Star
                    aria-hidden
                    className="size-3.5 fill-[#c9866a] text-[#c9866a]"
                  />
                  {boat.rating.toLocaleString(locale)}
                  <span className="text-neutral-500">
                    {t("rating_count", { count: reviews.length })}
                  </span>
                </p>
              </div>

              <BookingCalendar
                boatId={boat.id}
                depositAmount={boat.deposit_amount}
                locale={locale}
                pricePerDay={boat.price_per_day}
              />
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
