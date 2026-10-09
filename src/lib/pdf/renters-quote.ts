// Renters & Flat Owners quote — an A4 PDF (layout in ./quote-pdf.ts) that
// mirrors the reference guide mockup's generateQuote(): same headings,
// wording, table structure and figures.

import { buildQuotePdf, fmtMoney } from "./quote-pdf";

export type WorkItem = { desc: string; cost: number };

export type RentersQuoteInput = {
  reference: string;
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  chargerModel: string;
  chargerCost: number;
  labourCost: number;
  works: WorkItem[];
};

/** Builds the quote PDF. Grant: 75% of the inc-VAT cost, capped at £500. */
export function generateRentersQuotePdf(input: RentersQuoteInput): Promise<Blob> {
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = input.chargerCost + input.labourCost + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grant = Math.min(totalIncVat * 0.75, 500);
  const netPayable = totalIncVat - grant;
  const quoteDate = new Date().toLocaleDateString("en-GB");

  const row = (desc: string, cost: number) => [desc, "1", fmtMoney(cost), fmtMoney(cost)];

  return buildQuotePdf({
    docTitle: "OZEV Quote",
    strapline: ["Nison Limited — OZEV-Approved Installer, No. 13528"],
    title: "QUOTATION: EV CHARGEPOINT INSTALLATION",
    left: {
      heading: "Installer Details",
      lines: [
        ["Installer Business Name:", "Nison Limited (trading as Ocunio Energy)"],
        ["OZEV Installer Number:", "13528"],
        ["Company Registration No.:", "16371062"],
        ["VAT No.:", "GB495472057"],
        ["Installer Contact:", "info@ocunioenergy.com"],
        ["Website:", "www.ocunioenergy.com"],
      ],
    },
    right: {
      heading: "Applicant & Property Details",
      lines: [
        ["Applicant Full Name:", input.fullName],
        ["Email:", input.email],
        ["Phone:", input.phone || "—"],
        ["Installation Address:", input.address || "—"],
        ["Quote Date:", quoteDate],
        ["Quote Reference No.:", input.reference],
      ],
    },
    items: {
      heading: "Itemised Costs",
      head: ["Item", "Qty", "Unit Cost (ex VAT)", "Total (ex VAT)"],
      align: ["left", "center", "right", "right"],
      widths: [undefined, 14, 36, 32],
      rows: [
        row(input.chargerModel, input.chargerCost),
        row("Installation Labour", input.labourCost),
        ...input.works.map((w) => row(w.desc, w.cost)),
      ],
    },
    summary: [
      { label: "Subtotal (ex. VAT)", value: fmtMoney(subtotal) },
      { label: "VAT (20%)", value: fmtMoney(vat) },
      { label: "Total (inc. VAT)", value: fmtMoney(totalIncVat), bold: true, shaded: true },
      {
        label: "Less: OZEV Grant Deduction (75% of cost, capped at £500, 1 socket per applicant)",
        value: `- ${fmtMoney(grant)}`,
        deduction: true,
      },
      { label: "Net Payable by Customer", value: fmtMoney(netPayable), bold: true, shaded: true },
    ],
    summaryNote: "Grant calculated after VAT: ex-VAT -> +20% VAT -> inc-VAT -> less OZEV grant.",
    sections: [
      {
        heading: "What This Quote Covers",
        bullets: [
          "The selected EV charger",
          "Installation by professionals and OZEV-approved installers",
          "Up to 15m cable supplied, including standard fittings & fixings",
          "System commissioning and app setup.",
        ],
      },
      {
        heading: "Notes",
        bullets: [
          "This quote must be dated and itemised to be accepted as part of your OZEV grant application.",
          "You apply directly to OZEV via the Find a Grant platform; Nison Limited can review your documents on request but does not submit on your behalf.",
          "Vehicle evidence (V5C, lease agreement, or order form) must be provided alongside this quote.",
          "Installation cannot be booked until your grant application has been pre-approved.",
          "You are not charged for the grant-covered portion until your authorisation code arrives.",
        ],
      },
    ],
  });
}
