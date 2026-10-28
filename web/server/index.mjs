// Self-hosted Node/Express server for Alondra.
//   • Serves the built SPA (dist/) in production.
//   • POST /api/send-contact      — emails the contact form.
//   • POST /api/send-application  — emails the job application, with the CV attached.
// Both send via Gmail SMTP (nodemailer). Secrets live in a local .env (git-ignored)
// or the host's environment:
//   GMAIL_USER          Gmail address that authenticates SMTP (also the sender)
//   GMAIL_APP_PASSWORD  Gmail app password (16 chars, no spaces; needs 2FA enabled)
//   CONTACT_TO          inbox that receives the messages (defaults to GMAIL_USER)
//   PORT                server port (default 3001)
//   CANONICAL_HOST      public hostname to redirect to (default alondrama.com)
import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "..", "dist");
const PORT = process.env.PORT || 3001;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// CV upload → parsed into memory, then attached to the email.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error("INVALID_FILE_TYPE"));
  },
});

const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return { transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }), user };
};

// Shared: validate transport config, send, and answer the request.
const sendFormEmail = async (res, { subject, heading, name, email, rows, attachments = [] }) => {
  const t = getTransporter();
  if (!t) {
    console.error("Missing GMAIL_USER / GMAIL_APP_PASSWORD env vars");
    return res.status(500).json({ ok: false, error: "Server not configured" });
  }
  try {
    await t.transporter.sendMail({
      from: `"Alondra Web" <${t.user}>`,
      to: process.env.CONTACT_TO || t.user,
      replyTo: `"${name}" <${email}>`,
      subject,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<h2>${heading}</h2><table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="color:#666;vertical-align:top"><strong>${k}</strong></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}</table>`,
      attachments,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("sendMail failed:", err);
    return res.status(500).json({ ok: false, error: "Failed to send" });
  }
};

const app = express();

// --- Un solo host público --------------------------------------------------
// El túnel enruta alondrama.com Y www.alondrama.com al mismo contenedor, así que
// las cuatro variantes (http/https × apex/www) respondían 200 con la misma
// página. Search Console lo confirmó: 24 URLs marcadas como duplicadas y casi
// todas son variantes de host, más dos páginas canónicas para las que Google
// eligió otra versión por su cuenta.
//
// El `canonical` que escribe usePageMeta las agrupa, pero sólo después de que
// Google ejecute el JavaScript y decida hacernos caso — y en esos dos casos no
// nos lo hizo. Un 301 resuelve la ambigüedad en la primera petición, sin
// depender del renderizado ni de la buena voluntad del buscador.
//
// Dos cautelas deliberadas:
//   • Sólo actúa sobre el dominio público. localhost, la IP de la LAN y el
//     preview de Tailscale (*.ts.net) se quedan como están, o se rompe tanto el
//     desarrollo como la demo con el cliente.
//   • Sólo GET y HEAD. Un 301 sobre un POST hace que el navegador lo reenvíe
//     como GET y pierda el cuerpo: los formularios dejarían de funcionar.
const CANONICAL_HOST = process.env.CANONICAL_HOST || "alondrama.com";

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const host = String(req.headers.host || "").toLowerCase().split(":")[0];
  if (host !== CANONICAL_HOST && host !== `www.${CANONICAL_HOST}`) return next();

  // Detrás del túnel el conector habla http con el contenedor; el esquema que
  // usó el visitante llega en x-forwarded-proto. Si no hay cabecera, asumimos
  // https para no redirigir en bucle a quien ya venía bien.
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  if (host === CANONICAL_HOST && proto === "https") return next();

  return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
});

app.use(express.json({ limit: "32kb" }));

// --- Contact form → email -------------------------------------------------
app.post("/api/send-contact", async (req, res) => {
  const { name = "", email = "", phone = "", city = "", message = "", company = "" } = req.body ?? {};
  if (String(company).trim() !== "") return res.json({ ok: true }); // honeypot
  if (!name.trim() || !email.trim() || !phone.trim() || !city.trim() || !message.trim()) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ ok: false, error: "Invalid email" });

  return sendFormEmail(res, {
    subject: `Nuevo mensaje de contacto — ${name}`,
    heading: "Nuevo mensaje de contacto",
    name,
    email,
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["City", city],
      ["Message", message],
    ],
  });
});

// --- Job application → email (with CV attachment) -------------------------
app.post("/api/send-application", upload.single("cv"), async (req, res) => {
  const { name = "", email = "", phone = "", role = "", message = "", company = "" } = req.body ?? {};
  if (String(company).trim() !== "") return res.json({ ok: true }); // honeypot
  if (!name.trim() || !email.trim() || !phone.trim() || !role.trim() || !message.trim()) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ ok: false, error: "Invalid email" });

  const attachments = req.file
    ? [{ filename: req.file.originalname, content: req.file.buffer, contentType: req.file.mimetype }]
    : [];

  return sendFormEmail(res, {
    subject: `Nueva candidatura — ${name}`,
    heading: "Nueva candidatura",
    name,
    email,
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Role", role],
      ["Message", message],
      ["CV", req.file ? req.file.originalname : "—"],
    ],
    attachments,
  });
});

// Upload errors (wrong type / too large) → clear 400 for the client.
app.use((err, _req, res, next) => {
  if (!err) return next();
  const error =
    err.message === "INVALID_FILE_TYPE" ? "invalid_type" : err.code === "LIMIT_FILE_SIZE" ? "too_large" : "error";
  console.error("Upload error:", err.message);
  return res.status(400).json({ ok: false, error });
});

// --- Permanent redirects from the pre-SEO URLs -----------------------------
// These paths shipped publicly before the slugs were localized, so they may sit
// in Google's index, in Nextdoor posts and in WhatsApp threads. A 301 here (not
// a client-side redirect) is what passes the accumulated ranking to the new URL.
// Keep in sync with LEGACY_REDIRECTS in src/i18n/routes.ts. Never drop a row.
const LEGACY_REDIRECTS = {
  "/programs": "/music-lessons",
  "/registration": "/pricing",
  "/careers": "/music-teacher-jobs",
};

// Trailing slash: /pricing/ and /pricing would otherwise both answer 200 with the
// same page. canonical already tells Google which one counts, but a redirect keeps
// crawl budget and analytics on a single URL.
app.get(/^\/(?!api\/).+\/$/, (req, res) => {
  const target = req.path.replace(/\/+$/, "");
  const query = req.originalUrl.slice(req.path.length);
  res.redirect(301, (target || "/") + query);
});

app.get(Object.keys(LEGACY_REDIRECTS), (req, res) => {
  const target = LEGACY_REDIRECTS[req.path];
  const query = req.originalUrl.slice(req.path.length); // keep ?utm_source=… intact
  res.redirect(301, target + query);
});

// --- Serve the built SPA (production) -------------------------------------
// In local dev the Vite dev server serves the UI and proxies /api here, so
// dist/ may not exist — that's fine, these handlers simply won't match.
app.use(express.static(DIST_DIR));

// Known routes, emitted at build time from src/i18n/routes.ts (see vite.config.ts).
// Without this the catch-all answers 200 to every URL, which Google reads as a
// "soft 404": made-up paths get crawled and indexed as if they were real pages.
//
// If the file is missing or unreadable we fall back to the old behaviour — every
// path serves the app with a 200. A stale route list must never take the site down.
let knownPaths = null;
try {
  const raw = fs.readFileSync(path.join(DIST_DIR, "routes.json"), "utf8");
  knownPaths = new Set(JSON.parse(raw).paths);
  console.log(`Loaded ${knownPaths.size} known routes`);
} catch {
  console.warn("routes.json not found — every path will answer 200 (no 404s)");
}

const isKnown = (reqPath) => {
  if (!knownPaths) return true;
  const clean = reqPath.length > 1 ? reqPath.replace(/\/+$/, "") : reqPath;
  return knownPaths.has(clean || "/");
};

app.get(/^\/(?!api\/).*/, (req, res) => {
  const found = isKnown(req.path);
  const status = found ? 200 : 404;

  // A missing asset (image, font, .map) shouldn't get an HTML body.
  if (!found && !req.accepts("html")) {
    return res.status(404).type("txt").send("Not found");
  }

  // Unknown pages still render the app, so the visitor gets the styled 404 page —
  // but with a 404 status, which is what crawlers act on.
  res.status(status).sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Alondra server listening on http://localhost:${PORT}`);
});
