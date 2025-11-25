#!/bin/sh
set -e

# Set a default for VITE_API_URL if it's not provided and export it for envsubst
export VITE_API_URL=${VITE_API_URL:-http://localhost:3000}

echo "[entrypoint] VITE_API_URL=$VITE_API_URL"

# Render the nginx config template with the substituted environment variable
envsubst '$VITE_API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in the foreground
exec nginx -g 'daemon off;'
