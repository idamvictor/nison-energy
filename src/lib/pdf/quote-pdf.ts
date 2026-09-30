// Shared A4 layout for the three OZEV quotations (renters, landlord,
// workplace), drawn with jsPDF + jspdf-autotable in the browser. Each quote
// module only describes its content (details, line items, summary, notes);
// this file owns the look: navy headings, shaded rows, Helvetica.
//
// jsPDF's built-in Helvetica only covers Latin-1/WinAnsi, so text is passed
// through `pdfText()` to swap characters it can't draw (e.g. "−", "→").

import type { jsPDF } from "jspdf";

const NAVY = "#1F3864";
const RULE = "#2E75B6";
const SHADE = "#EAF1F8";
const TEXT = "#262626";
const MUTED = "#595959";
const GREEN = "#1F6E52";
const BORDER = "#BFC9D6";

const MARGIN = 14; // mm
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PT_TO_MM = 0.3528;

export type DetailLine = [label: string, value: string];

export type SummaryLine = {
  label: string;
  value: string;
  bold?: boolean;
  shaded?: boolean;
  /** Grant/voucher deductions are shown in green. */
  deduction?: boolean;
};

export type QuotePdfSpec = {
  /** PDF document title (metadata). */
  docTitle: string;
  /** Small grey line(s) under "Nison Limited". */
  strapline: string[];
  title: string;
  /** Optional line under the title, e.g. "Quote/Invoice No.: … Date of Issue: …". */
  meta?: DetailLine[];
  left: { heading: string; lines: DetailLine[] };
  right: { heading: string; lines: DetailLine[] };
  items: {
    heading: string;
    head: string[];
    rows: string[][];
    align: ("left" | "center" | "right")[];
    /** Optional fixed widths (mm) per column; unset columns share the rest. */
    widths?: (number | undefined)[];
  };
  summary: SummaryLine[];
  summaryNote: string;
  sections: { heading: string; bullets: string[] }[];
};

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function fmtMoney(n: number): string {
  return currency.format(n);
}

/** Map characters Helvetica (WinAnsi) can't draw onto safe equivalents. */
export function pdfText(value: string): string {
  return value
    .replace(/−/g, "-") // minus sign
    .replace(/→/g, "->") // right arrow
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ");
}

