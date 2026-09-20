# Guía de despliegue: CRM Empresarial en Oracle Cloud (OCI)

Objetivo: 2 instancias en zonas distintas, patrón "1 base de datos por microservicio" intacto, 1 URL única para los usuarios, todo dentro del nivel Always Free.

---

## 0. Decisiones de arquitectura (leer antes de empezar)

**Activo-pasivo, no activo-activo.** La Zona A recibe el 100% del tráfico. La Zona B tiene el mismo stack corriendo con sus bases de datos replicadas desde A, y solo entra en acción si A falla. Activo-activo requeriría bases de datos compartidas o replicación multi-maestro, lo cual contradice el patrón "una BD por servicio en Docker" que quieres mantener.

**Zonas disponibles: Availability Domain (AD) vs Fault Domain (FD).**
- La mayoría de las regiones de OCI (incluidas casi todas las regiones fuera de EE. UU.) solo tienen **1 Availability Domain**. En esas regiones, la "resiliencia por zonas" se logra con **Fault Domains** (3 por AD): hardware, energía y red físicamente aislados dentro del mismo datacenter. Protege contra fallas de hardware, no contra la caída de todo el datacenter.
- Solo algunas regiones (ej. `us-ashburn-1`, `us-phoenix-1`, `uk-london-1`, `sa-saopaulo-1`) tienen **3 Availability Domains** reales, con aislamiento físico total (edificios distintos). Ahí sí logras resiliencia "por zona" en el sentido más fuerte.

**Verifica cuál es tu caso:** En la consola de OCI, ve a **Governance & Administration → Tenancy Details**. Ahí ves tu "Home Region" y cuántos Availability Domains tiene.

**Límite Always Free actualizado (junio 2026):** Ampere A1 Flex ahora da **2 OCPU / 12 GB total** (antes eran 4/24). Repartido en 2 instancias: **1 OCPU / 6 GB cada una**.

---

## 1. Red (VCN)

1. Crea una VCN nueva (o usa el asistente "VCN with Internet Connectivity", que ya te crea subred pública + Internet Gateway + tablas de ruta).
2. Confirma que la subred sea **regional** (no específica de un AD) — así ambas instancias, aunque estén en distintos AD/FD, viven en la misma subred sin complicaciones de ruteo.
3. En las reglas de seguridad (Security List o Network Security Group) de esa subred, abre:
   - Puerto 22 (SSH) — solo desde tu IP, no `0.0.0.0/0`, por seguridad.
   - Puerto 80 y 443 — desde `0.0.0.0/0` (así entra el tráfico público al Load Balancer).
   - Puerto 8080 (tu gateway) — solo desde el CIDR de la subred del Load Balancer, no público directo.
   - Puerto 5432 (Postgres) — solo entre las 2 instancias (para la replicación), nunca público.

---

## 2. Las 2 instancias Compute

1. **Create Instance** → nombre `crm-nodo-a`.
2. Shape: **VM.Standard.A1.Flex**, edítalo a 1 OCPU / 6 GB.
3. Imagen: Ubuntu 22.04 (o la más reciente disponible).
4. **Placement**: si tu región tiene varios AD, elige AD-1 para este nodo. Si solo tiene 1 AD, despliega el "Advanced options" y elige **Fault Domain 1**.
5. Agrega tu llave SSH pública (o genera una nueva ahí mismo y descarga la privada).
6. Red: la subred pública que creaste en el paso 1.
7. Repite todo igual para `crm-nodo-b`, pero en **AD-2** (o **Fault Domain 2** si tu región tiene 1 solo AD).

Anota las IPs públicas de ambas — las necesitarás para SSH y para configurar el Load Balancer.

---

## 3. Preparar cada instancia (repite en las 2)

```bash
ssh ubuntu@<IP_DE_LA_INSTANCIA>

# Actualizar e instalar Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker

# Clonar tu repo
git clone https://github.com/arkno1820-arch/crm-empresarial.git
cd crm-empresarial
```

Como OCI también tiene su propio firewall interno (`iptables`/`netfilter`) además de las reglas de seguridad de la VCN, abre los puertos que necesitas en la instancia misma:

```bash
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 5432 -j ACCEPT
sudo netfilter-persistent save   # si está instalado; si no, sudo apt install iptables-persistent
```

---

## 4. Variables de entorno de producción

Crea el `.env` en **ambas** instancias con estos valores — **el `JWT_SECRET` debe ser idéntico en las dos**, o un token emitido en A no será válido si el Load Balancer alguna vez enruta hacia B:

```bash
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=<una-contraseña-fuerte-y-distinta-a-la-de-pruebas>
JWT_SECRET=<genera-uno-largo-y-aleatorio-igual-en-las-dos-instancias>
ADMIN_USERNAME=admin
ADMIN_EMAIL=tu-correo-real@tuempresa.com
ADMIN_PASSWORD=<otra-contraseña-fuerte>
GATEWAY_PORT=8080
```

Genera un `JWT_SECRET` seguro con: `openssl rand -hex 32`

---

## 5. Levantar el stack en el Nodo A (primario)

```bash
cd ~/crm-empresarial
docker compose up --build -d
docker compose ps   # confirma que los 8 contenedores estén "Up"
```

## 6. Levantar el stack en el Nodo B (standby) — sin recibir tráfico aún

