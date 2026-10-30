# Postura de seguridad

Qué se revisó, qué se decidió a propósito y qué sigue abierto. Se escribe aquí
porque las decisiones de no actuar son tan importantes como los arreglos: sin el
motivo escrito, la siguiente persona las reabre o las repite.

Última revisión: 30-10-2026 (noche). Fuente revisada: el árbol de trabajo sobre `e347ddf`.

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
publicado, el tailnet y un Funnel activo. Eso es lo que atacó la ronda de la tarde,
**ya desplegada y comprobada**: el servidor sólo se cree esa cabecera cuando la
petición viene del conector del túnel, y por el puerto publicado usa el peer TCP
(evidencia en «Lo verificado en producción»). La fila de esta tabla se queda porque
el hecho sigue siendo cierto: la cabecera **se puede** poner por esa vía. Lo que
cambió es que ya no sirve de nada.

## Lo que endureció la ronda del 30-10-2026 (tarde)

Todo esto está **`[producción]`**: desplegado el 30-10-2026 por la noche y
comprobado contra el servidor (las evidencias, en «Lo verificado en producción»).
La única pieza posterior, el endurecimiento de la rama degradada, está marcada
aparte más abajo.

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
- **si la resolución falla**: la identidad es `req.ip` y se marca **sin
  verificar**. La cabecera no vuelve a entrar.

`trust proxy` de Express sigue **sin** configurar a propósito: con él `req.ip`
pasaría a leerse de `x-forwarded-for`, que sí es falsificable, y es además lo que
mantiene inerte el aviso crítico de `proxy-addr`.

#### La rama degradada, corregida (**`[local]`**)

La primera versión de esa tercera rama estaba mal, y es el tipo de error que se
escribe solo: «se mantiene el comportamiento anterior» significaba volver a aceptar
`cf-connecting-ip` **de cualquier origen**, o sea deshacer el arreglo entero cada
vez que el DNS tuviera un hipo. El modo de fallo elegido para proteger la
disponibilidad reintroducía exactamente la vulnerabilidad.

El contrato correcto son las dos cosas a la vez, y el principio que lo resuelve es
este: **un tope sólo se aplica a través de una clave que de verdad identifique a
alguien.** Sin resolver el conector, `req.ip` es el conector para todo el que entra
por el túnel, o sea una clave común, así que:

- la identidad es el peer TCP y la cabecera no se usa de nadie;
- los topes **por identidad** quedan suspendidos, porque repartir por una clave
  compartida cerraría el formulario a terceros (y con el contador de intentos
  bastarían diez peticiones vacías de cualquiera para dejar la candidatura en 429
  para todo el mundo: un interruptor de apagado);
- los topes **globales** siguen, y son los que protegen el recurso de verdad
  escaso, el cupo diario de Gmail.

**Lo que se acepta a cambio** (y conviene tenerlo escrito, no descubrirlo): durante
esa ventana quien abuse no tiene tope propio y puede llegar al tope global. Es un
techo conocido, 50 a la hora y 150 al día; la ventana dura como mucho un minuto
porque el refresco reintenta; y **el cambio de estado se anuncia en el log**, que es
lo que antes faltaba: si la resolución se caía con el proceso ya arrancado, la línea
de arranque pasaba a ser mentira y nada lo delataba.

**Evidencia.** Tres tests nuevos en `src/test/tunnel-identity.test.ts`, y se
comprobó que **fallan** con la lógica anterior (429 en la petición 11, en los tres)
y pasan con la nueva. Cubren las tres mitades del contrato: que repetir la misma
cabecera no llena ningún cubo, que el tope global sigue cortando en 50, y que el
contador de intentos no se vuelve un apagón. Además, los dos tests que ya
ejercitaban los topes por identidad (`server.test.ts`, `send-quota.test.ts`)
tuvieron que apuntar `TUNNEL_CONTAINER` a loopback: sin conector resuelto esos topes
ya no existen, y que los tests lo noten es la señal de que el cambio es real.

**Evidencia.** Tres tests en `src/test/tunnel-identity.test.ts` cubren las tres
ramas, forzándolas sin red (se apunta `TUNNEL_CONTAINER` a una IP literal, que
`dns.lookup` resuelve a sí misma). El servidor imprime al arrancar si resolvió el
conector. **Y la resolución real dentro de Docker ya está comprobada contra
producción**, sin demonio y sin mandar un correo: ver «Lo verificado en producción».

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

## Lo verificado en producción (30-10-2026, noche)

Todo con peticiones de solo lectura o que **no mandan correo ni gastan cupo de
envío**. No se provocó ninguna caída, no se tocó ninguna configuración del
servidor y no apareció ninguna credencial en ninguna salida.

### El conector resuelve, y el puerto publicado ya no da identidad

Ésta era la pieza que no se podía comprobar en local por no haber demonio de
Docker, y resultó comprobable desde fuera. Por el puerto publicado del tailnet
(`100.91.3.5:4232`), que **no** pasa por el conector, se mandaron 11 candidaturas
inválidas con `cf-connecting-ip` **rotando** en cada una:

```
1:400 2:400 3:400 4:400 5:400 6:400 7:400 8:400 9:400 10:400 11:429
```

El 429 de la onceava es la prueba de las dos cosas a la vez:

1. **La cabecera no da identidad por esa vía.** Si el servidor se la creyera, cada
   valor nuevo habría abierto un cubo limpio y no habría cortado nunca. Cortó en el
   tope por identidad, o sea que la clave fue el peer TCP, el mismo para las once.
2. **El conector resuelve de verdad en la red de Docker.** Si no resolviera, la
   versión desplegada habría caído a su rama degradada, que se creía la cabecera,
   y tampoco habría cortado.

