# Postura de seguridad

Qué se revisó, qué se decidió a propósito y qué sigue abierto. Se escribe aquí
porque las decisiones de no actuar son tan importantes como los arreglos: sin el
motivo escrito, la siguiente persona las reabre o las repite.

Última revisión: 30-10-2026. Fuente revisada: el árbol de trabajo sobre `0a5ea6e`.

**Cómo leer este fichero.** Cada cosa está marcada con dónde está aplicada:

- **`[producción]`** aplicado y comprobado contra el sitio vivo.
- **`[local]`** en el repositorio, pendiente de desplegar. No surte efecto hasta
  que alguien ejecute el despliegue.
- **`[aceptado]`** riesgo conocido que se decide no arreglar, con el motivo.

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
publicado, el tailnet y un Funnel activo. Eso es lo que atacó la ronda de la tarde:
el servidor ya sólo se cree esa cabecera cuando la petición viene del conector del
túnel (siguiente sección). Hasta que se despliegue, el tope global de envíos es lo
único que acota el daño en esa vía.

## Lo que endureció la ronda del 30-10-2026 (tarde)

Todo esto está **`[local]`**: en el repositorio y probado en local, sin desplegar.

### La identidad de los contadores ya no se apoya en una cabecera falsificable

El problema estaba en que `cf-connecting-ip` sólo es de fiar si la petición entró
por el túnel, y el perfil de producción publica además el puerto en `0.0.0.0`.

`ipOf` distingue ahora las dos vías por algo que no se puede falsificar: la
dirección del otro extremo del socket. El conector es un contenedor de la red
compartida, así que su nombre se resuelve por el DNS interno de Docker:

- **desde el conector**: se acepta la cabecera, que es lo único que da identidad
  por visitante en esa vía (ahí `req.ip` es el conector para todo el mundo);
- **desde cualquier otro sitio** (puerto publicado, tailnet, otro contenedor de la
  red compartida): se usa `req.ip`, el peer TCP real;
- **si la resolución falla**: se cae al comportamiento anterior. Degradar es
  aceptable; cerrarle el formulario a las familias por un fallo de DNS no lo es.

`trust proxy` de Express sigue **sin** configurar a propósito: con él `req.ip`
pasaría a leerse de `x-forwarded-for`, que sí es falsificable, y es además lo que
mantiene inerte el aviso crítico de `proxy-addr`.

**Evidencia.** Tres tests en `src/test/tunnel-identity.test.ts` cubren las tres
ramas, forzándolas sin red (se apunta `TUNNEL_CONTAINER` a una IP literal, que
`dns.lookup` resuelve a sí misma). El servidor imprime al arrancar si resolvió el
conector, así que en producción se comprueba leyendo una línea de log, no
creyéndose esto. Lo que **no** se puede probar aquí es la resolución real del
nombre dentro de la red de Docker, que necesita un demonio; la evidencia indirecta
es que el conector ya resuelve hoy `alondra.app.prod` para alcanzar la aplicación,
o sea que el DNS interno maneja este formato de nombre.

### Las vías de entrada, analizadas

| Vía | ¿Necesaria? | Qué se hizo |
|---|---|---|
| Túnel de Cloudflare → `alondra.app.prod:3000` | **Sí**, es la puerta pública | No se toca. Es la única vía donde la cabecera es de fiar |
| Puerto publicado `0.0.0.0:4232` | **Sí**, por decisión del dueño (entrar desde la red local, 27-09-2026) | Se mantiene. Lo que se quita es que esa vía pueda falsificar identidad |
| Tailscale Funnel (`expose.sh`) | **No**, es una herramienta puntual | Sigue apagada por defecto. Es la vía más expuesta: pone el puerto en internet **sin Cloudflare delante**, así que ahí `req.ip` es el de `tailscaled` y todos los visitantes comparten cubo. Comprobar con `./expose.sh status` y apagar con `./expose.sh off` |
| Contenedor dev `127.0.0.1:4230` | Sí, y ya era loopback | Nada que restringir |

### El contenedor ya no corre como root

`USER node` (uid 1000, que la imagen oficial ya trae) en la etapa de runtime. No
hizo falta nada más: el servidor **no escribe en disco** en runtime (sólo lee
`routes.json` y sirve ficheros de `dist/`, y multer usa `memoryStorage`), y el
puerto 3000 está por encima de 1024, así que no necesita privilegios para atarlo.

Los ficheros se quedan a nombre de root **a propósito**: no se usa `--chown`, así
que el usuario que atiende las peticiones no puede modificar su propio código ni el
build. Eso es lo que se quiere de un proceso expuesto a internet.

