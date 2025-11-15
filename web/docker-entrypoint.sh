#!/bin/sh
set -e

# Establece un valor por defecto para la URL del backend si no se proporciona.
: ${NGINX_PROXY_URL:=http://localhost:3000}
# Make sure the variable is exported so envsubst can see it
export NGINX_PROXY_URL

echo "[entrypoint] Configurando Nginx para redirigir /api a: $NGINX_PROXY_URL"

# Render nginx template
envsubst '$NGINX_PROXY_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g 'daemon off;'
