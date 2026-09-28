from svglib import *


def i13_iac():
    s = cabecera()
    pasos = [
        ("Terraform", "Los planos", ["Define en un archivo las", "máquinas, la red y los", "contenedores; los crea", "hablando con Proxmox"], ic_edificio, CY),
        ("cloud-init", "Las llaves", ["Al primer arranque da a", "cada máquina su usuario,", "su llave SSH, su red", "y su DNS"], ic_llave, MINT),
        ("Ansible", "Los obreros", ["Instala y configura todo:", "Nginx, Keepalived, etcd,", "Patroni, HAProxy, Docker,", "Kuma y los respaldos"], ic_engranaje, AMB),
        ("Git y GitHub", "El cuaderno de obra", ["Cada cambio queda con su", "commit: se puede volver", "atrás y explicar qué se", "hizo y cuándo"], ic_carpeta, VIO),
    ]
    xs = [225, 675, 1125, 1575]
    for x, (h, an, ls, ic, col) in zip(xs, pasos):
        s += caja(x - 200, 60, 400, 500, col, PANEL, 22, 3, glow=True)
        s += circulo(x, 160, 62, col, "none", 3)
        s += ic(x - 42, 118, 0.84, col)
        s += t(x, 265, h, 34, col, 700, "middle")
        s += t(x, 305, "«" + an + "»", 24, AMB, 600, "middle")
        s += lineas(x, 360, ls, 22, TXT, 36, "middle")
        if x < 1575:
            s += flecha(x + 205, 310, x + 245, 310, col, 4)
    s += caja(120, 610, 1620, 150, CY, PANEL, 18, 2.5, True)
    s += lineas(930, 665, ["Infraestructura como código: la infraestructura se describe en archivos, se versiona y se puede reconstruir igual cuantas veces haga falta.", "Analogía: en vez de armar la casa de memoria, se entrega el plano y una cuadrilla lo construye siempre igual."], 23, TXT, 40, "middle")
    return s + pie()


def i14_mapa_herramientas():
    s = cabecera()
    her = [
        ("Proxmox VE", "Crea y ejecuta VMs y contenedores; hace de router", ic_server, CY),
        ("VMware", "Aloja a Proxmox en la simulación", ic_edificio, VIO),
        ("Nginx", "Puerta web: HTTPS y reparto entre núcleos", ic_globo, MINT),
        ("Keepalived", "Mueve la IP virtual al borde sano", ic_telefono, AMB),
        ("Docker", "Empaqueta los microservicios del CRM", ic_contenedor, CY),
        ("PostgreSQL", "Guarda los datos, cifrados los de salud", ic_db, MINT),
        ("Patroni", "Elige y cambia el líder de la base", ic_engranaje, AMB),
        ("etcd", "Árbitro: guarda quién es el líder", ic_escudo, VIO),
        ("HAProxy", "Lleva siempre a la base al líder vigente", ic_cable, CY),
        ("Uptime Kuma", "Monitoreo NOC: ve y alerta", ic_ojo, MINT),
        ("GnuPG", "Cifra los respaldos con clave pública", ic_candado, AMB),
        ("OpenSSH", "Acceso solo con llave, sin contraseñas", ic_llave, VIO),
    ]
    for i, (n, d, ic, col) in enumerate(her):
        cx, cy = i % 4, i // 4
        x, y = 40 + cx * 455, 30 + cy * 255
        s += caja(x, y, 430, 225, col, PANEL, 20, 3)
        s += circulo(x + 75, y + 112, 48, col, "none", 3)
        s += ic(x + 39, y + 76, 0.72, col)
        s += t(x + 145, y + 90, n, 30, col, 700)
        s += lineas(x + 145, y + 128, wrap(d, 22), 20, TXT, 28)
    return s + pie()


def wrap(texto, ancho):
    palabras, lin, out = texto.split(), "", []
    for p in palabras:
        if len(lin) + len(p) + 1 > ancho and lin:
            out.append(lin)
            lin = p
        else:
            lin = (lin + " " + p).strip()
    out.append(lin)
    return out


