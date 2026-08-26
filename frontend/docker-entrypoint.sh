#!/bin/sh
set -e

# Sustituye ${GATEWAY_PORT} por el valor real de la variable de entorno
# y genera js/config.js, que el navegador carga antes que api.js.
GATEWAY_PORT="${GATEWAY_PORT:-8080}" envsubst '${GATEWAY_PORT}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/js/config.js

exec nginx -g "daemon off;"
