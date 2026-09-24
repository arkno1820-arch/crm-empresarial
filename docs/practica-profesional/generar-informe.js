const H = require("./build-informe.js");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, fs, path,
  h1, h2, h3, p, pRich, bold, normal, italic, bullet, numbered, makeTable,
  imageBlock, evidenceImage, pageBreak, codeBlock,
  TableOfContents, portraitSection, landscapeSection,
} = H;

// ============================================================
// SECCION 1 (portrait): Portada
// ============================================================
const s1 = [
  new Paragraph({ spacing: { before: 1200 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "INFORME DE PRÁCTICA PROFESIONAL", bold: true, size: 30, color: "0F403C" })],
  }),
  new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Diseño, Implementación y Gestión de un CRM Empresarial", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: "para el Centro CHIC, con Infraestructura Virtualizada Redundante", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "en Proxmox VE", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
    children: [new TextRun({ text: "Ingeniería en Conectividad y Redes", size: 24, italics: true, color: "535E5C" })] }),
  new Paragraph({ spacing: { before: 1200 } }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "César Manríquez Figueroa", bold: true, size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "arkno1820@gmail.com", size: 20, color: "535E5C" })] }),
  new Paragraph({ spacing: { before: 600 } }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Institución: Centro CHIC", size: 18, color: "535E5C" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Repositorio: github.com/arkno1820-arch/crm-empresarial", size: 18, color: "535E5C" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Periodo de la práctica: 28 de septiembre al 27 de noviembre de 2026 (360 horas)", size: 18, color: "535E5C" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Documento base entregado: 24 de septiembre de 2026 (previo al inicio formal)", size: 18, color: "535E5C" })] }),
];

// ============================================================
// SECCION 2 (portrait): Indice
// ============================================================
const s2 = [
  new Paragraph({ text: "Índice", heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 200 } }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ spacing: { after: 120 },
    children: [new TextRun({ text: "Nota: si el índice aparece vacío, hacer clic derecho sobre él → \"Actualizar campo\" → \"Actualizar todo el índice\" (comportamiento normal de Word con índices generados por software).", italics: true, size: 18, color: "666666" })] }),
];

// ============================================================
// SECCION 3 (portrait): Resumen + Introduccion
// ============================================================
const s3 = [
  h1("Resumen Ejecutivo"),
  p(
    "Este informe documenta el diseño, desarrollo y despliegue de “CRM Empresarial”, un sistema de " +
    "gestión interna desarrollado como solución al problema real que enfrenta el Centro CHIC: sus " +
    "trabajadores no contaban con un sistema unificado que agrupara sus necesidades operativas " +
    "(gestión de personal, calendario, inventario, reservas y comunicación interna). La solución se " +
    "diseñó de forma modular sobre contenedores Docker —el estándar de la industria actual— y " +
    "evolucionó hasta una infraestructura virtualizada redundante sobre Proxmox VE, desplegada sobre " +
    "el servidor físico ya existente en la infraestructura de CHIC."
  ),
  p(
    "Siguiendo instrucciones explícitas de la jefatura del proyecto, la metodología de trabajo fue " +
    "diseñar y validar primero en un entorno de simulación (Proxmox anidado sobre VMware) para adquirir " +
    "la experiencia operativa necesaria, antes de migrar a producción sobre el servidor físico en modo " +
    "nativo. Este informe cubre la fase de diseño, implementación y validación en el entorno de " +
    "simulación, con evidencia real de doce incidentes resueltos, dos pruebas de failover ejecutadas " +
    "contra la infraestructura real, HTTPS con autoridad certificadora propia, y monitoreo activo. La " +
    "migración a producción bare metal y el respaldo offsite en la nube se abordan como las siguientes " +
    "fases formales de la práctica, con su cronograma y cotización de hardware ya definidos en este " +
    "mismo documento."
  ),
  p(
    "El proyecto se usa como evidencia de práctica profesional para siete asignaturas de la carrera " +
    "Ingeniería en Conectividad y Redes. El presente documento incluye, además de la arquitectura " +
    "técnica en tres niveles de abstracción, los artefactos formales de Gestión de Proyectos (Acta de " +
    "Constitución, EDT, cronograma de 360 horas, matriz RACI, registro de riesgos y línea base de Valor " +
    "Planificado) construidos para el periodo real de la práctica (28 de septiembre al 27 de noviembre " +
    "de 2026)."
  ),

  h1("1. Introducción"),
  h2("1.1 Contexto y motivación"),
  p(
    "El Centro CHIC identificó que sus trabajadores carecían de una herramienta propia para gestionar " +
    "las operaciones diarias del centro: administración de personal, calendario de actividades, " +
    "inventario de recursos, reservas de espacios/equipos, y comunicación interna. Esta carencia se " +
    "resolvía de forma manual o con herramientas genéricas no integradas entre sí, sin control interno " +
    "sobre dónde y cómo se almacena información sensible del personal bajo la Ley 21.719 de Protección " +
    "de Datos Personales, vigente en Chile."
  ),
  p(
    "Como alumno en práctica, se me encargó diseñar una solución de software que agrupara estas " +
    "necesidades en un sistema único, propio de la institución. La respuesta a ese encargo es el CRM " +
    "Empresarial descrito en este informe: una aplicación modular en microservicios, contenedorizada " +
    "con Docker, con seguridad de acceso por roles y cumplimiento de la normativa de protección de " +
    "datos, desplegada sobre la infraestructura de virtualización propia del centro."
  ),
  h2("1.2 Objetivos"),
  bullet("Diseñar y construir una aplicación CRM funcional, modular (microservicios), con seguridad de acceso por roles y cumplimiento de la normativa chilena de protección de datos, que agrupe las necesidades operativas reales de CHIC."),
  bullet("Validar el diseño de infraestructura en un entorno de simulación (Proxmox sobre VMware), según la metodología instruida por la jefatura, antes de migrar a producción sobre el servidor físico real de la institución."),
  bullet("Diseñar e implementar un esquema de redundancia (borde y núcleo) que tolere fallas de software/VM sin intervención manual, y verificarlo con pruebas de falla reales, no solo documentadas."),
  bullet("Instrumentar monitoreo activo de los componentes críticos del sistema."),
  bullet("Gestionar el proyecto con las herramientas formales de Gestión de Proyectos (EDT, cronograma, RACI, riesgos, valor planificado), encuadradas en el periodo oficial de la práctica profesional (360 horas)."),
  h2("1.3 Alcance"),
  p(
    "El alcance de esta práctica cubre el desarrollo completo de la aplicación (backend de 6 " +
    "microservicios + gateway + frontend), la infraestructura como código (Terraform y Ansible) para " +
    "desplegarla de forma redundante en el entorno de simulación, la seguridad de transporte (HTTPS con " +
    "CA privada) y de aplicación (cifrado, auditoría), el monitoreo, y la documentación de gestión de " +
    "proyecto."
  ),
  p(
    "Además, el alcance incluye activamente dos frentes de trabajo que se ejecutan durante el periodo " +
    "formal de la práctica: (1) el respaldo offsite en la nube (Oracle Cloud, nivel gratuito), y (2) la " +
    "cotización formal y gestión de adquisición de un segundo servidor físico, paso previo necesario " +
    "para la migración a producción bare metal y para la migración en vivo real entre servidores. Ambos " +
    "frentes están planificados dentro del cronograma de 360 horas (sección 5.3) y la cotización formal " +
    "de hardware se presenta en la sección 5.8 de este informe."
  ),
];

