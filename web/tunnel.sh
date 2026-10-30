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
#   ./tunnel.sh version   # version en ejecucion frente a la ultima publicada
#   ./tunnel.sh update    # compara el digest fijado con la ultima publicada
#   ./tunnel.sh update-forzado  # pull + recreate de lo que diga el compose
#
# Sobre actualizar: el conector corre con --no-autoupdate a proposito. Un
# cloudflared que se autoactualiza reemplaza su binario DENTRO del contenedor, y
# ese cambio se pierde en el siguiente arranque; en Docker la unidad que se
# actualiza es la imagen. Por eso "update" hace pull + recreate.
#
# Actualizar el conector NO toca la identidad del tunel: el UUID, las
# credenciales y los CNAME del DNS siguen siendo los mismos, asi que el dominio
# no corre ningun riesgo. Lo unico que ocurre es un corte de unos segundos
# mientras el contenedor se recrea.
#
# Requisitos (setup una sola vez, ver README):
#   - ./deploy-alondra.sh prod   (red + contenedor alondra.app.prod arriba)
#   - ./cloudflared/config.yml   (con TUNNEL_UUID y dominio reales)
#   - ./cloudflared/credentials.json  (copiado desde `cloudflared tunnel create`)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/cloudflared.docker-compose.yml"
CF_DIR="$SCRIPT_DIR/cloudflared"
CONFIG="$CF_DIR/config.yml"
CREDS="$CF_DIR/credentials.json"
CONTAINER="alondra.cloudflared"

CF=(docker compose -f "$COMPOSE_FILE")

case "${1:-up}" in
    up)
        if ! docker network inspect noboolsheet_network >/dev/null 2>&1; then
            echo "⚠️  La red noboolsheet_network no existe todavia. Levanta el sitio primero:"
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
    version)
        echo "— en ejecucion —"
        docker logs "$CONTAINER" 2>&1 | grep -ioEm1 'version [0-9][0-9.]*' \
            || echo "  (sin linea de version en los logs; mira ./tunnel.sh logs)"
        docker inspect --format '  imagen {{.Config.Image}} · contenedor creado {{.Created}}' \
            "$CONTAINER" 2>/dev/null || echo "  (el contenedor no esta corriendo)"
        echo "— ultima publicada —"
        docker run --rm cloudflare/cloudflared:latest --version 2>/dev/null \
            || echo "  (no se pudo consultar)"
        ;;
    update)
        # La imagen esta fijada por digest en el compose, asi que un `pull` a secas
        # volveria a bajar el MISMO conector y este verbo no haria nada, en
        # silencio. Lo que hace ahora es comparar y decir exactamente que cambiar.
        FIJADO=$(grep -oE 'cloudflared:latest@sha256:[0-9a-f]+' "$COMPOSE_FILE" | cut -d@ -f2)
        echo "📌 Fijado en el compose: ${FIJADO:-(ninguno: la imagen no esta fijada)}"
        echo "⬇️  Consultando la ultima publicada ..."
        docker pull -q cloudflare/cloudflared:latest >/dev/null 2>&1 || {
            echo "❌ No se pudo consultar el registro."; exit 1; }
        ULTIMO=$(docker image inspect --format '{{index .RepoDigests 0}}' \
            cloudflare/cloudflared:latest 2>/dev/null | cut -d@ -f2)
        echo "🆕 Ultima publicada:     ${ULTIMO:-(no se pudo leer)}"
        if [ -z "$ULTIMO" ]; then
            echo "❌ Sin digest de la ultima; no se cambia nada."; exit 1
        fi
        if [ "$FIJADO" = "$ULTIMO" ]; then
            echo "✅ Ya estas en la ultima. Nada que actualizar."
            echo "   (si quieres recrear el conector de todas formas: ./tunnel.sh up)"
            exit 0
        fi
        echo
        echo "Hay una version nueva. Son dos pasos, a proposito: fijar por digest"
        echo "significa que subir de version es un cambio revisable y versionado,"
        echo "no algo que pase solo en un despliegue."
        echo
        echo "  1. Cambia esta linea en $COMPOSE_FILE:"
        echo "       image: cloudflare/cloudflared:latest@$ULTIMO"
        echo "  2. ./tunnel.sh up     (corte de unos segundos al recrear)"
        echo
        echo "El UUID, las credenciales y los CNAME no se tocan: el dominio no"
        echo "corre ningun riesgo. Para volver atras, repon el digest anterior"
        echo "($FIJADO) y vuelve a lanzar ./tunnel.sh up."
        exit 0
        ;;

    update-forzado)
        echo "⬆️  Bajando la imagen que diga el compose ..."
        "${CF[@]}" pull
        echo "♻️  Recreando el conector (corte de unos segundos) ..."
        "${CF[@]}" up -d
        sleep 4
        echo
        docker logs "$CONTAINER" 2>&1 | grep -iE 'version|Registered tunnel connection' | head -6
        echo
        echo "✅ Comprueba que vuelve a haber 4 conexiones registradas:  ./tunnel.sh logs"
        ;;
    *)
        echo "Uso: $0 {up|down|status|logs|version|update}"
        exit 1
        ;;
esac