def i15_ip_virtual():
    s = cabecera()
    paneles = [
        ("1 · Operación normal", CY),
        ("2 · Cae el borde principal", RED),
        ("3 · Vuelve el principal", MINT),
    ]
    for k, (tit, col) in enumerate(paneles):
        x0 = 30 + k * 610
        s += caja(x0, 40, 580, 560, col, PANEL, 22, 3)
        s += t(x0 + 290, 95, tit, 28, col, 700, "middle")
        s += ic_persona(x0 + 245, 120, 0.7, MUT)
        s += t(x0 + 290, 215, "Usuario · 10.10.10.5", 21, MUT, 400, "middle")
        # bordes
        for j, (nm, pr) in enumerate([("crm-edge", "prioridad 150"), ("crm-edge-b", "prioridad 100")]):
            bx = x0 + 40 + j * 270
            caido = (k == 1 and j == 0)
            c = RED if caido else (MINT if (k != 1 and j == 0) or (k == 1 and j == 1) else MUT)
            s += caja(bx, 330, 240, 170, c, BG, 16, 3, dash=caido)
            s += ic_recepcion(bx + 78, 340, 0.72, c)
            s += t(bx + 120, 437, nm, 24, TXT, 700, "middle")
            s += t(bx + 120, 470, "CAÍDO" if caido else pr, 20, RED if caido else MUT, 600, "middle")
        # flecha de IP virtual
        activo = 1 if k == 1 else 0
        ax = x0 + 40 + activo * 270 + 120
        s += flecha(x0 + 290, 235, ax, 325, MINT, 4)
        if k == 1:
            s += ic_cruz(x0 + 40 + 78, 340, 0.72, RED)
    s += lineas(335, 535, ["MASTER tiene la IP virtual", "y atiende a los usuarios"], 20, TXT, 28, "middle")
    s += lineas(945, 535, ["La IP salta sola a crm-edge-b", "en unos 3 segundos"], 20, AMB, 28, "middle")
    s += lineas(1555, 535, ["crm-edge recupera la IP por", "su prioridad mayor (≈ 4 s)"], 20, TXT, 28, "middle")
    s += caja(60, 640, 1740, 130, AMB, PANEL, 18, 2.5, True)
    s += ic_telefono(85, 660, 0.6, AMB)
    s += lineas(180, 690, ["Analogía: la IP virtual es el número de un teléfono de atención. Si el operador de turno se cae,", "el número se desvía solo al escritorio de al lado; quien llama nunca cambia de número."], 24, TXT, 40)
    return s + pie()


