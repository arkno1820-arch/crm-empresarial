# CRM Empresarial — Microservicios

Arquitectura de microservicios con FastAPI + PostgreSQL + Docker, con un gateway Nginx como punto único de entrada.

## Administración de accesos

**Ya no existe registro público.** El servicio `auth` (Administración de accesos) crea automáticamente **un único usuario administrador** la primera vez que arranca, usando las variables de tu `.env`:

```
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD=CambiaEstaClave123
```

**Cambia `ADMIN_PASSWORD` antes de tu primer `docker compose up`.** Con esa cuenta inicias sesión en `http://localhost:3000` y desde el módulo **"Usuarios"** (visible solo para el rol `admin`) das de alta al resto del equipo, eligiendo:

- Su **rol**: admin, rrhh, recepción o empleado
- Sus **módulos permitidos**: empleados, calendario, inventario, reservas (un admin siempre tiene acceso total)

Cada persona, al iniciar sesión, solo ve en el menú lateral los módulos que le asignaste. Los 4 microservicios de negocio (empleados, calendario, inventario, reservas) ahora **exigen un token válido** — ya no son de acceso libre aunque alguien conozca la URL directa.

Si necesitas resetear todo (por ejemplo, olvidaste la contraseña del admin y no hay otro admin activo), borra el volumen de la base de datos y vuelve a levantar:

```bash
docker compose down -v
docker compose up --build
```

Esto recreará el único usuario admin desde cero con los valores de tu `.env`.

## Servicios

| Servicio    | Puerto directo | Ruta vía gateway     | Base de datos   |
|-------------|----------------|----------------------|-----------------|
| Auth        | 8001           | `/api/auth/`         | `auth_db`       |
| Empleados   | 8002           | `/api/empleados/`    | `empleados_db`  |
| Calendario  | 8003           | `/api/calendario/`   | `calendario_db` |
| Inventario  | 8004           | `/api/inventario/`   | `inventario_db` |
| Reservas    | 8005           | `/api/reservas/`     | `reservas_db`   |
| Gateway     | 80             | —                    | —               |
| **Frontend**| **3000**       | —                    | —               |

## Panel visual (frontend)

Abre **http://localhost:3000** — es la interfaz pensada para uso diario del equipo (secretarias, recepción, RRHH), sin necesidad de tocar Swagger ni JSON:

- Pantalla de login / registro de usuarios
- **Empleados**: tabla con fichas, alta/edición/baja por formulario
- **Calendario**: agenda de eventos agrupada por día
- **Inventario**: tabla de productos con alertas visuales de stock bajo, registro de entradas/salidas
- **Reservas**: pestañas de Habitaciones y Reservas, formulario de nueva reserva con validación de disponibilidad

El primer usuario que crees en la pantalla de registro puede ser tu admin.

Cada servicio tiene su propia base de datos dentro de la misma instancia de Postgres (patrón *database per service*), lo que te permite separarlos en el futuro sin cambiar código.

## Requisitos

- Docker y Docker Compose instalados en tu PC.

## Cómo levantar el proyecto

```bash
cd crm-empresarial
cp .env.example .env    # ya viene copiado, pero cambia JWT_SECRET en producción
docker compose up --build
```

Espera a que todos los contenedores estén healthy. La primera vez, Postgres ejecutará `init-db/init-multiple-dbs.sh` para crear las 5 bases de datos.

## Documentación interactiva de cada servicio

FastAPI genera Swagger automáticamente:

- Auth: http://localhost:8001/docs
- Empleados: http://localhost:8002/docs
- Calendario: http://localhost:8003/docs
- Inventario: http://localhost:8004/docs
- Reservas: http://localhost:8005/docs

## Flujo típico

1. **Inicia sesión como admin** en `http://localhost:3000` con las credenciales de tu `.env`.
2. **Crea perfiles** desde el módulo "Usuarios", asignando rol y módulos permitidos a cada persona.
3. Cada persona **inicia sesión** con su propio usuario y ve solo lo que le asignaste.
4. Desde ahí, todo se hace por la interfaz: fichas de empleados, eventos de calendario, inventario y reservas.

Si prefieres usar la API directamente (Swagger), todos los endpoints de negocio ahora requieren el header `Authorization: Bearer <token>` que obtienes en `POST /api/auth/login`. El endpoint `POST /api/auth/register` también requiere ese header, y además que el token pertenezca a un usuario con rol `admin`.

## Comandos útiles

```bash
# Ver logs de un servicio
docker compose logs -f empleados-service

# Reconstruir solo un servicio tras editar código
docker compose up --build empleados-service

# Parar todo
docker compose down

# Parar y borrar también los datos de Postgres
docker compose down -v
```

## Próximos pasos recomendados

1. **Notificaciones del calendario**: añadir un worker o webhook que avise por email cuando se crea/edita un evento.
2. **Subida de fotos/documentos** de empleados: añadir un servicio de almacenamiento (o usar un volumen + endpoint de upload).
3. **Permisos más finos por acción**: hoy el acceso es por módulo completo (ej. "inventario"); si necesitas que recepción solo pueda *ver* reservas pero no *cancelarlas*, se puede refinar por endpoint.
4. **Expiración y renovación de sesión**: el token dura 8 horas; se puede añadir un refresh token si quieres sesiones más largas sin volver a pedir contraseña.
5. **Producción**: usar HTTPS en el gateway, secrets manejados fuera del `.env` (ej. Docker secrets o un vault), y backups automáticos de Postgres.

## Estructura del proyecto

```
crm-empresarial/
├── docker-compose.yml
├── .env.example
├── gateway/
│   └── nginx.conf
├── init-db/
│   └── init-multiple-dbs.sh
└── services/
    ├── auth/
    ├── empleados/
    ├── calendario/
    ├── inventario/
    └── reservas/
        └── app/
            ├── main.py
            ├── database.py
            ├── models.py
            ├── schemas.py
            └── routers/
```
