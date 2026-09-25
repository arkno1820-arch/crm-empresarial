const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, LevelFormat, TableOfContents, Header, Footer,
  PageNumber, VerticalAlign, convertInchesToTwip, PageOrientation, TabStopType, TabStopPosition,
  SequentialIdentifier
} = require("docx");

// A4 en twips (1440 = 1 pulgada). Para landscape, docx-js intercambia
// width/height solo, hay que pasar SIEMPRE las medidas en orientacion
// portrait y el flag orientation: LANDSCAPE hace el swap internamente.
const A4_WIDTH = 11906;
const A4_HEIGHT = 16838;
const MARGIN_PORTRAIT = { top: 1000, bottom: 1000, left: 1100, right: 1100 };
const MARGIN_LANDSCAPE = { top: 800, bottom: 700, left: 700, right: 700, header: 300, footer: 300 };

const DIA = path.join(__dirname, "diagramas");
const EVI = path.join(__dirname, "evidencia");
const CAP = path.join(__dirname, "capturas");

// ---------- estilo / paleta ----------
const TEAL = "1F6F68";
const TEAL_DARK = "0F403C";
const AMBER = "8A5A1C";
const RED = "9B3B47";
const GRAY = "535E5C";
const LIGHT = "E2EFEC";
const LIGHT_AMBER = "FDF4E9";

