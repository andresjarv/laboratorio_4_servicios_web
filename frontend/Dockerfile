# ── ETAPA 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovecha cache de Docker)
COPY package.json ./
RUN npm install --strict-ssl=false

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# ── ETAPA 2: Servidor Nginx ──────────────────────────────────────
FROM nginx:alpine

# Copiar los archivos compilados al servidor
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
