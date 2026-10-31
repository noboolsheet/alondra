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
  // Los topes POR IDENTIDAD sólo viven cuando el conector del túnel resuelve: sin
  // eso la clave sería compartida y repartir por ella cerraría el formulario a
  // terceros (ver la cabecera del bloque de identidad en el servidor). Apuntar
  // `TUNNEL_CONTAINER` a loopback hace que estas peticiones cuenten como entradas
  // por el túnel, que es la vía donde esos topes funcionan en producción.
  process.env.TUNNEL_CONTAINER = "127.0.0.1";
  const mod = await import("../../server/index.mjs");
  // Después del import, nunca antes: el servidor hace `import "dotenv/config"`,
  // así que borrarlas primero sólo conseguía que dotenv las repusiera desde
  // web/.env y que estos tests mandaran correos de verdad.
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
  server = mod.server;
  serverRedirects = mod.LEGACY_REDIRECTS;
  if (!server.listening) await new Promise((ok) => server.once("listening", ok));
  // La resolución del conector arranca al importar y es asíncrona.
  await new Promise((ok) => setTimeout(ok, 50));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server?.close();
  delete process.env.TUNNEL_CONTAINER;
});

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

/**
 * Cuerpo multipart construido a mano a propósito.
 *
 * `FormData` en este entorno lo crea jsdom y el `fetch` lo sirve undici, y
 * mezclarlos es frágil. Una cadena con el boundary explícito no depende de
 * ninguno de los dos y deja ver exactamente qué partes se mandan.
 */
