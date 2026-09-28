from svglib import *


def etiqueta_sobre_anillo(cx, y, ancho, texto, color, peso):
    # rotulo con fondo del color del lienzo para que la linea del anillo no atraviese el texto
    return f'<rect x="{cx - ancho // 2}" y="{y - 19}" width="{ancho}" height="36" rx="10" fill="{BG}"/>\n' + t(cx, y + 8, texto, 22, color, peso, "middle")


def i01_hoja_de_ruta():
    s = cabecera()
    xs = [180, 480, 780, 1080, 1380, 1680]
    datos = [
        ("1", "Punto de partida", "Una necesidad real de CHIC", ["Datos dispersos y datos", "de salud por proteger"], ic_edificio, CY),
        ("2", "Infraestructura", "Proxmox, red y máquinas", ["Del PC a un entorno", "virtualizado y aislado"], ic_server, MINT),
        ("3", "Redundancia", "Que nada dependa de 1 máquina", ["Bordes, núcleos y base", "de datos duplicados"], ic_escudo, AMB),
        ("4", "Operación", "Ver, proteger y respaldar", ["Monitoreo NOC, HTTPS", "y respaldo cifrado"], ic_ojo, VIO),
        ("5", "Nube", "Una copia fuera del PC", ["Continuidad ante la", "pérdida del equipo"], ic_nube, CY),
        ("6", "Pruebas", "Apagar de golpe y medir", ["Tiempos reales de", "recuperación, dos tandas"], ic_reloj, RED),
    ]
    s += f'<line x1="90" y1="300" x2="1830" y2="300" stroke="{LINE}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>\n'
    for x, (n, tit, sub, ls, ic, col) in zip(xs, datos):
        s += circulo(x, 300, 80, col, PANEL, 4, glow=True)
        s += ic(x - 36, 262, 0.72, col)
        s += rotulo(x - 62, 230, n, col, 23)
        s += t(x, 462, tit, 28, col, 700, "middle")
        s += t(x, 500, sub, 18, MUT, 400, "middle")
        s += caja(x - 150, 530, 300, 130, col, PANEL, 16, 2)
        s += lineas(x, 583, ls, 22, TXT, 32, "middle")
    return s + pie()


def i02_desafio():
    s = cabecera()
    # columna 1: el problema
    s += t(300, 70, "El problema", 34, AMB, 700, "middle")
    items = [("Personal", 60, 190), ("Calendario", 260, 230), ("Inventario", 80, 360), ("Reservas", 270, 400), ("Chat", 170, 530)]
    for txt, x, y in items:
        s += caja(x, y - 50, 190, 70, AMB, PANEL, 14, 2.5)
        s += t(x + 95, y - 6, txt, 26, TXT, 500, "middle")
    s += lineas(300, 650, ["Cada área trabajaba por su lado:", "datos dispersos y sin control"], 24, MUT, 34, "middle")
    s += flecha(500, 300, 640, 300, AMB)
    # columna 2: restricción
    s += t(930, 70, "La exigencia", 34, CY, 700, "middle")
    s += circulo(930, 300, 170, CY, PANEL, 4, glow=True)
    s += ic_escudo(880, 200, 1.0, CY)
    s += t(930, 350, "Ley 21.719", 36, CY, 700, "middle")
    s += t(930, 392, "Protección de datos", 26, TXT, 400, "middle")
    s += lineas(930, 620, ["Hay datos de salud de los trabajadores:", "deben protegerse por ley"], 24, MUT, 34, "middle")
    s += flecha(1110, 300, 1250, 300, CY)
    # columna 3: solución
    s += t(1560, 70, "La solución", 34, MINT, 700, "middle")
    s += caja(1360, 150, 400, 300, MINT, PANEL, 22, 4, glow=True)
    s += ic_contenedor(1510, 175, 0.95, MINT)
    s += t(1560, 315, "CRM en microservicios", 30, MINT, 700, "middle")
    s += lineas(1560, 360, ["Un servicio por función,", "todo bajo control de CHIC"], 24, TXT, 34, "middle")
    s += lineas(1560, 620, ["Y una infraestructura propia", "que lo mantenga siempre disponible"], 24, MUT, 34, "middle")
    s += t(930, 760, "Centro CHIC · práctica profesional de 360 horas", 24, MUT, 400, "middle", True)
    return s + pie()


