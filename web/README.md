# Alondra Music Academy — sitio del cliente

Proyecto independiente (SPA Vite + React con un server Express que sirve el build
y procesa los formularios de contacto/candidatura vía Gmail). Un único contenedor.

## Deploy local + preview con el cliente (Docker + Tailscale)

```sh
# 1. Secretos: copia el ejemplo y rellena GMAIL_USER / GMAIL_APP_PASSWORD.
cp .env.example .env

# 2. Levanta el contenedor (build + run). dev usa el puerto 4230; prod, 4232.
./deploy-alondra.sh dev
#   equivale a:
#   docker compose --env-file envs/.env.dev -f alondra.docker-compose.dev.yml up -d --build

# 3. Verifica que sirve la SPA.
curl -I http://localhost:4230/        # -> 200

# 4. Preview público para el cliente (requiere Tailscale con Funnel habilitado).
./expose.sh dev                       # -> URL https://<pi>.<tailnet>.ts.net
./expose.sh off                       # apaga el funnel al terminar
```

Config no-secreta (puertos, red, destinatario) en `envs/.env.{dev,prod}` (versionada).
Deploy cloud alternativo: `render.yaml` (Render Blueprint, ver el propio archivo).

## Publicar en internet con Cloudflare Tunnel (dominio real, locally-managed)

Sirve el sitio desde la Raspberry Pi en el dominio del cliente (gestionado en
Cloudflare), con HTTPS del edge y **sin IP pública ni port-forwarding**. El túnel es
**locally-managed**: las reglas viven en `./cloudflared/config.yml` (versionado) y las
credenciales en `./cloudflared/credentials.json` (gitignored). El conector `cloudflared`
corre como contenedor unido a `alondra_network` y apunta a `http://alondra.app.prod:3000`.

**Setup (una sola vez, en la Pi).** Necesitas el binario `cloudflared` para los comandos
de gestión (login/create/route). Instálalo (arm64):

```sh
# Instalar cloudflared en la Pi (Raspberry Pi OS / Debian arm64)
curl -L -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb && rm cloudflared.deb

# 1. Autoriza la zona (abre una URL en el navegador). Crea ~/.cloudflared/cert.pem
cloudflared tunnel login

# 2. Crea el túnel. Imprime un UUID y escribe ~/.cloudflared/<UUID>.json
cloudflared tunnel create alondra

# 3. Enruta el DNS (crea los CNAME proxied automáticamente)
cloudflared tunnel route dns alondra alondrama.com
cloudflared tunnel route dns alondra www.alondrama.com

# 4. Copia las credenciales al repo (gitignored) con nombre estable
cp ~/.cloudflared/<UUID>.json  cloudflared/credentials.json
chmod 644 cloudflared/config.yml cloudflared/credentials.json   # legibles por el contenedor
```

**Rellena `cloudflared/config.yml`**: pon el `tunnel: <UUID>` (el de arriba) y reemplaza
`alondrama.com` por el dominio real (apex + www).

**Levanta el sitio y el túnel:**

```sh
./deploy-alondra.sh prod    # sitio arriba (red + alondra.app.prod)
./tunnel.sh up              # levanta cloudflared (monta ./cloudflared)
./tunnel.sh logs           # busca "Registered tunnel connection" (x4)
./tunnel.sh down           # apaga el túnel
```

Por último, en Cloudflare: **SSL/TLS → Overview → modo "Full"** (no "Flexible").

Verifica desde cualquier red: `curl -I https://alondrama.com` → `200` con
`server: cloudflare`. Es independiente de `expose.sh` (Tailscale, preview privado):
puedes usar ambos o apagar el funnel con `./expose.sh off`.

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
