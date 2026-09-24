const H = require("./build-informe.js");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Header, Footer, PageNumber, fs, path,
  h1, h2, h3, p, pRich, bold, normal, italic, bullet, numbered, makeTable,
  imageBlock, evidenceImage, pageBreak, codeBlock, TEAL_DARK, RED, AMBER,
} = H;

const children = [];

// ============================================================
// PORTADA
// ============================================================
children.push(
  new Paragraph({ spacing: { before: 1600 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "INFORME DE PRÁCTICA PROFESIONAL", bold: true, size: 30, color: "0F403C" })],
  }),
  new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Diseño, Implementación y Gestión de un CRM Empresarial", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: "con Infraestructura Virtualizada Redundante en Proxmox VE", bold: true, size: 40 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
    children: [new TextRun({ text: "Ingeniería en Conectividad y Redes", size: 24, italics: true, color: "535E5C" })] }),
  new Paragraph({ spacing: { before: 1400 } }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "César Manríquez Figueroa", bold: true, size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "arkno1820@gmail.com", size: 20, color: "535E5C" })] }),
  new Paragraph({ spacing: { before: 800 } }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Repositorio: github.com/arkno1820-arch/crm-empresarial", size: 18, color: "535E5C" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Período del proyecto: 25 de agosto de 2026 — 24 de septiembre de 2026", size: 18, color: "535E5C" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Fecha del informe: 24 de septiembre de 2026", size: 18, color: "535E5C" })] }),
  pageBreak()
);

// ============================================================
// RESUMEN EJECUTIVO
// ============================================================
children.push(h1("Resumen Ejecutivo"));
children.push(p(
  "Este informe documenta el diseño, desarrollo, despliegue y operación de “CRM Empresarial”, " +
  "un sistema de gestión interna construido para una pyme chilena real, y su evolución desde una " +
  "aplicación de microservicios en Docker Compose hasta una infraestructura virtualizada redundante " +
  "sobre Proxmox VE, con alta disponibilidad verificada, HTTPS con autoridad certificadora propia, " +
  "monitoreo activo y una bitácora de doce incidentes reales resueltos durante el despliegue."
));
children.push(p(
  "El proyecto se usa como evidencia de práctica profesional para ocho asignaturas de la carrera " +
  "Ingeniería en Conectividad y Redes: Redes Virtuales, Virtualización, Arquitectura Cloud, Gestión " +
  "de Proyectos, Gestión de Servicios TI (ITIL), Gestión de la Información con TICs, Automatización " +
  "de Redes Corporativas y Diseño y Arquitectura de Redes. El presente documento reconstruye, con " +
  "honestidad metodológica, los artefactos formales de Gestión de Proyectos (Acta de Constitución, " +
  "EDT, cronograma, matriz RACI, registro de riesgos y Valor Ganado) a partir del historial real del " +
  "repositorio de código —no de un caso simulado—, y presenta la arquitectura del sistema en tres " +
  "niveles de abstracción (contexto, contenedores, y flujo de secuencia), además de la arquitectura " +
  "física de virtualización con su plan de redundancia."
));
children.push(p(
  "Resultados clave verificados: 4 máquinas virtuales en producción sobre un servidor físico real " +
  "(Ryzen 7 / 20GB RAM); failover automático de Keepalived medido en menos de 10 segundos sin caída " +
  "visible del servicio; HTTPS sin advertencias en cualquier dispositivo mediante una CA privada propia; " +
  "monitoreo con Uptime Kuma sobre los 6 componentes críticos, todos operativos; y una aplicación " +
  "funcional con 6 microservicios, cifrado de datos sensibles y cumplimiento de la Ley 21.719 de " +
  "Protección de Datos Personales."
));

// ============================================================
// 1. INTRODUCCIÓN
// ============================================================
children.push(h1("1. Introducción"));
children.push(h2("1.1 Contexto y motivación"));
children.push(p(
  "La empresa no contaba con un sistema propio de gestión interna: la administración de empleados, " +
  "calendario, inventario y reservas se hacía de forma manual o dispersa en herramientas genéricas. " +
  "Encargar un sistema a un proveedor externo (SaaS) implicaba costos recurrentes, dependencia de un " +
  "tercero para los datos del personal, y ningún control sobre dónde y cómo se almacena información " +
  "sensible bajo la Ley 21.719 de Protección de Datos Personales, vigente en Chile."
));
children.push(p(
  "Desde la perspectiva académica, el proyecto se planteó además como el vehículo para demostrar, con " +
  "evidencia real y no simulada, las competencias de ocho asignaturas de la carrera —en particular " +
  "aquellas ligadas a virtualización, redes y automatización, que no estaban cubiertas por trabajos " +
  "académicos previos (a diferencia de Arquitectura Cloud, ya certificada por un examen transversal " +
  "independiente sobre AWS)."
));
children.push(h2("1.2 Objetivos"));
children.push(bullet("Diseñar y construir una aplicación CRM funcional, modular (microservicios), con seguridad de acceso por roles y cumplimiento de la normativa chilena de protección de datos."));
children.push(bullet("Desplegar el sistema en infraestructura propia virtualizada, sin depender de un proveedor cloud, demostrando administración real de un hipervisor y de redes virtuales."));
children.push(bullet("Diseñar e implementar un esquema de redundancia (borde y núcleo) que tolere fallas de software/VM sin intervención manual, y verificarlo con una prueba de falla real, no solo documentada."));
children.push(bullet("Instrumentar monitoreo activo de los componentes críticos del sistema."));
children.push(bullet("Gestionar el proyecto con las herramientas formales de Gestión de Proyectos (EDT, cronograma, RACI, riesgos, valor ganado), aplicadas retroactivamente sobre el trabajo real ya ejecutado."));
children.push(h2("1.3 Alcance"));
children.push(p(
  "El alcance cubre: el desarrollo completo de la aplicación (backend de 6 microservicios + gateway + " +
  "frontend), la infraestructura como código (Terraform) y de configuración (Ansible) para desplegarla " +
  "de forma redundante en Proxmox, la seguridad de transporte (HTTPS con CA privada) y de aplicación " +
  "(cifrado, auditoría), el monitoreo, y la documentación de gestión de proyecto. Queda explícitamente " +
  "fuera de alcance —y así se declara, sin forzar evidencia donde no corresponde— el respaldo offsite en " +
  "la nube (en pausa, decisión del responsable del proyecto) y la migración en vivo entre servidores " +
  "físicos (requiere un segundo servidor que la empresa está en vías de adquirir)."
));