def i03_crm_vistazo():
    s = cabecera()
    cx, cy = 930, 400
    s += circulo(cx, cy, 120, CY, PANEL, 4, glow=True)
    s += t(cx, cy - 8, "Portal único", 30, CY, 700, "middle")
    s += t(cx, cy + 30, "(gateway HTTPS)", 22, MUT, 400, "middle")
    mods = [
        ("Empleados", "fichas y datos de salud", 330, 150, ic_persona),
        ("Calendario", "eventos y participantes", 930, 60, ic_reloj),
        ("Inventario", "stock, precios, ubicación", 1530, 150, ic_carpeta),
        ("Reservas", "habitaciones y huéspedes", 330, 560, ic_edificio),
        ("Chat interno", "mensajes y archivos", 930, 660, ic_correo),
        ("Usuarios y accesos", "roles y permisos", 1530, 560, ic_llave),
    ]
    for nombre, sub, x, y, ic in mods:
        s += caja(x - 200, y, 400, 120, CY, PANEL, 18, 3)
        s += ic(x - 185, y + 22, 0.7, CY)
        s += t(x - 100, y + 52, nombre, 28, TXT, 700)
        s += t(x - 100, y + 88, sub, 21, MUT, 400)
        s += flecha(x, y + (120 if y < 400 else 0), cx + (x - cx) * 0.32, cy + (y + 60 - cy) * 0.36, CY, 3, True)
    s += t(60, 785, "Roles: Administrador · Recursos humanos · Recepción · Empleado", 22, AMB, 600)
    return s + pie()


def i04_docker():
    s = cabecera()
    # columna izquierda
    s += caja(30, 250, 250, 120, CY, PANEL)
    s += t(155, 300, "Navegador", 30, TXT, 700, "middle")
    s += t(155, 338, "del usuario", 22, MUT, 400, "middle")
    s += flecha(280, 310, 340, 310, MINT)
    s += caja(340, 190, 250, 240, MINT, PANEL, 18, 3)
    s += t(465, 245, "Frontend", 28, MINT, 700, "middle")
    s += t(465, 280, "páginas web", 21, MUT, 400, "middle")
    s += t(465, 350, "Gateway", 28, MINT, 700, "middle")
    s += t(465, 385, "Nginx: puerta única", 21, MUT, 400, "middle")
    servicios = ["auth", "empleados", "calendario", "inventario", "reservas", "chat"]
    for i, nm in enumerate(servicios):
        y = 80 + i * 100
        s += caja(740, y, 240, 78, CY, PANEL, 14, 3)
        s += t(860, y + 48, f"{nm}-service", 25, TXT, 500, "middle")
        s += flecha(590, 310, 740, y + 39, CY, 2.5, True)
        s += flecha(980, y + 39, 1110, y + 39, MINT, 2.5)
    s += caja(1110, 60, 340, 640, VIO, PANEL, 20, 3)
    s += ic_db(1235, 76, 0.9, VIO)
    s += t(1280, 190, "PostgreSQL", 28, VIO, 700, "middle")
    for i, nm in enumerate(["auth_db", "empleados_db", "calendario_db", "inventario_db", "reservas_db", "chat_db"]):
        y = 80 + i * 100
        s += caja(1150, y + 130 if False else y + 0, 0, 0, VIO) if False else ""
    for i, nm in enumerate(["auth_db", "empleados_db", "calendario_db", "inventario_db", "reservas_db", "chat_db"]):
        s += t(1280, 250 + i * 70, nm, 24, TXT, 500, "middle")
    # panel derecho: orquestacion
    s += caja(1500, 60, 340, 640, AMB, PANEL, 20, 3)
    s += ic_engranaje(1610, 78, 0.8, AMB)
    s += t(1670, 200, "Orquestación", 28, AMB, 700, "middle")
    s += lineas(1670, 245, ["docker compose", "levanta las 9 piezas", "con un solo comando", "", "Cada servicio es", "dueño exclusivo de", "su base de datos", "", "Todo pasa por", "el gateway"], 21, TXT, 34, "middle")
    return s + pie()


