import { COMPANY } from "@/lib/company";
import { whatsappUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import { formatCurrency } from "@/lib/currency";
import { includesInstallation, installSplit } from "@/lib/orders/installation";
import { OPENQUOTE_SURVEY_URL } from "@/lib/content/openquote";
import { deliveryLabelFor, needsPallet } from "@/lib/orders/delivery";
import type { TemplateCopy } from "@/lib/email/template-registry";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Shared shell ─────────────────────────────────────────────────────────

// Brand colours (mirror globals.css): ink, cyan text, orange CTA.
const INK = "#0b1418";
const CYAN = "#0280a3";
const ORANGE = "#f2861f";
const MUTED = "#5b6b72";

// Logo and every link point at the public site: a dev SITE_URL (localhost)
// would break the image, and localhost links are a strong spam signal.
const PUBLIC_ORIGIN = SITE_URL.startsWith("http://localhost") ? "https://ocunioenergy.com" : SITE_URL;

function emailLayout(opts: {
  /** Omitted when the body opens with its own greeting (e.g. "Hi Sam,"). */
  heading?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  /** false when the body ends with its own sign-off and company line. */
  footer?: boolean;
}): string {
  const cta = opts.cta
    ? `<tr><td style="padding:14px 0 4px">
         <a href="${opts.cta.href}" style="display:inline-block;background:${ORANGE};color:#ffffff;
            text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px">
           ${esc(opts.cta.label)}</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f1f6f8;font-family:Arial,Helvetica,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f6f8;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe5e9">
        <tr><td style="padding:18px 28px;border-bottom:3px solid ${CYAN}">
          <img src="${PUBLIC_ORIGIN}/ocunio-energy-logo.png" alt="${COMPANY.tradingName}" height="36" style="display:block;height:36px;width:auto;border:0">
        </td></tr>
        <tr><td style="padding:28px">
          ${opts.heading ? `<h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;color:${INK}">${esc(opts.heading)}</h1>` : ""}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#33434a">
            ${opts.bodyHtml}
            ${cta}
          </table>
        </td></tr>
        ${
          opts.footer === false
            ? ""
            : `<tr><td style="padding:18px 28px;background:#f7fafb;border-top:1px solid #dbe5e9;font-size:12px;line-height:1.6;color:${MUTED}">
          Questions? Email <a href="mailto:${COMPANY.email}" style="color:${CYAN}">${COMPANY.email}</a> or
          <a href="${whatsappUrl()}" style="color:${CYAN}">message us on WhatsApp</a>.<br>
          ${COMPANY.legalName} trading as ${COMPANY.tradingName} · ${esc(COMPANY.registeredOffice)}
        </td></tr>`
        }
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(html: string): string {
  return `<tr><td style="padding:4px 0">${html}</td></tr>`;
}

function link(href: string, label: string): string {
  return `<a href="${href}" style="color:${CYAN};font-weight:600">${esc(label)}</a>`;
}

/** Highlighted "next step" panel inside an email body. */
function callout(html: string): string {
  return row(
    `<div style="margin:8px 0;padding:14px 16px;border:2px solid ${CYAN};border-radius:10px;background:#eef8fb">${html}</div>`,
  );
}

function money(amount: number | null): string {
  return amount == null ? "Quote on request" : formatCurrency(amount);
}

// ─── Editable copy (admin ▸ Email templates) ─────────────────────────────

type Vars = Record<string, string>;

const globalVars = (): Vars => ({
  company: COMPANY.tradingName,
  companyEmail: COMPANY.email,
  whatsappUrl: whatsappUrl(),
});

const sub = (text: string, vars: Vars, encode: (v: string) => string) =>
  text.replace(/\{(\w+)\}/g, (_, name: string) => encode(vars[name] ?? ""));

/** Subject, heading, button text: placeholders only (the layout escapes headings/buttons itself). */
function plain(text: string, vars: Vars): string {
  return sub(text, vars, (v) => v);
}

/**
 * Body text → email HTML: escapes the wording, then {placeholder},
 * [link text](url), **bold**, *italic* and line breaks. Values are escaped;
 * link URLs are used as given, the same as link().
 */
function rich(text: string, vars: Vars): string {
  return esc(text)
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label: string, href: string) =>
        `<a href="${sub(href, vars, (v) => v)}" style="color:${CYAN};font-weight:600">${sub(label, vars, esc)}</a>`,
    )
    .replace(/\{(\w+)\}/g, (_, name: string) => esc(vars[name] ?? ""))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/** A template's wording: the admin's saved edits over the defaults, unless the caller passes its own (preview). */
async function copyFor(key: string, copy?: TemplateCopy): Promise<TemplateCopy> {
  if (copy) return copy;
  const { getTemplateCopy } = await import("@/lib/email/template-copy");
  return getTemplateCopy(key);
}

// ─── Inputs ──────────────────────────────────────────────────────────────

export type LeadEmailInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  areaOfEnquiry: string;
  reasonForEnquiry: string;
  additionalInformation: string | null;
};

