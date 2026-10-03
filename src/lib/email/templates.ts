import { COMPANY } from "@/lib/company";
import { whatsappUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import { formatCurrency } from "@/lib/currency";
import { includesInstallation } from "@/lib/orders/installation";

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

// Mail clients fetch the logo from the public site, so a dev SITE_URL
// (localhost) would show a broken image — always use a public origin.
const PUBLIC_ORIGIN = SITE_URL.startsWith("http://localhost") ? "https://ocunioenergy.com" : SITE_URL;

function emailLayout(opts: {
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
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
          <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;color:${INK}">${esc(opts.heading)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#33434a">
            ${opts.bodyHtml}
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f7fafb;border-top:1px solid #dbe5e9;font-size:12px;line-height:1.6;color:${MUTED}">
          Questions? Email <a href="mailto:${COMPANY.email}" style="color:${CYAN}">${COMPANY.email}</a> or
          <a href="${whatsappUrl()}" style="color:${CYAN}">message us on WhatsApp</a>.<br>
          ${COMPANY.legalName} trading as ${COMPANY.tradingName} · ${esc(COMPANY.registeredOffice)}
        </td></tr>
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
};

export type OrderEmailInput = {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city?: string | null;
  postcode: string;
  subtotal: number;
  status: string;
  items: OrderItemEmailInput[];
};

export type EmailContent = { subject: string; html: string };

function fullAddress(order: Pick<OrderEmailInput, "address" | "city" | "postcode">): string {
  return [order.address, order.city, order.postcode].filter(Boolean).join(", ");
}

// ─── Lead ────────────────────────────────────────────────────────────────

export function staffLeadAlert(lead: LeadEmailInput): EmailContent {
  const name = `${lead.firstName} ${lead.lastName}`.trim();
  return {
    subject: `New enquiry — ${name} (${lead.areaOfEnquiry})`,
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
      cta: { label: "Open in admin", href: `${SITE_URL}/admin/leads/${lead.id}` },
    }),
  };
}

export function customerEnquiryAck(lead: LeadEmailInput): EmailContent {
  return {
    subject: "We've got your enquiry",
    html: emailLayout({
      heading: `Thanks, ${esc(lead.firstName)} — we've received your enquiry`,
      bodyHtml: [
        row(
          `A member of the ${COMPANY.tradingName} team will be in touch shortly about your
           <strong>${esc(lead.reasonForEnquiry)}</strong> enquiry for
           <strong>${esc(lead.areaOfEnquiry)}</strong>.`,
        ),
        row(`If it's urgent, ${link(whatsappUrl(), "message us on WhatsApp")}.`),
      ].join(""),
    }),
  };
}

const LEAD_STATUS_LINE: Record<string, string> = {
  Contacted: "We've picked up your enquiry and a member of the team is in touch with you.",
  Quoted: "We've prepared a quote for you — keep an eye on your inbox and messages.",
  Won: "Great news — we're going ahead. We'll guide you through the next steps, including any OZEV grant paperwork.",
};

/** Customer-facing statuses only — "New" is the initial state and "Lost" isn't emailed. */
export function isEmailableLeadStatus(status: string): boolean {
  return status in LEAD_STATUS_LINE;
}

export function customerEnquiryStatusUpdate(
  lead: Pick<LeadEmailInput, "firstName" | "areaOfEnquiry">,
  status: string,
): EmailContent {
  return {
    subject: `An update on your ${lead.areaOfEnquiry} enquiry`,
    html: emailLayout({
      heading: `Hi ${esc(lead.firstName)}, there's an update on your enquiry`,
      bodyHtml: [
        row(`Your enquiry about <strong>${esc(lead.areaOfEnquiry)}</strong> is now <strong>${esc(status)}</strong>.`),
        row(LEAD_STATUS_LINE[status] ?? "There's an update on your enquiry."),
      ].join(""),
      cta: { label: "View your messages", href: `${SITE_URL}/account/inbox` },
    }),
  };
}

// ─── Order ───────────────────────────────────────────────────────────────

