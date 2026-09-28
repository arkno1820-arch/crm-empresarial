from svglib import *
from infografias2 import wrap


def i23_respaldo_flujo():
    s = cabecera()
    s += caja(30, 30, 600, 330, AMB, PANEL, 22, 3)
    s += t(330, 80, "Redundancia ≠ respaldo", 30, AMB, 700, "middle")
    s += t(170, 150, "Clon en vivo", 24, CY, 700, "middle")
    s += t(170, 185, "= redundancia", 21, MUT, 400, "middle")
    s += t(490, 150, "Foto en el tiempo", 24, MINT, 700, "middle")
    s += t(490, 185, "= respaldo", 21, MUT, 400, "middle")
    s += t(330, 175, "≠", 56, AMB, 700, "middle")
    s += lineas(330, 250, ["La rueda de repuesto te deja seguir", "el viaje; el seguro te cubre si el auto", "se destruye. Si alguien borra datos por", "error, el clon los borra también."], 20, TXT, 30, "middle")
    pasos = [
        ("1", "Volcado", "cada núcleo copia su", "base completa (pg_dumpall)", ic_db, CY),
        ("2", "Verifica", "comprueba que el volcado", "esté completo", ic_check, MINT),
        ("3", "Cifra", "con la clave pública", "(GnuPG)", ic_candado, AMB),
        ("4", "Entrega", "por SSH a la NAS", "solo escritura", ic_correo, VIO),
        ("5", "Nube", "copia redundante en", "Google Cloud Storage", ic_nube, MINT),
    ]
    xs = [890, 1092, 1294, 1496, 1698]
    for x, (n, h, a, b, ic, col) in zip(xs, pasos):
        s += caja(x - 96, 60, 192, 300, col, PANEL, 20, 3, glow=(n == "5"))
        s += rotulo(x, 60, n, col, 22)
        s += ic(x - 38, 100, 0.72, col)
        s += t(x, 236, h, 24, col, 700, "middle")
        s += lineas(x, 276, [a, b], 16, TXT, 24, "middle")
        if x < 1698:
            s += flecha(x + 98, 210, x + 116, 210, MINT, 3)
    s += caja(30, 400, 1800, 170, CY, PANEL, 18, 3)
    s += ic_disco(60, 430, 0.9, CY)
    s += t(170, 460, "NAS simulada (crm-nas) + copia redundante en la nube", 27, CY, 700)
    s += lineas(170, 505, ["Contenedor con 200 GB de almacenamiento dedicado, separado de las máquinas del CRM.", "Cada noche, además, crm-nas envía la copia ya cifrada a un bucket privado de Google Cloud Storage."], 22, TXT, 34)
    cadena = [("Base de datos", "cada noche", CY), ("Máquinas completas", "cada domingo", MINT), ("Copia en la nube", "cada noche, offsite", MINT), ("Clave privada", "solo en el PC", AMB)]
    for i, (h, d, col) in enumerate(cadena):
        x = 30 + i * 450
        s += caja(x, 610, 420, 140, col, PANEL, 16, 2.5, glow=(h == "Copia en la nube"))
        s += t(x + 210, 665, h, 24, col, 700, "middle")
        s += t(x + 210, 710, d, 21, TXT, 400, "middle")
    return s + pie()


