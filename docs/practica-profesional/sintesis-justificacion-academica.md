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
- **`crm-edge`** (2 vCPU/2GB): Nginx nativo, con una interfaz en `vmbr0` (hacia la LAN) y
  otra en `vmbr1` (hacia el núcleo). Es el único punto de entrada.
- **`crm-core`** (4 vCPU/8GB): corre el `docker-compose.yml` completo del CRM. Solo tiene
  interfaz en `vmbr1` — inalcanzable directamente desde la LAN. La prueba de aislamiento
  (`curl` fallido desde otro equipo de la LAN a `10.10.10.10`) es la evidencia central de
  segmentación real.
- **Insight no evidente**: VMware (donde vive Proxmox) + Proxmox/KVM (donde viven las VMs
  del CRM) ya constituyen "al menos dos tecnologías de virtualización líderes" — requisito
  explícito del indicador 2.1.1 de Virtualización, cumplido sin haberlo buscado a propósito.
- Automatización de la topología vía Terraform (`infra/proxmox-terraform/`), usando el
  proveedor `bpg/proxmox` contra la API de Proxmox — reutiliza directamente el Terraform
  aprendido en el examen de Arquitectura Cloud, aplicado ahora a infraestructura de
  virtualización/redes en vez de a AWS.

## 4. Mapeo contra las 6 asignaturas reales (con Resultados de Aprendizaje)

| Asignatura | Estado | Detalle |
|---|---|---|
| **Redes Virtuales** (CR404CICRE) | 🔧 Fuerte, con 1 brecha crítica | Cubre VMs/hipervisor/SDN, Docker, API REST. Falta: **Git/GitHub** (requisito explícito y calificado, no implementado todavía) y un playbook de **Ansible** (nombrado explícitamente en el programa; hoy solo hay Terraform). |
| **Virtualización** (CR401ICRE) | ✅ Fuerte | Dos tecnologías de virtualización, VLANs y seguridad en redes virtualizadas (indicador 2.2.3 = diseño de `vmbr1`), asignación de recursos por VM. Clusters/HA/migración en vivo (RA 1.3) no se implementan (falta un segundo servidor físico) pero el verbo del RA es "comprende/explica" — basta documentarlo. |
| **Arquitectura Cloud** (IF304CIINF) | ✅ Ya resuelto | Cubierto al 100% por el Examen Transversal ya rendido sobre RetailPlus LATAM (AWS). No requiere trabajo adicional sobre el CRM. |
| **Gestión de Proyectos** (IF405IINF) | ⏳ Pendiente, independiente de la infraestructura | Pide artefactos PMBOK formales (Acta de constitución, EDT, cronograma/Gantt, matriz RACI, registro de riesgos, línea base + EVM, lecciones aprendidas). Nada de esto existe en formato formal — pero todo el historial real de este proyecto (ver sección 5) es material genuino para construirlos retroactivamente. |
| **Gestión de Servicios TI - ITIL** (CR304ICRE) | ✅ Fuerte | Su ficha oficial la asocia a Ciberseguridad, no a Conectividad y Redes, pero su contenido es la Función 06 ya mapeada en el perfil de egreso. La bitácora de incidentes (sección 5) ES evidencia real de gestión de incidentes/problemas/cambios (RA 1.2). El monitoreo pendiente (Uptime Kuma + Proxmox) cierra también el RA 1.4 de este ramo — misma tarea, doble evidencia. |
| **Gestión de la Información con TICs** (AS300PCOM) | 🔧 Parcial | Ramo transversal (todas las carreras). Calza fuerte en comparación de plataformas cloud (tabla de proveedores ya construida) y en seguridad/protección de datos según marco legal (todo el trabajo de Ley 21.719). El resto del programa (IA, RA/RV, IoT, análisis estadístico de datos, identidad digital en redes sociales) no aplica al CRM — no forzarlo. |

Referencia adicional: el documento "Funciones Laborales — Ingeniería en Conectividad y
Redes" (perfil de egreso, 8 áreas / 32 indicadores) ya fue mapeado en detalle contra este
mismo proyecto; ese análisis vive en el dossier publicado (ver sección 6).

## 5. Bitácora de incidentes reales (material para Gestión de Proyectos y Gestión de Servicios TI)

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

## 6. Otros documentos de referencia

- Dossier de práctica profesional (publicado como Artifact, mapea las 8 funciones del
  perfil de egreso una por una): revisar con César el enlace vigente.
- `guia-proxmox-vms.md` (esta carpeta): guía paso a paso de la arquitectura de 2 VMs.
- `despliegue-oracle-cloud.md` (esta carpeta): alternativa de despliegue en la nube,
  evaluada pero no priorizada.
- `infra/proxmox-terraform/`: código Terraform que automatiza la creación de `vmbr1` y
  las 2 VMs.

## 7. Acciones pendientes, en orden de prioridad

1. **Inicializar git y subir el proyecto a GitHub** — bloquea la evidencia de Redes
   Virtuales; es la acción más urgente.
2. **Ejecutar `terraform apply`** sobre `infra/proxmox-terraform/` y confirmar que las 2
   VMs y `vmbr1` quedan creadas.
3. **Playbook de Ansible** para configurar Nginx/Docker dentro de las VMs (cierra el
   punto de IaC específico de Redes Virtuales).
4. **Monitoreo** (Uptime Kuma + gráficos nativos de Proxmox) — subió de prioridad: cierra
   a la vez la supervisión de continuidad operacional del perfil de egreso y el RA 1.4 de
   Gestión de Servicios TI (ITIL) sobre métricas/SLA.
5. **Artefactos de Gestión de Proyectos** (EDT, Gantt, RACI, riesgos, EVM) usando el
   historial real de este proyecto como caso de estudio.
6. Formalizar un **informe de auditoría de seguridad** sobre la prueba de aislamiento de
   red — mejora adicional para maximizar cobertura, no bloqueante.

**Explícitamente en pausa (a petición del usuario, no retomar sin que lo pida):**
**Backup offsite en la nube.** Arquitectura ya acordada para cuando se retome: `crm-core`
(aislado) → SSH interno → `crm-edge` (bastión) → sube el respaldo → Oracle Cloud.
`crm-core` nunca necesita ruta a internet. Falta decidir Object Storage vs. una VM del
lado de Oracle — no asumir una respuesta.
