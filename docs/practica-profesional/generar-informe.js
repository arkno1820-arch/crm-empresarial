const H = require("./build-informe.js");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  fs, path, DIA, EVI, CAP,
  h1, h2, h3, p, bullet, makeTable,
  figura, figurasPar, figurasApiladas, verificarFiguras, pageBreak, codeBlock,
  TableOfContents, portraitSection, landscapeSection,
} = H;

// ------------------------------------------------------------
// Orden de las figuras del documento (la numeracion real la genera Word con
// campos SEQ; este orden se usa para las referencias cruzadas del texto y se
// valida al final con verificarFiguras).
// ------------------------------------------------------------
const FIG_KEYS = [
  "justif", "infra", "contexto", "modulos", "gantt", "evm",
  "vmwnat", "vmwnet", "ipconfig", "redpve", "crmnat", "iptables", "ping", "edgehw", "edgeci", "corehw", "coreci",
  "vms", "tfplan",
  "certdet", "candado",
  "kumarojo", "kuma1", "kuma2", "kuma3", "kuma4", "kuma5", "kuma6", "kumab", "kumaprueba",
  "login", "usuarios", "sinpermiso", "cifrado",
  "github", "ciclo", "crmfailover",
  "pveclean", "errordns", "cloudimg",
  "vm100", "vm101", "vm102", "vm103",
  "empleados", "calendario", "inventario", "reservas", "habitaciones", "chataviso",
  "permrrhh", "permemp", "permrec", "permadm", "ficha", "hist1", "hist2", "hist3", "anonim", "chataud",
  "secuencia",
];
const F = Object.fromEntries(FIG_KEYS.map((k, i) => [k, i + 1]));

// ============================================================
// SECCION 1 (portrait): Portada
// ============================================================
const s1 = [
  new Paragraph({ spacing: { before: 1200 }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "INFORME DE PRÁCTICA PROFESIONAL", bold: true, size: 30, color: "0F403C" })] }),
  new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Puesta en Marcha de una Arquitectura de Redes", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "y Virtualización Redundante en Proxmox VE", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "para el Centro CHIC", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Caso de uso: sistema CRM Empresarial", italics: true, size: 26, color: "1F6F68" })] }),
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
    children: [new TextRun({ text: "Documento base, versión 3.0 — 25 de septiembre de 2026 (previo al inicio formal de la práctica)", size: 18, color: "535E5C" })] }),
];

// ============================================================
// SECCION 2 (portrait): Indices (contenidos y figuras)
// ============================================================
const tituloIndice = (texto, antes = 0) => new Paragraph({
  spacing: { before: antes, after: 200 },
  children: [new TextRun({ text: texto, bold: true, size: 32, color: "0F403C" })],
});
const s2 = [
  tituloIndice("Índice de contenidos"),
  new TableOfContents("Índice de contenidos", { hyperlink: true, headingStyleRange: "1-2" }),
];
const s2b = [
  tituloIndice("Índice de figuras"),
  new TableOfContents("Índice de figuras", { hyperlink: true, captionLabelIncludingNumbers: "Figura" }),
];