function itemsTable(items: OrderItemEmailInput[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
           <td style="padding:6px 0;border-bottom:1px solid #e6eef1">${esc(i.name)}${
             i.quantity > 1 ? ` &times;${i.quantity}` : ""
           }</td>
           <td align="right" style="padding:6px 0;border-bottom:1px solid #e6eef1;white-space:nowrap">${money(
             i.unitPrice == null ? null : i.unitPrice * i.quantity,
           )}</td>
         </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#33434a;margin:4px 0">${rows}</table>`;
}

// Product prices are stored inc VAT, so the order subtotal is the VAT-inclusive total.
function totalLine(order: OrderEmailInput): string {
  return row(`<strong>Total (inc VAT): ${formatCurrency(order.subtotal)}</strong>`);
}

function surveyCallout(): string {
  return callout(
    `<strong style="color:${INK}">Next step: complete your virtual survey</strong><br>
     It takes about 5 minutes — a few photos and questions about where your charger is going.
     Our team reviews it before booking your installation.<br>
     ${link(`${SITE_URL}/virtual-survey`, "Start your survey →")}`,
  );
}

export function customerOrderConfirmation(
  order: OrderEmailInput,
  opts?: { paid?: boolean },
): EmailContent {
  const needsSurvey = includesInstallation(order.items);
  return {
    subject: opts?.paid
      ? `Payment received — order ${order.reference}`
      : `Order ${order.reference} received`,
    html: emailLayout({
      heading: opts?.paid
        ? `Thanks, ${esc(order.firstName)} — payment received`
        : `Thanks, ${esc(order.firstName)} — we've got your order`,
      bodyHtml: [
        row(`Your order reference is <strong>${esc(order.reference)}</strong>.`),
        row(itemsTable(order.items)),
        totalLine(order),
        row(
          `<strong>Delivery &amp; installation address</strong><br>${esc(fullAddress(order))}`,
        ),
        opts?.paid
          ? row(
              `Your payment has gone through. A member of the team will be in touch to
               ${needsSurvey ? "book your installation once your survey is in" : "arrange delivery"}.`,
            )
          : row(
              `No payment is taken online — a member of the team will be in touch to confirm
               payment${needsSurvey ? " and book your installation" : " and arrange delivery"}.`,
            ),
        needsSurvey ? surveyCallout() : "",
      ].join(""),
      cta: { label: "View your orders", href: `${SITE_URL}/account/orders` },
    }),
  };
}

export function staffOrderAlert(order: OrderEmailInput): EmailContent {
  return {
    subject: `New order ${order.reference} — ${formatCurrency(order.subtotal)}`,
    html: emailLayout({
      heading: `New order from ${esc(order.firstName)} ${esc(order.lastName)}`,
      bodyHtml: [
        row(`<strong>Reference</strong><br>${esc(order.reference)}`),
        row(
          `<strong>Contact</strong><br>${esc(order.email)}${order.phone ? ` · ${esc(order.phone)}` : ""}`,
        ),
        row(itemsTable(order.items)),
        totalLine(order),
        row(`<strong>Delivery &amp; installation address</strong><br>${esc(fullAddress(order))}`),
        includesInstallation(order.items)
          ? row("Includes installation — the customer has been asked to complete the virtual survey.")
          : "",
      ].join(""),
      cta: { label: "Open in admin", href: `${SITE_URL}/admin/orders/${order.id}` },
    }),
  };
}

const STATUS_LINE: Record<string, string> = {
  Confirmed: "We've confirmed your order and payment. Installation scheduling is next.",
  Scheduled: "Your installation is being scheduled — we'll be in touch to confirm the date with you.",
  Installed: "Your charger has been installed. Welcome to easier charging!",
  Cancelled: "Your order has been cancelled. If this is unexpected, please get in touch.",
};

export function customerOrderStatusUpdate(order: OrderEmailInput): EmailContent {
  return {
    subject: `Order ${order.reference} is now ${order.status}`,
    html: emailLayout({
      heading: `Your order is now ${esc(order.status)}`,
      bodyHtml: [
        row(`Order reference <strong>${esc(order.reference)}</strong>.`),
        row(STATUS_LINE[order.status] ?? "There's an update on your order."),
        row(itemsTable(order.items)),
        totalLine(order),
      ].join(""),
      cta: { label: "View your orders", href: `${SITE_URL}/account/orders` },
    }),
  };
}

export function customerPaymentFailed(order: OrderEmailInput): EmailContent {
  return {
    subject: `Your payment for order ${order.reference} didn't go through`,
    html: emailLayout({
      heading: `Hi ${esc(order.firstName)}, your payment didn't go through`,
      bodyHtml: [
        row(
          `We couldn't take payment for your order <strong>${esc(order.reference)}</strong>
           (${formatCurrency(order.subtotal)}). No money has been taken.`,
        ),
        row(
          `This is usually a declined card or a cancelled bank check. You can try again with the
           same or a different card — or get in touch and we'll help.`,
        ),
      ].join(""),
      cta: { label: "Try again", href: `${SITE_URL}/checkout` },
    }),
  };
}

export function staffPaymentFailed(order: OrderEmailInput): EmailContent {
  return {
    subject: `Payment failed — order ${order.reference} (${formatCurrency(order.subtotal)})`,
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
      cta: { label: "Open in admin", href: `${SITE_URL}/admin/orders/${order.id}` },
    }),
  };
}

