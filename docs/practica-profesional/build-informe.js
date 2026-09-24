const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, LevelFormat, TableOfContents, Header, Footer,
  PageNumber, VerticalAlign, convertInchesToTwip
} = require("docx");

const DIA = path.join(__dirname, "diagramas");
const EVI = path.join(__dirname, "evidencia");

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
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    children: [new TextRun({ text, ...opts })],
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
    text,
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
      children: [new TextRun({ text, bold: b, size, color: color || undefined })],
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

function imageBlock(fileName, widthPx, heightPx, caption, maxWidth = 560) {
  const filePath = path.join(DIA, fileName);
  const buf = fs.readFileSync(filePath);
  const scale = Math.min(1, maxWidth / widthPx);
  const w = Math.round(widthPx * scale);
  const h = Math.round(heightPx * scale);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: w, height: h } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "666666" })],
    }),
  ];
}

function evidenceImage(fileName, caption, maxWidth = 500) {
  const filePath = path.join(EVI, fileName);
  const buf = fs.readFileSync(filePath);
  // crude PNG header read for dims
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const scale = Math.min(1, maxWidth / w);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: Math.round(w*scale), height: Math.round(h*scale) } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "666666" })],
    }),
  ];
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

module.exports = {
  fs, path, Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, LevelFormat, Header, Footer, PageNumber, VerticalAlign,
  TEAL, TEAL_DARK, AMBER, RED, GRAY, LIGHT, LIGHT_AMBER,
  h1, h2, h3, p, pRich, bold, normal, italic, bullet, numbered, cell, makeTable,
  imageBlock, evidenceImage, pageBreak, codeBlock, DIA, EVI,
};