// ============================================================
// SECCION 4 (portrait): Marco academico
// ============================================================
const s4 = [
  h1("2. Marco Académico: Justificación por Asignatura"),
  p(
    "La siguiente tabla resume, para cada una de las siete asignaturas identificadas como relevantes, " +
    "el grado de cobertura que este proyecto ofrece como evidencia de práctica profesional. La " +
    "calificación no es autocomplaciente: donde el proyecto no calzaba con el contenido de una " +
    "asignatura, esa asignatura se excluyó del análisis en vez de forzar una relación artificial (fue " +
    "el caso de Automatización de Redes Corporativas, cuyo contenido —protocolos de dispositivos " +
    "físicos Cisco— no es competente para una red de bridges virtuales)."
  ),
];
const acadRows = [
  ["Redes Virtuales\n(CR404CICRE)", "Fuerte", "VMs/hipervisor/SDN, Docker, API REST. Git/GitHub y Ansible resueltos como evidencia (repositorio real con historial preservado; roles crm_edge/crm_core corriendo desde crm-edge como control node)."],
  ["Virtualización\n(CR401ICRE)", "Fuerte", "Dos tecnologías de virtualización en la misma pila (VMware anida a Proxmox/KVM), VLANs y segmentación de redes virtuales (vmbr1), asignación de recursos por VM. La migración en vivo real entre servidores queda como la fase siguiente de la práctica, ligada a la cotización de hardware (sección 5.8)."],
  ["Arquitectura Cloud\n(IF304CIINF)", "Fuerte", "Automatización de la topología completa con Terraform (IaC) contra la API de Proxmox, incluyendo un segundo `apply` de actualización en caliente. El respaldo offsite hacia Oracle Cloud (Fase F4) y la evaluación de arquitectura híbrida on-premise/nube completan la evidencia de esta asignatura sobre el propio proyecto."],
  ["Gestión de Proyectos\n(IF405IINF)", "Cubierto en este informe", "Acta de Constitución, EDT, cronograma real de 360 horas, matriz RACI, registro de riesgos y línea base de Valor Planificado, todos construidos para el periodo real de la práctica (sección 5)."],
  ["Gestión de Servicios TI — ITIL\n(CR304ICRE)", "Fuerte", "La bitácora de 12 incidentes reales (sección 8) es evidencia genuina de gestión de incidentes/problemas/cambios. El monitoreo con Uptime Kuma cubre el requisito de supervisión, SLA y métricas."],
  ["Gestión de la Información con TICs\n(AS300PCOM)", "Parcial", "Calza en comparación de plataformas cloud y en seguridad/protección de datos según marco legal (Ley 21.719). El resto del programa (IA, IoT, redes sociales) no aplica a un proyecto de infraestructura —no se fuerza."],
  ["Diseño y Arquitectura de Redes\n(CR301ICRE)", "Uno de los más fuertes", "El estándar FCAPS mapea con los 5 pilares cubiertos: Fault (bitácora), Configuration (Git/Terraform/Ansible), Accounting (RBAC), Security (HTTPS/CA privada/cifrado) y Performance (Uptime Kuma). Diagrama topológico incluido en este informe."],
];
s4.push(makeTable([2400, 1600, 5800], ["Asignatura", "Cobertura", "Justificación"], acadRows));
s4.push(p(
  "La figura 1 (página siguiente, en formato horizontal para mayor legibilidad) complementa esta " +
  "tabla mostrando, para cada asignatura, qué componente técnico concreto del proyecto le corresponde " +
  "—no solo una relación temática, sino un aporte verificable en el código y la infraestructura " +
  "desplegada."
));

