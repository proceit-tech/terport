import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface ProformaPdfLine {
  code: string;
  concept: string;
  reference: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  totalUSD: number;
  exonerated: boolean;
}

export interface ProformaPdfData {
  number: string;
  status: "DRAFT" | "ISSUED" | "CONVERTED" | "CANCELLED";
  clientCode: string;
  clientName: string;
  ruc: string;
  dispatchNumber: string;
  segmentCode: string;
  segmentName: string;
  direction: "IMPORT" | "EXPORT";
  tariffType: "STANDARD" | "CORPORATE" | "GROUP";
  emissionDateTime: string;
  user: string;
  exchangeRate: number;
  invoiceUSD: number;
  freightUSD: number;
  insuranceUSD: number;
  fobUSD: number;
  commercialBaseUSD: number;
  commercialBasePYG: number;
  containers20: number;
  containers40: number;
  conditionSaleCode: number;
  invoiceCode: number;
  transport: string;
  seller: string;
  orderNumber: string | null;
  notes: string;
  lines: ProformaPdfLine[];
  totalUSD: number;
  totalPYG: number;
}

type Color = ReturnType<typeof rgb>;

const COLORS = {
  navy: rgb(0.09, 0.24, 0.34),
  cyan: rgb(0.04, 0.56, 0.73),
  orange: rgb(0.85, 0.53, 0.18),
  green: rgb(0.18, 0.47, 0.37),
  text: rgb(0.20, 0.34, 0.43),
  muted: rgb(0.47, 0.56, 0.62),
  border: rgb(0.86, 0.90, 0.93),
  light: rgb(0.96, 0.98, 0.99),
  accentLight: rgb(0.93, 0.97, 0.98),
  white: rgb(1, 1, 1),
};

const PAGE = { width: 595.28, height: 841.89, margin: 38 };

function money(value: number, currency: "USD" | "PYG") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PYG" ? 0 : 2,
  }).format(value || 0);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(value: ProformaPdfData["status"]) {
  if (value === "DRAFT") return "Borrador";
  if (value === "ISSUED") return "Emitida";
  if (value === "CONVERTED") return "Convertida en pedido";
  return "Anulada";
}

function tariffLabel(value: ProformaPdfData["tariffType"]) {
  if (value === "CORPORATE") return "Corporativa";
  if (value === "GROUP") return "De grupo";
  return "Estándar";
}

