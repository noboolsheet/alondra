#!/bin/bash
set -e

# Expone ESTE sitio publicamente por Tailscale Funnel para hacer un preview con el
# cliente. El funnel apunta directo al puerto publicado del contenedor, asi que el
# cliente recibe la URL https://<host>.<tailnet>.ts.net y ve SOLO este sitio.
#
# Uso:  ./expose.sh [dev|prod] [443|8443|10000]
#   - 2do argumento: puerto HTTPS publico del funnel (default 443). Tailscale
#     permite hasta 3 funnels por nodo (443, 8443, 10000).
#   - El sitio debe estar levantado (./deploy-alondra.sh <env>) publicando su EPORT.
#
# Verbos de utilidad:
#   ./expose.sh status          # lista los funnels activos
#   ./expose.sh off [PUERTO]    # apaga el funnel de ese puerto (default 443)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/envs"

case "${1:-}" in
    status)
        tailscale funnel status || true
        exit 0
        ;;
    off)
        PORT=${2:-443}
        echo "🛑 Apagando funnel en :$PORT ..."
        tailscale funnel --https="$PORT" off
        tailscale funnel status || true
        exit 0
        ;;
esac

ENV=${1:-prod}
HTTPS_PORT=${2:-443}

if [[ ! "$ENV" =~ ^(dev|prod)$ ]]; then
    echo "❌ Entorno invalido. Uso: $0 [dev|prod] [443|8443|10000]"
    exit 1
fi
if [ ! -f "$ENV_DIR/.env.$ENV" ]; then
    echo "❌ No existe $ENV_DIR/.env.$ENV"
    exit 1
fi

set -a; source "$ENV_DIR/.env.$ENV"; set +a
EPORT="${ALONDRA_APP_EPORT:-}"
if [ -z "$EPORT" ]; then
    echo "❌ No encuentro ALONDRA_APP_EPORT en .env.$ENV"
    exit 1
fi

echo "ℹ️  Funnels activos ahora mismo (max 3 en 443/8443/10000):"
tailscale funnel status || true

echo "🌐 Exponiendo alondra ($ENV) — localhost:$EPORT → https funnel :$HTTPS_PORT ..."
tailscale funnel --bg --https="$HTTPS_PORT" "http://localhost:$EPORT"

echo "✅ Listo. URL publica del nodo:"
tailscale funnel status || true
echo "   (para apagarlo: ./expose.sh off $HTTPS_PORT)"
