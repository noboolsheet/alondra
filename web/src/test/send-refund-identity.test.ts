/**
 * Regresión: la devolución de cuota tiene que caer en la clave que pagó.
 *
 * `noteSend` apunta el envío ANTES del `await` (para que no haya ventana entre
 * comprobar y apuntar) y `refundSend` lo devuelve DESPUÉS, si el proveedor no lo
 * acepta. Entre esos dos momentos pasa hasta el `socketTimeout` del transporte,
 * 20 s, y el refresco del conector del túnel corre cada minuto: si cae dentro de
 * esa ventana, la identidad de la MISMA petición cambia (con el conector
 * resuelto es `cf-connecting-ip`; sin resolver, el peer TCP sin verificar).
 *
 * `refundSend` recalculaba la identidad, así que descontaba de la clave nueva y
 * dejaba la marca colgada en la del apunte: cupo gastado por un correo que no
 * salió, y encima en el cubo de un visitante concreto. Ahora `noteSend` devuelve
 * la clave con la marca y la devolución usa ésa.
 *
 * El montaje imita las dos piezas que hacen falta y nada más: `nodemailer` para
 * dejar un envío colgado a voluntad, y `node:dns/promises` para mover la
 * resolución del conector mientras ese envío está en vuelo.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

/** `null` = el envío queda colgado hasta que el test lo resuelva. */
let colgado: ((err: Error) => void) | null = null;
const sendMail = vi.fn(async () => {
  if (!colgado) return { messageId: "<simulado@test>" };
  return new Promise((_ok, rechazar) => {
    colgado = rechazar;
  });
});

vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail })) },
  createTransport: vi.fn(() => ({ sendMail })),
}));

/** Lo que contesta el DNS interno de Docker al preguntar por el conector. */
let dnsResuelve = true;
const lookup = vi.fn(async () => {
  if (!dnsResuelve) throw Object.assign(new Error("getaddrinfo EAI_AGAIN"), { code: "EAI_AGAIN" });
  return [{ address: "127.0.0.1", family: 4 }];
});

vi.mock("node:dns/promises", () => ({ default: { lookup }, lookup }));

const VALIDO = {
  name: "Ana",
  email: "ana@example.com",
  phone: "3055550000",
  zip: "33101",
  instrument: "piano",
  channel: "whatsapp",
  source: "google",
};

let base = "";
let server: Server;
let resolverTunel: () => Promise<void>;

const enviar = (ip: string) =>
  fetch(`${base}/api/send-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(VALIDO),
  });

/** Espera a que una condición se cumpla, sin dormir un plazo fijo. */
const esperarA = async (cond: () => boolean) => {
  for (let i = 0; i < 200 && !cond(); i++) await new Promise((ok) => setTimeout(ok, 5));
  expect(cond()).toBe(true);
};

beforeAll(async () => {
  process.env.PORT = "0";
  // El conector se resuelve a loopback, así que estas peticiones cuentan como
  // entradas por el túnel y su identidad es la cabecera `cf-connecting-ip`, que
  // es la vía donde los topes por identidad funcionan en producción.
  process.env.TUNNEL_CONTAINER = "alondra.cloudflared";
  process.env.GMAIL_USER = "pruebas@example.invalid";
  process.env.GMAIL_APP_PASSWORD = "no-es-una-password";
  const mod = await import("../../server/index.mjs");
  server = mod.server;
  resolverTunel = mod.resolverTunel;
  if (!server.listening) await new Promise((ok) => server.once("listening", ok));
  await esperarA(() => lookup.mock.calls.length > 0);
  await resolverTunel();
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server?.close();
  delete process.env.TUNNEL_CONTAINER;
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
});

describe("el conector cambia de estado mientras un envío está en vuelo", () => {
  it("la cuota vuelve al cubo que la gastó, no al de la identidad nueva", async () => {
    const IDENTIDAD = "203.0.113.9";

    // 1. Un envío de esa identidad se queda esperando al proveedor.
    colgado = () => {};
    const enVuelo = enviar(IDENTIDAD);
    await esperarA(() => sendMail.mock.calls.length === 1);

    // 2. Y justo ahí el conector deja de resolver, que es el refresco de cada
    //    minuto cayendo dentro del `await`. A partir de este punto la identidad
    //    de esa misma petición ya no es la cabecera.
    dnsResuelve = false;
    await resolverTunel();

    // 3. El proveedor rechaza: toca devolver la marca.
    (colgado as (err: Error) => void)(new Error("SMTP simulado: el proveedor rechaza"));
    expect((await enVuelo).status).toBe(500);

    // 4. Vuelve el DNS y con él la identidad por cabecera.
    dnsResuelve = true;
    await resolverTunel();
    colgado = null; // los envíos siguientes salen bien

    // 5. El tope por identidad sólo se aplica desde SEND_FAIR_FROM (10) envíos
    //    globales en la hora, así que primero se carga el cupo global con otras
    //    identidades. Diez, que es el umbral.
    for (let i = 0; i < 10; i++) {
      expect((await enviar(`198.51.100.${i + 1}`)).status).toBe(200);
    }

    // 6. Y ahora los CINCO envíos que SEND_MAX le concede a esa identidad. Si la
    //    devolución hubiera caído en otra clave, quedaría una marca colgada en
    //    este cubo y el quinto respondería 429.
    for (let i = 0; i < 5; i++) {
      expect((await enviar(IDENTIDAD)).status).toBe(200);
    }

    // 7. El sexto sí: la cuenta de esa identidad es exactamente cinco, ni cuatro
    //    (una marca de más) ni seis.
    expect((await enviar(IDENTIDAD)).status).toBe(429);
  });
});