def i24_nas_buzon():
    s = cabecera()
    s += caja(30, 30, 880, 560, CY, PANEL, 22, 3)
    s += t(470, 85, "La NAS es un buzón", 32, CY, 700, "middle")
    s += ic_correo(120, 140, 1.1, CY)
    s += ic_boveda(370, 140, 1.05, MINT)
    s += ic_nube(660, 145, 1.0, MINT)
    s += flecha(255, 195, 365, 195, MINT, 5)
    s += t(310, 165, "depositar", 20, MINT, 600, "middle")
    s += flecha(540, 195, 655, 195, MINT, 4, True)
    s += t(598, 165, "cada noche", 18, MINT, 600, "middle")
    s += t(170, 320, "Núcleo", 22, TXT, 600, "middle")
    s += t(430, 320, "crm-nas", 22, TXT, 600, "middle")
    s += t(710, 320, "Nube", 22, MINT, 600, "middle")
    s += lineas(470, 400, ["Los núcleos solo pueden echar cartas al buzón:", "no pueden abrirlo, mirar lo que hay adentro,", "cambiar una carta ni sacarlas. crm-nas, a su vez,", "reenvía cada noche una copia cifrada a la nube."], 22, TXT, 34, "middle")
    s += caja(60, 520, 820, 50, AMB, BG, 12, 2)
    s += t(470, 554, "Un núcleo comprometido no puede leer ni destruir los respaldos", 22, AMB, 600, "middle")
    s += t(1370, 70, "Pruebas de seguridad (6 de 6 rechazadas)", 28, MINT, 700, "middle")
    pruebas = [("Listar carpetas de la NAS", "orden no permitida"), ("Leer /etc/shadow", "orden no permitida"), ("Sobrescribir un respaldo existente", "«ya existe»"),
               ("Subir con una ruta relativa", "«nombre inválido»"), ("Subir con extensión ajena", "«nombre inválido»"), ("Orden vacía", "«nombre inválido»")]
    for i, (a, b) in enumerate(pruebas):
        y = 105 + i * 78
        s += caja(950, y, 880, 66, RED, PANEL, 12, 2.5)
        s += ic_cruz(962, y + 10, 0.44, RED)
        s += t(1030, y + 42, a, 23, TXT, 500)
        s += t(1810, y + 42, b, 21, MUT, 400, "end")
    s += caja(950, 590 - 10, 880, 160, VIO, PANEL, 16, 2.5, True) if False else ""
    s += caja(30, 620, 1800, 150, VIO, PANEL, 18, 2.5, True)
    s += ic_ojo(60, 645, 0.7, VIO)
    s += lineas(160, 675, ["¿Y si el respaldo deja de correr sin que nadie lo note? Al terminar cada respaldo, el núcleo avisa a Kuma (monitor «push»).", "Si pasan 26 horas sin ningún aviso, el monitor «último respaldo» se pone en rojo."], 23, TXT, 40)
    return s + pie()


def i25_metodologia_pruebas():
    s = cabecera()
    preg = [("¿Sigue el servicio?", "El CRM abierto, con sesión iniciada, debe seguir respondiendo", ic_globo, CY),
            ("¿Lo detecta el monitoreo?", "Los monitores afectados deben ponerse en rojo con su alarma", ic_ojo, VIO),
            ("¿Cuánto tarda en recuperarse?", "Tiempos medidos con relojes reales, no estimados", ic_reloj, AMB)]
    for i, (h, d, ic, col) in enumerate(preg):
        x = 30 + i * 610
        s += caja(x, 30, 580, 250, col, PANEL, 20, 3)
        s += ic(x + 244, 50, 0.9, col)
        s += t(x + 290, 190, h, 28, col, 700, "middle")
        s += lineas(x + 290, 230, wrap(d, 36), 21, TXT, 30, "middle")
    s += t(930, 335, "Cuatro pruebas, cada una sobre una capa distinta", 28, MINT, 700, "middle")
    pr = [("P1", "Núcleo", "Se apaga crm-core, líder de la base", RED), ("P2", "Borde", "Se apaga crm-edge, dueño de la IP virtual", AMB),
          ("P3", "Extrema", "Caen a la vez el monitoreo principal y un borde", VIO), ("P4", "Planificada", "Cambio de líder ordenado, sin apagar nada", MINT)]
    for i, (n, h, d, col) in enumerate(pr):
        x = 30 + i * 455
        s += caja(x, 370, 430, 260, col, PANEL, 20, 3)
        s += t(x + 30, 430, n, 44, col, 700)
        s += t(x + 110, 430, h, 30, TXT, 700)
        s += lineas(x + 30, 490, wrap(d, 28), 22, TXT, 34)
    s += caja(30, 665, 1800, 105, CY, PANEL, 18, 2.5, True)
    s += lineas(930, 708, ["El apagado es abrupto (Stop, no un cierre ordenado). La hora se toma del historial de tareas de Proxmox", "y los eventos, de los registros de Patroni y Keepalived y del histórico de Kuma."], 22, TXT, 36, "middle")
    return s + pie()