export type OrderItemEmailInput = {
  name: string;
  quantity: number;
  unitPrice: number | null;
  options?: unknown;
  /** Solar lines ship by pallet — changes the delivery line's name. */
  category?: string | null;
};

export type OrderEmailInput = {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string | null;
  address: string;
  addressLine2?: string | null;
  city?: string | null;
  postcode: string;
  subtotal: number;
  /** Delivery charge (GBP); 0 = free delivery. Absent on legacy orders. */
  deliveryFee?: number;
  status: string;
  items: OrderItemEmailInput[];
  /** Set when the order belongs to an account (guests have none). */
  userId?: string | null;
};

export type EmailContent = { subject: string; html: string };

function fullAddress(
  order: Pick<OrderEmailInput, "company" | "address" | "addressLine2" | "city" | "postcode">,
): string {
  return [order.company, order.address, order.addressLine2, order.city, order.postcode].filter(Boolean).join(", ");
}

// ─── Lead ────────────────────────────────────────────────────────────────

export function staffLeadAlert(lead: LeadEmailInput): EmailContent {
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  return {
    subject: `Enquiry from ${name} about ${lead.areaOfEnquiry}`,
    html: emailLayout({
      heading: `New enquiry from ${esc(name)}`,
      bodyHtml: [
        row(`<strong>Contact</strong><br>${esc(lead.email)} · ${esc(lead.phone)}`),
        lead.companyName ? row(`<strong>Company</strong><br>${esc(lead.companyName)}`) : "",
        row(`<strong>Area of enquiry</strong><br>${esc(lead.areaOfEnquiry)}`),
        row(`<strong>Reason</strong><br>${esc(lead.reasonForEnquiry)}`),
        lead.additionalInformation
          ? row(`<strong>Message</strong><br>${esc(lead.additionalInformation)}`)
          : "",
      ].join(""),
      cta: { label: "Open in admin", href: `${PUBLIC_ORIGIN}/admin/leads/${lead.id}` },
    }),
  };
}

export async function customerEnquiryAck(lead: LeadEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("enquiry-received", copy);
  const v = {
    ...globalVars(),
    firstName: lead.firstName,
    reasonForEnquiry: lead.reasonForEnquiry,
    areaOfEnquiry: lead.areaOfEnquiry,
  };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v)), row(rich(c.paragraph2, v))].join(""),
    }),
  };
}

/** The statuses that email the customer, and their copy field — "New" is the initial state and "Lost" isn't emailed. */
const LEAD_STATUS_FIELD: Record<string, string> = {
  Contacted: "statusContacted",
  Quoted: "statusQuoted",
  Won: "statusWon",
};

export function isEmailableLeadStatus(status: string): boolean {
  return status in LEAD_STATUS_FIELD;
}

