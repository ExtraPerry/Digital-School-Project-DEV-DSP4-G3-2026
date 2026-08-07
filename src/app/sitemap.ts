import type { MetadataRoute } from "next";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.SITE_URL || "https://sailingloc.com";

const STATIC_ROUTES = ["", "/search", "/legal", "/terms", "/privacy", "/cookies"];

function buildAlternates(
  path: string
): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_ROUTES.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
      alternates: { languages: buildAlternates(route) },
    }))
  );

  const supabase = await createSupabaseServerClient();
  const { data: publishedBoats } = await supabase
    .from("boats")
    .select("id, updated_at")
    .eq("is_published", true);

  const boatEntries = (publishedBoats ?? []).flatMap((boat) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/boats/${boat.id}`,
      lastModified: new Date(boat.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages: buildAlternates(`/boats/${boat.id}`) },
    }))
  );

  return [...staticEntries, ...boatEntries];
}