children.push(pageBreak());

// ============================================================
// 2. MARCO ACADÉMICO
// ============================================================
children.push(h1("2. Marco Académico: Justificación por Asignatura"));
children.push(p(
  "La siguiente tabla resume, para cada una de las ocho asignaturas identificadas como relevantes, el " +
  "grado de cobertura que este proyecto ofrece como evidencia de práctica profesional. La calificación " +
  "no es autocomplaciente: donde el proyecto no calza con el contenido de una asignatura (por ejemplo, " +
  "protocolos de red de dispositivos físicos Cisco en Automatización de Redes Corporativas), se declara " +
  "explícitamente en vez de forzar una relación artificial."
));

const acadRows = [
  ["Redes Virtuales\n(CR404CICRE)", "Fuerte", "VMs/hipervisor/SDN, Docker, API REST. Git/GitHub y Ansible resueltos como evidencia (repositorio real con historial preservado; roles crm_edge/crm_core corriendo desde crm-edge como control node)."],
  ["Virtualización\n(CR401ICRE)", "Fuerte", "Dos tecnologías de virtualización en la misma pila (VMware anida a Proxmox/KVM), VLANs y segmentación de redes virtuales (vmbr1), asignación de recursos por VM. Migración en vivo: documentada honestamente como no viable con un solo host físico (RA de verbo “comprende/explica”, no “implementa”)."],
  ["Arquitectura Cloud\n(IF304CIINF)", "Ya resuelto", "Cubierto al 100% por el Examen Transversal ya rendido (caso RetailPlus LATAM, AWS Academy + Terraform). No se repite evidencia redundante sobre este proyecto."],
  ["Gestión de Proyectos\n(IF405IINF)", "Cubierto en este informe", "Acta de Constitución, EDT, cronograma real, matriz RACI, registro de riesgos y Valor Ganado (EVM), todos construidos a partir del historial real del repositorio —no de un caso ficticio— en la sección 5 de este documento."],
  ["Gestión de Servicios TI — ITIL\n(CR304ICRE)", "Fuerte", "La bitácora de 12 incidentes reales (sección 6) es evidencia genuina de gestión de incidentes/problemas/cambios. El monitoreo con Uptime Kuma cubre el requisito de supervisión, SLA y métricas."],
  ["Gestión de la Información con TICs\n(AS300PCOM)", "Parcial", "Calza en comparación de plataformas cloud y en seguridad/protección de datos según marco legal (Ley 21.719). El resto del programa (IA, IoT, redes sociales) no aplica a un proyecto de infraestructura —no se fuerza."],
  ["Automatización de Redes Corporativas\n(CR303CICRE)", "El más débil", "Contenido orientado a multicast/QoS/GRE/IPsec de routers físicos Cisco, no aplicable a una red de bridges virtuales. Su único punto de contacto real (Ansible) ya está contabilizado en Redes Virtuales."],
  ["Diseño y Arquitectura de Redes\n(CR301ICRE)", "Uno de los más fuertes", "El estándar FCAPS mapea con los 5 pilares cubiertos: Fault (bitácora), Configuration (Git/Terraform/Ansible), Accounting (RBAC), Security (HTTPS/CA privada/cifrado) y Performance (Uptime Kuma). Diagrama topológico actualizado incluido en este informe."],
];
children.push(makeTable([2400, 1400, 6000], ["Asignatura", "Cobertura", "Justificación"], acadRows));

children.push(pageBreak());

// ============================================================
// 3. ARQUITECTURA DEL SISTEMA
// ============================================================
children.push(h1("3. Arquitectura del Sistema"));
children.push(p(
  "La arquitectura se presenta en tres niveles de abstracción —inspirados en el modelo C4 de " +
  "documentación de software—, seguidos de la vista física de infraestructura sobre Proxmox. Cada " +
  "nivel responde una pregunta distinta: qué es el sistema (contexto), de qué módulos está hecho " +
  "(contenedores), y cómo fluye una operación concreta dentro de él (secuencia)."
));

children.push(h2("3.1 Nivel 1 — Diagrama de Contexto"));
children.push(p("Quiénes usan el sistema y con qué otros sistemas interactúa, sin entrar en detalle técnico."));
children.push(...imageBlock("01-alto-nivel-contexto.png", 1000, 650, "Figura 1. Diagrama de contexto del CRM Empresarial."));

children.push(h2("3.2 Nivel 2 — Diagrama de Módulos / Contenedores"));
children.push(p(
  "Los 9 contenedores Docker que componen la aplicación, con el patrón “database per service”: cada " +
  "microservicio es dueño exclusivo de su base de datos lógica dentro de una única instancia PostgreSQL."
));
children.push(...imageBlock("02-modulos-docker.png", 1100, 800, "Figura 2. Módulos Docker de la aplicación CRM Empresarial."));

children.push(h2("3.3 Nivel 3 — Diagrama de Secuencia (flujo de autenticación)"));
children.push(p(
  "El flujo real de un login y una llamada autenticada posterior, mostrando cómo el token JWT permite " +
  "que cada microservicio valide una solicitud sin volver a consultar a auth-service en cada llamada."
));
children.push(...imageBlock("03-bajo-nivel-flujo-login.png", 1000, 730, "Figura 3. Secuencia de login y llamada autenticada, sobre el despliegue real en Proxmox."));

