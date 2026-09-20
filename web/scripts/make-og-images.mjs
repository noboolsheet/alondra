// Generates the Open Graph preview images (1200x630) served as og:image.
//
// Run with `npm run og`. The output is COMMITTED to public/images/og/ on purpose:
// the text is drawn with a system serif (Georgia), so generating it during a
// deploy would render a different face on a Linux build machine. Treat these as
// brand assets that are regenerated deliberately, not build output.
//
// Why they matter: nearly all of Alondra's acquisition happens by pasting links
// into Nextdoor, WhatsApp and Facebook. Without og:image those links preview as
// a bare rectangle of text.

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(IMAGES, "og");

const W = 1200;
const H = 630;

// Brand palette (src/index.css)
const VIOLETA = "#211030";
const DORADO = "#FFB133";
const BLANCO = "#F5EFFB";

const COPY = {
  en: { headline: "In-home music lessons", sub: "Miami-Dade &amp; Broward", tag: "Connection that inspires. Progress you can hear." },
  es: { headline: "Clases de música a domicilio", sub: "Miami-Dade &amp; Broward", tag: "Conexión que inspira. Progreso que se escucha." },
  fr: { headline: "Cours de musique à domicile", sub: "Miami-Dade &amp; Broward", tag: "Une connexion qui inspire. Des progrès qui s'entendent." },
};

/** Purple scrim: opaque on the left where the text sits, transparent on the right. */
const scrim = () => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%"   stop-color="${VIOLETA}" stop-opacity="0.97"/>
         <stop offset="55%"  stop-color="${VIOLETA}" stop-opacity="0.90"/>
         <stop offset="100%" stop-color="${VIOLETA}" stop-opacity="0.55"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`,
);

const textLayer = ({ headline, sub, tag }) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <text x="82" y="366" font-family="Georgia, serif" font-size="58" fill="${BLANCO}">${headline}</text>
     <text x="82" y="428" font-family="Georgia, serif" font-size="58" fill="${DORADO}">${sub}</text>
     <text x="84" y="500" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${BLANCO}" opacity="0.72">${tag}</text>
     <rect x="82" y="536" width="86" height="4" rx="2" fill="${DORADO}"/>
   </svg>`,
);

const build = async (lang) => {
  const background = await sharp(path.join(IMAGES, "hero-img.webp"))
    .resize(W, H, { fit: "cover", position: "center" })
    .toBuffer();

  const bird = await sharp(path.join(IMAGES, "logo-minimal.webp")).resize(104, 104).toBuffer();
  const wordmark = await sharp(path.join(IMAGES, "alondra-nombre.webp"))
    .resize({ width: 300 })
    .toBuffer();

  const out = path.join(OUT_DIR, `og-${lang}.jpg`);
  await sharp(background)
    .composite([
      { input: scrim(), top: 0, left: 0 },
      { input: bird, top: 78, left: 82 },
      { input: wordmark, top: 96, left: 208 },
      { input: textLayer(COPY[lang]), top: 0, left: 0 },
    ])
    // JPEG, not PNG: WhatsApp and some crawlers cap preview images around 300 KB,
    // and a photo compresses far better as JPEG.
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);

  const { size } = await fs.stat(out);
  console.log(`  og-${lang}.jpg  ${(size / 1024).toFixed(0)} KB`);
};

await fs.mkdir(OUT_DIR, { recursive: true });
console.log("Generating Open Graph images…");
for (const lang of Object.keys(COPY)) await build(lang);
console.log("Done. Remember to commit public/images/og/.");
