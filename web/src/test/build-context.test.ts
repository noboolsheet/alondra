/**
 * El contexto de build es una segunda lista de exclusión, y se desincronizó.
 *
 * `web/Dockerfile` hace `COPY . .` en la etapa de build, así que `.dockerignore`
 * es el único filtro entre el árbol de trabajo y una capa de imagen. `.gitignore`
 * protege lo mismo para otro destino. Cuando el commit 35a2fe8 añadió la
 * credencial del túnel a `.gitignore` bajo el rótulo SECRETO, `.dockerignore` no
 * se tocó: en la máquina donde ese fichero existe entraba entero en la capa del
 * builder, y quien pueda leer el almacén de capas o el caché de build del demonio
 * obtiene una credencial que vale para servir alondrama.com.
 *
 * Este test es el guardián de esa sincronía. No comprueba una imagen construida,
 * que necesitaría un demonio de Docker: comprueba que cada ruta que el repo
 * declara secreta esté excluida también del contexto.
 */
import { readFileSync } from "node:fs";

const dockerignore = () =>
  readFileSync(".dockerignore", "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

describe("contexto de build de Docker", () => {
  it("excluye todo lo que .gitignore marca como secreto", () => {
    const di = dockerignore();
    // Las rutas que .gitignore declara secretas, en su forma relativa a web/.
    const secretos = [
      { patron: "cloudflared", porque: "credenciales del túnel (web/cloudflared/*.json y *.pem)" },
      { patron: ".env", porque: "GMAIL_USER y GMAIL_APP_PASSWORD" },
      { patron: ".env.*", porque: "los .env por perfil" },
    ];
    for (const { patron, porque } of secretos) {
      expect(di, `.dockerignore debe excluir "${patron}": ${porque}`).toContain(patron);
    }
  });

  it("el .env.example sí entra, porque no es un secreto", () => {
    expect(dockerignore()).toContain("!.env.example");
  });

  it("excluye los .DS_Store de cualquier subdirectorio, no sólo el de la raíz", () => {
    // Un patrón sin anclar en .dockerignore sólo coincide con la raíz del
    // contexto, así que `.DS_Store` a secas dejaba pasar los de public/.
    expect(dockerignore()).toContain("**/.DS_Store");
  });

  it("el proceso no corre como root", () => {
    // El contenedor corría como uid 0 por no declarar usuario. No hace falta:
    // el servidor no escribe en disco y el puerto es 3000, por encima de 1024.
    const df = readFileSync("Dockerfile", "utf8");
    const lineas = df.split("\n").map((l) => l.trim());
    const iUser = lineas.findIndex((l) => l === "USER node");
    const iCmd = lineas.findIndex((l) => l.startsWith("CMD"));
    expect(iUser, "falta `USER node` en el Dockerfile").toBeGreaterThan(-1);
    expect(iUser, "`USER node` tiene que ir antes del CMD").toBeLessThan(iCmd);
    // Y después de los COPY: si se cuela antes, los ficheros quedarían a nombre
    // del usuario de la aplicación, que es justo lo que no se quiere.
    const ultimoCopy = lineas.reduce((acc, l, i) => (l.startsWith("COPY") ? i : acc), -1);
    expect(iUser).toBeGreaterThan(ultimoCopy);
  });

  it("las imágenes están fijadas por digest, no por etiqueta flotante", () => {
    // `node:22-alpine` y `cloudflared:latest` hacían que dos despliegues del mismo
    // commit pudieran construir con bases distintas. Cómo refrescarlos: SECURITY.md.
    const df = readFileSync("Dockerfile", "utf8");
    const froms = df.split("\n").filter((l) => l.startsWith("FROM"));
    expect(froms).toHaveLength(2);
    for (const f of froms) expect(f, `FROM sin digest: ${f}`).toMatch(/@sha256:[0-9a-f]{64}/);
    // Las dos etapas tienen que usar la MISMA base, o el build y el runtime
    // podrían diferir en versión de Node.
    const digests = froms.map((f) => f.match(/@(sha256:[0-9a-f]{64})/)![1]);
    expect(digests[0]).toBe(digests[1]);

    const cf = readFileSync("cloudflared.docker-compose.yml", "utf8");
    expect(cf).toMatch(/image: cloudflare\/cloudflared:\S*@sha256:[0-9a-f]{64}/);
  });

  it("la etapa de runtime sigue copiando sólo el build y el servidor", () => {
    // La exposición de la credencial quedaba en la capa del builder justamente
    // porque el runtime no arrastra el directorio. Si alguien amplía estos COPY,
    // el alcance del hallazgo cambia y hay que revisarlo.
    const df = readFileSync("Dockerfile", "utf8");
    const copias = df.split("\n").filter((l) => /^COPY/.test(l.trim()) && l.includes("./"));
    expect(copias.some((l) => l.includes("/app/dist"))).toBe(true);
    expect(copias.some((l) => l.includes("server"))).toBe(true);
    expect(copias.some((l) => l.includes("cloudflared"))).toBe(false);
  });
});