**Evidencia.** Dos tests estáticos en `src/test/build-context.test.ts` comprueban
que `USER node` existe, que va **después** de los `COPY` (si se colara antes, los
ficheros quedarían a nombre del usuario de la aplicación) y antes del `CMD`. Lo que
**no** se pudo comprobar en local es la imagen construida y corriendo: esta máquina
no tiene demonio de Docker. La verificación en producción está más abajo.

### Las imágenes están fijadas por digest

| Imagen | Antes | Ahora |
|---|---|---|
| Base de las dos etapas del `Dockerfile` | `node:22-alpine` | `node:22-alpine@sha256:fe4f6d74…699914` |
| Conector | `cloudflare/cloudflared:latest` | `cloudflare/cloudflared:latest@sha256:4955524a…b9c5ba` |

Es el digest del **índice multiarquitectura**, así que vale para arm64 (el Mac) y
amd64 (vibox). Las dos etapas usan la misma base, y hay un test que lo comprueba:
si difirieran, el build y el runtime podrían llevar versiones de Node distintas.

**Y `tunnel.sh update` se arregló a la vez**, porque fijar el digest lo habría
dejado sin efecto en silencio: hacía `pull` + `up -d`, y con la imagen fijada el
`pull` vuelve a bajar la misma. Ahora compara el digest fijado con la última
publicada y, si hay una nueva, dice exactamente qué línea cambiar. Subir de versión
es un cambio revisable y versionado, no algo que pase solo en un despliegue. El
verbo anterior sigue disponible como `update-forzado`.

**Cómo mantenerlas al día.** Para el conector, `./tunnel.sh update` y seguir lo que
dice. Para la base de Node, el digest de la etiqueta actual se obtiene así (lectura
del registro, sin demonio):

```sh
T=$(curl -sS "https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/node:pull" \
    | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")
curl -sSI -H "Authorization: Bearer $T" \
  -H "Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json" \
  "https://registry-1.docker.io/v2/library/node/manifests/22-alpine" | grep -i docker-content-digest
```

Conviene revisarlo cuando salga un parche de seguridad de Node 22 o de Alpine. Un
digest fijado que nadie refresca deja de ser reproducibilidad y pasa a ser una base
sin parchear: la reproducibilidad es la ventaja, la obligación es el precio.

## Despliegue y vuelta atrás

Nada de lo anterior surte efecto hasta que se despliegue. Dos cambios tocan
infraestructura y cada uno tiene su propia vuelta atrás.

### 1. La aplicación (no-root, digest de Node, identidad del conector)

**Dependencias que hay que comprobar antes:** ninguna externa. El cambio es el
`Dockerfile` y el código; no toca la red compartida, ni el túnel, ni el DNS, ni
las credenciales.

```sh
git -C ~/Documents/nanda_clients/alondra pull
./deploy-alondra.sh prod
```

**Comprobaciones después, en este orden:**

```sh
# 1. ¿Corre sin privilegios? Tiene que decir uid=1000(node)
docker exec alondra.app.prod id

# 2. ¿Resolvió el conector? La línea lo dice explícitamente
docker logs alondra.app.prod 2>&1 | grep -i 'Conector del tunel'

# 3. ¿Sirve? (desde el propio host, sin salir a internet)
curl -sI http://127.0.0.1:4232/ | head -1

# 4. ¿Sigue en pie el arreglo de la redirección?
curl -s -o /dev/null -D - --path-as-is 'https://alondrama.com//example.org/' | grep -i location
# tiene que decir /example.org, no //example.org
```

**Vuelta atrás** (el contenedor anterior ya no existe, así que se reconstruye del
commit previo; son los mismos segundos de corte que un despliegue normal):

```sh
git -C ~/Documents/nanda_clients/alondra log --oneline -3   # localiza el commit bueno
git -C ~/Documents/nanda_clients/alondra checkout <commit-anterior> -- web/Dockerfile
./deploy-alondra.sh prod
```

Si lo que falla es el arranque y no se sabe por qué, el atajo más rápido es quitar
sólo el `USER node` del `Dockerfile` y volver a desplegar: aísla el cambio de
permisos de todo lo demás.

### 2. El conector del túnel (digest fijado)

**Atención: el despliegue de la aplicación NO toca el conector.** El digest fijado
sólo surte efecto en el siguiente `./tunnel.sh up`, que **recrea el conector** y
corta el servicio unos segundos. Hazlo cuando puedas mirar.

**Dependencias que hay que comprobar antes:**

```sh
./tunnel.sh status                  # ¿está arriba y con qué imagen?
ls web/cloudflared/credentials.json # tiene que existir o el conector no arranca
./tunnel.sh update                  # compara digests: dice si el fijado es el último
```

