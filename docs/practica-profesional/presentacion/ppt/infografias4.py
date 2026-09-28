from svglib import *
from infografias2 import wrap


def i32_cloud_resumen():
    s = cabecera()
    s += t(930, 45, "La copia fuera del PC: Google Cloud Storage", 30, TXT, 700, "middle")
    # izquierda: regla 3-2-1
    s += caja(30, 90, 600, 680, CY, PANEL, 22, 3, glow=True)
    s += t(330, 140, "Regla 3-2-1, cumplida", 27, CY, 700, "middle")
    copias = [("1", "Los núcleos", "la base de datos activa, en dos máquinas", ic_db, CY),
              ("2", "La NAS (disco externo)", "copia cifrada, mismo PC", ic_disco, MINT),
              ("3", "Google Cloud", "copia cifrada, fuera del PC", ic_nube, AMB)]
    for i, (n, h, d, ic, col) in enumerate(copias):
        y = 190 + i * 175
        s += caja(60, y, 540, 150, col, BG, 16, 3)
        s += rotulo(110, y + 75, n, col, 26)
        s += ic(155, y + 40, 0.66, col)
        s += t(270, y + 62, h, 23, col, 700)
        s += lineas(270, y + 92, wrap(d, 28), 19, TXT, 25)
    s += t(330, 730, "Tres copias, en dos medios, una fuera del PC", 20, TXT, 500, "middle")
    # derecha arriba: como se protege
    s += caja(660, 90, 1170, 330, AMB, PANEL, 22, 3)
    s += t(1245, 140, "Cómo se protege el envío", 26, AMB, 700, "middle")
    especs = [("Bucket privado", "us-east1 · sin acceso público, sin datos legibles (todo sale cifrado)", ic_boveda),
              ("Credencial de solo-creación", "esa llave no puede leer, listar ni borrar nada del bucket", ic_llave),
              ("Verificación por MD5", "cada archivo se compara con lo que Google confirma haber recibido", ic_check),
              ("Automático, cada noche", "04:30 UTC, sin intervención humana; Kuma vigila que el envío ocurra", ic_reloj)]
    for i, (h, d, ic) in enumerate(especs):
        x = 700 + (i % 2) * 570
        y = 195 + (i // 2) * 110
        s += ic(x, y, 0.56, AMB)
        s += t(x + 66, y + 26, h, 21, TXT, 700)
        s += lineas(x + 66, y + 54, wrap(d, 38), 17, MUT, 23)
    # derecha abajo: por que importa
    s += caja(660, 440, 1170, 330, MINT, PANEL, 22, 3, glow=True)
    s += ic_escudo(700, 470, 0.9, MINT)
    s += t(800, 515, "Por qué importa para el negocio", 26, MINT, 700)
    s += lineas(700, 565, ["Si el PC completo se pierde —robo, incendio, falla total—, la base de", "datos (empleados, reservas, inventario) se puede recuperar desde", "fuera del edificio. Las máquinas se reconstruyen con el código", "(Terraform y Ansible), ya guardado en GitHub."], 21, TXT, 30)
    s += t(700, 720, "Ensayado con éxito: un respaldo real, restaurado desde la nube", 20, AMB, 600)
    return s + pie()


def i33_pruebas_segunda_tanda():
    s = cabecera()
    s += t(930, 45, "Segunda tanda de pruebas: continuidad y recuperación", 28, TXT, 700, "middle")
    s += t(930, 78, "Mismo método que antes —apagar o forzar una falla real y medir—; esta vez, además, discos, red y restauración", 19, MUT, 400, "middle")
    pr = [
        ("Restauración", "Un respaldo real se descifra y se restaura: NAS, nube y una máquina virtual completa", MINT, ic_carpeta),
        ("P5 · Red partida", "Se aísla al líder de la base sin apagar nada: cero escrituras dobles", VIO, ic_globo),
        ("D1 / D2 · Disco casi lleno", "Disco al 100 % primero en la réplica y luego en el líder: sin fallos", CY, ic_disco),
        ("D2b · Disco agotado", "Se fuerza el límite real; hallazgo de fondo encontrado y corregido sin perder datos", AMB, ic_alerta),
        ("Ampliación de etcd", "El árbitro pasa de 3 a 5 miembros, en caliente, sin cortar el servicio", VIO, ic_escudo),
        ("P6 · Doble caída", "Ya con etcd de 5 miembros, caen dos máquinas a la vez y el servicio sigue", MINT, ic_check),
    ]
    xs = [40 + i * 300 for i in range(6)]
    for x, (h, d, col, ic) in zip(xs, pr):
        s += caja(x, 130, 280, 350, col, PANEL, 20, 3)
        s += ic(x + 108, 160, 0.62, col)
        s += lineas(x + 140, 275, wrap(h, 18), 21, col, 27, "middle", 700)
        s += lineas(x + 140, 335, wrap(d, 25), 17, TXT, 24, "middle")
    s += caja(30, 505, 1800, 265, MINT, PANEL, 22, 3, glow=True)
    s += ic_check(65, 540, 0.85, MINT)
    s += lineas(190, 565, ["En las seis pruebas, el CRM no dejó de responder cuando la mayoría del sistema seguía sana, y cuando", "un componente sí se detuvo, lo hizo por diseño y a propósito, para proteger los datos."], 23, TXT, 33)
    s += lineas(190, 655, ["Cero transacciones perdidas. Cero escrituras duplicadas. Todo medido con relojes y registros reales,", "con la misma disciplina de las primeras cuatro pruebas."], 21, MUT, 30)
    return s + pie()


def i34_hallazgo_disco():
    s = cabecera()
    s += t(930, 45, "Un hallazgo real: el almacenamiento compartido, puesto a prueba", 27, TXT, 700, "middle")
    pasos = [
        ("1", "Se agota un disco, a propósito", "En una prueba de estrés se llena por completo el disco de una máquina, al límite extremo", RED, ic_disco),
        ("2", "Aparece un límite real", "El almacenamiento compartido del servidor se queda sin espacio: dos máquinas se pausan a la vez", AMB, ic_alerta),
        ("3", "El diseño protege los datos", "Patroni, por diseño, no promueve un nuevo líder si no está seguro: cero riesgo de datos incorrectos", CY, ic_escudo),
        ("4", "Se corrige y se verifica", "Se amplía el almacenamiento y se reinicia; datos, usuarios y respaldos quedan intactos", MINT, ic_check),
    ]
    xs = [255, 705, 1155, 1605]
    for x, (n, h, d, col, ic) in zip(xs, pasos):
        s += caja(x - 215, 110, 430, 400, col, PANEL, 20, 3)
        s += rotulo(x - 155, 155, n, col, 26)
        s += ic(x - 42, 165, 0.8, col)
        s += lineas(x, 320, wrap(h, 20), 23, col, 29, "middle", 700)
        s += lineas(x, 395, wrap(d, 27), 18, TXT, 25, "middle")
        if x < 1605:
            s += flecha(x + 220, 300, x + 250, 300, MINT, 3)
    s += caja(30, 540, 1800, 230, MINT, PANEL, 22, 3, glow=True)
    s += ic_check(65, 570, 0.85, MINT)
    s += lineas(190, 595, ["Resultado: cero pérdida de datos, usuarios y respaldos verificados intactos, y el servidor quedó con", "más margen de almacenamiento del que tenía antes de la prueba."], 22, TXT, 32)
    s += lineas(190, 680, ["Este es el propósito de simular antes de producir: encontrar y corregir un límite real en un ambiente", "de prueba, antes de que aparezca en el servidor que usará el Centro CHIC."], 20, AMB, 28)
    return s + pie()


def i35_capacidades_finales():
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
    s += t(1390, 90, "Capacidades de continuidad, verificadas", 28, CY, 700, "middle")
    cap = [("Tolera dos caídas simultáneas", "El árbitro de 5 miembros sostiene el servicio con dos máquinas apagadas a la vez"),
           ("Restauración probada en 3 escenarios", "Un respaldo real se restaura con éxito desde la NAS, la nube y una máquina virtual completa"),
           ("Resiliente ante disco y red", "El servicio se mantiene firme incluso ante un disco lleno o una partición de red del líder"),
           ("Almacenamiento con más margen", "El sistema cuenta hoy con más espacio disponible y mejor protección para los datos")]
    for i, (a, b) in enumerate(cap):
        y = 130 + i * 155
        s += ic_check(985, y + 5, 0.55, CY)
        s += t(1060, y + 30, a, 25, CY, 700)
        s += lineas(1060, y + 62, wrap(b, 50), 20, TXT, 27)
    return s + pie()


def i36_pruebas_disco():
    s = cabecera()
    pr = [
        ("D1", "Disco casi lleno en la réplica", "72 de 72 escrituras aceptadas por el líder, sin fallos", MINT, ic_check),
        ("D2", "Disco casi lleno en el líder", "76 de 76 escrituras aceptadas, sin conmutación", CY, ic_check),
        ("D2b", "Disco agotado del todo en el líder", "Reveló un límite real del almacenamiento compartido del servidor", AMB, ic_alerta),
    ]
    xs = [330, 930, 1530]
    for x, (n, h, d, col, ic) in zip(xs, pr):
        s += caja(x - 280, 60, 560, 420, col, PANEL, 22, 3, dash=(n == "D2b"))
        s += rotulo(x - 220, 115, n, col, 32)
        s += ic(x - 44, 125, 0.9, col)
        s += lineas(x, 300, wrap(h, 26), 25, col, 32, "middle", 700)
        s += lineas(x, 390, wrap(d, 32), 20, TXT, 28, "middle")
    s += caja(30, 520, 1800, 250, MINT, PANEL, 22, 3, glow=True)
    s += ic_check(65, 560, 0.9, MINT)
    s += lineas(190, 590, ["D1 y D2 no mostraron ningún fallo: el margen de disco alcanzó para sostener la escritura real.", "D2b llevó el sistema a su límite real y encontró una mejora de fondo en el almacenamiento compartido."], 24, TXT, 36)
    s += lineas(190, 690, ["Resultado final: cero pérdida de datos en los tres casos, y el servidor quedó con más margen del que tenía antes."], 22, AMB, 32)
    return s + pie()


INFOGRAFIAS_4 = {
    "i32_cloud_resumen": i32_cloud_resumen, "i33_pruebas_segunda_tanda": i33_pruebas_segunda_tanda,
    "i34_hallazgo_disco": i34_hallazgo_disco, "i35_capacidades_finales": i35_capacidades_finales,
    "i36_pruebas_disco": i36_pruebas_disco,
}