// ============================================================
// SECCION 3 (portrait): Resumen + Introduccion
// ============================================================
const s3 = [
  h1("Resumen Ejecutivo"),
  p(
    "Este informe documenta la puesta en marcha de una arquitectura de redes y virtualización " +
    "redundante sobre Proxmox VE para el Centro CHIC. Su finalidad es alojar, de forma segura y " +
    "disponible, el sistema interno que los trabajadores del centro necesitaban (gestión de personal, " +
    "calendario, inventario, reservas y comunicación). Ese sistema —un CRM en microservicios sobre " +
    "contenedores Docker— es el caso de uso que justifica la infraestructura; el foco de la práctica es " +
    "la infraestructura misma: redes virtuales y segmentación, NAT y publicación de servicios, " +
    "redundancia con VRRP, infraestructura como código, seguridad de transporte con una autoridad " +
    "certificadora propia y monitoreo."
  ),
  p(
    "Siguiendo instrucciones explícitas de la jefatura del proyecto, la metodología fue diseñar y validar " +
    "primero en un entorno de simulación (Proxmox anidado sobre VMware) para adquirir la experiencia " +
    "operativa necesaria, antes de migrar a producción sobre el servidor físico de CHIC en modo nativo. " +
    "Este informe cubre el diseño, la implementación y la validación en simulación, con evidencia real: " +
    "una red NAT independiente de la red externa, aislamiento del núcleo verificado, failover de la " +
    "IP virtual probado contra la infraestructura real, HTTPS con CA propia, monitoreo activo y una " +
    "bitácora de dieciocho incidentes resueltos. La migración a producción bare metal y el respaldo " +
    "offsite en la nube se abordan como las siguientes fases formales de la práctica, con su " +
    "cronograma y su cotización de hardware ya definidos en este documento."
  ),
  p(
    "El proyecto se usa como evidencia de práctica profesional para siete asignaturas de la carrera " +
    "Ingeniería en Conectividad y Redes. Además de la arquitectura y su implementación, el documento " +
    "incluye los artefactos formales de Gestión de Proyectos (Acta de Constitución, EDT, cronograma de " +
    "360 horas, matriz RACI, registro de riesgos y línea base de Valor Planificado) construidos para el " +
    "periodo real de la práctica (28 de septiembre al 27 de noviembre de 2026)."
  ),

  h1("1. Introducción"),
  h2("1.1 Contexto y motivación"),
  p(
    "El Centro CHIC identificó que sus trabajadores carecían de una herramienta propia para gestionar " +
    "las operaciones diarias del centro: administración de personal, calendario de actividades, " +
    "inventario de recursos, reservas de espacios y equipos, y comunicación interna. Esta carencia se " +
    "resolvía de forma manual o con herramientas genéricas no integradas entre sí, sin control interno " +
    "sobre dónde y cómo se almacena información sensible del personal bajo la Ley 21.719 de Protección " +
    "de Datos Personales, vigente en Chile."
  ),
  p(
    "Como alumno en práctica, se me encargó resolver esa necesidad. La solución tiene dos partes: un " +
    "sistema de software propio de la institución (el CRM Empresarial) y, sobre todo, la " +
    "infraestructura de red y virtualización que lo aloja con redundancia, seguridad y monitoreo, " +
    "desplegada sobre el servidor que CHIC ya posee. Esta segunda parte es el objeto de este informe."
  ),
  h2("1.2 Objetivos"),
  bullet("Diseñar e implementar una arquitectura de virtualización y redes redundante sobre Proxmox VE —segmentación, NAT, publicación de servicios y VRRP— que aloje de forma segura y disponible el sistema interno de CHIC."),
  bullet("Validar el diseño en un entorno de simulación (Proxmox sobre VMware), según la metodología instruida por la jefatura, antes de migrar a producción sobre el servidor físico real de la institución."),
  bullet("Verificar la redundancia (borde y núcleo) y el aislamiento de red con pruebas de falla reales, no solo documentadas."),
  bullet("Automatizar el despliegue con infraestructura como código (Terraform y Ansible), asegurar el transporte con una autoridad certificadora privada y monitorear los componentes críticos."),
  bullet("Gestionar el proyecto con las herramientas formales de Gestión de Proyectos (EDT, cronograma, RACI, riesgos, valor planificado), encuadradas en el periodo oficial de la práctica (360 horas)."),
  h2("1.3 Alcance"),
  p(
    "El alcance cubre la infraestructura de red y virtualización (VMware NAT, Proxmox como router, " +
    "puentes virtuales, cuatro máquinas virtuales en pares redundantes), su automatización con " +
    "Terraform y Ansible, la seguridad de transporte (HTTPS con CA privada), el monitoreo y la " +
    "documentación de gestión de proyecto. Incluye también el sistema CRM que la infraestructura aloja, " +
    "como carga de trabajo real, con sus controles de seguridad de acceso y de datos."
  ),
  p(
    "Además, el alcance incluye activamente dos frentes que se ejecutan durante el periodo formal de la " +
    "práctica: (1) el respaldo offsite en la nube (Oracle Cloud, nivel gratuito), y (2) la cotización " +
    "formal y gestión de adquisición de un segundo servidor físico, paso previo necesario para la " +
    "migración a producción bare metal y para la migración en vivo real entre servidores. Ambos están " +
    "planificados dentro del cronograma de 360 horas (sección 5.3) y la cotización de hardware se " +
    "presenta en la sección 5.7."
  ),
  h2("1.4 Del software a la infraestructura: una habilidad desarrollada por necesidad"),
  p(
    "El CRM Empresarial nació de una necesidad real de CHIC y, como desarrollo de software, es una " +
    "habilidad que tuve que adquirir, perfeccionar y trabajar a lo largo del proyecto: microservicios, " +
    "contenedores, seguridad de acceso y cumplimiento normativo. Es un resultado valioso, pero no es el " +
    "foco de esta práctica."
  ),
  p(
    "El foco es la puesta en marcha de toda la arquitectura de Proxmox —redes virtuales, " +
    "virtualización, redundancia, seguridad de transporte y monitoreo— y su justificación en las " +
    "asignaturas de Ingeniería en Conectividad y Redes (sección 2). Por eso el informe trata la " +
    "aplicación como la carga de trabajo que da sentido a la infraestructura, resume sus controles de " +
    "seguridad en la sección 6.6 y traslada el detalle funcional del sistema al Anexo B."
  ),
  h2("1.5 Nota sobre las evidencias"),
  p(
    "Las capturas de pantalla de este informe fueron tomadas los días 23, 24 y 25 de septiembre de 2026, " +
    "porque el proyecto se adelantó respecto del inicio formal de la práctica (28 de septiembre). Se " +
    "presentan con sus fechas reales y se re-validan dentro de la Fase F3 del cronograma. En coherencia " +
    "con la Ley 21.719, los datos personales y de salud que aparecían en las capturas del sistema " +
    "(RUT, teléfonos, correos y campos de la ficha de salud) fueron difuminados antes de incluirse aquí; " +
    "los originales se conservan sin modificar fuera del documento. Las horas que muestran algunas " +
    "capturas del CRM y de Uptime Kuma corresponden a UTC (por ejemplo, “25 sept, 01:36”), mientras que " +
    "los terminales muestran la hora local de Chile."
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
  ["Redes Virtuales\n(CR404CICRE)", "Fuerte", "VMs/hipervisor/SDN, Docker, API REST, NAT de VMware (VMnet8) y NAT/DNAT con iptables en el host Proxmox, bridges virtuales aislados. Git/GitHub y Ansible resueltos como evidencia (repositorio real con historial preservado; roles crm_edge/crm_core corriendo desde crm-edge como nodo de control)."],
  ["Virtualización\n(CR401ICRE)", "Fuerte", "Dos tecnologías de virtualización en la misma pila (VMware anida a Proxmox/KVM), segmentación de redes virtuales (vmbr1), asignación de recursos por VM. La migración en vivo real entre servidores queda como la fase siguiente de la práctica, ligada a la cotización de hardware (sección 5.7)."],
  ["Arquitectura Cloud\n(IF304CIINF)", "Fuerte", "Automatización de la topología completa con Terraform (IaC) contra la API de Proxmox, incluyendo modificaciones en caliente sobre una infraestructura ya desplegada (migración de la red de las VMs). El respaldo offsite hacia Oracle Cloud (Fase F4) y la evaluación de arquitectura híbrida on-premise/nube completan la evidencia de esta asignatura sobre el propio proyecto."],
  ["Gestión de Proyectos\n(IF405IINF)", "Cubierto en este informe", "Acta de Constitución, EDT, cronograma real de 360 horas, matriz RACI, registro de riesgos y línea base de Valor Planificado, todos construidos para el periodo real de la práctica (sección 5)."],
  ["Gestión de Servicios TI — ITIL\n(CR304ICRE)", "Fuerte", "La bitácora de 18 incidentes reales (sección 8) es evidencia genuina de gestión de incidentes/problemas/cambios. El monitoreo con Uptime Kuma cubre el requisito de supervisión, SLA y métricas."],
  ["Gestión de la Información con TICs\n(AS300PCOM)", "Parcial", "Calza en comparación de plataformas cloud y en seguridad/protección de datos según marco legal (Ley 21.719): roles y permisos, cifrado de datos de salud, consentimiento, auditoría y anonimización, verificados en la sección 6.6. El resto del programa (IA, IoT, redes sociales) no aplica a un proyecto de infraestructura —no se fuerza."],
  ["Diseño y Arquitectura de Redes\n(CR301ICRE)", "Uno de los más fuertes", "El estándar FCAPS mapea con los 5 pilares cubiertos: Fault (bitácora), Configuration (Git/Terraform/Ansible), Accounting (RBAC), Security (HTTPS/CA privada/cifrado/aislamiento verificado) y Performance (Uptime Kuma). Diagrama topológico incluido en este informe."],
];
s4.push(makeTable([2400, 1500, 5800], ["Asignatura", "Cobertura", "Justificación"], acadRows));
s4.push(p(
  `La figura ${F.justif} (página siguiente, en formato horizontal para mayor legibilidad) complementa esta ` +
  "tabla mostrando, para cada asignatura, qué componente técnico concreto del proyecto le corresponde " +
  "—no solo una relación temática, sino un aporte verificable en el código y la infraestructura " +
  "desplegada."
));

// ============================================================
// SECCION 5 (landscape): Figura 1 - justificacion cruzada
// ============================================================
const s5 = [
  ...figura(DIA, "07-justificacion-cruzada-ramos.png",
    "Justificación académica cruzada",
    "Qué se observa: cada una de las 7 asignaturas apunta al proyecto central con un componente real y verificable del sistema, no solo una coincidencia temática.", 1000, 540),
];

// ============================================================
// SECCION 6 (portrait): Arquitectura - introduccion
// ============================================================
const s6 = [
  h1("3. Arquitectura del Sistema"),
  p(
    "La arquitectura se presenta empezando por lo esencial: la vista física de la infraestructura de " +
    `red y virtualización (figura ${F.infra}), que es el objeto de la práctica. Le siguen dos niveles de la ` +
    `carga de trabajo que esa infraestructura aloja, inspirados en el modelo C4: el contexto (figura ${F.contexto}) ` +
    `y los contenedores Docker (figura ${F.modulos}). El detalle de la secuencia de autenticación se incluye ` +
    "en el Anexo C. Los diagramas se presentan en formato horizontal para que el detalle sea legible."
  ),
];

// ============================================================
// SECCION 7 (landscape): diagramas de arquitectura, uno por hoja
// ============================================================
const s7 = [
  ...figura(DIA, "04-infraestructura-proxmox.png", "Vista física: infraestructura de virtualización y red",
    "Qué se observa: la red externa (Wi-Fi, hotspot o LAN) llega al PC; VMware la aísla con una red NAT (VMnet8) y el host Proxmox actúa como router de las VMs. El par de borde (Keepalived, VIP 10.10.10.5) y el par de núcleo (réplica de Postgres) viven solo en la red interna, y se declara el techo real: un solo servidor físico.", 1000, 540),
  pageBreak(),
  ...figura(DIA, "01-alto-nivel-contexto.png", "Diagrama de contexto de la carga de trabajo (nivel 1)",
    "Qué se observa: quiénes usan el sistema alojado y con qué otros sistemas interactúa. El CRM es autocontenido, sin integraciones externas salvo GitHub y el propio servidor de CHIC.", 1000, 540),
  pageBreak(),
  ...figura(DIA, "02-modulos-docker.png", "Diagrama de módulos / contenedores de la carga de trabajo (nivel 2)",
    "Qué se observa: los 9 contenedores Docker de la aplicación y el patrón “database per service”. Cada microservicio es dueño exclusivo de su base de datos y toda solicitud pasa por el gateway.", 1000, 540),
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
  ["ADR-03", "Salida a Internet solo para los bordes (NAT selectivo)", "El diseño original planteaba “sin salida a Internet” para crm-core, pero Ansible necesita instalar Docker y clonar el repositorio. Se distinguió aislamiento de entrada de aislamiento de salida. Una vez desplegado, el NAT de salida se restringió a crm-edge y crm-edge-b: el núcleo quedó sin entrada directa ni salida a Internet, y la regla amplia que lo permitía se eliminó y verificó (sección 6.1)."],
  ["ADR-04", "CA privada en vez de certificados autofirmados sueltos", "Un certificado autofirmado por VM seguía mostrando advertencia de “no seguro” en cualquier dispositivo. Se construyó una autoridad certificadora propia, cuya llave privada nunca sale del equipo del responsable, permitiendo instalarla una sola vez por dispositivo y confiar automáticamente en cualquier certificado futuro que ella firme."],
  ["ADR-05", "Monitoreo nativo (Node.js) en vez de contenedorizado", "Uptime Kuma se instala sin Docker, manteniendo el principio de diseño de los bordes (bastión liviano, sin Docker). Su ubicación inicial en un solo borde resultó ser un punto único de falla del monitoreo; ver ADR-08."],
  ["ADR-06", "Red NAT de VMware en lugar de red puenteada (bridged)", "En modo bridged sobre Wi-Fi/hotspot, la red externa descartaba las direcciones MAC de las VMs anidadas (solo veía el PC), Proxmox llegó a compartir IP con el equipo host y tumbó su conexión, y cada cambio de red obligaba a reconfigurar todas las IPs. Con la red NAT VMnet8 (192.168.80.0/24) la infraestructura queda detrás del PC y su direccionamiento es independiente de la red externa."],
  ["ADR-07", "Proxmox como router de las VMs (DNAT + VIP interna)", "Como las VMs ya no están en la red externa, el host Proxmox publica el CRM mediante DNAT (80/443 hacia la VIP interna 10.10.10.5) y el acceso de administración por puertos dedicados (2211/2212) a cada borde. Las reglas viven en un script idempotente que se reaplica en cada arranque, y la salida a Internet (MASQUERADE) se limita a los bordes."],
  ["ADR-08", "Monitoreo redundante: una instancia de Kuma por borde con monitoreo cruzado", "Una prueba de estrés mostró que al apagar crm-edge el CRM seguía disponible (crm-edge-b) pero el monitoreo desaparecía, porque Kuma corría solo en ese nodo. Se instala una instancia en cada borde y cada una vigila también a su par, de modo que la caída de un borde es detectada por el otro. Se evaluaron una VM aparte, el host Proxmox y una base replicada, y se descartaron por memoria disponible, pureza del hipervisor y complejidad (sección 6.5.1). Límite declarado: ambas instancias comparten servidor físico."],
];
s8.push(makeTable([1200, 3100, 5400], ["ID", "Decisión", "Justificación"], adrs));

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
  ["Nombre del proyecto", "Arquitectura de Redes y Virtualización Redundante sobre Proxmox VE para el Centro CHIC (caso de uso: CRM Empresarial)"],
  ["Patrocinador", "Centro CHIC"],
  ["Responsable del proyecto", "César Manríquez Figueroa (alumno en práctica / desarrollador / DevOps)"],
  ["Fecha de inicio de la práctica", "28 de septiembre de 2026"],
  ["Fecha de término de la práctica", "27 de noviembre de 2026 (360 horas)"],
  ["Justificación", "Los trabajadores de CHIC no contaban con un sistema propio que agrupara sus necesidades operativas (personal, calendario, inventario, reservas, comunicación), y la institución requería cumplir la Ley 21.719 sobre datos de su personal sin depender de un proveedor externo."],
  ["Objetivo 1", "Diseñar e implementar una arquitectura de redes y virtualización redundante sobre Proxmox VE que aloje de forma segura y disponible el sistema interno de CHIC."],
  ["Objetivo 2", "Validar el diseño en un entorno de simulación con redundancia activa-pasiva, verificada mediante pruebas de falla reales, antes de migrar a producción."],
  ["Objetivo 3", "Instrumentar monitoreo activo sobre el 100% de los componentes críticos del sistema."],
  ["Objetivo 4", "Desarrollar el sistema CRM que da uso a la infraestructura, cumpliendo la normativa de protección de datos (habilidad de software desarrollada por necesidad; ver sección 1.4)."],
  ["Entregables", "Código fuente; infraestructura como código (Terraform/Ansible); documentación técnica y académica; 3 informes de avance; informe final; presentación (PPT); video final."],
  ["Restricciones", "Un solo servidor físico disponible en la infraestructura de CHIC durante la fase de simulación; un solo desarrollador; 360 horas totales de práctica."],
  ["Supuestos", "Disponibilidad continua del servidor de CHIC como host de Proxmox durante la práctica; conectividad a Internet estable; aprobación de la cotización del segundo servidor por parte de CHIC en un plazo razonable."],
  ["Interesados (stakeholders)", "César (responsable técnico), Centro CHIC (patrocinador y usuario final), la institución académica (evaluadora de la práctica)."],
];
s9.push(makeTable([2600, 7100], ["Campo", "Contenido"], charterRows));