const multipart = (partes: Array<[string, string]>, ficheros: string[] = []) => {
  const B = "----alondratest";
  let cuerpo = "";
  for (const [k, v] of partes) {
    cuerpo += `--${B}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  }
  for (const f of ficheros) {
    cuerpo += `--${B}\r\nContent-Disposition: form-data; name="cv"; filename="${f}"\r\n` +
      `Content-Type: application/pdf\r\n\r\n%PDF-1.4\r\n`;
  }
  return { cuerpo: cuerpo + `--${B}--\r\n`, tipo: `multipart/form-data; boundary=${B}` };
};

const postApp = (cuerpo: string, tipo: string, ip: string) =>
  fetch(`${base}/api/send-application`, {
    method: "POST",
    headers: { "Content-Type": tipo, "cf-connecting-ip": ip },
    body: cuerpo,
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

  /**
   * Regresión de la caída del proceso.
   *
   * Un cuerpo JSON puede traer cualquier tipo, y el valor por defecto de la
   * desestructuración sólo cubre `undefined`. Antes, `{"email": 1}` llegaba a
   * `email.trim()`, lanzaba TypeError dentro de un handler `async`, Express 4
   * descartaba el rechazo y Node 22 **mataba el proceso**: una petición sin
   * autenticar tumbaba el sitio entero, y encima antes del apunte de cuota, o
   * sea sin límite de frecuencia. Verificado en local antes del arreglo.
   *
   * Si este test vuelve a fallar, lo que falla no es una validación: es la
   * disponibilidad del sitio.
   */
  it("un campo que no es string se rechaza en vez de tumbar el proceso", async () => {
    // Los dos primeros grupos son distintos y los dos importan. `1`, `true` y
    // `null` se coercionan sin problema; los que llevan objeto son los que
    // **lanzaban dentro del propio arreglo**: `String({toString: 0})` tira
    // TypeError porque el toString no es invocable, y un array anidado muy
    // profundo tira RangeError al unirse. La primera versión de `texto()` usaba
    // `String(v)` a secas y reproducía la caída por esa vía.
    // `unknown[]` explícito: sin anotación, TypeScript deduce un tipo común de
    // los literales y luego rechaza los que no encajan en él (dos errores de
    // `tsc` en esta línea). Lo que se prueba es justamente que el campo puede
    // llegar con CUALQUIER tipo, así que el tipo de la lista es `unknown`.
    const hostiles: unknown[] = [1, true, null, {}, [], { toString: 0 }, { valueOf: 0, toString: 0 }];
    for (const email of hostiles) {
      const res = await post({ ...VALID, email }, `203.0.113.${Math.floor(Math.random() * 250) + 1}`);
      expect(res.status).toBe(400);
    }
    const anidado = JSON.parse(`{"a":${"[".repeat(2000)}${"]".repeat(2000)}}`).a;
    expect((await post({ ...VALID, name: anidado }, "203.0.113.249")).status).toBe(400);
    // La prueba de que el proceso sigue vivo: la petición siguiente se atiende.
    const despues = await post({ ...VALID, phone: "" }, "203.0.113.251");
    expect(despues.status).toBe(400);
  });

  it("un cuerpo que el parser rechaza responde 4xx, no 500", async () => {
    // El middleware de error ignoraba el estado que body-parser pone en sus
    // propios errores, así que un JSON truncado o un cuerpo demasiado grande
    // (faltas del cliente, 400 y 413) salían como 500 con traza: miente sobre de
    // quién es el problema y ensucia cualquier monitor que vigile los 5xx.
    const malFormado = await fetch(`${base}/api/send-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.240" },
      body: '{"a":',
    });
    expect(malFormado.status).toBe(400);
    const gigante = await fetch(`${base}/api/send-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.241" },
      body: JSON.stringify({ name: "a".repeat(41000) }),
    });
    expect(gigante.status).toBe(413);
  });

  it("un número en un campo de texto se trata como texto, no como error", async () => {
    // `{"name": 1}` es un nombre raro, no un ataque: se coerce a "1", pasa la
    // validación y llega al envío, que sin credenciales responde 500. Lo que
    // importa es que no revienta y que no se rechaza un envío legítimo.
    const res = await post({ ...VALID, name: 1 }, "203.0.113.252");
    expect(res.status).toBe(500);
  });

  it("con cupo global de sobra, el tope por identidad no se aplica", async () => {
    // Deliberado: la identidad sale de `cf-connecting-ip`, que el visitante
    // elige en las vías que no pasan por Cloudflare. Si el tope por identidad se
    // aplicara siempre, llenar el cubo de otra persona le negaría el formulario
    // teniendo cupo de sobra, o sea que el tope sería un arma. Sólo entra cuando
    // el cupo global ya va cargado (SEND_FAIR_FROM).
    const ip = "10.0.0.4";
    for (let i = 0; i < 6; i++) {
      const res = await post(VALID, ip);
      expect(res.status).not.toBe(429);
    }
  });

  it("un envío válido desde otra IP no queda bloqueado por el anterior", async () => {
    const res = await post(VALID, "10.0.0.5");
    expect(res.status).not.toBe(429);
  });
});

/**
 * Regresión de la redirección abierta.
 *
 * `req.path` es la ruta cruda sin normalizar, así que `//evil.example/` dejaba
 * `//evil.example` en `Location`: una referencia relativa al protocolo que el
 * navegador resuelve contra el esquema actual y manda al visitante fuera del
 * dominio, con un enlace que parece de alondrama.com. `encodeUrl` de Express no
 * lo impide: deja pasar `/` y `\`.
 *
 * Nota de entorno: el parser de URL del `fetch` convierte `\` en `/` antes de
 * escribir la petición, así que la variante con contrabarra colapsa en la de
 * doble barra y no hace falta un caso aparte aquí. Se verificó a mano con
 * `curl --path-as-is`.
 */
describe("redirección de barra final", () => {
  const location = async (ruta: string) => {
    const res = await fetch(`${base}${ruta}`, { redirect: "manual" });
    return { status: res.status, location: res.headers.get("location") ?? "" };
  };

  it("nunca emite un destino que salga del sitio", async () => {
    for (const ruta of ["//evil.example/", "///evil.example/", "//evil.example/contact/"]) {
      const { status, location: loc } = await location(ruta);
      expect(status).toBe(301);
      // Una sola barra inicial, y el carácter siguiente no es separador: eso es
      // lo que impide que el destino se lea como un host.
      expect(loc.startsWith("/")).toBe(true);
      expect(loc[1] === "/" || loc[1] === "\\").toBe(false);
    }
  });

  it("no redirige en bucle por el caso de x-forwarded-proto", async () => {
    // `HTTPS` no es `https`, así que sin pasar a minúsculas el 301 apuntaba a la
    // misma URL que acababa de pedirse: bucle infinito en el dominio del cliente.
    const res = await fetch(`${base}/pricing`, {
      redirect: "manual",
      headers: { host: "alondrama.com", "x-forwarded-proto": "HTTPS" },
    });
    expect(res.status).toBe(200);
  });

  it("sigue canonicalizando las rutas de verdad", async () => {
    expect(await location("/pricing/")).toEqual({ status: 301, location: "/pricing" });
    expect(await location("/es/precios/")).toEqual({ status: 301, location: "/es/precios" });
  });
});

/**
 * Regresión del corte previo a multer.
 *
 * El corte que corre antes del parser leía el contador de **envíos**, que sólo
 * avanza en la ruta de éxito, así que una petición que siempre falla la
 * validación no gastaba nada y el corte no podía saltar nunca: los 5 MB se
 * buffereaban enteros antes de rechazarla. Ahora hay un contador de intentos que
 * se apunta al entrar.
 */
describe("tope de intentos en la candidatura", () => {
  it("corta las peticiones inválidas repetidas antes de parsear el cuerpo", async () => {
    const ip = "10.9.9.9";
    let cortadaEn = 0;
    for (let i = 1; i <= 14 && !cortadaEn; i++) {
      const res = await postApp("{}", "application/json", ip);
      if (res.status === 429) cortadaEn = i;
    }
    expect(cortadaEn).toBeGreaterThan(0);
    expect(cortadaEn).toBeLessThanOrEqual(11);
  });
});

/**
 * Regresión de los límites del cuerpo multipart.
 *
 * multer recibía sólo `fileSize` y pasaba el objeto a busboy tal cual, y busboy
 * pone `Infinity` por defecto en `files`, `fields` y `parts`. El adjunto estaba
 * acotado y el resto del cuerpo no.
 */
describe("límites del cuerpo multipart", () => {
  it("rechaza demasiados campos de texto", async () => {
    const { cuerpo, tipo } = multipart(Array.from({ length: 25 }, (_, i) => [`f${i}`, "x"] as [string, string]));
    const res = await postApp(cuerpo, tipo, "10.9.1.1");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "too_many_fields" });
  });

  it("rechaza un campo de texto desmedido", async () => {
    const { cuerpo, tipo } = multipart([["name", "a".repeat(20000)]]);
    const res = await postApp(cuerpo, tipo, "10.9.1.2");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "field_too_long" });
  });

  it("rechaza más de un fichero", async () => {
    const { cuerpo, tipo } = multipart([["name", "Ana"]], ["a1.pdf", "a2.pdf"]);
    const res = await postApp(cuerpo, tipo, "10.9.1.3");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "too_many_files" });
  });

  it("rechaza un nombre de campo demasiado anidado con su propio código", async () => {
    // `fieldNestingDepth` se declaró sin su entrada en la tabla de errores, así
    // que una falta del cliente respondía 500 con traza. Los dos lados del mismo
    // cambio tienen que cuadrar.
    const { cuerpo, tipo } = multipart([["name[a][b][c][d]", "X"]]);
    const res = await postApp(cuerpo, tipo, "10.9.1.5");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "field_too_nested" });
  });

  it("una candidatura normal sigue pasando", async () => {
    const { cuerpo, tipo } = multipart(
      [["name", "Ana"], ["email", "ana@example.com"], ["phone", "3055550000"], ["role", "piano"], ["message", "hola"]],
      ["cv.pdf"],
    );
    const res = await postApp(cuerpo, tipo, "10.9.1.4");
    // 500 «Server not configured»: pasó el filtro y llegó al envío, que sin
    // credenciales no puede salir. Es la prueba de que los topes no estorban.
    expect(res.status).toBe(500);
  });
});

/**
 * Regresión de la devolución de cuota.
 *
 * El apunte va antes del `await` para que no haya ventana entre comprobar y
 * apuntar, pero sin devolverlo un envío que el proveedor rechaza gastaba cupo
 * igual. Con la ventana diaria eso era grave: unas 150 peticiones baratas en
 * pocas horas, sin que saliera ni un correo, dejaban los **dos** formularios en
 * 429 durante el resto del día. Y se autoinfligía solo tras un despliegue sin
 * credenciales, que es exactamente el estado de este test.
 *
 * Nota de alcance: precisamente porque aquí ningún envío puede salir, los
 * umbrales de la cuota (SEND_MAX, SEND_MAX_TOTAL, SEND_MAX_DAY) no se pueden
 * ejercitar por HTTP en esta suite. Lo que sí se fija, y es lo que se rompió, es
 * que un envío fallido no cuenta.
 */
describe("cuota de envíos", () => {
  it("un envío que no llega a salir no gasta cupo", async () => {
    // Veinte desde la misma identidad: sin la devolución, el décimo primero ya
    // respondería 429. Todos deben llegar al envío (500 sin credenciales).
    for (let i = 0; i < 20; i++) {
      const res = await post(VALID, "192.0.2.77");
      expect(res.status).toBe(500);
    }
  });

  it("tampoco gasta cupo global, ni con la identidad rotando", async () => {
    for (let i = 0; i < 60; i++) {
      const res = await post(VALID, `192.0.2.${i + 100}`);
      expect(res.status).not.toBe(429);
    }
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

/**
 * Regresión del interruptor de apagado que el contador de intentos llegó a ser.
 *
 * La primera versión de ese contador tenía un tope **global**: al alcanzarlo
 * respondía 429 a cualquiera. Eso lo accionaba cualquier cliente con 300
 * peticiones vacías (unos 50 KB), cuando lo que el contador existe para encarecer
 * es subir 300 ficheros de 5 MB, o sea 1,5 GB: abarataba la denegación unas
 * 30.000 veces y la volvía total. Ahora el mapa se acota expulsando la clave más
 * antigua, así que nadie puede negarle el formulario a otra persona.
 */
describe("la avalancha de intentos no niega el formulario a terceros", () => {
  it("tras muchas peticiones con identidad rotando, un visitante nuevo pasa", async () => {
    for (let i = 0; i < 120; i++) {
      await postApp("{}", "application/json", `172.20.${Math.floor(i / 256)}.${i % 256}`);
    }
    // Una identidad que no ha intentado nada tiene que llegar al envío.
    const { cuerpo, tipo } = multipart(
      [["name", "Ana"], ["email", "ana@example.com"], ["phone", "3055550000"], ["role", "piano"], ["message", "hola"]],
    );
    expect((await postApp(cuerpo, tipo, "8.8.4.4")).status).toBe(500);
    expect((await post(VALID, "8.8.4.5")).status).toBe(500);
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