def i16_nucleo_antes_despues():
    s = cabecera()
    s += caja(30, 40, 890, 720, RED, PANEL, 22, 3, True)
    s += t(475, 95, "Primera versión: redundancia aparente", 30, RED, 700, "middle")
    s += caja(70, 170, 250, 150, CY, BG, 14, 3)
    s += t(195, 235, "crm-core", 26, TXT, 700, "middle")
    s += t(195, 272, "base activa", 21, MUT, 400, "middle")
    s += caja(600, 170, 250, 150, MUT, BG, 14, 3, True)
    s += t(725, 235, "crm-core-b", 26, TXT, 700, "middle")
    s += t(725, 272, "base en espera", 21, MUT, 400, "middle")
    s += flecha(325, 245, 595, 245, AMB, 3, True)
    s += t(460, 222, "volcado cada 15 min", 20, AMB, 500, "middle")
    s += lineas(80, 410, ["• La copia iba con retraso de hasta 15 minutos", "• La promoción era un procedimiento manual", "• Nginx solo conocía a crm-core"], 24, TXT, 40)
    s += caja(80, 560, 780, 150, RED, BG, 14, 2.5)
    s += ic_alerta(100, 580, 0.6, RED)
    s += lineas(190, 615, ["Prueba de estrés: al apagar crm-core,", "cayeron la base de datos y el servicio (error 502)"], 24, TXT, 38)
    s += flecha(925, 400, 965, 400, AMB, 6)
    s += caja(970, 40, 860, 720, MINT, PANEL, 22, 3, glow=True)
    s += t(1400, 95, "Versión final: Patroni + etcd + HAProxy", 30, MINT, 700, "middle")
    s += caja(1010, 170, 250, 150, CY, BG, 14, 3)
    s += t(1135, 235, "crm-core", 26, TXT, 700, "middle")
    s += t(1135, 272, "líder o réplica", 21, MUT, 400, "middle")
    s += caja(1540, 170, 250, 150, CY, BG, 14, 3)
    s += t(1665, 235, "crm-core-b", 26, TXT, 700, "middle")
    s += t(1665, 272, "líder o réplica", 21, MUT, 400, "middle")
    s += flecha(1265, 225, 1535, 225, MINT, 4)
    s += flecha(1535, 265, 1265, 265, MINT, 4)
    s += t(1400, 205, "réplica sincrónica", 20, MINT, 600, "middle")
    s += lineas(1020, 410, ["• Una operación solo se confirma si la réplica la recibió", "• El cambio de líder es automático", "• La aplicación corre activa en los dos núcleos", "• Nginx reparte entre ambos con reintento"], 24, TXT, 40)
    s += caja(1020, 600, 760, 110, MINT, BG, 14, 2.5)
    s += ic_check(1040, 618, 0.55, MINT)
    s += lineas(1120, 650, ["Al apagar el núcleo activo, el servicio siguió", "y no se perdió ninguna transacción confirmada"], 24, TXT, 38)
    return s + pie()


def i17_patroni_etcd_haproxy():
    s = cabecera()
    # etcd
    s += caja(30, 30, 1800, 210, VIO, PANEL, 18, 3)
    s += t(60, 85, "El árbitro (etcd) — 5 miembros", 28, VIO, 700)
    s += lineas(60, 130, ["Analogía: una junta que vota", "quién es el jefe. Ampliada de", "tres a cinco miembros."], 21, TXT, 30)
    for i, nm in enumerate(["crm-edge", "crm-edge-b", "crm-core", "crm-core-b", "crm-mon"]):
        x = 760 + i * 205
        s += circulo(x, 120, 46, VIO, PANEL, 3, glow=True)
        s += ic_persona(x - 26, 92, 0.52, VIO)
        s += t(x, 200, nm, 18, TXT, 500, "middle")
    s += t(1790, 120, "mayoría", 22, AMB, 700, "end") + t(1790, 150, "= 3 de 5", 22, AMB, 700, "end")
    # haproxy
    s += caja(30, 275, 1800, 200, CY, PANEL, 18, 3)
    s += t(60, 330, "El guía (HAProxy)", 30, CY, 700)
    s += lineas(60, 375, ["Analogía: el pasillo inteligente.", "La aplicación no sabe quién es el", "líder: pregunta y HAProxy la lleva."], 22, TXT, 32)
    s += ic_cable(1010, 335, 0.9, CY)
    s += t(1200, 385, "puerto 5000 en cada núcleo", 24, MUT, 400)
    s += t(1200, 420, "comprueba «¿eres el líder?» cada instante", 22, MUT, 400)
    # patroni
    s += caja(30, 510, 1800, 260, MINT, PANEL, 18, 3)
    s += t(60, 565, "Las bases (Patroni + PostgreSQL)", 30, MINT, 700)
    s += lineas(60, 610, ["Un agente por núcleo gestiona", "su PostgreSQL. Ninguno es «el", "principal»: el líder cambia."], 22, TXT, 32)
    s += caja(760, 555, 400, 180, MINT, BG, 16, 3, glow=True)
    s += ic_db(775, 578, 0.62, MINT)
    s += t(985, 615, "Líder", 30, MINT, 700, "middle")
    s += t(985, 650, "crm-core-b · escribe", 22, TXT, 400, "middle")
    s += t(985, 690, "(hoy)", 20, MUT, 400, "middle")
    s += caja(1360, 555, 400, 180, CY, BG, 16, 3)
    s += ic_db(1375, 578, 0.62, CY)
    s += t(1585, 615, "Réplica sincrónica", 28, CY, 700, "middle")
    s += t(1585, 650, "crm-core · lag 0", 22, TXT, 400, "middle")
    s += flecha(1165, 645, 1355, 645, MINT, 4)
    s += flecha(1355, 675, 1165, 675, MINT, 4)
    s += flecha(985, 240, 985, 280, VIO, 3, True)
    s += flecha(985, 475, 985, 550, CY, 5)
    return s + pie()