s9.push(h2("5.2 Estructura de Desglose del Trabajo (EDT / WBS)"));
const edt = [
  "1. CRM Empresarial para el Centro CHIC",
  "  1.1 Carga de trabajo: aplicación CRM",
  "    1.1.1 Núcleo funcional (autenticación, gateway, frontend base, roles)",
  "    1.1.2 Módulos de negocio (calendario, inventario, reservas)",
  "    1.1.3 Seguridad y cumplimiento (cifrado de datos, auditoría, Ley 21.719, chat interno)",
  "  1.2 Infraestructura de virtualización (entorno de simulación)",
  "    1.2.1 Automatización con Terraform (IaC)",
  "    1.2.2 Configuración con Ansible",
  "    1.2.3 Diseño e implementación de redundancia (Keepalived, réplica de Postgres)",
  "    1.2.4 Red NAT y segmentación (VMnet8, vmbr1, DNAT/MASQUERADE)",
  "  1.3 Seguridad de acceso",
  "    1.3.1 HTTPS con autoridad certificadora privada",
  "  1.4 Operaciones",
  "    1.4.1 Monitoreo (Uptime Kuma)",
  "    1.4.2 Pruebas de resiliencia (failover borde y núcleo)",
  "    1.4.3 Corrección de incidentes de despliegue (18 documentados)",
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
s9.push(p(`El cronograma que distribuye esta EDT en las 360 horas reales de la práctica se presenta en la página siguiente (figura ${F.gantt}), en formato horizontal.`));

// ============================================================
// SECCION 10 (landscape): Gantt
// ============================================================
const s10 = [
  h2("5.3 Cronograma real de la práctica (Gantt, 360 horas)"),
  ...figura(DIA, "05-cronograma-gantt.png",
    "Cronograma de la práctica (Gantt, 360 horas)",
    "Qué se observa: la distribución de las 360 horas en 8 fases dentro del periodo real de la práctica. Separa qué se formaliza y valida (F2-F3), qué es trabajo pendiente genuino (F4-F5) y qué corresponde a cierre y entregas académicas (F6-F8).", 1000, 480),
];

// ============================================================
// SECCION 11 (portrait): RACI, Riesgos
// ============================================================
const s11 = [
  h2("5.4 Matriz de Responsabilidades (RACI)"),
];
const raciRows = [
  ["Definición de requisitos", "R", "A", "C", "—"],
  ["Desarrollo de microservicios", "R", "A", "—", "—"],
  ["Diseño de arquitectura de infraestructura", "R", "A", "—", "I"],
  ["Implementación Terraform / Ansible", "R", "A", "—", "—"],
  ["Pruebas de failover y validación", "R", "A", "—", "—"],
  ["Respaldo offsite y cotización de servidor", "R", "A / C", "—", "—"],
  ["Documentación académica", "R", "I", "—", "A"],
  ["Uso diario del CRM", "I", "I", "R", "—"],
];
s11.push(makeTable([2800, 1500, 1800, 1800, 1800],
  ["Actividad", "César (alumno en práctica)", "Jefatura directa (CHIC)", "Trabajadores CHIC (usuarios)", "Institución académica"],
  raciRows));
s11.push(p("R = Responsable de ejecutar · A = Aprueba / rinde cuentas · C = Consultado · I = Informado.", { italics: true, size: 18, color: "666666" }));
s11.push(p(
  "La jefatura directa dentro del Centro CHIC es quien aprueba y rinde cuentas por cada actividad " +
  "técnica —el alumno en práctica ejecuta, pero no se autoaprueba a sí mismo. Los trabajadores de " +
  "CHIC, usuarios finales del sistema, se distinguen de la jefatura: son consultados en la definición " +
  "de requisitos y son quienes usan el CRM a diario, sin responsabilidad de aprobación técnica."
));

s11.push(h2("5.5 Registro de Riesgos"));
s11.push(p("Los primeros doce riesgos ya se materializaron durante la fase de simulación (ver bitácora de incidentes, sección 8) y se documentan con su probabilidad e impacto originales. Los últimos cuatro son riesgos abiertos y activos en la fase de práctica actual."));
const riskRows = [
  ["R1", "Hardware insuficiente para el diseño de virtualización planeado", "Alta", "Alto", "Materializado", "Pivote de arquitectura (laptop→LXC→PC de escritorio con VMs reales)"],
  ["R2", "Conflicto de virtualización VT-x entre Docker Desktop y Proxmox", "Media", "Alto", "Materializado", "Retiro de Docker Desktop del host físico; Hyper-V desactivado"],
  ["R3", "DNS heredado roto en la plantilla base del proveedor de laboratorio", "Media", "Medio", "Materializado", "DNS explícito vía cloud-init; resolv.conf estático donde el stub fallaba"],
  ["R4", "Disco de plantilla insuficiente para instalar paquetes", "Media", "Medio", "Materializado", "Bloque disk en Terraform + growpart/resize2fs"],
  ["R5", "Aislamiento de red total incompatible con el aprovisionamiento remoto", "Alta", "Alto", "Materializado", "NAT de salida durante el aprovisionamiento; luego restringido solo a los bordes"],
  ["R6", "Dependencia fuera de los repositorios base del sistema operativo", "Media", "Bajo", "Materializado", "Repositorio oficial de Docker agregado al rol Ansible"],
  ["R7", "Uso de una rama de desarrollo en una dependencia externa", "Baja", "Alto", "Materializado", "Versión de Uptime Kuma fijada a un release estable"],
  ["R8", "Configuración de runtime específica de un entorno no portada a otro", "Media", "Alto", "Materializado", "Generación de config.js vía Ansible para el entorno de VM"],
  ["R9", "Inestabilidad de la red externa (Wi-Fi/hotspot) afectando al PC host o a la infraestructura", "Alta", "Alto", "Materializado", "Red NAT VMnet8: la infraestructura queda detrás del PC, independiente de la red externa (ADR-06)"],
  ["R10", "Pérdida de reglas de red o de aislamiento tras reinicios", "Media", "Alto", "Materializado", "Script idempotente en Proxmox y verificación de que ninguna regla persistente reintroduzca salida del núcleo"],
  ["R11", "Configuración de monitoreo desactualizada tras cambios de direccionamiento", "Media", "Medio", "Materializado", "Monitores actualizados y recuperación verificada (sección 6.5)"],
  ["R12", "Punto único de falla del monitoreo (una sola instancia de Kuma)", "Media", "Alto", "Materializado", "Instancia de Kuma en cada borde con monitoreo cruzado (ADR-08, sección 6.5.1)"],
  ["R13", "Punto único de falla del servidor físico durante la simulación", "Media", "Crítico", "Abierto — en gestión activa", "Cotización formal del segundo servidor en curso (sección 5.7), fase F5 del cronograma"],
  ["R14", "Pérdida total de datos sin respaldo offsite", "Media", "Alto", "Abierto — en desarrollo activo", "Fase F4 del cronograma: desarrollo del respaldo hacia Oracle Cloud"],
  ["R15", "Compromiso de la llave privada de la CA interna", "Baja", "Crítico", "Abierto — mitigado por diseño", "La llave nunca sale del equipo del responsable; nunca se copia a ninguna VM"],
  ["R16", "Documentos legales en borrador sin revisión jurídica", "Media", "Alto", "Abierto — pendiente", "Solicitar revisión de un abogado especializado antes de considerarlos oficiales (sección 6.6)"],
];
s11.push(makeTable([700, 2700, 1100, 1000, 1600, 2600],
  ["ID", "Riesgo", "Prob.", "Impacto", "Estado", "Mitigación"], riskRows));

// ============================================================
// SECCION 12 (landscape): EVM
// ============================================================
const s12 = [
  h2("5.6 Valor Planificado (PV) y Curva Base"),
  p(
    "Este informe se entrega antes del inicio formal de la práctica (28 de septiembre de 2026), por lo " +
    "que solo existe la línea base de Valor Planificado (PV). El Valor Ganado (EV) y el Costo Real (AC) " +
    "—y por tanto los índices CPI y SPI— se calcularán y agregarán progresivamente en cada uno de los " +
    "3 informes de avance, a medida que exista ejecución real que medir."
  ),
  ...figura(DIA, "06-curva-s-evm.png",
    "Línea base de Valor Planificado (PV)",
    "Qué se observa: el Valor Planificado acumulado por fase hasta las 360 horas totales de la práctica.", 1000, 420),
];

// ============================================================
// SECCION 13 (portrait): cotizacion, lecciones, terraform, ansible
// ============================================================
const s13 = [];
s13.push(h2("5.7 Cotización Formal de Servidor Físico"));
s13.push(p(
  "En línea con el objetivo de migrar a producción bare metal y habilitar redundancia real entre dos " +
  "servidores físicos, se evaluaron dos alternativas reales en el mercado chileno, ambas con soporte " +
  "completo de virtualización (Intel VT-x, VT-d y EPT) y memoria ECC —requisitos no negociables para " +
  "un hipervisor de producción."
));
const cotizacionRows = [
  ["Dell PowerEdge T150 (recomendado)", "Intel Xeon E-2336, 6 núcleos, 2.9 GHz", "16 GB DDR4 ECC (ampliable a 128 GB)", "2 TB SATA, RAID 0/1/10 (PERC H355)", "iDRAC9 Basic", "$1.851.750 CLP (transferencia)"],
  ["HPE ProLiant ML110 Gen11", "Intel Xeon Bronze 3508U, 8 núcleos, 2.1 GHz", "32 GB DDR5 (Registered)", "8 TB LFF", "iLO 6", "$6.671.150 CLP (transferencia, con descuento)"],
];
s13.push(makeTable([1800, 2000, 1700, 1500, 1200, 1500],
  ["Modelo", "Procesador", "Memoria", "Almacenamiento", "Gestión remota", "Precio"], cotizacionRows));
s13.push(p(
  "Fuente de los precios: cotizaciones reales de distribuidores chilenos, consultadas el 24 de " +
  "septiembre de 2026 (SP Digital, spdigital.cl, Providencia, Santiago).",
  { italics: true, size: 18, color: "666666" }
));
s13.push(p(
  "Recomendación: el Dell PowerEdge T150 cubre sobradamente las necesidades actuales del sistema " +
  "(16GB ampliable a 128GB frente a los 20GB totales usados hoy) a una fracción del costo, y agrega " +
  "capacidades que hoy no existen: memoria ECC (integridad de datos en un hipervisor de producción) y " +
  "iDRAC9 para administración remota fuera de banda (out-of-band), algo que el PC de escritorio actual " +
  "no ofrece. Se propone gestionar la adquisición de esta alternativa durante la Fase F5 del cronograma " +
  "(2 al 8 de noviembre de 2026)."
));

s13.push(h2("5.8 Lecciones Aprendidas (de la fase de simulación)"));
s13.push(bullet("Fijar versiones siempre en infraestructura como código: un `git clone` sin restricción de versión reintrodujo una rama de desarrollo distinta a la ya compilada y rompió un servicio que ya funcionaba (incidente 9)."));
s13.push(bullet("Las imágenes base de un proveedor de laboratorio pueden traer configuración residual (DNS, dominios de búsqueda) que no es evidente hasta que falla —nunca asumir que una plantilla “oficial” está limpia."));
s13.push(bullet("Un diseño de seguridad de “cero salida” debe validarse contra el flujo operativo real antes de implementarse, no después."));
s13.push(bullet("Una infraestructura virtual no debe depender de la red física en la que se encuentre el equipo anfitrión: pasar de una red puenteada a una red NAT aislada eliminó de raíz los choques de IP y los cambios de direccionamiento (incidentes 13 y 14)."));
s13.push(bullet("Verificar el estado real y persistente de la configuración, no solo el estado en ejecución: una regla de NAT antigua persistía en un archivo de arranque y habría reaparecido tras un reinicio (incidente 15)."));
s13.push(bullet("Validar primero en un entorno de simulación (como instruyó la jefatura) permitió encontrar y resolver 18 incidentes reales sin arriesgar la operación de CHIC, antes de tocar producción."));
s13.push(bullet("La asistencia de IA acelera genuinamente la implementación de infraestructura y la depuración, pero las decisiones de seguridad y arquitectura deben mantenerse bajo revisión y autorización humana explícita en cada paso."));

s13.push(h1("6. Implementación Técnica"));
s13.push(p(
  "Esta sección documenta cómo se construyó y se verificó la infraestructura, con evidencia real para cada " +
  "componente: red y aislamiento, infraestructura como código, configuración, HTTPS, monitoreo y, al final, " +
  "la carga de trabajo que se aloja y sus controles de seguridad. Las evidencias se toman de la " +
  "infraestructura funcionando (ver la nota de la sección 1.5 sobre sus fechas)."
));
const s13t = [];
s13t.push(h2("6.2 Infraestructura como Código (Terraform)"));
s13t.push(p("El módulo `infra/proxmox-terraform/` automatiza, contra la API de Proxmox (proveedor `bpg/proxmox`), la creación de la red interna `vmbr1` y las 4 máquinas virtuales del entorno de simulación, clonadas desde una plantilla cloud-init."));
s13t.push(bullet("`crm-edge` / `crm-edge-b`: 2 vCPU / 2GB, una sola interfaz en la red interna `vmbr1`, 8GB de disco."));
s13t.push(bullet("`crm-core` / `crm-core-b`: 4 vCPU / 6GB, interfaz solo en la red interna, 25GB de disco."));
s13t.push(bullet("Aplicado con éxito contra el Proxmox real: 5 recursos creados en el primer despliegue y 2 modificados en caliente en la migración de red, 0 errores y 0 destruidos."));
s13t.push(h3("Definición vigente de crm-edge"));
s13t.push(codeBlock([
  'resource "proxmox_virtual_environment_vm" "crm_edge" {',
  '  name      = "crm-edge"',
  '  node_name = var.proxmox_node',
  '  clone { vm_id = var.template_vm_id, full = true }',
  '  cpu    { cores = 2 }',
  '  memory { dedicated = 2048 }',
  '  disk { datastore_id = "local-lvm", interface = "scsi0", size = 8 }',
  '  network_device { bridge = "vmbr1" }  # solo red interna',
  '  initialization {',
  '    dns { servers = ["8.8.8.8", "1.1.1.1"] }',
  '    ip_config { ipv4 { address = "10.10.10.2/24", gateway = "10.10.10.1" } }',
  '    user_account { username = "cesar", keys = [var.ssh_public_key] }',
  '  }',
  '}',
]));
s13t.push(h3("Salida real de terraform apply: despliegue inicial (23 de septiembre)"));
s13t.push(codeBlock([
  "Plan: 5 to add, 0 to change, 0 to destroy.",
  "...",
  "proxmox_virtual_environment_vm.crm_edge: Creation complete after 6m40s [id=103]",
  "Apply complete! Resources: 5 added, 0 changed, 0 destroyed.",
]));
s13t.push(h3("Salida real de terraform apply: migración a la red interna (24-25 de septiembre)"));
s13t.push(codeBlock([
  "proxmox_virtual_environment_vm.crm_edge_b: Modifying... [id=102]",
  "proxmox_virtual_environment_vm.crm_edge: Modifying... [id=103]",
  "proxmox_virtual_environment_vm.crm_edge_b: Modifications complete after 8s [id=102]",
  "proxmox_virtual_environment_vm.crm_edge: Modifications complete after 8s [id=103]",
  "Apply complete! Resources: 0 added, 2 changed, 0 destroyed.",
  'crm_edge_nodos = "crm-edge: 10.10.10.2 · crm-edge-b: 10.10.10.3 (solo red interna vmbr1)"',
  'crm_edge_vip  = "VIP interna (Keepalived): 10.10.10.5. ..."',
]));
s13t.push(p(
  `Un plan posterior (figura ${F.tfplan}) sigue reportando 2 cambios sin adiciones ni destrucciones: el ` +
  "proveedor `bpg/proxmox` mantiene una diferencia residual en el bloque `ip_config` ya eliminado. " +
  "La configuración efectiva en Proxmox, verificada en la pestaña Cloud-Init de cada VM (figuras " +
  `${F.edgeci} y ${F.coreci}), coincide con el código: una única interfaz en vmbr1 con su IP y gateway internos. ` +
  `El resultado del despliegue (las 4 VMs en ejecución) se ve en la figura ${F.vms}.`
));

// landscape 6.1
const s13a = [
  ...figura(CAP, "pve-12-vms-en-ejecucion.png", "Las cuatro VMs en ejecución en Proxmox",
    "Qué se observa: el nodo pve con crm-core-b (100), crm-core (101), crm-edge-b (102) y crm-edge (103) en estado activo, más la plantilla 9000 desde la que se clonan; en la tabla se ven uso de CPU, memoria y uptime de cada una.", 1000, 480),
  pageBreak(),
  ...figura(CAP, "tf-01-plan-residual.png", "Plan de Terraform posterior a la migración de red",
    "Qué se observa: “Plan: 0 to add, 2 to change, 0 to destroy”. Los dos cambios corresponden al bloque ip_config eliminado que el proveedor sigue reportando; no hay recursos nuevos ni destruidos.", 1000, 480),
];

// ---- 6.2 Ansible
const s14b = [
  h2("6.3 Configuración (Ansible)"),
  p("El módulo `infra/ansible/` configura cada VM desde adentro: Nginx y Keepalived en el par de borde; Docker, el stack completo del CRM y la réplica de Postgres en el par de núcleo; Uptime Kuma en `crm-edge`, que actúa como nodo de control y bastión único de administración. Todo se ejecuta desde `crm-edge` con un inventario propio, y el rol `crm_edge` despliega el certificado firmado por la CA privada."),
  bullet("Los playbooks son idempotentes: una segunda ejecución muestra `changed` solo donde hubo una diferencia real."),
  bullet("La red interna es la única vía hacia el núcleo: el acceso a crm-core y crm-core-b se hace saltando por crm-edge (bastión)."),

];
const s14n = [
  h2("6.1 Red, segmentación y aislamiento"),
  p(
    "La red se diseñó en tres capas. En la capa externa, el PC físico puede estar conectado a cualquier red " +
    "(Wi-Fi, hotspot del celular o LAN); VMware Workstation la aísla mediante una red virtual NAT (VMnet8, " +
    "192.168.80.0/24, puerta de enlace 192.168.80.2) y el host Proxmox tiene la IP fija 192.168.80.10. En " +
    "la capa intermedia, Proxmox actúa como router: publica el CRM con DNAT (80 y 443 hacia la VIP " +
    "interna 10.10.10.5) y expone el SSH de cada borde en los puertos 2211 y 2212, mientras que el " +
    "MASQUERADE de salida se limita a crm-edge y crm-edge-b. En la capa interna, la red virtual vmbr1 " +
    "(10.10.10.0/24, sin puerto físico) aloja las cuatro VMs con Proxmox (10.10.10.1) como puerta de enlace."
  ),
  p(
    "Esta decisión (ADR-06) nació de un problema real: en modo puenteado sobre el hotspot, la red externa " +
    "solo veía la MAC del PC y descartaba las de las VMs anidadas, y una IP fija repetida tumbó la " +
    "conexión del propio equipo. Con la red NAT, la infraestructura es independiente de la red externa. " +
    `La verificación se hizo con evidencia directa: el adaptador y la red de VMware (figuras ${F.vmwnat} y ${F.vmwnet}), ` +
    `el direccionamiento del PC (figura ${F.ipconfig}), la configuración de red del nodo (figura ${F.redpve}), el script de reglas ` +
    `(figura ${F.crmnat}), las reglas activas (figura ${F.iptables}) y la prueba de aislamiento del núcleo (figura ${F.ping}), ` +
    `además de la configuración de cada VM (figuras ${F.edgehw} a ${F.coreci}).`
  ),
  p(
    "Un hallazgo relevante: la verificación de reglas reveló una regla MASQUERADE amplia, heredada del " +
    "aprovisionamiento y guardada en el archivo persistente de iptables, que habría dado salida a Internet " +
    "a todo el núcleo tras un reinicio. Se eliminó de la configuración en ejecución y del archivo " +
    "persistente, y la figura " + F.iptables + " muestra el resultado final: solo los dos bordes tienen salida (incidente 15)."
  ),
];

const s14a = [
  ...figura(CAP, "vmw-01-adaptador-nat.png", "Adaptador de red de la VM Proxmox en modo NAT (VMware)",
    "Qué se observa: en la configuración de la VM, el Network Adapter marcado como NAT (no Bridged) y conectado al encender. Es la base de la independencia respecto de la red externa.", 760, 470),
  pageBreak(),
  ...figura(CAP, "vmw-02-virtual-network-editor.png", "Editor de redes virtuales de VMware",
    "Qué se observa: la red VMnet8 de tipo NAT con la subred 192.168.80.0 y DHCP habilitado (la IP de Proxmox está fuera del rango DHCP). VMnet1 (host-only) aparece seleccionada, sin uso en este proyecto.", 560, 500),
  pageBreak(),
  ...figura(CAP, "red-02-ipconfig-pc.png", "Direccionamiento del PC anfitrión",
    "Qué se observa: el adaptador VMnet8 con 192.168.80.1/24 (red privada donde vive Proxmox) y el Wi-Fi con 172.20.10.2/28 y puerta de enlace 172.20.10.1 (el hotspot del celular). Son redes distintas: la infraestructura no depende de cuál sea la externa.", 640, 480),
  pageBreak(),
  ...figura(CAP, "pve-05-red-del-nodo.png", "Interfaces de red del nodo Proxmox",
    "Qué se observa: el puente vmbr0 con 192.168.80.10/24 (hacia VMnet8, sobre la tarjeta nic0) y el puente vmbr1 con 10.10.10.1/24 (red interna sin puerto físico), ambos activos y con inicio automático.", 1000, 300),
  pageBreak(),
  ...figura(CAP, "pve-10-script-crm-nat.png", "Script de reenvío y NAT del host Proxmox",
    "Qué se observa: el contenido de /etc/network/if-up.d/crm-nat. Activa el reenvío de paquetes, hace MASQUERADE solo para 10.10.10.2 y 10.10.10.3 y publica los puertos 80/443 hacia la VIP 10.10.10.5 y 2211/2212 hacia el SSH de cada borde. Es idempotente y se ejecuta en cada arranque.", 620, 520),
  pageBreak(),
  ...figura(CAP, "pve-11-iptables-final.png", "Reglas NAT activas tras la corrección",
    "Qué se observa: solo dos reglas POSTROUTING (MASQUERADE de los bordes .2 y .3). La regla amplia de 10.10.10.0/24 ya no existe: el núcleo no tiene salida a Internet.", 620, 480),
  pageBreak(),
  ...figura(CAP, "red-01-ping-aislamiento.png", "Prueba de aislamiento del núcleo",
    "Qué se observa: un ping desde el PC hacia crm-core (10.10.10.10) termina con 100% de paquetes perdidos. El núcleo no es alcanzable directamente; solo se llega a él saltando por el bastión crm-edge.", 640, 380),
  pageBreak(),
  ...figura(CAP, "pve-06-edge-hardware.png", "Hardware de crm-edge",
    "Qué se observa: 2 GiB de memoria, 2 procesadores, disco de 8 GB, unidad Cloud-Init y una única interfaz de red (net0) conectada al puente vmbr1.", 1000, 320),
  pageBreak(),
  ...figura(CAP, "pve-07-edge-cloudinit.png", "Cloud-Init de crm-edge",
    "Qué se observa: usuario cesar sin contraseña (acceso solo por llave SSH), DNS 8.8.8.8 y 1.1.1.1, y la configuración de red net0 con gateway 10.10.10.1 e IP 10.10.10.2/24.", 720, 400),
  pageBreak(),
  ...figura(CAP, "pve-08-core-hardware.png", "Hardware de crm-core",
    "Qué se observa: 6 GiB de memoria, 4 procesadores, disco de 25 GB y una única interfaz de red en vmbr1. El núcleo no tiene ninguna interfaz hacia la red externa.", 1000, 320),
  pageBreak(),
  ...figura(CAP, "pve-09-core-cloudinit.png", "Cloud-Init de crm-core",
    "Qué se observa: la configuración de red net0 con gateway 10.10.10.1 e IP 10.10.10.10/24, y el acceso solo por llave SSH del usuario cesar.", 720, 400),
];

// ---- 6.4 HTTPS (portrait) ----
const s15 = [
  h2("6.4 HTTPS con Autoridad Certificadora Privada"),
  p("Se construyó una CA propia: su llave privada nunca sale del equipo del responsable ni se copia a ninguna VM. El certificado de `crm-edge`, firmado por esa CA, cubre como SAN la IP virtual y las IPs de ambos bordes, incluida la IP de Proxmox con la que se accede desde el PC (192.168.80.10), y tiene una vigencia de dos años; la CA se instala una sola vez en cada dispositivo."),
  p(`Las figuras ${F.certdet} y ${F.candado} son las capturas originales de la validación del certificado (23 de septiembre, red de simulación anterior). La captura de acceso vigente, con el candado sobre https://192.168.80.10, se presenta en la sección 6.6 (figura ${F.login}).`),
];
const s15a = [
  ...figura(EVI, "2026-09-23-08-detalle-certificado-ca.png", "Detalle del certificado servido por el CRM",
    "Qué se observa: el certificado emitido por “CRM Empresarial - CA Interna” (no un autofirmado), con validez de dos años. Captura del 23 de septiembre, bajo el direccionamiento de la red anterior.", 700, 480),
  pageBreak(),
  ...figura(EVI, "2026-09-23-09-candado-conexion-segura.png", "Conexión segura sin advertencias",
    "Qué se observa: el candado y la leyenda “La conexión es segura” en el navegador, sin ninguna advertencia, tras instalar la CA privada en el almacén de confianza.", 700, 480),
];

// ---- 6.5 Monitoreo (portrait) ----
const s16 = [
  h2("6.5 Monitoreo (Uptime Kuma)"),
  p("Uptime Kuma se instaló nativo (Node.js, sin Docker) con 6 monitores activos cada 30 segundos: la IP virtual VRRP, ambos nodos de borde, ambos nodos de núcleo (API en el puerto 8001) y PostgreSQL (TCP 5432). Se accede a su panel mediante un túnel SSH hacia el puerto 3001, sin exponerlo en la red. Tras una prueba de estrés, su despliegue pasó de una instancia única a una instancia por borde (sección 6.5.1)."),
  p(
    `Al migrar el direccionamiento, los tres monitores del borde quedaron en rojo porque seguían apuntando a las IPs antiguas (figura ${F.kumarojo}); los de núcleo y PostgreSQL, que ya usaban la red interna, no ` +
    `se vieron afectados. Tras actualizar las direcciones a 10.10.10.2, 10.10.10.3 y 10.10.10.5, los seis monitores volvieron a estado “Funcional” ` +
    `(figuras ${F.kuma1} a ${F.kuma6}). El historial rojo-verde de las gráficas es evidencia de que el monitoreo detecta tanto la falla como la recuperación; el porcentaje de disponibilidad acumulado quedó reducido por ese periodo (incidente 16).`
  ),
  h3("6.5.1 Hallazgo de la prueba de estrés: el monitoreo como punto único de falla"),
  p("Durante una prueba de estrés se apagó la máquina virtual crm-edge. El resultado fue mixto: la redundancia del servicio funcionó —crm-edge-b tomó la IP virtual y mantuvo el CRM disponible—, pero el monitoreo dejó de estar disponible. Uptime Kuma corría únicamente en crm-edge, de modo que al caer ese nodo cayeron a la vez la herramienta que debía detectar la falla y el túnel de acceso a ella. Es decir, el mecanismo de detección tenía un punto único de falla que la arquitectura de servicio no tenía."),
  p("Este hallazgo es una limitación de diseño, no un defecto de implementación: en la decisión original (ADR-05) se ubicó Kuma en crm-edge por ser una VM con visibilidad hacia la red interna y por mantener el principio de bastión liviano, sin considerar que el monitoreo debe sobrevivir a la falla del nodo que monitorea."),
  h3("Análisis de alternativas"),
];
const kumaAlt = [
  ["A. Una instancia de Kuma en cada borde, con monitoreo cruzado", "Aprovecha el par de borde, que ya es redundante y sin estado; reutiliza el rol Ansible existente; sin memoria adicional; cada instancia vigila además a su par, de modo que la caída de un borde es detectada por el otro.", "Elegida. Límite declarado: ambas instancias siguen en el mismo servidor físico."],
  ["B. Una VM de monitoreo independiente", "Aísla el monitoreo de los bordes.", "Descartada: la memoria del host ya está casi asignada (16 GB de 18,6 GB) y seguiría siendo una instancia única."],
  ["C. Kuma directamente en el host Proxmox", "Sobrevive a la caída de cualquier VM.", "Descartada: contamina el hipervisor con software de aplicación y rompe la separación de responsabilidades."],
  ["D. Una instancia con base replicada entre nodos", "Un único estado lógico de monitoreo.", "Descartada: replicar una base SQLite activa exige coordinación y riesgo de corrupción, con demasiada complejidad para una herramienta liviana."],
];
s16.push(makeTable([3000, 3700, 3000], ["Alternativa", "Ventaja", "Evaluación"], kumaAlt));
s16.push(h3("Decisión e implementación"));
s16.push(p("Se adoptó la alternativa A (ADR-08). La segunda instancia se sembró copiando /opt/uptime-kuma desde crm-edge hacia crm-edge-b por la red interna (tar por SSH, con el servicio detenido unos segundos para copiar la base de forma consistente), sin descargar dependencias por Internet; luego el rol Ansible uptime_kuma, ahora aplicado a ambos bordes, completó la instalación de Node.js y el servicio. Ambas instancias quedaron activas y cada una alcanza a la otra por la red interna (respuesta HTTP 200 en el puerto 3001)."));
s16.push(p(`En la instancia de crm-edge-b se creó un monitor cruzado hacia la instancia de crm-edge (http://10.10.10.2:3001), que quedó en estado “Funcional” (figura ${F.kumab}). La validación se hizo repitiendo la prueba de estrés: con crm-edge apagado, la instancia de crm-edge-b siguió operativa, marcó “Caído” el monitor cruzado y el monitor del borde activo, y emitió alertas de conexión (EHOSTUNREACH), mientras el CRM seguía servido por crm-edge-b (figura ${F.kumaprueba}). El monitor recíproco en crm-edge se registrará junto con las pruebas de la Fase F3. Límite declarado: ambas instancias residen en el mismo servidor físico, por lo que no cubren la caída del equipo completo; eso se resuelve con el segundo servidor (sección 5.7).`));

const s16a = [
  ...figura(CAP, "kuma-00-monitores-tras-cambio-de-ip.png", "Monitores tras el cambio de direccionamiento",
    "Qué se observa: los monitores EDGE activo, EDGE stand-by e IP Virtual VRRP en rojo (apuntaban a las IPs antiguas) mientras CORE activo, CORE stand-by y POSTGRES siguen en verde.", 520, 480),
  pageBreak(),
  ...figurasApiladas(CAP, [
    { file: "kuma-01-core-activo.png", titulo: "Monitor CORE activo (10.10.10.10:8001)", texto: "Qué se observa: estado “Funcional”, disponibilidad y tiempo de respuesta estable (≈11 ms) de la API del núcleo activo." },
    { file: "kuma-02-core-standby.png", titulo: "Monitor CORE stand-by (10.10.10.11:8001)", texto: "Qué se observa: la réplica del núcleo responde y está disponible (≈12 ms), lista para una eventual promoción manual." },
  ], 620, 250),
  pageBreak(),
  ...figurasApiladas(CAP, [
    { file: "kuma-03-edge-activo.png", titulo: "Monitor EDGE activo (https://10.10.10.2)", texto: "Qué se observa: en la gráfica, la franja roja del periodo con IP antigua y la recuperación al corregirla; abajo a la derecha, la caducidad del certificado a 729 días." },
    { file: "kuma-04-edge-standby.png", titulo: "Monitor EDGE stand-by (https://10.10.10.3)", texto: "Qué se observa: el mismo patrón de caída y recuperación en el borde de respaldo, con el certificado vigente." },
  ], 620, 250),
  pageBreak(),
  ...figurasApiladas(CAP, [
    { file: "kuma-05-ip-virtual-vrrp.png", titulo: "Monitor IP Virtual VRRP (https://10.10.10.5)", texto: "Qué se observa: la IP virtual que mueve Keepalived responde con el certificado firmado por la CA, y su historial refleja la corrección de la IP." },
    { file: "kuma-06-postgres.png", titulo: "Monitor POSTGRES (TCP 10.10.10.10:5432)", texto: "Qué se observa: el puerto de la base de datos accesible desde crm-edge (≈4 ms) con 99,6% de disponibilidad." },
  ], 620, 250),
  pageBreak(),
  ...figura(CAP, "kuma-07-instancia-crm-edge-b.png", "Segunda instancia de Kuma (crm-edge b) vigilando a crm-edge",
    "Qué se observa: la instancia de crm-edge-b (túnel al puerto 3002) con la configuración copiada de crm-edge —los seis monitores originales— y el nuevo monitor cruzado “KUMA -EDGE activo”, que apunta a http://10.10.10.2:3001 y está en estado Funcional (100%). Si crm-edge cae, esta instancia sigue operativa y lo señala.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "kuma-08-prueba-estres-instancia-b.png", "Prueba de estrés con la solución: la instancia de crm-edge b sigue operativa",
    "Qué se observa: con crm-edge apagado, la instancia de crm-edge-b (túnel al puerto 3002) sigue en línea y muestra en rojo “Caído” el monitor cruzado KUMA -EDGE activo y el monitor EDGE activo, con las alertas “connect EHOSTUNREACH” hacia 10.10.10.2. La herramienta de detección sobrevive a la falla del nodo que vigila.", 1000, 500),
];

// ---- 6.6 Carga de trabajo (portrait) ----
const s17 = [
  h2("6.6 Carga de trabajo: el CRM y sus controles de seguridad"),
  p(`El sistema alojado es un CRM en microservicios (autenticación, empleados, calendario, inventario, reservas y chat) detrás de un gateway Nginx, sobre nueve contenedores Docker (figura ${F.modulos}). Desde el punto de vista de la infraestructura, lo que importa es lo que exige de ella: disponibilidad, transporte seguro y protección de datos personales. Esta sección resume los controles verificados con la infraestructura funcionando; el detalle funcional de cada módulo se encuentra en el Anexo B.`),
  bullet(`Transporte seguro: el acceso es por HTTPS con el certificado firmado por la CA privada; ante credenciales incorrectas el sistema responde con un mensaje genérico, sin revelar si falló el usuario o la contraseña (figura ${F.login}).`),
  bullet(`Control de acceso por roles: cuatro roles (Administrador, Recursos humanos, Recepción y Empleado) con permisos asignados por módulo; la cuenta genérica “admin” de fábrica permanece inactiva (figura ${F.usuarios}). Los formularios de permisos por perfil están en el Anexo B (figuras ${F.permrrhh} a ${F.permadm}).`),
  bullet(`Protección de datos sensibles: los datos de salud solo los ve quien tiene el permiso específico (figura ${F.sinpermiso}) y se guardan cifrados en reposo con Fernet, de modo que un acceso directo a la base de datos o a un respaldo no revela su contenido (figura ${F.cifrado}). El consentimiento informado, el historial de accesos, la anonimización al eliminar y la auditoría del chat se muestran en el Anexo B.`),
  bullet("Las contraseñas se almacenan con hash bcrypt y la sesión usa un token JWT con vencimiento de 8 horas."),
  p("Junto al sistema se elaboraron dos documentos en la carpeta legal/ del repositorio: el Registro de Actividades de Tratamiento (qué datos personales se tratan, con qué finalidad, quién accede y con qué medidas de seguridad) y el Procedimiento ante Brechas de Seguridad. Ambos son borradores: requieren revisión de un abogado especializado y completar los datos de la institución antes de considerarse oficiales, lo que se registra como el riesgo R16."),
];
const s17a = [
  ...figura(CAP, "crm-22-login-fallido-https.png", "Inicio de sesión con credenciales inválidas, sobre HTTPS",
    "Qué se observa: la barra de direcciones con https://192.168.80.10 y el candado (conexión segura), y el mensaje genérico “Credenciales inválidas” tras un intento con contraseña incorrecta.", 800, 520),
  pageBreak(),
  ...figura(CAP, "crm-09-usuarios-lista.png", "Módulo Usuarios y accesos",
    "Qué se observa: usuarios con rol, módulos asignados y estado. El administrador tiene acceso total, y la cuenta genérica “admin” figura como Inactivo. Los correos aparecen difuminados por privacidad.", 1000, 480),
  pageBreak(),
  ...figura(CAP, "crm-18-sin-permiso-salud.png", "Ficha sin permiso de salud",
    "Qué se observa: un usuario sin el permiso “Empleados: datos de salud” no ve ni edita esos campos; el sistema le indica que debe solicitar el acceso a un administrador.", 1000, 400),
  pageBreak(),
  ...figura(CAP, "crm-21-cifrado-en-base-de-datos.png", "Cifrado en reposo: consulta directa a la base de datos",
    "Qué se observa: al consultar la tabla empleados directamente en PostgreSQL, las columnas alergias y medicamentos contienen texto cifrado que empieza con “gAAAA…” (formato Fernet), no el contenido real. Muestra que los datos de salud no son legibles sin la clave de la aplicación.", 900, 420),
];

const s20 = [
  h1("7. Control de Versiones (GitHub)"),
  p("Todo el trabajo descrito en este informe está versionado con git y publicado en un repositorio real de GitHub (arkno1820-arch/crm-empresarial), con cada commit correspondiendo a un cambio real y verificable."),
];
const s20a = [
  ...figura(EVI, "2026-09-24-07-github-commits.png", "Historial de commits en GitHub",
    "Qué se observa: el historial real de commits del repositorio, con mensajes descriptivos de cada cambio de la fase de simulación (septiembre de 2026).", 1000, 480),
];

// ---- 8 Bitacora (portrait) ----
const s21 = [
  h1("8. Bitácora de Incidentes Reales (fase de simulación)"),
  p("Dieciocho incidentes reales, encontrados y resueltos durante el desarrollo y despliegue en el entorno de simulación —evidencia auténtica de gestión de incidentes para Gestión de Servicios TI (ITIL) y Gestión de Proyectos."),
];
const incidents = [
  ["1", "Caché de DNS del gateway Nginx", "Nginx seguía resolviendo IPs viejas tras reconstruir contenedores.", "`resolver 127.0.0.11 valid=10s;` + variables dinámicas en proxy_pass."],
  ["2", "Confianza cruzada de certificados HTTPS", "El navegador debía confiar por separado en el certificado del gateway y del frontend.", "Documentado el orden correcto de aceptación."],
  ["3", "Migración de cifrado silenciosamente no aplicada", "SQLAlchemy no detectaba cambios al reasignar el mismo valor a un campo cifrado.", "`flag_modified` de sqlalchemy.orm.attributes."],
  ["4", "Restricción de hardware", "El equipo inicial no alcanzaba para el diseño de virtualización planeado.", "Pivote de arquitectura documentado, no tratado como error."],
  ["5", "Conflicto VT-x entre Docker Desktop y Proxmox", "Ambos compiten por el mismo recurso de virtualización de hardware.", "Retiro de Docker Desktop del host físico; Hyper-V desactivado."],
  ["6", "DNS roto heredado de la plantilla base", "nameserver inválido y dominio de búsqueda ajeno en el host Proxmox y en las 4 VMs.", "DNS explícito (8.8.8.8/1.1.1.1) vía cloud-init y resolv.conf estático."],
  ["7", "Disco de la plantilla insuficiente (2GB)", "Síntoma engañoso de “cuelgue de red”; la causa real era “no space left on device”.", "Bloque disk en Terraform (8GB/25GB) + growpart/resize2fs."],
  ["8", "Aislamiento total de crm-core incompatible con el aprovisionamiento", "Ansible necesita Internet para instalar Docker y clonar el repositorio.", "NAT de salida durante el aprovisionamiento; luego restringido solo a los bordes (ver incidente 15)."],
  ["9", "docker-compose-plugin fuera de los repositorios base de Ubuntu", "El paquete solo existe en el repositorio oficial de Docker.", "Repositorio oficial de Docker agregado antes de instalar."],
  ["10", "git clone sobre directorio no vacío", "El .env se copiaba antes de clonar, dejando el directorio no vacío.", "Orden corregido: clonar primero, copiar .env/certificados después."],
  ["11", "Permisos de $HOME bloqueaban a Nginx", "/home/cesar en 750 por defecto; Nginx (www-data) no podía atravesarlo.", "`chmod o+x /home/cesar` en ambos nodos de borde."],
  ["12", "Login roto: “Failed to fetch”", "El frontend asumía un puerto de gateway separado (8443) inexistente en crm-edge.", "Generación de frontend/js/config.js vía Ansible con el puerto real (443)."],
  ["13", "Choque de IP con el equipo anfitrión y caída de su red", "Al pasar a la red del hotspot, a Proxmox se le asignó la misma IP que el PC; el conflicto tumbó la conexión del equipo.", "IP fija fuera del rango que asigna el hotspot y, finalmente, red NAT independiente (ADR-06)."],
  ["14", "El hotspot descartaba las VMs anidadas (modo bridged)", "La red externa solo reconocía la MAC del PC; las VMs de borde eran inalcanzables aunque estaban bien configuradas.", "Red NAT VMnet8 y Proxmox como router (DNAT/MASQUERADE); infraestructura independiente de la red externa."],
  ["15", "Regla NAT amplia persistente en iptables", "Una regla MASQUERADE de 10.10.10.0/24 quedó guardada en /etc/iptables/rules.v4 y habría devuelto la salida a Internet al núcleo tras un reinicio.", "Regla eliminada de la configuración activa y del archivo persistente; verificado con iptables (solo los bordes con salida)."],
  ["16", "Monitores de Uptime Kuma en rojo tras cambiar el direccionamiento", "Tres monitores del borde apuntaban a las IPs antiguas de la red externa.", "Direcciones actualizadas a 10.10.10.2, .3 y .5; los seis monitores volvieron a “Funcional”."],
  ["17", "Diferencia residual del proveedor de Terraform", "Tras eliminar un bloque ip_config, el plan sigue reportando 2 cambios aunque Proxmox coincide con el código.", "Diferencia observada y documentada; la verificación se hizo en Cloud-Init de cada VM. No afecta a las VMs."],
  ["18", "Monitoreo con punto único de falla", "Uptime Kuma corría solo en crm-edge: al apagarlo en una prueba de estrés, el CRM siguió disponible por crm-edge-b pero el monitoreo dejó de estar disponible.", "Instancia de Kuma en cada borde con monitoreo cruzado (ADR-08); segunda instancia sembrada por la red interna y desplegada con Ansible."],
];
s21.push(makeTable([500, 2500, 3500, 3200], ["#", "Incidente", "Causa raíz", "Resolución"], incidents));

// ---- 9 Pruebas (portrait) ----
s21.push(h1("9. Pruebas y Verificación"));
s21.push(p(
  "Las pruebas se ejecutaron técnicamente entre el 23 y el 25 de septiembre de 2026, como parte del " +
  "cierre de la fase de desarrollo del entorno de simulación. Se presentan y validan formalmente dentro " +
  "de la Fase F3 del cronograma de la práctica —“Validación de infraestructura y pruebas”, 12 al 18 de " +
  `octubre de 2026 (ver figura ${F.gantt})—, que es cuando corresponde su revisión y cierre dentro del periodo oficial.`
));
s21.push(h2("9.1 Failover de Keepalived: prueba inicial (Fase F3)"));
s21.push(p("Ejecutada con apagado abrupto (no un shutdown ordenado) para simular una falla real, bajo el direccionamiento de la red anterior:"));
s21.push(bullet("19:03:40 — se apaga crm-edge de golpe, mientras sostenía la IP virtual."));
s21.push(bullet("19:03:50 — la IP virtual ya respondía 200 OK, ahora servida por crm-edge-b. Sin caída visible del servicio."));
s21.push(bullet("19:04:37 — se enciende crm-edge de nuevo. Al terminar de bootear, reclamó automáticamente la IP virtual (prioridad 150 vs. 100) y crm-edge-b la soltó — sin intervención manual."));

s21.push(h2("9.2 Failover de Keepalived: revalidación en la red NAT (Fase F3)"));
s21.push(p(
  `Repetida sobre la arquitectura vigente (VIP interna 10.10.10.5, acceso por Proxmox). Se detuvo Keepalived en crm-edge y se verificó, ` +
  `en menos de 5 segundos, que la IP virtual pasó a crm-edge-b; mientras tanto el CRM siguió respondiendo por https://192.168.80.10 ` +
  `(figura ${F.crmfailover}). Luego se reinició Keepalived en crm-edge y este recuperó la IP virtual. El ciclo completo, con los comandos y ` +
  `las direcciones de cada paso, se muestra en la figura ${F.ciclo}.`
));

s21.push(h2("9.3 Failover manual del núcleo (Fase F3)"));
s21.push(bullet("Apagado abrupto de crm-core mientras era el primario: la API del CRM cayó con 502 Bad Gateway."));
s21.push(bullet("Se ejecutó el runbook de promoción manual: cambiar `crm_core_ip` a la IP de la réplica y re-aplicar Ansible."));
s21.push(bullet("La API volvió a responder, servida por crm-core-b. Tras encender crm-core de nuevo, se revirtió la promoción."));

s21.push(h2("9.4 Verificación de HTTPS con CA privada (Fase F3)"));
s21.push(p(`Confirmado con \`openssl s_client\` y \`curl --cacert\` (validación real de la cadena de confianza contra la CA privada, código de verificación 0) y visualmente en el navegador: candado, sin advertencias (figura ${F.login}), con el nuevo SAN que incluye 192.168.80.10.`));

s21.push(h2("9.5 Verificación de monitoreo (Fase F3)"));
s21.push(p(`Seis monitores activos en Uptime Kuma, todos en estado “Funcional” tras la corrección del direccionamiento (figuras ${F.kuma1} a ${F.kuma6}).`));

s21.push(h2("9.6 Verificación de aislamiento y protección de datos (Fase F3)"));
s21.push(bullet(`Aislamiento del núcleo: el ping desde el PC hacia 10.10.10.10 termina con 100% de pérdida (figura ${F.ping}) y las reglas de NAT dejan salida solo a los bordes (figura ${F.iptables}).`));
s21.push(bullet(`Cifrado en reposo: una consulta directa a PostgreSQL devuelve texto cifrado (gAAAA…) en las columnas de salud (figura ${F.cifrado}).`));
s21.push(bullet(`Control de acceso: el menú y los datos de salud dependen del rol y de los permisos (figura ${F.usuarios}, figura ${F.sinpermiso} y, en el Anexo B, figuras ${F.permrrhh} a ${F.permadm}).`));

s21.push(h2("9.7 Prueba de estrés: apagado del borde activo (Fase F3)"));
s21.push(p(`Se apagó la máquina virtual crm-edge (borde activo, con la IP virtual) como prueba de estrés. Resultados observados: (1) crm-edge-b tomó la IP virtual y mantuvo el CRM en servicio, sin intervención manual; (2) el monitoreo, que entonces corría solo en crm-edge, dejó de estar disponible junto con su túnel de acceso, lo que motivó el hallazgo y la solución de la sección 6.5.1. Al encender de nuevo crm-edge, Uptime Kuma arrancó solo y conservó sus monitores. La prueba se repitió con la solución aplicada: la instancia de Kuma de crm-edge-b siguió operativa y señaló la caída de crm-edge (figura ${F.kumaprueba}).`));

const s21a = [
  ...figura(CAP, "ha-01-ciclo-failover.png", "Ciclo completo de failover del borde",
    "Qué se observa: crm-edge con la IP virtual 10.10.10.5; se detiene su Keepalived; la IP virtual aparece en crm-edge-b (repetida en dos consultas); se reinicia Keepalived en crm-edge y la IP virtual vuelve a él. Todo sin intervención en las VMs, solo por VRRP.", 950, 480),
  pageBreak(),
  ...figura(CAP, "ha-02-crm-durante-failover.png", "El CRM disponible durante el failover",
    "Qué se observa: con crm-edge sin Keepalived (la IP virtual servida por crm-edge-b), el CRM sigue respondiendo con su pantalla de inicio de sesión en https://192.168.80.10.", 640, 480),
];

// ---- 10 Evidencia del despliegue (portrait titulo + landscape figuras) ----
const s22 = [
  h1("10. Evidencia del Despliegue en el Entorno de Simulación"),
  p("Capturas tomadas durante el despliegue real contra el Proxmox físico de CHIC, no un entorno de prueba desechable (23 de septiembre de 2026)."),
];
const s22a = [
  ...figura(EVI, "2026-09-23-01-proxmox-nodo-pve-limpio.png", "Nodo Proxmox antes del despliegue",
    "Qué se observa: el nodo pve recién instalado, con el almacenamiento local-lvm disponible y sin máquinas virtuales.", 900, 480),
  pageBreak(),
  ...figura(EVI, "2026-09-23-02-error-dns-plantilla-cloudinit.png", "Incidente 6 en curso: error de DNS al crear la plantilla",
    "Qué se observa: el error de resolución de nombres durante la creación de la plantilla, causado por el DNS heredado de la plantilla base.", 900, 480),
  pageBreak(),
  ...figura(EVI, "2026-09-23-04-cloud-image-descargado.png", "Descarga de la imagen cloud-init",
    "Qué se observa: la descarga completa de la imagen cloud-init una vez resuelto el DNS.", 900, 480),
];

// ---- 11 Conclusiones (portrait) ----
const s23 = [
  h1("11. Conclusiones"),
  p(
    "Este informe demuestra, con evidencia verificable y no simulada, la puesta en marcha de una " +
    "arquitectura de redes y virtualización completa en respuesta a una necesidad real del Centro CHIC: " +
    "una red NAT independiente de la red externa, segmentación con aislamiento del núcleo verificado, " +
    "Proxmox operando como router con publicación de servicios por DNAT, redundancia del borde con " +
    "VRRP probada mediante fallas reales, infraestructura como código, HTTPS confiable con una " +
    "autoridad certificadora propia y monitoreo activo."
  ),
  p(
    "El valor del trabajo no reside solo en el resultado —la infraestructura funcionando en " +
    "simulación—, sino en el proceso documentado de dieciocho incidentes reales resueltos con su " +
    "causa raíz identificada (varios de ellos de red: choque de IP, direcciones MAC descartadas por " +
    "el hotspot, reglas de NAT persistentes), y en la experiencia adquirida que habilita, con " +
    "conocimiento real y no teórico, la migración responsable a producción sobre el servidor físico de CHIC."
  ),
  p(
    "El sistema CRM, desarrollado a partir de una necesidad real y perfeccionado durante el proyecto, es " +
    "la carga de trabajo que da sentido a esa infraestructura y una habilidad de software adicional " +
    "adquirida en el camino; su detalle funcional se conserva en el Anexo B. Las fases pendientes —" +
    "respaldo offsite en Oracle Cloud, cotización y adquisición del segundo servidor, y la migración " +
    "a producción bare metal— están planificadas dentro del cronograma oficial de 360 horas de la " +
    "práctica (sección 5.3) y se reportarán con evidencia real en los sucesivos informes de avance. Los " +
    "documentos legales de respaldo permanecen como borradores a la espera de su revisión jurídica."
  ),
];

// ---- Anexo (portrait titulo + landscape) ----
const s24 = [
  h1("Anexo A. Resumen de cada máquina virtual en Proxmox"),
  p("Vistas de resumen de las cuatro VMs en ejecución en el nodo pve, con su estado, uso de CPU y memoria, tamaño de disco y tiempo de actividad."),
];
const s24a = [
  figurasPar(CAP,
    { file: "pve-01-vm100-core-b.png", titulo: "Resumen de crm-core-b (VM 100)", texto: "Qué se observa: réplica del núcleo en ejecución, 4 CPUs, 6 GiB de memoria y disco de 25 GiB." },
    { file: "pve-02-vm101-core.png", titulo: "Resumen de crm-core (VM 101)", texto: "Qué se observa: núcleo activo en ejecución, 4 CPUs, 6 GiB de memoria y disco de 25 GiB." }, 500, 430),
  pageBreak(),
  figurasPar(CAP,
    { file: "pve-03-vm102-edge-b.png", titulo: "Resumen de crm-edge-b (VM 102)", texto: "Qué se observa: borde en espera en ejecución, 2 CPUs, 2 GiB de memoria y disco de 8 GiB." },
    { file: "pve-04-vm103-edge.png", titulo: "Resumen de crm-edge (VM 103)", texto: "Qué se observa: borde activo en ejecución, 2 CPUs, 2 GiB de memoria y disco de 8 GiB." }, 500, 430),
  new Paragraph({ children: [] }),
];

const sB = [
  h1("Anexo B. Detalle funcional del CRM (carga de trabajo)"),
  p("Este anexo reúne la evidencia funcional del sistema alojado en la infraestructura: los módulos de negocio, la asignación de permisos por perfil y los controles de protección de datos personales (Ley 21.719). Todas las capturas se tomaron accediendo por https://192.168.80.10; los datos personales aparecen difuminados."),
];
const sBa = [
  ...figura(CAP, "crm-01-empleados.png", "Módulo Empleados",
    "Qué se observa: listado de personal con cargo, departamento y estado, y acciones de editar y consultar el historial de accesos de cada ficha. RUT, teléfonos y correos aparecen difuminados por privacidad.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "crm-02-calendario.png", "Módulo Calendario",
    "Qué se observa: eventos agrupados por fecha, con horario, lugar, descripción, participantes y el usuario que los creó.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "crm-03-inventario.png", "Módulo Inventario",
    "Qué se observa: productos con stock (con indicador de color), precio unitario y ubicación, y acciones para ajustar existencias, editar o eliminar.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "crm-04-reservas.png", "Módulo Reservas",
    "Qué se observa: reservas con huésped, habitación, fechas, total y estado. Los correos de los huéspedes aparecen difuminados por privacidad.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "crm-05-habitaciones.png", "Gestión de habitaciones",
    "Qué se observa: el catálogo de habitaciones con tipo, capacidad, precio por noche y disponibilidad.", 1000, 500),
  pageBreak(),
  ...figura(CAP, "crm-06-chat-aviso-admin.png", "Chat interno con aviso de trazabilidad",
    "Qué se observa: el aviso “Este chat interno queda registrado y es auditable por administración… los mensajes se conservan visibles 30 días”, que informa al usuario del tratamiento, y el botón Auditoría disponible solo para el administrador.", 1000, 500),
  pageBreak(),
  figurasPar(CAP,
    { file: "crm-10-permisos-rrhh.png", titulo: "Permisos del perfil Recursos humanos", texto: "Qué se observa: el rol RRHH con solo Inventario y Chat marcados; los permisos se asignan por módulo." },
    { file: "crm-11-permisos-empleado.png", titulo: "Permisos del perfil Empleado", texto: "Qué se observa: Calendario, Reservas y Chat; sin Empleados, Inventario ni datos de salud." }, 500, 470),
  pageBreak(),
  figurasPar(CAP,
    { file: "crm-12-permisos-recepcion.png", titulo: "Permisos del perfil Recepción", texto: "Qué se observa: acceso a Empleados, Calendario, Inventario, Reservas y Chat, pero sin datos de salud." },
    { file: "crm-13-permisos-admin.png", titulo: "Permisos del perfil Administrador", texto: "Qué se observa: acceso total, incluidos los datos de salud sensibles." }, 500, 470),
  pageBreak(),
  ...figura(CAP, "crm-14-ficha-salud-consentimiento.png", "Ficha de empleado: salud y consentimiento",
    "Qué se observa: la sección “Salud y contacto de emergencia” y la casilla de consentimiento marcada con su fecha de autorización (“Autorizado el 25 sept, 01:03”). Los valores de los campos están difuminados por privacidad.", 560, 500),
  pageBreak(),
  figurasPar(CAP,
    { file: "crm-15-historial-1.png", titulo: "Historial de accesos de una ficha (1)", texto: "Qué se observa: fecha, usuario, acción y detalle del registro de auditoría de la ficha." },
    { file: "crm-16-historial-2.png", titulo: "Historial de accesos de una ficha (2)", texto: "Qué se observa: el mismo registro para otra ficha, con el usuario que ejecutó la acción." }, 480, 300),
  ...figura(CAP, "crm-17-historial-3.png", "Historial de accesos de una ficha (3)",
    "Qué se observa: el registro de creación de una tercera ficha por el usuario administrador.", 520, 200),
  pageBreak(),
  ...figura(CAP, "crm-19-anonimizacion.png", "Confirmación de anonimización al eliminar un empleado",
    "Qué se observa: el aviso previo aclara qué se conserva (nombre, RUT, cargo, fechas y salario, por obligación laboral) y qué se elimina (datos de contacto y de salud), y que la acción no se puede deshacer. Se muestra que se accede por https://192.168.80.10.", 640, 400),
  pageBreak(),
  ...figura(CAP, "crm-20-chat-auditoria.png", "Chat: vista de auditoría del administrador",
    "Qué se observa: “Vista de auditoría: se muestran TODOS los mensajes de todos los usuarios, sin límite de 30 días. Solo visible para administradores”, con filtro por usuario y la lista de mensajes con fecha, remitente, destinatario y contenido. El servidor rechaza con código 403 a quien no sea administrador.", 1000, 480),
];
const sC = [
  h1("Anexo C. Secuencia de autenticación de la carga de trabajo"),
  p("Diagrama de nivel 3 del sistema alojado: el flujo de inicio de sesión y de una llamada autenticada posterior."),
];
const sCa = [
  ...figura(DIA, "03-bajo-nivel-flujo-login.png", "Diagrama de secuencia del inicio de sesión (nivel 3)",
    "Qué se observa: el flujo real de login y de una llamada autenticada posterior. El token JWT permite que cada microservicio valide una solicitud sin depender de auth-service en cada llamada (sin punto único de falla por autenticación).", 1000, 540),
];

verificarFiguras(FIG_KEYS.length);

// ============================================================
// Build document
// ============================================================
const doc = new Document({
  creator: "César Manríquez Figueroa",
  title: "Informe de Práctica Profesional — Arquitectura de Redes y Virtualización en Proxmox para CHIC",
  description: "Puesta en marcha de una arquitectura de redes y virtualización redundante sobre Proxmox VE (caso de uso: CRM Empresarial)",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 21 } },
      heading1: { run: { size: 30, bold: true, color: "0F403C" }, paragraph: { spacing: { before: 240, after: 160 } } },
      heading2: { run: { size: 25, bold: true, color: "1F6F68" }, paragraph: { spacing: { before: 200, after: 120 } } },
      heading3: { run: { size: 22, bold: true, color: "333333" }, paragraph: { spacing: { before: 160, after: 100 } } },
    },
    paragraphStyles: [
      { id: "Caption", name: "Caption", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 20, bold: true, color: "0F403C" },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, keepNext: true } },
      { id: "TableofFigures", name: "table of figures", basedOn: "Normal", next: "Normal", uiPriority: 99,
        run: { size: 18 }, paragraph: { spacing: { before: 0, after: 20, line: 228 } } },
      { id: "Leyenda", name: "Leyenda", basedOn: "Normal", quickFormat: true,
        run: { size: 18, italics: true, color: "555555" },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 160 } } },
    ],
  },
  sections: [
    portraitSection(s1),
    portraitSection(s2),
    portraitSection(s2b),
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
    portraitSection(s14n),
    landscapeSection(s14a),
    portraitSection(s13t),
    landscapeSection(s13a),
    portraitSection([...s14b, ...s15]),
    landscapeSection(s15a),
    portraitSection(s16),
    landscapeSection(s16a),
    portraitSection(s17),
    landscapeSection(s17a),
    portraitSection(s20),
    landscapeSection(s20a),
    portraitSection(s21),
    landscapeSection(s21a),
    portraitSection(s22),
    landscapeSection(s22a),
    portraitSection(s23),
    portraitSection(s24),
    landscapeSection(s24a),
    portraitSection(sB),
    landscapeSection(sBa),
    portraitSection(sC),
    landscapeSection(sCa),
  ],
});

const outFile = process.argv[2] || "Informe_Practica_Profesional_CRM_Empresarial.docx";
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, outFile);
  fs.writeFileSync(out, buf);
  console.log("Escrito:", out, buf.length, "bytes");
});