def i05_login_jwt():
    s = cabecera()
    pasos = [
        ("1", "Ingresa", ["Usuario y clave", "por HTTPS"], ic_persona),
        ("2", "El gateway", ["enruta la solicitud", "al servicio auth"], ic_globo),
        ("3", "Verifica", ["contraseña con hash", "bcrypt en auth_db"], ic_llave),
        ("4", "Emite el token", ["JWT firmado", "vence en 8 horas"], ic_candado),
        ("5", "Lo presenta", ["cada solicitud lleva", "el token"], ic_correo),
        ("6", "Cada servicio", ["valida token y permiso", "del módulo"], ic_escudo),
    ]
    xs = [170, 460, 750, 1040, 1330, 1620]
    for x, (n, tit, ls, ic) in zip(xs, pasos):
        s += caja(x - 130, 190, 260, 330, CY, PANEL, 20, 3)
        s += rotulo(x, 190, n, AMB, 26)
        s += ic(x - 42, 235, 0.84, CY)
        s += t(x, 370, tit, 28, CY, 700, "middle")
        s += lineas(x, 415, ls, 22, TXT, 32, "middle")
        if x < 1620:
            s += flecha(x + 132, 355, x + 158, 355, MINT, 3)
    s += caja(120, 590, 1620, 130, AMB, PANEL, 18, 2.5, True)
    s += ic_persona(140, 612, 0.6, AMB)
    s += lineas(230, 640, ["Analogía: el token es la pulsera de un evento. Se entrega una vez en la puerta (login)", "y después cada sala solo mira la pulsera: no vuelve a pedir la contraseña."], 25, TXT, 38)
    s += t(930, 770, "Las contraseñas nunca se guardan: solo su huella (hash)", 22, MUT, 400, "middle", True)
    return s + pie()


def i06_seguridad_datos():
    s = cabecera()
    cards = [
        ("Roles y permisos", ["4 perfiles, permisos", "por módulo; el dato de", "salud tiene su propio", "permiso"], ic_llave, CY),
        ("Cifrado en reposo", ["Alergias y medicamentos", "se guardan cifrados", "(Fernet): en la base", "se ve «gAAAA…»"], ic_candado, MINT),
        ("Consentimiento", ["Se registra la fecha", "en que el trabajador", "autoriza el uso de", "sus datos de salud"], ic_check, AMB),
        ("Historial", ["Cada consulta o cambio", "de una ficha queda", "con usuario, fecha", "y acción"], ic_ojo, VIO),
        ("Anonimización", ["Al «eliminar» un", "empleado se borran sus", "datos personales; se", "conserva lo laboral"], ic_carpeta, RED),
    ]
    for i, (tit, ls, ic, col) in enumerate(cards):
        x = 30 + i * 364
        s += caja(x, 60, 340, 560, col, PANEL, 20, 3)
        s += circulo(x + 170, 160, 60, col, "none", 3, glow=True)
        s += ic(x + 128, 118, 0.84, col)
        s += t(x + 170, 275, tit, 27, col, 700, "middle")
        s += lineas(x + 170, 330, ls, 22, TXT, 34, "middle")
    s += caja(30, 650, 1800, 110, CY, PANEL, 18, 2.5, True)
    s += ic_escudo(60, 665, 0.72, CY)
    s += lineas(150, 700, ["Chat interno auditable: se avisa siempre al usuario, los mensajes se ven 30 días y solo el administrador puede auditarlos.", "Todo esto responde a la Ley 21.719 de protección de datos personales."], 24, TXT, 38)
    return s + pie()


