# Etapa 1: Build
FROM node:20-alpine as builder
WORKDIR /app


COPY web/package*.json ./
RUN npm install --production=false

COPY web/ .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Necesitamos envsubst para reemplazar variables en la plantilla nginx.conf en runtime
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Copiar build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar plantilla de nginx y script de entrada para renderizar variables de entorno
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh



EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]