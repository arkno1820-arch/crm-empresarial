# Guía de despliegue: CRM Empresarial en Proxmox (VMs reales)

**Reemplaza a `guia-proxmox-lxc.md`** — esa versión era para la laptop de
4GB/Celeron. Esta es para tu PC físico Ryzen 7 / 20GB, con Proxmox
corriendo dentro de una VM de VMware (ya instalado y accesible en
`https://192.168.1.147:8006`).

Con estos recursos usamos **VMs reales** en vez de LXC: es la evidencia
"de manual" para el ramo de Virtualización (hipervisor, snapshots,
asignación de recursos por VM), algo que 4GB no permitía hacer con
holgura.

---

## 0. Decisiones de arquitectura

**Honestidad para el informe**: Proxmox corre anidado dentro de VMware
sobre Windows, no sobre metal desnudo. Es un montaje válido y común para
laboratorio/práctica — solo hay que decirlo explícitamente en el informe
en vez de dar a entender que es bare-metal. Lo que se evalúa (crear
VMs, redes virtuales, segmentación) sigue siendo 100% real dentro de
Proxmox, independiente de que Proxmox mismo esté anidado.

**Verifica virtualización anidada antes de crear las VMs.** Sin esto, las
VMs de Proxmox corren sin aceleración por hardware (muy lentas). En la
consola de Proxmox (ícono ">_ Shell" del nodo `pve`):

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```

- Si devuelve un número **mayor a 0**: todo listo, sigue al paso 1.
- Si devuelve **0**: en VMware, apaga la VM de Proxmox → Configuración de
  la VM → **Processors** → marca **"Virtualize Intel VT-x/EPT or AMD-V/RVI"**
  → enciende la VM de nuevo y repite el comando.

**Mismo diseño de red que antes**: `crm-edge` (borde, expuesto a tu LAN)
y `crm-core` (núcleo con todo el CRM, solo alcanzable a través del
borde) — conectados por una red interna que vive solo dentro de Proxmox.

---

## 1. Crear la red interna `vmbr1`

**Datacenter → pve → System → Network → Create → Linux Bridge**:

- Name: `vmbr1`
- IPv4/CIDR: `10.10.10.1/24`
- **Bridge ports: vacío** (sin puerto físico — así queda aislada de la LAN).
- Aplica los cambios.

`vmbr0` (la que Proxmox ya usa para su propia IP `192.168.1.147`) queda
igual, es la salida hacia tu red real.

## 2. Subir una ISO de instalación

**pve → local (storage) → ISO Images → Upload** (o "Download from URL"
si Proxmox te deja pegar el link directo): sube **Ubuntu Server 22.04**
o **Debian 12** — cualquiera de los dos sirve para ambas VMs.

## 3. Crear la VM `crm-edge`

**Crear VM** (botón arriba a la derecha):

- General: nombre `crm-edge`.
- OS: la ISO que subiste.
- System / Disks / CPU: valores por defecto están bien.
- Memory: **2048 MB**.
- CPU: **2 vCPU**.
- Network: `net0` en bridge `vmbr0`.
- Termina el asistente y **antes de encender la VM**, agrégale una
  segunda interfaz: **Hardware → Add → Network Device** → bridge `vmbr1`.

Instala el sistema operativo (asistente normal de Ubuntu/Debian). Cuando
te pida configurar red, deja `net0` (la de `vmbr0`) por DHCP o con una IP
fija de tu LAN (ej. `192.168.1.60/24`, gateway tu router); a `net1` (la
de `vmbr1`) asígnale `10.10.10.2/24` sin gateway.

Ya instalado, dentro de la VM:

```bash
sudo apt update && sudo apt install -y nginx
```

## 4. Crear la VM `crm-core`

**Crear VM** de nuevo:

- Nombre: `crm-core`.
- Memory: **8192 MB** (con 20GB en el host, Proxmox + edge usan ~4GB en
  total, sobra margen cómodo).
- CPU: **4 vCPU**.
- Network: `net0` en bridge `vmbr1` (**no** le pongas interfaz en `vmbr0`
  — debe quedar inalcanzable directo desde la LAN, ese es el punto).

Instala el sistema operativo, con IP fija `10.10.10.10/24`, gateway
`10.10.10.1`.

Ya instalado:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker

git clone <la-url-de-tu-repositorio> crm-empresarial
cd crm-empresarial
# crea el .env real aquí (ver INSTRUCCIONES_RESPALDO.txt para los valores)

docker compose up --build -d
docker compose ps   # confirma que los 7 contenedores estén "Up"
```

