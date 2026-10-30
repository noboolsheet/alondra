# ---- Stage 1: Build (Vite → dist/) ----
# El sitio es una SPA de Vite + React (template de Lovable). El `npm run build`
# corre antes el prebuild (optimize-images con sharp) y luego `vite build` → dist/.
FROM node:22-alpine AS builder

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
FROM node:22-alpine AS runtime

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

EXPOSE 3000
CMD ["node", "server/index.mjs"]