children.push(h2("3.4 Vista física — Infraestructura de virtualización en Proxmox"));
children.push(p(
  "La aplicación descrita arriba no corre en un contenedor suelto: vive dentro de una arquitectura " +
  "redundante de 4 máquinas virtuales sobre un servidor físico real. El par de borde (crm-edge / " +
  "crm-edge-b) es redundante mediante Keepalived/VRRP con una IP virtual; el par de núcleo (crm-core / " +
  "crm-core-b) ejecuta la aplicación completa con réplica periódica de la base de datos."
));
children.push(...imageBlock("04-infraestructura-proxmox.png", 1200, 910, "Figura 4. Arquitectura de virtualización y redundancia sobre Proxmox VE."));

children.push(pageBreak());

// ============================================================
// 4. DECISIONES DE ARQUITECTURA
// ============================================================
children.push(h1("4. Decisiones de Arquitectura (resumen de ADRs)"));

const adrs = [
  ["ADR-01", "Proxmox local en vez de un proveedor cloud", "La competencia de nube ya estaba certificada por un examen independiente. Administrar un hipervisor real y diseñar redes virtuales propias era el vacío genuino que llenar, más alineado además con el nombre de la carrera (“Conectividad y Redes”)."],
  ["ADR-02", "Redundancia activa-pasiva (no clúster de alta disponibilidad)", "Con un solo servidor físico, un clúster Proxmox multi-nodo o la migración en vivo real no son alcanzables. Se optó por redundancia a nivel de VM (Keepalived + réplica de Postgres), documentando honestamente su techo: protege contra fallas de software, no contra la falla del servidor físico completo."],
  ["ADR-03", "Promoción de base de datos manual, no automática", "Automatizar de forma segura la promoción de un primario de base de datos exige resolver split-brain, un problema no trivial que no se justifica a esta escala (una pyme, un solo servidor). Se documentó un runbook de promoción manual en vez de una automatización a medias."],
  ["ADR-04", "NAT de solo salida para el núcleo, no aislamiento total", "El diseño original planteaba “sin salida a Internet” para crm-core. Al desplegar, Ansible necesitaba instalar Docker y clonar el repositorio, ambos requieren Internet. Se distinguió aislamiento de entrada (se mantiene: nadie de la LAN llega a crm-core) de aislamiento de salida (se relaja de forma controlada vía NAT), preservando la propiedad de seguridad que realmente importa."],
  ["ADR-05", "CA privada en vez de certificados autofirmados sueltos", "Un certificado autofirmado por VM seguía mostrando advertencia de “no seguro” en cualquier dispositivo. Se construyó una autoridad certificadora propia, cuya llave privada nunca sale del equipo del responsable, permitiendo instalarla una sola vez por dispositivo y confiar automáticamente en cualquier certificado futuro que ella firme."],
  ["ADR-06", "Monitoreo nativo (Node.js) en vez de contenedorizado", "Uptime Kuma vive en crm-edge sin Docker, manteniendo el principio de diseño de esa VM (bastión liviano, sin Docker) y aprovechando que es la única VM con visibilidad simultánea hacia la LAN y hacia la red interna del núcleo."],
];
children.push(makeTable([1200, 3200, 5400], ["ID", "Decisión", "Justificación"], adrs));

children.push(pageBreak());

// ============================================================
// 5. GESTIÓN DE PROYECTOS
// ============================================================
children.push(h1("5. Gestión de Proyectos"));
children.push(p(
  "Esta sección aplica retroactivamente las herramientas formales de gestión de proyectos sobre el " +
  "trabajo real ya ejecutado, documentado en el historial de commits del repositorio de código. A " +
  "diferencia de un caso de estudio simulado, las fechas, hitos y riesgos aquí presentados corresponden " +
  "a hechos verificables (`git log`, marcas de tiempo de archivos), lo que da a este ejercicio un valor " +
  "pedagógico distinto: incluye la incertidumbre y el sobrecosto real de un proyecto de infraestructura, " +
  "no una planificación idealizada."
));

children.push(h2("5.1 Acta de Constitución del Proyecto (Project Charter)"));
const charterRows = [
  ["Nombre del proyecto", "CRM Empresarial con Despliegue Redundante en Infraestructura Propia"],
  ["Patrocinador", "Empresa pyme (usuario final del sistema)"],
  ["Responsable del proyecto", "César Manríquez Figueroa (desarrollador / DevOps)"],
  ["Fecha de inicio", "25 de agosto de 2026"],
  ["Fecha de cierre de esta fase", "24 de septiembre de 2026"],
  ["Justificación", "La empresa carecía de un sistema propio de gestión interna y requería cumplir la Ley 21.719 sobre datos de empleados sin depender de un proveedor externo."],
  ["Objetivo 1", "Desarrollar un CRM funcional con 6 módulos de negocio, cumpliendo la normativa de protección de datos, en un plazo acotado."],
  ["Objetivo 2", "Desplegarlo en infraestructura propia virtualizada con redundancia activa-pasiva verificada mediante una prueba de falla real."],
  ["Objetivo 3", "Instrumentar monitoreo activo sobre el 100% de los componentes críticos del sistema."],
  ["Entregables", "Código fuente; infraestructura como código (Terraform/Ansible); documentación técnica y académica; este informe."],
  ["Restricciones", "Presupuesto $0 (proyecto de práctica, sin financiamiento); un solo desarrollador; hardware inicialmente insuficiente (pivote a mitad de proyecto)."],
  ["Supuestos", "Disponibilidad continua del servidor físico (Ryzen 7/20GB) como host de Proxmox; conectividad a Internet estable."],
  ["Interesados (stakeholders)", "César (responsable técnico), la empresa (usuaria final), la institución académica (evaluadora de la práctica)."],
];
children.push(makeTable([2600, 6800], ["Campo", "Contenido"], charterRows));

