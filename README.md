# Alondra Music Academy

Repositorio del cliente. Hoy sólo contiene la web, pero la estructura deja sitio
para lo que venga después (una app de reservas, automatizaciones, lo que sea)
sin tener que reorganizar nada.

```
web/      el sitio: SPA Vite + React con un server Express que sirve el build
          y procesa los formularios de contacto y candidatura por Gmail
envs/     configuración por entorno, en git, SIN secretos
docs/     material de trabajo — GITIGNORED (originales en ../../_assets/alondra/)
```

## El sitio

Un solo contenedor: el server Express sirve `dist/` **y** la API de formularios
(`/api/send-contact`, `/api/send-application`) en el mismo puerto. Tres idiomas
(es/en/fr) con rutas localizadas, metadatos por página e imágenes Open Graph.

| Perfil | Puerto | Cómo se llega |
|--------|--------|---------------|
| `dev` | 4230 | `http://localhost:4230` |
| `prod` | 4232 | Caddy lo publica en el dominio del cliente (`nbs-infra/caddy/CaddyFile`) |

El puerto se ata a `127.0.0.1`: el tráfico público entra por el 443 de Caddy, que
alcanza el contenedor como `alondra.app.prod` dentro de `noboolsheet_network`.

## Desplegar

```sh
./deploy-alondra.sh {dev|prod}
./expose.sh prod                 # preview puntual por Tailscale Funnel
```

Antes del primer despliegue, crear el fichero de secretos del perfil:

```sh
cp web/.env.example web/.env.prod     # GMAIL_USER + GMAIL_APP_PASSWORD
```

Son ficheros distintos por perfil (`web/.env.dev`, `web/.env.prod`) para que
desarrollar no use la cuenta real de correo del cliente.

## Imágenes

Los `.webp` que sirve el sitio se generan desde los originales, que **no están en
el repo** (pesaban 55 MB): viven en `../../_assets/alondra/imagenes/`.

```sh
cd web && npm run images        # regenera public/images/
cd web && npm run og            # regenera las imágenes Open Graph (1200x630)
```

Las Open Graph sí se versionan a propósito: usan una serif del sistema y un build
en Linux las dibujaría con otra tipografía.