def i26_tiempos():
    s = cabecera()
    s += t(930, 40, "¿Cuánto tardó cada cosa? (segundos)", 30, TXT, 700, "middle")
    filas = [
        ("P1 · Núcleo cae: base con escrituras", 26.4, RED, "26,4 s"),
        ("P2 · Borde cae: IP virtual en el otro borde", 3.0, AMB, "≈ 3 s"),
        ("P4 · Conmutación planificada del núcleo", 4.7, MINT, "≈ 4,7 s"),
        ("P5 · Red partida: hueco real sin escrituras", 26.6, VIO, "26,6 s"),
        ("P6 · Doble caída (etcd de 5): nuevo líder", 27.2, CY, "27,2 s"),
        ("Recuperación: la IP virtual vuelve a crm-edge", 4.0, CY, "≈ 4 s"),
        ("Recuperación: Kuma principal tras encender crm-mon", 28.0, AMB, "28 s"),
    ]
    esc_ = 1020 / 30.0
    for i, (n, v, col, lab) in enumerate(filas):
        y = 90 + i * 93
        s += t(60, y + 18, n, 22, TXT, 500)
        s += caja(60, y + 30, 1020, 34, LINE, BG, 8, 1)
        s += f'<rect x="60" y="{y + 30}" width="{v * esc_:.0f}" height="34" rx="8" fill="{col}" opacity="0.9"/>\n'
        s += t(60 + v * esc_ + 14, y + 56, lab, 23, col, 700)
    s += caja(1180, 90, 650, 590, AMB, PANEL, 22, 3)
    s += ic_reloj(1450, 110, 0.9, AMB)
    s += t(1505, 245, "Por qué 26,4 s y no menos", 26, AMB, 700, "middle")
    s += lineas(1505, 293, ["Casi todo ese tiempo es esperar", "que venza la clave del líder", "en etcd (30 s), no promover.", "", "La promoción en sí duró", "0,296 segundos.", "", "P5 y P6 confirman el mismo", "patrón: el sistema espera lo", "justo para no arriesgarse a", "que dos nodos se crean líder."], 21, TXT, 32, "middle")
    s += t(60, 745, "Todas las pruebas —también las nuevas— con el CRM respondiendo y sin pérdida de datos confirmados", 20, MUT, 400, "start", True)
    return s + pie()


def i27_p1_timeline():
    s = cabecera()
    s += t(930, 55, "P1 · Apagado del núcleo activo (horas UTC)", 32, TXT, 700, "middle")
    s += f'<line x1="250" y1="330" x2="1600" y2="330" stroke="{LINE}" stroke-width="6"/>' + chr(10)
    ev = [(250, "17:25:57", "Se apaga crm-core", "el líder de la base", RED, ic_cruz),
          (700, "17:26:24,131", "Patroni detecta la falla", "venció la clave del líder", AMB, ic_alerta),
          (1150, "+ 48 ms", "toma el bloqueo", "de sesión en etcd", CY, ic_llave),
          (1600, "17:26:24,427", "Escrituras habilitadas", "crm-core-b es el líder", MINT, ic_check)]
    for x, hora, a, b, col, ic in ev:
        s += circulo(x, 330, 20, col, col)
        s += caja(x - 170, 130, 340, 150, col, PANEL, 16, 3)
        s += ic(x - 30, 138, 0.44, col)
        s += t(x, 215, hora, 25, col, 700, "middle")
        s += t(x, 245, a, 20, TXT, 500, "middle")
        s += t(x, 268, b, 18, MUT, 400, "middle")
    s += f'<path d="M250 370 Q475 470 700 370" fill="none" stroke="{AMB}" stroke-width="4" stroke-dasharray="10 8"/>' + chr(10)
    s += t(475, 462, "26,1 s esperando el vencimiento del TTL (30 s)", 22, AMB, 600, "middle")
    s += f'<path d="M700 370 Q1150 500 1600 370" fill="none" stroke="{MINT}" stroke-width="4"/>' + chr(10)
    s += t(1150, 492, "0,296 s de promoción", 24, MINT, 600, "middle")
    s += caja(60, 540, 1740, 220, CY, PANEL, 18, 2.5)
    s += lineas(100, 595, ["• El CRM siguió respondiendo: los microservicios corren activos en ambos núcleos y Nginx omite el núcleo caído.", "• La réplica era sincrónica: la última transacción confirmada fue a las 17:25:24, antes de la falla; no se perdió ninguna.", "• Solo la primera solicitud pagó una espera breve, después ajustada a 1 segundo (incidente 21)."], 23, TXT, 44)
    return s + pie()


