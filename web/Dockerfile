# ---- Stage 1: Build (Vite → dist/) ----
# El sitio es una SPA de Vite + React (template de Lovable). El `npm run build`
# corre antes el prebuild (optimize-images con sharp) y luego `vite build` → dist/.
# Fijado por digest del indice multiarquitectura: dos despliegues de este
# commit construyen con el MISMO Node. La etiqueta se deja al lado para que se
# lea de un vistazo; quien manda es el digest. Como refrescarlo: SECURITY.md.
FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS builder

WORKDIR /app

# sharp (usado por el prebuild optimize-images) necesita compat de libc en alpine.
RUN apk add --no-cache libc6-compat

# Capa cacheable de dependencias (incluye devDeps: vite, sharp, lovable-tagger).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---- Stage 2: Runtime (Node + Express) ----
# El server Express (server/index.mjs) sirve dist/ y expone /api/send-contact y
# /api/send-application (envio por Gmail). Solo necesita las deps de runtime
# (express, nodemailer, multer, dotenv), que estan en "dependencies".
FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Dentro del contenedor hay que atar todas las interfaces o la publicación de
# puertos de Docker no alcanza al proceso. Fuera, el servidor usa loopback por
# defecto (ver BIND_HOST en server/index.mjs).
ENV BIND_HOST=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Artefactos: el build estatico y el server.
COPY --from=builder /app/dist ./dist
COPY server ./server

# El proceso corre como `node` (uid 1000), que la imagen oficial ya trae. No hace
# falta nada mas: el servidor NO escribe en disco en runtime (solo lee routes.json
# y sirve ficheros de dist/, y multer usa memoryStorage), y el puerto es 3000, por
# encima de 1024, asi que no necesita privilegios para atarlo.
#
# Los ficheros se quedan a nombre de root a proposito, no se hace --chown: el
# usuario que sirve las peticiones no puede modificar su propio codigo ni el build,
# que es justo lo que se quiere de un proceso expuesto a internet.
USER node

EXPOSE 3000
CMD ["node", "server/index.mjs"]