children.push(h2("5.2 Estructura de Desglose del Trabajo (EDT / WBS)"));
const edt = [
  "1. CRM Empresarial",
  "  1.1 Aplicación (producto de software)",
  "    1.1.1 Núcleo funcional (autenticación, gateway, frontend base, RBAC)",
  "    1.1.2 Módulos de negocio (calendario, inventario, reservas)",
  "    1.1.3 Seguridad y cumplimiento (cifrado de datos, auditoría, Ley 21.719, chat interno)",
  "  1.2 Infraestructura de virtualización",
  "    1.2.1 Decisión de plataforma (nube vs. servidor local)",
  "    1.2.2 Resolución de restricciones de hardware",
  "    1.2.3 Automatización con Terraform (IaC)",
  "    1.2.4 Configuración con Ansible",
  "    1.2.5 Diseño e implementación de redundancia (Keepalived, réplica de Postgres)",
  "  1.3 Seguridad de acceso",
  "    1.3.1 HTTPS con autoridad certificadora privada",
  "  1.4 Operaciones",
  "    1.4.1 Monitoreo (Uptime Kuma)",
  "    1.4.2 Prueba de resiliencia (failover real)",
  "    1.4.3 Corrección de incidentes de despliegue (12 documentados)",
  "  1.5 Documentación y gestión",
  "    1.5.1 Documentación técnica (READMEs, síntesis académica)",
  "    1.5.2 Documentación de gestión de proyectos (este informe)",
];
edt.forEach(line => {
  const indent = (line.match(/^\s*/)[0].length / 2) * 300;
  children.push(new Paragraph({ indent: { left: indent }, spacing: { after: 60 },
    children: [new TextRun({ text: line.trim(), size: 20 })] }));
});

children.push(h2("5.3 Cronograma real (Gantt)"));
children.push(p("Construido a partir de las fechas reales de commits y de modificación de archivos en el repositorio —no es un cronograma estimado a posteriori."));
children.push(...imageBlock("05-cronograma-gantt.png", 1050, 500, "Figura 5. Cronograma real del proyecto, 7 fases, 25 de agosto al 24 de septiembre de 2026."));

children.push(h2("5.4 Matriz de Responsabilidades (RACI)"));
const raciRows = [
  ["Definición de requisitos", "R / A", "C", "—", "—"],
  ["Desarrollo de microservicios", "R / A", "—", "—", "C"],
  ["Diseño de arquitectura de infraestructura", "A", "—", "I", "R"],
  ["Implementación Terraform / Ansible", "A", "—", "—", "R"],
  ["Pruebas de failover y validación", "R / A", "—", "—", "C"],
  ["Documentación académica", "A", "—", "—", "R"],
  ["Aprobación de la práctica profesional", "I", "—", "A", "—"],
  ["Uso diario del CRM", "I", "R", "—", "—"],
];
children.push(makeTable([3000, 1600, 1600, 1600, 1600],
  ["Actividad", "César (Dev/DevOps)", "Empresa (Patrocinador)", "Institución (Evaluador)", "Asistente de IA (herramienta)"],
  raciRows));
children.push(p("R = Responsable de ejecutar · A = Aprueba / rinde cuentas · C = Consultado · I = Informado.", { italics: true, size: 18, color: "666666" }));
children.push(p(
  "Nota metodológica: se incluye “Asistente de IA” como columna propia porque fue una herramienta de " +
  "apoyo real y activo durante la implementación (generación de código de infraestructura, depuración " +
  "de incidentes, redacción de documentación) —omitirlo sería inexacto respecto a cómo se ejecutó el " +
  "proyecto—, pero nunca tuvo responsabilidad de aprobación: toda decisión de arquitectura o seguridad " +
  "(la CA privada, el NAT de solo salida, la redundancia) fue revisada y autorizada explícitamente por " +
  "el responsable humano del proyecto antes de implementarse."
));

children.push(pageBreak());

children.push(h2("5.5 Registro de Riesgos"));
children.push(p("Los primeros ocho riesgos ya se materializaron durante el despliegue (ver bitácora de incidentes, sección 6) y se documentan aquí con su probabilidad e impacto originales, no ajustados a posteriori. Los últimos tres son riesgos abiertos, vigentes a la fecha de este informe."));

const riskRows = [
  ["R1", "Hardware insuficiente para el diseño de virtualización planeado", "Alta", "Alto", "Materializado", "Pivote de arquitectura (laptop→LXC→PC de escritorio con VMs reales)"],
  ["R2", "Conflicto de virtualización VT-x entre Docker Desktop y Proxmox", "Media", "Alto", "Materializado", "Retiro de Docker Desktop del host físico; Hyper-V desactivado"],
  ["R3", "DNS heredado roto en la plantilla base del proveedor de laboratorio", "Media", "Medio", "Materializado", "DNS explícito vía cloud-init; resolv.conf estático donde el stub fallaba"],
  ["R4", "Disco de plantilla insuficiente para instalar paquetes", "Media", "Medio", "Materializado", "Bloque disk en Terraform + growpart/resize2fs"],
  ["R5", "Aislamiento de red total incompatible con el aprovisionamiento remoto", "Alta", "Alto", "Materializado", "NAT de solo salida en el host Proxmox, entrada sigue bloqueada"],
  ["R6", "Dependencia fuera de los repositorios base del sistema operativo", "Media", "Bajo", "Materializado", "Repositorio oficial de Docker agregado al rol Ansible"],
  ["R7", "Uso de una rama de desarrollo en una dependencia externa", "Baja", "Alto", "Materializado", "Versión de Uptime Kuma fijada a un release estable"],
  ["R8", "Configuración de runtime específica de un entorno no portada a otro", "Media", "Alto", "Materializado", "Generación de config.js vía Ansible para el entorno de VM"],
  ["R9", "Punto único de falla del servidor físico completo", "Media", "Crítico", "Abierto", "Segundo servidor físico en adquisición por la empresa (plan externo al proyecto)"],
  ["R10", "Pérdida total de datos sin respaldo offsite", "Baja (corto plazo)", "Alto", "Abierto — en pausa", "Arquitectura acordada (bastión SSH hacia Oracle Cloud), implementación pausada a petición del responsable"],
  ["R11", "Compromiso de la llave privada de la CA interna", "Baja", "Crítico", "Abierto — mitigado por diseño", "La llave nunca sale del equipo del responsable; nunca se copia a ninguna VM"],
];
children.push(makeTable([700, 2600, 1100, 1000, 1400, 2400],
  ["ID", "Riesgo", "Prob.", "Impacto", "Estado", "Mitigación"], riskRows));

