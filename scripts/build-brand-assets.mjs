/**
 * Derives the production brand assets from the two source logo files.
 *
 * The sources are export-quality but not render-quality:
 *   - both carry a wide transparent margin (the wordmark's ink occupies 447x118
 *     of a 600x329 canvas), so laying one out at a fixed height would shrink the
 *     visible mark to about a third of its box;
 *   - the logo exists only in navy + coral, and the site header, footer and auth
 *     panel are navy — the wordmark would disappear into its own background.
 *
 * So the script trims the margin and recolours the navy ink to white for a
 * dark-surface variant, keeping the coral sail untouched in both. The two
 * inks are far apart in luminance (navy #011F4E ≈ 28, coral #E26D5B ≈ 133), so
 * a luminance threshold separates them cleanly, anti-aliased edges included.
 *
 * Run after replacing a source file:
 *   npm run build:brand
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRAND_DIR = path.join(process.cwd(), "public", "images", "brand");
const APP_DIR = path.join(process.cwd(), "src", "app");

const SOURCE_WORDMARK = path.join(
  BRAND_DIR,
  "logo-concepts",
  "d16d1d22-3df9-4bb3-b313-060ebb480a1b_removalai_preview.png",
);
const SOURCE_MARK = path.join(BRAND_DIR, "logo.png");

/** Anything darker than this is the navy ink; the coral sail sits well above. */
const NAVY_LUMINANCE_CEILING = 80;

/** Brand navy, used as the app-icon tile so the mark reads on any browser chrome. */
const BRAND_NAVY = { r: 26, g: 43, b: 72 };

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Trims the transparent margin so the ink fills the box it is laid out in. */
function trimmed(source) {
  return sharp(source).trim({ background: TRANSPARENT, threshold: 10 });
}

/** Repaints the navy ink white and leaves every other pixel — and alpha — alone. */
async function toLightInk(pipeline) {
  const { data, info } = await pipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += info.channels) {
    if (data[index + 3] === 0) {
      continue;
    }

    const luminance =
      0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];

    if (luminance < NAVY_LUMINANCE_CEILING) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  }).png();
}

/** Centres the light-ink mark on a navy tile — the favicon and the apple icon. */
async function buildIcon(size, padding) {
  const inner = size - padding * 2;
  const mark = await (await toLightInk(trimmed(SOURCE_MARK)))
    .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...BRAND_NAVY, alpha: 1 },
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png();
}

/**
 * Packs PNG frames into an .ico container.
 *
 * `src/app/icon.png` already covers every browser through the `<link rel=icon>`
 * tag Next.js emits, but crawlers, feed readers and bookmark services still ask
 * for `/favicon.ico` by path and would get a 404. ICO has embedded PNG frames
 * since Vista, so the container is a 6-byte header plus one 16-byte directory
 * entry per frame — no encoder needed.
 */
function packIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(16 * frames.length);
  let offset = header.length + directory.length;

  frames.forEach(({ size, png }, index) => {
    const entry = index * 16;
    // 256 is encoded as 0 in a single byte; nothing here goes that large.
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2); // palette colours
    directory.writeUInt8(0, entry + 3); // reserved
    directory.writeUInt16LE(1, entry + 4); // colour planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...frames.map(({ png }) => png)]);
}

async function main() {
  await mkdir(BRAND_DIR, { recursive: true });

  //? The mark is not emitted on its own: no surface in the app uses an
  //? icon-only lockup, and the app icons below composite it straight from the
  //? source. Add an output here the day one does.
  const outputs = [
    ["logo-wordmark.png", trimmed(SOURCE_WORDMARK).png()],
    ["logo-wordmark-light.png", await toLightInk(trimmed(SOURCE_WORDMARK))],
  ];

  for (const [name, pipeline] of outputs) {
    const target = path.join(BRAND_DIR, name);
    const { width, height } = await pipeline.toFile(target);
    console.log(`✔ ${path.relative(process.cwd(), target)} (${width}x${height})`);
  }

  // Next.js picks these up from src/app by filename convention.
  const icons = [
    ["icon.png", 512, 64],
    ["apple-icon.png", 180, 20],
  ];

  for (const [name, size, padding] of icons) {
    const target = path.join(APP_DIR, name);
    await (await buildIcon(size, padding)).toFile(target);
    console.log(`✔ ${path.relative(process.cwd(), target)} (${size}x${size})`);
  }

  const icoSizes = [16, 32, 48];
  const icoFrames = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      png: await (await buildIcon(size, Math.round(size / 8)))
        .png()
        .toBuffer(),
    })),
  );
  const icoTarget = path.join(APP_DIR, "favicon.ico");
  await writeFile(icoTarget, packIco(icoFrames));
  console.log(
    `✔ ${path.relative(process.cwd(), icoTarget)} (${icoSizes.join(", ")})`,
  );
}

await main();