export async function customerEnquiryStatusUpdate(
  lead: Pick<LeadEmailInput, "firstName" | "areaOfEnquiry">,
  status: string,
  copy?: TemplateCopy,
): Promise<EmailContent> {
  const c = await copyFor("enquiry-update", copy);
  const v = { ...globalVars(), firstName: lead.firstName, areaOfEnquiry: lead.areaOfEnquiry, status };
  const line = c[LEAD_STATUS_FIELD[status]];
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.intro, v)), row(line ? rich(line, v) : "There's an update on your enquiry.")].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/account/inbox` },
    }),
  };
}

// ─── Order ───────────────────────────────────────────────────────────────

/** "Charger £X + installation £Y" under an installation line, when the fee is known. */
function installDetail(item: OrderItemEmailInput): string {
  const split = installSplit(item.unitPrice, item.quantity, item.options);
  if (split.install <= 0) return "";
  return `<br><span style="font-size:12px;color:${MUTED}">Charger ${formatCurrency(split.product)} + installation ${formatCurrency(split.install)}</span>`;
}

function itemsTable(items: OrderItemEmailInput[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
           <td style="padding:6px 0;border-bottom:1px solid #e6eef1">${esc(i.name)}${
             i.quantity > 1 ? ` &times;${i.quantity}` : ""
           }${installDetail(i)}</td>
           <td align="right" style="padding:6px 0;border-bottom:1px solid #e6eef1;white-space:nowrap">${money(
             i.unitPrice == null ? null : i.unitPrice * i.quantity,
           )}</td>
         </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#33434a;margin:4px 0">${rows}</table>`;
}

// Product prices are stored inc VAT, so the order subtotal is the VAT-inclusive total.
function orderTotal(order: OrderEmailInput): number {
  return Math.round((order.subtotal + (order.deliveryFee ?? 0)) * 100) / 100;
}

function totalLine(order: OrderEmailInput): string {
  const fee = order.deliveryFee ?? 0;
  return [
    row(`${deliveryLabelFor(needsPallet(order.items))}: ${fee > 0 ? formatCurrency(fee) : "FREE"}`),
    row(`<strong>Total (inc VAT): ${formatCurrency(orderTotal(order))}</strong>`),
  ].join("");
}

/** Signed-in customers can open their orders; guests have no account, so offer WhatsApp. */
function ordersCta(order: OrderEmailInput, c: TemplateCopy, v: Vars): { label: string; href: string } {
  return order.userId
    ? { label: plain(c.buttonAccount, v), href: `${PUBLIC_ORIGIN}/account/orders` }
    : {
        label: plain(c.buttonGuest, v),
        // Opens a chat with our number, pre-filled with the order reference.
        href: whatsappUrl(`Hi ${COMPANY.tradingName} 👋 I have a question about my order ${order.reference}.`),
      };
}

function surveyCallout(c: TemplateCopy, v: Vars): string {
  return callout(
    `<strong style="color:${INK}">${esc(plain(c.surveyTitle, v))}</strong><br>
     ${rich(c.surveyBody, v)}<br>
     ${link(OPENQUOTE_SURVEY_URL, plain(c.surveyLink, v))}`,
  );
}

/** Order placed without online payment (paid orders get customerInvoiceEmail). */
export async function customerOrderConfirmation(order: OrderEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("order-received", copy);
  const v = { ...globalVars(), firstName: order.firstName, orderReference: order.reference };
  const needsSurvey = includesInstallation(order.items);
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [
        row(rich(c.referenceLine, v)),
        row(itemsTable(order.items)),
        totalLine(order),
        row(
          `<strong>Delivery &amp; installation address</strong><br>${esc(fullAddress(order))}`,
        ),
        row(rich(needsSurvey ? c.paymentInstall : c.paymentNoInstall, v)),
        needsSurvey ? surveyCallout(c, v) : "",
      ].join(""),
      cta: ordersCta(order, c, v),
    }),
  };
}

/** Invoice figures for the paid-order email (built by src/lib/orders/invoice.ts). */
export type InvoiceEmailInput = {
  number: string;
  date: Date;
  paymentMethod: string;
  billTo: string[];
  deliverTo: string[];
  net: number;
  vat: number;
  gross: number;
};

const VAT_NUMBER = "GB495472057";

function invoiceDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date);
}

function amountRow(label: string, value: string, strong = false): string {
  const weight = strong ? "font-weight:700;color:" + INK + ";font-size:15px" : "color:#33434a";
  return `<tr>
    <td style="padding:3px 0;${weight}">${label}</td>
    <td align="right" style="padding:3px 0;white-space:nowrap;${weight}">${value}</td>
  </tr>`;
}

