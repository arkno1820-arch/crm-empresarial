# Síntesis: CRM Empresarial como justificación de práctica profesional

Documento de referencia único que conecta el proyecto real (CRM Empresarial, en producción
para un negocio real) con las competencias exigidas por la carrera Ingeniería en
Conectividad y Redes. Compilado a partir del trabajo real de desarrollo, no de un caso
simulado.

## 1. Qué es el proyecto

CRM Empresarial es un sistema de gestión interna (empleados, calendario, inventario,
reservas, chat) construido como 7 servicios independientes en Docker Compose detrás de
un gateway Nginx, con patrón "una base de datos por servicio" sobre una única instancia
PostgreSQL. Incluye HTTPS con certificados propios, RBAC granular, cifrado de campo para
datos sensibles (Ley 21.719), auditoría, y una mensajería interna auditable.

## 2. Decisión de despliegue: Proxmox antes que la nube

Se evaluaron dos rutas (nube vía Oracle Cloud Always Free, ver `despliegue-oracle-cloud.md`
en esta misma carpeta; y servidor local vía Proxmox). Se priorizó Proxmox porque:

- La competencia de Arquitectura Cloud ya está certificada por un examen académico
  independiente (caso fijo "RetailPlus LATAM", AWS Academy Learner Lab + Terraform) —
  repetirla con el CRM sería evidencia redundante.
- Nada en el portafolio previo demostraba administración de un hipervisor ni diseño de
  redes virtuales desde cero — eso sí es un vacío real que Proxmox llena.
- El nombre de la carrera es "Conectividad y **Redes**", no "Cloud Engineering": construir
  la capa de virtualización y red propia pesa más que consumir el asistente de un
  proveedor cloud.

## 3. Arquitectura de virtualización implementada

Proxmox VE 9.2 corre anidado dentro de una VM de VMware, sobre un PC físico (Ryzen 7,
20GB RAM) — decisión documentada con transparencia (no es bare-metal, y se dice
explícitamente en cualquier informe).

- **`vmbr1`**: red virtual interna, sin puerto físico asociado — existe solo dentro de
  Proxmox. Es la "red virtual" evaluada por la asignatura Redes Virtuales.
- **Par de borde — `crm-edge` + `crm-edge-b`** (2 vCPU/2GB cada una): Nginx nativo, cada
  una con una interfaz en `vmbr0` (hacia la LAN) y otra en `vmbr1` (hacia el núcleo). No es
  una sola VM sino un par redundante con Keepalived/VRRP (detalle en sección 4) — es el
  único punto de entrada al sistema.
- **Par de núcleo — `crm-core` + `crm-core-b`** (4 vCPU/6GB cada una): corren el
  `docker-compose.yml` completo del CRM. Solo tienen interfaz en `vmbr1` — inalcanzables
  directamente desde la LAN. La prueba de aislamiento (`curl` fallido desde otro equipo de
  la LAN a `10.10.10.10`) es la evidencia central de segmentación real. `crm-core-b` recibe
  una réplica de la base de datos (sección 4) y queda en espera pasiva.
- El diagrama `arquitectura_crm_proxmox.svg` (embebido en el `README.md` del repo) muestra
  las 4 VMs, la IP virtual de Keepalived y la relación de réplica entre el par de núcleo.
- **Insight no evidente**: VMware (donde vive Proxmox) + Proxmox/KVM (donde viven las VMs
  del CRM) ya constituyen "al menos dos tecnologías de virtualización líderes" — requisito
  explícito del indicador 2.1.1 de Virtualización, cumplido sin haberlo buscado a propósito.
- Automatización de la topología vía Terraform (`infra/proxmox-terraform/`), usando el
  proveedor `bpg/proxmox` contra la API de Proxmox — reutiliza directamente el Terraform
  aprendido en el examen de Arquitectura Cloud, aplicado ahora a infraestructura de
  virtualización/redes en vez de a AWS.

## 4. Plan de redundancia y contingencia ante fallas

### 4.1 El techo real: un solo servidor físico

Todo corre hoy sobre un único PC físico (Ryzen 7 / 20GB). Ningún número de VMs
adicionales dentro de Proxmox cambia ese hecho: si el PC se apaga, se quema la fuente o
se corrompe el disco, **todo cae junto**, sin importar cuánta redundancia exista dentro de
él. Lo que sí es alcanzable con VMs adicionales es resiliencia contra la clase de falla
más frecuente en la práctica: un bug de software, una VM que se cuelga, un proceso que
agota la RAM, un contenedor caído — no un fallo del hardware físico completo.