def i18_quorum():
    s = cabecera()
    s += t(930, 45, "El árbitro se puso a prueba y se reforzó", 30, TXT, 700, "middle")
    # ANTES: 3 miembros
    s += caja(30, 90, 880, 630, MUT, PANEL, 22, 3)
    s += t(470, 140, "ANTES · 3 miembros", 28, MUT, 700, "middle")
    s += t(470, 172, "mayoría = 2 de 3 · tolera 1 caída", 20, MUT, 400, "middle")
    for j, nm in enumerate(["crm-edge", "crm-edge-b", "crm-core-b"]):
        cx = 130 + j * 300
        caido = j >= 1
        s += circulo(cx, 280, 50, RED if caido else MUT, PANEL if not caido else BG, 3, dash=caido)
        s += (ic_cruz(cx - 26, 254, 0.46, RED) if caido else ic_persona(cx - 26, 250, 0.52, MUT))
        s += t(cx, 355, nm, 17, MUT, 500, "middle")
    s += ic_alerta(400, 420, 0.8, RED)
    s += lineas(470, 545, ["Con 2 caídas simultáneas: 1 de 3 votos.", "Sin mayoría: la base se detiene por", "seguridad (sin split-brain) hasta que", "vuelva la mayoría."], 22, TXT, 32, "middle")
    s += t(470, 675, "Límite real, visto en el incidente 20", 19, RED, 600, "middle")
    # DESPUES: 5 miembros
    s += caja(970, 90, 860, 630, MINT, PANEL, 22, 3, glow=True)
    s += t(1400, 140, "AHORA · 5 miembros", 28, MINT, 700, "middle")
    s += t(1400, 172, "mayoría = 3 de 5 · tolera 2 caídas", 20, TXT, 500, "middle")
    for j, nm in enumerate(["crm-edge", "crm-edge-b", "crm-core", "crm-core-b", "crm-mon"]):
        cx = 1035 + j * 175
        caido = j in (1, 3)
        s += circulo(cx, 280, 42, RED if caido else MINT, PANEL if not caido else BG, 3, dash=caido)
        s += (ic_cruz(cx - 22, 258, 0.4, RED) if caido else ic_persona(cx - 22, 254, 0.44, MINT))
        s += t(cx, 345, nm, 15, TXT if not caido else MUT, 500, "middle")
    s += ic_check(1310, 420, 0.8, MINT)
    s += lineas(1400, 545, ["Con las MISMAS 2 caídas simultáneas:", "3 de 5 votos. Mayoría intacta: Patroni", "elige nuevo líder y el CRM no se detiene."], 22, TXT, 32, "middle")
    s += t(1400, 675, "Verificado en P6 (27-09-2026)", 19, MINT, 600, "middle")
    return s + pie()


