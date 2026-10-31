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
import dns from "node:dns/promises";
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
const ALLOWED_EXT = /\.(pdf|docx?)$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Máximo de la RFC 5321. El regex de arriba bloquea espacios y varios `@`, pero
// deja pasar paréntesis, comillas y corchetes, que es lo que necesitan los fallos
// de coste cuadrático del parser de direcciones de nodemailer (varios avisos
// abiertos, cuyo arreglo exige un salto de 6 a 10 mayores). Acotar la entrada
// quita el material de entrada sin tocar la dependencia.
const EMAIL_MAX = 254;
// El nombre viaja al `replyTo` y al asunto, así que entra en el mismo parser de
// direcciones que el correo: acotar sólo el correo dejaba la mitad del material.
const NOMBRE_MAX = 200;

/**
 * Normaliza un campo de formulario a string, sin poder lanzar.
 *
 * Un cuerpo JSON puede traer cualquier tipo en cualquier campo, y el valor por
 * defecto de una desestructuración sólo cubre `undefined`. Con `{"email": 1}`,
 * `email.trim()` lanzaba un TypeError dentro de un handler `async`: Express 4
 * descarta ese rechazo y Node 22 lo convierte en salida del proceso, así que
 * **una sola petición sin autenticar tumbaba el sitio entero**, antes además del
 * apunte de cuota, o sea sin límite de frecuencia.
 *
 * Lo que NO se puede hacer aquí es coercionar con `String(v)` a secas, y es el
 * error que tuvo la primera versión de este arreglo: `String({toString: 0})`
 * lanza `TypeError: Cannot convert object to primitive value`, y un nombre de
 * campo multipart con corchetes (`name[a]=X`) produce un objeto **sin
 * prototipo**, que tampoco tiene `toString`. O sea que el propio arreglo era un
 * sitio donde se lanzaba, por la misma vía y desde una petición sin autenticar.
 * Un objeto o un array nunca es un campo de formulario válido: se descarta.
 *
 * `asyncRoute` es la red que impide que un rechazo mate el proceso, pero no debe
 * ser lo único que sostenga esto: si alguien añade un handler con la forma
 * `app.post(ruta, async …)` sin envolver, el fallo vuelve.
 */
const CAMPO_MAX = 2000;
const texto = (v, max = CAMPO_MAX) => {
  if (v == null || typeof v === "object" || typeof v === "function") return "";
  const s = typeof v === "string" ? v : String(v);
  return s.length > max ? s.slice(0, max) : s;
};

/**
 * Lleva el rechazo de un handler `async` al middleware de error.
 *
 * Express 4 llama al handler dentro de un try/catch sincrónico y descarta la
 * promesa que devuelve, así que un `await` que rechaza no llega a ningún sitio y
 * Node lo escala a excepción no capturada. Express 5 hace esto de serie.
 */
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// CV upload → parsed into memory, then attached to the email.
const upload = multer({
  storage: multer.memoryStorage(),
  // multer guarda este objeto tal cual y se lo pasa a busboy sin añadir nada, y
  // busboy pone Infinity por defecto en `files`, `fields` y `parts`. Declarando
  // sólo `fileSize` quedaba acotado el adjunto y nada más: una petición podía
  // traer un número ilimitado de campos de texto, todos acumulados en req.body
  // antes de que el handler leyera el primero. El formulario manda seis campos
  // y un fichero (ApplicationForm.tsx), así que estos topes van anchos.
  // `fieldNameSize` y `fieldNestingDepth` los comprueba multer por su cuenta: el
  // parser multipart de busboy no lee el primero.
  limits: {
    fileSize: MAX_FILE_BYTES,
    files: 1,
    parts: 24,
    fields: 20,
    fieldSize: 16 * 1024,
    fieldNameSize: 64,
    fieldNestingDepth: 2,
  },
  // El `mimetype` lo manda el navegador, no se deduce del fichero: un .html
  // enviado como application/pdf pasaba el filtro y llegaba al buzón como si
  // fuera un curriculum. La extensión tiene que cuadrar también, y es la misma
  // lista que declara el `accept` del formulario.
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.test(file.originalname)) cb(null, true);
    else cb(new Error("INVALID_FILE_TYPE"));
  },
});

const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return {
    // Con plazos explícitos: sin ellos, un SMTP que no responde dejaba la
    // petición abierta y el buffer del adjunto (hasta 5 MB) retenido en memoria
    // sin tope de tiempo, y el visitante esperando sin respuesta.
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
    user,
  };
};