Esta distinción se declara explícitamente porque la empresa está en vías de adquirir un
segundo servidor con UPS de respaldo — la arquitectura de hoy está diseñada para
integrarse con ese segundo servidor cuando llegue, no para fingir una alta disponibilidad
que el hardware actual no puede ofrecer.

### 4.2 Estado actual → Estado objetivo (con el hardware de hoy)

| Componente | Antes | Ahora (rediseño) |
|---|---|---|
| Borde (`crm-edge`) | 1 VM — punto único de falla para todo el acceso | `crm-edge` + `crm-edge-b`, con **Keepalived/VRRP**: IP virtual que salta automáticamente al nodo sano. Failover real, sin intervención manual. |
| Núcleo (`crm-core`) | 1 VM — pérdida total de datos/servicio si falla | `crm-core` + `crm-core-b`, réplica de Postgres vía `pg_dump` cada 15 min (mismo patrón ya usado en `despliegue-oracle-cloud.md`). Promoción a primario: **manual y documentada**, no automática — automatizar la promoción de un primario de base de datos de forma segura (evitar split-brain) es un problema no trivial que no se justifica a esta escala. |
| Respaldo | `vzdump` manual | `vzdump` programado + runbook de recuperación total actualizado a Proxmox (pendiente, ver sección 8). |

Como todavía no se había ejecutado `terraform apply` sobre el diseño original, este
rediseño no es una migración — es cambiar el plano antes del primer despliegue real.

### 4.3 Migración en vivo: qué es posible hoy y qué falta

La migración en vivo en el sentido que evalúa Virtualización (mover una VM corriendo de
un servidor físico a otro, sin caída) **no es posible con un solo host** — no existe un
segundo lugar al cual migrar. Eso requiere un clúster Proxmox de 2 o más nodos.

Lo que sí es real hoy, sin necesitar un segundo servidor:
- **Snapshot/backup en caliente** (`vzdump` en modo snapshot) de una VM corriendo.
- **Migración de almacenamiento entre discos del mismo host** (si el PC tiene más de un
  disco físico) — mitiga la falla de un disco específico, no la del servidor completo.

Decisión de diseño para dejar el camino listo: los discos de las VMs se mantienen en
almacenamiento local estándar (no algo propietario), para que cuando el segundo servidor
llegue, Proxmox permita sumarlo a un clúster y migrar VMs con copia de disco incluida,
sin depender de storage compartido desde el día uno.

### 4.4 Qué no cambia con este plan

La redundancia de VMs descrita en 4.2 protege contra fallas de software/VM. **No**
protege contra la falla del PC físico completo — eso sigue dependiendo de: (a) el segundo
servidor que la empresa está adquiriendo, o (b) el respaldo offsite en la nube, que queda
explícitamente en pausa (ver sección 8) hasta que se retome.

## 5. Mapeo contra las 8 asignaturas reales (con Resultados de Aprendizaje)