def i19_viaje_peticion():
    s = cabecera()
    pasos = [
        ("Navegador", "https://192.168.80.10", ic_persona, CY),
        ("Proxmox", "reenvía 443 a la IP virtual", ic_globo, AMB),
        ("Borde (Nginx)", "termina HTTPS y reparte", ic_recepcion, CY),
        ("Núcleo", "gateway y microservicio", ic_boveda, MINT),
        ("HAProxy :5000", "busca al líder de la base", ic_cable, CY),
        ("Base (líder)", "lee o escribe el dato", ic_db, MINT),
    ]
    xs = [170, 460, 750, 1040, 1330, 1620]
    for i, (n, d, ic, col) in enumerate(pasos):
        x = xs[i]
        s += caja(x - 130, 130, 260, 300, col, PANEL, 20, 3)
        s += rotulo(x, 130, i + 1, AMB, 24)
        s += ic(x - 42, 165, 0.84, col)
        s += t(x, 300, n, 25, col, 700, "middle")
        s += lineas(x, 340, wrap(d, 20), 20, TXT, 28, "middle")
        if i < 5:
            s += flecha(x + 132, 280, x + 158, 280, MINT, 3)
    s += poli([(1620, 445), (1620, 500), (170, 500), (170, 445)], AMB, 4, True)
    s += t(895, 490, "la respuesta hace el camino de vuelta", 22, AMB, 500, "middle")
    s += caja(60, 560, 1740, 200, CY, PANEL, 18, 2.5)
    s += lineas(100, 615, ["• En ningún punto hay una sola máquina imprescindible: cada paso tiene un reemplazo.", "• Si un borde cae, la IP virtual pasa al otro. Si un núcleo cae, Nginx usa el otro.", "• Si el líder de la base cae, HAProxy encuentra al nuevo sin reconfigurar nada."], 24, TXT, 42)
    return s + pie()


def i20_seguridad_capas():
    s = cabecera()
    capas = [
        ("Aislamiento de red", "El núcleo no tiene entrada ni salida a Internet", CY),
        ("Transporte", "HTTPS con una CA propia: candado en todos los equipos", MINT),
        ("Acceso a las máquinas", "Solo con llave SSH; ninguna VM tiene contraseña", AMB),
        ("Secretos", "Claves y contraseñas fuera de Git, en carpetas restringidas", VIO),
        ("Aplicación", "Roles y permisos por módulo, token con vencimiento", CY),
        ("Datos", "Salud cifrada en reposo, consentimiento y auditoría", MINT),
        ("Respaldo", "Cifrado con clave pública; receptor de solo escritura", AMB),
        ("Continuidad en la nube", "Copia redundante fuera del PC, en Google Cloud Storage", MINT),
    ]
    for i, (n, d, col) in enumerate(capas):
        y = 25 + i * 92
        w = 1500 - i * 70
        x = 30 + i * 35
        s += caja(x, y, w, 78, col, PANEL, 16, 3)
        s += rotulo(x + 40, y + 39, i + 1, col, 21)
        s += t(x + 80, y + 34, n, 24, col, 700)
        s += t(x + 80, y + 62, d, 19, TXT, 400)
    s += ic_escudo(1640, 300, 1.6, CY)
    s += lineas(1720, 520, ["Defensa en", "profundidad:", "si una capa falla,", "queda la siguiente"], 22, MUT, 32, "middle")
    return s + pie()


