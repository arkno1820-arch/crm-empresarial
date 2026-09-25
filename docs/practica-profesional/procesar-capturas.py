from PIL import Image
import os
CRM = r"C:\Users\HP\Pictures\Screenshots\dentro del crm"
PVE = r"C:\Users\HP\Pictures\Screenshots\evidencias de proxmox"
IMG = r"C:\Users\HP\AppData\Local\Temp\claude\C--Users-HP-Desktop-crm-empresarial\7ccdfe0b-a3e2-4f29-b837-6bfbba62944b\images"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "capturas")

def cargar(ruta):
    return Image.open(ruta).convert("RGB")

def pixelar(im, regiones, bloque=14):
    for (x0, y0, x1, y1) in regiones:
        x1 = min(x1, im.width); y1 = min(y1, im.height)
        reg = im.crop((x0, y0, x1, y1))
        w, h = max(1, (x1-x0)//bloque), max(1, (y1-y0)//bloque)
        reg = reg.resize((w, h), Image.BILINEAR).resize((x1-x0, y1-y0), Image.NEAREST)
        im.paste(reg, (x0, y0))
    return im

def quitar_franja(im, y0, y1):
    """Elimina la franja vertical [y0,y1) (barra de marcadores del navegador)."""
    sup = im.crop((0, 0, im.width, y0)); inf = im.crop((0, y1, im.width, im.height))
    out = Image.new("RGB", (im.width, sup.height + inf.height))
    out.paste(sup, (0, 0)); out.paste(inf, (0, sup.height))
    return out

def tapar_avatar(im, x0, y1):
    """Rellena con el color de fondo de la barra el sector derecho (avatar/menu)."""
    color = im.getpixel((im.width-2, 3))
    for x in range(x0, im.width):
        for y in range(0, y1):
            im.putpixel((x, y), color)
    return im

def guardar(im, nombre):
    im.save(os.path.join(OUT, nombre), optimize=True)
    print(nombre, im.size)

# ---------------- CRM ----------------
c = lambda n: cargar(os.path.join(CRM, f"Captura de pantalla 2026-09-24 {n}.png"))
im = pixelar(c("223857"), [(566,212,700,632),(1100,212,1230,632),(1258,212,1490,632)]); guardar(im, "crm-01-empleados.png")
guardar(c("224012"), "crm-02-calendario.png")
guardar(c("224056"), "crm-03-inventario.png")
im = pixelar(c("224118"), [(418,330,610,356),(418,415,610,441)]); guardar(im, "crm-04-reservas.png")
guardar(c("224135"), "crm-05-habitaciones.png")
guardar(c("224250"), "crm-06-chat-aviso-admin.png")
guardar(c("224218"), "crm-07-chat-rol-empleado.png")
guardar(c("224229"), "crm-08-chat-rol-recepcion.png")
guardar(c("224545"), "crm-10-permisos-rrhh.png")
guardar(c("224559"), "crm-11-permisos-empleado.png")
guardar(c("224612"), "crm-12-permisos-recepcion.png")
guardar(c("224622"), "crm-13-permisos-admin.png")
im = pixelar(c("224734"), [(412,105,748,156),(58,280,392,330),(412,280,748,330),(58,382,748,464),(58,518,748,600)]); guardar(im, "crm-14-ficha-salud-consentimiento.png")
guardar(c("224808"), "crm-15-historial-1.png")
guardar(c("224816"), "crm-16-historial-2.png")
guardar(c("224823"), "crm-17-historial-3.png")
guardar(c("225124"), "crm-18-sin-permiso-salud.png")
guardar(c("225228"), "crm-19-anonimizacion.png")
i = lambda n, ext="png": cargar(os.path.join(IMG, f"{n}.{ext}"))
im = pixelar(i(27), [(426,244,640,270),(426,329,640,355),(426,415,640,441),(426,508,640,534),(426,593,640,619)]); guardar(im, "crm-09-usuarios-lista.png")
guardar(i(28, "webp"), "crm-20-chat-auditoria.png")
guardar(i(32), "crm-21-cifrado-en-base-de-datos.png")

# ---- navegador: login (Edge) ----
im = i(31, "webp"); im = quitar_franja(im, 66, 134); im = tapar_avatar(im, im.width-70, 60); guardar(im, "crm-22-login-fallido-https.png")
im = i(42, "webp"); guardar(im, "_raw-42.png")

# ---------------- Proxmox / red ----------------
p = lambda n: cargar(os.path.join(PVE, f"Captura de pantalla 2026-09-24 {n}.png"))
for n, nombre in [("214022","pve-01-vm100-core-b"),("214036","pve-02-vm101-core"),("214047","pve-03-vm102-edge-b"),("214100","pve-04-vm103-edge"),
                  ("214154","pve-05-red-del-nodo"),("214301","pve-06-edge-hardware"),("214337","pve-07-edge-cloudinit"),
                  ("214406","pve-08-core-hardware"),("214418","pve-09-core-cloudinit"),("214526","vmw-01-adaptador-nat"),
                  ("214605","vmw-02-virtual-network-editor"),("214757","pve-10-script-crm-nat")]:
    guardar(p(n), nombre + ".png")
guardar(i(34), "pve-11-iptables-final.png")
guardar(i(35), "red-01-ping-aislamiento.png")
guardar(i(36), "red-02-ipconfig-pc.png")
guardar(i(38), "tf-01-plan-residual.png")
guardar(i(41), "pve-12-vms-en-ejecucion.png")
guardar(i(43), "ha-01-ciclo-failover.png")
guardar(i(45), "kuma-00-monitores-tras-cambio-de-ip.png")

# ---- failover en el navegador (Edge) ----
im = cargar(os.path.join(OUT, "_raw-42.png")); im = quitar_franja(im, 68, 136); im = tapar_avatar(im, im.width-22, 62); guardar(im, "ha-02-crm-durante-failover.png")
os.remove(os.path.join(OUT, "_raw-42.png"))

# ---- Uptime Kuma (Chrome): quitar marcadores y avatar ----
kuma = [(47,"kuma-01-core-activo",85,152),(48,"kuma-02-core-standby",80,147),(49,"kuma-03-edge-activo",73,142),
        (50,"kuma-04-edge-standby",85,152),(51,"kuma-05-ip-virtual-vrrp",82,150),(52,"kuma-06-postgres",73,142)]
for n, nombre, y0, y1 in kuma:
    im = i(n); im = quitar_franja(im, y0, y1); im = tapar_avatar(im, im.width-150, y0-4); guardar(im, nombre + ".png")