children.push(pageBreak());

children.push(h2("5.6 Valor Ganado (EVM) y Curva S"));
children.push(p(
  "El proyecto no contó con registro exacto de horas trabajadas (es una limitación real y se declara " +
  "como tal, no se inventa precisión que no existe). Las horas por fase presentadas a continuación son " +
  "una aproximación construida por el responsable del proyecto a partir de la complejidad observada de " +
  "cada fase y la duración calendario real, con fines de aplicar el análisis de Valor Ganado exigido " +
  "por la asignatura de Gestión de Proyectos."
));
children.push(...imageBlock("06-curva-s-evm.png", 900, 580, "Figura 6. Curva S de Valor Ganado por fase del proyecto."));
children.push(p(
  "Lectura de los indicadores: el SPI (Schedule Performance Index) de 1.00 indica que el 100% del " +
  "alcance planificado se completó dentro de las fases previstas. El CPI (Cost Performance Index) de " +
  "0.84 indica que el esfuerzo real fue aproximadamente 19% mayor al estimado — atribuible " +
  "directamente a la Fase 4 (pivote de infraestructura) y a la Fase 6 (despliegue real, donde se " +
  "encontraron y resolvieron los 12 incidentes de la bitácora). Este es precisamente el valor " +
  "pedagógico de medir un proyecto real en vez de uno simulado: un CPI menor a 1 en un proyecto de " +
  "infraestructura, causado por depuración real de fallas, es un resultado normal y esperable, no una " +
  "falla de planificación."
));

children.push(h2("5.7 Lecciones Aprendidas"));
children.push(bullet("Fijar versiones siempre en infraestructura como código: un `git clone` sin restricción de versión reintrodujo una rama de desarrollo distinta a la ya compilada y rompió un servicio que ya funcionaba (incidente 9)."));
children.push(bullet("Las imágenes base de un proveedor de laboratorio pueden traer configuración residual (DNS, dominios de búsqueda) que no es evidente hasta que falla —nunca asumir que una plantilla “oficial” está limpia."));
children.push(bullet("Un diseño de seguridad de “cero salida” debe validarse contra el flujo operativo real (¿cómo se instalan actualizaciones? ¿cómo se clona el código?) antes de implementarse, no después."));
children.push(bullet("Reconocer a tiempo que el hardware no alcanza para el diseño planeado, y pivotar la arquitectura, es más valioso que insistir en sobre-optimizar sobre una base insuficiente."));
children.push(bullet("La asistencia de IA acelera genuinamente la implementación de infraestructura y la depuración, pero las decisiones de seguridad y arquitectura deben mantenerse bajo revisión y autorización humana explícita en cada paso."));

children.push(pageBreak());

// ============================================================
// 6. IMPLEMENTACIÓN
// ============================================================
children.push(h1("6. Implementación Técnica"));

children.push(h2("6.1 Infraestructura como Código (Terraform)"));
children.push(p(
  "El módulo `infra/proxmox-terraform/` automatiza por completo, contra la API REST de Proxmox " +
  "(proveedor `bpg/proxmox` para Terraform), la creación de la red interna `vmbr1` y las 4 máquinas " +
  "virtuales, cada una clonada desde una plantilla cloud-init común. Reemplaza enteramente los pasos " +
  "manuales de creación de VMs por consola web que documentaba la guía original del proyecto."
));
children.push(h3("6.1.1 Estructura del módulo"));
children.push(bullet("`providers.tf` — declara el proveedor `bpg/proxmox` y las credenciales de conexión a la API."));
children.push(bullet("`variables.tf` — parámetros configurables: IPs, gateway, token de API, tamaño de la plantilla."));
children.push(bullet("`network.tf` — define el bridge interno `vmbr1` (10.10.10.1/24), sin puerto físico asociado."));
children.push(bullet("`vms.tf` — define los 4 recursos `proxmox_virtual_environment_vm`, uno por máquina virtual."));
children.push(bullet("`outputs.tf` — expone las IPs y la URL de acceso final una vez aplicado."));
children.push(bullet("`terraform.tfvars` — valores reales de esta instalación (token, IPs); explícitamente excluido de git por seguridad."));

children.push(h3("6.1.2 Ejemplo real: definición de crm-edge"));
children.push(p("Extracto real de `vms.tf`, mostrando el patrón de clonación desde plantilla, doble interfaz de red, disco redimensionado y DNS explícito (ver incidente 6):"));
children.push(codeBlock([
  'resource "proxmox_virtual_environment_vm" "crm_edge" {',
  '  name      = "crm-edge"',
  '  node_name = var.proxmox_node',
  '',
  '  clone {',
  '    vm_id = var.template_vm_id',
  '    full  = true',
  '  }',
  '',
  '  cpu    { cores = 2 }',
  '  memory { dedicated = 2048 }',
  '',
  '  disk {',
  '    datastore_id = "local-lvm"',
  '    interface    = "scsi0"',
  '    size         = 8',
  '  }',
  '',
  '  network_device { bridge = "vmbr0" }  # hacia la LAN',
  '  network_device { bridge = "vmbr1" }  # hacia crm-core',
  '',
  '  initialization {',
  '    dns { servers = ["8.8.8.8", "1.1.1.1"] }',
  '    ip_config { ipv4 { address = var.crm_edge_lan_ip, gateway = var.lan_gateway } }',
  '    ip_config { ipv4 { address = "10.10.10.2/24" } }',
  '    user_account { username = "cesar", keys = [var.ssh_public_key] }',
  '  }',
  '}',
]));

