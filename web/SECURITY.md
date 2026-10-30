# Postura de seguridad

Qué se revisó, qué se decidió a propósito y qué sigue abierto. Se escribe aquí
porque las decisiones de no actuar son tan importantes como los arreglos: sin el
motivo escrito, la siguiente persona las reabre o las repite.

Última revisión: 30-10-2026. Fuente revisada: el árbol de trabajo sobre `aa945dd`.

## Hechos del despliegue, comprobados contra el sitio vivo

Comprobados con peticiones GET de solo lectura a `alondrama.com` y con `dig`. No
se mandó ningún POST (habría enviado correo y gastado cupo) y no se provocó la
caída del proceso contra producción.

| Hecho | Estado |
|---|---|
| Los registros de `alondrama.com` y `www` están **proxeados** por Cloudflare | Confirmado: resuelven a IPs anycast de Cloudflare, sin CNAME visible a `cfargotunnel.com` |
| El origen responde **a través del borde** | Confirmado: `server: cloudflare`, `cf-ray` presentes |
| **Cloudflare sobreescribe `x-forwarded-proto`** | Confirmado: con `X-Forwarded-Proto: http` el origen responde 200 y no redirige, o sea que ve https |
| El HTML **no se cachea** en el borde | Confirmado: `cf-cache-status: DYNAMIC`. Quita el supuesto de envenenamiento de caché |
| Las cabeceras de seguridad llegan íntegras | Confirmado: CSP, HSTS (`max-age=15552000`), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` |
| Redirección al host canónico | Confirmado: `www` → apex y `http` → `https` |
| El **puerto publicado es alcanzable** sin pasar por el túnel | Confirmado: `http://100.91.3.5:4232/` responde 200 por el tailnet. Es la vía en la que `cf-connecting-ip` es del visitante |

Consecuencia que conviene tener clara: **la cabecera `cf-connecting-ip` no es
manipulable desde internet** (el borde la pone), pero **sí** por la vía del puerto
publicado, el tailnet y un Funnel activo. El tope global de envíos es lo que acota
el daño en esa vía, y la identidad por cabecera no es una frontera de seguridad.

## Los seis avisos de dependencias que quedan, y por qué no se actúa

`npm audit --omit=dev` (el árbol que instala la imagen de producción) reporta 6:
4 altos y 2 moderados. Bajó de 17 (1 crítico, 13 altos) moviendo
`tailwindcss-animate` a `devDependencies` (era un plugin de build cuyo
`peerDependency` arrastraba Tailwind y PostCSS enteros a la imagen) y aplicando
los parches que caben en los rangos ya declarados.

**Criterio:** no se cuenta un aviso por su severidad, sino por si **este** código
alcanza la ruta vulnerable. Un aviso alto en código que nunca se llama se dice y
se deja; uno moderado que se toca en cada petición se arregla.

### 1-3. `react-router-dom`, `react-router`, `@remix-run/router`: alto

Cinco avisos de redirección abierta y XSS vía destino de navegación, más uno de
inyección por constructor en `deserializeErrors()`.

**No alcanzable.** Los cinco necesitan un destino de navegación que controle el
atacante. Hay **una sola** llamada a `navigate()`, en
`src/i18n/LanguageContext.tsx`, y su argumento sale de `pathFor()` sobre el mapa
de rutas propio, no de la URL. Todos los `<Link to>` resuelven un `PageKey` del
repo. El de `deserializeErrors` necesita un data router, y aquí el enrutado es
declarativo (`<BrowserRouter>` + `<Routes>`), sin loaders.

**No se actúa** porque el arreglo limpio es React Router 7, un salto mayor con
migración conocida, para riesgo cero alcanzable. Además **dos de los avisos
cubren toda la línea 6.x**, así que subir a 6.30.x tampoco deja el informe limpio:
no merece la pena perseguirlo.

**Qué cambiaría la decisión:** que alguna navegación pase a construirse con algo
que venga de la URL, del fragmento o de un tercero.

### 4. `nodemailer`: alto

22 avisos. Sólo una familia es alcanzable: el coste cuadrático del parser de
direcciones, al que llega el `replyTo` con el correo y el nombre del visitante.
Las otras tres no: la de rutas y URLs en adjuntos necesita un `path`/`href`, y
aquí el adjunto es un `Buffer`; la de dominio de destino necesita influir en el
`to`, que sale del entorno; y la de TLS es de OAuth2, y esto usa App Password.

**No se actúa** porque el arreglo es `6 → 10`, cuatro versiones mayores, en el
camino de envío de correo, cuyo modo de fallo es **perder leads en silencio**.

**Mitigación aplicada en su lugar:** se acota la entrada que alimenta ese parser,
`EMAIL_MAX = 254` (máximo de la RFC 5321) y `NOMBRE_MAX = 200`, en los dos
endpoints. Quita el material del ataque sin tocar la dependencia.