/** Builds the quote PDF. jsPDF is loaded on demand to keep it out of the page bundle. */
export async function buildQuotePdf(spec: QuotePdfSpec): Promise<Blob> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setProperties({ title: spec.docTitle, author: "Nison Limited", creator: "Ocunio Energy" });

  let y = MARGIN;

  const lineHeight = (size: number, factor = 1.3) => size * PT_TO_MM * factor;

  /** Starts a new page if `needed` mm won't fit. */
  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 14) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const setFont = (size: number, style: "normal" | "bold" | "italic" = "normal", color = TEXT) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  const heading = (text: string, size: number, gapAfter = 1.8) => {
    ensureSpace(lineHeight(size) + 8);
    setFont(size, "bold", NAVY);
    y += size * PT_TO_MM;
    doc.text(pdfText(text), MARGIN, y);
    y += gapAfter;
  };

  // ── Header ────────────────────────────────────────────────────────────
  setFont(17, "bold", NAVY);
  y += 17 * PT_TO_MM;
  doc.text("Nison Limited", MARGIN, y);
  y += 1.2;
  setFont(9.5, "normal", MUTED);
  for (const line of spec.strapline) {
    y += lineHeight(9.5);
    doc.text(pdfText(line), MARGIN, y);
  }
  y += 4;

  setFont(15, "bold", NAVY);
  y += 15 * PT_TO_MM;
  doc.text(pdfText(spec.title), MARGIN, y, { maxWidth: CONTENT_W });
  y += 2.2;
  doc.setDrawColor(RULE);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  if (spec.meta?.length) {
    let x = MARGIN;
    y += 10 * PT_TO_MM;
    for (const [label, value] of spec.meta) {
      setFont(10, "bold");
      doc.text(pdfText(label), x, y);
      x += doc.getTextWidth(pdfText(label)) + 1.5;
      setFont(10, "normal");
      doc.text(pdfText(value), x, y);
      x += doc.getTextWidth(pdfText(value)) + 7;
    }
    y += 4;
  }

  // ── Installer / client details, side by side ─────────────────────────
  const colGap = 8;
  const colW = (CONTENT_W - colGap) / 2;
  const detailSize = 9.5;
  const detailLH = lineHeight(detailSize, 1.35);

  /** Draws "Label: value" rows in a column; long values wrap under themselves. Returns the end y. */
  const drawDetails = (x: number, startY: number, block: QuotePdfSpec["left"]) => {
    let cy = startY;
    setFont(11.5, "bold", NAVY);
    cy += 11.5 * PT_TO_MM;
    doc.text(pdfText(block.heading), x, cy);
    cy += 1.2;
    for (const [label, value] of block.lines) {
      const labelText = pdfText(label);
      setFont(detailSize, "bold");
      const labelW = doc.getTextWidth(labelText) + 1.2;
      // Very long labels push the value onto its own line.
      const inline = labelW < colW * 0.55;
      const valueX = inline ? x + labelW : x;
      setFont(detailSize, "normal");
      const valueLines: string[] = doc.splitTextToSize(pdfText(value || "—"), colW - (valueX - x));
      cy += detailLH;
      setFont(detailSize, "bold");
      doc.text(labelText, x, cy);
      setFont(detailSize, "normal");
      if (!inline) cy += detailLH;
      valueLines.forEach((line, i) => {
        if (i > 0) cy += detailLH;
        doc.text(line, valueX, cy);
      });
    }
    return cy;
  };

  const leftEnd = drawDetails(MARGIN, y, spec.left);
  const rightEnd = drawDetails(MARGIN + colW + colGap, y, spec.right);
  y = Math.max(leftEnd, rightEnd) + 5.5;

  // ── Itemised table ────────────────────────────────────────────────────
  heading(spec.items.heading, 12.5, 2);
  const columnStyles: Record<number, { halign: "left" | "center" | "right"; cellWidth?: number }> = {};
  spec.items.align.forEach((halign, i) => {
    const width = spec.items.widths?.[i];
    columnStyles[i] = width ? { halign, cellWidth: width } : { halign };
  });
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [spec.items.head.map(pdfText)],
    body: spec.items.rows.map((row) => row.map(pdfText)),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: TEXT,
      lineColor: BORDER,
      lineWidth: 0.2,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2.5, right: 2.5 },
      valign: "middle",
    },
    headStyles: { fillColor: NAVY, textColor: "#FFFFFF", fontStyle: "bold" },
    alternateRowStyles: { fillColor: SHADE },
    columnStyles,
    didParseCell: (data) => {
      // Header cells follow their column's alignment.
      if (data.section === "head") data.cell.styles.halign = spec.items.align[data.column.index];
    },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Cost summary ─────────────────────────────────────────────────────
  heading("Cost Summary", 12.5, 2);
  const sumSize = 10;
  const valueColW = 34;
  const labelMaxW = CONTENT_W - valueColW - 6;
  for (const line of spec.summary) {
    setFont(sumSize, line.bold ? "bold" : "normal");
    const labelLines: string[] = doc.splitTextToSize(pdfText(line.label), labelMaxW);
    const rowH = labelLines.length * lineHeight(sumSize, 1.3) + 2.4;
    ensureSpace(rowH);
    if (line.shaded) {
      doc.setFillColor(SHADE);
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
    }
    const baseY = y + 1.2 + sumSize * PT_TO_MM;
    setFont(sumSize, line.bold ? "bold" : "normal");
    labelLines.forEach((l, i) => doc.text(l, MARGIN + 2.5, baseY + i * lineHeight(sumSize, 1.3)));
    setFont(sumSize, line.bold ? "bold" : "normal", line.deduction ? GREEN : TEXT);
    doc.text(pdfText(line.value), PAGE_W - MARGIN - 2.5, baseY, { align: "right" });
    y += rowH;
  }
  y += 2.5;
  setFont(9, "italic", MUTED);
  const noteLines: string[] = doc.splitTextToSize(pdfText(spec.summaryNote), CONTENT_W);
  noteLines.forEach((l) => {
    y += lineHeight(9);
    doc.text(l, MARGIN, y);
  });
  y += 5;

  // ── Bulleted sections (what's covered, notes) ────────────────────────
  const bulletSize = 9.5;
  const bulletLH = lineHeight(bulletSize, 1.4);
  const bulletIndent = 5;
  for (const section of spec.sections) {
    heading(section.heading, 11, 1.2);
    for (const bullet of section.bullets) {
      setFont(bulletSize, "normal");
      const lines: string[] = doc.splitTextToSize(pdfText(bullet), CONTENT_W - bulletIndent);
      ensureSpace(lines.length * bulletLH + 1.5);
      y += bulletLH;
      doc.setFillColor(NAVY);
      doc.circle(MARGIN + 1.6, y - bulletSize * PT_TO_MM * 0.33, 0.65, "F");
      lines.forEach((l, i) => {
        if (i > 0) y += bulletLH;
        doc.text(l, MARGIN + bulletIndent, y);
      });
      y += 0.9;
    }
    y += 3;
  }

  // Footer on every page: company line + page numbers.
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    setFont(8, "normal", MUTED);
    doc.text(
      "Nison Limited (trading as Ocunio Energy) · Company No. 16371062 · info@ocunioenergy.com · www.ocunioenergy.com",
      MARGIN,
      PAGE_H - 8,
    );
    if (pages > 1) doc.text(`Page ${p} of ${pages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  return doc.output("blob");
}