children.push(h3("6.1.3 Ejecución real contra el Proxmox físico"));
children.push(p("Salida real de `terraform apply`, ejecutado contra la API del servidor Proxmox (192.168.1.147):"));
children.push(codeBlock([
  "Terraform used the selected providers to generate the following execution plan.",
  "  # proxmox_virtual_environment_network_linux_bridge.internal will be created",
  "  # proxmox_virtual_environment_vm.crm_core will be created",
  "  # proxmox_virtual_environment_vm.crm_core_b will be created",
  "  # proxmox_virtual_environment_vm.crm_edge will be created",
  "  # proxmox_virtual_environment_vm.crm_edge_b will be created",
  "",
  "Plan: 5 to add, 0 to change, 0 to destroy.",
  "...",
  "proxmox_virtual_environment_vm.crm_edge: Creation complete after 6m40s [id=103]",
  "",
  "Apply complete! Resources: 5 added, 0 changed, 0 destroyed.",
  "",
  "Outputs:",
  'crm_edge_vip = "Accede al CRM desde tu LAN en: http://192.168.1.62"',
]));
children.push(p("Estado real de `terraform state list` al momento de este informe (los 5 recursos siguen bajo control de Terraform, no fueron creados a mano por fuera):"));
children.push(codeBlock([
  "proxmox_virtual_environment_network_linux_bridge.internal",
  "proxmox_virtual_environment_vm.crm_core",
  "proxmox_virtual_environment_vm.crm_core_b",
  "proxmox_virtual_environment_vm.crm_edge",
  "proxmox_virtual_environment_vm.crm_edge_b",
]));

children.push(h3("6.1.4 Inventario real de las 4 VMs (consultado vía API de Proxmox)"));
const vmInventory = [
  ["100", "crm-core-b", "running", "4 vCPU", "6 GB", "25 GB"],
  ["101", "crm-core", "running", "4 vCPU", "6 GB", "25 GB"],
  ["102", "crm-edge-b", "running", "2 vCPU", "2 GB", "8 GB"],
  ["103", "crm-edge", "running", "2 vCPU", "2 GB", "8 GB"],
];
children.push(makeTable([900, 1800, 1400, 1400, 1400, 1400],
  ["VMID", "Nombre", "Estado", "CPU", "RAM", "Disco"], vmInventory));
children.push(p(
  "Total de RAM asignada a las 4 VMs: 16GB, sobre un host físico de 20GB — margen suficiente para el " +
  "propio Proxmox y el sistema operativo base. Almacenamiento sobre `local-lvm`, thin-provisioned " +
  "(31.9GB físicos totales), lo que permite asignar más espacio virtual del que se usa realmente.",
  { italics: true, size: 18, color: "666666" }
));

children.push(h3("6.1.5 Segundo apply real: ajuste de DNS y disco"));
children.push(p(
  "Es importante documentar que el primer `apply` no fue perfecto ni quedó estático: al detectarse el " +
  "incidente 6 (DNS heredado) y el incidente 7 (disco insuficiente), se modificó `vms.tf` agregando los " +
  "bloques `dns` y `disk`, y se corrió un segundo `terraform apply` —esta vez como actualización en " +
  "caliente (`updated in-place`), sin destruir ni recrear ninguna VM. Esto demuestra en la práctica una " +
  "propiedad central de Terraform: el plan de ejecución distingue automáticamente entre cambios que " +
  "requieren recrear un recurso y cambios que solo requieren actualizarlo, minimizando el riesgo de la " +
  "operación."
));
children.push(codeBlock([
  "  # proxmox_virtual_environment_vm.crm_edge will be updated in-place",
  "  ~ resource \"proxmox_virtual_environment_vm\" \"crm_edge\" {",
  "        id   = \"103\"",
  "      ~ initialization {",
  "          + dns { servers = [\"8.8.8.8\", \"1.1.1.1\"] }",
  "        }",
  "    }",
  "",
  "Plan: 0 to add, 4 to change, 0 to destroy.",
  "Apply complete! Resources: 0 added, 4 changed, 0 destroyed.",
]));

children.push(h2("6.2 Configuración (Ansible)"));
children.push(p("El módulo `infra/ansible/` configura cada VM desde adentro: Nginx y Keepalived en el par de borde; Docker, el stack completo del CRM y la réplica de Postgres en el par de núcleo; Uptime Kuma en `crm-edge`. Se ejecuta desde `crm-edge` mismo, que actúa como nodo de control y bastión único de administración, dado que Ansible no corre nativamente en Windows sin WSL."));

children.push(h2("6.3 HTTPS con Autoridad Certificadora Privada"));
children.push(p("En vez de certificados autofirmados sueltos por VM, se construyó una CA propia: su llave privada nunca sale del equipo del responsable ni se copia a ninguna VM. El certificado de `crm-edge`, firmado por esa CA, cubre como SAN la IP virtual y ambas IPs del par de borde. El certificado raíz se sirve en `/ca.crt` con el tipo MIME correcto para que cualquier dispositivo lo instale con un clic."));
children.push(p("Comandos reales de creación de la CA y del certificado de hoja:"));
children.push(codeBlock([
  "# Raiz de la CA (10 anios, se queda solo en el equipo del responsable)",
  "openssl genrsa -out ca.key 4096",
  "openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 \\",
  '  -subj "/CN=CRM Empresarial - CA Interna/O=CRM Empresarial" \\',
  '  -addext "basicConstraints=critical,CA:TRUE" \\',
  '  -addext "keyUsage=critical,keyCertSign,cRLSign" -out ca.crt',
  "",
  "# Certificado de crm-edge, firmado por la CA (2 anios, SAN = VIP + ambos nodos)",
  "openssl x509 -req -in crm-edge.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\",
  "  -days 730 -sha256 -extfile crm-edge.ext -out crm-edge.crt",
]));
children.push(p("Verificación real, inspeccionando el certificado que efectivamente sirve la IP virtual del sistema en producción:"));
children.push(...evidenceImage("2026-09-23-08-detalle-certificado-ca.png", "Figura 7. Detalle del certificado servido por https://192.168.1.62 — Emitido a 192.168.1.62, proporcionado por “CRM Empresarial - CA Interna”."));
children.push(...evidenceImage("2026-09-23-09-candado-conexion-segura.png", "Figura 8. Candado verde y “La conexión es segura” en el navegador Edge, sin ninguna advertencia, tras instalar la CA privada."));