// ============================================================
// SECCION 5 (landscape): Diagrama 7 - justificacion cruzada
// ============================================================
const s5 = [
  h2("Figura 1 — Justificación académica cruzada"),
  ...imageBlock("07-justificacion-cruzada-ramos.png", 1300, 760,
    "Figura 1. Relación técnica entre las 7 asignaturas y el proyecto central. Enfoque: cada asignatura aporta un componente real y verificable del sistema, no solo una coincidencia temática.", 950),
];

// ============================================================
// SECCION 6 (portrait): Intro a Arquitectura + ADRs
// ============================================================
const s6 = [
  h1("3. Arquitectura del Sistema"),
  p(
    "La arquitectura se presenta en tres niveles de abstracción —inspirados en el modelo C4 de " +
    "documentación de software—, seguidos de la vista física de infraestructura sobre Proxmox. Cada " +
    "nivel responde una pregunta distinta: qué es el sistema (contexto), de qué módulos está hecho " +
    "(contenedores), y cómo fluye una operación concreta dentro de él (secuencia). Los cuatro diagramas " +
    "se presentan en la página siguiente, en formato horizontal para que el detalle sea legible."
  ),
];

// ============================================================
// SECCION 7 (landscape): 4 diagramas de arquitectura
// ============================================================
const s7 = [
  h2("Figura 2 — Diagrama de Contexto (Nivel 1)"),
  ...imageBlock("01-alto-nivel-contexto.png", 1000, 650,
    "Figura 2. Quiénes usan el sistema y con qué otros sistemas interactúa. Enfoque: el CRM es autocontenido, sin integraciones externas salvo GitHub y el propio servidor de CHIC.", 900),
  pageBreak(),
  h2("Figura 3 — Diagrama de Módulos / Contenedores (Nivel 2)"),
  ...imageBlock("02-modulos-docker.png", 1100, 800,
    "Figura 3. Los 9 contenedores Docker de la aplicación y el patrón “database per service”. Enfoque: cada microservicio es dueño exclusivo de su base de datos, y toda solicitud pasa por el gateway.", 950),
  pageBreak(),
  h2("Figura 4 — Diagrama de Secuencia (Nivel 3)"),
  ...imageBlock("03-bajo-nivel-flujo-login.png", 1000, 730,
    "Figura 4. Flujo real de login y de una llamada autenticada posterior. Enfoque: el token JWT permite que cada microservicio valide una solicitud sin depender de auth-service en cada llamada (sin punto único de falla por autenticación).", 900),
  pageBreak(),
  h2("Figura 5 — Vista física: infraestructura de virtualización"),
  p("La aplicación descrita arriba no corre en un contenedor suelto: vive dentro de una arquitectura redundante de 4 máquinas virtuales sobre el servidor físico de CHIC, en el entorno de simulación (Proxmox anidado en VMware) definido por la metodología del proyecto."),
  ...imageBlock("04-infraestructura-proxmox.png", 1200, 910,
    "Figura 5. Arquitectura de virtualización y redundancia sobre Proxmox VE, entorno de simulación. Enfoque: el par de borde (Keepalived) y el par de núcleo (réplica de Postgres) tolerando fallas de software sin intervención manual, y el techo real declarado (un solo servidor físico hoy).", 1000),
];

// ============================================================
// SECCION 8 (portrait): ADRs
// ============================================================
const s8 = [
  h1("4. Decisiones de Arquitectura (resumen de ADRs)"),
];
const adrs = [
  ["ADR-00", "Metodología: simulación antes de producción", "Instrucción explícita de la jefatura del proyecto: diseñar y validar primero en un entorno de simulación (Proxmox anidado sobre VMware) para adquirir experiencia operativa, antes de migrar a producción sobre el servidor físico de CHIC en modo nativo (bare metal). Este informe documenta la fase de simulación, ya validada; la migración a producción es la fase siguiente formal de la práctica."],
  ["ADR-01", "Redundancia activa-pasiva (no clúster de alta disponibilidad)", "Con un solo servidor físico disponible hoy, un clúster Proxmox multi-nodo o la migración en vivo real no son alcanzables todavía. Se optó por redundancia a nivel de VM (Keepalived + réplica de Postgres) dentro del entorno de simulación, documentando honestamente su techo: protege contra fallas de software, no contra la falla del servidor físico completo."],
  ["ADR-02", "Promoción de base de datos manual, no automática", "Automatizar de forma segura la promoción de un primario de base de datos exige resolver split-brain, un problema no trivial que no se justifica a esta escala. Se documentó un runbook de promoción manual en vez de una automatización a medias."],
  ["ADR-03", "NAT de solo salida para el núcleo, no aislamiento total", "El diseño original planteaba “sin salida a Internet” para crm-core. Ansible necesita instalar Docker y clonar el repositorio, ambos requieren Internet. Se distinguió aislamiento de entrada (se mantiene: nadie de la LAN llega a crm-core) de aislamiento de salida (se relaja de forma controlada vía NAT), preservando la propiedad de seguridad que realmente importa."],
  ["ADR-04", "CA privada en vez de certificados autofirmados sueltos", "Un certificado autofirmado por VM seguía mostrando advertencia de “no seguro” en cualquier dispositivo. Se construyó una autoridad certificadora propia, cuya llave privada nunca sale del equipo del responsable, permitiendo instalarla una sola vez por dispositivo y confiar automáticamente en cualquier certificado futuro que ella firme."],
  ["ADR-05", "Monitoreo nativo (Node.js) en vez de contenedorizado", "Uptime Kuma vive en crm-edge sin Docker, manteniendo el principio de diseño de esa VM (bastión liviano, sin Docker) y aprovechando que es la única VM con visibilidad simultánea hacia la LAN y hacia la red interna del núcleo."],
];
s8.push(makeTable([1200, 3200, 5400], ["ID", "Decisión", "Justificación"], adrs));