// ─── Quotes ──────────────────────────────────────────────────────────────

export type QuoteEmailInput = {
  reference: string;
  schemeLabel: string;
  rejectionReason?: string | null;
};

export function quoteApprovedEmail(quote: QuoteEmailInput): EmailContent {
  return {
    subject: `Your ${quote.schemeLabel} quote is ready`,
    html: emailLayout({
      heading: "Your quote has been approved",
      bodyHtml: [
        row(
          `Your <strong>${esc(quote.schemeLabel)}</strong> quote (reference
           <strong>${esc(quote.reference)}</strong>) has been reviewed and approved — you
           can download it now.`,
        ),
      ].join(""),
      cta: { label: "Download your quote", href: `${SITE_URL}/account/quotes` },
    }),
  };
}

export function quoteRejectedEmail(quote: QuoteEmailInput): EmailContent {
  return {
    subject: `Your ${quote.schemeLabel} quote needs changes`,
    html: emailLayout({
      heading: "Your quote needs a few changes",
      bodyHtml: [
        row(
          `Your <strong>${esc(quote.schemeLabel)}</strong> quote (reference
           <strong>${esc(quote.reference)}</strong>) couldn't be approved as submitted.`,
        ),
        quote.rejectionReason
          ? row(`<strong>Reason:</strong> ${esc(quote.rejectionReason)}`)
          : "",
      ].join(""),
      cta: { label: "View details", href: `${SITE_URL}/account/quotes` },
    }),
  };
}

export function customerQuoteSubmitted(
  quote: QuoteEmailInput & { firstName: string },
): EmailContent {
  return {
    subject: `We've received your ${quote.schemeLabel} quote`,
    html: emailLayout({
      heading: `Thanks, ${esc(quote.firstName || "there")} — your quote is with us`,
      bodyHtml: [
        row(
          `Your <strong>${esc(quote.schemeLabel)}</strong> quote (reference
           <strong>${esc(quote.reference)}</strong>) has been submitted for review.`,
        ),
        row(
          "Our team checks every grant quote before it can be used in your application. We'll email you as soon as it's approved, or if anything needs changing.",
        ),
      ].join(""),
      cta: { label: "View your quotes", href: `${SITE_URL}/account/quotes` },
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
      cta: { label: "Review in admin", href: `${SITE_URL}/admin/quotes` },
    }),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────

export function passwordResetEmail(input: {
  name: string;
  url: string;
}): EmailContent {
  return {
    subject: `Reset your ${COMPANY.tradingName} password`,
    html: emailLayout({
      heading: "Reset your password",
      bodyHtml: [
        row(`Hi ${esc(input.name || "there")},`),
        row(
          `We received a request to reset your password. This link expires in one hour.
           If you didn't request it, you can safely ignore this email.`,
        ),
      ].join(""),
      cta: { label: "Set a new password", href: input.url },
    }),
  };
}

export function passwordChangedEmail(input: { name: string }): EmailContent {
  return {
    subject: `Your ${COMPANY.tradingName} password was changed`,
    html: emailLayout({
      heading: "Your password was changed",
      bodyHtml: [
        row(`Hi ${esc(input.name || "there")},`),
        row("The password for your account was just changed."),
        row(
          `If this was you, there's nothing else to do. If it wasn't, reset your password
           straight away and ${link(whatsappUrl(), "let us know on WhatsApp")}.`,
        ),
      ].join(""),
      cta: { label: "Reset password", href: `${SITE_URL}/forgot-password` },
    }),
  };
}

export function welcomeEmail(input: { name: string }): EmailContent {
  return {
    subject: `Welcome to ${COMPANY.tradingName}`,
    html: emailLayout({
      heading: `Welcome, ${esc(input.name || "there")}!`,
      bodyHtml: [
        row(
          `Thanks for creating your ${COMPANY.tradingName} account. From your account you can
           track orders, download grant quotes and keep your saved chargers.`,
        ),
        row(
          `Thinking about an OZEV grant? ${link(`${SITE_URL}/ozev-grant-guide`, "See how it works")} —
           you could get up to £500 off your charger installation.`,
        ),
      ].join(""),
      cta: { label: "Go to your account", href: `${SITE_URL}/account` },
    }),
  };
}