/** A numbered step in the paid-order email: bold title line, then its sentence. */
function step(title: string, body: string): string {
  return row(`<strong style="color:${INK}">${title}</strong><br>${body}`);
}

/**
 * Paid online order confirmation, with the invoice as the order summary (the
 * same invoice is attached as a PDF — src/lib/pdf/order-invoice.ts). Copy is
 * the client's, word for word: one version for orders with installation, one
 * for everything else (cables, circuit protection, etc.). It carries its own
 * sign-off and company line, so the shared footer is left off.
 */
export async function customerInvoiceEmail(
  order: OrderEmailInput,
  invoice: InvoiceEmailInput,
  copy?: TemplateCopy,
): Promise<EmailContent> {
  const c = await copyFor("order-paid-invoice", copy);
  const v = {
    ...globalVars(),
    firstName: order.firstName,
    orderReference: order.reference,
    invoiceNumber: invoice.number,
    surveyUrl: OPENQUOTE_SURVEY_URL,
  };
  const needsSurvey = includesInstallation(order.items);
  const fee = order.deliveryFee ?? 0;
  const address = (lines: string[]) => lines.map(esc).join("<br>");
  const title = (id: string) => `<strong style="color:${INK}">${esc(plain(c[id], v))}</strong>`;

  const orderSummary = [
    callout(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#33434a">
         <tr><td style="padding:2px 0"><strong style="color:${INK}">Invoice</strong></td>
             <td align="right" style="padding:2px 0">${esc(invoice.number)}</td></tr>
         <tr><td style="padding:2px 0"><strong style="color:${INK}">Date</strong></td>
             <td align="right" style="padding:2px 0">${invoiceDate(invoice.date)}</td></tr>
         <tr><td style="padding:2px 0"><strong style="color:${INK}">Paid by</strong></td>
             <td align="right" style="padding:2px 0">${esc(invoice.paymentMethod)}</td></tr>
       </table>`,
    ),
    row(itemsTable(order.items)),
    row(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
         ${amountRow(deliveryLabelFor(needsPallet(order.items)), fee > 0 ? formatCurrency(fee) : "FREE")}
         ${amountRow("Subtotal (ex VAT)", formatCurrency(invoice.net))}
         ${amountRow("VAT @ 20%", formatCurrency(invoice.vat))}
         ${amountRow("Total paid (inc VAT)", formatCurrency(invoice.gross), true)}
       </table>`,
    ),
    row(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#33434a;margin-top:8px">
         <tr>
           <td valign="top" width="50%" style="padding:4px 8px 4px 0"><strong style="color:${INK}">Billing address</strong><br>${address(invoice.billTo)}</td>
           <td valign="top" width="50%" style="padding:4px 0 4px 8px"><strong style="color:${INK}">${
             needsSurvey ? "Delivery &amp; installation" : "Delivery address"
           }</strong><br>${address(invoice.deliverTo)}</td>
         </tr>
       </table>`,
    ),
  ].join("");

  const steps = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, i) => step(esc(plain(c[`${prefix}${i + 1}Title`], v)), rich(c[`${prefix}${i + 1}Body`], v)));
  const nextSteps = needsSurvey
    ? [row(title("installIntro")), ...steps("install", 4), row(rich(c.installQuestions, v))]
    : [row(title("productsIntro")), ...steps("products", 3)];

  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      footer: false,
      bodyHtml: [
        row(rich(c.greeting, v)),
        row(rich(c.thanks, v)),
        row(rich(c.orderNumberLine, v)),
        orderSummary,
        ...nextSteps,
        row(rich(c.closing, v)),
        row(rich(c.signOff, v)),
        row(
          `<span style="font-size:12px;color:${MUTED}">${COMPANY.tradingName} is a trading name of ${COMPANY.legalName}. Company Reg. No. ${COMPANY.companyNumber} | VAT No. ${VAT_NUMBER}</span>`,
        ),
      ].join(""),
    }),
  };
}

export function staffOrderAlert(order: OrderEmailInput, opts?: { paymentMethod?: string }): EmailContent {
  return {
    subject: `Order ${order.reference} placed by ${order.firstName} ${order.lastName}`,
    html: emailLayout({
      heading: `New order from ${esc(order.firstName)} ${esc(order.lastName)}`,
      bodyHtml: [
        row(`<strong>Reference</strong><br>${esc(order.reference)}`),
        opts?.paymentMethod
          ? row(`<strong>Payment</strong><br>Paid online — ${esc(opts.paymentMethod)}`)
          : row(`<strong>Payment</strong><br>Not paid online — confirm payment with the customer`),
        row(
          `<strong>Contact</strong><br>${esc(order.email)}${order.phone ? ` · ${esc(order.phone)}` : ""}`,
        ),
        row(itemsTable(order.items)),
        totalLine(order),
        row(`<strong>Delivery &amp; installation address</strong><br>${esc(fullAddress(order))}`),
        includesInstallation(order.items)
          ? row(
              `Includes installation — the customer has been asked to complete the virtual survey:
               ${link(OPENQUOTE_SURVEY_URL, "OpenQuote survey link")}`,
            )
          : "",
      ].join(""),
      cta: { label: "Open in admin", href: `${PUBLIC_ORIGIN}/admin/orders/${order.id}` },
    }),
  };
}

const ORDER_STATUS_FIELD: Record<string, string> = {
  Confirmed: "statusConfirmed",
  Scheduled: "statusScheduled",
  Installed: "statusInstalled",
  Cancelled: "statusCancelled",
};

export async function customerOrderStatusUpdate(order: OrderEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("order-status-update", copy);
  const v = { ...globalVars(), orderReference: order.reference, status: order.status };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [
        row(rich(c.referenceLine, v)),
        row(rich(c[ORDER_STATUS_FIELD[order.status]] ?? c.statusOther, v)),
        row(itemsTable(order.items)),
        totalLine(order),
      ].join(""),
      cta: ordersCta(order, c, v),
    }),
  };
}

export async function customerPaymentFailed(order: OrderEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("payment-failed", copy);
  const v = {
    ...globalVars(),
    firstName: order.firstName,
    orderReference: order.reference,
    total: formatCurrency(orderTotal(order)),
  };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v)), row(rich(c.paragraph2, v))].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/checkout` },
    }),
  };
}

