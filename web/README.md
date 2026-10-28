# Alondra Music Academy — sitio del cliente

SPA de Vite + React con un server Express que sirve el build **y** procesa los
formularios de contacto y candidatura por Gmail. Todo en **un solo contenedor**:
el mismo puerto atiende `dist/` y `/api/*`.

El sitio vive en producción en **alondrama.com**, servido desde **vibox** (hostname
real `fedora`) y publicado por un **Cloudflare Tunnel**. El servidor no tiene IP
pública ni puertos abiertos en el router.

| Perfil | Puerto | Cómo se llega |
|--------|--------|---------------|
| `dev`  | 4230 | `http://localhost:4230` (sólo LAN/tailnet) |
| `prod` | 4232 | público en `alondrama.com` por el túnel |

Para trabajar en la web sin Docker: `npm run dev` levanta Vite en el **8080**.
Ahí no hay backend de correo, así que los formularios no envían — basta para ver
imágenes, secciones y textos.

## Desarrollo en local

```sh
npm install
npm run dev          # Vite en http://localhost:8080
npm run build        # build de producción a dist/ (lanza antes la pipeline de imágenes)
npm run lint
npm run test         # vitest, una pasada
```

## Deploy con Docker

```sh
# 1. Secretos del perfil (gitignored). Son ficheros DISTINTOS por perfil para que
#    desarrollar no use la cuenta de correo real del cliente.
cp .env.example .env.dev          # o .env.prod

# 2. Build + run. El script carga envs/.env.<perfil> (versionado, sin secretos).
../deploy-alondra.sh dev          # dev → 4230 · prod → 4232

# 3. Comprobar que sirve la SPA.
curl -I http://localhost:4230/    # → 200
```

Los contenedores se unen a `noboolsheet_network`, la red **compartida** del
servidor: es lo que permite que Caddy y el conector del túnel los alcancen por
nombre (`alondra.app.prod`). No crees una red propia para este proyecto.

Preview puntual para el cliente, sin dominio, por Tailscale Funnel:

```sh
../expose.sh prod                 # → https://<host>.<tailnet>.ts.net
../expose.sh off                  # apagar al terminar
```

## Publicar en internet (Cloudflare Tunnel)

El túnel es **locally-managed**: las reglas de enrutado están en
`./cloudflared/config.yml` (versionado) y las credenciales en
`./cloudflared/credentials.json` (**gitignored, secreto**). El conector corre como
contenedor en `noboolsheet_network` y apunta a `http://alondra.app.prod:3000`.

Ya está montado y corriendo en vibox. Lo normal es sólo:

```sh
../deploy-alondra.sh prod    # el sitio arriba
../tunnel.sh up              # el conector
../tunnel.sh logs            # buscar "Registered tunnel connection" (x4)
../tunnel.sh down
```

### Actualizar el conector

Cloudflare avisa por correo cuando la versión de `cloudflared` se queda atrás.

```sh
../tunnel.sh version         # la que corre frente a la última publicada
../tunnel.sh update          # pull de la imagen + recrear el contenedor
```

El conector corre con `--no-autoupdate` a propósito: un `cloudflared` que se
autoactualiza reemplaza su binario **dentro** del contenedor y ese cambio se
pierde al reiniciar. En Docker la unidad que se actualiza es la imagen.

Actualizar **no toca la identidad del túnel** — el UUID, las credenciales y los
CNAME siguen igual, así que el dominio no corre riesgo. Sólo hay un corte de
unos segundos mientras el contenedor se recrea.

⚠️ **No dejes el conector corriendo en dos máquinas a la vez.** Cloudflare admite
réplicas del mismo túnel y reparte el tráfico entre ellas, así que unas visitas
irían a una y otras a la otra.

### Setup desde cero (sólo si hay que rehacer el túnel)

El túnel **no** se rehace al mudar de servidor o de repo: su identidad son el UUID
registrado en Cloudflare, el `credentials.json` y los CNAME del DNS. Para mudarlo
basta copiar `credentials.json` a la máquina nueva. Lo de abajo es para crearlo de
cero.

```sh
# cloudflared en el host (Fedora/vibox, x86_64)
curl -L -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -i cloudflared.rpm && rm cloudflared.rpm

cloudflared tunnel login                               # autoriza la zona → ~/.cloudflared/cert.pem
cloudflared tunnel create alondra                      # imprime el UUID
cloudflared tunnel route dns alondra alondrama.com     # crea los CNAME proxied
cloudflared tunnel route dns alondra www.alondrama.com

cp ~/.cloudflared/<UUID>.json cloudflared/credentials.json
chmod 644 cloudflared/config.yml cloudflared/credentials.json
```

Pon el `tunnel: <UUID>` en `cloudflared/config.yml` y, en Cloudflare,
**SSL/TLS → Overview → modo "Full"** (no "Flexible").

Verificación desde cualquier red: `curl -I https://alondrama.com` → `200` con
`server: cloudflare`.

## Imágenes

Los `.webp` que sirve el sitio se generan desde originales que **no están en el
repo** (pesaban 55 MB): viven en `../../../_assets/alondra/imagenes/`.

```sh
IMAGES_SRC_DIR=../../../_assets/alondra/imagenes npm run images   # → public/images/
npm run og                                                        # Open Graph 1200x630
```

Las Open Graph sí se versionan a propósito: usan una serif del sistema y un build
en Linux las dibujaría con otra tipografía.

## Origen del código

El sitio nació generado con **Lovable**, de donde viene parte de la estructura
(shadcn-ui, el layout de `src/`). Hoy se trabaja en local contra este repo:
`.lovable/` está gitignored y el brief original no viaja aquí dentro. El material
de la estrategia de marketing está en `../../../_assets/alondra/docs/`.
