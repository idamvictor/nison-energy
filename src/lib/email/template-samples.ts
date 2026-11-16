// Example data used to preview / download the customer email templates in the
// admin (and to snapshot-test them). Nothing here is sent to anyone.

import {
  customerEnquiryAck,
  customerEnquiryStatusUpdate,
  customerInvoiceEmail,
  customerOrderConfirmation,
  customerOrderStatusUpdate,
  customerPaymentFailed,
  customerQuoteSubmitted,
  passwordChangedEmail,
  passwordResetEmail,
  quoteApprovedEmail,
  quoteRejectedEmail,
  welcomeEmail,
  type EmailContent,
  type InvoiceEmailInput,
  type LeadEmailInput,
  type OrderEmailInput,
  type QuoteEmailInput,
} from "@/lib/email/templates";
import type { TemplateCopy } from "@/lib/email/template-registry";

export const sampleLead: LeadEmailInput = {
  id: "sample-lead",
  firstName: "Sam",
  lastName: "Taylor",
  email: "sam.taylor@example.com",
  phone: "07700 900123",
  companyName: null,
  areaOfEnquiry: "Home Charging",
  reasonForEnquiry: "Installation",
  additionalInformation: null,
};

/** An account order with a charger + installation (so the survey steps show). */
export const sampleOrder: OrderEmailInput = {
  id: "sample-order",
  reference: "OCU-10482",
  firstName: "Sam",
  lastName: "Taylor",
  email: "sam.taylor@example.com",
  phone: "07700 900123",
  company: null,
  address: "12 Example Road",
  addressLine2: null,
  city: "Leeds",
  postcode: "LS1 4AB",
  subtotal: 1121.8,
  deliveryFee: 0,
  status: "Confirmed",
  items: [
    {
      name: "Hypervolt Home 3 Pro – Space Grey (5m)",
      quantity: 1,
      unitPrice: 1121.8,
      options: { installation: "standard", installFee: 499 },
      category: "residential",
    },
  ],
  userId: "sample-user",
};

export const sampleInvoice: InvoiceEmailInput = {
  number: "INV-10482",
  date: new Date("2026-11-17T10:00:00Z"),
  paymentMethod: "Card (Visa •••• 4242)",
  billTo: ["Sam Taylor", "12 Example Road", "Leeds", "LS1 4AB"],
  deliverTo: ["Sam Taylor", "12 Example Road", "Leeds", "LS1 4AB"],
  net: 934.83,
  vat: 186.97,
  gross: 1121.8,
};

export const sampleQuote: QuoteEmailInput & { firstName: string } = {
  reference: "Q-2041",
  schemeLabel: "EV Chargepoint Grant for Renters and Flat Owners",
  rejectionReason: "The installation address doesn't match the tenancy agreement.",
  firstName: "Sam",
};

export const sampleName = "Sam";
export const sampleResetUrl = "#reset-link-added-automatically";

/** A guest order of products only (no installation): the other version of the order emails. */
export const sampleProductsOrder: OrderEmailInput = {
  ...sampleOrder,
  userId: null,
  subtotal: 619.8,
  items: [{ name: "Matt:e SP-R-SPD Single-phase PEN Protection Unit", quantity: 2, unitPrice: 309.9, category: "circuit-protectors" }],
};

export type PreviewVariant = { id: string; label: string };

/** Versions of a template worth previewing separately (first = default). */
export const PREVIEW_VARIANTS: Record<string, PreviewVariant[]> = {
  "enquiry-update": ["Contacted", "Quoted", "Won"].map((s) => ({ id: s, label: `Status: ${s}` })),
  "order-received": [
    { id: "install", label: "With installation (account)" },
    { id: "products", label: "Products only (guest)" },
  ],
  "order-paid-invoice": [
    { id: "install", label: "With installation" },
    { id: "products", label: "Products only" },
  ],
  "order-status-update": ["Confirmed", "Scheduled", "Installed", "Cancelled"].map((s) => ({ id: s, label: `Status: ${s}` })),
  "quote-needs-changes": [
    { id: "reason", label: "With a reason" },
    { id: "no-reason", label: "No reason given" },
  ],
};

export function variantsFor(key: string): PreviewVariant[] {
  return PREVIEW_VARIANTS[key] ?? [{ id: "default", label: "Example" }];
}

/** Render one template with the example data and the given wording. */
export async function renderSample(key: string, variant: string, copy: TemplateCopy): Promise<EmailContent> {
  switch (key) {
    case "welcome":
      return welcomeEmail({ name: sampleName }, copy);
    case "password-reset":
      return passwordResetEmail({ name: sampleName, url: sampleResetUrl }, copy);
    case "password-changed":
      return passwordChangedEmail({ name: sampleName }, copy);
    case "enquiry-received":
      return customerEnquiryAck(sampleLead, copy);
    case "enquiry-update":
      return customerEnquiryStatusUpdate(sampleLead, variant === "default" ? "Contacted" : variant, copy);
    case "order-received":
      return customerOrderConfirmation(variant === "products" ? sampleProductsOrder : sampleOrder, copy);
    case "order-paid-invoice":
      return customerInvoiceEmail(variant === "products" ? sampleProductsOrder : sampleOrder, sampleInvoice, copy);
    case "order-status-update":
      return customerOrderStatusUpdate({ ...sampleOrder, status: variant === "default" ? "Confirmed" : variant }, copy);
    case "payment-failed":
      return customerPaymentFailed(sampleOrder, copy);
    case "quote-received":
      return customerQuoteSubmitted(sampleQuote, copy);
    case "quote-approved":
      return quoteApprovedEmail(sampleQuote, copy);
    case "quote-needs-changes":
      return quoteRejectedEmail({ ...sampleQuote, rejectionReason: variant === "no-reason" ? null : sampleQuote.rejectionReason }, copy);
    default:
      throw new Error(`Unknown email template "${key}"`);
  }
}
