/**
 * Los tres topes de la cuota de correo, con envíos que de verdad tienen éxito.
 *
 * Por qué hace falta un fichero aparte y un mock. En `server.test.ts` no hay
 * credenciales a propósito, así que ningún envío sale y, desde que un envío
 * fallido devuelve su marca al cupo (`refundSend`), **ahí no se puede ejercitar
 * ningún tope**: nada cuenta. Eso dejaba sin cobertura justo los tres números que
 * protegen la cuenta de correo del cliente.
 *
 * Aquí se intercepta `nodemailer` para controlar si `sendMail` resuelve o
 * rechaza. No se toca el código de producción: añadir un transporte de pruebas al
 * servidor habría metido una vía de configuración en el camino de las
 * credenciales, y eso es peor que un mock en un test.
 *
 * El reloj se adelanta con `toFake: ["Date"]` y nada más: el servidor decide las
 * ventanas con `Date.now()`, pero los sockets necesitan `setTimeout` de verdad o
 * las peticiones se quedan colgadas.
 */
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

/** Controla el resultado de cada envío. `true` resuelve, `false` rechaza. */
let envioSale = true;
const sendMail = vi.fn(async () => {
  if (!envioSale) throw new Error("SMTP simulado: el proveedor rechaza");
  return { messageId: "<simulado@test>" };
});

vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail })) },
  createTransport: vi.fn(() => ({ sendMail })),
}));

/**
 * Un servidor recién importado por bloque.
 *
 * Los contadores de la cuota son estado de módulo, así que dos bloques en el
 * mismo fichero heredarían el contador del anterior y los números dejarían de
 * significar nada. Una query distinta en el especificador salta la caché de
 * módulos de ESM y da una instancia limpia, con sus contadores a cero.
 */
const servidores: Server[] = [];

const nuevoServidor = async () => {
  process.env.PORT = "0";
  // `vi.resetModules()` vacía el registro de módulos, así que el import siguiente
  // vuelve a evaluar el servidor con sus contadores a cero. Tiene que ser un
  // especificador literal: Vite no sabe analizar uno construido con plantilla.
  vi.resetModules();
  const mod = await import("../../server/index.mjs");
  const server: Server = mod.server;
  if (!server.listening) await new Promise((ok) => server.once("listening", ok));
  servidores.push(server);
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

const enviarA = (base: string, ip: string) =>
  fetch(`${base}/api/send-contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(VALIDO),
  });

beforeAll(async () => {
  // Credenciales de mentira: con el mock puesto no se abre ninguna conexión, y
  // son necesarias para que `getTransporter()` no devuelva null.
  process.env.GMAIL_USER = "pruebas@example.invalid";
  process.env.GMAIL_APP_PASSWORD = "no-es-una-password";
  // Si el mock no estuviera activo, el servidor usaría el nodemailer de verdad y
  // estas credenciales falsas intentarían hablar con Gmail. Se comprueba antes de
  // mandar nada.
  const nodemailer = await import("nodemailer");
  expect(vi.isMockFunction(nodemailer.createTransport)).toBe(true);
});

afterAll(() => {
  for (const s of servidores) s.close();
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
});

beforeEach(() => {
  envioSale = true;
  sendMail.mockClear();
});

describe("tope por identidad (SEND_MAX, desde SEND_FAIR_FROM)", () => {
  it("corta a la sexta de una identidad cuando el cupo global ya va cargado", async () => {
    const base = await nuevoServidor();
    const enviar = (ip: string) => enviarA(base, ip);

    // Diez envíos con éxito desde identidades distintas llevan el contador
    // horario global a SEND_FAIR_FROM, que es cuando el tope por identidad entra.
    for (let i = 0; i < 10; i++) expect((await enviar(`198.18.0.${i}`)).status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(10);

    const ip = "198.18.1.1";
    for (let i = 0; i < 5; i++) expect((await enviar(ip)).status).toBe(200);
    const sexta = await enviar(ip);
    expect(sexta.status).toBe(429);
    expect(await sexta.json()).toEqual({ ok: false, error: "too_many" });

    // Y la clave: otra identidad sí pasa, así que el corte es por identidad y no
    // un apagón para todos.
    expect((await enviar("198.18.1.2")).status).toBe(200);
  });
});

describe("tope global horario (SEND_MAX_TOTAL)", () => {
  it("corta a todo el mundo al llegar a 50 en la hora", async () => {
    const base = await nuevoServidor();
    // Una identidad distinta por envío, así que el tope por identidad nunca
    // entra: si algo corta, sólo puede ser el global.
    let cortadaEn = 0;
    for (let i = 0; i < 70 && !cortadaEn; i++) {
      const ip = `198.19.${Math.floor(i / 256)}.${i % 256}`;
      if ((await enviarA(base, ip)).status === 429) cortadaEn = i + 1;
    }
    expect(cortadaEn).toBe(51); // los cincuenta primeros salen, el 51 ya no
    // Una identidad nueva tampoco pasa: el tope global es para todos.
    expect((await enviarA(base, "198.19.9.9")).status).toBe(429);
    expect(sendMail).toHaveBeenCalledTimes(50);
  });
});

describe("tope global diario (SEND_MAX_DAY)", () => {
  it("sobrevive al vaciado de la ventana horaria y corta a los 150 del día", async () => {
    const base = await nuevoServidor();
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      const inicio = new Date("2026-11-02T09:00:00Z");
      vi.setSystemTime(inicio);

      // Tres tandas de cincuenta, cada una tras vaciarse la ventana horaria. El
      // tope horario deja pasar las tres; el diario tiene que acumularlas.
      for (let tanda = 0; tanda < 3; tanda++) {
        vi.setSystemTime(new Date(inicio.getTime() + tanda * 61 * 60 * 1000));
        for (let i = 0; i < 50; i++) {
          expect((await enviarA(base, `198.20.${tanda}.${i}`)).status).toBe(200);
        }
      }
      expect(sendMail).toHaveBeenCalledTimes(150);

      // Cuarta tanda, con la ventana horaria otra vez vacía: ahora el único tope
      // que puede cortar es el diario, y tiene que cortar.
      vi.setSystemTime(new Date(inicio.getTime() + 3 * 61 * 60 * 1000));
      const res = await enviarA(base, "198.20.9.9");
      expect(res.status).toBe(429);
      expect(await res.json()).toEqual({ ok: false, error: "too_many" });

      // Y pasado el día entero, vuelve a abrirse.
      vi.setSystemTime(new Date(inicio.getTime() + 25 * 60 * 60 * 1000));
      expect((await enviarA(base, "198.20.9.10")).status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("devolución de cuota cuando el envío falla", () => {
  it("un envío que el proveedor rechaza no gasta cupo de ninguno de los tres topes", async () => {
    const base = await nuevoServidor();
    envioSale = false;
    // Veinte fallos desde la misma identidad: sin devolución, en cuanto el global
    // pasara de SEND_FAIR_FROM el sexto daría 429.
    for (let i = 0; i < 20; i++) expect((await enviarA(base, "198.21.0.1")).status).toBe(500);
    expect(sendMail).toHaveBeenCalledTimes(20);

    // Y sesenta más rotando identidad: superan de largo el tope horario de 50 sin
    // que ninguno cuente, porque ninguno salió.
    for (let i = 0; i < 60; i++) {
      expect((await enviarA(base, `198.21.1.${i}`)).status).toBe(500);
    }

    // Con el proveedor recuperado, el cupo está intacto: un envío sale.
    envioSale = true;
    expect((await enviarA(base, "198.21.2.1")).status).toBe(200);
  });
});