Si el digest fijado **no** es el que está corriendo, recrear cambia la versión del
conector. Eso no toca la identidad del túnel (UUID, credenciales y CNAME siguen
igual), pero sí conviene saberlo antes.

```sh
./tunnel.sh up
./tunnel.sh status
curl -sI https://alondrama.com/ | head -1    # el dominio tiene que responder 200
```

**Vuelta atrás:** reponer el digest anterior en la línea `image:` de
`web/cloudflared.docker-compose.yml` y `./tunnel.sh up`. Si el conector no arranca
y el dominio está caído, la salida de emergencia es `image: cloudflare/cloudflared:latest`
sin digest, que vuelve al comportamiento de antes de esta ronda.

## Los avisos de dependencias que quedan, y por qué no se actúa

`npm audit --omit=dev` (el árbol que instala la imagen de producción) reporta **3**:
1 alto y 2 moderados. Venía de 17 (1 crítico, 13 altos) y de 6 en la revisión
anterior. **`[local]`**: el lockfile está actualizado en el repositorio.

**Criterio:** no se cuenta un aviso por su severidad, sino por si **este** código
alcanza la ruta vulnerable. Un aviso alto en código que nunca se llama se dice y se
deja; uno moderado que se toca en cada petición se arregla.

### Lo que se cerró en esta ronda, y la lección

Tres de los seis desaparecieron **sin ningún salto mayor**, y conviene anotar por
qué, porque la revisión anterior los había dado por irresolubles:

| Paquete | De | A | Qué lo cerró |
|---|---|---|---|
| `express` | 4.22.2 | 4.22.3 | Amplía el rango de `qs` a `~6.16.0` |
| `qs` | 6.15.4 | 6.16.2 | Entra en el rango nuevo de Express, y el aviso cubría hasta 6.16.0 |
| `@remix-run/router` | 1.23.0 | 1.23.4 | El aviso cubría hasta 1.23.2 |
| `react-router-dom` | 6.30.1 | 6.30.6 | Su aviso **alto** cubría hasta 6.30.2 |

Ningún rango declarado en `package.json` cambió: todo fue refresco de lockfile. La
lección es que **«necesita un salto mayor» caduca**: el análisis anterior era
correcto el día que se hizo, y dejó de serlo cuando se publicaron parches en la
línea 6.30.x y en 4.22.x. Conviene volver a mirarlo cada vez, no fiarse de la nota.

**Compatibilidad probada:** 135 tests en 15 ficheros, incluidos los 33 renderizados
de página y el prerenderizado, que usa `StaticRouter` del router actualizado. El
`dist/index.html` sigue saliendo con `<h1>` y JSON-LD dentro, y `npm ci` cuadra en
las dos etapas del Dockerfile.

### 1. `nodemailer`: alto

Sólo una familia es alcanzable: el coste cuadrático del parser de direcciones, al
que llega el `replyTo` con el correo y el nombre del visitante. Las otras tres no:
la de rutas y URLs en adjuntos necesita un `path`/`href`, y aquí el adjunto es un
`Buffer`; la de dominio de destino necesita influir en el `to`, que sale del
entorno; y la de TLS es de OAuth2, y esto usa App Password.

**No se actúa** porque el arreglo es `6 → 10`, cuatro versiones mayores, en el
camino de envío de correo, cuyo modo de fallo es **perder leads en silencio**.

**Mitigación aplicada en su lugar:** `EMAIL_MAX = 254` (máximo de la RFC 5321) y
`NOMBRE_MAX = 200` en los dos endpoints. Quita el material del ataque sin tocar la
dependencia.

**Qué cambiaría la decisión:** un aviso alcanzable fuera de esa familia, que el
proyecto necesite OAuth2, o que aparezca un parche en la línea 6.x.

### 2-3. `react-router` y `react-router-dom`: moderados

Lo que queda tras subir a 6.30.6 es un aviso cuyo rango llega hasta **7.17.0**, así
que ninguna versión de la línea 6 lo cierra: haría falta React Router 7, un salto
mayor con migración conocida.

**No alcanzable.** Necesita un destino de navegación que controle el atacante. Hay
**una sola** llamada a `navigate()`, en `src/i18n/LanguageContext.tsx`, y su
argumento sale de `pathFor()` sobre el mapa de rutas propio, no de la URL. Todos los
`<Link to>` resuelven un `PageKey` del repo.

**Qué cambiaría la decisión:** que alguna navegación pase a construirse con algo que
venga de la URL, del fragmento o de un tercero. Si eso ocurre, el salto a 7 pasa de
innecesario a obligatorio.

