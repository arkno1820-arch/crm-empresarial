#!/bin/bash
set -e

create_db() {
	local database=$1
	echo "Creando base de datos: $database"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
EOSQL
}

for db in auth_db empleados_db calendario_db inventario_db reservas_db; do
	create_db "$db"
done

echo "Todas las bases de datos fueron creadas."