export function staffPaymentFailed(order: OrderEmailInput): EmailContent {
  return {
    subject: `Payment failed on order ${order.reference}`,
    html: emailLayout({
      heading: `Payment failed for ${esc(order.firstName)} ${esc(order.lastName)}`,
      bodyHtml: [
        row(
          `The online payment for order <strong>${esc(order.reference)}</strong> failed. The
           customer has been emailed a retry link — you may want to follow up.`,
        ),
        row(
          `<strong>Contact</strong><br>${esc(order.email)}${order.phone ? ` · ${esc(order.phone)}` : ""}`,
        ),
        row(itemsTable(order.items)),
        totalLine(order),
      ].join(""),
      cta: { label: "Open in admin", href: `${PUBLIC_ORIGIN}/admin/orders/${order.id}` },
    }),
  };
}

// ─── Quotes ──────────────────────────────────────────────────────────────

export type QuoteEmailInput = {
  reference: string;
  schemeLabel: string;
  rejectionReason?: string | null;
};

const quoteVars = (quote: QuoteEmailInput): Vars => ({
  ...globalVars(),
  schemeLabel: quote.schemeLabel,
  quoteReference: quote.reference,
});

export async function quoteApprovedEmail(quote: QuoteEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("quote-approved", copy);
  const v = quoteVars(quote);
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v))].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/account/quotes` },
    }),
  };
}

export async function quoteRejectedEmail(quote: QuoteEmailInput, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("quote-needs-changes", copy);
  const v = { ...quoteVars(quote), reason: quote.rejectionReason ?? "" };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v)), quote.rejectionReason ? row(rich(c.reasonLine, v)) : ""].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/account/quotes` },
    }),
  };
}

