// Image optimization pipeline for Alondra.
//
// Drop original images (any size/format) into `imagen-sources/` and this script
// writes web-optimized `.webp` copies into `public/images/`, preserving the
// relative folder structure. Reference them in the site as `/images/<name>.webp`.
//
//   npm run images         one incremental pass (only new/changed files)
//   npm run images:watch   stay running and optimize each file as it's added
//   (runs automatically before `npm run build` via the `prebuild` script)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import heicConvert from "heic-convert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
// Los originales viven FUERA del repo (pesaban 55 MB): en ../../_assets/alondra/imagenes/.
// IMAGES_SRC_DIR permite apuntar ahí sin volver a meterlos en git; si no se pasa,
// se usa la carpeta local (útil para soltar cuatro imágenes sueltas y probar).
const SRC_DIR = process.env.IMAGES_SRC_DIR
  ? path.resolve(ROOT, process.env.IMAGES_SRC_DIR)
  : path.join(ROOT, "imagen-sources");
const OUT_DIR = path.join(ROOT, "public", "images");

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);
const HEIC_EXTS = new Set([".heic", ".heif"]);
// Output size is matched to how large each image actually renders. Serving a
// 2400px file into a 48px slot costs the visitor bandwidth for pixels no screen
// will ever show, and it lands on the header of every page.
//
// Widths are generous enough for a 3x display; `withoutEnlargement` means a
// smaller source is never upscaled.
const PROFILES = [
  // Header/footer marks: the bird renders at 44-48px, the wordmark ~28px tall.
  { match: /^(logo-minimal|alondra-nombre)\./i, maxWidth: 320, quality: 88, label: "logo" },
  // Carousel thumbnails render 4-up at roughly 300px wide.
  { match: /^Estudiante_\d+\./i, maxWidth: 1100, quality: 74, label: "thumb" },
  // Full-bleed hero background.
  { match: /^hero-/i, maxWidth: 1920, quality: 78, label: "hero" },
];
const DEFAULT_PROFILE = { maxWidth: 1600, quality: 80, label: "default" };

const profileFor = (srcPath) => {
  const base = path.basename(srcPath);
  return PROFILES.find((p) => p.match.test(base)) ?? DEFAULT_PROFILE;
};

const isImage = (file) => INPUT_EXTS.has(path.extname(file).toLowerCase());

const outputPathFor = (srcPath) => {
  const rel = path.relative(SRC_DIR, srcPath);
  const relWebp = rel.replace(/\.[^.]+$/, ".webp");
  return path.join(OUT_DIR, relWebp);
};

// Skip when the optimized copy already exists and is newer than the source.
const isUpToDate = async (srcPath, outPath) => {
  try {
    const [src, out] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
    return out.mtimeMs >= src.mtimeMs;
  } catch {
    return false;
  }
};

const optimize = async (srcPath, { force = false } = {}) => {
  const outPath = outputPathFor(srcPath);
  const relLabel = path.relative(ROOT, srcPath);

  if (!force && (await isUpToDate(srcPath, outPath))) {
    console.log(`  skip   ${relLabel} (up to date)`);
    return;
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  // sharp's bundled libheif can't reliably decode iPhone HEIC on all platforms, so
  // for .heic/.heif we first decode to a JPEG buffer with the pure-JS heic-convert.
  let input = srcPath;
  if (HEIC_EXTS.has(path.extname(srcPath).toLowerCase())) {
    const raw = await fs.readFile(srcPath);
    input = Buffer.from(await heicConvert({ buffer: raw, format: "JPEG", quality: 0.92 }));
  }

  const { maxWidth, quality, label } = profileFor(srcPath);

  // `unlimited` lifts libheif/pixel safety caps so large photos decode;
  // `rotate()` (no args) auto-orients from EXIF so phone photos aren't sideways.
  await sharp(input, { unlimited: true })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);

  console.log(`  ✓ ${relLabel}  →  ${path.relative(ROOT, outPath)}  [${label} ${maxWidth}px]`);
};

// Recursively collect image files under a directory.
const walk = async (dir) => {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && isImage(entry.name)) files.push(full);
  }
  return files;
};

// `--force` re-encodes everything, ignoring mtimes. Needed after changing a size
// profile above, since the existing outputs still look up to date.
const FORCE = process.argv.includes("--force");

const runOnce = async () => {
  await fs.mkdir(SRC_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await walk(SRC_DIR);
  if (files.length === 0) {
    console.log(`No images found in ${path.relative(ROOT, SRC_DIR)}/ — nothing to optimize.`);
    return;
  }
  console.log(`Optimizing ${files.length} image(s) from ${path.relative(ROOT, SRC_DIR)}/ …`);
  for (const file of files) {
    try {
      await optimize(file, { force: FORCE });
    } catch (err) {
      console.error(`  ✗ ${path.relative(ROOT, file)}: ${err.message}`);
    }
  }
  console.log("Done.");
};

const runWatch = async () => {
  await runOnce();
  const { watch } = await import("chokidar");
  console.log(`\nWatching ${path.relative(ROOT, SRC_DIR)}/ for changes… (Ctrl+C to stop)`);

  const watcher = watch(SRC_DIR, { ignoreInitial: true, awaitWriteFinish: true });
  const handle = (file) => {
    if (!isImage(file)) return;
    optimize(file, { force: true }).catch((err) =>
      console.error(`  ✗ ${path.relative(ROOT, file)}: ${err.message}`),
    );
  };
  watcher.on("add", handle).on("change", handle);

  watcher.on("unlink", async (file) => {
    if (!isImage(file)) return;
    const outPath = outputPathFor(file);
    try {
      await fs.unlink(outPath);
      console.log(`  removed ${path.relative(ROOT, outPath)}`);
    } catch {
      /* nothing to remove */
    }
  });
};

const main = process.argv.includes("--watch") ? runWatch : runOnce;
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
