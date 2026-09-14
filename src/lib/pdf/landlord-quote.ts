// Residential Landlord quote — a Word-compatible HTML document (the classic
// "HTML saved with a .doc extension" trick), not a PDF, matching the
// reference guide mockup's generateQuote() verbatim. One deliberate fix on
// top: the reference's "Notes" section uses <ul><li>, but Word applies its
// own fixed "List Paragraph" spacing to real list items and ignores our CSS
// entirely — that's what caused the huge-gap bug on the renters quote. So,
// same as renters-quote.ts, Notes here is plain bulleted paragraphs instead.

export type WorkItem = { desc: string; cost: number };

export type LandlordQuoteDocInput = {
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
  chargerCost: number;
  labourCost: number;
  works: WorkItem[];
};

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

function fmtMoney(n: number): string {
  return currency.format(n);
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bulletLine(text: string, isLast = false): string {
  return `<p style="margin:0 0 ${isLast ? 0 : 2}px 10px; font-size:8px; line-height:1.15; text-indent:-8px;">&bull;&nbsp; ${text}</p>`;
}

/**
 * Builds the quote as a Word-compatible HTML string. The caller wraps it in
 * a Blob (`new Blob(["﻿", html], { type: "application/msword" })`).
 */
export function generateLandlordQuoteDoc(input: LandlordQuoteDocInput): string {
  const chargerTotal = input.chargerCost;
  const chargerUnitPrice = input.chargepoints > 0 ? chargerTotal / input.chargepoints : chargerTotal;
  const labourTotal = input.labourCost;
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = chargerTotal + labourTotal + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grantCap = 500 * input.sockets;
  const grant = Math.min(totalIncVat * 0.75, grantCap);
  const netPayable = totalIncVat - grant;
  const issueDate = new Date().toLocaleDateString("en-GB");

  let itemNum = 1;
  let itemRows =
    `<tr style="font-size:11px;"><td>${itemNum++}</td><td>EV Chargepoint Unit(s) (${esc(input.chargerModel)}, ${input.sockets} socket(s) total)</td><td align="center">${input.chargepoints}</td><td align="right">${fmtMoney(chargerUnitPrice)}</td><td align="right">${fmtMoney(chargerTotal)}</td></tr>` +
    `<tr style="background:#EAF1F8; font-size:11px;"><td>${itemNum++}</td><td>Installation, Commissioning &amp; Testing</td><td align="center">1</td><td align="right">${fmtMoney(labourTotal)}</td><td align="right">${fmtMoney(labourTotal)}</td></tr>`;
  input.works.forEach((w, i) => {
    const shade = i % 2 === 0 ? "font-size:11px;" : "background:#EAF1F8; font-size:11px;";
    itemRows += `<tr style="${shade}"><td>${itemNum++}</td><td>${esc(w.desc)}</td><td align="center">1</td><td align="right">${fmtMoney(w.cost)}</td><td align="right">${fmtMoney(w.cost)}</td></tr>`;
  });

  return (
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>OZEV Landlord Quote</title>' +
    "<style>" +
    "@page { size: 21cm 29.7cm; margin: 1.2cm; }" +
    "body { margin: 0; }" +
    "h1, h2, h3, p, table { margin: 0; padding: 0; }" +
    "</style>" +
    "</head>" +
    '<body style="font-family:Calibri,Arial,sans-serif; color:#262626; font-size:11px;">' +
    '<h2 style="color:#1F3864; margin-bottom:2px; font-size:17px;">Nison Limited</h2>' +
    '<p style="color:#595959; font-size:10px; margin:0 0 6px;">Nison Limited &mdash; OZEV-Approved Installer, No. 13528 &middot; VAT No. GB495472057 &middot; Company Reg. No. 16371062<br>' +
    "info@ocunioenergy.com &middot; 07525 567054</p>" +
    '<h1 style="color:#1F3864; border-bottom:2px solid #2E75B6; padding-bottom:4px; margin-bottom:6px; font-size:16px; white-space:nowrap;">Residential Landlord Grant &mdash; Itemised Quote</h1>' +
    '<p style="font-size:10px; margin:0 0 8px;"><b>Quote/Invoice No.:</b> ' +
    input.reference +
    "&nbsp;&nbsp; <b>Date of Issue:</b> " +
    issueDate +
    "</p>" +
    // Installer + Client details side by side.
    '<table cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse; margin-bottom:8px;">' +
    '<tr><td style="width:50%; vertical-align:top; padding-right:12px;">' +
    '<h3 style="color:#1F3864; margin-bottom:3px; font-size:12px;">Installer Details</h3>' +
    '<p style="margin:0; font-size:10.5px;"><b>Installer Business Name:</b> Nison Limited (trading as Ocunio Energy)<br>' +
    "<b>OZEV Installer Number:</b> 13528<br>" +
    "<b>Company Registration No.:</b> 16371062<br>" +
    "<b>VAT No.:</b> GB495472057<br>" +
    "<b>Installer Contact:</b> info@ocunioenergy.com &middot; 07525 567054</p>" +
    "</td>" +
    '<td style="width:50%; vertical-align:top; padding-left:12px;">' +
    '<h3 style="color:#1F3864; margin-bottom:3px; font-size:12px;">Client Details</h3>' +
    '<p style="margin:0; font-size:10.5px;"><b>Business / Organisation Name:</b> ' +
    esc(input.businessName || "—") +
    "<br>" +
    "<b>Companies House Registration No.:</b> " +
    esc(input.regNumber || "—") +
    "<br>" +
    "<b>VAT No.:</b> " +
    esc(input.vatNumber || "—") +
    "<br>" +
    "<b>Installation Site Address:</b> " +
    esc(input.siteAddress || "—") +
    "<br>" +
    "<b>Installation Type:</b> " +
    esc(input.installType) +
    "<br>" +
    "<b>Contact Name:</b> " +
    esc(input.contactName) +
    "<br>" +
    "<b>Contact Email &amp; Phone:</b> " +
    esc(input.email) +
    (input.phone ? " · " + esc(input.phone) : "") +
    "</p>" +
    "</td></tr></table>" +
    // Figures the customer actually checks — proper room, not the cramped
    // treatment the Notes section gets below.
    '<h3 style="color:#1F3864; margin-bottom:4px; font-size:13px;">Itemised Breakdown of Works &amp; Hardware</h3>' +
    '<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; width:100%; font-size:11px; margin-bottom:10px;">' +
    '<tr style="background:#1F3864; color:#fff; font-size:11px;"><th>#</th><th>Description</th><th>Qty</th><th>Unit (ex VAT)</th><th>Total (ex VAT)</th></tr>' +
    itemRows +
    "</table>" +
    '<h3 style="color:#1F3864; margin-bottom:4px; font-size:13px;">Cost Summary</h3>' +
    '<table cellspacing="0" cellpadding="4" style="width:100%; font-size:11px; margin-bottom:8px;">' +
    '<tr><td><p style="margin:0; font-size:11px;">Subtotal (ex. VAT)</p></td><td align="right"><p style="margin:0; font-size:11px;">' +
    fmtMoney(subtotal) +
    "</p></td></tr>" +
    '<tr><td><p style="margin:0; font-size:11px;">VAT @ 20%</p></td><td align="right"><p style="margin:0; font-size:11px;">' +
    fmtMoney(vat) +
    "</p></td></tr>" +
    '<tr style="background:#EAF1F8;"><td><p style="margin:0; font-size:11px;"><b>Gross Total (inc. VAT)</b></p></td><td align="right"><p style="margin:0; font-size:11px;"><b>' +
    fmtMoney(totalIncVat) +
    "</b></p></td></tr>" +
    '<tr><td><p style="margin:0; font-size:11px;">Less: OZEV Grant Contribution (' +
    input.sockets +
    ' socket(s) @ up to &pound;500/socket)</p></td><td align="right" style="color:#1F6E52;"><p style="margin:0; color:#1F6E52; font-size:11px;">&minus; ' +
    fmtMoney(grant) +
    "</p></td></tr>" +
    '<tr style="background:#EAF1F8;"><td><p style="margin:0; font-size:11px;"><b>Net Amount Due by Client</b></p></td><td align="right"><p style="margin:0; font-size:11px;"><b>' +
    fmtMoney(netPayable) +
    "</b></p></td></tr>" +
    "</table>" +
    '<p style="font-style:italic; color:#595959; font-size:9.5px; margin:0 0 8px;">Grant calculated after VAT: ex-VAT &rarr; +20% VAT &rarr; inc-VAT &rarr; less OZEV grant.</p>' +
    '<h3 style="color:#1F3864; margin-bottom:1px; font-size:10px;">Notes</h3>' +
    bulletLine(
      "This quote must be dated and itemised per socket to be accepted as part of your OZEV grant application.",
    ) +
    bulletLine(
      "You apply directly via the GOV.UK Find a Grant platform; Nison Limited reviews your documents on request and handles the grant claim after installation.",
    ) +
    bulletLine("You&rsquo;ll need a Companies House Reg No or VAT No to complete Section 1 of the application.") +
    bulletLine(
      "For multi-unit blocks, provide freehold title or RTM/management company minutes confirming authority over the parking areas; for single tenancies, provide the Land Registry title deed.",
    ) +
    bulletLine(
      "This grant isn&rsquo;t available if installing a chargepoint here is a mandatory requirement (e.g. a new-build planning condition).",
    ) +
    bulletLine("Installation cannot be booked until your grant application has been pre-approved.", true) +
    "</body></html>"
  );
}
