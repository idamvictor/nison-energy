import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type JsPDFWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PRIMARY: [number, number, number] = [0, 98, 122];
const MUTED: [number, number, number] = [91, 107, 114];
const BODY: [number, number, number] = [30, 41, 46];
const SHADED: [number, number, number] = [234, 243, 245];
const RULE: [number, number, number] = [222, 230, 232];

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export type RentersQuotePdfInput = {
  reference: string;
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  chargerModel: string;
  chargerUnitCost: number;
  labourCost: number;
  worksCost: number;
  worksDesc?: string;
};

export function generateRentersQuotePdf(input: RentersQuotePdfInput) {
  const doc = new jsPDF();
  let y = MARGIN;

  const heading = (text: string, size = 12) => {
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...PRIMARY);
    doc.text(text, MARGIN, y);
    y += size * 0.55 + 2;
  };

  const body = (text: string, size = 10, style: "normal" | "italic" = "normal", color = BODY) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * size * 0.45 + 2;
  };

  const rule = () => {
    doc.setDrawColor(...RULE);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
  };

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  doc.text("NISON LIMITED", MARGIN, y);
  y += 10;

  body("trading as Ocunio Energy · Borehamwood, Hertfordshire, United Kingdom", 9, "normal", MUTED);
  body(
    "Company No: 16371062   |   VAT No: 495472057   |   OZEV Installer No: 13528",
    9,
    "normal",
    MUTED
  );
  y += 2;
  rule();

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text("Tel: 033 0633 0252   |   Email: info@ocunioenergy.com   |   Web: www.ocunioenergy.com", MARGIN, y);
  y += 8;

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  doc.text("Quote Date: ", MARGIN, y);
  doc.setFont("times", "normal");
  doc.text(today, MARGIN + 22, y);
  doc.setFont("times", "bold");
  doc.text("Ref:", MARGIN + 90, y);
  doc.setFont("times", "normal");
  doc.text(input.reference, MARGIN + 98, y);
  y += 9;

  heading("EV Chargepoint Grant — Renters & Flat Owners — Itemised Quote", 13);
  y += 1;

  heading("Applicant & Property Details");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  const clientLines = [
    `Applicant Full Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "—"}`,
    `Installation Address: ${input.address || "—"}`,
  ];
  for (const line of clientLines) {
    doc.text(line, MARGIN, y);
    y += 5;
  }
  y += 3;

  heading("Itemised Costs");

  const subtotal = input.chargerUnitCost + input.labourCost + input.worksCost;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grant = Math.min(totalIncVat * 0.75, 500);
  const netPayable = totalIncVat - grant;

  const rows: { cells: [string, string, string, string]; shaded?: boolean }[] = [
    {
      cells: [
        `EV Chargepoint Unit (${input.chargerModel})`,
        "1",
        currency.format(input.chargerUnitCost),
        currency.format(input.chargerUnitCost),
      ],
    },
    {
      cells: [
        "Installation Labour",
        "1",
        currency.format(input.labourCost),
        currency.format(input.labourCost),
      ],
      shaded: true,
    },
    {
      cells: [
        `Additional Works${input.worksDesc ? ` (${input.worksDesc})` : ""}`,
        input.worksCost > 0 ? "1" : "0",
        currency.format(input.worksCost),
        currency.format(input.worksCost),
      ],
    },
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Item", "Qty", "Unit Cost (ex VAT)", "Total (ex VAT)"]],
    body: rows.map((r) => r.cells),
    theme: "plain",
    styles: { font: "times", fontSize: 9.5, textColor: BODY, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", halign: "left" },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const meta = rows[data.row.index];
      if (meta?.shaded) data.cell.styles.fillColor = SHADED;
    },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 8;

  heading("Cost Summary");
  const summaryRows: [string, string][] = [
    ["Subtotal (ex. VAT)", currency.format(subtotal)],
    ["VAT (20%)", currency.format(vat)],
    ["Total (inc. VAT)", currency.format(totalIncVat)],
    [
      "Less: OZEV Grant Deduction (75% of cost, capped at £500, 1 socket per applicant)",
      `− ${currency.format(grant)}`,
    ],
    ["Net Payable by Customer", currency.format(netPayable)],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    body: summaryRows,
    theme: "plain",
    styles: { font: "times", fontSize: 10, textColor: BODY, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    columnStyles: { 1: { halign: "right" } },
    didParseCell: (data) => {
      if (data.row.index === 2 || data.row.index === 4) {
        data.cell.styles.fillColor = SHADED;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 6;

  body(
    "Grant calculated after VAT: ex-VAT → +20% VAT → inc-VAT → less OZEV grant.",
    9,
    "italic",
    MUTED
  );
  y += 3;

  heading("Installer Details");
  body("Nison Limited (trading as Ocunio Energy) · OZEV Installer No. 13528 · info@ocunioenergy.com · 033 0633 0252");
  y += 1;

  heading("Notes");
  const notes = [
    "This quote must be dated and itemised to be accepted as part of your OZEV grant application.",
    "You apply directly to OZEV via the Find a Grant platform; Ocunio can review your documents on request but does not submit on your behalf.",
    "Vehicle evidence (V5C, lease agreement, or order form) must be provided alongside this quote.",
    "Installation cannot be booked until your grant application has been pre-approved.",
    "You are not charged for the grant-covered portion until your authorisation code arrives.",
  ];
  for (const note of notes) {
    body(`•  ${note}`, 9.5);
  }

  rule();
  body(
    "Ocunio Energy (Nison Limited) — Borehamwood, Hertfordshire · www.ocunioenergy.com",
    9,
    "italic",
    MUTED
  );

  doc.save(`ocunio-energy-renters-quote-${input.reference}.pdf`);
}
