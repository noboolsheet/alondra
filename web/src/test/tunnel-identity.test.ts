/**
 * La identidad de los contadores no debe depender de una cabecera falsificable.
 *
 * `cf-connecting-ip` sólo es de fiar si la petición entró por el túnel, porque es
 * el borde de Cloudflare quien la escribe. El perfil de producción publica además
 * el puerto en `0.0.0.0` (LAN de casa y tailnet, decisión del dueño), y por esa
 * vía la cabecera la elige quien llama.
 *
 * `ipOf` distingue las dos vías comparando `req.ip` con la IP del conector,
 * resuelta por el DNS interno de Docker. Aquí no hay Docker, así que se apunta
 * `TUNNEL_CONTAINER` a una IP literal: `dns.lookup` resuelve una IP a sí misma, lo
 * que permite ejercitar las dos ramas sin red y de forma determinista.
 *
 * Lo que NO se puede comprobar aquí es la resolución real del nombre del conector
 * dentro de la red compartida de Docker, que necesita un demonio. Queda anotado en
 * SECURITY.md con el procedimiento.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const sendMail = vi.fn(async () => ({ messageId: "<simulado@test>" }));
vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail })) },
  createTransport: vi.fn(() => ({ sendMail })),
}));

const servidores: Server[] = [];

/** Servidor limpio con el conector apuntado a `contenedor`. */
const servidorCon = async (contenedor: string) => {
  process.env.PORT = "0";
  process.env.TUNNEL_CONTAINER = contenedor;
  process.env.GMAIL_USER = "pruebas@example.invalid";
  process.env.GMAIL_APP_PASSWORD = "no-es-una-password";
  vi.resetModules();
  const mod = await import("../../server/index.mjs");
  const server: Server = mod.server;
  if (!server.listening) await new Promise((ok) => server.once("listening", ok));
  servidores.push(server);
  // La resolución del conector es asíncrona y arranca al importar el módulo.
  await new Promise((ok) => setTimeout(ok, 50));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
};

const VALIDO = {
  name: "Ana",
  email: "ana@example.com",
  phone: "3055550000",
  zip: "33101",
  instrument: "piano",
  channel: "whatsapp",
  source: "google",
};

const enviar = (base: string, ip: string) =>
  fetch(`${base}/api/send-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(VALIDO),
  });

afterAll(() => {
  for (const s of servidores) s.close();
  delete process.env.TUNNEL_CONTAINER;
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
});

beforeEach(() => sendMail.mockClear());

describe("petición que NO viene del conector", () => {
  it("la cabecera deja de dar identidad: rotarla no abre un cubo nuevo", async () => {
    // El conector resuelve a una IP que no es la nuestra, así que estas peticiones
    // desde loopback son «la otra vía» y su identidad es `req.ip` = 127.0.0.1,
    // compartida por todas aunque la cabecera cambie en cada una.
    const base = await servidorCon("10.254.254.254");

    for (let i = 0; i < 10; i++) {
      expect((await enviar(base, `203.0.113.${i}`)).status).toBe(200);
    }
    // Décima primera con una cabecera que no se ha visto nunca. Antes esto era un
    // cubo nuevo y pasaba; ahora comparte el de 127.0.0.1, que ya está lleno.
    const res = await enviar(base, "198.51.100.254");
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "too_many" });
    expect(sendMail).toHaveBeenCalledTimes(10);
  });
});

describe("petición que SÍ viene del conector", () => {
  it("la cabecera sigue siendo la identidad, que es lo único que hay en esa vía", async () => {
    // Ahora el conector resuelve a loopback, así que estas peticiones cuentan como
    // entradas por el túnel. Ahí `req.ip` es el conector y sería la misma para
    // todo el mundo: la cabecera es lo único que separa a una visitante de otra.
    const base = await servidorCon("127.0.0.1");

    // Treinta identidades distintas, muy por encima del tope por identidad de 5,
    // y por debajo del tope global horario de 50: todas tienen que pasar.
    for (let i = 0; i < 30; i++) {
      expect((await enviar(base, `203.0.114.${i}`)).status).toBe(200);
    }
    expect(sendMail).toHaveBeenCalledTimes(30);

    // Y el tope por identidad sigue funcionando dentro de esa vía: la misma
    // cabecera repetida sí se corta.
    const repetida = "203.0.115.1";
    for (let i = 0; i < 5; i++) expect((await enviar(base, repetida)).status).toBe(200);
    expect((await enviar(base, repetida)).status).toBe(429);
  });
});

describe("conector sin resolver", () => {
  it("se mantiene el comportamiento anterior en vez de endurecer a ciegas", async () => {
    // Un nombre que no resuelve: es el caso de desarrollo local y el de un DNS con
    // hipo. Cerrarle el formulario a las familias por eso sería peor que el riesgo
    // que se está acotando, así que se degrada a lo de antes.
    const base = await servidorCon("conector-que-no-existe.invalid");
    for (let i = 0; i < 20; i++) {
      expect((await enviar(base, `203.0.116.${i}`)).status).toBe(200);
    }
  });
});