// Shared: validate transport config, send, and answer the request.
const sendFormEmail = async (res, { subject, heading, name, email, rows, attachments = [], alFallar }) => {
  const t = getTransporter();
  if (!t) {
    // Esta salida va ANTES del try, así que también tiene que devolver la marca:
    // es precisamente el estado tras un despliegue sin credenciales, y sin esto
    // los 500 de visitantes reales llenaban el cupo diario y dejaban el
    // formulario cerrado un día entero después de arreglar la causa.
    alFallar?.();
    console.error("Missing GMAIL_USER / GMAIL_APP_PASSWORD env vars");
    return res.status(500).json({ ok: false, error: "Server not configured" });
  }
  try {
    await t.transporter.sendMail({
      from: `"Alondra Web" <${t.user}>`,
      to: process.env.CONTACT_TO || t.user,
      // El nombre va como objeto, no interpolado en la plantilla de dirección:
      // un nombre como `Bob" <otro@ejemplo.com>, x` colaba una segunda
      // dirección, y encima la primera de la lista, así que al responder el
      // correo se iba a ella en vez de a quien rellenó el formulario.
      replyTo: { name: String(name), address: String(email).trim() },
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
    // El envío no salió: se devuelve la marca al cupo, o un proveedor caído (o un
    // despliegue sin credenciales) cerraría el formulario un día entero.
    alFallar?.();
    // Con el contenido, no sólo el error: estos datos no están guardados en
    // ningún otro sitio, así que si el envío falla el lead sólo sobrevive aquí
    // (`docker logs alondra.app.prod`).
    console.error("sendMail failed:", err, "| lead perdido:", JSON.stringify(rows));
    return res.status(500).json({ ok: false, error: "Failed to send" });
  }
};

// --- Tope de envíos por IP -------------------------------------------------
// Cada petición válida manda un correo, y la cuenta de Gmail tiene un tope
// diario de unos cientos: sin límite, un script en bucle lo agota y a partir de
// ahí el formulario devuelve error a las familias de verdad.
//
// La clave es `cf-connecting-ip`, la IP real del visitante que pone el túnel de
// Cloudflare. Detrás del túnel todas las peticiones llegan con la IP del
// conector, así que un límite sobre `req.ip` cerraría el formulario para todo el
// mundo en cuanto spameara uno. Sin esa cabecera (localhost, LAN, tailnet) se
// cae a `req.ip`.
//
// Hay además un tope global, y no es redundante: por internet la cabecera es de
// fiar porque Cloudflare la sobreescribe, pero en prod el contenedor escucha en
// 0.0.0.0 (LAN de casa + tailnet), y por ahí se llega al puerto sin pasar por el
// túnel y se puede mandar una IP distinta en cada petición. El tope global es lo
// que acota el daño al cupo de Gmail diga lo que diga la cabecera.
//
// Se apunta justo antes de enviar, no al entrar: así cinco intentos con un campo
// mal puesto no dejan a una familia fuera una hora.
// El recurso que se protege es el cupo **diario** de la cuenta de Gmail, así que
// hace falta una ventana de un día: cincuenta por hora son hasta 1.200 al día,
// muy por encima del cupo, y el tope horario podía no saltar nunca mientras el
// recurso se agotaba. Se cuentan las dos ventanas sobre la misma lista.
const SEND_WINDOW_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// Por identidad y hora, pero sólo se aplica desde SEND_FAIR_FROM, así que el
// tope EFECTIVO para quien llega con el sitio en frío es SEND_FAIR_FROM (sus diez
// primeros envíos no se le cuentan contra este número) y cinco para el resto. Es
// una relajación deliberada, no un descuido: ver SEND_FAIR_FROM.
const SEND_MAX = 5;
const SEND_MAX_TOTAL = 50; // en todo el sitio y hora
const SEND_MAX_DAY = 150; // en todo el sitio y día, por debajo del cupo del proveedor
// El tope por identidad sólo se aplica cuando el cupo global ya va cargado. La
// identidad sale de una cabecera que el visitante elige en las vías que no pasan
// por Cloudflare, así que llenar el cubo de otra persona no debe poder negarle el
// formulario mientras hay cupo de sobra: eso convertía el tope en un arma.
const SEND_FAIR_FROM = 10;
// Intentos (no envíos) por identidad, apuntados al ENTRAR en la candidatura, que
// es lo que permite cortar una subida antes de que multer la meta en memoria.
// Ventana corta a propósito: estos contadores existen para cortar una ráfaga, no
// para castigar. Con diez minutos, una avalancha dejaba la candidatura rechazada
// diez minutos a quien llegara después; con dos, la recuperación es rápida y diez
// intentos en dos minutos siguen estando muy por encima de lo que hace una
// persona (el formulario se manda una vez, y como mucho se reintenta un par).
const ATTEMPT_WINDOW_MS = 2 * 60 * 1000;
const ATTEMPT_MAX = 10; // por identidad
// El mapa se acota EXPULSANDO la clave más antigua, no rechazando a todo el
// mundo. La primera versión de este arreglo puso un tope global que respondía
// 429 a cualquiera en cuanto se alcanzaba, y eso era un interruptor de apagado
// que cualquiera accionaba con 300 peticiones vacías: unos 50 KB. Lo que ese
// contador existe para encarecer es subir 300 ficheros de 5 MB, o sea 1,5 GB. El
// arreglo abarataba la denegación unas 30.000 veces y encima la volvía total,
// cuando antes no existía. Con expulsión la memoria queda acotada igual y nadie
// puede negarle el formulario a otra persona.
const ATTEMPT_KEYS_MAX = 500;
const sendLog = new Map();
const attemptLog = new Map();
let allSends = [];

/**
 * Identidad del visitante para los contadores, sin apoyarse en una cabecera que
 * cualquiera pueda poner.
 *
 * El problema: `cf-connecting-ip` sólo es de fiar si la petición entró por el
 * túnel, porque es el borde de Cloudflare quien la escribe (comprobado contra el
 * sitio vivo: mandándola como `http` el origen sigue viendo https). Pero el
 * perfil de producción publica además el puerto en `0.0.0.0`, que en vibox
 * significa LAN de casa y tailnet, y ésa es una decisión del dueño (quiere entrar
 * desde la red local, 27-09-2026). Por esa vía la cabecera la elige quien llama,
 * así que servía para escapar del tope propio y, peor, para gastarle el cubo a
 * una visitante concreta.
 *
 * La solución es distinguir las dos vías por algo que no se puede falsificar: la
 * dirección del otro extremo del socket. El conector del túnel es un contenedor
 * de la misma red compartida, así que su nombre se resuelve por el DNS interno de
 * Docker y su IP se puede comparar con `req.ip`.
 *
 * - Peticiones **desde el conector**: la cabecera es de fiar y se usa, que es lo
 *   único que da identidad por visitante en esa vía (ahí `req.ip` es el conector
 *   y sería la misma para todo el mundo).
 * - Cualquier otra procedencia (puerto publicado, tailnet, otro contenedor de la
 *   red compartida): se usa `req.ip`, el peer TCP real. No se puede falsificar.
 * - Si la resolución falla (fuera de Docker, conector caído, DNS con hipo): la
 *   identidad es `req.ip` y se marca **sin verificar**. La cabecera NO vuelve a
 *   entrar: si no se puede saber quién la escribió, no vale como identidad.
 *
 * El principio que sostiene la rama degradada: **un tope sólo se aplica a través
 * de una clave que de verdad identifique a alguien.** Sin resolver el conector,
 * `req.ip` es el conector para todo el que entra por el túnel, o sea una clave
 * compartida; repartir por ella cerraría el formulario a las familias en cuanto
 * un tercero gastase el cubo común (y con el contador de intentos bastarían diez
 * peticiones en dos minutos para dejar la candidatura cerrada para todos). Así
 * que los topes POR IDENTIDAD se suspenden y quedan los GLOBALES, que son los que
 * protegen el recurso de verdad escaso, el cupo diario de Gmail.
 *
 * Lo que se acepta a cambio: durante esa ventana, quien abuse no tiene tope
 * propio y puede llegar hasta el tope global. Es un techo conocido (50 a la hora,
 * 150 al día), la ventana dura como mucho un minuto porque el refresco reintenta,
 * y el cambio de estado se anuncia en el log. Lo contrario (negar el formulario a
 * visitantes reales por un fallo de DNS) no es un intercambio aceptable.
 *
 * `trust proxy` de Express sigue SIN configurar a propósito: con él, `req.ip`
 * pasaría a leerse de `x-forwarded-for`, que sí es falsificable, y además es lo
 * que mantiene inerte el aviso crítico de `proxy-addr`.
 */
const TUNNEL_CONTAINER = process.env.TUNNEL_CONTAINER || "alondra.cloudflared";
let ipsDelTunel = new Set();
let tunelResuelto = false;

let arrancado = false;

/**
 * Relee la IP del conector. Corre al arrancar y cada minuto (la IP cambia si se
 * recrea su contenedor).
 *
 * Exportada para los tests: el refresco que cae **dentro** del `await` de un
 * envío es lo que hace que la identidad de una petición pueda cambiar a mitad
 * de camino, y eso no se puede provocar desde fuera por HTTP. Ver
 * `src/test/send-refund-identity.test.ts`.
 */
export const resolverTunel = async () => {
  const antes = tunelResuelto;
  try {
    const dirs = await dns.lookup(TUNNEL_CONTAINER, { all: true });
    ipsDelTunel = new Set(dirs.map((d) => d.address));
    tunelResuelto = ipsDelTunel.size > 0;
  } catch {
    // Silencioso a propósito: fuera de Docker esto falla en cada refresco y no
    // es un error, es el modo de desarrollo.
    ipsDelTunel = new Set();
    tunelResuelto = false;
  }
  // Sólo en el CAMBIO de estado. El refresco corre cada minuto y fuera de Docker
  // falla siempre, así que avisar en cada vuelta llenaría el log; pero si la
  // resolución se cae con el proceso ya arrancado, la línea de arranque pasa a
  // ser mentira y esto es lo único que lo delata.
  if (arrancado && antes !== tunelResuelto) {
    console.log(
      tunelResuelto
        ? `Conector del tunel resuelto de nuevo (${TUNNEL_CONTAINER}): vuelven los topes por identidad`
        : `Conector del tunel SIN resolver (${TUNNEL_CONTAINER}): topes por identidad suspendidos, siguen los globales`,
    );
  }
};

/** Normaliza `::ffff:172.18.0.3` a `172.18.0.3` para poder comparar. */
const sinPrefijoV6 = (ip) => (ip || "").replace(/^::ffff:/, "");

const vieneDelTunel = (req) => tunelResuelto && ipsDelTunel.has(sinPrefijoV6(req.ip));

/**
 * Primer valor de `cf-connecting-ip`, acotado. Node junta las cabeceras
 * repetidas con comas, y la clave de un Map no debe poder crecer sin tope.
 */
const cabeceraCf = (req) => {
  const v = req.headers["cf-connecting-ip"];
  const s = typeof v === "string" ? v : Array.isArray(v) ? v[0] : "";
  return sinPrefijoV6(String(s).split(",")[0].trim()).slice(0, 64);
};

/**
 * La identidad y si sirve para distinguir visitantes.
 *
 * `verificada: false` quiere decir «esta clave NO identifica a nadie en
 * particular»: los topes por identidad se saltan (ver cabecera del bloque), los
 * globales siguen.
 */
const identidad = (req) => {
  const peer = sinPrefijoV6(req.ip) || "desconocida";
  if (vieneDelTunel(req)) {
    const cf = cabeceraCf(req);
    // Entrada por el túnel sin cabecera: no debería pasar, pero si pasa el peer
    // es el conector, o sea una clave común. No se reparte por ella.
    return cf ? { id: cf, verificada: true } : { id: peer, verificada: false };
  }
  if (!tunelResuelto) return { id: peer, verificada: false };
  return { id: peer, verificada: true };
};

/** La clave para apuntar. Apuntar siempre es inocuo; lo que se filtra es leer. */
const ipOf = (req) => identidad(req).id;

let ultimoBarrido = 0;

/** Tira las marcas caducadas. Ningún mapa ni lista puede crecer sin tope. */
const sweepSends = (now) => {
  if (now === ultimoBarrido) return; // dos comprobaciones en el mismo ms
  ultimoBarrido = now;
  const dentro = (stamps, ventana) => stamps.filter((t) => now - t < ventana);
  allSends = dentro(allSends, DAY_MS);
  for (const [key, stamps] of sendLog) {
    const quedan = dentro(stamps, SEND_WINDOW_MS);
    if (quedan.length) sendLog.set(key, quedan);
    else sendLog.delete(key);
  }
  for (const [key, stamps] of attemptLog) {
    const quedan = dentro(stamps, ATTEMPT_WINDOW_MS);
    if (quedan.length) attemptLog.set(key, quedan);
    else attemptLog.delete(key);
  }
};

/**
 * ¿Esta petición está en el tope? Sólo mira, no apunta, así que se puede llamar
 * antes de parsear el cuerpo: es lo que permite cortar una subida de 5 MB antes
 * de que multer la meta en memoria.
 */
const atSendLimit = (req) => {
  const now = Date.now();
  sweepSends(now);
  const ultimaHora = allSends.filter((t) => now - t < SEND_WINDOW_MS).length;
  if (ultimaHora >= SEND_MAX_TOTAL || allSends.length >= SEND_MAX_DAY) return true;
  if (ultimaHora < SEND_FAIR_FROM) return false; // ver SEND_FAIR_FROM
  const { id, verificada } = identidad(req);
  if (!verificada) return false; // clave compartida: repartir por ella castiga a terceros
  return (sendLog.get(id) ?? []).length >= SEND_MAX;
};

/**
 * ¿Demasiados intentos recientes desde esta identidad?
 *
 * Distinto de la cuota de envíos a propósito. El corte que había antes de multer
 * leía el contador de **envíos**, que sólo avanza en la ruta de éxito, así que
 * una petición que siempre falla la validación o rellena el honeypot no gastaba
 * nada y el corte previo no podía saltar nunca: se parseaban los 5 MB enteros
 * antes de rechazarla. Esto se apunta al entrar.
 */
const atAttemptLimit = (req) => {
  sweepSends(Date.now());
  const { id, verificada } = identidad(req);
  // Con la clave compartida esto sería un interruptor de apagado: diez intentos
  // en dos minutos, de cualquiera, y la candidatura queda cerrada para todos.
  if (!verificada) return false;
  return (attemptLog.get(id) ?? []).length >= ATTEMPT_MAX;
};

const noteAttempt = (req) => {
  const ip = ipOf(req);
  // La clave es una cabecera que el visitante elige, así que con la cabecera
  // rotando cada petición trae una clave nueva. Expulsar la más antigua (los Map
  // de JS conservan el orden de inserción) acota el mapa sin negar nada a nadie.
  if (!attemptLog.has(ip) && attemptLog.size >= ATTEMPT_KEYS_MAX) {
    attemptLog.delete(attemptLog.keys().next().value);
  }
  attemptLog.set(ip, [...(attemptLog.get(ip) ?? []), Date.now()]);
};

/** Quita UNA aparición de un valor, no todas: dos marcas pueden coincidir en ms. */
const quitarUna = (arr, v) => {
  const i = arr.indexOf(v);
  return i === -1 ? arr : [...arr.slice(0, i), ...arr.slice(i + 1)];
};

/**
 * Apunta un envío y devuelve el apunte. Va pegado a su `atSendLimit`, sin await.
 *
 * Devuelve la CLAVE además de la marca, y eso no es cosmética: la devolución
 * ocurre después del `await` del envío (hasta 20 s, el `socketTimeout`), y el
 * refresco del conector corre cada minuto. Si la resolución del DNS cambia de
 * estado dentro de esa ventana, la identidad de la misma petición cambia con
 * ella, así que recalcularla al devolver dejaba la marca en el cubo de origen
 * para siempre y descontaba de otra clave. Quien apunta dice dónde apuntó.
 */
const noteSend = (req) => {
  const now = Date.now();
  const id = ipOf(req);
  sendLog.set(id, [...(sendLog.get(id) ?? []), now]);
  allSends.push(now);
  return { id, marca: now };
};

/**
 * Devuelve una marca al cupo cuando el envío no llegó a salir.
 *
 * El apunte va antes del `await` a propósito, para que no haya ventana entre
 * comprobar y apuntar. Pero sin esta devolución, un envío que el proveedor
 * rechaza gastaba cupo igual, y con la ventana diaria eso era grave: 150
 * peticiones baratas en unas horas, sin consumir un solo correo de Gmail, dejaban
 * los DOS formularios en 429 durante las ~21 horas restantes. Y lo mismo se
 * autoinfligía solo tras un despliegue sin credenciales, que es justo cuando
 * `getTransporter()` devuelve null: los 500 de visitantes reales llenaban el cupo
 * y el formulario seguía cerrado un día entero después de arreglar la causa.
 *
 * Recibe el apunte de `noteSend`, no la petición: la clave tiene que ser la
 * MISMA con la que se gastó el cupo (ver la cabecera de `noteSend`).
 */
const refundSend = ({ id, marca }) => {
  const quedan = quitarUna(sendLog.get(id) ?? [], marca);
  if (quedan.length) sendLog.set(id, quedan);
  else sendLog.delete(id);
  allSends = quitarUna(allSends, marca);
};

const app = express();

// Express anuncia `X-Powered-By: Express` en cada respuesta, y se ve en las
// cabeceras de producción. No es un agujero, pero regala la pila a quien busca
// objetivos por versión de framework y no sirve para nada.
app.disable("x-powered-by");

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

/**
 * Esquema con el que el visitante llegó al borde.
 *
 * Lo que de verdad estaba mal era leer la misma cabecera en dos sitios con dos
 * normalizaciones distintas; esto la lee una sola vez y las dos decisiones (HSTS
 * y el 301 canónico) se derivan de aquí.
 *
 * Se toma el valor de la **izquierda**, que es el del visitante y el que lee
 * `req.protocol` de Express. La primera versión de este arreglo tomaba el de la
 * derecha, y era una apuesta mala: si algún salto de la cadena añade en vez de
 * sobreescribir, el de la derecha es el del salto más cercano al contenedor, que
 * es `http` por construcción, y entonces el 301 redirige a una URL que vuelve a
 * caer aquí. Un bucle infinito de redirecciones en el dominio del cliente. En
 * producción hoy sólo llega un valor (Cloudflare la sobreescribe), así que la
 * elección es inocua; lo que no es inocuo es el coste de equivocarse.
 *
 * En minúsculas porque `HTTPS` no es `https` y sin esto también redirigía en
 * bucle. Sin cabecera asumimos https para no redirigir a quien ya venía bien.
 */
const protoOf = (req) => {
  const raw = req.headers["x-forwarded-proto"];
  if (!raw) return "https";
  const partes = String(raw).split(",").map((v) => v.trim()).filter(Boolean);
  return (partes[0] || "https").toLowerCase();
};

/**
 * Cabeceras de seguridad.
 *
 * El sitio no mandaba ninguna, así que cualquiera podía incrustar alondrama.com
 * en su propia página, superponerle capas y conseguir que un visitante pulsara
 * donde no creía estar pulsando. Eso importa sobre todo en /enrollment, que es
 * donde una familia escribe el nombre y la edad de su hijo.
 *
 * `frame-ancestors 'self'` es lo que lo cierra. Se permite 'self' y no 'none'
 * porque el widget de My Music Staff vive en un iframe del propio dominio
 * (public/mms-widget.html): con 'none' se bloquearía a sí mismo.
 *
 * Esta CSP lleva **sólo** esa directiva a propósito. Una completa tendría que
 * autorizar gtag, el script de My Music Staff, los estilos en línea que inyecta
 * framer-motion y los scripts en línea de index.html, y equivocarse ahí rompe el
 * sitio en silencio para una parte de los visitantes. Es un trabajo aparte, y
 * uno que hay que verificar en un navegador de verdad, no a ciegas.
 */
app.use((req, res, next) => {
  res.set({
    "Content-Security-Policy": "frame-ancestors 'self'",
    // El equivalente antiguo, para navegadores que no leen frame-ancestors.
    "X-Frame-Options": "SAMEORIGIN",
    // Que el navegador no adivine el tipo de un fichero y lo ejecute como script.
    "X-Content-Type-Options": "nosniff",
    // Al salir del sitio se manda el origen, nunca la ruta completa.
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // El sitio no usa ninguna de las tres. `payment` se deja fuera a propósito:
    // el widget de terceros podría necesitarlo y romperlo no se vería hasta que
    // una familia intentara pagar.
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });

  // HSTS sólo en el dominio público y sobre https. Es la única cabecera difícil
  // de deshacer (el navegador la recuerda), así que no se manda en localhost, ni
  // en la LAN, ni en el preview de Tailscale, donde dejaría el sitio inaccesible
  // por http. Medio año, sin preload ni subdominios: para retirarla, poner
  // max-age=0 y esperar a que caduque en los navegadores que ya la vieron.
  const proto = protoOf(req);
  const host = (req.headers.host || "").toLowerCase().split(":")[0];
  if (proto === "https" && (host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`)) {
    res.set("Strict-Transport-Security", "max-age=15552000");
  }

  next();
});

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const host = String(req.headers.host || "").toLowerCase().split(":")[0];
  if (host !== CANONICAL_HOST && host !== `www.${CANONICAL_HOST}`) return next();

  // Detrás del túnel el conector habla http con el contenedor; el esquema que
  // usó el visitante llega en x-forwarded-proto, y lo lee `protoOf` (un solo
  // sitio, valor de la derecha) para que esta decisión y la de HSTS no puedan
  // discrepar sobre la misma petición.
  const proto = protoOf(req);
  if (host === CANONICAL_HOST && proto === "https") return next();

  return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
});

app.use(express.json({ limit: "32kb" }));

// --- Contact form → email -------------------------------------------------
app.post("/api/send-contact", asyncRoute(async (req, res) => {
  // Todos los campos de texto se coercionan una sola vez aquí (ver `texto`): el
  // cuerpo es JSON y puede traer cualquier tipo. `promo` se compara, no se
  // coerce, porque es el único booleano y un string "false" sería truthy.
  const b = req.body ?? {};
  const name = texto(b.name, NOMBRE_MAX), student = texto(b.student), age = texto(b.age);
  const email = texto(b.email), phone = texto(b.phone), zip = texto(b.zip);
  const instrument = texto(b.instrument), channel = texto(b.channel), source = texto(b.source);
  const availability = texto(b.availability), message = texto(b.message), company = texto(b.company);
  const promo = b.promo === true || b.promo === "true";
  if (company.trim() !== "") return res.json({ ok: true }); // honeypot

  // Los obligatorios son los de la Fase 18. `message` ya NO lo es: con siete
  // campos por delante, exigir ademas un texto libre solo pierde envios.
  const required = { name, email, phone, zip, instrument, channel, source };
  if (Object.values(required).some((v) => !v.trim())) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  const correo = email.trim();
  if (correo.length > EMAIL_MAX || !EMAIL_RE.test(correo)) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }

  if (atSendLimit(req)) return res.status(429).json({ ok: false, error: "too_many" });
  const apunte = noteSend(req);

  return sendFormEmail(res, {
    alFallar: () => refundSend(apunte),
    subject: `Nuevo contacto: ${name} · ${instrument} · ${zip}`,
    heading: "Nuevo mensaje de contacto",
    name,
    email,
    // El orden es el de la llamada: primero a quien se llama y por donde, luego
    // de que va, y al final de donde vino. Ilena lee esto antes de marcar.
    rows: [
      ["Responder por", channel],
      ["Telefono", phone],
      ["Email", email],
      ["Adulto", name],
      ["Estudiante", student || "(sin dato)"],
      ["Edad", age || "(sin dato)"],
      ["Instrumento", instrument],
      ["Codigo postal", zip],
      ["Disponibilidad", availability || "(sin dato)"],
      ["Mensaje", message || "(sin dato)"],
      ["Como nos conocio", source],
      ["Acepta promociones", promo ? "Si" : "No"],
    ],
  });
}));

// --- Job application → email (with CV attachment) -------------------------
// Corta ANTES de que multer parsee el cuerpo. Mira la cuota de envíos y, además,
// el contador de intentos, que es el que sí avanza con peticiones inválidas: sin
// él este corte no podía saltar nunca y los 5 MB se buffereaban igual.
const blockIfAtLimit = (req, res, next) => {
  if (atSendLimit(req) || atAttemptLimit(req)) {
    return res.status(429).json({ ok: false, error: "too_many" });
  }
  noteAttempt(req);
  next();
};

app.post("/api/send-application", blockIfAtLimit, upload.single("cv"), asyncRoute(async (req, res) => {
  // Mismo motivo que en contacto: los campos multipart también pueden llegar con
  // otro tipo (un nombre de campo con corchetes los convierte en objeto).
  const b = req.body ?? {};
  const name = texto(b.name, NOMBRE_MAX), email = texto(b.email), phone = texto(b.phone);
  const role = texto(b.role), message = texto(b.message), company = texto(b.company);
  if (company.trim() !== "") return res.json({ ok: true }); // honeypot
  if (!name.trim() || !email.trim() || !phone.trim() || !role.trim() || !message.trim()) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  if (email.trim().length > EMAIL_MAX || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }

  const attachments = req.file
    ? [{ filename: req.file.originalname, content: req.file.buffer, contentType: req.file.mimetype }]
    : [];

  if (atSendLimit(req)) return res.status(429).json({ ok: false, error: "too_many" });
  const apunte = noteSend(req);

  return sendFormEmail(res, {
    alFallar: () => refundSend(apunte),
    subject: `Nueva candidatura: ${name}`,
    heading: "Nueva candidatura",
    name,
    email,
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Role", role],
      ["Message", message],
      ["CV", req.file ? req.file.originalname : "(sin dato)"],
    ],
    attachments,
  });
}));

// Errores de subida → 400 con un código que el cliente entiende. Cualquier otro
// error que llegue aquí (lo trae `asyncRoute` desde un handler async) es un fallo
// nuestro, no de la petición, y se responde 500: antes todo caía en un 400
// genérico, que miente sobre de quién es el problema.
// Sin prototipo: con un objeto literal, `UPLOAD_ERRORS["toString"]` devuelve una
// función heredada y el `??` la toma por un código válido, y parte de `err.message`
// la influye quien manda la petición.
const UPLOAD_ERRORS = Object.assign(Object.create(null), {
  INVALID_FILE_TYPE: "invalid_type",
  LIMIT_FILE_SIZE: "too_large",
  LIMIT_PART_COUNT: "too_many_parts",
  LIMIT_FIELD_COUNT: "too_many_fields",
  LIMIT_FIELD_VALUE: "field_too_long",
  LIMIT_FIELD_KEY: "field_name_too_long",
  LIMIT_FILE_COUNT: "too_many_files",
  LIMIT_UNEXPECTED_FILE: "unexpected_file",
  // Estos cinco faltaban, y `fieldNestingDepth` es un límite que declaramos
  // nosotros: declararlo sin su entrada en la tabla hacía que un nombre de campo
  // con corchetes anidados respondiera 500 con traza, por una falta del cliente.
  LIMIT_FIELD_NESTING: "field_too_nested",
  LIMIT_FIELD_ARRAY_INDEX: "field_index_too_large",
  MISSING_FIELD_NAME: "missing_field_name",
  INVALID_FIELD_NAME: "invalid_field_name",
  STREAM_DESTROYED: "upload_aborted",
});

app.use((err, _req, res, next) => {
  if (!err) return next();
  const codigo = UPLOAD_ERRORS[err.code] ?? UPLOAD_ERRORS[err.message];
  if (codigo) {
    console.error("Upload error:", err.message);
    return res.status(400).json({ ok: false, error: codigo });
  }
  // body-parser marca sus propios errores con un estado 4xx (JSON mal formado,
  // cuerpo demasiado grande, escalar en modo estricto). Son faltas del cliente y
  // antes de este arreglo respondían 400; ignorar ese estado las convertía en 500
  // con traza, que miente en la dirección contraria y ensucia cualquier monitor
  // que vigile los 5xx.
  const estado = Number(err.status ?? err.statusCode);
  if (Number.isInteger(estado) && estado >= 400 && estado < 500) {
    console.error("Bad request:", err.message);
    return res.status(estado).json({ ok: false, error: "bad_request" });
  }
  console.error("Request failed:", err);
  return res.status(500).json({ ok: false, error: "server_error" });
});

// --- Permanent redirects from the pre-SEO URLs -----------------------------
// These paths shipped publicly before the slugs were localized, so they may sit
// in Google's index, in Nextdoor posts and in WhatsApp threads. A 301 here (not
// a client-side redirect) is what passes the accumulated ranking to the new URL.
// Keep in sync with LEGACY_REDIRECTS in src/i18n/routes.ts. Never drop a row.
// Exportada para que un test pueda compararla con la de src/i18n/routes.ts.
export const LEGACY_REDIRECTS = {
  "/programs": "/music-lessons",
  "/registration": "/pricing",
  "/careers": "/music-teacher-jobs",
};

// Trailing slash: /pricing/ and /pricing would otherwise both answer 200 with the
// same page. canonical already tells Google which one counts, but a redirect keeps
// crawl budget and analytics on a single URL.
app.get(/^\/(?!api\/).+\/$/, (req, res) => {
  // `req.path` es la ruta CRUDA, sin normalizar: Express la toma de parseurl, que
  // no colapsa barras. Con `//evil.com/` el destino quedaba en `//evil.com`, una
  // referencia relativa al protocolo que el navegador resuelve contra el esquema
  // actual, o sea una redirección abierta fuera del dominio con un enlace que
  // parece de alondrama.com. La contrabarra vale igual, porque el parser de URL
  // de los navegadores la trata como separador. `encodeUrl` de Express no ayuda:
  // deja pasar `/` y `\` (sólo escapa CR y LF). Comprobado en local antes y
  // después: `Location: //evil.example` pasó a `Location: /evil.example`.
  //
  // Se reancla a UNA sola barra inicial, así que el destino no puede salir del
  // sitio. Las barras internas se conservan, que es lo que necesitan las rutas
  // localizadas (`/es/precios/` → `/es/precios`).
  const limpio = "/" + req.path.replace(/^[/\\]+/, "").replace(/[/\\]+$/, "");
  const query = req.originalUrl.slice(req.path.length);
  res.redirect(301, limpio + query);
});

app.get(Object.keys(LEGACY_REDIRECTS), (req, res) => {
  const target = LEGACY_REDIRECTS[req.path];
  const query = req.originalUrl.slice(req.path.length); // keep ?utm_source=… intact
  res.redirect(301, target + query);
});

// --- Serve the built SPA (production) -------------------------------------
// In local dev the Vite dev server serves the UI and proxies /api here, so
// dist/ may not exist — that's fine, these handlers simply won't match.
// `redirect: false` es obligatorio desde que el build prerenderiza: con el valor
// por defecto, una petición a /music-teachers encuentra el directorio del mismo
// nombre y responde un 301 a /music-teachers/, que el middleware de barra final
// devuelve a /music-teachers. Bucle infinito. Los ficheros de ruta los sirve el
// catch-all de abajo, que ya sabe cuáles son rutas reales.
app.use(express.static(DIST_DIR, { redirect: false }));

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

/**
 * Qué HTML le toca a esta URL.
 *
 * El build escribe un fichero por ruta conocida: las cinco páginas que importan
 * con la página entera dentro, el resto sólo con sus metadatos. Servir el que
 * corresponde es lo que hace que cada URL lleve su propio título y su propio
 * canonical en el HTML, sin esperar a que el navegador ejecute nada.
 *
 * Lo desconocido va a `404.html`, un esqueleto con `noindex` y sin canonical.
 * Antes aquí se servía `index.html`, que desde el prerenderizado es la portada
 * con su contenido dentro: una URL inventada se habría anunciado como la portada.
 *
 * La ruta sólo se construye a partir de la lista del build, nunca de lo que
 * mande el cliente. Y si falta un fichero (build antiguo), se cae a `index.html`,
 * que es el comportamiento de siempre: una lista obsoleta no debe tumbar el sitio.
 */
const htmlFor = (reqPath, found) => {
  if (found) {
    const clean = reqPath.length > 1 ? reqPath.replace(/\/+$/, "") : reqPath;
    const file = path.join(DIST_DIR, clean === "/" ? "index.html" : path.join(clean, "index.html"));
    if (file.startsWith(DIST_DIR) && fs.existsSync(file)) return file;
  }
  const shell = path.join(DIST_DIR, "404.html");
  return fs.existsSync(shell) ? shell : path.join(DIST_DIR, "index.html");
};

app.get(/^\/(?!api\/).*/, (req, res) => {
  const found = isKnown(req.path);
  const status = found ? 200 : 404;

  // A missing asset (image, font, .map) shouldn't get an HTML body.
  if (!found) {
    // Sólo en esta rama el cuerpo depende de `Accept` (HTML para un navegador,
    // texto plano para un asset que falta), así que sólo aquí hay que declararlo.
    // En una ruta conocida la respuesta es siempre HTML y un `Vary` de más
    // fragmenta cachés para nada.
    res.vary("Accept");
    if (!req.accepts("html")) return res.status(404).type("txt").send("Not found");
  }

  res.status(status).sendFile(htmlFor(req.path, found));
});

// Interfaz de escucha explícita. Por defecto loopback: `npm run server` y
// `npm run dev:all` en un portátil no deben publicar los dos endpoints de correo
// a toda la red de un café o de un cliente, que es lo que hacía un `listen(PORT)`
// sin host (Node ata 0.0.0.0 y ::). El contenedor necesita 0.0.0.0 para que la
// publicación de puertos de Docker funcione, y lo pone el propio Dockerfile.
const BIND_HOST = process.env.BIND_HOST || "127.0.0.1";

// Se resuelve al arrancar y se refresca, porque la IP del conector cambia si se
// recrea su contenedor. `unref()` para no mantener vivo el bucle de eventos: en
// los tests el proceso tiene que poder terminar.
// Una línea al arrancar para que esto sea comprobable en producción y no una
// creencia: dice si el conector se resolvió y, por tanto, qué identidad usan los
// contadores en cada vía. No imprime ninguna IP de visitante.
resolverTunel().then(() => {
  console.log(
    tunelResuelto
      ? `Conector del tunel resuelto (${TUNNEL_CONTAINER}, ${ipsDelTunel.size} direccion/es): ` +
        "cf-connecting-ip solo se acepta desde ahi; el resto usa el peer TCP"
      : `Conector del tunel SIN resolver (${TUNNEL_CONTAINER}): ` +
        "cf-connecting-ip NO se acepta de nadie; topes por identidad suspendidos, siguen los globales",
  );
  arrancado = true; // desde aquí, un cambio de estado sí merece una línea
});
setInterval(resolverTunel, 60_000).unref();

export const server = app.listen(PORT, BIND_HOST, () => {
  console.log(`Alondra server listening on http://${BIND_HOST}:${PORT}`);
});
