const H = require("./helpers.js");
const { pptxgen, path, IMG, DIA, CAP, EVI, C, FONT, dims } = H;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Redes, virtualización y continuidad en la nube — CRM CHIC";
pres.author = "César Manríquez Figueroa";

const { base, toma, fotoTexto, info, fotos, seccion, tarjetas, texto, tabla } = H.makeHelpers(pres, { totalEtapas: 5 });

// ============================================================ portada
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  const nodos = [[10.4, 1.0], [12.0, 1.4], [11.2, 2.6], [12.3, 3.6], [10.6, 4.3], [11.7, 5.6], [10.2, 6.5]];
  const enlaces = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [4, 5], [3, 5], [4, 6], [5, 6]];
  enlaces.forEach(([a, b]) => {
    s.addShape(pres.ShapeType.line, { x: Math.min(nodos[a][0], nodos[b][0]) + 0.15, y: Math.min(nodos[a][1], nodos[b][1]) + 0.15, w: Math.abs(nodos[a][0] - nodos[b][0]) || 0.001, h: Math.abs(nodos[a][1] - nodos[b][1]) || 0.001, line: { color: C.line, width: 1.5 }, flipV: (nodos[a][0] - nodos[b][0]) * (nodos[a][1] - nodos[b][1]) < 0 });
  });
  nodos.forEach(([x, y], i) => {
    s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.3, h: 0.3, fill: { color: i % 2 ? C.panel : C.bg }, line: { color: [C.cy, C.mint, C.amb][i % 3], width: 2.5 } });
  });
  s.addText("PRÁCTICA PROFESIONAL · CENTRO CHIC", { x: 0.9, y: 1.2, w: 9.5, h: 0.4, fontFace: FONT, fontSize: 16, color: C.amb, bold: true, charSpacing: 4, margin: 0, isTextBox: true });
  s.addText("Redes, virtualización y continuidad en la nube", { x: 0.9, y: 1.75, w: 9.6, h: 1.6, fontFace: FONT, fontSize: 42, bold: true, color: C.txt, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
  s.addText("La infraestructura detrás del CRM del Centro CHIC", { x: 0.9, y: 3.55, w: 9.6, h: 0.7, fontFace: FONT, fontSize: 26, bold: true, color: C.cy, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
  s.addText("Del problema real de CHIC a una infraestructura de redes, virtualización y continuidad verificada con pruebas reales", { x: 0.9, y: 4.35, w: 9.0, h: 0.8, fontFace: FONT, fontSize: 17, color: C.mut, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
  s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: 5.85, w: 8.2, h: 0.65, fill: { color: C.bg }, line: { color: C.amb, width: 1.5 }, rectRadius: 0.3 });
  s.addText("César Manríquez Figueroa · Ingeniería en Conectividad y Redes · 2026", { x: 1.1, y: 5.85, w: 7.9, h: 0.65, fontFace: FONT, fontSize: 16, color: C.txt, margin: 0, valign: "middle", isTextBox: true });
  s.addNotes("Buenos días. Voy a contarles cómo una necesidad real del Centro CHIC dio origen a una infraestructura completa de redes, virtualización y continuidad. El CRM es el caso de uso; el foco de la práctica es la infraestructura que lo sostiene, segura y disponible.");
}

info("", "Qué vamos a recorrer", "i01_hoja_de_ruta", "Cada etapa nace de una necesidad que dejó la anterior",
  "Este es el mapa de la presentación. Partimos del problema real de CHIC y de la primera solución de software. Luego la infraestructura: Proxmox, la red y las máquinas. Después la redundancia, la operación y la nube. Y cerramos con las pruebas de estrés, donde se ve en detalle qué se ajustó y por qué.");

// ============================================================ punto de partida (crm + docker)
info("PUNTO DE PARTIDA", "Un problema real de CHIC", "i02_desafio", "Centralizar la gestión y proteger datos de salud: de ahí nace la necesidad de una infraestructura propia",
  "El Centro CHIC necesitaba centralizar la gestión del personal, el calendario, el inventario y las reservas; cada área trabajaba por su lado. Además hay datos de salud de los trabajadores, protegidos por la Ley 21.719. La primera respuesta fue de software: un CRM propio, bajo control de CHIC.");
info("PUNTO DE PARTIDA", "La primera solución: un CRM en microservicios con Docker", "i03_crm_vistazo", "Docker y los microservicios son hoy el estándar para construir software: por eso fue el punto de partida",
  "Se construyó un CRM con seis módulos —empleados, calendario, inventario, reservas, chat y accesos— detrás de un portal único, con cuatro roles de usuario. Se empaquetó con Docker y microservicios porque es el estándar actual de la industria para este tipo de sistemas: rápido de construir, fácil de escalar por partes.");
info("PUNTO DE PARTIDA", "Cómo se orquestó: microservicios con Docker Compose", "i04_docker", "Un comando levanta las 9 piezas; cada servicio es dueño de su base de datos",
  "Un archivo describe nueve contenedores: el frontend, el gateway Nginx como puerta única, seis microservicios y la base PostgreSQL, con el patrón «base de datos por servicio». Esta forma de armar el sistema —servicios sin estado, independientes entre sí— es exactamente lo que después permitió repartirlo entre máquinas distintas.");
fotos("PUNTO DE PARTIDA", "El CRM real, en ejecución", [
  { file: CAP("crm-01-empleados.png"), pie: "Empleados: personal, cargo y estado (datos difuminados)" },
  { file: CAP("crm-02-calendario.png"), pie: "Calendario: eventos, horarios y participantes" },
], "No es una maqueta: es un sistema real, en uso, con datos sensibles que proteger",
  "El CRM no es un prototipo: es una aplicación real en uso, con datos sensibles que proteger. Esa necesidad de disponibilidad y protección es la que dio origen a todo lo que sigue.");
fotos("PUNTO DE PARTIDA", "El límite de Docker solo, en un PC", [
  { file: DIA("01-alto-nivel-contexto.png"), claro: true, pie: "Punto de partida: todo el CRM en un solo equipo, sin red aislada ni redundancia" },
], "Docker resuelve empaquetar el software; no resuelve la continuidad del negocio",
  "Docker Compose resuelve cómo empaquetar y ejecutar el software, pero no resuelve qué pasa si el equipo falla, ni aísla la red, ni replica la base de datos, ni respalda automáticamente. Esa segunda necesidad —de continuidad, no de código— es la que llevó a virtualizar con Proxmox y a construir la infraestructura que se presenta a continuación.");
info("PUNTO DE PARTIDA", "De un PC con Docker a una infraestructura diseñada", "i07_antes_despues", "La solución final: virtualizar con Proxmox y desplegar el mismo CRM sobre una infraestructura redundante",
  "La solución final fue virtualizar con Proxmox: separar el CRM en máquinas y contenedores especializados, con red aislada, bordes y núcleos duplicados, monitoreo aparte, respaldo cifrado y una copia fuera del propio equipo. El CRM que se vio recién es el mismo; lo que cambió es todo lo que hay debajo, y es el tema del resto de esta presentación.");

// ============================================================ etapa 1: infraestructura
seccion(1, "Infraestructura", "Proxmox, la red y las máquinas", "Primera etapa: dónde y cómo vive todo. Este es, junto con la nube, uno de los focos más fuertes de esta práctica.");
info("ETAPA 1 · INFRAESTRUCTURA", "Simular antes de producir", "i08_simulacion", "Proxmox VE 9.2, anidado en VMware, sobre un único equipo físico",
  "La metodología fue instrucción de la jefatura del proyecto: diseñar y validar primero en un entorno de simulación, y después migrar al servidor físico de CHIC. Es la misma lógica de un simulador de vuelo antes de volar. Estamos al cierre de esa validación.");
info("ETAPA 1 · INFRAESTRUCTURA", "Proxmox: el edificio donde vive todo", "i09_proxmox_capas", "Proxmox reparte los recursos entre 4 máquinas virtuales y 2 contenedores",
  "Una analogía simple: el equipo físico es el terreno, Proxmox es la estructura que reparte los pisos, y cada máquina es un departamento. Máquinas virtuales completas para los roles que necesitan aislamiento total; contenedores más livianos para el monitoreo y el respaldo.");
info("ETAPA 1 · INFRAESTRUCTURA", "IPs y segmentación lógica de la red", "i10_red_capas", "Dos redes separadas, direcciones fijas por rol, y VRRP moviendo la dirección compartida del borde",
  "Esta es la pieza central del diseño de red. Una red NAT (192.168.80.0/24) conecta el equipo físico con Proxmox, que actúa como router; una segunda red, completamente interna (10.10.10.0/24, vmbr1), no tiene ni siquiera un puerto físico y aloja a las cuatro máquinas y los dos contenedores, cada uno con una dirección fija según su rol. Entre los dos bordes, el protocolo VRRP mueve una dirección compartida (10.10.10.5) al que esté sano, en unos 3 segundos.");
tabla("ETAPA 1 · INFRAESTRUCTURA", "Inventario de direcciones y roles", ["Nombre", "IP interna", "Rol", "Tipo"], [
  ["crm-edge", "10.10.10.2", "Borde MASTER: Nginx, Keepalived, voto etcd", "VM"],
  ["crm-edge-b", "10.10.10.3", "Borde BACKUP: Nginx, Keepalived, voto etcd", "VM"],
  ["10.10.10.5", "—", "Dirección virtual compartida (VRRP), publicada por DNAT", "—"],
  ["crm-core", "10.10.10.10", "Núcleo: aplicación, base de datos, voto etcd", "VM"],
  ["crm-core-b", "10.10.10.11", "Núcleo: aplicación, base de datos, voto etcd", "VM"],
  ["crm-mon", "10.10.10.20", "Monitoreo NOC (13 monitores), voto etcd", "LXC"],
  ["crm-nas", "10.10.10.30", "Receptor de respaldos, solo escritura", "LXC"],
], "Cinco de las seis unidades votan en el árbitro de continuidad; ninguna tiene salida directa a Internet salvo los bordes", null, [2.0, 2.0, 6.13, 2.2]);
info("ETAPA 1 · INFRAESTRUCTURA", "Una decisión de red basada en incidentes reales", "i11_nat_bridged", "Un esquema de red inicial resultó incompatible con el hardware de conexión disponible",
  "El primer esquema de red (puenteado) fue descartado: el punto de acceso usado en la simulación descartaba las direcciones de las máquinas virtuales anidadas, y en un caso llegó a interferir con la conexión del propio equipo anfitrión. Se rediseñó con la red NAT propia que se acaba de ver.");
fotoTexto("ETAPA 1 · INFRAESTRUCTURA", "La vista completa de la arquitectura", DIA("04-infraestructura-proxmox.png"), true,
  "Arquitectura de virtualización, redes y continuidad", "Cómo leer el diagrama", [
    "Arriba: la red externa; Proxmox actúa como router hacia la infraestructura.",
    "Al centro: dos bordes con dirección compartida y dos núcleos con base replicada.",
    "Abajo: el monitoreo, el árbitro de continuidad y el respaldo, con su copia en la nube.",
    "La regla: todo está duplicado, y ahora también hay una copia fuera del equipo físico.",
  ],
  "Este diagrama junta todo lo descrito: la red externa, el equipo físico como router, el par de bordes, el par de núcleos con la base replicada, el monitoreo, el árbitro de continuidad, el respaldo local y la copia en la nube.");
fotos("ETAPA 1 · INFRAESTRUCTURA", "La infraestructura real, en ejecución", [
  { file: IMG("pve-13-recortada"), pie: "Las cuatro máquinas y el contenedor de monitoreo, en ejecución" },
  { file: CAP("nas-01-crm-nas-en-proxmox.png"), pie: "El contenedor de respaldos y su almacenamiento" },
], "Evidencia real, no un diagrama de intención",
  "Capturas reales del sistema de administración: las cuatro máquinas virtuales corriendo junto al contenedor de monitoreo, y el contenedor de respaldos con su almacenamiento propio.");
info("ETAPA 1 · INFRAESTRUCTURA", "Todo como código", "i13_iac", "La infraestructura se describe en archivos: se puede reconstruir igual cuantas veces haga falta",
  "Nada se construyó a mano. Un archivo describe y crea las máquinas y la red. Cada máquina recibe su identidad al primer arranque. Otro conjunto de archivos instala y configura todo de forma repetible. Y cada cambio queda registrado con su historial.");
fotos("ETAPA 1 · INFRAESTRUCTURA", "Evidencia: cambios planificados y versionados", [
  { file: CAP("tf-01-plan-residual.png"), pie: "Plan de cambios contra la infraestructura real, antes de aplicarlo" },
  { file: EVI("2026-09-24-07-github-commits.png"), pie: "Historial real de commits del repositorio" },
], "Cada cambio de infraestructura es revisable y queda con su historia",
  "A la izquierda, la salida real de la herramienta de infraestructura como código. A la derecha, el historial real de cambios en GitHub, cada uno con su mensaje.");
info("ETAPA 1 · INFRAESTRUCTURA", "Las herramientas de la orquesta", "i14_mapa_herramientas", "Cada herramienta resuelve un problema distinto, y ninguna es prescindible",
  "Doce herramientas cooperan: unas crean y ejecutan las máquinas y hacen de router; otras reparten el tráfico y mueven la dirección compartida; otras gestionan la base de datos y deciden quién manda; otras monitorean, cifran los respaldos y controlan el acceso remoto solo con llave.");

// ============================================================ etapa 2: redundancia
seccion(2, "Redundancia", "Que ninguna máquina, sola, pueda cortar el servicio", "Segunda etapa: cómo se logra que la caída de una máquina no la note el usuario.");
info("ETAPA 2 · REDUNDANCIA", "Borde: la dirección compartida salta sola", "i15_ip_virtual", "El protocolo de red mueve la dirección al borde sano en unos 3 segundos",
  "En el borde se usa VRRP. Una dirección compartida la tiene el borde principal; si cae, la dirección salta sola al borde de respaldo en unos tres segundos, y cuando el principal vuelve, la recupera. Es como el número de un teléfono de atención que se desvía solo al escritorio de al lado.");
info("ETAPA 2 · REDUNDANCIA", "Núcleo: árbitro, guía y bases", "i17_patroni_etcd_haproxy", "Un árbitro de 5 miembros, un guía que siempre encuentra al líder, y bases con replicación en vivo",
  "El núcleo tiene tres piezas que trabajan juntas. Un árbitro que vota quién es el líder: una junta de cinco miembros, con mayoría de tres. Un guía que dirige siempre a la aplicación hacia el líder vigente. Y un gestor de bases con replicación en vivo: una operación no se confirma si la réplica no la recibió.");
fotos("ETAPA 2 · REDUNDANCIA", "Dónde vive cada pieza del núcleo", [
  { file: IMG("11-patroni-ppt"), claro: true, pie: "Alta disponibilidad de la base de datos: ubicación de cada una de las 5 piezas del árbitro" },
], null,
  "Este diagrama ubica cada pieza: arriba, el árbitro de cinco miembros repartido en cinco máquinas distintas; abajo, cada núcleo con su gestor de base, su guía y la aplicación. El sistema tolera hasta dos caídas simultáneas sin detenerse.");
info("ETAPA 2 · REDUNDANCIA", "El viaje completo de una petición", "i19_viaje_peticion", "En ningún paso hay una máquina imprescindible: cada uno tiene reemplazo",
  "De punta a punta: llega al equipo físico, que la reenvía a la dirección compartida; el borde recibe y reparte a un núcleo; el núcleo atiende y pide la base al guía, que lo lleva al líder vigente; la base responde, y la respuesta vuelve por el mismo camino.");

// ============================================================ etapa 3: operacion
seccion(3, "Operación y seguridad", "Ver, proteger y respaldar lo que se construyó", "Tercera etapa: una infraestructura redundante no basta. Hay que poder verla, protegerla y recuperar los datos si algo falla.");
info("ETAPA 3 · OPERACIÓN", "Seguridad en 8 capas", "i20_seguridad_capas", "Defensa en profundidad: si una capa falla, queda la siguiente",
  "Ocho capas: aislamiento de red, HTTPS con CA propia, acceso solo con llave, secretos fuera de Git, roles y permisos en la aplicación, cifrado de datos sensibles, respaldo cifrado, y una copia redundante en la nube.");
info("ETAPA 3 · OPERACIÓN", "HTTPS con una autoridad certificadora propia", "i21_ca_propia", "Se confía en la autoridad una sola vez y todo lo que firma queda validado",
  "Se construyó una autoridad certificadora propia, como un registro civil corporativo. Cada dispositivo instala su certificado raíz una sola vez y desde ahí ve el candado, sin advertencias. La llave privada de la CA nunca sale del equipo del responsable.");
fotos("ETAPA 3 · OPERACIÓN", "Candado en todos los equipos", [
  { file: CAP("crm-22-login-fallido-https.png"), pie: "Acceso por HTTPS con candado; ante credenciales inválidas, mensaje genérico" },
  { file: CAP("otro-equipo-01-dos-equipos-lado-a-lado.png"), pie: "Un segundo equipo, en otra red, con candado y funcionando en tiempo real" },
], "Verificado en dos equipos distintos, sin advertencias",
  "A la izquierda, el sistema por HTTPS con candado. A la derecha, un segundo equipo en una red completamente distinta, que abre el sistema sin advertencias y comparte el chat en tiempo real con el primero.");
info("ETAPA 3 · OPERACIÓN", "Monitoreo: el centro de operaciones", "i22_noc", "Un vigilante fuera de las máquinas, y otro que vigila al vigilante",
  "El monitoreo corre en un contenedor aparte, fuera de las máquinas que vigila, con trece sensores agrupados por capa. Un centinela pequeño, en el borde, vigila que el monitor principal siga vivo.");
fotoTexto("ETAPA 3 · OPERACIÓN", "El panel real, con sus trece monitores", CAP("noc-13-lista-trece-monitores.png"), false,
  "Panel principal de monitoreo", "Qué se ve en el panel", [
    "Un monitor por elemento vigilado, agrupado por capa: aplicación, base, borde, enlace, infraestructura y respaldo.",
    "Los últimos monitores vigilan el respaldo local y el envío a la nube.",
    "Cada barra muestra disponibilidad y tiempo de respuesta en el tiempo.",
  ],
  "El panel principal con sus trece monitores; los últimos vigilan el respaldo local y el envío a la nube.");
fotos("ETAPA 3 · OPERACIÓN", "El centinela detecta una caída real", [
  { file: CAP("p3-centinela-detecta-caida.png"), pie: "Centinela: el monitor principal en rojo, y el servicio de punta a punta en verde" },
], "Cuando el monitor principal cae, el centinela lo señala sin afectar al servicio",
  "Una prueba real: al forzar la caída del monitoreo principal, el centinela lo marca en rojo de inmediato, y mantiene en verde el servicio de punta a punta.");
info("ETAPA 3 · OPERACIÓN", "Respaldo: la diferencia entre clon y foto", "i23_respaldo_flujo", "La redundancia no reemplaza al respaldo: si alguien borra datos, el clon también los borra",
  "Cada noche, cada núcleo respalda su base, la cifra y la entrega a un receptor dedicado, que a su vez la reenvía a la nube. Cada semana se respaldan además las máquinas completas.");
info("ETAPA 3 · OPERACIÓN", "El receptor de respaldos: un buzón de solo escritura", "i24_nas_buzon", "Probado con 6 intentos maliciosos; los 6 fueron rechazados",
  "El receptor funciona como un buzón: los núcleos solo pueden depositar, no abrirlo, listar, cambiar ni sacar nada. Se probó con seis intentos maliciosos y los seis fueron rechazados.");
fotos("ETAPA 3 · OPERACIÓN", "El mapa completo del respaldo", [
  { file: IMG("12-respaldo-ppt"), claro: true, pie: "Respaldo y recuperación: qué se copia, hacia dónde y cómo se protege" },
], null,
  "La secuencia completa: los núcleos generan y cifran, el receptor recibe, el almacenamiento guarda, y cada noche se envía además una copia a la nube.");

// ============================================================ etapa 4: nube
seccion(4, "Nube", "Una copia fuera del propio equipo, para cuando nada más basta", "Cuarta etapa: junto con la infraestructura y la segmentación de red, uno de los aportes más fuertes de esta práctica.");
info("ETAPA 4 · NUBE", "La copia fuera del PC: Google Cloud Storage", "i32_cloud_resumen", "Regla 3-2-1 cumplida: tres copias, en dos medios, una fuera del equipo",
  "Se cerró el último punto único de falla con una copia cifrada en Google Cloud Storage: un espacio privado, con una credencial que solo puede crear archivos —no leer, listar ni borrar—, verificando cada envío. Ocurre automáticamente cada noche.");
fotos("ETAPA 4 · NUBE", "Evidencia real: el bucket y sus permisos", [
  { file: CAP("offsite-01-bucket-con-respaldos.png"), pie: "Los respaldos reales, ya recibidos en la nube" },
  { file: CAP("offsite-02-permisos-solo-crear.png"), pie: "La credencial: solo puede crear, no leer ni borrar" },
], "El acceso está diseñado para que ni un mal uso de la credencial exponga los datos",
  "A la izquierda, los respaldos reales ya recibidos. A la derecha, la configuración de permisos: la credencial solo puede crear archivos nuevos.");
fotos("ETAPA 4 · NUBE", "Actividad real, mínima y bajo control", [
  { file: CAP("cloud-05-observabilidad-trafico-1dia.png"), pie: "Tráfico real de un día: mínimo, tal como se espera de un envío nocturno de un archivo pequeño" },
], "El costo y el riesgo de esta copia son marginales frente a su valor de continuidad",
  "El tráfico real observado en un día es mínimo. El costo de mantener esta copia es marginal frente al valor que aporta a la continuidad del negocio.");
fotos("ETAPA 4 · NUBE", "Ensayado con éxito: restaurar desde la nube", [
  { file: CAP("restauracion-02-ensayo-desde-la-nube.png"), pie: "Un respaldo real, descargado de la nube, descifrado y restaurado con éxito en un entorno aislado" },
], "No basta con que la copia exista: se comprobó que efectivamente sirve para recuperar los datos",
  "Un respaldo real se descargó, se descifró y se restauró en un entorno aislado, sin tocar el sistema real, y coincidió exactamente con los datos reales.");

// ============================================================ etapa 5: pruebas de estres (detalle tecnico, termino medio)
seccion(5, "Pruebas de estrés", "Forzar fallas reales, medir, y ajustar lo que hizo falta", "Quinta etapa: aquí se entra en el detalle de qué se cambió y por qué, con datos y tiempos reales.");
info("ETAPA 5 · PRUEBAS", "Cómo se probó", "i25_metodologia_pruebas", "Fallas reales con el sistema abierto y en uso; horas tomadas de registros reales, no estimadas",
  "Las pruebas consisten en forzar una falla real de un componente, con el sistema abierto y en uso, y observar tres cosas: si el servicio sigue, si el monitoreo lo detecta y cuánto tarda en recuperarse. Las horas se toman de los registros reales del sistema, nunca de una estimación.");
info("ETAPA 5 · PRUEBAS", "P1: se apaga el núcleo activo", "i27_p1_timeline", "26,4 segundos hasta tener escrituras; la promoción en sí duró 0,3 segundos",
  "Se apaga el núcleo que en ese momento era el líder de la base. El sistema detecta la falla y promueve al otro núcleo. De los 26,4 segundos, casi todo es un margen de seguridad para no arriesgar los datos: la promoción en sí fue casi instantánea. El servicio no dejó de responder.");
fotos("ETAPA 5 · PRUEBAS", "P1: el sistema, sin dejar de responder", [
  { file: CAP("p1-crm-funcionando.png"), pie: "El sistema responde con el núcleo principal apagado" },
  { file: CAP("p1-kuma-core-apagado.png"), pie: "El monitoreo marca en rojo solo lo que dejó de responder" },
], "Con el núcleo activo apagado, el servicio no se detuvo",
  "Con el núcleo apagado, el sistema siguió respondiendo: la base la sirvió el segundo núcleo. El monitoreo marcó con precisión solo los dos monitores del núcleo caído.");
fotos("ETAPA 5 · PRUEBAS", "P2: el borde, en unos 3 segundos", [
  { file: DIA("10-conmutacion-borde-linea-de-tiempo.png"), claro: true, pie: "El apagado del borde y la recuperación en el otro, sin corte visible para el usuario" },
], null,
  "Se apaga el borde que tenía la dirección compartida. En unos tres segundos, el otro borde ya la tenía asumida. El usuario prácticamente no lo notó.");
info("ETAPA 5 · PRUEBAS", "P3: la prueba extrema", "i28_p3_extrema", "Aunque falle el monitoreo, el centinela lo detecta y el servicio sigue",
  "Se apagan a la vez el monitoreo principal y un borde. El sistema siguió funcionando, y el centinela detectó la caída del monitor principal sin afectar al servicio. Esta prueba motivó el diseño del centinela que vigila al vigilante.");
tarjetas("ETAPA 5 · PRUEBAS", "P4: mantenimiento sin cortar nada", [
  { n: "≈ 4,7 s", l: "de la orden a tener el nuevo líder de la base", c: C.mint },
  { n: "100 %", l: "de las verificaciones correctas durante el cambio", c: C.cy },
  { n: "0", l: "interrupciones visibles para el usuario", c: C.amb },
], "Se pasa el liderazgo de un núcleo a otro a propósito, para poder respaldarlo sin riesgo",
  "Esta prueba no apaga nada: se ordena un cambio de líder planificado, para respaldar un núcleo desde su papel de réplica, sin que el líder participe.");
info("ETAPA 5 · PRUEBAS", "El hallazgo que forzó el rediseño del núcleo", "i16_nucleo_antes_despues", "La primera versión de la redundancia era solo aparente: una prueba real lo mostró, y se corrigió",
  "Este es el ajuste más importante del proyecto. La primera versión del núcleo tenía una réplica con copia cada 15 minutos y promoción manual. Al forzar una caída real en una prueba, cayó la base de datos y el servicio (error 502). Se rediseñó con Patroni, etcd y HAProxy —lo que se vio en la etapa 2—: replicación sincrónica y cambio de líder automático. Encontrar y corregir a tiempo, antes de producción, es parte del método.");
info("ETAPA 5 · PRUEBAS", "Segunda tanda: qué faltaba cerrar", "i33_pruebas_segunda_tanda", "Restauración sin ensayar, disco no simulado, y el árbitro tolerando solo una falla",
  "Con la infraestructura ya validada, se diseñó una segunda ronda más exigente: ensayar la restauración real, forzar fallas de disco, aislar al líder de la red sin apagarlo, y ampliar el árbitro para tolerar más fallas a la vez.");
tarjetas("ETAPA 5 · PRUEBAS", "P5: se aísla al líder de la red, sin apagarlo", [
  { n: "1,0 s", l: "el nodo aislado deja de poder escribir", c: C.vio },
  { n: "27,6 s", l: "hasta que el nuevo líder toma el control", c: C.cy },
  { n: "0", l: "veces que dos nodos aceptaron escrituras a la vez", c: C.mint },
], "El escenario más exigente: un nodo aislado de la red, pero encendido — cero escrituras dobles",
  "En vez de apagar una máquina, se aisló de la red al líder de la base, dejándolo encendido pero incomunicado del resto del clúster. Cada núcleo intentó escribir cada segundo: el nodo aislado dejó de poder escribir casi de inmediato, y el nuevo líder tomó el control 27,6 segundos después. En ningún instante dos nodos aceptaron escrituras a la vez.");
info("ETAPA 5 · PRUEBAS", "Pruebas de disco: al límite del almacenamiento", "i36_pruebas_disco", "D2b escaló a un caso real, con solución aplicada de inmediato: el detalle, en la siguiente lámina",
  "Tres pruebas de disco, cada una más exigente: D1 y D2 no mostraron ningún fallo, con el margen de disco alcanzando para sostener la escritura real. D2b llevó el sistema a su límite real y encontró una mejora de fondo en el almacenamiento compartido del servidor.");
info("ETAPA 5 · PRUEBAS", "El hallazgo del almacenamiento compartido", "i34_hallazgo_disco", "Se agotó el espacio de disco compartido del servidor; el sistema protegió los datos y se corrigió sin pérdidas",
  "Al llevar un disco al límite, se descubrió que el almacenamiento del servidor es compartido entre las cuatro máquinas: agotarlo en una afectó a las demás. El sistema, por diseño, no promovió un nuevo líder sin estar seguro —cero riesgo de datos incorrectos—. Se amplió el espacio disponible y todo volvió a la normalidad sin perder un solo dato: usuarios, empleados y respaldos, verificados intactos.");
info("ETAPA 5 · PRUEBAS", "El árbitro, puesto a prueba y reforzado", "i18_quorum", "La misma falla que antes detenía el servicio, hoy el sistema la absorbe sin problema",
  "El hallazgo del disco mostró el límite real de tolerar solo una falla a la vez en el árbitro de continuidad. Se amplió de tres a cinco votos, y se repitió la prueba: hoy, dos caídas simultáneas no detienen el servicio.");
fotos("ETAPA 5 · PRUEBAS", "P6: doble caída, con el árbitro ya ampliado", [
  { file: CAP("p6-proxmox-apagado.png"), pie: "Dos máquinas apagadas a la vez: un borde y el líder de la base" },
  { file: CAP("p6-kuma-detalle-caida.png"), pie: "El monitoreo detecta la caída con evidencia real" },
], "El servicio no se detuvo ni un segundo: nuevo líder en 27,2 s, con cero fallos en 175 verificaciones",
  "La prueba que confirma el ajuste: con el árbitro ya en cinco miembros, se apagan a la vez un borde y el líder de la base. El servicio no dejó de responder.");
info("ETAPA 5 · PRUEBAS", "¿Cuánto tardó cada cosa?", "i26_tiempos", "Diez pruebas, un solo patrón: el sistema espera lo justo para no arriesgar los datos",
  "El panorama completo de tiempos medidos en las dos tandas. En todos los casos, el tiempo dominante es un margen de seguridad deliberado, no una demora real del sistema.");
fotos("ETAPA 5 · PRUEBAS", "Restauración ensayada en tres escenarios", [
  { file: CAP("restauracion-01-ensayo-desde-la-nas.png"), pie: "Restauración desde el respaldo local: coincide exactamente con los datos reales" },
  { file: CAP("restauracion-04-vm-restaurada-arrancada.png"), pie: "Una máquina completa, restaurada y arrancada con éxito" },
], "NAS, nube y una máquina virtual completa: las tres rutas de recuperación, ya probadas",
  "Sumado al ensayo desde la nube visto en la etapa 4, se restauró también un respaldo desde el receptor local y una máquina virtual completa, ambos con éxito. Las tres rutas de recuperación del sistema quedan verificadas.");
info("ETAPA 5 · PRUEBAS", "Recuperación y evolución del diseño", "i29_recuperacion_limites", "Cada ajuste, encontrado en una prueba y corregido antes de producción",
  "Al encender todo de nuevo, el sistema vuelve solo a su estado normal, sin intervención manual. Y el resultado de las diez pruebas: el árbitro pasó de tolerar una falla a tolerar dos, la restauración quedó ensayada con éxito en tres escenarios, y el hallazgo de almacenamiento se corrigió sin pérdida de datos. Es exactamente el propósito de simular antes de producir.");

// ============================================================ cierre
{
  const s = base("CIERRE", "33 incidentes reales: el aprendizaje del proyecto");
  const cats = ["Red y aislamiento", "Configuración e IaC", "Virtualización y hardware", "Monitoreo", "Nube", "Alta disponibilidad", "Aplicación", "Operación"];
  const vals = [6, 6, 4, 4, 3, 4, 3, 3];
  s.addChart(pres.charts.BAR, [{ name: "Incidentes", labels: cats, values: vals }], {
    x: 0.5, y: 1.2, w: 7.6, h: 5.25, barDir: "bar", chartColors: [C.cy], showTitle: false, showLegend: false,
    showValue: true, dataLabelColor: C.txt, dataLabelFontSize: 13, dataLabelFontFace: FONT, dataLabelPosition: "outEnd",
    catAxisLabelColor: C.txt, catAxisLabelFontSize: 13, catAxisLabelFontFace: FONT, catAxisOrientation: "maxMin",
    valAxisLabelColor: C.mut, valAxisLabelFontSize: 11, valAxisMaxVal: 8, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" },
    plotArea: { fill: { color: C.bg } }, valAxisHidden: false,
  });
  const q = [
    { t: "Nube", d: "Permisos y credenciales de la copia fuera del PC, resueltos con mínimo privilegio real.", c: C.amb },
    { t: "Alta disponibilidad", d: "El almacenamiento compartido del servidor, con más margen y mejor protección para los datos.", c: C.mint },
    { t: "Red", d: "Una red propia, independiente de cualquier conexión externa, con aislamiento verificado.", c: C.cy },
  ];
  q.forEach((k, i) => {
    const y = 1.25 + i * 1.75;
    s.addShape(pres.ShapeType.roundRect, { x: 8.4, y, w: 4.43, h: 1.6, fill: { color: C.panel }, line: { color: k.c, width: 2 }, rectRadius: 0.14 });
    s.addText(k.t, { x: 8.6, y: y + 0.1, w: 4.0, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: k.c, margin: 0, isTextBox: true });
    s.addText(k.d, { x: 8.6, y: y + 0.5, w: 4.05, h: 1.0, fontFace: FONT, fontSize: 14, color: C.txt, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
  });
  toma(s, "Cada incidente tiene causa raíz y resolución: es evidencia de gestión de servicios TI madura, no de improvisación");
  s.addNotes("La bitácora reúne treinta y tres incidentes reales, todos con causa raíz y resolución. Destaco tres categorías: nube, alta disponibilidad y red.");
}
tarjetas("CIERRE", "El proyecto en cifras", [
  { n: "6", l: "unidades de cómputo, 5 votando en el árbitro", c: C.cy },
  { n: "13", l: "monitores en el centro de operaciones", c: C.mint },
  { n: "0", l: "transacciones confirmadas perdidas, en 10 pruebas", c: C.mint },
  { n: "33", l: "incidentes resueltos con causa raíz", c: C.vio },
], "Cifras verificables en el informe (144 páginas) y en la evidencia de este proyecto",
  "Seis unidades de cómputo, de las cuales cinco votan en el árbitro de continuidad; trece monitores; cero transacciones confirmadas perdidas; treinta y tres incidentes resueltos.");
tarjetas("CIERRE", "El proyecto en cifras (continuación)", [
  { n: "9", l: "pruebas de estrés con tiempos medidos", c: C.cy },
  { n: "3", l: "restauraciones reales ensayadas con éxito", c: C.mint },
  { n: "15", l: "decisiones de arquitectura documentadas", c: C.amb },
  { n: "144", l: "páginas de informe con evidencia real", c: C.vio },
], "Todo verificable, con evidencia real, no estimaciones",
  "Nueve pruebas de estrés con tiempos medidos, tres restauraciones reales ensayadas con éxito, quince decisiones de arquitectura documentadas y ciento cuarenta y cuatro páginas de informe con evidencia real.");
info("CIERRE", "Cómo se conecta con la carrera", "i31_ramos", "Cada asignatura tiene un componente real y verificable",
  "Redes Virtuales, Virtualización, Arquitectura Cloud —con un caso real de Google Cloud Storage—, Gestión de Proyectos, Gestión de Servicios TI, Gestión de la Información con TICs, y Diseño de Redes.");
fotos("CIERRE", "El cronograma de las 360 horas", [
  { file: DIA("05-cronograma-gantt.png"), claro: true, pie: "8 fases, del 28 de septiembre al 27 de noviembre de 2026" },
], null,
  "Lo presentado corresponde a la fase de simulación, ya validada con dos tandas de pruebas. Las fases siguientes están dentro del mismo cronograma.");
info("CIERRE", "Qué sigue", "i30_proximos_pasos", "Cada paso construye sobre lo ya probado",
  "El segundo servidor físico, ya cotizado. La migración a producción. Una alerta automática de espacio en el almacenamiento compartido. Formalizar en el código la ampliación del árbitro. Y la revisión legal de los documentos de protección de datos.");
{
  const s = base("CIERRE", "Conclusiones");
  const pts = [
    ["La infraestructura es el aporte de esta práctica", "El CRM es el caso de uso real; el valor entregado es la red, la redundancia, la nube y el respaldo que lo sostienen.", C.cy],
    ["La continuidad se demostró, no se supuso", "Diez pruebas de estrés con tiempos medidos; el servicio respondió en todas.", C.mint],
    ["El sistema tolera hasta dos caídas simultáneas", "El árbitro de continuidad, con cinco votos, sostiene el servicio incluso ante dos máquinas apagadas a la vez.", C.amb],
    ["La continuidad ya no depende de un solo lugar", "Regla 3-2-1 cumplida: tres copias, en dos medios, una fuera del propio equipo, todas ensayadas.", C.vio],
  ];
  pts.forEach(([h, d, c], i) => {
    const y = 1.3 + i * 1.3;
    s.addShape(pres.ShapeType.ellipse, { x: 0.6, y: y + 0.12, w: 0.62, h: 0.62, fill: { color: C.panel }, line: { color: c, width: 2.5 } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.12, w: 0.62, h: 0.62, fontFace: FONT, fontSize: 22, bold: true, color: c, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(h, { x: 1.5, y, w: 11.2, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: c, margin: 0, valign: "middle", isTextBox: true, fit: "shrink" });
    s.addText(d, { x: 1.5, y: y + 0.5, w: 11.2, h: 0.65, fontFace: FONT, fontSize: 17, color: C.txt, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
  });
  toma(s, "Del problema real de CHIC a una infraestructura de continuidad probada, con evidencia de punta a punta");
  s.addNotes("Cuatro conclusiones finales.");
}
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.ShapeType.ellipse, { x: 0.9, y: 2.2, w: 2.6, h: 2.6, fill: { color: C.panel }, line: { color: C.cy, width: 4 } });
  s.addText("?", { x: 0.9, y: 2.2, w: 2.6, h: 2.6, fontFace: FONT, fontSize: 110, bold: true, color: C.cy, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText("Gracias", { x: 4.1, y: 2.0, w: 8.5, h: 1.2, fontFace: FONT, fontSize: 54, bold: true, color: C.txt, margin: 0, isTextBox: true });
  s.addText("¿Preguntas?", { x: 4.1, y: 3.2, w: 8.5, h: 0.8, fontFace: FONT, fontSize: 30, color: C.mint, margin: 0, isTextBox: true });
  s.addText([
    { text: "Se puede mostrar en vivo: ", options: { bold: true, color: C.amb } },
    { text: "el sistema con candado, el panel de monitoreo, el bucket de la nube y una recuperación automática.", options: { color: C.txt } },
  ], { x: 4.1, y: 4.5, w: 8.5, h: 1.0, fontFace: FONT, fontSize: 18, margin: 0, valign: "top", isTextBox: true });
  s.addText("César Manríquez Figueroa · arkno1820@gmail.com", { x: 4.1, y: 6.2, w: 8.5, h: 0.4, fontFace: FONT, fontSize: 14, color: C.mut, margin: 0, isTextBox: true });
  s.addNotes("Muchas gracias. Quedo atento a sus preguntas.");
}

const salida = path.join(H.AQUI, "..", "Presentacion_CRM_CHIC.pptx");
pres.writeFile({ fileName: salida }).then((f) => console.log("Escrito:", f));