// ============================================================
// SECCION 9 (portrait): Gestion de Proyectos - Charter, EDT
// ============================================================
const s9 = [
  h1("5. Gestión de Proyectos"),
  p(
    "Esta sección aplica las herramientas formales de gestión de proyectos sobre el periodo oficial de " +
    "la práctica profesional: 360 horas, del 28 de septiembre al 27 de noviembre de 2026, jornada de " +
    "09:00 a 17:30 hrs. El desarrollo técnico de la aplicación y de la infraestructura de simulación, " +
    "ya construido y validado, se documenta y formaliza dentro de las primeras fases de este " +
    "cronograma (ver sección 5.3)."
  ),

  h2("5.1 Acta de Constitución del Proyecto (Project Charter)"),
];
const charterRows = [
  ["Nombre del proyecto", "CRM Empresarial: Sistema de Gestión Interna para el Centro CHIC"],
  ["Patrocinador", "Centro CHIC"],
  ["Responsable del proyecto", "César Manríquez Figueroa (alumno en práctica / desarrollador / DevOps)"],
  ["Fecha de inicio de la práctica", "28 de septiembre de 2026"],
  ["Fecha de término de la práctica", "27 de noviembre de 2026 (360 horas)"],
  ["Justificación", "Los trabajadores de CHIC no contaban con un sistema propio que agrupara sus necesidades operativas (personal, calendario, inventario, reservas, comunicación), y la institución requería cumplir la Ley 21.719 sobre datos de su personal sin depender de un proveedor externo."],
  ["Objetivo 1", "Desarrollar un CRM funcional con 6 módulos de negocio, cumpliendo la normativa de protección de datos."],
  ["Objetivo 2", "Validar el diseño en un entorno de simulación con redundancia activa-pasiva, verificada mediante pruebas de falla reales, antes de migrar a producción."],
  ["Objetivo 3", "Instrumentar monitoreo activo sobre el 100% de los componentes críticos del sistema."],
  ["Entregables", "Código fuente; infraestructura como código (Terraform/Ansible); documentación técnica y académica; 3 informes de avance; informe final; presentación (PPT); video final."],
  ["Restricciones", "Un solo servidor físico disponible en la infraestructura de CHIC durante la fase de simulación; un solo desarrollador; 360 horas totales de práctica."],
  ["Supuestos", "Disponibilidad continua del servidor de CHIC como host de Proxmox durante la práctica; conectividad a Internet estable; aprobación de la cotización del segundo servidor por parte de CHIC en un plazo razonable."],
  ["Interesados (stakeholders)", "César (responsable técnico), Centro CHIC (patrocinador y usuario final), la institución académica (evaluadora de la práctica)."],
];
s9.push(makeTable([2600, 6800], ["Campo", "Contenido"], charterRows));

s9.push(h2("5.2 Estructura de Desglose del Trabajo (EDT / WBS)"));
const edt = [
  "1. CRM Empresarial para el Centro CHIC",
  "  1.1 Aplicación (producto de software)",
  "    1.1.1 Núcleo funcional (autenticación, gateway, frontend base, RBAC)",
  "    1.1.2 Módulos de negocio (calendario, inventario, reservas)",
  "    1.1.3 Seguridad y cumplimiento (cifrado de datos, auditoría, Ley 21.719, chat interno)",
  "  1.2 Infraestructura de virtualización (entorno de simulación)",
  "    1.2.1 Automatización con Terraform (IaC)",
  "    1.2.2 Configuración con Ansible",
  "    1.2.3 Diseño e implementación de redundancia (Keepalived, réplica de Postgres)",
  "  1.3 Seguridad de acceso",
  "    1.3.1 HTTPS con autoridad certificadora privada",
  "  1.4 Operaciones",
  "    1.4.1 Monitoreo (Uptime Kuma)",
  "    1.4.2 Pruebas de resiliencia (failover borde y núcleo)",
  "    1.4.3 Corrección de incidentes de despliegue (12 documentados)",
  "  1.5 Migración a producción (fase siguiente)",
  "    1.5.1 Respaldo offsite en Oracle Cloud",
  "    1.5.2 Cotización formal del segundo servidor físico",
  "    1.5.3 Planificación de migración bare metal",
  "  1.6 Documentación y gestión",
  "    1.6.1 Documentación técnica (READMEs, síntesis académica)",
  "    1.6.2 Documentación de gestión de proyectos (este informe)",
  "    1.6.3 Informes de avance, informe final, PPT y video",
];
edt.forEach(line => {
  const indent = (line.match(/^\s*/)[0].length / 2) * 300;
  s9.push(new Paragraph({ indent: { left: indent }, spacing: { after: 60 },
    children: [new TextRun({ text: line.trim(), size: 20 })] }));
});
s9.push(p("El cronograma que distribuye esta EDT en las 360 horas reales de la práctica se presenta en la página siguiente, en formato horizontal."));

// ============================================================
// SECCION 10 (landscape): Diagrama 5 - Gantt
// ============================================================
const s10 = [
  h2("Figura 6 — Cronograma real de la práctica (Gantt, 360 horas)"),
  ...imageBlock("05-cronograma-gantt.png", 1080, 570,
    "Figura 6. Distribución de las 360 horas en 8 fases dentro del periodo real de la práctica. Enfoque: separar con claridad qué se formaliza/valida (F2-F3), qué es trabajo pendiente genuino (F4-F5), y qué corresponde a cierre y entregas académicas (F6-F8).", 1000),
];

