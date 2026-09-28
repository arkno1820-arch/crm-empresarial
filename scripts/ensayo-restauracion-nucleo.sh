#!/bin/bash
# Ensayo de restauracion (parte que corre EN UN NUCLEO). No toca la base real.
# Restaura un volcado de pg_dumpall en una instancia PostgreSQL TEMPORAL (otro puerto, socket propio, en RAM)
# y la compara, tabla por tabla, con la base real. Al terminar borra la instancia y el volcado.
# Uso: ensayo-restauracion-nucleo.sh /dev/shm/volcado.sql
set -u
cd /tmp || exit 2   # evita avisos de sudo por no poder entrar al directorio personal
DUMP=${1:?falta la ruta del volcado}
D=/dev/shm/restauracion_pg
PUERTO=5544
BIN=/usr/lib/postgresql/14/bin
LOG=/dev/shm/restauracion.log

ms() { date +%s%3N; }
T=$(ms)
vuelta() { local ahora; ahora=$(ms); printf '  %-46s %6d ms\n' "$1" $((ahora - T)); T=$ahora; }
psql_temp() { sudo -u postgres "$BIN/psql" -h "$D" -p "$PUERTO" -U postgres -X -A -t "$@"; }
psql_real() { sudo -u postgres "$BIN/psql" -p 5433 -X -A -t "$@"; }

limpiar() {
  sudo -u postgres "$BIN/pg_ctl" -D "$D" -m immediate stop >/dev/null 2>&1
  sudo rm -rf "$D" "$LOG"
  rm -f "$DUMP"
}
trap limpiar EXIT

echo "== Restauracion de prueba en instancia temporal (puerto $PUERTO, sin tocar la base real)"
echo "   volcado: $(stat -c %s "$DUMP") bytes"
chmod 644 "$DUMP"
sudo rm -rf "$D"; sudo mkdir "$D"; sudo chown postgres:postgres "$D"; sudo chmod 700 "$D"
sudo -u postgres "$BIN/initdb" -D "$D" -A trust -U postgres -E UTF8 >/dev/null 2>&1 || { echo "ERROR: initdb"; exit 2; }
vuelta "1. crear instancia temporal"
sudo -u postgres "$BIN/pg_ctl" -D "$D" -o "-p $PUERTO -c listen_addresses='' -k $D" -w -l "$D/log.txt" start >/dev/null 2>&1 || { echo "ERROR: no arranca"; exit 2; }
vuelta "2. arrancar la instancia"
sudo -u postgres "$BIN/psql" -h "$D" -p "$PUERTO" -U postgres -d postgres -X -q -f "$DUMP" >"$LOG" 2>&1
ERRORES=$(grep -c "ERROR" "$LOG"); INOFENSIVOS=$(grep "ERROR" "$LOG" | grep -c "already exists")
vuelta "3. restaurar el volcado (pg_dumpall)"
echo "     errores en la carga: $ERRORES (de ellos, 'ya existe': $INOFENSIVOS)"

echo
printf '  %-16s %-22s %12s %12s  %s\n' "BASE" "TABLA" "RESTAURADAS" "REAL" "RESULTADO"
DIFERENCIAS=0; TABLAS=0; FILAS=0
for BD in $(psql_real -d postgres -c "select datname from pg_database where datname not in ('postgres','template0','template1') order by 1"); do
  for TB in $(psql_temp -d "$BD" -c "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1"); do
    A=$(psql_temp -d "$BD" -c "select count(*) from \"$TB\"" 2>/dev/null)
    B=$(psql_real -d "$BD" -c "select count(*) from \"$TB\"" 2>/dev/null)
    if [ "$A" = "$B" ]; then R="coincide"; else R="DIFIERE"; DIFERENCIAS=$((DIFERENCIAS + 1)); fi
    printf '  %-16s %-22s %12s %12s  %s\n' "$BD" "$TB" "${A:-?}" "${B:-?}" "$R"
    TABLAS=$((TABLAS + 1)); FILAS=$((FILAS + ${A:-0}))
  done
done
vuelta "4. comparar con la base real"
echo
echo "== Resumen: $TABLAS tablas comparadas, $FILAS filas restauradas, $DIFERENCIAS diferencias"
[ "$DIFERENCIAS" -eq 0 ] && echo "== RESULTADO: la restauracion coincide con la base real" || echo "== RESULTADO: HAY DIFERENCIAS (puede haber cambios recientes en la base real; ver arriba)"
echo "   (se borran ahora la instancia temporal y el volcado)"
[ "$DIFERENCIAS" -eq 0 ]