Por qué no es una prueba disruptiva: son peticiones inválidas, así que se rechazan
con 400 sin llegar a multer ni a nodemailer; no mandan correo, no gastan cupo de
envío, y el contador que consumen es el **de mi propia identidad**, no uno
compartido. Caduca a los dos minutos, y se comprobó que caduca.

Lo que **no** se comprobó así es la rama del conector (que ahí la cabecera sí se
use): hacerlo habría exigido 11 intentos por el túnel, y si esa rama estuviera mal
habrían caído en un cubo compartido, dejando la candidatura cerrada dos minutos a
visitantes reales. Eso sí habría sido una prueba disruptiva, así que no se hizo:
queda cubierta por tests y por el hecho de que la otra rama, comprobada, sólo
existe cuando el conector está resuelto.

### El resto de la superficie pública

| Comprobación | Resultado |
|---|---|
| Portada por el túnel | 200, `server: cloudflare`, `cf-ray` presente |
| Rutas en los tres idiomas (`/pricing`, `/es/precios`, `/fr/tarifs`) | 200 las tres |
| Ruta inventada | 404 real, no un 200 con la portada |
| Redirección abierta (arreglo anterior) | `//example.org/` responde `location: /example.org`. Sigue cerrada |
| `x-powered-by` | Ausente |
| Cabeceras de seguridad | CSP `frame-ancestors 'self'`, HSTS `max-age=15552000`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` |
| HTML sin cachear en el borde | `cf-cache-status: DYNAMIC` |
| Host canónico | `www` responde 301 a `https://alondrama.com/` |
| Formularios alcanzables y validando | 400 a cuerpos inválidos, 429 al llegar al tope: el camino de validación y el limitador están vivos |
| Contador de intentos: caduca | Pasada la ventana de dos minutos, la misma vía vuelve a responder 400. No hay bloqueo permanente, y el barrido de los mapas funciona |

### Lo que sigue sin verificar desde aquí, y cómo se cierra

| Pendiente | Por qué | Orden que lo cierra |
|---|---|---|
| El proceso corre como `uid=1000` | Hace falta entrar al servidor; desde este portátil no hay acceso por SSH (`Permission denied (publickey)`) ni demonio de Docker | `docker exec alondra.app.prod id` |
| La línea de arranque del conector | Lo mismo | `docker logs alondra.app.prod 2>&1 \| grep -i 'Conector del tunel'` |
| **Un correo que llegue de verdad** | Mandarlo significa un correo real a la bandeja del cliente y una marca de cupo. No es una decisión que tome yo | Rellenar el formulario una vez y comprobar la bandeja. Si no llega: `docker logs alondra.app.prod \| grep 'sendMail failed'` lleva el lead |

La evidencia del puerto publicado hace innecesaria la segunda para saber *si*
resuelve (ya se sabe que sí), pero sigue siendo la forma de verlo en un vistazo
después de cada despliegue.

## Riesgos residuales

Tres grupos, que no se mezclan: **corregidos** (ya no son un riesgo, y se dice con
qué evidencia), **aceptados** (se decide no arreglarlos, con el motivo) y **a
supervisar** (no se arreglan de una vez; hay que mirarlos).

### Corregidos

| Riesgo | Estado | Evidencia |
|---|---|---|
| Una petición sin autenticar mataba el proceso | **`[producción]`** | Tipos raros responden 400 y el proceso sigue vivo; tests de regresión |
| Redirección abierta por la barra final | **`[producción]`** | `//example.org/` responde `location: /example.org` contra el sitio vivo |
| La identidad de los topes salía de una cabecera falsificable | **`[producción]`** | 11 intentos con la cabecera rotando por el puerto publicado cortan en el tope: la clave es el peer TCP |
| La rama degradada reintroducía esa cabecera | **`[local]`** | Tres tests que fallan con la lógica anterior y pasan con la nueva |
| El contenedor corría como root | **`[producción]`**, pendiente de confirmar con `id` | `USER node` en la imagen desplegada; tests estáticos. Falta la línea del servidor |
| Imágenes con etiqueta flotante | **`[producción]`** | Digests fijados en el Dockerfile y en el compose del conector |
| Un envío fallido gastaba cupo igual | **`[producción]`** | `refundSend`, con test de las dos rutas de fallo |
| El tope global de intentos era un apagón accionable | **`[producción]`** | Expulsión de la clave más antigua, con test |
| 14 de los 17 avisos de dependencias | **`[producción]`** | `npm audit --omit=dev` baja de 17 a 3 |

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

**La resolución del conector dentro de Docker.** Comprobada una vez contra
producción (arriba), pero no es un hecho de una vez para siempre: depende de que el
conector esté levantado y de que conserve su `container_name`. Se mira con una
línea:

```sh
docker logs alondra.app.prod 2>&1 | grep -i 'Conector del tunel'
```

Si dice **SIN resolver**, el servidor queda en la rama degradada: la cabecera no se
acepta de nadie (eso no se pierde nunca), pero **los topes por identidad están
suspendidos** y sólo quedan los globales, 50 a la hora y 150 al día. No es una
urgencia, es un techo más alto de lo normal durante la ventana. La causa más
probable es que el conector esté apagado o que le hayan cambiado el nombre, y
entonces se ajusta con `TUNNEL_CONTAINER`.

Desde esta ronda, además, **no hace falta estar mirando el log**: un cambio de
estado con el proceso ya arrancado imprime su propia línea. Antes la de arranque
decía «resuelto» y, si la resolución se caía después, nadie se enteraba.
