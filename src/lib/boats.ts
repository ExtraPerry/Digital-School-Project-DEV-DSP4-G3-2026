import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type BoatMediaKind = Database["public"]["Enums"]["boat_media_kind"];

/**
 * CSS `object-position` used when a media row carries no focal point. Owner
 * uploads will not have one until a cropping UI exists, so centering is the
 * neutral default.
 */
export const DEFAULT_MEDIA_FOCAL_POINT = "50% 50%";

/**
 * The `public.boat_media` columns every consumer must select. Declared here so
 * the queries, the RPC projection and the components cannot drift apart.
 */
export type BoatMediaRow = {
  storage_bucket: string;
  storage_path: string;
  kind: BoatMediaKind;
  focal_point: string | null;
  alt_text: string | null;
};

/** A media row resolved to something `next/image` can render. */
export type BoatImage = {
  url: string;
  focalPoint: string;
  kind: BoatMediaKind;
  /**
   * Owner-authored alternative text. Null for the demo listings, in which case
   * the component falls back to a localized label — a single stored string
   * cannot serve both locales.
   */
  altText: string | null;
};

export type BoatImageSet = {
  cover: BoatImage | null;
  gallery: BoatImage[];
};

/**
 * Only the storage sub-client is needed, so browser, server and admin clients
 * are all accepted. `getPublicUrl` is a pure string build against the configured
 * project URL — no network call — which keeps this usable from server
 * components and from React Query alike.
 */
type StorageCapableClient = Pick<SupabaseClient<Database>, "storage">;

function toPublicUrl(
  supabase: StorageCapableClient,
  bucket: string,
  path: string,
): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function toBoatImage(
  supabase: StorageCapableClient,
  row: BoatMediaRow,
): BoatImage {
  return {
    url: toPublicUrl(supabase, row.storage_bucket, row.storage_path),
    focalPoint: row.focal_point ?? DEFAULT_MEDIA_FOCAL_POINT,
    kind: row.kind,
    altText: row.alt_text,
  };
}

/**
 * Splits an ordered `boat_media` selection into the single cover and the
 * gallery. Callers are responsible for ordering by `sort_order`; the relative
 * order of the gallery is preserved.
 *
 * Returns a null cover when the listing has no photography yet — a boat an
 * owner has just created, or a database that has not been through
 * `npm run seed:media`.
 */
export function toBoatImageSet(
  supabase: StorageCapableClient,
  rows: BoatMediaRow[],
): BoatImageSet {
  const images = rows.map((row) => toBoatImage(supabase, row));

  return {
    cover: images.find((image) => image.kind === "COVER") ?? null,
    gallery: images.filter((image) => image.kind !== "COVER"),
  };
}

/**
 * The `search_available_boats` RPC flattens the cover onto the boat row so the
 * search grid does not need a second round-trip per page. The generated types
 * cannot express nullability for a `returns table` column, so the left join's
 * nulls are narrowed here instead.
 */
export function toCoverImage(
  supabase: StorageCapableClient,
  row: {
    cover_storage_bucket: string | null;
    cover_storage_path: string | null;
    cover_focal_point: string | null;
    cover_alt_text: string | null;
  },
): BoatImage | null {
  if (!row.cover_storage_bucket || !row.cover_storage_path) {
    return null;
  }

  return toBoatImage(supabase, {
    storage_bucket: row.cover_storage_bucket,
    storage_path: row.cover_storage_path,
    kind: "COVER",
    focal_point: row.cover_focal_point,
    alt_text: row.cover_alt_text,
  });
}