def i28_p3_extrema():
    s = cabecera()
    s += t(930, 55, "P3 · Prueba extrema: el monitoreo principal y un borde caen a la vez", 30, TXT, 700, "middle")
    comp = [
        ("crm-mon", "Kuma principal", "APAGADO", RED, ic_ojo),
        ("crm-edge-b", "borde de respaldo", "APAGADO", RED, ic_recepcion),
        ("crm-edge", "borde activo", "en servicio", MINT, ic_recepcion),
        ("Núcleos", "aplicación y base", "en servicio", MINT, ic_boveda),
    ]
    for i, (n, d, est, col, ic) in enumerate(comp):
        x = 30 + i * 455
        s += caja(x, 100, 430, 250, col, PANEL, 20, 3, dash=(col == RED))
        s += ic(x + 175, 118, 0.85, col)
        s += t(x + 215, 240, n, 28, TXT, 700, "middle")
        s += t(x + 215, 275, d, 21, MUT, 400, "middle")
        s += t(x + 215, 320, est, 24, col, 700, "middle")
    s += flecha(930, 355, 930, 420, MINT, 5)
    s += caja(30, 425, 880, 330, MINT, PANEL, 22, 3, glow=True)
    s += ic_globo(410, 445, 0.9, MINT)
    s += t(470, 580, "El CRM sigue funcionando", 30, MINT, 700, "middle")
    s += lineas(470, 630, ["Otro usuario, otra sesión: el sistema responde", "por la IP virtual servida por crm-edge"], 22, TXT, 34, "middle")
    s += caja(950, 425, 880, 330, VIO, PANEL, 22, 3, glow=True)
    s += ic_camara(1330, 445, 0.9, VIO)
    s += t(1390, 580, "El centinela lo detecta", 30, VIO, 700, "middle")
    s += lineas(1390, 630, ["«Kuma principal» en rojo (0 %) y «CRM extremo a", "extremo» en verde: la falla del monitoreo queda", "evidenciada sin afectar el servicio"], 22, TXT, 34, "middle")
    return s + pie()


def i29_recuperacion_limites():
    s = cabecera()
    s += caja(30, 30, 890, 740, MINT, PANEL, 22, 3, glow=True)
    s += t(475, 90, "Al encender de nuevo: vuelve solo", 30, MINT, 700, "middle")
    items = [("Keepalived", "crm-edge recupera la IP virtual por prioridad (≈ 4 s)"), ("Patroni", "el núcleo reincorporado entra como réplica sincrónica, lag 0"),
             ("etcd", "los cinco miembros vuelven a estar sanos"), ("Kuma", "el panel principal vuelve 28 s tras encender su contenedor"),
             ("Aislamiento", "verificado al final: solo los bordes tienen salida a Internet")]
    for i, (a, b) in enumerate(items):
        y = 130 + i * 118
        s += ic_check(60, y + 8, 0.55, MINT)
        s += t(135, y + 32, a, 26, MINT, 700)
        s += lineas(135, y + 66, wrap(b, 46), 21, TXT, 28)
    s += t(475, 735, "Sin intervención manual", 24, AMB, 600, "middle", True)
    s += caja(950, 30, 880, 740, CY, PANEL, 22, 3, glow=True)
    s += t(1390, 90, "Cómo evolucionó el diseño", 30, CY, 700, "middle")
    lim = [("De tolerar 1 falla a tolerar 2", "El árbitro etcd pasó de 3 a 5 miembros; verificado apagando dos máquinas a la vez (P6) sin detener el servicio"),
           ("Restauración ya ensayada", "Un respaldo real se descifró y se restauró con éxito desde la NAS, desde la nube y desde una máquina virtual completa"),
           ("Fallas de disco y de red probadas", "Se simuló un disco lleno y una partición de red del líder: cero pérdidas de datos y cero escrituras dobles"),
           ("Un hallazgo real, corregido", "Una prueba llevó un disco al límite y reveló una mejora de fondo en el almacenamiento compartido; se corrigió sin perder datos")]
    for i, (a, b) in enumerate(lim):
        y = 130 + i * 155
        s += ic_check(985, y + 5, 0.55, CY)
        s += t(1060, y + 30, a, 25, CY, 700)
        s += lineas(1060, y + 62, wrap(b, 50), 20, TXT, 27)
    return s + pie()