// ============================================================
// SECCION 11 (portrait): RACI, Riesgos
// ============================================================
const s11 = [
  h2("5.4 Matriz de Responsabilidades (RACI)"),
];
const raciRows = [
  ["Definición de requisitos", "R / A", "C", "—", "—"],
  ["Desarrollo de microservicios", "R / A", "—", "—", "C"],
  ["Diseño de arquitectura de infraestructura", "A", "—", "I", "R"],
  ["Implementación Terraform / Ansible", "A", "—", "—", "R"],
  ["Pruebas de failover y validación", "R / A", "—", "—", "C"],
  ["Respaldo offsite y cotización de servidor", "R / A", "C", "—", "C"],
  ["Documentación académica", "A", "—", "—", "R"],
  ["Aprobación de la práctica profesional", "I", "—", "A", "—"],
  ["Uso diario del CRM", "I", "R", "—", "—"],
];
s11.push(makeTable([3000, 1600, 1600, 1600, 1600],
  ["Actividad", "César (Dev/DevOps)", "Centro CHIC", "Institución (Evaluador)", "Asistente de IA (herramienta)"],
  raciRows));
s11.push(p("R = Responsable de ejecutar · A = Aprueba / rinde cuentas · C = Consultado · I = Informado.", { italics: true, size: 18, color: "666666" }));
s11.push(p(
  "Nota metodológica: se incluye “Asistente de IA” como columna propia porque fue una herramienta de " +
  "apoyo real y activo durante la implementación (generación de código de infraestructura, depuración " +
  "de incidentes, redacción de documentación) —omitirlo sería inexacto respecto a cómo se ejecutó el " +
  "proyecto—, pero nunca tuvo responsabilidad de aprobación: toda decisión de arquitectura o seguridad " +
  "fue revisada y autorizada explícitamente por el responsable humano del proyecto antes de " +
  "implementarse."
));

s11.push(h2("5.5 Registro de Riesgos"));
s11.push(p("Los primeros ocho riesgos ya se materializaron durante la fase de simulación (ver bitácora de incidentes, sección 8) y se documentan con su probabilidad e impacto originales. Los últimos tres son riesgos abiertos y activos en la fase de práctica actual."));
const riskRows = [
  ["R1", "Hardware insuficiente para el diseño de virtualización planeado", "Alta", "Alto", "Materializado", "Pivote de arquitectura (laptop→LXC→PC de escritorio con VMs reales)"],
  ["R2", "Conflicto de virtualización VT-x entre Docker Desktop y Proxmox", "Media", "Alto", "Materializado", "Retiro de Docker Desktop del host físico; Hyper-V desactivado"],
  ["R3", "DNS heredado roto en la plantilla base del proveedor de laboratorio", "Media", "Medio", "Materializado", "DNS explícito vía cloud-init; resolv.conf estático donde el stub fallaba"],
  ["R4", "Disco de plantilla insuficiente para instalar paquetes", "Media", "Medio", "Materializado", "Bloque disk en Terraform + growpart/resize2fs"],
  ["R5", "Aislamiento de red total incompatible con el aprovisionamiento remoto", "Alta", "Alto", "Materializado", "NAT de solo salida en el host Proxmox, entrada sigue bloqueada"],
  ["R6", "Dependencia fuera de los repositorios base del sistema operativo", "Media", "Bajo", "Materializado", "Repositorio oficial de Docker agregado al rol Ansible"],
  ["R7", "Uso de una rama de desarrollo en una dependencia externa", "Baja", "Alto", "Materializado", "Versión de Uptime Kuma fijada a un release estable"],
  ["R8", "Configuración de runtime específica de un entorno no portada a otro", "Media", "Alto", "Materializado", "Generación de config.js vía Ansible para el entorno de VM"],
  ["R9", "Punto único de falla del servidor físico durante la simulación", "Media", "Crítico", "Abierto — en gestión activa", "Cotización formal del segundo servidor en curso (sección 5.8), fase F5 del cronograma"],
  ["R10", "Pérdida total de datos sin respaldo offsite", "Media", "Alto", "Abierto — en desarrollo activo", "Fase F4 del cronograma: desarrollo del respaldo hacia Oracle Cloud"],
  ["R11", "Compromiso de la llave privada de la CA interna", "Baja", "Crítico", "Abierto — mitigado por diseño", "La llave nunca sale del equipo del responsable; nunca se copia a ninguna VM"],
];
s11.push(makeTable([700, 2600, 1100, 1000, 1500, 2300],
  ["ID", "Riesgo", "Prob.", "Impacto", "Estado", "Mitigación"], riskRows));