| Asignatura | Estado | Detalle |
|---|---|---|
| **Redes Virtuales** (CR404CICRE) | ✅ Fuerte | Cubre VMs/hipervisor/SDN, Docker, API REST. **Git/GitHub resuelto** (repo `arkno1820-arch/crm-empresarial` actualizado, historial preservado). **Ansible resuelto** (`infra/ansible/`, roles crm_edge/crm_core, corre desde crm-edge como control node) — pendiente solo de ejecutarse una vez existan las VMs. |
| **Virtualización** (CR401ICRE) | ✅ Fuerte | Dos tecnologías de virtualización, VLANs y seguridad en redes virtualizadas (indicador 2.2.3 = diseño de `vmbr1`), asignación de recursos por VM. Clusters/HA/migración en vivo (RA 1.3): el verbo del RA es "comprende/explica" — ver sección 4 (Plan de redundancia), que documenta con precisión qué es posible con un solo host y qué requiere el segundo servidor. |
| **Arquitectura Cloud** (IF304CIINF) | ✅ Ya resuelto | Cubierto al 100% por el Examen Transversal ya rendido sobre RetailPlus LATAM (AWS). No requiere trabajo adicional sobre el CRM. |
| **Gestión de Proyectos** (IF405IINF) | ⏳ Pendiente, independiente de la infraestructura | Pide artefactos PMBOK formales (Acta de constitución, EDT, cronograma/Gantt, matriz RACI, registro de riesgos, línea base + EVM, lecciones aprendidas). Nada de esto existe en formato formal — pero todo el historial real de este proyecto (ver sección 6) es material genuino para construirlos retroactivamente. |
| **Gestión de Servicios TI - ITIL** (CR304ICRE) | ✅ Fuerte | Su ficha oficial la asocia a Ciberseguridad, no a Conectividad y Redes, pero su contenido es la Función 06 ya mapeada en el perfil de egreso. La bitácora de incidentes (sección 5) ES evidencia real de gestión de incidentes/problemas/cambios (RA 1.2). El monitoreo pendiente (Uptime Kuma + Proxmox) cierra también el RA 1.4 de este ramo — misma tarea, doble evidencia. |
| **Gestión de la Información con TICs** (AS300PCOM) | 🔧 Parcial | Ramo transversal (todas las carreras). Calza fuerte en comparación de plataformas cloud (tabla de proveedores ya construida) y en seguridad/protección de datos según marco legal (todo el trabajo de Ley 21.719). El resto del programa (IA, RA/RV, IoT, análisis estadístico de datos, identidad digital en redes sociales) no aplica al CRM — no forzarlo. |
| **Automatización de Redes Corporativas** (CR303CICRE) | ⛔ El más débil | Sin programa oficial disponible; contenido es Multicast/QoS/GRE/IPsec a nivel de routers físicos Cisco — no aplica a una red de bridges virtuales. Su único punto de contacto (Ansible) ya está contado en Redes Virtuales, no suma evidencia nueva. No forzarlo más. |
| **Diseño y Arquitectura de Redes** (CR301ICRE) | ✅✅ Uno de los match más fuertes | RA 2.1 (diseño escalable con rendimiento/disponibilidad/seguridad) describe literalmente el par `crm-edge`/`crm-edge-b` y el par `crm-core`/`crm-core-b`. El estándar **FCAPS** (Fault/Configuration/Accounting/Security ya cubiertos; solo falta Performance = el monitoreo pendiente) mapea casi perfecto con el proyecto. Diagrama topológico actualizado: `arquitectura_crm_proxmox.svg`, ahora con las 4 VMs redundantes (reemplaza al antiguo `arquitectura_crm_microservicios.png` y a la primera versión de 2 VMs, ambas de antes del plan de redundancia). |

Referencia adicional: el documento "Funciones Laborales — Ingeniería en Conectividad y
Redes" (perfil de egreso, 8 áreas / 32 indicadores) ya fue mapeado en detalle contra este
mismo proyecto; ese análisis vive en el dossier publicado (ver sección 7).

## 6. Bitácora de incidentes reales (material para Gestión de Proyectos y Gestión de Servicios TI)

Problemas de infraestructura reales, encontrados y resueltos durante el desarrollo —
evidencia auténtica de gestión de incidentes, no simulada:

1. **Caché de DNS del gateway Nginx**: tras reconstruir contenedores, Nginx seguía
   resolviendo IPs viejas de los servicios (upstream estático). Causaba errores 404/500
   intermitentes. Resuelto con `resolver 127.0.0.11 valid=10s;` + variables dinámicas en
   `proxy_pass`.
2. **Confianza cruzada de certificados HTTPS**: el gateway (puerto 8443) y el frontend
   (puerto 3443) usan certificados autofirmados independientes; el navegador debía
   confiar en ambos por separado, y el orden de visita importaba. Causaba "Failed to
   fetch" en el primer login. Resuelto documentando el orden correcto en
   `INSTRUCCIONES_RESPALDO.txt`.
3. **Migración de cifrado silenciosamente no aplicada**: SQLAlchemy no detectaba cambios
   al reasignar el mismo valor a un campo cifrado, por lo que la migración de datos
   sensibles a texto cifrado no producía ningún `UPDATE` real. Resuelto con
   `flag_modified` de `sqlalchemy.orm.attributes`.
4. **Restricción de hardware**: la laptop inicial (Celeron/4GB) no alcanzaba para el
   diseño de virtualización planeado, forzando un pivote de VMs a LXC y luego, al
   encontrar un PC más potente (Ryzen 7/20GB), un segundo pivote de vuelta a VMs reales.
   Documentado como decisión de arquitectura, no como error.