def i07_antes_despues():
    s = cabecera()
    s += t(430, 60, "Antes: todo en una sola caja", 34, RED, 700, "middle")
    s += caja(80, 100, 700, 470, RED, PANEL, 22, 3, True)
    s += t(430, 150, "PC con Docker Desktop", 26, MUT, 500, "middle")
    for i, nm in enumerate(["frontend", "gateway", "auth", "empleados", "calendario", "inventario", "reservas", "chat", "postgres"]):
        col, row = i % 3, i // 3
        s += caja(120 + col * 220, 180 + row * 120, 200, 90, CY, BG, 12, 2)
        s += t(220 + col * 220, 235 + row * 120, nm, 23, TXT, 500, "middle")
    for i, m in enumerate(["Si el PC falla, cae todo", "Sin aislamiento de red", "Sin réplica de la base", "Respaldo manual"]):
        s += ic_cruz(60 + (i % 2) * 380 + 20, 600 + (i // 2) * 70 - 5, 0.42, RED)
        s += t(120 + (i % 2) * 380 + 20, 632 + (i // 2) * 70, m, 22, TXT, 400)
    s += flecha(800, 330, 940, 330, AMB, 6)
    s += t(870, 300, "evoluciona", 22, AMB, 600, "middle")
    s += t(1390, 60, "Después: infraestructura diseñada", 34, MINT, 700, "middle")
    s += caja(960, 100, 860, 470, MINT, PANEL, 22, 3, glow=True)
    capas = [("Red aislada y publicación controlada", CY), ("Bordes duplicados con IP virtual", MINT), ("Núcleos duplicados + base con Patroni", AMB), ("Monitoreo NOC fuera de las máquinas", VIO), ("Respaldo cifrado en una NAS", CY), ("Copia redundante en un bucket cloud", MINT)]
    for i, (txt, col) in enumerate(capas):
        y = 128 + i * 70
        s += caja(990, y, 800, 56, col, BG, 12, 2.5)
        s += t(1390, y + 37, txt, 23, TXT, 500, "middle")
    for i, m in enumerate(["Cae una máquina, sigue el servicio", "Aislamiento verificado", "Réplica sincrónica, cero pérdida", "Todo desplegado como código"]):
        s += ic_check(980 + (i % 2) * 400, 600 + (i // 2) * 70 - 5, 0.42, MINT)
        s += t(1040 + (i % 2) * 400, 632 + (i // 2) * 70, m, 22, TXT, 400)
    return s + pie()


def i08_simulacion():
    s = cabecera()
    etapas = [
        ("Simulación", "Proxmox anidado en VMware,", "sobre un solo PC", ic_engranaje, CY, "HECHA"),
        ("Validación", "Pruebas de estrés reales y", "33 incidentes resueltos", ic_check, MINT, "HECHA"),
    ]
    xs = [700, 1160]
    for x, (tit, a, b, ic, col, est) in zip(xs, etapas):
        s += caja(x - 185, 140, 370, 350, col, PANEL, 22, 4, glow=True)
        s += ic(x - 42, 170, 0.84, col)
        s += t(x, 320, tit, 32, col, 700, "middle")
        s += lineas(x, 365, [a, b], 22, TXT, 32, "middle")
        c, w = chip(x - 70, 450, est, col, 22)
        s += c
    s += flecha(700 + 190, 315, 1160 - 190, 315, MINT, 4)
    s += caja(120, 560, 1620, 180, AMB, PANEL, 18, 2.5, True)
    s += ic_persona(150, 590, 0.7, AMB)
    s += lineas(250, 620, ["Analogía: un piloto no vuela un avión comercial sin pasar antes por el simulador.", "Aquí se validó todo antes de tocar el servicio real de CHIC: la base de la migración a producción.", "Resultado: una infraestructura ya probada, lista para el paso siguiente del cronograma."], 25, TXT, 40)
    return s + pie()


def i09_proxmox_capas():
    s = cabecera()
    capas = [
        ("Departamentos", "4 VMs (edge, edge-b, core, core-b)", "2 contenedores (crm-mon, crm-nas)", MINT),
        ("Piso y estructura", "Proxmox VE 9.2: el hipervisor", "reparte CPU, memoria y disco", CY),
        ("Edificio anfitrión", "VMware Workstation", "aloja a Proxmox en una VM", VIO),
        ("Terreno", "PC físico Windows (Ryzen 7)", "el único hardware real", AMB),
    ]
    for i, (nom, a, b, col) in enumerate(capas):
        y = 60 + i * 172
        s += caja(60, y, 900, 150, col, PANEL, 18, 3, glow=(i == 1))
        s += t(100, y + 48, nom, 28, col, 700)
        s += t(100, y + 92, a, 24, TXT, 500)
        s += t(100, y + 128, b, 22, MUT, 400)
    s += t(1400, 60, "¿VM o contenedor?", 32, CY, 700, "middle")
    s += caja(1010, 90, 400, 470, CY, PANEL, 20, 3)
    s += ic_server(1160, 110, 0.9, CY)
    s += t(1210, 240, "Máquina virtual (KVM)", 26, CY, 700, "middle")
    s += lineas(1210, 285, ["Su propio sistema operativo", "y su propio núcleo.", "Aísla más, pesa más.", "", "Aquí: 4 VMs con Ubuntu"], 22, TXT, 34, "middle")
    s += caja(1440, 90, 400, 470, MINT, PANEL, 20, 3)
    s += ic_contenedor(1590, 110, 0.9, MINT)
    s += t(1640, 240, "Contenedor (LXC)", 26, MINT, 700, "middle")
    s += lineas(1640, 285, ["Comparte el núcleo del", "anfitrión: arranca en", "segundos y usa poca", "memoria.", "", "Aquí: monitoreo y NAS"], 22, TXT, 34, "middle")
    s += caja(1010, 600, 830, 130, AMB, PANEL, 18, 2.5, True)
    s += lineas(1425, 650, ["Proxmox anidado no es bare metal, y se declara así:", "es una simulación para aprender antes de ir al servidor real."], 23, TXT, 36, "middle")
    return s + pie()


def i10_red_capas():
    s = cabecera()
    s += t(500, 32, "Red externa (Wi-Fi o celular)", 21, MUT, 700, "middle")
    s += flecha(500, 45, 500, 68, MUT, 3)
    # Zona NAT (exterior)
    s += caja(90, 70, 820, 650, MUT, PANEL, 20, 3)
    s += t(500, 108, "Red NAT VMware — 192.168.80.0/24", 23, MUT, 700, "middle")
    s += t(500, 134, "Proxmox = router · 192.168.80.10", 18, MUT, 400, "middle")
    s += ic_candado(870, 85, 0.5, CY)
    # Zona interna vmbr1 (anidada)
    s += caja(150, 225, 700, 465, CY, BG, 18, 3, glow=True)
    s += t(500, 260, "Red interna vmbr1 — 10.10.10.0/24 (sin puerto físico)", 22, CY, 700, "middle")
    # bordes, con VRRP
    s += caja(190, 330, 290, 120, MINT, PANEL, 14, 3, glow=True)
    s += ic_recepcion(210, 350, 0.55, MINT)
    s += t(455, 380, "crm-edge", 21, TXT, 700, "middle")
    s += t(455, 406, "MASTER · prioridad 150", 15, MINT, 600, "middle")
    s += t(455, 428, "10.10.10.2", 14, MUT, 400, "middle")
    s += caja(580, 330, 290, 120, MUT, BG, 14, 3, dash=True)
    s += ic_recepcion(600, 350, 0.55, MUT)
    s += t(845, 380, "crm-edge-b", 21, TXT, 700, "middle")
    s += t(845, 406, "BACKUP · prioridad 100", 15, MUT, 600, "middle")
    s += t(845, 428, "10.10.10.3", 14, MUT, 400, "middle")
    s += flecha(335, 328, 665, 328, AMB, 3, curva=(500, 292))
    s += t(500, 300, "IP virtual 10.10.10.5 — VRRP, failover ≈ 3 s", 16, AMB, 700, "middle")
    # nucleos
    s += caja(190, 490, 290, 120, CY, PANEL, 14, 3)
    s += ic_boveda(215, 512, 0.5, CY)
    s += t(455, 538, "crm-core", 21, TXT, 700, "middle")
    s += t(455, 564, "app + base (Patroni)", 15, MUT, 400, "middle")
    s += t(455, 585, "10.10.10.10", 14, MUT, 400, "middle")
    s += caja(580, 490, 290, 120, CY, PANEL, 14, 3)
    s += ic_boveda(605, 512, 0.5, CY)
    s += t(845, 538, "crm-core-b", 21, TXT, 700, "middle")
    s += t(845, 564, "app + base (Patroni)", 15, MUT, 400, "middle")
    s += t(845, 585, "10.10.10.11", 14, MUT, 400, "middle")
    s += t(500, 645, "Base de datos replicada entre ambos núcleos (detalle en la etapa 2)", 16, MUT, 400, "middle", True)
    s += caja(1010, 80, 830, 620, CY, PANEL, 20, 3)
    s += t(1425, 135, "Proxmox como guardia de seguridad", 30, CY, 700, "middle")
    s += t(1050, 200, "Entrada (DNAT): solo lo necesario", 25, MINT, 700)
    s += lineas(1050, 240, ["80 y 443  →  IP virtual del CRM", "2211 y 2212  →  SSH de cada borde", "3001  →  panel de monitoreo"], 22, TXT, 34)
    s += t(1050, 380, "Salida (MASQUERADE): restringida", 25, AMB, 700)
    s += lineas(1050, 420, ["Solo los dos bordes salen a Internet", "El núcleo, el monitoreo y la NAS:", "sin puerta de salida"], 22, TXT, 34)
    s += caja(1040, 550, 770, 120, MINT, BG, 14, 2.5, True)
    s += lineas(1425, 595, ["Cambies de Wi-Fi o uses el celular, la infraestructura", "no se entera: vive detrás de su propia red"], 22, TXT, 34, "middle")
    return s + pie()


def i11_nat_bridged():
    s = cabecera()
    s += caja(40, 60, 880, 640, RED, PANEL, 22, 3, True)
    s += t(480, 120, "Modo puenteado (bridged)", 34, RED, 700, "middle")
    s += ic_cruz(440, 145, 0.85, RED)
    s += lineas(100, 300, ["Las VMs quedan en la red externa", "", "• El hotspot descartaba las MAC de las VMs", "   anidadas (solo veía al PC)", "• A Proxmox le asignaron la IP del propio PC", "   y tumbó su conexión", "• Cada cambio de red obligaba a reconfigurar", "   todas las direcciones"], 25, TXT, 38)
    s += caja(940, 60, 880, 640, MINT, PANEL, 22, 3, glow=True)
    s += t(1380, 120, "Red NAT de VMware (elegida)", 34, MINT, 700, "middle")
    s += ic_check(1340, 145, 0.85, MINT)
    s += lineas(1000, 300, ["La infraestructura vive detrás del PC", "", "• Una red privada propia: 192.168.80.0/24", "• Proxmox reenvía solo los puertos necesarios", "• Funciona igual con cualquier Wi-Fi o celular", "• Las VMs no dependen de la red externa"], 25, TXT, 38)
    s += t(930, 765, "Incidentes 13 y 14 de la bitácora · decisión ADR-06", 22, MUT, 400, "middle", True)
    return s + pie()


def i12_topologia():
    s = cabecera()
    s += caja(60, 40, 1200, 90, CY, PANEL, 16, 3)
    s += ic_globo(80, 50, 0.7, CY)
    s += t(660, 100, "Proxmox · router y anfitrión · 192.168.80.10  →  vmbr1 10.10.10.0/24", 26, TXT, 600, "middle")
    # bordes
    s += t(530, 190, "Bordes: recepcionistas (Nginx)", 23, CY, 700, "middle")
    for x, nm, ip in [(190, "crm-edge", "10.10.10.2"), (610, "crm-edge-b", "10.10.10.3")]:
        s += caja(x, 215, 260, 190, CY, PANEL, 18, 3)
        s += ic_recepcion(x + 78, 228, 0.9, CY)
        s += t(x + 130, 345, nm, 26, TXT, 700, "middle")
        s += t(x + 130, 378, ip, 21, MUT, 400, "middle")
    s += flecha(455, 300, 605, 300, MINT, 3, True)
    s += t(530, 275, "IP virtual", 20, MINT, 600, "middle")
    s += t(530, 335, "10.10.10.5", 20, MINT, 600, "middle")
    # nucleos
    s += t(530, 470, "Núcleos: trabajadores y bóveda", 23, MINT, 700, "middle")
    for x, nm, ip in [(190, "crm-core", "10.10.10.10"), (610, "crm-core-b", "10.10.10.11")]:
        s += caja(x, 495, 260, 190, MINT, PANEL, 18, 3)
        s += ic_boveda(x + 78, 508, 0.9, MINT)
        s += t(x + 130, 625, nm, 26, TXT, 700, "middle")
        s += t(x + 130, 658, ip, 21, MUT, 400, "middle")
        s += flecha(x + 130, 405, x + 130, 495, CY, 3)
    s += flecha(455, 590, 605, 590, AMB, 3)
    s += flecha(605, 620, 455, 620, AMB, 3)
    s += t(530, 570, "réplica", 20, AMB, 600, "middle")
    # laterales
    s += caja(1310, 40, 510, 200, VIO, PANEL, 18, 3)
    s += ic_ojo(1330, 60, 0.7, VIO)
    s += t(1570, 95, "crm-mon · 10.10.10.20", 24, VIO, 700, "middle")
    s += lineas(1570, 138, ["Contenedor de monitoreo", "fuera de las VMs (Kuma)"], 21, TXT, 30, "middle")
    s += caja(1310, 270, 510, 200, AMB, PANEL, 18, 3)
    s += ic_disco(1330, 290, 0.7, AMB)
    s += t(1570, 325, "crm-nas · 10.10.10.30", 24, AMB, 700, "middle")
    s += lineas(1570, 368, ["Contenedor NAS de respaldos", "en el disco externo"], 21, TXT, 30, "middle")
    s += caja(1310, 500, 510, 200, CY, PANEL, 18, 3, True)
    s += lineas(1565, 555, ["La regla de oro:", "todo está duplicado.", "La caída de una máquina", "no corta el servicio."], 23, TXT, 34, "middle")
    return s + pie()


INFOGRAFIAS_1 = {
    "i01_hoja_de_ruta": i01_hoja_de_ruta, "i02_desafio": i02_desafio, "i03_crm_vistazo": i03_crm_vistazo,
    "i04_docker": i04_docker, "i05_login_jwt": i05_login_jwt, "i06_seguridad_datos": i06_seguridad_datos,
    "i07_antes_despues": i07_antes_despues, "i08_simulacion": i08_simulacion, "i09_proxmox_capas": i09_proxmox_capas,
    "i10_red_capas": i10_red_capas, "i11_nat_bridged": i11_nat_bridged, "i12_topologia": i12_topologia,
}
