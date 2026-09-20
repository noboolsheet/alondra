#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo independiente: los envs (no-secreto) viven dentro del propio proyecto.
ENV_DIR="$SCRIPT_DIR/envs"
# El sitio vive en web/; el compose y sus secretos van con él.
WEB_DIR="$SCRIPT_DIR/web"

# 1. Validate Environment
ENV=${1:-}
if [[ ! "$ENV" =~ ^(dev|prod)$ ]]; then
    echo "❌ Error: Invalid or missing environment."
    echo "Usage: $0 {dev|prod}"
    exit 1
fi

# 2. Load Environment Variables to get the Network Name
if [ -f "$ENV_DIR/.env.$ENV" ]; then
    echo "📖 Loading environment: $ENV"
    set -a
    source "$ENV_DIR/.env.$ENV"
    set +a
else
    echo "❌ Error: .env.$ENV file not found in $ENV_DIR"
    exit 1
fi

# 2b. Guarda de interfaz: el contenedor no debe publicar en 0.0.0.0. Caddy lo alcanza
#     por nombre dentro de noboolsheet_network y `expose.sh` por localhost, así que
#     127.0.0.1 basta y no deja el puerto abierto en la IP pública de vibox.
if [[ "$DOCKER_IFACE" == *CAMBIAME* ]]; then
    echo "❌ DOCKER_IFACE sigue sin rellenar en $ENV_DIR/.env.$ENV"
    exit 1
fi

# 3. Ensure the Gmail secret file exists (GMAIL_APP_PASSWORD lives here, gitignored).
if [ ! -f "$WEB_DIR/.env.$ENV" ]; then
    echo "❌ Error: $SCRIPT_DIR/.env not found."
    echo "   Copia web/.env.example a web/.env.$ENV y pon GMAIL_USER + GMAIL_APP_PASSWORD."
    exit 1
fi

# 4. Create Network if it doesn't exist
if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    echo "🌐 Creating shared network: $DOCKER_NETWORK..."
    docker network create "$DOCKER_NETWORK"
else
    echo "🌐 Shared network $DOCKER_NETWORK already exists."
fi

# 5. Deploy the Stack
echo "🚀 Starting alondra-$ENV..."
docker compose --env-file "$ENV_DIR/.env.$ENV" -f "$WEB_DIR/alondra.docker-compose.$ENV.yml" up -d --build
