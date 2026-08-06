/**
 * Boat media fixture loader — `npm run seed:media`.
 *
 * Boat photography is data, not app chrome: it belongs to the listing its owner
 * created, so it lives in the `boat-images` Storage bucket and is described by
 * `public.boat_media`. SQL seeds cannot carry binary payloads, which is why this
 * one fixture is loaded by a script instead of a `supabase/seeds/*.sql` file.
 *
 * `supabase/seeds/assets/boat-images/media.json` is the single source of truth:
 * it declares, per boat, which file is the cover, what each gallery shot shows,
 * and how the cover must be framed. This script uploads the files and makes
 * `boat_media` match that manifest exactly — rows describing objects the
 * manifest no longer lists are removed, so re-running it never leaves orphans.
 *
 * It is idempotent and environment-agnostic: it writes to whatever project
 * NEXT_PUBLIC_SUPABASE_URL points at, so the same command seeds the local stack
 * and a hosted project. It needs the service-role key because it writes rows
 * that owner-scoped RLS policies would otherwise reject.
 *
 * Usage:
 *   npm run seed:media                       # uses .env
 *   node --env-file=.env.local scripts/seed-boat-media.mjs
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_ROOT = join(PROJECT_ROOT, "supabase", "seeds", "assets", "boat-images");
const MANIFEST_PATH = join(ASSET_ROOT, "media.json");

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill it in ` +
        "(local values come from `npx supabase status`).",
    );
  }
  return value;
}

/**
 * Reads and validates the manifest. Failing loudly here beats writing a
 * half-correct gallery that only shows up as a broken image in the browser.
 */
async function readManifest() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));

  if (!manifest.bucket || !Array.isArray(manifest.boats)) {
    throw new Error(`${MANIFEST_PATH} must declare "bucket" and "boats".`);
  }

  for (const boat of manifest.boats) {
    if (!boat.boatId || !Array.isArray(boat.media) || boat.media.length === 0) {
      throw new Error(
        `${MANIFEST_PATH}: every entry needs a "boatId" and a non-empty "media" list.`,
      );
    }

    const covers = boat.media.filter((item) => item.kind === "COVER");
    if (covers.length !== 1) {
      throw new Error(
        `${MANIFEST_PATH}: boat ${boat.boatId} declares ${covers.length} COVER ` +
          "entries — the schema allows exactly one.",
      );
    }
  }

  return manifest;
}

/**
 * The manifest names files, not paths. The storage layout is the convention the
 * bucket policies rely on (`boat-images/{boat_id}/...`), so it is derived here
 * rather than repeated 40 times in the manifest.
 */
function toStoragePath(boatId, file) {
  return `${boatId}/${file}`;
}

async function uploadFile(supabase, bucket, boatId, file) {
  const localPath = join(ASSET_ROOT, boatId, file);
  const body = await readFile(localPath);
  const contentType = CONTENT_TYPES[extname(file).toLowerCase()];

  if (!contentType) {
    throw new Error(`Unsupported image extension for ${localPath}.`);
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(toStoragePath(boatId, file), body, { contentType, upsert: true });

  if (error) {
    throw new Error(`Failed to upload ${boatId}/${file}: ${error.message}`);
  }
}

/**
 * Drops rows pointing at objects the manifest no longer declares. This runs
 * before the upsert because `boat_media_one_cover_per_boat_idx` allows a single
 * cover per boat: a leftover row from an earlier layout would collide with the
 * new one instead of being replaced.
 */
async function pruneStaleRows(supabase, boatId, keptPaths) {
  // PostgREST parses `in.(...)` as a comma-separated list, so each path is
  // quoted: storage paths contain `/` and `.` and a bare list would be
  // ambiguous the moment a filename ever contains a comma.
  const inList = keptPaths.map((path) => `"${path}"`).join(",");

  const { data, error } = await supabase
    .from("boat_media")
    .delete()
    .eq("boat_id", boatId)
    .not("storage_path", "in", `(${inList})`)
    .select("storage_path");

  if (error) {
    throw new Error(`Failed to prune media rows for ${boatId}: ${error.message}`);
  }

  return data ?? [];
}

async function upsertRows(supabase, bucket, boat) {
  const rows = boat.media.map((item) => ({
    boat_id: boat.boatId,
    storage_bucket: bucket,
    storage_path: toStoragePath(boat.boatId, item.file),
    kind: item.kind,
    sort_order: item.sortOrder,
    is_cover: item.kind === "COVER",
    focal_point: item.focalPoint ?? null,
  }));

  // alt_text is deliberately absent: PostgREST only updates the columns it is
  // given, so re-running the loader never overwrites text an owner wrote. The
  // demo listings leave it null and the UI falls back to a localized label.
  const { error } = await supabase
    .from("boat_media")
    .upsert(rows, { onConflict: "boat_id,storage_path" });

  if (error) {
    throw new Error(`Failed to upsert media for ${boat.boatId}: ${error.message}`);
  }

  return rows.length;
}

/**
 * Guards against the manifest and the asset tree drifting apart — a directory
 * added without a manifest entry would silently never be published.
 */
async function warnAboutUndeclaredDirectories(manifest) {
  const entries = await readdir(ASSET_ROOT, { withFileTypes: true });
  const declared = new Set(manifest.boats.map((boat) => boat.boatId));
  const undeclared = entries
    .filter((entry) => entry.isDirectory() && !declared.has(entry.name))
    .map((entry) => entry.name);

  for (const boatId of undeclared) {
    console.warn(
      `  ! ${boatId} has image files but no media.json entry — skipped.`,
    );
  }
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("NEXT_PRIVATE_SUPABASE_ADMIN_KEY");

  const manifest = await readManifest();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log(`Seeding boat media into ${supabaseUrl}`);

  let uploaded = 0;
  let rows = 0;
  let pruned = 0;

  for (const boat of manifest.boats) {
    const keptPaths = boat.media.map((item) =>
      toStoragePath(boat.boatId, item.file),
    );

    for (const item of boat.media) {
      await uploadFile(supabase, manifest.bucket, boat.boatId, item.file);
      uploaded += 1;
    }

    const removed = await pruneStaleRows(supabase, boat.boatId, keptPaths);
    pruned += removed.length;

    rows += await upsertRows(supabase, manifest.bucket, boat);

    console.log(`  ✓ ${boat.boatId} — ${boat.media.length} image(s)`);
  }

  await warnAboutUndeclaredDirectories(manifest);

  console.log(
    `Done: ${uploaded} object(s) uploaded, ${rows} boat_media row(s) written` +
      (pruned > 0 ? `, ${pruned} stale row(s) removed.` : "."),
  );
}

main().catch((error) => {
  console.error(`\nboat media seeding failed: ${error.message}`);
  process.exitCode = 1;
});