**Qué cambiaría la decisión:** que aparezca un aviso alcanzable fuera de esa
familia, o que el proyecto necesite OAuth2 en vez de App Password.

### 5. `qs`: moderado

Denegación de servicio por `isBuffer` controlable, y un fallo de `qs.stringify`
con `arrayFormat: 'comma'`.

**El primero se alcanza en cada petición** (Express instala su middleware de query
con `allowPrototypes: true`), pero el impacto está acotado: `qs` bloquea
`__proto__` explícitamente, así que no hay contaminación de `Object.prototype`, y
el `TypeError` cae en el middleware de error de este servidor, que responde un 400
para esa petición. No tumba el proceso. **El segundo no se alcanza**: Express
nunca llama a `qs.stringify`.

**No se actúa del todo.** Se subió a **6.15.4**, que es lo que cabe en el rango
`~6.15.1` que declara Express y que cierra el salto del límite de arrays. El
arreglo del `isBuffer` está en **6.16.0, fuera de ese rango**: forzarlo pediría una
entrada en `overrides`, o sea pinchar una dependencia por encima de lo que su
padre declara soportar, a cambio de evitar un 400 en una petición.

**Qué cambiaría la decisión:** que Express 4 amplíe su rango de `qs`, o que
aparezca una ruta que escale esto por encima de un 400.

### 6. `express`: moderado

Aparece **solo como padre de `qs`**. Express 4.22.2 no tiene ningún aviso propio.
Se resuelve con el punto 5.

## Riesgos residuales

**Los umbrales de la cuota no se pueden ejercitar sin un transporte de correo.**
Desde que un envío fallido devuelve su marca al cupo, en `server.test.ts` (que no
tiene credenciales a propósito) no cuenta nada. Los tres topes se cubren en
`src/test/send-quota.test.ts`, que intercepta `nodemailer` para decidir si el
envío sale o falla, y adelanta el reloj con `toFake: ["Date"]` para llegar a la
ventana diaria. Si alguien quita ese mock, los tres números se quedan sin red.

**`cf-connecting-ip` es del visitante en la vía directa.** Comprobado arriba que
el puerto responde por el tailnet. El tope global acota el daño al cupo de Gmail;
el tope por identidad es reparto, no seguridad, y además **sólo se aplica desde
`SEND_FAIR_FROM`** para que llenar el cubo de otra persona no le niegue el
formulario habiendo cupo de sobra.

**`/api/send-contact` no tiene contador de intentos**, a diferencia de la
candidatura. Es deliberado: su cuerpo está acotado a 32 kB por `express.json`, así
que una petición inválida cuesta poco. Si ese endpoint acepta algo caro algún día,
hay que extenderlo.

**Con `VITE_HOST=::` el servidor de desarrollo sirve el árbol de `web/`**: código,
`package-lock.json` y los documentos internos (`CLAUDE.md` sale como
`text/markdown`, comprobado). Eso es lo que hace un servidor de desarrollo; por eso
el valor por defecto es loopback y esa variable es una decisión explícita. Los
secretos sí están cubiertos: `.env*` y `cloudflared/` están en `server.fs.deny`,
y se comprobó levantando el servidor (403 en los dos).

**El contenedor corre como root.** No hay `USER` en el `Dockerfile`. No se cambió
en esta ronda para no mezclar un cambio de permisos de fichero con los arreglos de
seguridad del código; es el siguiente candidato natural.

**Las etiquetas de imagen flotan**: `node:22-alpine` y
`cloudflare/cloudflared:latest`. Dos despliegues pueden no dar la misma imagen.

**El historial de reinicios del contenedor sigue sin comprobar.** Es la única
tarea de esta ronda que no se pudo cerrar: `ssh vibox` llega al host por el
tailnet pero rechaza la clave pública de esta máquina. Hay que ejecutarlo en vibox:

```sh
# ¿Se ha caído ya el proceso en producción por el fallo de coerción de tipo?
docker inspect -f '{{.RestartCount}} {{.State.StartedAt}} {{.State.ExitCode}}' alondra.app.prod
docker logs alondra.app.prod 2>&1 | grep -c 'Alondra server listening'   # arranques
docker logs alondra.app.prod 2>&1 | grep -c 'is not a function'          # el TypeError

# ¿Está relajado el modo de rechazos no capturados? (tapa la password antes de pegar)
docker inspect -f '{{json .Config.Env}}' alondra.app.prod | sed -E 's/(GMAIL_APP_PASSWORD=)[^",]+/\1***/'

# ¿Quién más cuelga del bridge compartido y alcanza al contenedor por su nombre?
docker network inspect noboolsheet_network --format '{{range .Containers}}{{.Name}} {{end}}'
```

Un `RestartCount` por encima de cero junto con una traza `is not a function` es la
confirmación de que el fallo ya se disparó en producción, y se obtiene **sin enviar
una sola petición**.