```bash
cd ~/crm-empresarial
docker compose up --build -d
```

En este punto, B tiene su **propia** base de datos vacía (con su propio admin sembrado), independiente de A. Eso es temporal — el siguiente paso conecta los datos.

---

## 7. Replicación de las bases de datos (A → B)

Tienes dos niveles, empieza por el simple y sube de nivel cuando lo necesites:

### Opción simple: respaldo periódico (bueno para empezar)

En el Nodo A, un cron que cada 15 minutos vuelca las 5 bases y las manda al Nodo B:

```bash
# En Nodo A, crea /home/ubuntu/backup-a-b.sh
#!/bin/bash
for db in auth_db empleados_db calendario_db inventario_db reservas_db; do
  docker exec crm_postgres pg_dump -U crm_user "$db" | \
    ssh ubuntu@<IP_NODO_B> "docker exec -i crm_postgres psql -U crm_user -d $db"
done
```

```bash
chmod +x /home/ubuntu/backup-a-b.sh
crontab -e
# agrega: */15 * * * * /home/ubuntu/backup-a-b.sh
```

**Con esto, si A falla, pierdes como máximo 15 minutos de datos** (el intervalo del cron). Para la mayoría de CRMs internos esto es razonable como primer paso.

### Opción avanzada: streaming replication de Postgres (casi sin pérdida de datos)

Esto sincroniza en tiempo real en vez de cada 15 minutos, pero exige configurar `pg_hba.conf` y `postgresql.conf` para replicación en cada uno de los 5 contenedores Postgres, y usar `pg_basebackup` para clonar el estado inicial. Es más trabajo de configuración — se arma como una guía específica aparte cuando quieras subir de nivel; empieza con la opción simple primero.

---

## 8. Load Balancer

1. **Networking → Load Balancers → Create Load Balancer**.
2. Tipo: **Flexible**, ancho de banda 10 Mbps (el que incluye Always Free).
3. Visibilidad: **Pública**.
4. Subred: la misma VCN, en una subred pública (puede pedirte 2 subredes si tu región tiene varios AD — normal).
5. **Backend set**: crea uno nuevo, política de balanceo "Weighted Round Robin".
   - Agrega el Nodo A con **peso 100**, puerto **8080**.
   - Agrega el Nodo B con **peso 0** (no recibe tráfico mientras A esté sano).
6. **Health check**: HTTP, ruta `/`, puerto 8080, cada 10 segundos. Esto es lo que detecta si A cayó.
7. **Listener**: puerto 80 (HTTP) apuntando al backend set. Más adelante se agrega otro listener en 443 con certificado.

**Sobre el failover automático:** OCI Load Balancer, con peso 0, no reenvía tráfico a B automáticamente aunque A falle — el peso 0 es literal. Para failover real hace falta que el backend set use health check y ambos backends con el mismo peso, dejando que el LB saque del pool automáticamente al que falle el health check. Este es un detalle fino que depende de cómo se quiera automatizar la promoción de B a primario — retomarlo cuando se llegue a este paso.

---

## 9. URL y HTTPS

1. Copia la **IP pública del Load Balancer** (no la de las instancias).
2. Compra un dominio (Namecheap, Google Domains, etc. — esto no es gratis, ronda $10-15 USD/año).
3. En el panel DNS de tu dominio, crea un registro **A** apuntando `crm.tudominio.com` a la IP del Load Balancer.
4. Para HTTPS: en el Load Balancer, agrega un **Certificate** (puedes generarlo con Let's Encrypt vía `certbot` y subir el certificado, o usar un certificado que compres). Luego crea un listener en el puerto 443 con ese certificado, y configura el listener 80 para redirigir a 443.

---

## 10. Qué hacer si la Zona A falla (failover manual, primera versión)

1. Confirma que A está caído (health check en rojo en la consola de OCI, o `ssh` no responde).
2. En el backend set del Load Balancer, sube el peso de B a 100 (y baja el de A a 0, o quítalo del pool).
3. En el Nodo B, verifica que tenga los datos más recientes replicados (`docker compose logs` de cada servicio).
4. Cuando A vuelva, no lo reintegres al pool de inmediato — primero sincroniza sus datos desde B (el flujo se invierte temporalmente) para no perder lo que pasó mientras B era el activo.

---

## 11. Costos

Si te mantienes dentro de estos límites, todo lo de arriba es **$0/mes**:
- 2 instancias A1 Flex sumando ≤2 OCPU / ≤12 GB total
- 1 Load Balancer Flexible a 10 Mbps
- Tráfico de salida dentro del límite gratuito

Lo único que sí se paga aparte es el **dominio** (~$10-15 USD/año, fuera de Oracle).

---

## 12. Próximos pasos opcionales (cuando quieras subir de nivel)

- **Terraform**: define toda esta infraestructura como código, para recrearla en minutos si algo se rompe.
- **Backups a Object Storage**: además de la replicación A→B, guarda snapshots diarios en Object Storage (también Always Free hasta cierto límite) por si ambas zonas fallan a la vez.
- **Streaming replication real** (ver sección 7) en vez de cron cada 15 minutos.
- **Automatizar el failover** con un script de monitoreo que detecte la caída de A y ajuste el Load Balancer solo, sin que haya que hacerlo a mano.
