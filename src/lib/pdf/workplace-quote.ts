// Workplace Charging Scheme quote — an A4 PDF (layout in ./quote-pdf.ts)
// that mirrors the reference guide mockup's generateQuote(): same headings,
// wording, table structure and figures.

import { buildQuotePdf, fmtMoney } from "./quote-pdf";

export type WorkItem = { desc: string; cost: number };

export type WorkplaceQuoteInput = {
  reference: string;
  contactName: string;
  email: string;
  phone?: string;
  businessName: string;
  regNumber?: string;
  vatNumber?: string;
  siteAddress: string;
  chargepoints: number;
  sockets: number;
  chargerModel: string;
  /** Price of ONE chargepoint unit (ex VAT) — multiplied by `chargepoints`. */
  chargerCost: number;
  labourCost: number;
  works: WorkItem[];
};

/** Builds the quote PDF. Voucher: 75% of the inc-VAT cost, capped at £500 per socket and £20,000 overall. */
export function generateWorkplaceQuotePdf(input: WorkplaceQuoteInput): Promise<Blob> {
  const chargerTotal = input.chargerCost * input.chargepoints;
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = chargerTotal + input.labourCost + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grantCap = Math.min(500 * input.sockets, 20000);
  const grant = Math.min(totalIncVat * 0.75, grantCap);
  const netPayable = totalIncVat - grant;
  const issueDate = new Date().toLocaleDateString("en-GB");

  let itemNum = 1;
  const rows = [
    [
      String(itemNum++),
      `EV Chargepoint Unit(s) (${input.chargerModel}, ${input.sockets} socket(s) total)`,
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
    docTitle: "OZEV WCS Quote",
    strapline: [
      "Nison Limited — OZEV-Approved Installer, No. 13528 · VAT No. GB495472057 · Company Reg. No. 16371062",
      "info@ocunioenergy.com · www.ocunioenergy.com",
    ],
    title: "Workplace Charging Scheme — Itemised Quote",
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
        label: `Less: OZEV Voucher Contribution (${input.sockets} socket(s) @ up to £500/socket, max £20,000)`,
        value: `- ${fmtMoney(grant)}`,
        deduction: true,
      },
      { label: "Net Amount Due by Client", value: fmtMoney(netPayable), bold: true, shaded: true },
    ],
    summaryNote: "Grant calculated after VAT: ex-VAT -> +20% VAT -> inc-VAT -> less OZEV voucher.",
    sections: [
      {
        heading: "Notes",
        bullets: [
          "This quote must be dated and itemised to be accepted as part of your WCS voucher application.",
          "You apply directly for your voucher online; Nison Limited arranges the site survey and, once installed, claims the grant on your behalf.",
          "You'll need a company registration number, VAT number, or business rates bill (or equivalent for charities, NHS surgeries and schools).",
          "Home workers can also apply, provided the address is registered as a place of business and an eligible dual-use chargepoint is installed.",
          "This grant isn't available if installing a chargepoint here is a mandatory requirement (e.g. Part S building regulations or a planning condition).",
          "Do not begin installation before your voucher is issued — you then have 180 days to complete the work.",
        ],
      },
    ],
  });
}
