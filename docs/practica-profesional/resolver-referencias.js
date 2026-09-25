// Resuelve las referencias cruzadas del informe. El texto usa marcadores  ⟦clave⟧ ; aqui se
// sabe que archivo de figura corresponde a cada clave. El numero real de cada figura se lee de Word
// (campo SEQ) y se sustituye en el .docx ya generado.
const fs = require("fs");
const JSZip = require("jszip");

const MAPA = {
  justif: "07-justificacion-cruzada-ramos.png", infra: "04-infraestructura-proxmox.png",
  contexto: "01-alto-nivel-contexto.png", modulos: "02-modulos-docker.png",
  gantt: "05-cronograma-gantt.png", vmwnat: "vmw-01-adaptador-nat.png", vmwnet: "vmw-02-virtual-network-editor.png",
  ipconfig: "red-02-ipconfig-pc.png", redpve: "pve-05-red-del-nodo.png", crmnat: "pve-10-script-crm-nat.png",
  iptables: "pve-11-iptables-final.png", ping: "red-01-ping-aislamiento.png", edgehw: "pve-06-edge-hardware.png",
  edgeci: "pve-07-edge-cloudinit.png", corehw: "pve-08-core-hardware.png", coreci: "pve-09-core-cloudinit.png",
  vms: "pve-12-vms-en-ejecucion.png", tfplan: "tf-01-plan-residual.png",
  certdet: "2026-09-23-08-detalle-certificado-ca.png", candado: "2026-09-23-09-candado-conexion-segura.png",
  pvemon: "pve-13-vms-y-contenedor-crm-mon.png", noc1: "noc-01-app-core-primario.png", noc9: "noc-09-infra-nodo-proxmox.png",
  kumarojo: "kuma-00-monitores-tras-cambio-de-ip.png", kuma1: "kuma-01-core-activo.png", kuma6: "kuma-06-postgres.png",
  kumab: "kuma-07-instancia-crm-edge-b.png", kumaprueba: "kuma-08-prueba-estres-instancia-b.png",
  login: "crm-22-login-fallido-https.png", usuarios: "crm-09-usuarios-lista.png", sinpermiso: "crm-18-sin-permiso-salud.png",
  cifrado: "crm-21-cifrado-en-base-de-datos.png", patronipiezas: "11-patroni-donde-vive-cada-pieza.png",
  antesdespues: "08-conmutacion-antes-despues.png", ltnucleo: "09-conmutacion-linea-de-tiempo.png",
  ltborde: "10-conmutacion-borde-linea-de-tiempo.png", p1proxmox: "p1-proxmox-core-apagado.png",
  p1crm: "p1-crm-funcionando.png", p1kuma: "p1-kuma-core-apagado.png", p2proxmox: "p2-proxmox-borde-apagado.png",
  p2taskhist: "p2-proxmox-task-history.png", p2kuma: "p2-kuma-borde-apagado.png", p2crm: "p2-crm-funcionando.png",
  p2enlace: "p2-kuma-enlace-tiempos.png", p2respaldo: "p2-kuma-borde-respaldo-tiempos.png",
  p3proxmox: "p3-proxmox-mon-y-edge-b-apagados.png", p3kumacaido: "p3-kuma-externo-caido.png",
  p3crm: "p3-crm-otro-usuario.png", p3centinela: "p3-centinela-detecta-caida.png",
  ciclo: "ha-01-ciclo-failover.png", crmfailover: "ha-02-crm-durante-failover.png",
  permrrhh: "crm-10-permisos-rrhh.png", permadm: "crm-13-permisos-admin.png",
};

const ABRE = String.fromCharCode(0x27e6);
const CIERRA = String.fromCharCode(0x27e7);

function leerTabla(ruta) {
  const TAB = String.fromCharCode(9), LF = String.fromCharCode(10), CR = String.fromCharCode(13);
  const num = {};
  fs.readFileSync(ruta, "utf8").split(LF).forEach(linea => {
    const l = linea.split(CR).join("");
    if (!l) return;
    const p = l.split(TAB);
    const n = Number(p[0]); const a = (p[1] || "").trim();
    if (a && !(a in num)) num[a] = n;
  });
  return num;
}

// quita, sin usar expresiones regulares, los runs que contienen el marcador oculto  [[archivo]]
function quitarMarcadores(xml) {
  const ini = "<w:r>", fin = "</w:r>";
  let salida = "", pos = 0;
  while (true) {
    const a = xml.indexOf(ini, pos);
    if (a < 0) { salida += xml.slice(pos); break; }
    const b = xml.indexOf(fin, a);
    if (b < 0) { salida += xml.slice(pos); break; }
    const run = xml.slice(a, b + fin.length);
    if (run.indexOf("[[") >= 0 && run.indexOf("]]") >= 0 && run.indexOf("<w:sz w:val=\"2\"/>") >= 0) {
      salida += xml.slice(pos, a);                 // se omite el run oculto
    } else {
      salida += xml.slice(pos, b + fin.length);
    }
    pos = b + fin.length;
  }
  return salida;
}

async function resolver(docxPath, tablaTxt) {
  const num = leerTabla(tablaTxt);
  const zip = await JSZip.loadAsync(fs.readFileSync(docxPath));
  let xml = await zip.file("word/document.xml").async("string");
  let total = 0; const faltan = new Set();
  // sustitucion de marcadores ⟦clave⟧ por el numero real
  let salida = "", pos = 0;
  while (true) {
    const a = xml.indexOf(ABRE, pos);
    if (a < 0) { salida += xml.slice(pos); break; }
    const b = xml.indexOf(CIERRA, a);
    const clave = xml.slice(a + 1, b);
    const arch = MAPA[clave];
    let n = arch ? num[arch] : undefined;
    if (!arch) faltan.add("clave sin archivo: " + clave);
    else if (!n) faltan.add("archivo no incluido en el documento: " + arch + " (" + clave + ")");
    salida += xml.slice(pos, a) + (n ? String(n) : xml.slice(a, b + 1));
    if (n) total++;
    pos = b + 1;
  }
  xml = quitarMarcadores(salida);
  if (faltan.size) throw new Error("Referencias sin resolver:\n  " + [...faltan].join("\n  "));
  zip.file("word/document.xml", xml);
  fs.writeFileSync(docxPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  return total;
}
module.exports = { resolver, MAPA };
