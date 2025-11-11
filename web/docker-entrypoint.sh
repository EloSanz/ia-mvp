#!/bin/sh
set -e

envsubst '$VITE_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
# Default API upstream if not provided
: ${VITE_API_URL:=http://localhost:3000}
# Make sure the variable is exported so envsubst can see it
export VITE_API_URL

echo "[entrypoint] VITE_API_URL=$VITE_API_URL"

# Render nginx template
envsubst '$VITE_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g 'daemon off;'
