#!/bin/sh
set -e

# Default API upstream if not provided
: ${API_UPSTREAM:=http://localhost:3000}

# Render nginx template
envsubst '$API_UPSTREAM' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g 'daemon off;'