// ============================================================
// SECCION 11b (portrait, sigue): Cotizacion formal de servidor
// ============================================================
s11.push(h2("5.8 Cotización Formal de Servidor Físico"));
s11.push(p(
  "En línea con el objetivo de migrar a producción bare metal y habilitar redundancia real entre dos " +
  "servidores físicos, se evaluaron dos alternativas reales en el mercado chileno, ambas con soporte " +
  "completo de virtualización (Intel VT-x, VT-d y EPT) y memoria ECC —requisitos no negociables para " +
  "un hipervisor de producción."
));
const cotizacionRows = [
  ["Dell PowerEdge T150 (recomendado)", "Intel Xeon E-2336, 6 núcleos, 2.9 GHz", "16 GB DDR4 ECC (ampliable a 128 GB)", "2 TB SATA, RAID 0/1/10 (PERC H355)", "iDRAC9 Basic", "$1.851.750 CLP (transferencia)"],
  ["HPE ProLiant ML110 Gen11", "Intel Xeon Bronze 3508U, 8 núcleos, 2.1 GHz", "32 GB DDR5 (Registered)", "8 TB LFF", "iLO 6", "$6.671.150 CLP (transferencia, con descuento)"],
];
s11.push(makeTable([2000, 2200, 1800, 1600, 1200, 1600],
  ["Modelo", "Procesador", "Memoria", "Almacenamiento", "Gestión remota", "Precio"], cotizacionRows));
s11.push(p(
  "Fuente de los precios: cotizaciones reales de distribuidores chilenos, consultadas el 24 de " +
  "septiembre de 2026 (SP Digital, spdigital.cl, Providencia, Santiago).",
  { italics: true, size: 18, color: "666666" }
));
s11.push(p(
  "Recomendación: el Dell PowerEdge T150 cubre sobradamente las necesidades actuales del sistema " +
  "(16GB ampliable a 128GB frente a los 20GB totales usados hoy) a una fracción del costo, y agrega " +
  "capacidades que hoy no existen: memoria ECC (integridad de datos en un hipervisor de producción) y " +
  "iDRAC9 para administración remota fuera de banda (out-of-band), algo que el PC de escritorio actual " +
  "no ofrece. Se propone gestionar la adquisición de esta alternativa durante la Fase F5 del cronograma " +
  "(2 al 8 de noviembre de 2026)."
));

// ============================================================
// SECCION 12 (landscape): Diagrama 6 - EVM
// ============================================================
const s12 = [
  h2("5.6 Valor Planificado (PV) y Curva Base"),
  p(
    "Este informe se entrega antes del inicio formal de la práctica (28 de septiembre de 2026), por lo " +
    "que solo existe la línea base de Valor Planificado (PV). El Valor Ganado (EV) y el Costo Real (AC) " +
    "—y por tanto los índices CPI y SPI— se calcularán y agregarán progresivamente en cada uno de los " +
    "3 informes de avance, a medida que exista ejecución real que medir."
  ),
  ...imageBlock("06-curva-s-evm.png", 1000, 620,
    "Figura 7. Línea base de Valor Planificado (PV) por fase, acumulada hasta las 360 horas totales de la práctica.", 1000),
];

