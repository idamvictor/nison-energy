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

export type WorkItem = { desc: string; cost: number };

export type WorkplaceQuotePdfInput = {
  reference: string;
  contactName: string;
  email: string;
  phone?: string;
  businessName: string;
  regNumber?: string;
  vatNumber?: string;
  billingAddress: string;
  siteAddress: string;
  chargepoints: number;
  sockets: number;
  chargerModel: string;
  chargerCost: number;
  labourCost: number;
  works: WorkItem[];
};

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const PAGE_HEIGHT = 297;
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/**
 * Builds the quote PDF and returns its bytes (rather than triggering a
 * browser download itself) — the caller decides whether to also save it
 * client-side and/or upload it via POST /api/quotes.
 */
export function generateWorkplaceQuotePdf(input: WorkplaceQuotePdfInput): Uint8Array<ArrayBuffer> {
  const doc = new jsPDF();
  let y = MARGIN;

  const heading = (text: string, size = 12) => {
    y = ensureSpace(doc, y, 14);
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
    y = ensureSpace(doc, y, lines.length * size * 0.45 + 2);
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

  body(
    "trading as Ocunio Energy · OZEV-Approved Installer, No. 13528 · VAT No. GB495472057 · Company Reg. No. 16371062",
    9,
    "normal",
    MUTED
  );
  body("info@ocunioenergy.com · 07525 567054", 9, "normal", MUTED);
  y += 2;
  rule();

  heading("Workplace Charging Scheme — Itemised Quote", 13);
  body(`Quote/Invoice No.: ${input.reference}     Date of Issue: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  y += 1;

  heading("Installer Details");
  body("Installer Business Name: Nison Limited (trading as Ocunio Energy)");
  body("OZEV Installer Number: 13528");
  body("Company Registration No.: 16371062");
  body("VAT No.: GB495472057");
  body("Installer Contact: info@ocunioenergy.com · 07525 567054");
  y += 1;

  heading("Client Details");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BODY);
  const clientLines = [
    `Business / Organisation Name: ${input.businessName || "—"}`,
    `Companies House Registration No.: ${input.regNumber || "—"}`,
    `VAT No.: ${input.vatNumber || "—"}`,
    `Billing Address: ${input.billingAddress || "—"}`,
    `Installation Site Address: ${input.siteAddress || "—"}`,
    `Contact Name: ${input.contactName}`,
    `Contact Email & Phone: ${input.email}${input.phone ? ` · ${input.phone}` : ""}`,
  ];
  for (const line of clientLines) {
    y = ensureSpace(doc, y, 5);
    doc.text(line, MARGIN, y);
    y += 5;
  }
  y += 3;

  heading("OZEV Grant Metadata");
  body("Scheme: Workplace Charging Scheme (voucher-based)");
  body("Application Status: Pending Voucher Application (quote issued to support your site survey and voucher application)");
  body(
    `Grant Entitlement: Up to £500 per socket × ${input.sockets} socket(s) requested, capped at £20,000 per applicant — exact amount confirmed on voucher issue`
  );
  y += 1;

  heading("Itemised Breakdown of Works & Hardware");

  const chargerTotal = input.chargerCost;
  const chargerUnitPrice = input.chargepoints > 0 ? chargerTotal / input.chargepoints : chargerTotal;
  const labourTotal = input.labourCost;
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = chargerTotal + labourTotal + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grantCap = Math.min(500 * input.sockets, 20000);
  const grant = Math.min(totalIncVat * 0.75, grantCap);
  const netPayable = totalIncVat - grant;

  let itemNum = 1;
  const rows: { cells: [string, string, string, string, string]; shaded?: boolean }[] = [
    {
      cells: [
        String(itemNum++),
        `EV Chargepoint Unit(s) (${input.chargerModel}, ${input.sockets} socket(s) total)`,
        String(input.chargepoints),
        currency.format(chargerUnitPrice),
        currency.format(chargerTotal),
      ],
    },
    {
      cells: [
        String(itemNum++),
        "Installation, Commissioning & Testing",
        "1",
        currency.format(labourTotal),
        currency.format(labourTotal),
      ],
      shaded: true,
    },
    ...input.works.map((w, i) => ({
      cells: [
        String(itemNum++),
        w.desc,
        "1",
        currency.format(w.cost),
        currency.format(w.cost),
      ] as [string, string, string, string, string],
      shaded: i % 2 !== 0,
    })),
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["#", "Description", "Qty", "Unit (ex VAT)", "Total (ex VAT)"]],
    body: rows.map((r) => r.cells),
    theme: "plain",
    styles: { font: "times", fontSize: 9, textColor: BODY, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", halign: "left" },
    columnStyles: { 0: { cellWidth: 8 }, 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
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
    ["VAT @ 20%", currency.format(vat)],
    ["Gross Total (inc. VAT)", currency.format(totalIncVat)],
    [
      `Less: OZEV Voucher Contribution (${input.sockets} socket(s) @ up to £500/socket, max £20,000)`,
      `− ${currency.format(grant)}`,
    ],
    ["Net Amount Due by Client", currency.format(netPayable)],
  ];
  y = ensureSpace(doc, y, summaryRows.length * 9 + 10);
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

  body("Grant calculated after VAT: ex-VAT → +20% VAT → inc-VAT → less OZEV voucher.", 9, "italic", MUTED);
  y += 3;

  heading("Compliance & Statutory Declarations");
  const declarations = [
    "Technical Standard: Installation carried out in accordance with BS 7671 (IET Wiring Regulations, 18th Edition) and BS EN 61851.",
    "Warranty: Hardware and installation warranty terms as per the manufacturer's and Nison Limited's standard documentation, provided separately.",
    "Grant Deduction: The grant amount shown is an estimate. Do not begin installation before your voucher is issued. Once installed, the confirmed voucher value will be deducted from this invoice and claimed by Nison Limited directly from OZEV — you are not charged for the grant-covered portion in advance.",
  ];
  declarations.forEach((d, i) => body(`${i + 1}. ${d}`, 9.5));
  y += 2;

  heading("Notes");
  const notes = [
    "This quote must be dated and itemised to be accepted as part of your WCS voucher application.",
    "You apply directly for your voucher online; Nison Limited arranges the site survey and, once installed, claims the grant on your behalf.",
    "You'll need a company registration number, VAT number, or business rates bill (or equivalent for charities, NHS surgeries and schools).",
    "Home workers can also apply, provided the address is registered as a place of business and an eligible dual-use chargepoint is installed.",
    "This grant isn't available if installing a chargepoint here is a mandatory requirement (e.g. Part S building regulations or a planning condition).",
    "Do not begin installation before your voucher is issued — you then have 180 days to complete the work.",
  ];
  for (const note of notes) {
    body(`•  ${note}`, 9.5);
  }

  rule();
  body("Nison Limited — Borehamwood, Hertfordshire · www.ocunioenergy.com", 9, "italic", MUTED);

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}