def i21_ca_propia():
    s = cabecera()
    s += caja(30, 60, 560, 480, AMB, PANEL, 22, 3)
    s += ic_escudo(240, 90, 1.0, AMB)
    s += t(310, 240, "1 · La CA de CHIC", 30, AMB, 700, "middle")
    s += lineas(310, 290, ["Nuestro propio «registro civil»:", "emite y firma los certificados.", "Su llave privada NO sale nunca", "del equipo del responsable."], 22, TXT, 34, "middle")
    s += flecha(595, 300, 665, 300, AMB, 4)
    s += caja(670, 60, 560, 480, CY, PANEL, 22, 3)
    s += ic_candado(880, 90, 1.0, CY)
    s += t(950, 240, "2 · El certificado de los bordes", 28, CY, 700, "middle")
    s += lineas(950, 290, ["Firmado por la CA e incluye las", "direcciones del CRM (SAN).", "Cada servidor lo presenta al", "conectarse: «soy el CRM real»."], 22, TXT, 34, "middle")
    s += flecha(1235, 300, 1305, 300, CY, 4)
    s += caja(1310, 60, 520, 480, MINT, PANEL, 22, 3)
    s += ic_check(1490, 90, 1.0, MINT)
    s += t(1570, 240, "3 · El dispositivo confía", 30, MINT, 700, "middle")
    s += lineas(1570, 290, ["Se instala la CA una sola vez", "(se descarga de /ca.crt).", "Desde ahí muestra candado", "sin advertencias."], 22, TXT, 34, "middle")
    s += caja(30, 580, 1800, 190, VIO, PANEL, 18, 2.5, True)
    s += ic_persona(60, 605, 0.6, VIO)
    s += lineas(150, 640, ["Analogía: sin una CA propia, cada certificado es un carné que uno mismo se firma y el navegador desconfía («no seguro»).", "Con una CA propia es como un registro civil corporativo: se confía en él una vez y todo lo que firma queda validado.", "Verificado también en un segundo notebook conectado al celular, con candado y sin advertencias."], 22, TXT, 38)
    return s + pie()


def i22_noc():
    s = cabecera()
    # ojo grande
    s += caja(30, 40, 560, 340, CY, PANEL, 22, 3, glow=True)
    s += ic_ojo(215, 60, 1.3, CY)
    s += t(310, 245, "Panel principal (crm-mon)", 27, CY, 700, "middle")
    s += lineas(310, 290, ["Uptime Kuma en un contenedor", "fuera de las VMs: si una VM se", "cae, el vigilante sigue vivo"], 22, TXT, 32, "middle")
    s += caja(30, 420, 560, 340, VIO, PANEL, 22, 3)
    s += ic_camara(230, 440, 0.9, VIO)
    s += t(310, 560, "Centinela (en el borde)", 27, VIO, 700, "middle")
    s += lineas(310, 605, ["Un Kuma pequeño de dos monitores:", "vigila al principal y al servicio", "de punta a punta"], 22, TXT, 32, "middle")
    s += flecha(590, 590, 640, 590, VIO, 3, True)
    # 12 sensores
    s += t(1230, 70, "12 sensores, agrupados por capa", 30, MINT, 700, "middle")
    grupos = [
        ("INFRA", 1, "El hipervisor Proxmox", CY),
        ("ENLACE", 1, "La IP virtual: lo que ve el usuario", MINT),
        ("BORDE", 2, "Nginx de cada borde", AMB),
        ("APP", 2, "Los microservicios de cada núcleo", CY),
        ("BD", 4, "Acceso y gestor de la base, por núcleo", VIO),
        ("RESPALDO", 2, "Enlace a la NAS y «último respaldo»", RED),
    ]
    for i, (n, c, d, col) in enumerate(grupos):
        y = 105 + i * 105
        s += caja(650, y, 1180, 90, col, PANEL, 14, 3)
        s += t(690, y + 55, n, 27, col, 700)
        for k in range(c):
            s += circulo(940 + k * 40, y + 45, 13, col, col)
        s += t(1130, y + 55, d, 23, TXT, 400)
    s += t(1240, 760, "Nombres de NOC: «CAPA · elemento · función»", 22, MUT, 400, "middle", True)
    return s + pie()


INFOGRAFIAS_2 = {
    "i13_iac": i13_iac, "i14_mapa_herramientas": i14_mapa_herramientas, "i15_ip_virtual": i15_ip_virtual,
    "i16_nucleo_antes_despues": i16_nucleo_antes_despues, "i17_patroni_etcd_haproxy": i17_patroni_etcd_haproxy,
    "i18_quorum": i18_quorum, "i19_viaje_peticion": i19_viaje_peticion, "i20_seguridad_capas": i20_seguridad_capas,
    "i21_ca_propia": i21_ca_propia, "i22_noc": i22_noc,
}
