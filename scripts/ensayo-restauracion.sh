#!/bin/bash
# Ensayo de restauracion de punta a punta (se ejecuta en Git Bash, en el PC del administrador).
#   1. pide a un nucleo un respaldo fresco (ya cifrado con GPG) y lo baja de crm-nas
#   2. lo DESCIFRA aqui, con tu clave GPG (te pide la contrasena)
#   3. lo envia a un nucleo y lo restaura en una instancia PostgreSQL TEMPORAL (no toca la base real)
#   4. compara tabla por tabla con la base real y mide cada paso
#   5. borra el volcado en claro del PC y del nucleo
# Uso:  bash scripts/ensayo-restauracion.sh
#       ARCHIVO="/ruta/a/db-....sql.gpg" bash scripts/ensayo-restauracion.sh   (restaura ESE archivo, por ejemplo uno
#       descargado de Google Cloud Storage con tu cuenta principal, en vez de pedir un respaldo fresco a la NAS)
set -u

LLAVE="${LLAVE:-$HOME/.ssh/id_ed25519_crm}"
PROXMOX="${PROXMOX:-192.168.80.10}"
NUCLEO="${NUCLEO:-10.10.10.11}"
NAS="10.10.10.30"
AQUI="$(cd "$(dirname "$0")" && pwd)"
SSH_OPCIONES=(-i "$LLAVE" -o BatchMode=yes -o ConnectTimeout=10 -o LogLevel=ERROR)

edge()   { ssh "${SSH_OPCIONES[@]}" -p 2211 "cesar@$PROXMOX" "$@"; }
ms()     { date +%s%3N; }
paso()   { local ahora; ahora=$(ms); [ -n "${T:-}" ] && printf '   -> %d ms\n' $((ahora - T)); T=$ahora; echo; echo "[$1]"; }

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP:?}"' EXIT
INICIO=$(ms); T=""

echo "== ENSAYO DE RESTAURACION  ($(date '+%Y-%m-%d %H:%M:%S'))"

if [ -n "${ARCHIVO:-}" ]; then
  paso "1/6 archivo indicado por ti (no se pide respaldo nuevo)"
  [ -f "$ARCHIVO" ] || { echo "ERROR: no existe $ARCHIVO"; exit 1; }
  NOMBRE="$(basename "$ARCHIVO")"
  cp "$ARCHIVO" "$TMP/$NOMBRE"
  echo "   archivo: $NOMBRE (origen: el que indicaste)"
else
  paso "1/6 respaldo fresco en el nucleo y descarga desde crm-nas"
  edge "ssh -n cesar@$NUCLEO 'sudo systemctl start respaldo-bd.service'" || { echo "ERROR al generar el respaldo"; exit 1; }
  NOMBRE="$(edge "ssh -n root@$NAS 'ls -t /srv/respaldos/db | head -1'")"
  echo "   archivo: $NOMBRE"
  edge "ssh -n root@$NAS 'cat /srv/respaldos/db/$NOMBRE'" > "$TMP/$NOMBRE" || { echo "ERROR al descargar"; exit 1; }
fi
echo "   cifrado: $(stat -c %s "$TMP/$NOMBRE") bytes"

paso "2/6 descifrado con tu clave GPG (escribe tu contrasena en la ventana)"
T_GPG=$(ms)
gpg -d -o "$TMP/volcado.sql" "$TMP/$NOMBRE" 2>&1 | grep -v "^gpg: WARNING" | head -3
[ -s "$TMP/volcado.sql" ] || { echo "ERROR: no se pudo descifrar"; exit 1; }
T_GPG_FIN=$(ms)
echo "   en claro: $(stat -c %s "$TMP/volcado.sql") bytes"

paso "3/6 envio del volcado al nucleo (memoria RAM)"
T_TECNICO=$(ms)
edge "ssh cesar@$NUCLEO 'cat > /dev/shm/volcado.sql'" < "$TMP/volcado.sql" || { echo "ERROR al enviar"; exit 1; }
rm -f "${TMP:?}/volcado.sql"

paso "4/6 restauracion en una instancia temporal y comparacion con la base real"
edge "ssh cesar@$NUCLEO 'cat > /tmp/ensayo-restauracion-nucleo.sh && chmod +x /tmp/ensayo-restauracion-nucleo.sh'" < "$AQUI/ensayo-restauracion-nucleo.sh"
edge "ssh -n cesar@$NUCLEO 'sudo /tmp/ensayo-restauracion-nucleo.sh /dev/shm/volcado.sql; RC=\$?; rm -f /tmp/ensayo-restauracion-nucleo.sh; exit \$RC'"
RC=$?
T_TECNICO_FIN=$(ms)

paso "5/6 limpieza"
edge "ssh -n cesar@$NUCLEO 'ls /dev/shm/volcado.sql /dev/shm/restauracion_pg 2>&1 | head -2'" | sed 's/^/   nucleo: /'
rm -rf "${TMP:?}"/*
echo "   PC: archivos temporales borrados"
[ -n "${T:-}" ] && printf '   -> %d ms\n' $(( $(ms) - T ))

FIN=$(ms)
echo
echo "== TIEMPOS"
printf '   descifrado (incluye lo que tardes en escribir la contrasena) : %d s\n' $(( (T_GPG_FIN - T_GPG) / 1000 ))
printf '   restauracion tecnica (envio + restaurar + comparar)           : %d s\n' $(( (T_TECNICO_FIN - T_TECNICO) / 1000 ))
printf '   total del ensayo                                              : %d s\n' $(( (FIN - INICIO) / 1000 ))
[ "$RC" -eq 0 ] && echo "== RESULTADO FINAL: OK (la restauracion coincide con la base real)" || echo "== RESULTADO FINAL: REVISAR (ver diferencias arriba)"
exit "$RC"
