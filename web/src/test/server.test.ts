/**
 * Tests del servidor Express.
 *
 * `server/index.mjs` es el único fichero que recibe datos de desconocidos y
 * manda correo, y era el único sin tests. El honeypot, por ejemplo, depende de
 * que el campo se llame `company` en tres sitios a la vez (los dos formularios
 * y el servidor): renombrarlo en el formulario lo dejaba muerto en silencio.
 *
 * Sólo se prueban los caminos que terminan antes de hablar con Gmail, y además
 * se borran las credenciales del entorno antes de importar el servidor, para que
 * ni un fallo futuro en estos tests pueda mandar un correo de verdad.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { LEGACY_REDIRECTS as CLIENT_REDIRECTS, pathFor } from "@/i18n/routes";

let base = "";
let server: Server;
let serverRedirects: Record<string, string>;

beforeAll(async () => {
  process.env.PORT = "0"; // que el sistema elija un puerto libre
  const mod = await import("../../server/index.mjs");
  // Después del import, nunca antes: el servidor hace `import "dotenv/config"`,
  // así que borrarlas primero sólo conseguía que dotenv las repusiera desde
  // web/.env y que estos tests mandaran correos de verdad.
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
  server = mod.server;
  serverRedirects = mod.LEGACY_REDIRECTS;
  if (!server.listening) await new Promise((ok) => server.once("listening", ok));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server?.close());

/** Los siete campos que el servidor exige en /api/send-contact. */
const VALID = {
  name: "Ana",
  email: "ana@example.com",
  phone: "3055550000",
  zip: "33101",
  instrument: "piano",
  channel: "whatsapp",
  source: "google",
};

// Cada test usa su propia IP: el tope de envíos cuenta por IP y así no se pisan.
const post = (body: Record<string, unknown>, ip: string) =>
  fetch(`${base}/api/send-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(body),
  });

describe("POST /api/send-contact", () => {
  it("el honeypot corta el envío y no lo delata", async () => {
    const res = await post({ ...VALID, company: "Acme" }, "10.0.0.1");
    // Sin credenciales, un envío de verdad respondería 500: el 200 con ok:true
    // es la prueba de que se paró en el honeypot sin intentar mandar nada.
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("rechaza si falta un campo obligatorio", async () => {
    const res = await post({ ...VALID, phone: "" }, "10.0.0.2");
    expect(res.status).toBe(400);
  });

  it("rechaza un email con forma inválida", async () => {
    const res = await post({ ...VALID, email: "ana@ejemplo" }, "10.0.0.3");
    expect(res.status).toBe(400);
  });

  it("corta al sexto envío de la misma IP en una hora", async () => {
    const ip = "10.0.0.4";
    for (let i = 0; i < 5; i++) {
      const res = await post(VALID, ip);
      expect(res.status).not.toBe(429);
    }
    const res = await post(VALID, ip);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "too_many" });
  });

  it("un envío válido desde otra IP no queda bloqueado por el anterior", async () => {
    const res = await post(VALID, "10.0.0.5");
    expect(res.status).not.toBe(429);
  });
});

describe("el honeypot", () => {
  it("se llama igual en los dos formularios que en el servidor", async () => {
    // El servidor busca `company` (lo fija el test de arriba). Si alguien lo
    // renombra en un formulario, los bots pasan y nada más se entera: aquí es
    // donde salta. Se leen los ficheros en vez de renderizarlos porque el campo
    // está oculto y lo único que importa es cómo se llama.
    const { readFile } = await import("node:fs/promises");
    for (const f of ["src/components/ContactForm.tsx", "src/components/ApplicationForm.tsx"]) {
      expect(await readFile(f, "utf8")).toContain('name="company"');
    }
  });
});

describe("tope global de envíos", () => {
  it("corta aunque cada IP envíe una sola vez", async () => {
    // Una IP distinta por petición, así que el tope por IP nunca entra: si algo
    // devuelve 429 sólo puede ser el global. Es lo que protege el cupo de Gmail
    // de quien llegue al puerto por la LAN y vaya cambiando la cabecera.
    let cortadaEn = 0;
    for (let i = 0; i < 60 && !cortadaEn; i++) {
      const res = await post(VALID, `172.16.0.${i}`);
      if (res.status === 429) cortadaEn = i + 1;
    }
    expect(cortadaEn).toBeGreaterThan(0);
    expect(cortadaEn).toBeLessThanOrEqual(51);
  });
});

/**
 * Las URLs viejas están escritas dos veces: el mapa de rutas del cliente y la
 * tabla del servidor, que es la que de verdad responde el 301. `routes.json`
 * sólo lleva las rutas vivas, así que una entrada que falte aquí no se queda a
 * medias: la URL antigua responde 404 y pierde el posicionamiento acumulado.
 */
describe("redirecciones de URLs viejas", () => {
  it("la tabla del servidor cuadra con la del mapa de rutas", () => {
    expect(Object.keys(serverRedirects).sort()).toEqual(Object.keys(CLIENT_REDIRECTS).sort());
    for (const [old, key] of Object.entries(CLIENT_REDIRECTS)) {
      expect(serverRedirects[old]).toBe(pathFor(key, "en"));
    }
  });
});