function fitText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;

  let result = clean;
  while (result.length > 1 && font.widthOfTextAtSize(`${result}...`, size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trimEnd()}...`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = String(text ?? "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size = 8,
  color: Color = COLORS.text
) {
  const safeSize =
    typeof size === "number" && Number.isFinite(size) && size > 0 ? size : 8;

  page.drawText(String(text ?? ""), {
    x,
    y,
    font,
    size: safeSize,
    color,
  });
}

function drawRightText(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  font: PDFFont,
  size = 8,
  color: Color = COLORS.text
) {
  const value = String(text);
  const width = font.widthOfTextAtSize(value, size);
  drawText(page, value, xRight - width, y, font, size, color);
}

function roundedBox(page: PDFPage, x: number, y: number, width: number, height: number, fill = COLORS.light, border = COLORS.border) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fill,
    borderColor: border,
    borderWidth: 0.8,
  });
}

function infoBox(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent = false
) {
  roundedBox(page, x, y, width, 38, accent ? COLORS.accentLight : COLORS.light, accent ? rgb(0.82, 0.92, 0.95) : COLORS.border);
  drawText(page, label.toUpperCase(), x + 8, y + 25, fonts.bold, 5.6, accent ? COLORS.cyan : COLORS.muted);
  const valueSize = accent ? 8.8 : 8.2;
  drawText(
    page,
    fitText(value, fonts.bold, valueSize, width - 16),
    x + 8,
    y + 10,
    fonts.bold,
    valueSize,
    accent ? COLORS.cyan : COLORS.text
  );
}

function sectionTitle(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont }, y: number, eyebrow: string, title: string) {
  drawText(page, eyebrow.toUpperCase(), PAGE.margin, y, fonts.bold, 6, COLORS.cyan);
  drawText(page, title, PAGE.margin + 92, y - 0.5, fonts.bold, 8.5, COLORS.text);
}

function pageFooter(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont }, pageNumber: number) {
  const y = 28;
  page.drawLine({ start: { x: PAGE.margin, y: y + 16 }, end: { x: PAGE.width - PAGE.margin, y: y + 16 }, thickness: 0.8, color: COLORS.border });
  drawText(page, "PROFORMA - SIN VALOR COMERCIAL", PAGE.margin, y, fonts.bold, 6.4, COLORS.muted);
  drawRightText(page, `Página ${pageNumber}`, PAGE.width - PAGE.margin, y, fonts.regular, 6.3, COLORS.muted);
}

function addNewPage(pdf: PDFDocument, fonts: { regular: PDFFont; bold: PDFFont }, pageNumber: number) {
  const page = pdf.addPage([PAGE.width, PAGE.height]);
  page.drawRectangle({ x: 0, y: PAGE.height - 8, width: PAGE.width, height: 8, color: COLORS.cyan });
  drawText(page, "TERPORT", PAGE.margin, PAGE.height - 50, fonts.bold, 15, COLORS.navy);
  drawRightText(page, "CONTINUACIÓN DE PROFORMA", PAGE.width - PAGE.margin, PAGE.height - 47, fonts.bold, 6.2, COLORS.muted);
  pageFooter(page, fonts, pageNumber);
  return page;
}

export async function generateProformaPdf(data: ProformaPdfData) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };

  let pageNumber = 1;
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  page.drawRectangle({ x: 0, y: PAGE.height - 8, width: PAGE.width, height: 8, color: COLORS.cyan });

  // Header brand block.
  page.drawRectangle({ x: PAGE.margin, y: PAGE.height - 92, width: 42, height: 42, color: COLORS.navy });
  drawText(page, "T", PAGE.margin + 14, PAGE.height - 80, bold, 22, COLORS.white);
  drawText(page, "TERMINALES PORTUARIAS S.A.", PAGE.margin + 52, PAGE.height - 61, bold, 5.8, COLORS.muted);
  drawText(page, "TERPORT", PAGE.margin + 52, PAGE.height - 77, bold, 17, COLORS.navy);
  drawText(page, "Proforma de Tasas y Servicios", PAGE.margin + 52, PAGE.height - 89, regular, 7, COLORS.muted);

  drawRightText(page, "PROFORMA", PAGE.width - PAGE.margin, PAGE.height - 61, bold, 5.8, COLORS.muted);
  drawRightText(page, data.number, PAGE.width - PAGE.margin, PAGE.height - 78, bold, 14, COLORS.cyan);
  drawRightText(page, dateTime(data.emissionDateTime), PAGE.width - PAGE.margin, PAGE.height - 90, regular, 6.8, COLORS.muted);

  const directionColor = data.direction === "IMPORT" ? COLORS.cyan : COLORS.orange;
  const directionText = data.direction === "IMPORT" ? "IMPORTACIÓN" : "EXPORTACIÓN";
  page.drawRectangle({ x: PAGE.width - PAGE.margin - 86, y: PAGE.height - 116, width: 86, height: 18, color: directionColor });
  drawRightText(page, directionText, PAGE.width - PAGE.margin - 8, PAGE.height - 110, bold, 6.2, COLORS.white);

  let y = PAGE.height - 162;
  const gap = 6;
  const colW = (PAGE.width - PAGE.margin * 2 - gap * 3) / 4;
  const meta = [
    ["Razón social", data.clientName],
    ["RUC", data.ruc],
    ["Código cliente", data.clientCode],
    ["N.º despacho", data.dispatchNumber],
    ["Segmento", data.segmentCode],
    ["Tarifa", tariffLabel(data.tariffType)],
    ["Usuario emisor", data.user],
    ["Estado", statusLabel(data.status)],
  ];

  meta.forEach(([label, value], index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    infoBox(page, fonts, PAGE.margin + col * (colW + gap), y - row * 44, colW, label, value);
  });

  y -= 104;
  sectionTitle(page, fonts, y, "Base de cálculo", data.direction === "IMPORT" ? "Importación - CIF" : "Exportación - FOB");
  y -= 47;

  const baseItems = data.direction === "IMPORT"
    ? [
        ["Valor factura USD", money(data.invoiceUSD, "USD")],
        ["Flete USD", money(data.freightUSD, "USD")],
        ["Seguro USD", money(data.insuranceUSD, "USD")],
        ["CIF USD", money(data.commercialBaseUSD, "USD")],
      ]
    : [
        ["FOB USD", money(data.fobUSD, "USD")],
        ["Base en Gs.", money(data.commercialBasePYG, "PYG")],
        ["Cotización", data.exchangeRate.toLocaleString("es-PY")],
        ["Contenedores", `${data.containers20} x 20' / ${data.containers40} x 40'`],
      ];

  baseItems.forEach(([label, value], index) => {
    infoBox(page, fonts, PAGE.margin + index * (colW + gap), y, colW, label, value, index === 3);
  });

  y -= 58;
  sectionTitle(page, fonts, y, "Datos comerciales", "Información de la operación");
  y -= 47;
  const commercialItems = [
    ["Código factura", String(data.invoiceCode)],
    ["Condición venta", String(data.conditionSaleCode)],
    ["Vendedor", data.seller],
    ["Transporte", data.transport],
  ];
  commercialItems.forEach(([label, value], index) => {
    infoBox(page, fonts, PAGE.margin + index * (colW + gap), y, colW, label, value);
  });

  y -= 58;
  sectionTitle(page, fonts, y, "Conceptos", "Servicios incluidos en la proforma");
  y -= 22;

  const tableX = PAGE.margin;
  const tableW = PAGE.width - PAGE.margin * 2;
  const fixedColWidths = [58, 184, 108, 45, 60];
  const colWidths = [
    ...fixedColWidths,
    tableW - fixedColWidths.reduce((sum, width) => sum + width, 0),
  ];
  const headers = ["CÓDIGO", "CONCEPTO", "REFERENCIA", "CANT.", "PRECIO USD", "TOTAL USD"];
  // The six widths always equal tableW, preventing the last column from
  // crossing the A4 printable area even when the PDF is viewed at 100%.

  function drawTableHeader() {
    page.drawRectangle({ x: tableX, y: y - 24, width: tableW, height: 24, color: rgb(0.94, 0.97, 0.98), borderColor: COLORS.border, borderWidth: 0.8 });
    let x = tableX;
    headers.forEach((header, index) => {
      const width = colWidths[index];

      if (index >= 3) {
        drawRightText(
          page,
          header,
          x + width - 5,
          y - 15,
          bold,
          5.2,
          COLORS.muted
        );
      } else {
        drawText(page, header, x + 5, y - 15, bold, 5.2, COLORS.muted);
      }

      x += width;
    });
    y -= 24;
  }

  function ensureSpace(required: number) {
    if (y - required >= 62) return;
    pageFooter(page, fonts, pageNumber);
    pageNumber += 1;
    page = addNewPage(pdf, fonts, pageNumber);
    y = PAGE.height - 88;
    sectionTitle(page, fonts, y, "Conceptos", "Continuación de servicios");
    y -= 22;
    drawTableHeader();
  }

  drawTableHeader();

  data.lines.forEach((line) => {
    const conceptLines = wrapText(line.concept, regular, 6.2, colWidths[1] - 10).slice(0, 2);
    const refLines = wrapText(line.reference, regular, 6.0, colWidths[2] - 10).slice(0, 2);
    const rowHeight = Math.max(34, 20 + Math.max(conceptLines.length, refLines.length) * 8);
    ensureSpace(rowHeight);

    page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableW, height: rowHeight, color: line.exonerated ? rgb(0.99, 0.98, 0.95) : COLORS.white, borderColor: COLORS.border, borderWidth: 0.6 });

    let x = tableX;
    drawText(page, fitText(line.code, bold, 6.2, colWidths[0] - 10), x + 5, y - 19, bold, 6.2, COLORS.text);
    x += colWidths[0];
    conceptLines.forEach((txt, idx) => drawText(page, txt, x + 5, y - 16 - idx * 8, idx === 0 ? bold : regular, 6.1, COLORS.text));
    if (line.exonerated) drawText(page, "Exonerado", x + 5, y - rowHeight + 7, bold, 5.4, COLORS.orange);
    x += colWidths[1];
    refLines.forEach((txt, idx) => drawText(page, txt, x + 5, y - 16 - idx * 8, regular, 5.9, COLORS.text));
    x += colWidths[2];
    drawRightText(
      page,
      `${line.quantity} ${line.unit}`,
      x + colWidths[3] - 5,
      y - 19,
      regular,
      6.0,
      COLORS.text
    );
    x += colWidths[3];
    drawRightText(page, line.exonerated ? "0,00" : line.unitPriceUSD.toFixed(2), x + colWidths[4] - 5, y - 19, regular, 6.0, COLORS.text);
    x += colWidths[4];
    drawRightText(page, line.exonerated ? "0,00" : line.totalUSD.toFixed(2), x + colWidths[5] - 5, y - 19, bold, 6.2, COLORS.text);
    y -= rowHeight;
  });

  ensureSpace(112);
  y -= 10;
  page.drawRectangle({ x: PAGE.margin, y: y - 82, width: tableW, height: 82, color: COLORS.light, borderColor: COLORS.border, borderWidth: 0.8 });
  drawText(page, "TOTAL A PAGAR", PAGE.margin + 12, y - 19, bold, 6.0, COLORS.muted);
  drawText(page, "Documento informativo. Valores según cotización aplicada a la fecha de emisión.", PAGE.margin + 12, y - 37, regular, 6.9, COLORS.text);
  if (data.notes) {
    const note = fitText(data.notes, regular, 6.2, 300);
    drawText(page, note, PAGE.margin + 12, y - 55, regular, 6.2, COLORS.muted);
  }

  drawRightText(page, "TOTAL USD", PAGE.width - PAGE.margin - 12, y - 18, bold, 5.7, COLORS.muted);
  drawRightText(page, money(data.totalUSD, "USD"), PAGE.width - PAGE.margin - 12, y - 36, bold, 11, COLORS.navy);
  drawRightText(page, "TOTAL Gs.", PAGE.width - PAGE.margin - 12, y - 54, bold, 5.7, COLORS.cyan);
  drawRightText(page, money(data.totalPYG, "PYG"), PAGE.width - PAGE.margin - 12, y - 74, bold, 15, COLORS.cyan);

  if (data.orderNumber) {
    y -= 96;
    page.drawRectangle({ x: PAGE.margin, y: y - 26, width: tableW, height: 26, color: rgb(0.94, 0.98, 0.96), borderColor: rgb(0.85, 0.93, 0.89), borderWidth: 0.8 });
    drawText(page, "CONVERTIDA EN PEDIDO", PAGE.margin + 10, y - 16, bold, 6.0, COLORS.green);
    drawRightText(page, data.orderNumber, PAGE.width - PAGE.margin - 10, y - 16, bold, 8.0, COLORS.green);
  }

  pageFooter(page, fonts, pageNumber);

  const bytes = await pdf.save();
  return bytes;
}

export async function downloadProformaPdf(data: ProformaPdfData) {
  const bytes = await generateProformaPdf(data);

  // pdf-lib retorna Uint8Array<ArrayBufferLike>. Nas tipagens DOM mais novas,
  // Blob exige um BlobPart apoiado por ArrayBuffer. Criar uma nova cópia
  // garante um ArrayBuffer comum e evita conflito com SharedArrayBuffer
  // durante o build de produção do Next.js.
  const pdfBytes = new Uint8Array(bytes.byteLength);
  pdfBytes.set(bytes);

  const blob = new Blob([pdfBytes.buffer], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${data.number}.pdf`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}