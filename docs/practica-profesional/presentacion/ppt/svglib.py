# Libreria minima para dibujar las infografias de la presentacion (estilo plano oscuro con analogias).
# Lienzo comun: 1860 x 800 (proporcion 2,32:1). Cada funcion devuelve un fragmento SVG.
import html

W, H = 1860, 800
BG = "#182a34"
PANEL = "#20343f"
LINE = "#3d5c69"
CY = "#5fd3c8"      # cian principal
MINT = "#8ee6b8"
AMB = "#f2b35a"
RED = "#ef6b6b"
TXT = "#e8f1f2"
MUT = "#93a9b1"
VIO = "#a99cf0"


def esc(t):
    return html.escape(str(t), quote=False)


def cabecera():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Segoe UI, Arial, sans-serif">
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#12232d" stroke-width="1"/></pattern>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <marker id="aC" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="{CY}"/></marker>
  <marker id="aA" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="{AMB}"/></marker>
  <marker id="aM" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="{MINT}"/></marker>
  <marker id="aR" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="{RED}"/></marker>
</defs>
<rect width="{W}" height="{H}" fill="{BG}"/><rect width="{W}" height="{H}" fill="url(#grid)"/>
'''


def pie():
    return "</svg>"


def t(x, y, s, size=26, fill=TXT, w=400, anchor="start", italic=False):
    st = ' font-style="italic"' if italic else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{w}" text-anchor="{anchor}"{st}>{esc(s)}</text>\n'


def lineas(x, y, arr, size=24, fill=TXT, gap=None, anchor="start", w=400):
    gap = gap or int(size * 1.4)
    out = ""
    for i, s in enumerate(arr):
        out += t(x, y + i * gap, s, size, fill, w, anchor)
    return out


def caja(x, y, w, h, color=CY, fill=PANEL, r=18, sw=3, dash=False, glow=False):
    d = ' stroke-dasharray="10 8"' if dash else ""
    g = ' filter="url(#glow)"' if glow else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{color}" stroke-width="{sw}"{d}{g}/>\n'


def tarjeta(x, y, w, h, titulo, arr, color=CY, tsize=30, size=23, icon=None):
    s = caja(x, y, w, h, color)
    s += t(x + 24, y + 46, titulo, tsize, color, 700)
    s += lineas(x + 24, y + 46 + int(size * 1.9), arr, size, TXT, int(size * 1.42))
    return s


def flecha(x1, y1, x2, y2, color=CY, sw=4, dash=False, curva=None):
    m = {CY: "aC", AMB: "aA", MINT: "aM", RED: "aR"}.get(color, "aC")
    d = ' stroke-dasharray="12 9"' if dash else ""
    if curva:
        cx, cy = curva
        return f'<path d="M{x1},{y1} Q{cx},{cy} {x2},{y2}" fill="none" stroke="{color}" stroke-width="{sw}"{d} marker-end="url(#{m})"/>\n'
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"{d} marker-end="url(#{m})"/>\n'


def poli(pts, color=CY, sw=4, dash=False, fin=True):
    m = {CY: "aC", AMB: "aA", MINT: "aM", RED: "aR"}.get(color, "aC")
    d = ' stroke-dasharray="12 9"' if dash else ""
    p = " ".join(f"{a},{b}" for a, b in pts)
    mk = f' marker-end="url(#{m})"' if fin else ""
    return f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="{sw}"{d}{mk}/>\n'


def circulo(cx, cy, r, color=CY, fill="none", sw=3, dash=False, glow=False):
    d = ' stroke-dasharray="10 8"' if dash else ""
    g = ' filter="url(#glow)"' if glow else ""
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{color}" stroke-width="{sw}"{d}{g}/>\n'


def chip(x, y, texto, color=AMB, size=22, pad=18):
    w = int(len(texto) * size * 0.55 + pad * 2)
    s = f'<rect x="{x}" y="{y - size - 8}" width="{w}" height="{size + 22}" rx="{(size + 22) // 2}" fill="none" stroke="{color}" stroke-width="2.5"/>\n'
    s += t(x + pad, y + 4, texto, size, color, 600)
    return s, w


# ------------------------- iconos (trazo, 100x100 aprox. desde (x,y)) -------------------------
def _g(x, y, s, cuerpo, color):
    return f'<g transform="translate({x},{y}) scale({s})" fill="none" stroke="{color}" stroke-width="{3/s:.2f}" stroke-linecap="round" stroke-linejoin="round">{cuerpo}</g>\n'


def ic_persona(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="50" cy="28" r="16"/><path d="M18 90 C18 60 82 60 82 90"/>', c)


def ic_recepcion(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="42" cy="26" r="13"/><path d="M20 62 C20 46 64 46 64 62"/><rect x="10" y="62" width="80" height="26" rx="3"/><rect x="62" y="34" width="26" height="18" rx="2"/><path d="M75 52 V62"/>', c)


def ic_boveda(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="12" y="12" width="76" height="76" rx="6"/><circle cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="6"/><path d="M50 30 V38 M50 62 V70 M30 50 H38 M62 50 H70"/><path d="M22 88 V94 M78 88 V94"/>', c)


def ic_db(x, y, s=1, c=CY):
    return _g(x, y, s, '<ellipse cx="50" cy="20" rx="34" ry="12"/><path d="M16 20 V76 C16 90 84 90 84 76 V20"/><path d="M16 48 C16 62 84 62 84 48"/>', c)


def ic_server(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="14" y="12" width="72" height="24" rx="4"/><rect x="14" y="40" width="72" height="24" rx="4"/><rect x="14" y="68" width="72" height="24" rx="4"/><circle cx="28" cy="24" r="3"/><circle cx="28" cy="52" r="3"/><circle cx="28" cy="80" r="3"/><path d="M50 24 H74 M50 52 H74 M50 80 H74"/>', c)


def ic_candado(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="20" y="42" width="60" height="46" rx="6"/><path d="M32 42 V30 C32 8 68 8 68 30 V42"/><circle cx="50" cy="63" r="6"/><path d="M50 69 V78"/>', c)


def ic_escudo(x, y, s=1, c=CY):
    return _g(x, y, s, '<path d="M50 8 L86 22 V50 C86 72 68 86 50 94 C32 86 14 72 14 50 V22 Z"/><path d="M34 50 L46 62 L68 36"/>', c)


def ic_ojo(x, y, s=1, c=CY):
    return _g(x, y, s, '<path d="M6 50 C22 22 78 22 94 50 C78 78 22 78 6 50 Z"/><circle cx="50" cy="50" r="15"/><circle cx="50" cy="50" r="5"/>', c)


def ic_nube(x, y, s=1, c=CY):
    return _g(x, y, s, '<path d="M28 72 C10 72 8 46 28 44 C28 22 62 16 70 40 C92 40 92 72 72 72 Z"/>', c)


def ic_edificio(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="22" y="10" width="56" height="82" rx="3"/><path d="M34 26 H44 M56 26 H66 M34 44 H44 M56 44 H66 M34 62 H44 M56 62 H66"/><rect x="42" y="74" width="16" height="18"/>', c)


def ic_engranaje(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="50" cy="50" r="15"/><circle cx="50" cy="50" r="32"/><path d="M50 8 V18 M50 82 V92 M8 50 H18 M82 50 H92 M20 20 L27 27 M73 73 L80 80 M80 20 L73 27 M27 73 L20 80"/>', c)


def ic_telefono(x, y, s=1, c=CY):
    return _g(x, y, s, '<path d="M24 14 L40 12 L46 34 L36 42 C42 56 52 66 64 72 L72 62 L92 68 L90 84 C60 96 8 50 24 14 Z"/>', c)


def ic_disco(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="12" y="24" width="76" height="52" rx="8"/><circle cx="34" cy="50" r="12"/><circle cx="34" cy="50" r="3"/><path d="M58 40 H80 M58 50 H80 M58 60 H72"/>', c)


def ic_reloj(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="50" cy="50" r="38"/><path d="M50 26 V50 L68 60"/>', c)


def ic_alerta(x, y, s=1, c=AMB):
    return _g(x, y, s, '<path d="M50 10 L92 86 H8 Z"/><path d="M50 38 V60"/><circle cx="50" cy="73" r="2"/>', c)


def ic_carpeta(x, y, s=1, c=CY):
    return _g(x, y, s, '<path d="M10 24 H38 L46 34 H90 V84 H10 Z"/>', c)


def ic_llave(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="30" cy="50" r="18"/><circle cx="30" cy="50" r="5"/><path d="M48 50 H92 M76 50 V64 M64 50 V60"/>', c)


def ic_globo(x, y, s=1, c=CY):
    return _g(x, y, s, '<circle cx="50" cy="50" r="38"/><ellipse cx="50" cy="50" rx="16" ry="38"/><path d="M12 50 H88 M18 30 H82 M18 70 H82"/>', c)


def ic_camara(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="10" y="30" width="60" height="38" rx="6"/><path d="M70 42 L92 30 V68 L70 56"/><circle cx="34" cy="49" r="9"/>', c)


def ic_check(x, y, s=1, c=MINT):
    return _g(x, y, s, '<circle cx="50" cy="50" r="38"/><path d="M32 52 L46 66 L70 36"/>', c)


def ic_cruz(x, y, s=1, c=RED):
    return _g(x, y, s, '<circle cx="50" cy="50" r="38"/><path d="M34 34 L66 66 M66 34 L34 66"/>', c)


def ic_correo(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="10" y="24" width="80" height="54" rx="5"/><path d="M10 28 L50 56 L90 28"/>', c)


def ic_contenedor(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="8" y="30" width="84" height="46" rx="4"/><path d="M22 30 V76 M36 30 V76 M50 30 V76 M64 30 V76 M78 30 V76"/><path d="M8 30 L18 18 H82 L92 30"/>', c)


def ic_cable(x, y, s=1, c=CY):
    return _g(x, y, s, '<rect x="10" y="38" width="22" height="24" rx="3"/><rect x="68" y="38" width="22" height="24" rx="3"/><path d="M32 50 H68"/>', c)


def rotulo(x, y, n, color=CY, r=22):
    return circulo(x, y, r, color, PANEL, 3) + t(x, y + 9, str(n), 26, color, 700, "middle")