// ============================================================
// SECCION 13 (portrait): Lecciones, Implementacion, Bitacora, Pruebas, Evidencia, Conclusiones
// ============================================================
const s13 = [
  h2("5.7 Lecciones Aprendidas (de la fase de simulación)"),
  bullet("Fijar versiones siempre en infraestructura como código: un `git clone` sin restricción de versión reintrodujo una rama de desarrollo distinta a la ya compilada y rompió un servicio que ya funcionaba (incidente 9)."),
  bullet("Las imágenes base de un proveedor de laboratorio pueden traer configuración residual (DNS, dominios de búsqueda) que no es evidente hasta que falla —nunca asumir que una plantilla “oficial” está limpia."),
  bullet("Un diseño de seguridad de “cero salida” debe validarse contra el flujo operativo real antes de implementarse, no después."),
  bullet("Validar primero en un entorno de simulación (como instruyó la jefatura) permitió encontrar y resolver 12 incidentes reales sin arriesgar la operación de CHIC, antes de tocar producción."),
  bullet("La asistencia de IA acelera genuinamente la implementación de infraestructura y la depuración, pero las decisiones de seguridad y arquitectura deben mantenerse bajo revisión y autorización humana explícita en cada paso."),

  h1("6. Implementación Técnica"),
  h2("6.1 Infraestructura como Código (Terraform)"),
  p("El módulo `infra/proxmox-terraform/` automatiza, contra la API de Proxmox (proveedor `bpg/proxmox`), la creación de la red interna `vmbr1` y las 4 máquinas virtuales del entorno de simulación, clonadas desde una plantilla cloud-init."),
  bullet("`crm-edge` / `crm-edge-b`: 2 vCPU / 2GB, doble interfaz de red (LAN + interna), 8GB de disco."),
  bullet("`crm-core` / `crm-core-b`: 4 vCPU / 6GB, interfaz solo en la red interna, 25GB de disco."),
  bullet("Aplicado con éxito contra el Proxmox real: 5 recursos creados, 0 errores."),
  h3("Ejemplo real: definición de crm-edge"),
  codeBlock([
    'resource "proxmox_virtual_environment_vm" "crm_edge" {',
    '  name      = "crm-edge"',
    '  node_name = var.proxmox_node',
    '  clone { vm_id = var.template_vm_id, full = true }',
    '  cpu    { cores = 2 }',
    '  memory { dedicated = 2048 }',
    '  disk { datastore_id = "local-lvm", interface = "scsi0", size = 8 }',
    '  network_device { bridge = "vmbr0" }  # hacia la LAN',
    '  network_device { bridge = "vmbr1" }  # hacia crm-core',
    '  initialization {',
    '    dns { servers = ["8.8.8.8", "1.1.1.1"] }',
    '    ip_config { ipv4 { address = var.crm_edge_lan_ip, gateway = var.lan_gateway } }',
    '    user_account { username = "cesar", keys = [var.ssh_public_key] }',
    '  }',
    '}',
  ]),
  h3("Salida real de terraform apply"),
  codeBlock([
    "Plan: 5 to add, 0 to change, 0 to destroy.",
    "...",
    "proxmox_virtual_environment_vm.crm_edge: Creation complete after 6m40s [id=103]",
    "Apply complete! Resources: 5 added, 0 changed, 0 destroyed.",
    'crm_edge_vip = "Accede al CRM desde tu LAN en: http://192.168.1.62"',
  ]),

  h2("6.2 Configuración (Ansible)"),
  p("El módulo `infra/ansible/` configura cada VM desde adentro: Nginx y Keepalived en el par de borde; Docker, el stack completo del CRM y la réplica de Postgres en el par de núcleo; Uptime Kuma en `crm-edge`, que actúa como nodo de control y bastión único de administración."),

  h2("6.3 HTTPS con Autoridad Certificadora Privada"),
  p("Se construyó una CA propia: su llave privada nunca sale del equipo del responsable ni se copia a ninguna VM. El certificado de `crm-edge`, firmado por esa CA, cubre como SAN la IP virtual y ambas IPs del par de borde."),
  ...evidenceImage("2026-09-23-08-detalle-certificado-ca.png", "Figura 8. Detalle del certificado servido por https://192.168.1.62 — Emitido a 192.168.1.62, proporcionado por “CRM Empresarial - CA Interna”."),
  ...evidenceImage("2026-09-23-09-candado-conexion-segura.png", "Figura 9. Candado verde y “La conexión es segura” en el navegador, sin ninguna advertencia, tras instalar la CA privada."),

  h2("6.4 Monitoreo (Uptime Kuma)"),
  p("Instalado nativo (Node.js, sin Docker) en `crm-edge`, con 6 monitores activos cubriendo: la IP virtual, ambos nodos de borde, ambos nodos de núcleo, y PostgreSQL."),

  h1("7. Control de Versiones (GitHub)"),
  p("Todo el trabajo descrito en este informe está versionado con git y publicado en un repositorio real de GitHub (`arkno1820-arch/crm-empresarial`), con cada commit correspondiendo a un cambio real y verificable."),
  ...evidenceImage("2026-09-24-07-github-commits.png", "Figura 10. Historial real de commits en GitHub, con mensajes descriptivos de cada cambio de la fase de simulación (septiembre de 2026).", 560),

  h1("8. Bitácora de Incidentes Reales (fase de simulación)"),
  p("Doce incidentes reales, encontrados y resueltos durante el desarrollo y despliegue en el entorno de simulación —evidencia auténtica de gestión de incidentes para Gestión de Servicios TI (ITIL) y Gestión de Proyectos."),
];
const incidents = [
  ["1", "Caché de DNS del gateway Nginx", "Nginx seguía resolviendo IPs viejas tras reconstruir contenedores.", "`resolver 127.0.0.11 valid=10s;` + variables dinámicas en proxy_pass."],
  ["2", "Confianza cruzada de certificados HTTPS", "El navegador debía confiar por separado en el certificado del gateway y del frontend.", "Documentado el orden correcto de aceptación."],
  ["3", "Migración de cifrado silenciosamente no aplicada", "SQLAlchemy no detectaba cambios al reasignar el mismo valor a un campo cifrado.", "`flag_modified` de sqlalchemy.orm.attributes."],
  ["4", "Restricción de hardware", "El equipo inicial no alcanzaba para el diseño de virtualización planeado.", "Pivote de arquitectura documentado, no tratado como error."],
  ["5", "Conflicto VT-x entre Docker Desktop y Proxmox", "Ambos compiten por el mismo recurso de virtualización de hardware.", "Retiro de Docker Desktop del host físico; Hyper-V desactivado."],
  ["6", "DNS roto heredado de la plantilla base", "nameserver inválido y dominio de búsqueda ajeno en el host Proxmox y en las 4 VMs.", "DNS explícito (8.8.8.8/1.1.1.1) vía cloud-init y resolv.conf estático."],
  ["7", "Disco de la plantilla insuficiente (2GB)", "Síntoma engañoso de “cuelgue de red”; la causa real era “no space left on device”.", "Bloque disk en Terraform (8GB/25GB) + growpart/resize2fs."],
  ["8", "Aislamiento total de crm-core incompatible con el aprovisionamiento", "Ansible necesita Internet para instalar Docker y clonar el repositorio.", "NAT de solo salida en el host Proxmox; la entrada sigue bloqueada."],
  ["9", "docker-compose-plugin fuera de los repositorios base de Ubuntu", "El paquete solo existe en el repositorio oficial de Docker.", "Repositorio oficial de Docker agregado antes de instalar."],
  ["10", "git clone sobre directorio no vacío", "El .env se copiaba antes de clonar, dejando el directorio no vacío.", "Orden corregido: clonar primero, copiar .env/certificados después."],
  ["11", "Permisos de $HOME bloqueaban a Nginx", "/home/cesar en 750 por defecto; Nginx (www-data) no podía atravesarlo.", "`chmod o+x /home/cesar` en ambos nodos de borde."],
  ["12", "Login roto: “Failed to fetch”", "El frontend asumía un puerto de gateway separado (8443) inexistente en crm-edge.", "Generación de frontend/js/config.js vía Ansible con el puerto real (443)."],
];
s13.push(makeTable([500, 2400, 3200, 2900], ["#", "Incidente", "Causa raíz", "Resolución"], incidents));