5. **Conflicto de virtualización VT-x entre Docker Desktop y Proxmox (2026-09-20)**:
   Intel VT-x solo lo puede poseer un hipervisor a la vez — Hyper-V/WSL2 (que Docker
   Desktop necesita en Windows) y la virtualización anidada que VMware le expone a
   Proxmox compiten por el mismo recurso. Decisión: se retira Docker Desktop del PC
   físico por completo (el CRM ya no lo necesita ahí, vive en `crm-core`); se desactiva
   Hyper-V a nivel de arranque (`bcdedit /set hypervisorlaunchtype off`) para que Proxmox
   corra siempre acelerado. Este PC pasa de ser "laboratorio" a ser el servidor real del
   negocio.
6. **DNS roto heredado de la plantilla base (2026-09-23, primer `terraform apply` real)**:
   tanto el propio host Proxmox como las 4 VMs recién creadas traían un `nameserver`
   inválido (`192.168.100.1`) y un dominio de búsqueda ajeno (`search getlabdone.local`),
   resabio de la plataforma de laboratorio con la que se instaló Proxmox. Causaba
   `apt`/`wget` colgados o con "Name or service not known" — no un problema de red (el
   `ping` a `8.8.8.8` funcionaba). Diagnosticado aislando capas (`ping` → `getent` →
   `resolvectl query` → `curl -4` directo) hasta ubicar el resolver roto. Resuelto
   agregando DNS explícito (`8.8.8.8`/`1.1.1.1`) vía el bloque `dns` de `cloud-init` en
   Terraform, y reemplazando `/etc/resolv.conf` por un archivo estático en los nodos
   donde el stub de `systemd-resolved` seguía resolviendo solo IPv6 para `apt`.
7. **Disco de la plantilla cloud-init insuficiente (2GB)**: la plantilla Ubuntu trae un
   disco de 2GB, suficiente para arrancar pero no para `apt update`/instalar paquetes.
   Síntoma engañoso: parecía un cuelgue de red, pero el log real decía
   "No space left on device". Resuelto agregando un bloque `disk` en Terraform (8GB
   borde, 25GB núcleo) sobre el storage `local-lvm` (thin-provisioned, permite asignar
   más espacio virtual del que se usa realmente), seguido de `growpart`/`resize2fs`
   dentro de cada VM.
8. **Aislamiento total de `crm-core` incompatible con el aprovisionamiento real**: el
   diseño original decía "sin salida a Internet" para el núcleo, pero Ansible necesita
   que `crm-core` instale Docker y clone el repo — ambos requieren Internet. Se
   distinguió aislamiento de **entrada** (nadie de la LAN llega a `crm-core`, se
   mantiene) de aislamiento de **salida** (relajado deliberadamente): se habilitó NAT de
   solo-salida en el host Proxmox (`iptables -t nat -A POSTROUTING -s 10.10.10.0/24 -o
   vmbr0 -j MASQUERADE` + `ip_forward=1`, persistente vía `iptables-persistent`) — mismo
   patrón que una subred privada con NAT gateway en la nube.
9. **`docker-compose-plugin` no existe en los repos base de Ubuntu**: el rol de Ansible
   asumía que venía con `docker.io`, pero ese paquete específico solo existe en el
   repositorio oficial de Docker (`download.docker.com`). Resuelto agregando el
   repositorio oficial (llave GPG + `apt_repository`) antes de instalar
   `docker-ce`/`docker-compose-plugin`.
10. **`git clone` no puede clonar sobre un directorio no vacío**: el runbook copiaba el
    `.env` antes de clonar, dejando el directorio destino no vacío y sin ser aún un
    repositorio git — `ansible.builtin.git` no lo resuelve solo. Corregido el orden real
    de operación (clonar primero, copiar `.env`/certificados después) para la ejecución
    manual; documentado como corrección al runbook de `infra/ansible/README.md`.
11. **Permisos del `$HOME` bloqueaban a Nginx (`crm-edge`)**: `/home/cesar` traía permisos
    `750` por defecto (Ubuntu), y Nginx corre como `www-data` — no podía ni atravesar el
    directorio para servir `frontend/index.html`, aunque los archivos internos sí eran
    legibles. Síntoma: `500 Internal Server Error` con "Permission denied" en el log,
    pese a que el proxy hacia `crm-core` funcionaba bien. Resuelto con `chmod o+x
    /home/cesar` en ambos nodos de borde.

## 7. Otros documentos de referencia

- Dossier de práctica profesional (publicado como Artifact, mapea las 8 funciones del
  perfil de egreso una por una): revisar con César el enlace vigente.