## Riesgos residuales

### Aceptados, con su motivo

**`[aceptado]` El puerto publicado en `0.0.0.0:4232`.** Es una decisión del dueño
(entrar desde la red local, 27-09-2026) y vibox no tiene IP pública, así que en
práctica significa LAN de casa más tailnet. Lo que esta ronda quitó es que esa vía
pueda **falsificar identidad**; que exista sigue siendo una decisión. Si algún día
deja de hacer falta, quitarla es cambiar `DOCKER_IFACE` a `127.0.0.1` en
`envs/.env.prod`, y entonces el túnel pasa a ser la única puerta.

**`[aceptado]` El Funnel de Tailscale es la vía más expuesta.** `expose.sh` pone el
puerto en internet **sin Cloudflare delante**. Ahí `req.ip` es el de `tailscaled`,
así que todos los visitantes comparten cubo y el tope por identidad deja de repartir.
Es una herramienta puntual para enseñar el sitio; déjala apagada
(`./expose.sh status` lo dice, `./expose.sh off` la apaga) y no la uses sobre el
perfil `prod` si puedes evitarlo.

**`[aceptado]` Los umbrales de la cuota dependen de un mock para tener cobertura.**
Desde que un envío fallido devuelve su marca al cupo, sin transporte de correo no
cuenta nada. Los tres topes se cubren en `src/test/send-quota.test.ts`, que
intercepta `nodemailer`. Si alguien quita ese mock, los tres números se quedan sin
red.

**`[aceptado]` Con `VITE_HOST=::` el servidor de desarrollo sirve el árbol de
`web/`**: código, `package-lock.json` y los documentos internos (`CLAUDE.md` sale
como `text/markdown`, comprobado). Eso es lo que hace un servidor de desarrollo; por
eso el valor por defecto es loopback y esa variable es una decisión explícita. Los
secretos están cubiertos: `.env*`, `cloudflared/` y `.git` están en
`server.fs.deny`, comprobado levantando el servidor (403 en los dos primeros; `.git`
queda fuera de la raíz de Vite, así que ahí es prevención y no un agujero abierto).

**`[aceptado]` `/api/send-contact` no tiene contador de intentos**, a diferencia de
la candidatura. Su cuerpo está acotado a 32 kB por `express.json`, así que una
petición inválida cuesta poco. Si ese endpoint acepta algo caro algún día, hay que
extenderlo.

### A supervisar

**Los digests fijados hay que refrescarlos.** Un digest que nadie actualiza deja de
ser reproducibilidad y pasa a ser una base sin parchear. Procedimiento arriba;
momento natural de revisarlo: cuando salga un parche de Node 22 o de Alpine, y
`./tunnel.sh update` para el conector.

**Los reinicios del contenedor.** Con el arreglo de la caída puesto, un
`RestartCount` que suba es ahora señal de algo **nuevo**, no de ese fallo. Vale la
pena mirarlo de vez en cuando:

```sh
docker inspect -f '{{.RestartCount}} {{.State.ExitCode}}' alondra.app.prod
docker logs alondra.app.prod 2>&1 | grep -c 'is not a function'
```

Nota de alcance de la comprobación del 30-10-2026: dio 0 reinicios y 0 trazas, pero
se leyó del contenedor que acababa de arrancar con el arreglo, porque el despliegue
lo recrea y se lleva los logs del anterior. O sea: **no hay evidencia de que el
fallo se disparara nunca, y la ventana que esos ceros cubren son minutos.** Si se
disparó antes, esa evidencia ya no existe.

**Un envío real con el código nuevo.** Los tests de cuota interceptan `nodemailer` y
las pruebas locales no tienen credenciales, así que el tramo del formulario a la
bandeja por Gmail está probado con un mock. Tras cada despliegue que toque el camino
de correo, conviene rellenar el formulario una vez y comprobar que llega. Si no
llega, `docker logs alondra.app.prod | grep 'sendMail failed'` lleva la causa y el
lead no se pierde, que es para lo que está ese log.

**La resolución del conector dentro de Docker.** Es el único supuesto de esta ronda
que no se pudo probar en local, por no haber demonio. Se comprueba con una línea:

```sh
docker logs alondra.app.prod 2>&1 | grep -i 'Conector del tunel'
```

Si dice **SIN resolver**, el endurecimiento de la identidad no está activo (se
mantiene el comportamiento anterior, que no es peor que antes, pero tampoco mejor) y
hay que averiguar por qué: lo más probable es que el conector esté apagado o que su
`container_name` haya cambiado, y entonces se ajusta con la variable de entorno
`TUNNEL_CONTAINER`.