s13.push(h1("9. Pruebas y Verificación"));
s13.push(p(
  "Las siguientes pruebas se ejecutaron técnicamente los días 23 y 24 de septiembre de 2026, como " +
  "parte del cierre de la fase de desarrollo del entorno de simulación. Se presentan y validan " +
  "formalmente dentro de la Fase F3 del cronograma de la práctica —“Validación de infraestructura y " +
  "pruebas”, 12 al 18 de octubre de 2026 (ver figura 6)—, que es cuando corresponde su revisión y " +
  "cierre dentro del periodo oficial."
));
s13.push(h2("9.1 Prueba de failover real de Keepalived (Fase F3)"));
s13.push(p("Ejecutada con apagado abrupto (no un shutdown ordenado) para simular una falla real:"));
s13.push(bullet("19:03:40 — se apaga crm-edge de golpe, mientras sostenía la IP virtual (192.168.1.62)."));
s13.push(bullet("19:03:50 — la IP virtual ya respondía 200 OK, ahora servida por crm-edge-b. Sin caída visible del servicio."));
s13.push(bullet("19:04:37 — se enciende crm-edge de nuevo. Al terminar de bootear, reclamó automáticamente la IP virtual (prioridad 150 vs. 100) y crm-edge-b la soltó — sin intervención manual."));

s13.push(h2("9.2 Prueba de failover manual del núcleo (Fase F3)"));
s13.push(bullet("Apagado abrupto de crm-core mientras era el primario: la API del CRM cayó con 502 Bad Gateway."));
s13.push(bullet("Se ejecutó el runbook de promoción manual: cambiar `crm_core_ip` a la IP de la réplica y re-aplicar Ansible."));
s13.push(bullet("La API volvió a responder, servida por crm-core-b. Tras encender crm-core de nuevo, se revirtió la promoción."));

s13.push(h2("9.3 Verificación de HTTPS con CA privada (Fase F3)"));
s13.push(p("Confirmado con `curl --cacert` (validación real de la cadena de confianza) y visualmente en el navegador: candado verde, sin advertencias, tras instalar la CA en el almacén de confianza del sistema."));

s13.push(h2("9.4 Verificación de monitoreo (Fase F3)"));
s13.push(p("6 monitores activos en Uptime Kuma, todos con 100% de disponibilidad: IP virtual VRRP, borde activo, borde en espera, núcleo activo, núcleo réplica, y PostgreSQL."));

s13.push(h1("10. Evidencia del Despliegue en el Entorno de Simulación"));
s13.push(p("Capturas tomadas durante el despliegue real contra el Proxmox físico de CHIC, no un entorno de prueba desechable."));
s13.push(...evidenceImage("2026-09-23-01-proxmox-nodo-pve-limpio.png", "Figura 11. Nodo Proxmox antes del despliegue, storage local-lvm disponible."));
s13.push(...evidenceImage("2026-09-23-02-error-dns-plantilla-cloudinit.png", "Figura 12. Incidente 6 en curso: error de DNS heredado durante la creación de la plantilla."));
s13.push(...evidenceImage("2026-09-23-04-cloud-image-descargado.png", "Figura 13. Descarga completa de la imagen cloud-init tras resolver el DNS."));

s13.push(h1("11. Conclusiones"));
s13.push(p(
  "Este informe demuestra, con evidencia verificable y no simulada, un ciclo completo de ingeniería " +
  "en respuesta a una necesidad real del Centro CHIC: desde el desarrollo de una aplicación de " +
  "microservicios con seguridad y cumplimiento normativo, pasando por la validación metodológica en " +
  "un entorno de simulación siguiendo instrucciones de la jefatura, hasta el diseño, implementación y " +
  "prueba real de un esquema de redundancia, HTTPS confiable, y monitoreo activo."
));
s13.push(p(
  "El valor de este trabajo no reside solo en el resultado —el sistema funcionando en simulación—, " +
  "sino en el proceso documentado de doce incidentes reales resueltos con su causa raíz identificada, " +
  "y en la experiencia adquirida que habilita, con conocimiento real y no teórico, la migración " +
  "responsable a producción sobre el servidor físico de CHIC."
));
s13.push(p(
  "Las fases pendientes —respaldo offsite en Oracle Cloud, cotización y adquisición del segundo " +
  "servidor, y la migración final a producción bare metal— están planificadas dentro del cronograma " +
  "oficial de 360 horas de la práctica (sección 5.3) y se reportarán con evidencia real en los " +
  "sucesivos informes de avance."
));

// ============================================================
// Build document
// ============================================================
const doc = new Document({
  creator: "César Manríquez Figueroa",
  title: "Informe de Práctica Profesional — CRM Empresarial para CHIC",
  description: "Diseño, implementación y gestión de un CRM con infraestructura redundante en Proxmox",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 21 } },
      heading1: { run: { size: 30, bold: true, color: "0F403C" }, paragraph: { spacing: { before: 240, after: 160 } } },
      heading2: { run: { size: 25, bold: true, color: "1F6F68" }, paragraph: { spacing: { before: 200, after: 120 } } },
      heading3: { run: { size: 22, bold: true, color: "333333" }, paragraph: { spacing: { before: 160, after: 100 } } },
    },
  },
  sections: [
    portraitSection(s1),
    portraitSection(s2),
    portraitSection(s3),
    portraitSection(s4),
    landscapeSection(s5),
    portraitSection(s6),
    landscapeSection(s7),
    portraitSection(s8),
    portraitSection(s9),
    landscapeSection(s10),
    portraitSection(s11),
    landscapeSection(s12),
    portraitSection(s13),
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Informe_Practica_Profesional_CRM_Empresarial.docx");
  fs.writeFileSync(out, buf);
  console.log("Escrito:", out, buf.length, "bytes");
});
