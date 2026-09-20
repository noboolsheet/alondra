#!/bin/bash
set -e

# Publica ESTE sitio en internet por Cloudflare Tunnel (LOCALLY-MANAGED). El
# conector cloudflared corre como contenedor unido a la red noboolsheet_network y
# enruta el dominio -> este tunel -> http://alondra.app.prod:3000 segun las
# reglas de ./cloudflared/config.yml.
#
# A diferencia de expose.sh (Tailscale, preview privado con URL .ts.net), esto
# expone el dominio real del cliente con HTTPS del edge de Cloudflare, sin IP
# publica ni port-forwarding (cloudflared solo hace conexiones salientes).
#
# Uso:
#   ./tunnel.sh up        # levanta el conector (default)
#   ./tunnel.sh down      # lo apaga y elimina el contenedor
#   ./tunnel.sh status    # estado del contenedor cloudflared
#   ./tunnel.sh logs      # sigue los logs del conector
#
# Requisitos (setup una sola vez, ver README):
#   - ./deploy-alondra.sh prod   (red + contenedor alondra.app.prod arriba)
#   - ./cloudflared/config.yml   (con TUNNEL_UUID y dominio reales)
#   - ./cloudflared/credentials.json  (copiado desde `cloudflared tunnel create`)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/web/cloudflared.docker-compose.yml"
CF_DIR="$SCRIPT_DIR/web/cloudflared"
CONFIG="$CF_DIR/config.yml"
CREDS="$CF_DIR/credentials.json"
CONTAINER="alondra.cloudflared"

CF=(docker compose -f "$COMPOSE_FILE")

case "${1:-up}" in
    up)
        if ! docker network inspect alondra_network >/dev/null 2>&1; then
            echo "⚠️  La red alondra_network no existe todavia. Levanta el sitio primero:"
            echo "    ./deploy-alondra.sh prod"
            exit 1
        fi
        [ -f "$CONFIG" ] || { echo "❌ Falta $CONFIG"; exit 1; }
        [ -f "$CREDS" ]  || { echo "❌ Falta $CREDS (copia el <UUID>.json de 'cloudflared tunnel create')"; exit 1; }
        if grep -q "TUNNEL_UUID\|tudominio.com" "$CONFIG"; then
            echo "❌ $CONFIG todavia tiene placeholders (TUNNEL_UUID / tudominio.com). Rellenalos primero."
            exit 1
        fi
        echo "🌐 Levantando Cloudflare Tunnel (alondra.app.prod:3000) ..."
        "${CF[@]}" up -d
        echo "✅ Listo. Verifica con:  ./tunnel.sh logs   (busca 'Registered tunnel connection')"
        ;;
    down|off)
        echo "🛑 Apagando Cloudflare Tunnel ..."
        "${CF[@]}" down
        ;;
    status)
        docker ps --filter "name=$CONTAINER" --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
        ;;
    logs)
        docker logs -f "$CONTAINER"
        ;;
    *)
        echo "Uso: $0 {up|down|status|logs}"
        exit 1
        ;;
esac