export async function customerQuoteSubmitted(
  quote: QuoteEmailInput & { firstName: string },
  copy?: TemplateCopy,
): Promise<EmailContent> {
  const c = await copyFor("quote-received", copy);
  const v = { ...quoteVars(quote), firstName: quote.firstName || "there" };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v)), row(rich(c.paragraph2, v))].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/account/quotes` },
    }),
  };
}

export function staffQuoteSubmitted(
  quote: QuoteEmailInput & { customerName: string; customerEmail: string },
): EmailContent {
  return {
    subject: `Quote awaiting review — ${quote.schemeLabel} (${quote.reference})`,
    html: emailLayout({
      heading: "A grant quote is waiting for review",
      bodyHtml: [
        row(`<strong>Scheme</strong><br>${esc(quote.schemeLabel)}`),
        row(`<strong>Reference</strong><br>${esc(quote.reference)}`),
        row(
          `<strong>Customer</strong><br>${esc(quote.customerName || "—")} · ${esc(quote.customerEmail)}`,
        ),
      ].join(""),
      cta: { label: "Review in admin", href: `${PUBLIC_ORIGIN}/admin/quotes` },
    }),
  };
}

export function staffPriceReviewSubmitted(input: {
  submissionId: string;
  reviewerName: string;
  changes: number;
  note: string | null;
}): EmailContent {
  const plural = input.changes === 1 ? "change" : "changes";
  return {
    subject: `Price review submitted by ${input.reviewerName} — ${input.changes} ${plural} waiting for approval`,
    html: emailLayout({
      heading: "Price changes are waiting for approval",
      bodyHtml: [
        row(`<strong>Submitted by</strong><br>${esc(input.reviewerName)}`),
        row(`<strong>Proposed price ${plural}</strong><br>${input.changes}`),
        ...(input.note ? [row(`<strong>Note</strong><br>${esc(input.note)}`)] : []),
        row("Nothing has changed on the website yet — approve or reject each change in admin."),
      ].join(""),
      cta: { label: "Review in admin", href: `${PUBLIC_ORIGIN}/admin/prices/submissions/${input.submissionId}` },
    }),
  };
}

// ─── Team ────────────────────────────────────────────────────────────────

export function teamInviteEmail(input: {
  inviterName: string;
  roleLabel: string;
  url: string;
}): EmailContent {
  return {
    subject: `You've been invited to the ${COMPANY.tradingName} admin`,
    html: emailLayout({
      heading: "You've been invited to join the team",
      bodyHtml: [
        row(
          `${esc(input.inviterName)} has invited you to join the ${esc(COMPANY.tradingName)} admin as
           <strong>${esc(input.roleLabel)}</strong>.`,
        ),
        row(
          `Accept the invite to create your account (or sign in if you already have one).
           This link expires in 7 days and can only be used once.`,
        ),
        row("If you weren't expecting this, you can safely ignore this email."),
      ].join(""),
      cta: { label: "Accept invite", href: input.url },
    }),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────

/** The reset link (input.url) is always the button's destination — only the wording is editable. */
export async function passwordResetEmail(input: { name: string; url: string }, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("password-reset", copy);
  const v = { ...globalVars(), name: input.name || "there" };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.greeting, v)), row(rich(c.paragraph1, v))].join(""),
      cta: { label: plain(c.button, v), href: input.url },
    }),
  };
}

export async function passwordChangedEmail(input: { name: string }, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("password-changed", copy);
  const v = { ...globalVars(), name: input.name || "there" };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.greeting, v)), row(rich(c.paragraph1, v)), row(rich(c.paragraph2, v))].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/forgot-password` },
    }),
  };
}

export async function welcomeEmail(input: { name: string }, copy?: TemplateCopy): Promise<EmailContent> {
  const c = await copyFor("welcome", copy);
  const v = { ...globalVars(), name: input.name || "there", grantGuideUrl: `${PUBLIC_ORIGIN}/ozev-grant-guide` };
  return {
    subject: plain(c.subject, v),
    html: emailLayout({
      heading: plain(c.heading, v),
      bodyHtml: [row(rich(c.paragraph1, v)), row(rich(c.paragraph2, v))].join(""),
      cta: { label: plain(c.button, v), href: `${PUBLIC_ORIGIN}/account` },
    }),
  };
}
