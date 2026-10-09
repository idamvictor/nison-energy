// Residential Landlord quote — an A4 PDF (layout in ./quote-pdf.ts) that
// mirrors the reference guide mockup's generateQuote(): same headings,
// wording, table structure and figures.

import { buildQuotePdf, fmtMoney } from "./quote-pdf";

export type WorkItem = { desc: string; cost: number };

export type LandlordQuoteInput = {
  reference: string;
  contactName: string;
  email: string;
  phone?: string;
  businessName: string;
  regNumber?: string;
  vatNumber?: string;
  siteAddress: string;
  installType: string;
  chargepoints: number;
  sockets: number;
  chargerModel: string;
  /** Price of ONE chargepoint unit (ex VAT) — multiplied by `chargepoints`. */
  chargerCost: number;
  labourCost: number;
  works: WorkItem[];
};

/** Builds the quote PDF. Grant: 75% of the inc-VAT cost, capped at £500 per socket. */
export function generateLandlordQuotePdf(input: LandlordQuoteInput): Promise<Blob> {
  const chargerTotal = input.chargerCost * input.chargepoints;
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = chargerTotal + input.labourCost + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grant = Math.min(totalIncVat * 0.75, 500 * input.sockets);
  const netPayable = totalIncVat - grant;
  const issueDate = new Date().toLocaleDateString("en-GB");

  let itemNum = 1;
  const rows = [
    [
      String(itemNum++),
      input.chargerModel,
      String(input.chargepoints),
      fmtMoney(input.chargerCost),
      fmtMoney(chargerTotal),
    ],
    [
      String(itemNum++),
      "Installation, Commissioning & Testing",
      "1",
      fmtMoney(input.labourCost),
      fmtMoney(input.labourCost),
    ],
    ...input.works.map((w) => [String(itemNum++), w.desc, "1", fmtMoney(w.cost), fmtMoney(w.cost)]),
  ];

  return buildQuotePdf({
    docTitle: "OZEV Landlord Quote",
    strapline: [
      "Nison Limited — OZEV-Approved Installer, No. 13528 · VAT No. GB495472057 · Company Reg. No. 16371062",
      "info@ocunioenergy.com · www.ocunioenergy.com",
    ],
    title: "Residential Landlord Grant — Itemised Quote",
    meta: [
      ["Quote/Invoice No.:", input.reference],
      ["Date of Issue:", issueDate],
    ],
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
      heading: "Client Details",
      lines: [
        ["Business / Organisation Name:", input.businessName || "—"],
        ["Companies House Registration No.:", input.regNumber || "—"],
        ["VAT No.:", input.vatNumber || "—"],
        ["Installation Site Address:", input.siteAddress || "—"],
        ["Installation Type:", input.installType],
        ["Contact Name:", input.contactName],
        ["Contact Email & Phone:", input.email + (input.phone ? ` · ${input.phone}` : "")],
      ],
    },
    items: {
      heading: "Itemised Breakdown of Works & Hardware",
      head: ["#", "Description", "Qty", "Unit (ex VAT)", "Total (ex VAT)"],
      align: ["center", "left", "center", "right", "right"],
      widths: [10, undefined, 14, 30, 32],
      rows,
    },
    summary: [
      { label: "Subtotal (ex. VAT)", value: fmtMoney(subtotal) },
      { label: "VAT @ 20%", value: fmtMoney(vat) },
      { label: "Gross Total (inc. VAT)", value: fmtMoney(totalIncVat), bold: true, shaded: true },
      {
        label: `Less: OZEV Grant Contribution (${input.sockets} socket(s) @ up to £500/socket)`,
        value: `- ${fmtMoney(grant)}`,
        deduction: true,
      },
      { label: "Net Amount Due by Client", value: fmtMoney(netPayable), bold: true, shaded: true },
    ],
    summaryNote: "Grant calculated after VAT: ex-VAT -> +20% VAT -> inc-VAT -> less OZEV grant.",
    sections: [
      {
        heading: "Notes",
        bullets: [
          "This quote must be dated and itemised per socket to be accepted as part of your OZEV grant application.",
          "You apply directly via the GOV.UK Find a Grant platform; Nison Limited reviews your documents on request and handles the grant claim after installation.",
          "You'll need a Companies House Reg No or VAT No to complete Section 1 of the application.",
          "For multi-unit blocks, provide freehold title or RTM/management company minutes confirming authority over the parking areas; for single tenancies, provide the Land Registry title deed.",
          "This grant isn't available if installing a chargepoint here is a mandatory requirement (e.g. a new-build planning condition).",
          "Installation cannot be booked until your grant application has been pre-approved.",
        ],
      },
    ],
  });
}