children.push(h2("6.4 Monitoreo (Uptime Kuma)"));
children.push(p("Instalado nativo (Node.js, sin Docker) en `crm-edge`, con 6 monitores activos cubriendo: la IP virtual, ambos nodos de borde, ambos nodos de núcleo, y PostgreSQL. Los monitores HTTPS validan el certificado de la CA privada sin advertencias."));

children.push(pageBreak());

// ============================================================
// 7. BITÁCORA DE INCIDENTES
// ============================================================
children.push(h1("7. Bitácora de Incidentes Reales"));
children.push(p("Doce incidentes reales, encontrados y resueltos durante el desarrollo y el despliegue —evidencia auténtica de gestión de incidentes para las asignaturas de Gestión de Servicios TI (ITIL) y Gestión de Proyectos."));

const incidents = [
  ["1", "Caché de DNS del gateway Nginx", "Nginx seguía resolviendo IPs viejas tras reconstruir contenedores.", "`resolver 127.0.0.11 valid=10s;` + variables dinámicas en proxy_pass."],
  ["2", "Confianza cruzada de certificados HTTPS", "El navegador debía confiar por separado en el certificado del gateway y del frontend.", "Documentado el orden correcto de aceptación en la biblia de respaldo."],
  ["3", "Migración de cifrado silenciosamente no aplicada", "SQLAlchemy no detectaba cambios al reasignar el mismo valor a un campo cifrado.", "`flag_modified` de sqlalchemy.orm.attributes."],
  ["4", "Restricción de hardware", "La laptop inicial no alcanzaba para el diseño de virtualización planeado.", "Pivote de arquitectura documentado, no tratado como error."],
  ["5", "Conflicto VT-x entre Docker Desktop y Proxmox", "Ambos compiten por el mismo recurso de virtualización de hardware.", "Retiro de Docker Desktop del host físico; Hyper-V desactivado."],
  ["6", "DNS roto heredado de la plantilla base", "nameserver inválido y dominio de búsqueda ajeno en el host Proxmox y en las 4 VMs.", "DNS explícito (8.8.8.8/1.1.1.1) vía cloud-init y resolv.conf estático."],
  ["7", "Disco de la plantilla insuficiente (2GB)", "Síntoma engañoso de “cuelgue de red”; la causa real era “no space left on device”.", "Bloque disk en Terraform (8GB/25GB) + growpart/resize2fs."],
  ["8", "Aislamiento total de crm-core incompatible con el aprovisionamiento", "Ansible necesita Internet para instalar Docker y clonar el repositorio.", "NAT de solo salida en el host Proxmox; la entrada sigue bloqueada."],
  ["9", "docker-compose-plugin fuera de los repositorios base de Ubuntu", "El paquete solo existe en el repositorio oficial de Docker.", "Repositorio oficial de Docker agregado antes de instalar."],
  ["10", "git clone sobre directorio no vacío", "El .env se copiaba antes de clonar, dejando el directorio no vacío.", "Orden corregido: clonar primero, copiar .env/certificados después."],
  ["11", "Permisos de $HOME bloqueaban a Nginx", "/home/cesar en 750 por defecto; Nginx (www-data) no podía atravesarlo.", "`chmod o+x /home/cesar` en ambos nodos de borde."],
  ["12", "Login roto: “Failed to fetch”", "El frontend asumía un puerto de gateway separado (8443) inexistente en crm-edge.", "Generación de frontend/js/config.js vía Ansible con el puerto real (443)."],
];
children.push(makeTable([500, 2400, 3200, 2900], ["#", "Incidente", "Causa raíz", "Resolución"], incidents));

children.push(pageBreak());

// ============================================================
// 8. PRUEBAS Y VERIFICACIÓN
// ============================================================
children.push(h1("8. Pruebas y Verificación"));
children.push(h2("8.1 Prueba de failover real de Keepalived"));
children.push(p("Ejecutada el 23 de septiembre de 2026 contra la infraestructura real, con apagado abrupto (no un shutdown ordenado) para simular una falla real:"));
children.push(bullet("19:03:40 — se apaga crm-edge de golpe, mientras sostenía la IP virtual (192.168.1.62)."));
children.push(bullet("19:03:50 — la IP virtual ya respondía 200 OK, ahora servida por crm-edge-b. Sin caída visible del servicio."));
children.push(bullet("19:04:37 — se enciende crm-edge de nuevo."));
children.push(bullet("Al terminar de bootear, crm-edge reclamó automáticamente la IP virtual (prioridad 150 vs. 100) y crm-edge-b la soltó — sin intervención manual en ningún punto."));

children.push(h2("8.2 Verificación de HTTPS con CA privada"));
children.push(p("Confirmado con `curl --cacert` (validación real de la cadena de confianza, sin desactivar la verificación) y visualmente en el navegador Edge del responsable del proyecto: candado verde, “La conexión es segura”, sin advertencias, tras instalar la CA en el almacén de confianza de Windows."));

children.push(h2("8.3 Verificación de monitoreo"));
children.push(p("6 monitores activos en Uptime Kuma, todos con 100% de disponibilidad al momento de este informe: IP virtual VRRP, borde activo, borde en espera, núcleo activo, núcleo réplica, y PostgreSQL."));

children.push(pageBreak());

