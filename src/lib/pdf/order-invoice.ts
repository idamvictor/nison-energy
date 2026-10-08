// Branded A4 invoice for a paid order, drawn server-side with jsPDF and
// attached to the customer's "payment received" email (src/lib/orders/fulfil.ts).
// Colours mirror the email templates: ink text, cyan rules, orange accents.

import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { COMPANY } from "@/lib/company";
import { pdfText } from "@/lib/pdf/quote-pdf";
import type { Invoice } from "@/lib/orders/invoice";

const INK = "#0b1418";
const CYAN = "#0280a3";
const ORANGE = "#f2861f";
const MUTED = "#5b6b72";
const SHADE = "#eef8fb";
const BORDER = "#dbe5e9";
const PAID = "#15803d";

const MARGIN = 16; // mm
const PAGE_W = 210;
const PAGE_H = 297;
const RIGHT = PAGE_W - MARGIN;

export const VAT_NUMBER = "GB495472057";

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const fmt = (n: number) => money.format(n);
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(d);

let logoCache: string | null | undefined;
async function logoDataUrl(): Promise<string | null> {
  if (logoCache !== undefined) return logoCache;
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "ocunio-energy-logo.png"));
    logoCache = `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    logoCache = null;
  }
  return logoCache;
}

export async function buildOrderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  doc.setProperties({
    title: `Invoice ${invoice.number}`,
    author: COMPANY.legalName,
    creator: COMPANY.tradingName,
  });

  const font = (size: number, style: "normal" | "bold" = "normal", color = INK) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };
  const text = (value: string, x: number, y: number, opts?: { align?: "left" | "right" | "center" }) =>
    doc.text(pdfText(value), x, y, opts);

  // ── Header: logo left, INVOICE + meta right ───────────────────────────
  let y = MARGIN;
  const logo = await logoDataUrl();
  if (logo) {
    doc.addImage(logo, "PNG", MARGIN, y, 39, 13, "logo", "FAST");
  } else {
    font(18, "bold", CYAN);
    text(COMPANY.tradingName, MARGIN, y + 9);
  }
  font(22, "bold", INK);
  text("INVOICE", RIGHT, y + 8, { align: "right" });
  font(9.5, "normal", MUTED);
  text(`Invoice no. ${invoice.number}`, RIGHT, y + 14, { align: "right" });
  text(`Date: ${fmtDate(invoice.date)}`, RIGHT, y + 18.5, { align: "right" });
  text(`Order ref: ${invoice.orderReference}`, RIGHT, y + 23, { align: "right" });
  y += 28;
  doc.setDrawColor(CYAN);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, RIGHT, y);
  y += 7;

  // ── From / Bill to / Deliver to ───────────────────────────────────────
  const colW = (RIGHT - MARGIN) / 3;
  const block = (x: number, heading: string, lines: string[]) => {
    font(8.5, "bold", CYAN);
    text(heading.toUpperCase(), x, y);
    font(9.5, "normal", INK);
    let cy = y + 5;
    for (const line of lines) {
      const wrapped: string[] = doc.splitTextToSize(pdfText(line), colW - 4);
      for (const w of wrapped) {
        doc.text(w, x, cy);
        cy += 4.3;
      }
    }
    return cy;
  };
  const fromEnd = block(MARGIN, "From", [
    `${COMPANY.legalName} t/a ${COMPANY.tradingName}`,
    COMPANY.registeredOffice,
    `Company no. ${COMPANY.companyNumber}`,
    `VAT no. ${VAT_NUMBER}`,
  ]);
  const billEnd = block(MARGIN + colW, "Bill to", invoice.billTo);
  const shipEnd = block(MARGIN + colW * 2, "Deliver / install at", invoice.deliverTo);
  y = Math.max(fromEnd, billEnd, shipEnd) + 4;

  // ── Items ─────────────────────────────────────────────────────────────
  const body = invoice.lines.map((line) => [
    line.detail ? `${line.description}\n${line.detail}` : line.description,
    String(line.quantity),
    fmt(line.unitPrice),
    fmt(line.total),
  ]);
  body.push([
    "DPD Tracked Delivery",
    "1",
    invoice.deliveryFee > 0 ? fmt(invoice.deliveryFee) : "FREE",
    invoice.deliveryFee > 0 ? fmt(invoice.deliveryFee) : "FREE",
  ]);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Description", "Qty", "Unit price (inc VAT)", "Amount (inc VAT)"]],
    body: body.map((row) => row.map(pdfText)),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: INK,
      cellPadding: { top: 2.4, bottom: 2.4, left: 2.5, right: 2.5 },
      valign: "middle",
      lineColor: BORDER,
    },
    headStyles: { fillColor: INK, textColor: "#ffffff", fontStyle: "bold", fontSize: 9 },
    bodyStyles: { lineWidth: { bottom: 0.2 } },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center", cellWidth: 14 },
      2: { halign: "right", cellWidth: 38 },
      3: { halign: "right", cellWidth: 36 },
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index > 0) {
        data.cell.styles.halign = data.column.index === 1 ? "center" : "right";
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Totals (right) + PAID stamp / payment (left) ──────────────────────
  const totalsX = RIGHT - 78;
  const totalRow = (label: string, value: string, strong = false) => {
    if (strong) {
      doc.setFillColor(SHADE);
      doc.rect(totalsX, y - 4.6, RIGHT - totalsX, 7.6, "F");
    }
    font(strong ? 11 : 9.5, strong ? "bold" : "normal", strong ? INK : MUTED);
    text(label, totalsX + 2.5, y);
    font(strong ? 11 : 9.5, strong ? "bold" : "normal", INK);
    text(value, RIGHT - 2.5, y, { align: "right" });
    y += strong ? 8 : 5.6;
  };
  const totalsTop = y;
  totalRow("Subtotal (ex VAT)", fmt(invoice.net));
  totalRow("VAT @ 20%", fmt(invoice.vat));
  y += 1;
  totalRow("Total paid (inc VAT)", fmt(invoice.gross), true);

  // PAID stamp beside the totals
  doc.setDrawColor(PAID);
  doc.setLineWidth(0.7);
  doc.roundedRect(MARGIN, totalsTop - 5, 30, 11, 2, 2, "S");
  font(15, "bold", PAID);
  text("PAID", MARGIN + 15, totalsTop + 2.6, { align: "center" });
  font(9, "normal", MUTED);
  text(`Paid by ${invoice.paymentMethod}`, MARGIN, totalsTop + 12);
  text(`on ${fmtDate(invoice.date)}`, MARGIN, totalsTop + 16.5);
  y = Math.max(y, totalsTop + 20) + 8;

  // ── Thank-you note ───────────────────────────────────────────────────
  doc.setDrawColor(ORANGE);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, MARGIN + 18, y);
  y += 6;
  font(10.5, "bold", INK);
  text(`Thank you for choosing ${COMPANY.tradingName}.`, MARGIN, y);
  y += 5;
  font(9.5, "normal", MUTED);
  const note: string[] = doc.splitTextToSize(
    pdfText(
      "All prices include VAT at 20%. This invoice is your receipt for the payment above - please keep it for your records. " +
        `Questions about your order? Email ${COMPANY.email} or message us on WhatsApp, quoting ${invoice.orderReference}.`,
    ),
    RIGHT - MARGIN,
  );
  note.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 4.5;
  });

  // ── Footer ────────────────────────────────────────────────────────────
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 18, RIGHT, PAGE_H - 18);
  font(8, "normal", MUTED);
  text(
    `${COMPANY.legalName} trading as ${COMPANY.tradingName} · Registered in England and Wales no. ${COMPANY.companyNumber} · VAT no. ${VAT_NUMBER}`,
    PAGE_W / 2,
    PAGE_H - 13,
    { align: "center" },
  );
  text(`${COMPANY.registeredOffice} · ${COMPANY.email} · ocunioenergy.com`, PAGE_W / 2, PAGE_H - 9, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