// ---------- helpers ----------
function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 400, after: 200 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 300, after: 150 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, keepNext: true, spacing: { before: 220, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    children: [new TextRun({ text: String(text).replace(/`/g, ""), ...opts })],
  });
}
function pRich(runs, opts = {}) {
  return new Paragraph({ spacing: { after: 160, line: 276 }, ...opts, children: runs });
}
function bold(text) { return new TextRun({ text, bold: true }); }
function normal(text) { return new TextRun({ text }); }
function italic(text) { return new TextRun({ text, italics: true }); }

let bulletCounter = 0;
function bullet(text, level = 0) {
  return new Paragraph({
    text: String(text).replace(/`/g, ""),
    bullet: { level },
    spacing: { after: 90 },
  });
}
function numbered(text, refName) {
  return new Paragraph({
    text,
    numbering: { reference: refName, level: 0 },
    spacing: { after: 90 },
  });
}

function cell(text, opts = {}) {
  const { width = 2000, shading = null, bold: b = false, size = 20, align = AlignmentType.LEFT, color = null } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text).replace(/`/g, ""), bold: b, size, color: color || undefined })],
    })],
  });
}

function makeTable(widths, headerRow, dataRows, headerShading = TEAL_DARK) {
  const total = widths.reduce((a, b) => a + b, 0);
  const rows = [];
  rows.push(new TableRow({
    tableHeader: true,
    children: headerRow.map((t, i) => cell(t, { width: widths[i], shading: headerShading, bold: true, color: "FFFFFF", size: 19 })),
  }));
  dataRows.forEach((r, idx) => {
    rows.push(new TableRow({
      children: r.map((t, i) => cell(t, { width: widths[i], shading: idx % 2 === 0 ? "F4F5F2" : "FFFFFF", size: 18 })),
    }));
  });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows });
}

// ---------- figuras: imagen + titulo numerado (campo SEQ) + leyenda ----------
function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("No es PNG");
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
let figContador = 0;
function figuraTitulo(titulo) {
  figContador++;
  return new Paragraph({
    style: "Caption", keepNext: true, keepLines: true,
    children: [new TextRun({ text: "Figura " }), new SequentialIdentifier("Figura"), new TextRun({ text: ". " + titulo })],
  });
}
function leyenda(texto) {
  return new Paragraph({ style: "Leyenda", keepLines: true, children: [new TextRun({ text: texto })] });
}
function cargarImagen(dir, file, maxW, maxH) {
  const buf = fs.readFileSync(path.join(dir, file));
  const { w, h } = pngSize(buf);
  const s = Math.min(maxW / w, maxH / h, 1.6);
  return { buf, w: Math.round(w * s), h: Math.round(h * s) };
}
// Una figura completa (imagen centrada, titulo numerado y leyenda que explica que se observa)
function figura(dir, file, titulo, texto, maxW = 1000, maxH = 500) {
  // Hoja completa: usa todo el area util. Los valores chicos (<300 de alto) se respetan
  // porque son capturas apiladas o acompanadas por otra figura en la misma hoja.
  const cajaW = maxH < 300 ? maxW : 1000;
  const cajaH = maxH < 300 ? maxH : 530;
  const { buf, w, h } = cargarImagen(dir, file, cajaW, cajaH);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 60, after: 60 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: w, height: h } })] }),
    figuraTitulo(titulo),
    leyenda(texto),
  ];
}
// Dos figuras lado a lado (para capturas pequenas), cada una con su titulo y leyenda
function figurasPar(dir, a, b, maxW = 480, maxH = 420) {
  const celda = (f) => {
    const { buf, w, h } = cargarImagen(dir, f.file, maxW, maxH);
    return new TableCell({
      width: { size: 7700, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                 left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
      margins: { top: 40, bottom: 40, left: 100, right: 100 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [new ImageRun({ type: "png", data: buf, transformation: { width: w, height: h } })] }),
        figuraTitulo(f.titulo), leyenda(f.texto),
      ],
    });
  };
  return new Table({ width: { size: 15400, type: WidthType.DXA }, columnWidths: [7700, 7700],
    rows: [new TableRow({ children: [celda(a), celda(b)] })] });
}
// Varias figuras apiladas en una misma hoja (capturas muy bajas)
function figurasApiladas(dir, lista, maxW = 700, maxH = 190) {
  return lista.flatMap(f => figura(dir, f.file, f.titulo, f.texto, maxW, maxH));
}
function verificarFiguras(esperadas) {
  if (figContador !== esperadas) throw new Error("Numeracion de figuras: se generaron " + figContador + " y se esperaban " + esperadas);
}

function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function codeBlock(lines) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: "1E1E1E" },
    spacing: { before: 100, after: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: "333333" }, bottom: { style: BorderStyle.SINGLE, size: 2, color: "333333" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "333333" }, right: { style: BorderStyle.SINGLE, size: 2, color: "333333" } },
    children: lines.map((l, i) => new TextRun({ text: l, font: "Consolas", size: 16, color: "D4D4D4", break: i === 0 ? 0 : 1 })),
  });
}

function makeHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "CHIC — CRM Empresarial · Informe de Práctica Profesional", size: 16, color: "999999" })],
    })],
  });
}
function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Página ", size: 16, color: "999999" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" }),
        new TextRun({ text: " de ", size: 16, color: "999999" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "999999" }),
      ],
    })],
  });
}

// Cada llamada crea una NUEVA seccion de Word (salto de seccion = pagina nueva).
// portraitSection/landscapeSection intercalados permiten que los diagramas
// grandes vivan en hojas horizontales sin forzar todo el documento a landscape.
function portraitSection(children) {
  return {
    properties: { page: { size: { width: A4_WIDTH, height: A4_HEIGHT }, margin: MARGIN_PORTRAIT } },
    headers: { default: makeHeader() },
    footers: { default: makeFooter() },
    children,
  };
}
function landscapeSection(children) {
  return {
    properties: {
      page: {
        size: { width: A4_WIDTH, height: A4_HEIGHT, orientation: PageOrientation.LANDSCAPE },
        margin: MARGIN_LANDSCAPE,
      },
    },
    headers: { default: makeHeader() },
    footers: { default: makeFooter() },
    children,
  };
}

module.exports = {
  fs, path, Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, LevelFormat, Header, Footer, PageNumber, VerticalAlign,
  TEAL, TEAL_DARK, AMBER, RED, GRAY, LIGHT, LIGHT_AMBER,
  h1, h2, h3, p, pRich, bold, normal, italic, bullet, numbered, cell, makeTable,
  figura, figurasPar, figurasApiladas, verificarFiguras, figuraTitulo, leyenda, pageBreak, codeBlock, DIA, EVI, CAP,
  TableOfContents, portraitSection, landscapeSection, makeHeader, makeFooter,
};
