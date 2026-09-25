# Procesa las capturas de las pruebas de resiliencia: quita la barra de marcadores del
# navegador, tapa el avatar y difumina datos personales. Los originales no se tocan.
from PIL import Image
import os
E = "evidencia-pendiente"; OUT = "capturas"

def brillo(im, y):
    px = [im.getpixel((x, y)) for x in range(0, im.width, 6)]
    return sum(sum(p[:3]) / 3 for p in px) / len(px)

def hallar_fin_marcadores(im):
    # primera fila (>=100) donde empieza el contenido: linea separadora o cabecera gris
    for y in range(108, min(160, im.height)):
        if brillo(im, y) < 238:
            return y
    return None

def quitar_marcadores(im, y0=62):
    y1 = hallar_fin_marcadores(im)
    if y1 is None or y1 <= y0: return im
    sup = im.crop((0, 0, im.width, y0)); inf = im.crop((0, y1, im.width, im.height))
    out = Image.new("RGB", (im.width, sup.height + inf.height)); out.paste(sup, (0, 0)); out.paste(inf, (0, sup.height))
    return out

def tapar_avatar(im, x0=1780, y1=60):
    if im.width < x0 + 40: return im
    c = im.getpixel((im.width - 2, 3))
    for x in range(x0, im.width):
        for y in range(0, y1): im.putpixel((x, y), c)
    return im

def quitar_edge(im, y0=66):
    # contenido oscuro (barra lateral del CRM) empieza tras los marcadores
    y1 = next((y for y in range(110, min(170, im.height)) if brillo(im, y) < 180), 131)
    sup = im.crop((0, 0, im.width, y0)); inf = im.crop((0, y1, im.width, im.height))
    out = Image.new("RGB", (im.width, sup.height + inf.height)); out.paste(sup, (0, 0)); out.paste(inf, (0, sup.height))
    for x in range(1560, out.width):
        for y in range(0, y0): out.putpixel((x, y), (255, 255, 255))
    return out

def pixelar(im, regiones, bloque=12):
    for (x0, y0, x1, y1) in regiones:
        x1 = min(x1, im.width); y1 = min(y1, im.height)
        r = im.crop((x0, y0, x1, y1)); w, h = max(1, (x1 - x0) // bloque), max(1, (y1 - y0) // bloque)
        im.paste(r.resize((w, h), Image.BILINEAR).resize((x1 - x0, y1 - y0), Image.NEAREST), (x0, y0))
    return im

def cargar(d, f): return Image.open(f"{E}/{d}/{f}").convert("RGB")
def guardar(im, n): im.save(f"{OUT}/{n}", optimize=True); print(n, im.size)

# --- NOC (principal) ---
noc = {"noc-01-app-core-primario":"noc-01-app-core-primario.png","noc-02-app-core-respaldo":"noc-02-app-core-respaldo.png",
       "noc-03-bd-acceso-al-primario":"noc-03-bd-acceso-al-primario.png","noc-04-bd-crm-core":"noc-04-bd-crm-core.png",
       "noc-05-bd-crm-core-b":"noc-05-bd-crm-core-b.png","noc-06-borde-primario":"noc-06-borde-primario.png",
       "noc-07-borde-respaldo":"noc-07-borde-respaldo.png","noc-08-enlace-ip-virtual":"noc-08-enlace-ip-virtual.png",
       "noc-09-infra-nodo-proxmox":"noc-09-infra-nodo-proxmox.png"}
for n, f in noc.items():
    im = tapar_avatar(quitar_marcadores(cargar("kuma-noc", f))); guardar(im, n + ".png")
guardar(cargar("kuma-noc", "pve-vms-y-contenedor-crm-mon.png"), "pve-13-vms-y-contenedor-crm-mon.png")

# --- pruebas de estres ---
P = "pruebas-estres"
guardar(tapar_avatar(quitar_marcadores(cargar(P, "p1-core-apagado-kuma-alarmado.png"))), "p1-kuma-core-apagado.png")
guardar(quitar_edge(cargar(P, "p1-core-apagado-crm-funcionando.png")), "p1-crm-funcionando.png")
guardar(quitar_marcadores(cargar(P, "p1-core-apagado-proxmox-vm101.png")), "p1-proxmox-core-apagado.png")
im = cargar(P, "p2-borde-apagado-crm-funcionando.png")
im = pixelar(im, [(366, 424, 530, 440), (366, 499, 530, 515)])           # correos de huespedes
guardar(quitar_edge(im), "p2-crm-funcionando.png")
guardar(tapar_avatar(quitar_marcadores(cargar(P, "p2-borde-apagado-kuma-alarmado.png"))), "p2-kuma-borde-apagado.png")
guardar(quitar_marcadores(cargar(P, "p2-borde-apagado-proxmox-vm103.png")), "p2-proxmox-borde-apagado.png")
guardar(cargar(P, "p2-kuma-borde-respaldo-tiempos.png"), "p2-kuma-borde-respaldo-tiempos.png")
guardar(cargar(P, "p2-kuma-enlace-ip-virtual-tiempos.png"), "p2-kuma-enlace-tiempos.png")
guardar(cargar(P, "p2-proxmox-task-history-stop.png"), "p2-proxmox-task-history.png")
guardar(quitar_marcadores(cargar(P, "p3-mon-y-edge-b-apagados-proxmox.png")), "p3-proxmox-mon-y-edge-b-apagados.png")
im = cargar(P, "p3-crm-funcionando-otro-usuario.png")
im = pixelar(im, [(366, 350, 500, 372), (366, 425, 520, 447), (366, 500, 520, 523), (366, 576, 520, 598), (366, 661, 580, 682)])  # correos de usuarios
guardar(quitar_edge(im), "p3-crm-otro-usuario.png")
guardar(quitar_marcadores(cargar(P, "p3-kuma-externo-caido.png")), "p3-kuma-externo-caido.png")
guardar(cargar(P, "p3-centinela-detecta-caida-del-principal.png"), "p3-centinela-detecta-caida.png")