def i30_proximos_pasos():
    s = cabecera()
    pasos = [
        ("Segundo servidor", "Cotización formal ya hecha; agrega redundancia física real", ic_server, AMB),
        ("Producción en bare metal", "Migrar del entorno de simulación al servidor de CHIC", ic_edificio, VIO),
        ("Alertar antes del límite", "Aviso automático de espacio en el almacenamiento compartido", ic_alerta, CY),
        ("Formalizar el árbitro de 5", "Llevar la ampliación de etcd al código de Ansible, sin riesgo", ic_engranaje, MINT),
        ("Revisión legal", "Un abogado revisa los documentos de la Ley 21.719", ic_escudo, RED),
    ]
    xs = [200, 565, 930, 1295, 1660]
    s += f'<line x1="120" y1="230" x2="1740" y2="230" stroke="{LINE}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>\n'
    for x, (h, d, ic, col) in zip(xs, pasos):
        s += circulo(x, 230, 80, col, PANEL, 4, glow=True)
        s += ic(x - 38, 192, 0.76, col)
        s += caja(x - 165, 350, 330, 300, col, PANEL, 18, 3)
        s += lineas(x, 410, wrap(h, 20), 26, col, 34, "middle", 700)
        s += lineas(x, 500, wrap(d, 26), 21, TXT, 30, "middle")
    return s + pie()


def i31_ramos():
    s = cabecera()
    ramos = [
        ("Redes Virtuales", "Fuerte", "NAT de VMware, DNAT en Proxmox, bridges virtuales aislados", CY),
        ("Virtualización", "Fuerte", "VMware + Proxmox/KVM, LXC, recursos por VM", MINT),
        ("Arquitectura Cloud", "Fuerte", "Bucket real en Google Cloud Storage: IAM, credencial de solo-creación, verificación por MD5", AMB),
        ("Gestión de Proyectos", "Cubierta", "Acta, EDT, cronograma de 360 h, RACI, riesgos", VIO),
        ("Gestión de Servicios TI (ITIL)", "Fuerte", "Bitácora de 33 incidentes y monitoreo NOC", CY),
        ("Gestión de la Información con TICs", "Fuerte", "Plataforma de código abierto y ampliamente adoptada (Proxmox VE); protección de datos con roles, cifrado y auditoría", VIO),
        ("Diseño y Arquitectura de Redes", "Más fuerte", "FCAPS: fallas, configuración, contabilidad, seguridad, rendimiento", MINT),
    ]
    for i, (n, cob, d, col) in enumerate(ramos):
        cx, cy = i % 4, i // 4
        x = 30 + cx * 455
        y = 40 + cy * 360
        s += caja(x, y, 430, 320, col, PANEL, 20, 3)
        s += lineas(x + 30, y + 55, wrap(n, 26), 26, col, 34, "start", 700)
        c, w = chip(x + 30, y + 160, cob, col, 21)
        s += c
        s += lineas(x + 30, y + 215, wrap(d, 34), 21, TXT, 30)
    return s + pie()


INFOGRAFIAS_3 = {
    "i23_respaldo_flujo": i23_respaldo_flujo, "i24_nas_buzon": i24_nas_buzon, "i25_metodologia_pruebas": i25_metodologia_pruebas,
    "i26_tiempos": i26_tiempos, "i27_p1_timeline": i27_p1_timeline, "i28_p3_extrema": i28_p3_extrema,
    "i29_recuperacion_limites": i29_recuperacion_limites, "i30_proximos_pasos": i30_proximos_pasos, "i31_ramos": i31_ramos,
}
