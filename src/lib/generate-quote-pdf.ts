import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type JsPDFWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } };

const GRANT_AMOUNT = 500;
const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const PRIMARY: [number, number, number] = [0, 98, 122];
const MUTED: [number, number, number] = [91, 107, 114];
const BODY: [number, number, number] = [30, 41, 46];
const SHADED: [number, number, number] = [234, 243, 245];
const RULE: [number, number, number] = [222, 230, 232];

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const quoteCovers = [
  "Your selected charger unit",
  "Installation carried out by OZEV-certified electricians",
  "Cable run of up to 15m, including standard fixings",
  "Complete testing, commissioning, and app configuration",
  "Certification and installation documentation",
];

export type QuotePdfInput = {
  reference: string;
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  townCity: string;
  postcode: string;
  chargerName: string;
  grossPrice: number | null;
  notes?: string;
};

export function generateQuotePdf(input: QuotePdfInput) {
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

  // Letterhead
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  doc.text("NISON LIMITED", MARGIN, y);
  y += 10;

  body("Borehamwood, Hertfordshire, United Kingdom", 9, "normal", MUTED);
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
  doc.text(
    "Tel: 033 0633 0252   |   Email: info@nisonenergy.com   |   Web: www.nisonenergy.com",
    MARGIN,
    y
  );
  y += 8;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  doc.text(`Quote Date: `, MARGIN, y);
  doc.setFont("times", "normal");
  doc.text(today, MARGIN + 22, y);
  doc.setFont("times", "bold");
  doc.text("Ref:", MARGIN + 90, y);
  doc.setFont("times", "normal");
  doc.text(input.reference, MARGIN + 98, y);
  y += 9;

  heading("Customer Details");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  const customerLines = [
    input.fullName,
    input.email,
    input.addressLine1,
    ...(input.addressLine2 ? [input.addressLine2] : []),
    input.townCity,
    input.postcode,
  ].filter(Boolean);
  for (const line of customerLines) {
    doc.text(line, MARGIN, y);
    y += 5;
  }
  y += 3;

  heading("Selected Charger");
  body(input.chargerName || "To be confirmed at site survey");
  y += 1;

  heading("Quote Breakdown (All prices include VAT)");

  const gross = input.grossPrice;
  const net = gross != null ? Math.max(gross - GRANT_AMOUNT, 0) : null;

  if (gross != null && net != null) {
    const rows: { cells: [string, string]; shaded?: boolean; bold?: boolean }[] = [
      { cells: [input.chargerName, currency.format(gross)] },
      { cells: ["Standard Installation", "Included"] },
      { cells: ["Gross Total (inc. VAT)", currency.format(gross)], shaded: true, bold: true },
      { cells: ["OZEV grant award", `- ${currency.format(GRANT_AMOUNT)}`] },
      {
        cells: ["Quote inc. VAT (after grant)", currency.format(net)],
        shaded: true,
        bold: true,
      },
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Description", "Amount (inc. VAT)"]],
      body: rows.map((r) => r.cells),
      theme: "plain",
      styles: {
        font: "times",
        fontSize: 10,
        textColor: BODY,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      },
      headStyles: {
        fillColor: SHADED,
        textColor: PRIMARY,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        1: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const meta = rows[data.row.index];
        if (meta?.shaded) data.cell.styles.fillColor = SHADED;
        if (meta?.bold) data.cell.styles.fontStyle = "bold";
      },
    });

    y = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 8;
  } else {
    body("Pricing to be confirmed once a charger is selected.");
    y += 4;
  }

  heading("What This Quote Covers");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  for (const item of quoteCovers) {
    doc.text("•", MARGIN, y);
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 6);
    doc.text(lines, MARGIN + 5, y);
    y += lines.length * 4.5 + 1;
  }
  y += 2;

  if (input.notes) {
    heading("Additional Information");
    body(input.notes);
    y += 1;
  }

  rule();
  body(
    "Indicative quote only — subject to site survey. The £500 Electric Vehicle Chargepoint Grant is deducted from the gross (VAT-inclusive) price. Grant subject to eligibility and OZEV approval. Installation carried out by Nison Limited, OZEV Installer No. 13528.",
    9,
    "italic",
    MUTED
  );
  y += 2;

  heading("OZEV Compliance Statement", 11);
  body(
    "This installation complies with The Electric Vehicles (Smart Charge Points) Regulations 2021. The chargepoint model supplied is listed on the OZEV-approved chargepoint model list at the time of installation.",
    9,
    "italic",
    MUTED
  );

  doc.save(`nison-energy-quote-${input.reference}.pdf`);
}