Con 8GB para esta VM ya no hace falta el ajuste agresivo de memoria del
plan anterior (swap de emergencia, límites estrictos de Postgres) — solo
confirma que los puertos de cada microservicio queden mapeados al host
en `docker-compose.yml` (ej. `"8001:8000"`), para que `crm-edge` pueda
alcanzarlos por `10.10.10.10:8001`, etc.

## 5. Configurar Nginx en `crm-edge`

Reemplaza `/etc/nginx/sites-available/default` (ajusta los puertos a los
reales de tu `docker-compose.yml`):

```nginx
server {
    listen 80;

    location /api/auth/       { proxy_pass http://10.10.10.10:8001/; }
    location /api/empleados/  { proxy_pass http://10.10.10.10:8002/; }
    location /api/calendario/ { proxy_pass http://10.10.10.10:8003/; }
    location /api/inventario/ { proxy_pass http://10.10.10.10:8004/; }
    location /api/reservas/   { proxy_pass http://10.10.10.10:8005/; }
    location /api/chat/ {
        proxy_pass http://10.10.10.10:8006/;
        client_max_body_size 30M;
    }

    root /var/www/crm-frontend;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Copia los archivos de `frontend/` (index.html, js/, css/) a
`/var/www/crm-frontend` en `crm-edge` (por `scp`, o clonando el repo
también aquí y copiando solo esa carpeta).

Para HTTPS, reutiliza el mismo patrón de certificado autofirmado que ya
tienes en `gateway/certs/`/`frontend/certs/`, agregando un bloque
`listen 443 ssl;`.

```bash
sudo nginx -t && sudo systemctl restart nginx
```

## 6. Probar desde tu red

Desde cualquier equipo de tu LAN: `http://192.168.1.60` (la IP de
`crm-edge` en `vmbr0`). Debe funcionar igual que hoy, con `crm-core`
haciendo todo el trabajo por detrás sin ser alcanzable directamente.

## 7. Prueba de aislamiento (la evidencia más importante)

Desde otro equipo de la LAN (no desde Proxmox ni desde `crm-edge`):

```bash
curl http://10.10.10.10:8001
```

Debe **fallar o no responder** — esa red no existe fuera de Proxmox. Esa
captura es tu prueba real de segmentación, más convincente que cualquier
diagrama.

## 8. Respaldo

```bash
vzdump <ID_VM> --storage local --mode snapshot
```

Prográmalo desde **Datacenter → Backup → Add** para ambas VMs. Pendiente
cuando esto quede en uso real: actualizar `INSTRUCCIONES_RESPALDO.txt`
con este procedimiento (la regla de "la biblia").

---

## 9. Evidencias para el informe

- Captura del check de virtualización anidada (`egrep -c 'vmx|svm'`).
- Captura de `vmbr1` sin bridge port (Datacenter → System → Network).
- Captura de ambas VMs corriendo (Resumen de cada una: CPU/RAM asignada).
- `docker compose ps` en `crm-core` con los 7 contenedores "Up".
- Acceso funcional desde un navegador de la LAN.
- El `curl` fallido del paso 7 — la prueba de aislamiento.

---

## Pendiente para más adelante

¿Este PC (Ryzen 7/20GB) va a ser el servidor definitivo donde vive el
CRM real de tu negocio, o es un entorno de laboratorio solo para la
evidencia de la práctica, mientras el CRM real sigue en otro lado? Eso
decide si esta rutina de respaldo reemplaza a `backup.ps1` o si son dos
sistemas en paralelo — retómalo cuando lo tengas claro.
