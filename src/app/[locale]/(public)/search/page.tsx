import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchPageClient } from "@/components/search/search-page-client";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import type { BoatFilterBounds, BoatSearchFilters, BoatType } from "@/queries/fetchBoats";
import { Constants } from "@/lib/supabase/database.types";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages.SearchPage" });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseISODateParam(raw: string | string[] | undefined): string | null {
  return typeof raw === "string" && ISO_DATE_PATTERN.test(raw) ? raw : null;
}

const VALID_BOAT_TYPES = new Set(
  Constants.public.Enums.boat_type as readonly string[],
);

function parseBoatTypes(raw: string | string[] | undefined): BoatType[] | undefined {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const valid = values
    .map((v) => v.toUpperCase())
    .filter((v) => VALID_BOAT_TYPES.has(v)) as BoatType[];
  return valid.length > 0 ? valid : undefined;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const rawParams = await searchParams;
  setRequestLocale(locale);

  // Absent criteria stay absent. `/search` with no query string is the neutral
  // state the landing page links to, and inventing a port or a date window here
  // would filter the catalogue before the visitor asked for anything.
  const port =
    typeof rawParams.port === "string" && rawParams.port.trim()
      ? rawParams.port.trim()
      : null;

  const from = parseISODateParam(rawParams.from);
  const to = parseISODateParam(rawParams.to);

  const rawType =
    typeof rawParams.type === "string" ? rawParams.type : undefined;
  const typesFromUrl = parseBoatTypes(rawParams.types ?? rawType);

  const filters: BoatSearchFilters = {
    port,
    from,
    to,
    types: typesFromUrl,
    skipperIncluded: rawParams.skipper === "true",
    minPrice: rawParams.minPrice ? Number(rawParams.minPrice) : undefined,
    maxPrice: rawParams.maxPrice ? Number(rawParams.maxPrice) : undefined,
    minLength: rawParams.minLength ? Number(rawParams.minLength) : undefined,
    maxLength: rawParams.maxLength ? Number(rawParams.maxLength) : undefined,
    equipment:
      rawParams.equipment
        ? (Array.isArray(rawParams.equipment)
            ? rawParams.equipment
            : [rawParams.equipment]) as BoatSearchFilters["equipment"]
        : undefined,
    sortBy: (rawParams.sortBy as BoatSearchFilters["sortBy"]) ?? "relevance",
    page: rawParams.page ? Math.max(1, Number(rawParams.page)) : 1,
  };

  const supabase = await createSupabaseServerClient();

  const [portsResult, boundsResult] = await Promise.all([
    supabase.from("ports").select("name").order("name"),
    // No port means the sliders bound the whole published catalogue, which is
    // exactly what the RPC returns when the argument is omitted.
    supabase.rpc("get_boat_filter_bounds", port ? { p_port_name: port } : {}),
  ]);

  const ports = (portsResult.data ?? []).map((p) => p.name);

  const boundsRow = boundsResult.data?.[0];
  const bounds: BoatFilterBounds = {
    minPrice: boundsRow?.min_price ?? 0,
    maxPrice: boundsRow?.max_price ?? 5000,
    minLength: boundsRow?.min_length ?? 5,
    maxLength: boundsRow?.max_length ?? 30,
  };

  const searchParamsString = new URLSearchParams(
    Object.entries(rawParams).flatMap(([key, value]) =>
      value === undefined
        ? []
        : Array.isArray(value)
          ? value.map((v) => [key, v])
          : [[key, value]],
    ),
  ).toString();

  return (
    <>
      <SiteHeader />
      <SearchPageClient
        bounds={bounds}
        filters={filters}
        ports={ports}
        searchParamsString={searchParamsString}
      />
      <SiteFooter />
    </>
  );
}
