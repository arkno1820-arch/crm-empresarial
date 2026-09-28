const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const AQUI = __dirname;
const IMG = (n) => path.join(AQUI, "img", n + ".png");
const DIA = (n) => path.join(AQUI, "..", "..", "diagramas", n);
const CAP = (n) => path.join(AQUI, "..", "..", "capturas", n);
const EVI = (n) => path.join(AQUI, "..", "..", "evidencia", n);

// paleta: fondo azul petroleo oscuro, cian/menta como dominantes, ambar como acento
const C = { bg: "182A34", panel: "20343F", line: "3D5C69", txt: "E8F1F2", mut: "9DB2BA", cy: "5FD3C8", mint: "8EE6B8", amb: "F2B35A", red: "EF6B6B", vio: "A99CF0", luz: "F4F5F2" };
const FONT = "Calibri";
const W = 13.333, H = 7.5;

function dims(f) {
  const b = fs.readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// Crea un set de helpers ligados a una instancia de presentacion (pptxgenjs) y a un
// contador de laminas propio, para poder construir varios .pptx desde el mismo motor.
function makeHelpers(pres, opts = {}) {
  const totalEtapas = opts.totalEtapas || 5;
  let contador = 0;

  function base(etapa, title) {
    const s = pres.addSlide();
    contador++;
    s.background = { color: C.bg };
    if (title) s.addText(title, { x: 0.6, y: 0.3, w: 10.3, h: 0.75, fontFace: FONT, fontSize: 30, bold: true, color: C.txt, margin: 0, valign: "middle", isTextBox: true, fit: "shrink" });
    if (etapa) s.addText(etapa, { x: 9.0, y: 0.12, w: 3.75, h: 0.3, fontFace: FONT, fontSize: 11, color: C.mut, align: "right", margin: 0, isTextBox: true, charSpacing: 2 });
    s.slideNumber = { x: 12.2, y: 7.17, w: 0.63, h: 0.26, fontFace: FONT, fontSize: 10, color: C.mut, align: "right" };
    return s;
  }

  function toma(s, texto) {
    if (!texto) return;
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 6.6, w: 12.33, h: 0.52, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    s.addText(texto, { x: 0.7, y: 6.6, w: 11.9, h: 0.52, fontFace: FONT, fontSize: 16, color: C.mint, margin: 0, valign: "middle", isTextBox: true, fit: "shrink" });
  }

  // imagen a la izquierda (ajustada sin deformar) y panel de texto a la derecha
  function fotoTexto(etapa, title, file, claro, pie, titTexto, puntos, notes) {
    const s = base(etapa, title);
    const d = dims(file), asp = d.w / d.h;
    const bw = 6.7, bh = 5.35;
    let w = bw, h = w / asp;
    if (h > bh) { h = bh; w = h * asp; }
    const x = 0.5 + (bw - w) / 2, y = 1.2 + (bh - h) / 2;
    s.addShape(pres.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, fill: { color: claro ? C.luz : C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.1 });
    s.addImage({ path: file, x, y, w, h });
    if (pie) s.addText(pie, { x: 0.5, y: 6.62, w: bw, h: 0.4, fontFace: FONT, fontSize: 12, color: C.mut, align: "center", margin: 0, isTextBox: true, fit: "shrink" });
    s.addShape(pres.ShapeType.roundRect, { x: 7.5, y: 1.2, w: 5.33, h: 5.35, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.14 });
    s.addText(titTexto, { x: 7.75, y: 1.35, w: 4.85, h: 0.6, fontFace: FONT, fontSize: 20, bold: true, color: C.cy, margin: 0, valign: "middle", isTextBox: true, fit: "shrink" });
    s.addText(puntos.map((p, i) => ({ text: p, options: { bullet: true, breakLine: i < puntos.length - 1 } })),
      { x: 7.75, y: 2.05, w: 4.85, h: 4.3, fontFace: FONT, fontSize: 17, color: C.txt, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 10, fit: "shrink" });
    s.addNotes(notes);
    return s;
  }

  // lamina con infografia a todo el ancho
  function info(etapa, title, img, take, notes) {
    const s = base(etapa, title);
    s.addImage({ path: IMG(img), x: 0.5, y: 1.2, w: 12.33, h: 5.31 });
    toma(s, take);
    s.addNotes(notes);
    return s;
  }

  // lamina con 1 o 2 capturas o diagramas; claro = true para imagenes de fondo claro (se enmarcan)
  function fotos(etapa, title, items, take, notes) {
    const s = base(etapa, title);
    const hMax = take ? 4.7 : 5.05, wTot = 12.33, gap = 0.4;
    const asp = items.map((it) => { const d = dims(it.file); return d.w / d.h; });
    let hh = (wTot - gap * (items.length - 1)) / asp.reduce((a, b) => a + b, 0);
    hh = Math.min(hh, hMax);
    const anchos = asp.map((a) => a * hh);
    const total = anchos.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    let x = 0.5 + (wTot - total) / 2;
    const y = 1.2;
    items.forEach((it, i) => {
      s.addShape(pres.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: anchos[i] + 0.16, h: hh + 0.16, fill: { color: it.claro ? C.luz : C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.1 });
      s.addImage({ path: it.file, x, y, w: anchos[i], h: hh });
      if (it.pie) s.addText(it.pie, { x: x - 0.1, y: y + hh + 0.15, w: anchos[i] + 0.2, h: 0.5, fontFace: FONT, fontSize: 12, color: C.mut, align: "center", margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
      x += anchos[i] + gap;
    });
    toma(s, take);
    s.addNotes(notes);
    return s;
  }

  // separador de etapa: numero grande en circulo, titulo y avance con nodos
  function seccion(n, titulo, sub, notes) {
    const s = pres.addSlide();
    contador++;
    s.background = { color: C.bg };
    s.addShape(pres.ShapeType.ellipse, { x: 0.9, y: 2.1, w: 3.2, h: 3.2, fill: { color: C.panel }, line: { color: C.cy, width: 4 } });
    s.addText(String(n), { x: 0.9, y: 2.1, w: 3.2, h: 3.2, fontFace: FONT, fontSize: 130, bold: true, color: C.cy, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText("ETAPA " + n + " DE " + totalEtapas, { x: 4.7, y: 2.2, w: 8, h: 0.4, fontFace: FONT, fontSize: 16, color: C.amb, bold: true, charSpacing: 4, margin: 0, isTextBox: true });
    s.addText(titulo, { x: 4.7, y: 2.7, w: 8.0, h: 1.5, fontFace: FONT, fontSize: 44, bold: true, color: C.txt, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
    s.addText(sub, { x: 4.7, y: 4.35, w: 8.0, h: 1.0, fontFace: FONT, fontSize: 20, color: C.mut, margin: 0, valign: "top", isTextBox: true, fit: "shrink" });
    for (let i = 1; i <= totalEtapas; i++) {
      const x = 4.7 + (i - 1) * 0.55;
      s.addShape(pres.ShapeType.ellipse, { x, y: 6.1, w: 0.3, h: 0.3, fill: { color: i <= n ? C.cy : C.bg }, line: { color: i <= n ? C.cy : C.line, width: 2 } });
    }
    s.addNotes(notes);
    return s;
  }

  // fila de tarjetas con numero grande y texto (para cifras/resultados en vivo, sin infografia)
  function tarjetas(etapa, title, cards, notes, take) {
    const s = base(etapa, title);
    const n = cards.length;
    const gap = 0.24, totalW = 12.33, w = (totalW - gap * (n - 1)) / n;
    cards.forEach((k, i) => {
      const x = 0.5 + i * (w + gap);
      s.addShape(pres.ShapeType.roundRect, { x, y: 1.25, w, h: 2.55, fill: { color: C.panel }, line: { color: k.c || C.cy, width: 2.5 }, rectRadius: 0.16 });
      s.addText(k.n, { x, y: 1.4, w, h: 1.2, fontFace: FONT, fontSize: 40, bold: true, color: k.c || C.cy, align: "center", valign: "middle", margin: 0, isTextBox: true, fit: "shrink" });
      s.addText(k.l, { x: x + 0.15, y: 2.65, w: w - 0.3, h: 1.0, fontFace: FONT, fontSize: 15, color: C.txt, align: "center", valign: "top", margin: 0, isTextBox: true, fit: "shrink" });
    });
    toma(s, take);
    s.addNotes(notes);
    return s;
  }

  // panel de texto a todo el ancho (sin imagen), para explicaciones tecnicas densas
  function texto(etapa, title, bloques, notes, take) {
    const s = base(etapa, title);
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 12.33, h: take ? 5.25 : 5.6, fill: { color: C.panel }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    let y = 1.45;
    bloques.forEach((b) => {
      if (b.h) {
        s.addText(b.h, { x: 0.8, y, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 19, bold: true, color: C.cy, margin: 0, isTextBox: true });
        y += 0.42;
      }
      if (b.p) {
        s.addText(b.p, { x: 0.8, y, w: 11.7, h: 0.5, fontFace: FONT, fontSize: 15.5, color: C.txt, margin: 0, valign: "top", isTextBox: true });
        y += (b.py || 0.5);
      }
      if (b.bullets) {
        s.addText(b.bullets.map((p, i) => ({ text: p, options: { bullet: true, breakLine: i < b.bullets.length - 1 } })),
          { x: 0.8, y, w: 11.7, h: b.bh || 1.0, fontFace: FONT, fontSize: 15, color: C.txt, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 4 });
        y += (b.bh || 1.0);
      }
    });
    toma(s, take);
    s.addNotes(notes);
    return s;
  }

  // tabla nativa de datos (para contenido tecnico)
  function tabla(etapa, title, headers, rows, notes, take, colW) {
    const s = base(etapa, title);
    const body = [
      headers.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: C.cy }, fontFace: FONT, fontSize: 13 } })),
      ...rows.map((r, i) => r.map((c) => ({ text: String(c), options: { color: C.txt, fill: { color: i % 2 ? C.bg : C.panel }, fontFace: FONT, fontSize: 12.5 } }))),
    ];
    s.addTable(body, { x: 0.5, y: 1.2, w: 12.33, h: take ? 5.2 : 5.55, colW, border: { type: "solid", color: C.line, pt: 0.5}, autoPage: false, valign: "middle" });
    toma(s, take);
    s.addNotes(notes);
    return s;
  }

  return { base, toma, fotoTexto, info, fotos, seccion, tarjetas, texto, tabla, dims, get contador() { return contador; } };
}

module.exports = { pptxgen, path, fs, AQUI, IMG, DIA, CAP, EVI, C, FONT, W, H, dims, makeHelpers };
