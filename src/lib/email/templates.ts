import { COMPANY } from "@/lib/company";
import { SITE_URL } from "@/lib/site";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Shared shell ─────────────────────────────────────────────────────────

function emailLayout(opts: {
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}): string {
  const cta = opts.cta
    ? `<tr><td style="padding:8px 0 4px">
         <a href="${opts.cta.href}" style="display:inline-block;background:#16a34a;color:#ffffff;
            text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:8px">
           ${esc(opts.cta.label)}</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e5e4">
        <tr><td style="padding:20px 28px;border-bottom:1px solid #e7e5e4">
          <span style="font-size:16px;font-weight:700;color:#16a34a">${COMPANY.tradingName}</span>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 14px;font-size:19px;line-height:1.3;color:#1c1917">${esc(opts.heading)}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#44403c">
            ${opts.bodyHtml}
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.6;color:#78716c">
          ${COMPANY.legalName} trading as ${COMPANY.tradingName} · ${COMPANY.email} · ${COMPANY.phone}<br>
          ${esc(COMPANY.registeredOffice)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(html: string): string {
  return `<tr><td style="padding:4px 0">${html}</td></tr>`;
}

function money(pence: number | null): string {
  return pence == null ? "Quote on request" : currency.format(pence);
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
};

export type OrderEmailInput = {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  postcode: string;
  subtotal: number;
  status: string;
  items: OrderItemEmailInput[];
};

export type EmailContent = { subject: string; html: string };

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
        row(`If it's urgent, call us on ${COMPANY.phone}.`),
      ].join(""),
    }),
  };
}

// ─── Order ───────────────────────────────────────────────────────────────

function itemsTable(items: OrderItemEmailInput[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
           <td style="padding:6px 0;border-bottom:1px solid #f0efee">${esc(i.name)}${
             i.quantity > 1 ? ` &times;${i.quantity}` : ""
           }</td>
           <td align="right" style="padding:6px 0;border-bottom:1px solid #f0efee;white-space:nowrap">${money(
             i.unitPrice,
           )}</td>
         </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#44403c;margin:4px 0">${rows}</table>`;
}

export function customerOrderConfirmation(
  order: OrderEmailInput,
  opts?: { paid?: boolean },
): EmailContent {
  return {
    subject: opts?.paid
      ? `Payment received — order ${order.reference}`
      : `Order ${order.reference} received`,
    html: emailLayout({
      heading: opts?.paid
        ? `Thanks, ${esc(order.firstName)} — payment received`
        : `Thanks, ${esc(order.firstName)} — we've got your order`,
      bodyHtml: [
        row(`Your reference is <strong>${esc(order.reference)}</strong>.`),
        row(itemsTable(order.items)),
        row(
          `<strong>Subtotal (ex VAT): ${currency.format(order.subtotal)}</strong>`,
        ),
        row(
          `<strong>Installation address</strong><br>${esc(order.address)}, ${esc(
            order.postcode,
          )}`,
        ),
        opts?.paid
          ? row(
              `Your payment has gone through and a receipt/invoice is on its way from Stripe.
               A member of the team will be in touch to book your installation.`,
            )
          : row(
              `No payment is taken online — a member of the team will be in touch to confirm
               payment and book your installation.`,
            ),
      ].join(""),
      cta: { label: "View your orders", href: `${SITE_URL}/account/orders` },
    }),
  };
}

export function staffOrderAlert(order: OrderEmailInput): EmailContent {
  return {
    subject: `New order ${order.reference} — ${currency.format(order.subtotal)}`,
    html: emailLayout({
      heading: `New order from ${esc(order.firstName)} ${esc(order.lastName)}`,
      bodyHtml: [
        row(`<strong>Reference</strong><br>${esc(order.reference)}`),
        row(`<strong>Contact</strong><br>${esc(order.email)}`),
        row(itemsTable(order.items)),
        row(`<strong>Subtotal (ex VAT): ${currency.format(order.subtotal)}</strong>`),
        row(`<strong>Address</strong><br>${esc(order.address)}, ${esc(order.postcode)}`),
      ].join(""),
      cta: { label: "Open in admin", href: `${SITE_URL}/admin/orders/${order.id}` },
    }),
  };
}

const STATUS_LINE: Record<string, string> = {
  Confirmed: "We've confirmed your order and payment. Installation scheduling is next.",
  Scheduled: "Your installation has been scheduled — check your inbox for the date.",
  Installed: "Your charger has been installed. Welcome to easier charging!",
  Cancelled: "Your order has been cancelled. Contact us if this is unexpected.",
};

export function customerOrderStatusUpdate(order: OrderEmailInput): EmailContent {
  return {
    subject: `Order ${order.reference} is now ${order.status}`,
    html: emailLayout({
      heading: `Your order is now ${esc(order.status)}`,
      bodyHtml: [
        row(`Reference <strong>${esc(order.reference)}</strong>.`),
        row(STATUS_LINE[order.status] ?? "There's an update on your order."),
      ].join(""),
      cta: { label: "View your orders", href: `${SITE_URL}/account/orders` },
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
