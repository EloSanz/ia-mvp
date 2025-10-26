#!/bin/sh
set -e

envsubst '$API_UPSTREAM' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
# Default API upstream if not provided
: ${API_UPSTREAM:=http://localhost:3000}
# Make sure the variable is exported so envsubst can see it
export API_UPSTREAM

echo "[entrypoint] API_UPSTREAM=$API_UPSTREAM"

# Render nginx template
envsubst '$API_UPSTREAM' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g 'daemon off;'