- `guia-proxmox-vms.md` (esta carpeta): guía paso a paso de la arquitectura de 2 VMs.
- `despliegue-oracle-cloud.md` (esta carpeta): alternativa de despliegue en la nube,
  evaluada pero no priorizada.
- `infra/proxmox-terraform/`: código Terraform que automatiza la creación de `vmbr1` y
  las 4 VMs (par de borde + par de núcleo redundantes).

## 8. Acciones pendientes, en orden de prioridad

1. ~~Inicializar git y subir el proyecto a GitHub~~ — **hecho el 2026-09-20**: el
   repositorio ya existía (`arkno1820-arch/crm-empresarial`, commit inicial del 26 de
   agosto); se sincronizó sin perder ese historial y se subió un commit con toda la
   evolución desde entonces, sin secretos ni certificados privados.
2. ~~Rediseñar para redundancia~~ — **hecho el 2026-09-20**: Terraform ahora define 4 VMs
   (`crm-edge`/`crm-edge-b` con Keepalived/VRRP; `crm-core`/`crm-core-b` con réplica de
   Postgres cada 15 min y promoción manual documentada). Ver sección 4.
3. ~~Ejecutar `terraform apply` y `ansible-playbook playbook.yml`~~ — **hecho el
   2026-09-23**: las 4 VMs están arriba contra el Proxmox real, con `PLAY RECAP
   failed=0` en los 4 hosts. Verificado end-to-end: `http://192.168.1.62` (la IP
   virtual, no `crm-edge` directamente) sirve el login del CRM, el proxy hacia
   `crm-core` responde (`/api/auth/docs` con 200), y los 9 contenedores de Docker
   (6 microservicios + gateway + frontend + Postgres) están `Up`/`healthy`. El camino
   no fue directo — ver los incidentes 6 a 11 de la sección 6 (DNS heredado, disco de
   2GB insuficiente, aislamiento de `crm-core` incompatible con aprovisionamiento real,
   `docker-compose-plugin` fuera de los repos base, orden de `git clone` vs. copiar
   `.env`, permisos de `$HOME` bloqueando a Nginx) — cada uno con su causa raíz real,
   diagnosticada y documentada, no solo "funcionó a la segunda".
   **Pendiente inmediato, no bloqueante**: la plantilla Nginx de `crm-edge`
   (`nginx-crm-edge.conf.j2`) solo tiene `listen 80` — nunca se le agregó HTTPS. Es
   el mismo tema que quedó en pausa en `pendiente_https_multidispositivo` (memoria);
   ahora que ya se sabe que el CRM vive en Proxmox, se puede retomar.
   **Aún no probado**: el failover real de Keepalived (apagar `crm-edge` y confirmar
   que `192.168.1.62` sigue respondiendo vía `crm-edge-b`) — es la evidencia central
   del plan de redundancia y todavía no se ha ejecutado la prueba.
4. **Monitoreo** (Uptime Kuma + gráficos nativos de Proxmox) — la acción con más
   respaldo cruzado: cierra la supervisión de continuidad operacional del perfil de
   egreso, el RA 1.4 de ITIL, y el pilar "Performance" de FCAPS (Diseño y Arquitectura
   de Redes) — los otros 4 pilares de FCAPS ya están cubiertos.
5. ~~Actualizar el diagrama topológico~~ — hecho el 2026-09-20 (reemplazó al antiguo
   `arquitectura_crm_microservicios.png`), y **actualizado de nuevo el 2026-09-21** porque esa
   primera versión solo mostraba 2 VMs y ya existía el plan de redundancia: `arquitectura_crm_proxmox.svg`
   ahora muestra las 4 VMs (par de borde con IP virtual de Keepalived, par de núcleo con la
   réplica de Postgres) — pedido explícito del RA 2.2 de Diseño y Arquitectura de Redes.
6. **Artefactos de Gestión de Proyectos** (EDT, Gantt, RACI, riesgos, EVM) usando el
   historial real de este proyecto como caso de estudio.
7. Formalizar un **informe de auditoría de seguridad** sobre la prueba de aislamiento de
   red — mejora adicional para maximizar cobertura, no bloqueante.

**Explícitamente en pausa (a petición del usuario, no retomar sin que lo pida):**
**Backup offsite en la nube.** Arquitectura ya acordada para cuando se retome: `crm-core`
(aislado) → SSH interno → `crm-edge` (bastión) → sube el respaldo → Oracle Cloud.
`crm-core` nunca necesita ruta a internet. Falta decidir Object Storage vs. una VM del
lado de Oracle — no asumir una respuesta.