children.push(h2("8.4 Prueba de failover real del núcleo (crm-core → crm-core-b)"));
children.push(p(
  "A diferencia del par de borde (failover automático vía Keepalived), la promoción del núcleo es " +
  "deliberadamente manual (ver ADR-03). Esta prueba, ejecutada el 24 de septiembre de 2026 contra la " +
  "infraestructura real, valida que el runbook de promoción documentado en `infra/ansible/README.md` " +
  "funciona en la práctica, no solo en el papel."
));
children.push(bullet("21:23:00 — se apaga crm-core de golpe (apagado abrupto vía la API de Proxmox, simulando una falla real de la VM activa)."));
children.push(bullet("Verificación del estado roto: la API del CRM, accedida a través de la IP virtual, responde 502 Bad Gateway — Nginx en crm-edge sigue apuntando al núcleo caído (10.10.10.10)."));
children.push(...evidenceImage("2026-09-24-05-core-caido-502.png", "Figura 9. 502 Bad Gateway al intentar usar la API del CRM inmediatamente después de apagar crm-core — el estado “roto” antes de la promoción manual."));
children.push(bullet("21:25:00 — se ejecuta la promoción manual: se cambia `crm_core_ip` de 10.10.10.10 a 10.10.10.11 en `group_vars/all.yml` (en el nodo de control, crm-edge) y se vuelve a correr `ansible-playbook playbook.yml --limit crm_edge`, que regenera la configuración de Nginx y la recarga."));
children.push(bullet("Verificación post-promoción: la misma URL de la API, sin ningún otro cambio del lado del cliente, vuelve a responder 200 OK (confirmado con `curl`) — ahora servida por crm-core-b, la réplica pasiva."));
children.push(...evidenceImage("2026-09-24-06-servido-por-core-b.png", "Figura 10. El navegador vuelve a recibir respuesta del backend tras la promoción (Swagger UI ya no muestra un error de conexión, sino un error propio de renderizado por el timing de la captura automática — el 200 OK exacto se confirmó por línea de comandos, ver texto)."));
children.push(p(
  "Cierre de la prueba: se volvió a encender crm-core, se esperó a que los 9 contenedores de Docker " +
  "terminaran de levantar, se revirtió `crm_core_ip` a 10.10.10.10, y se re-ejecutó el playbook — " +
  "restaurando el sistema a su estado normal (crm-core como primario) antes de continuar. Este ciclo " +
  "completo de falla → promoción manual → restauración es, junto con la prueba de Keepalived (8.1), la " +
  "evidencia central y ejecutada —no solo diseñada— del plan de redundancia de todo el sistema.",
  { italics: true }
));

children.push(pageBreak());

// ============================================================
// 9. EVIDENCIA FOTOGRÁFICA
// ============================================================
children.push(h1("9. Evidencia del Despliegue Real"));
children.push(p("Capturas tomadas durante el despliegue real contra el Proxmox físico, no un entorno de prueba."));
children.push(...evidenceImage("2026-09-23-01-proxmox-nodo-pve-limpio.png", "Figura 11. Nodo Proxmox antes del despliegue, storage local-lvm disponible."));
children.push(...evidenceImage("2026-09-23-02-error-dns-plantilla-cloudinit.png", "Figura 12. Incidente 6 en curso: error de DNS heredado durante la creación de la plantilla."));
children.push(...evidenceImage("2026-09-23-04-cloud-image-descargado.png", "Figura 13. Descarga completa de la imagen cloud-init tras resolver el DNS."));

children.push(h2("9.1 Control de versiones (GitHub)"));
children.push(p(
  "Todo el trabajo descrito en este informe está versionado con git y publicado en un repositorio real " +
  "de GitHub (`arkno1820-arch/crm-empresarial`), con cada commit correspondiendo a un cambio real y " +
  "verificable —no un historial reconstruido para este informe."
));
children.push(...evidenceImage("2026-09-24-07-github-commits.png", "Figura 14. Historial real de commits en GitHub, incluyendo los mensajes descriptivos de cada cambio de la fase de despliegue (23 de septiembre de 2026).", 560));

children.push(pageBreak());

// ============================================================
// 10. CONCLUSIONES
// ============================================================
children.push(h1("10. Conclusiones"));
children.push(p(
  "El proyecto demuestra, con evidencia verificable y no simulada, un ciclo completo de ingeniería: " +
  "desde el desarrollo de una aplicación de microservicios con seguridad y cumplimiento normativo, " +
  "pasando por la decisión justificada de infraestructura propia sobre la nube, hasta el diseño, " +
  "implementación y prueba real de un esquema de redundancia, HTTPS confiable, y monitoreo activo."
));
children.push(p(
  "El valor académico del proyecto no reside solo en el resultado final —el sistema funcionando—, " +
  "sino en el proceso documentado de doce incidentes reales resueltos con su causa raíz identificada, " +
  "que constituye evidencia auténtica de las competencias de diagnóstico y resolución de problemas de " +
  "infraestructura exigidas por el perfil de egreso de la carrera, imposible de reproducir con la misma " +
  "credibilidad en un caso de estudio simulado."
));
children.push(p(
  "Quedan como trabajo futuro, explícitamente reconocido y no forzado en este informe: el respaldo " +
  "offsite en la nube (en pausa por decisión del responsable del proyecto), la migración en vivo real " +
  "entre servidores físicos (dependiente de la adquisición de un segundo servidor por parte de la " +
  "empresa), y la eventual extensión de la CA privada a un modelo de confianza más amplio si el número " +
  "de dispositivos del equipo crece."
));

// ============================================================
// Build document
// ============================================================
const doc = new Document({
  creator: "César Manríquez Figueroa",
  title: "Informe de Práctica Profesional — CRM Empresarial",
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
    {
      properties: {
        page: {
          margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "CRM Empresarial — Informe de Práctica Profesional", size: 16, color: "999999" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Página ", size: 16, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" }),
              new TextRun({ text: " de ", size: 16, color: "999999" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "999999" }),
            ],
          })],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Informe_Practica_Profesional_CRM_Empresarial.docx");
  fs.writeFileSync(out, buf);
  console.log("Escrito:", out, buf.length, "bytes");
});
