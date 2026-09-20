#!/bin/sh
set -e

# Sustituye ${GATEWAY_PORT} y ${GATEWAY_HTTPS_PORT} por sus valores reales
# y genera js/config.js, que el navegador carga antes que api.js.
GATEWAY_PORT="${GATEWAY_PORT:-8080}" GATEWAY_HTTPS_PORT="${GATEWAY_HTTPS_PORT:-8443}" \
  envsubst '${GATEWAY_PORT} ${GATEWAY_HTTPS_PORT}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/js/config.js

exec nginx -g "daemon off;"
