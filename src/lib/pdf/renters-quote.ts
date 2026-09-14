// Renters & Flat Owners quote — a Word-compatible HTML document (the classic
// "HTML saved with a .doc extension" trick), not a PDF. This mirrors the
// reference document verbatim: same headings, wording, table structure and
// figures — see generateQuote() in the reference guide mockup. Landlord and
// workplace quotes stay as real PDFs (src/lib/pdf/{landlord,workplace}-quote.ts).

export type WorkItem = { desc: string; cost: number };

export type RentersQuoteDocInput = {
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

/**
 * A single small-print bullet line, rendered as a plain paragraph (not
 * <ul><li>) with a hanging-indent bullet — see the comment at its call site
 * for why: Word ignores CSS spacing on real <li> elements.
 */
function bulletLine(text: string, isLast = false): string {
  return `<p style="margin:0 0 ${isLast ? 0 : 2}px 10px; font-size:8px; line-height:1.15; text-indent:-8px;">&bull;&nbsp; ${text}</p>`;
}

/**
 * Builds the quote as a Word-compatible HTML string. The caller wraps it in
 * a Blob (`new Blob(["﻿", html], { type: "application/msword" })`) —
 * the leading BOM part matches the reference exactly, so Word reads the
 * encoding correctly.
 */
export function generateRentersQuoteDoc(input: RentersQuoteDocInput): string {
  const worksTotal = input.works.reduce((sum, w) => sum + w.cost, 0);
  const subtotal = input.chargerCost + input.labourCost + worksTotal;
  const vat = subtotal * 0.2;
  const totalIncVat = subtotal + vat;
  const grant = Math.min(totalIncVat * 0.75, 500);
  const netPayable = totalIncVat - grant;
  const quoteDate = new Date().toLocaleDateString("en-GB");

  const worksRows = input.works
    .map(
      (w, i) =>
        `<tr style="font-size:11px;${i % 2 === 0 ? "" : " background:#EAF1F8;"}"><td>${esc(w.desc)}</td><td align="center">1</td><td align="right">${fmtMoney(w.cost)}</td><td align="right">${fmtMoney(w.cost)}</td></tr>`,
    )
    .join("");

  return (
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>OZEV Quote</title>' +
    // Word applies its own Normal-style spacing to anything not pinned down
    // explicitly, which is what pushes a document like this onto a second
    // page — shrink the page margins and zero out default heading/list/table
    // spacing so only the inline margins below (already tight) apply.
    "<style>" +
    "@page { size: 21cm 29.7cm; margin: 1.2cm; }" +
    "body { margin: 0; }" +
    "h1, h2, h3, p, ul, table { margin: 0; padding: 0; }" +
    "li { margin: 0; }" +
    "</style>" +
    "</head>" +
    '<body style="font-family:Calibri,Arial,sans-serif; color:#262626; font-size:11px;">' +
    '<h2 style="color:#1F3864; margin-bottom:2px; font-size:17px;">Nison Limited</h2>' +
    '<p style="color:#595959; font-size:10px; margin:0 0 4px 0;">Nison Limited &mdash; OZEV-Approved Installer, No. 13528</p>' +
    '<h1 style="color:#1F3864; border-bottom:2px solid #2E75B6; padding-bottom:4px; margin-bottom:8px; font-size:17px; white-space:nowrap;">QUOTATION: EV CHARGEPOINT INSTALLATION</h1>' +
    // Installer + Applicant details side by side — saves a full section's
    // worth of vertical space compared to stacking them.
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
    '<h3 style="color:#1F3864; margin-bottom:3px; font-size:12px;">Applicant &amp; Property Details</h3>' +
    '<p style="margin:0; font-size:10.5px;"><b>Applicant Full Name:</b> ' +
    esc(input.fullName) +
    "<br>" +
    "<b>Email:</b> " +
    esc(input.email) +
    "<br>" +
    "<b>Phone:</b> " +
    esc(input.phone || "—") +
    "<br>" +
    "<b>Installation Address:</b> " +
    esc(input.address || "—") +
    "<br>" +
    "<b>Quote Date:</b> " +
    quoteDate +
    "<br>" +
    "<b>Quote Reference No.:</b> " +
    input.reference +
    "</p>" +
    "</td></tr></table>" +
    // Itemised Costs + Cost Summary are the figures the customer actually
    // checks — give them proper room, not the cramped treatment below.
    '<h3 style="color:#1F3864; margin-bottom:4px; font-size:13px;">Itemised Costs</h3>' +
    '<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; width:100%; font-size:11px; margin-bottom:10px;">' +
    '<tr style="background:#1F3864; color:#fff; font-size:11px;"><th>Item</th><th>Qty</th><th>Unit Cost (ex VAT)</th><th>Total (ex VAT)</th></tr>' +
    '<tr style="font-size:11px;"><td>EV Chargepoint Unit (' +
    esc(input.chargerModel) +
    ')</td><td align="center">1</td><td align="right">' +
    fmtMoney(input.chargerCost) +
    '</td><td align="right">' +
    fmtMoney(input.chargerCost) +
    "</td></tr>" +
    '<tr style="background:#EAF1F8; font-size:11px;"><td>Installation Labour</td><td align="center">1</td><td align="right">' +
    fmtMoney(input.labourCost) +
    '</td><td align="right">' +
    fmtMoney(input.labourCost) +
    "</td></tr>" +
    worksRows +
    "</table>" +
    '<h3 style="color:#1F3864; margin-bottom:4px; font-size:13px;">Cost Summary</h3>' +
    '<table cellspacing="0" cellpadding="4" style="width:100%; font-size:11px; margin-bottom:8px;">' +
    '<tr><td><p style="margin:0; font-size:11px;">Subtotal (ex. VAT)</p></td><td align="right"><p style="margin:0; font-size:11px;">' +
    fmtMoney(subtotal) +
    "</p></td></tr>" +
    '<tr><td><p style="margin:0; font-size:11px;">VAT (20%)</p></td><td align="right"><p style="margin:0; font-size:11px;">' +
    fmtMoney(vat) +
    "</p></td></tr>" +
    '<tr style="background:#EAF1F8;"><td><p style="margin:0; font-size:11px;"><b>Total (inc. VAT)</b></p></td><td align="right"><p style="margin:0; font-size:11px;"><b>' +
    fmtMoney(totalIncVat) +
    "</b></p></td></tr>" +
    '<tr><td><p style="margin:0; font-size:11px;">Less: OZEV Grant Deduction (75% of cost, capped at &pound;500, 1 socket per applicant)</p></td><td align="right" style="color:#1F6E52;"><p style="margin:0; color:#1F6E52; font-size:11px;">&minus; ' +
    fmtMoney(grant) +
    "</p></td></tr>" +
    '<tr style="background:#EAF1F8;"><td><p style="margin:0; font-size:11px;"><b>Net Payable by Customer</b></p></td><td align="right"><p style="margin:0; font-size:11px;"><b>' +
    fmtMoney(netPayable) +
    "</b></p></td></tr>" +
    "</table>" +
    '<p style="font-style:italic; color:#595959; font-size:9.5px; margin:0 0 8px;">Grant calculated after VAT: ex-VAT &rarr; +20% VAT &rarr; inc-VAT &rarr; less OZEV grant.</p>' +
    // These two are boilerplate/small print — compress hard to buy back the
    // room spent giving the figures above proper space. Word turns <ul><li>
    // into its own "List Paragraph" style with large fixed before/after
    // spacing that ignores our CSS entirely (that's the huge-gap bug) — so
    // instead of a real list, each line is a plain <p> with a literal bullet
    // and a hanging indent. Word respects margin on plain paragraphs.
    '<h3 style="color:#1F3864; margin-bottom:1px; font-size:10px;">What This Quote Covers</h3>' +
    bulletLine("The selected EV charger") +
    bulletLine("Installation by professionals and OZEV-approved installers") +
    bulletLine("Up to 15m cable supplied, including standard fittings &amp; fixings") +
    bulletLine("System commissioning and app setup.", true) +
    '<h3 style="color:#1F3864; margin-top:6px; margin-bottom:1px; font-size:10px;">Notes</h3>' +
    bulletLine(
      "This quote must be dated and itemised to be accepted as part of your OZEV grant application.",
    ) +
    bulletLine(
      "You apply directly to OZEV via the Find a Grant platform; Nison Limited can review your documents on request but does not submit on your behalf.",
    ) +
    bulletLine(
      "Vehicle evidence (V5C, lease agreement, or order form) must be provided alongside this quote.",
    ) +
    bulletLine("Installation cannot be booked until your grant application has been pre-approved.") +
    bulletLine(
      "You are not charged for the grant-covered portion until your authorisation code arrives.",
      true,
    ) +
    "</body></html>"
  );
}
