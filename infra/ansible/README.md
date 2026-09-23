# Ansible — configuración del par de borde y el par de núcleo

Automatiza lo que en `guia-proxmox-vms.md` se hacía a mano por SSH (instalar
Nginx/Docker, desplegar la configuración, levantar el stack), y además
configura la **redundancia**: Keepalived en el borde (`crm-edge`/`crm-edge-b`)
y replicación de Postgres en el núcleo (`crm-core`/`crm-core-b`). Complementa
al Terraform de `infra/proxmox-terraform/` — Terraform crea las 4 VMs y la
red, Ansible las configura por dentro.

Ver `docs/practica-profesional/sintesis-justificacion-academica.md` sección 4
para el porqué de este diseño (qué protege y qué no, con un solo PC físico).

---

## 0. Por qué se corre desde `crm-edge` y no desde tu PC Windows

Ansible no corre nativo en Windows sin WSL, y ya decidimos no usar WSL (compite
por VT-x con la virtualización anidada de Proxmox). La solución: `crm-edge` es
una VM Linux con ruta directa a `crm-core`/`crm-core-b` por `vmbr1` y a
`crm-edge-b` por `vmbr0` (misma LAN) — es un control node válido, y de paso
funciona como bastión único de administración.

## 1. Instalar Ansible en `crm-edge`

```bash
sudo apt update && sudo apt install -y ansible
```

## 2. Copiar esta carpeta a crm-edge

Desde tu PC Windows:

```powershell
scp -r infra/ansible cesar@192.168.1.60:~/ansible
```

## 3. Copiar el `.env` y los certificados reales a AMBAS VMs del núcleo (paso manual, nunca por Ansible ni por git)

**Orden importante**: corre primero el paso 4 (el playbook clona el repo), y
recién después copia `.env` y `certs/` — `git clone` se niega a clonar sobre
un directorio no vacío. Si ya creaste el directorio a mano antes de clonar,
mueve su contenido afuera, deja que el playbook clone, y devuélvelo (con
`sudo`, porque el clon queda con dueño `root`).

```powershell
scp -o ProxyJump=cesar@192.168.1.60 .env cesar@10.10.10.10:/home/cesar/crm-empresarial/.env
scp -o ProxyJump=cesar@192.168.1.60 .env cesar@10.10.10.11:/home/cesar/crm-empresarial/.env
scp -o ProxyJump=cesar@192.168.1.60 frontend/certs/*.crt frontend/certs/*.key cesar@10.10.10.10:/home/cesar/crm-empresarial/frontend/certs/
scp -o ProxyJump=cesar@192.168.1.60 frontend/certs/*.crt frontend/certs/*.key cesar@10.10.10.11:/home/cesar/crm-empresarial/frontend/certs/
scp -o ProxyJump=cesar@192.168.1.60 gateway/certs/*.crt gateway/certs/*.key cesar@10.10.10.10:/home/cesar/crm-empresarial/gateway/certs/
scp -o ProxyJump=cesar@192.168.1.60 gateway/certs/*.crt gateway/certs/*.key cesar@10.10.10.11:/home/cesar/crm-empresarial/gateway/certs/
```

`frontend/certs/` y `gateway/certs/` están en `.gitignore` (nunca viajan por
git), así que el `docker compose build` del frontend falla con "COPY certs/:
not found" si no los copias antes de correr el playbook completo.

## 4. Correr el playbook

Ya dentro de `crm-edge`:

```bash
cd ~/ansible
ansible-playbook playbook.yml
```

Verifica: `PLAY RECAP` debe mostrar `failed=0` para los 4 hosts
(`localhost` = crm-edge, `crm-edge-b`, `crm-core`, `crm-core-b`).

## 4.5. Si `crm-edge`/`crm-edge-b` sirven un 500 al abrir la IP virtual

Si el proxy hacia `crm-core` funciona pero la página principal da `500` con
"Permission denied" en `/var/log/nginx/error.log`, es que `/home/cesar` trae
los permisos por defecto de Ubuntu (`750`) y Nginx (usuario `www-data`) no
puede ni atravesar el directorio. Se corrige una vez por VM:

```bash
sudo chmod o+x /home/cesar
```

## 5. Verificar

Desde cualquier equipo de la LAN: `http://192.168.1.62` (la **IP virtual**,
no la de `crm-edge` directamente) debe mostrar el login del CRM. También
responde en `https://192.168.1.62` con un certificado autofirmado propio
(cada nodo genera el suyo al primer arranque del rol `crm_edge`, cubriendo
la VIP y ambos nodos como SAN — acepta la advertencia del navegador la
primera vez, es autofirmado a propósito). Apaga `crm-edge` un momento y
confirma que `192.168.1.62` sigue respondiendo (ahora servido por
`crm-edge-b`) — esa es la prueba real de que Keepalived funciona.

---

## Qué hacer si `crm-core` falla (runbook de promoción manual)

La promoción de `crm-core-b` a primario es **deliberadamente manual** — no se
automatiza porque hacerlo de forma segura exige detectar split-brain, y eso no
se justifica a esta escala. Pasos:

1. Confirma que `crm-core` realmente no responde (no solo un contenedor
   colgado — revisa `docker compose ps` primero por si alcanza con
   reiniciar un contenedor en vez de promover).
2. Revisa la frescura de la réplica en `crm-core-b`:
   `cat ~/pg_replica/replica.log` en `crm-core` (si sigue vivo) o
   directamente inspecciona las tablas en `crm-core-b`.
3. En `crm-edge` **y** `crm-edge-b`, cambia `crm_core_ip` de `10.10.10.10` a
   `10.10.10.11` en `group_vars/all.yml` y vuelve a correr
   `ansible-playbook playbook.yml --tags nginx` (o edita a mano
   `/etc/nginx/sites-available/default` y `nginx -s reload` en ambos si
   necesitas velocidad y no puedes esperar el playbook completo).
4. Cuando `crm-core` se recupere, **no lo reincorpores de inmediato** —
   primero sincroniza sus datos desde `crm-core-b` (el flujo de replicación
   se invierte temporalmente) para no perder lo que pasó mientras `crm-core-b`
   era el activo. Mismo principio que ya usamos en `despliegue-oracle-cloud.md`.

## Nota sobre el repositorio

Si `arkno1820-arch/crm-empresarial` en GitHub es privado, el paso "Clonar o
actualizar el repositorio" va a fallar por falta de credenciales — en ese caso
hay que configurar una llave SSH de despliegue o un token en cada VM. Si es
público, no hace falta nada extra.

## Evidencia para el informe

- Salida completa de `ansible-playbook playbook.yml` (el `PLAY RECAP`) para
  los 4 hosts.
- Este mismo código (`playbook.yml`, roles `crm_edge`/`crm_core`/
  `keepalived`/`pg_replica`) como evidencia de infraestructura como código
  con Ansible — la herramienta que Redes Virtuales nombra explícitamente.
- Correr el playbook una segunda vez y mostrar `changed=0` en la mayoría de
  las tareas — evidencia de idempotencia.
- **Prueba de failover real**: apagar `crm-edge` y mostrar que
  `192.168.1.62` sigue respondiendo vía `crm-edge-b` — la evidencia central
  del plan de redundancia (sección 4 de la síntesis académica).
