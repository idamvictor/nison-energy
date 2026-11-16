// The customer email templates that can be read / edited in the admin
// (/admin/email-templates). Each template's editable wording lives here as
// its default; the Super admin's edits are stored in the EmailTemplate table
// and merged over these (src/lib/email/template-copy.ts). Layout, logo,
// footer, order tables, totals, addresses and links stay in code
// (src/lib/email/templates.ts). Client-safe.
//
// Text format: {placeholder} values, **bold**, *italic*, [link text](url or
// {placeholder}), and a line break for a new line.

export type TemplateGroup = "Account" | "Enquiries" | "Orders" | "Quotes";

export type TemplateField = {
  id: string;
  label: string;
  default: string;
  /** Subject / heading / button: plain text, no bold or links. */
  plain?: boolean;
  multiline?: boolean;
};

export type TemplatePlaceholder = { name: string; description: string };

export type TemplateDef = {
  key: string;
  label: string;
  group: TemplateGroup;
  /** When the customer receives it. */
  trigger: string;
  fields: TemplateField[];
  placeholders: TemplatePlaceholder[];
  /** Parts added automatically that can't be edited. */
  automatic: string[];
};

/** Available in every template. */
export const GLOBAL_PLACEHOLDERS: TemplatePlaceholder[] = [
  { name: "company", description: "Trading name (Ocunio Energy)" },
  { name: "companyEmail", description: "Company email address" },
  { name: "whatsappUrl", description: "WhatsApp chat link (use inside [text](…))" },
];

const P = (name: string, description: string): TemplatePlaceholder => ({ name, description });
const subject = (d: string): TemplateField => ({ id: "subject", label: "Subject line", default: d, plain: true });
const heading = (d: string): TemplateField => ({ id: "heading", label: "Heading", default: d, plain: true });
const button = (d: string, id = "button", label = "Button text"): TemplateField => ({ id, label, default: d, plain: true });
const para = (id: string, label: string, d: string): TemplateField => ({ id, label, default: d, multiline: true });

const orderButtons = [
  button("View your orders", "buttonAccount", "Button (customer with an account)"),
  button("Message us on WhatsApp", "buttonGuest", "Button (guest checkout — opens WhatsApp)"),
];

export const EMAIL_TEMPLATES: TemplateDef[] = [
  {
    key: "welcome",
    label: "Welcome",
    group: "Account",
    trigger: "A customer creates an account",
    placeholders: [P("name", "Customer's name (or “there”)"), P("grantGuideUrl", "OZEV grant guide page")],
    automatic: ["Logo, footer and button link (their account page)"],
    fields: [
      subject("Welcome to {company}"),
      heading("Welcome, {name}!"),
      para(
        "paragraph1",
        "Paragraph 1",
        "Thanks for creating your {company} account. From your account you can track orders, download grant quotes and keep your saved chargers.",
      ),
      para(
        "paragraph2",
        "Paragraph 2",
        "Thinking about an OZEV grant? [See how it works]({grantGuideUrl}) — you could get up to £500 off your charger installation.",
      ),
      button("Go to your account"),
    ],
  },
  {
    key: "password-reset",
    label: "Reset your password",
    group: "Account",
    trigger: "A customer asks to reset their password",
    placeholders: [P("name", "Customer's name (or “there”)")],
    automatic: ["The secure reset link behind the button (always added, can't be changed)", "Logo and footer"],
    fields: [
      subject("Reset your {company} password"),
      heading("Reset your password"),
      para("greeting", "Greeting", "Hi {name},"),
      para(
        "paragraph1",
        "Paragraph",
        "We received a request to reset your password. This link expires in one hour. If you didn't request it, you can safely ignore this email.",
      ),
      button("Set a new password"),
    ],
  },
  {
    key: "password-changed",
    label: "Password changed",
    group: "Account",
    trigger: "A customer's password is changed",
    placeholders: [P("name", "Customer's name (or “there”)")],
    automatic: ["Logo, footer and button link (forgot-password page)"],
    fields: [
      subject("Your {company} password was changed"),
      heading("Your password was changed"),
      para("greeting", "Greeting", "Hi {name},"),
      para("paragraph1", "Paragraph 1", "The password for your account was just changed."),
      para(
        "paragraph2",
        "Paragraph 2",
        "If this was you, there's nothing else to do. If it wasn't, reset your password straight away and [let us know on WhatsApp]({whatsappUrl}).",
      ),
      button("Reset password"),
    ],
  },
  {
    key: "enquiry-received",
    label: "Enquiry received",
    group: "Enquiries",
    trigger: "A customer sends the contact / enquiry form",
    placeholders: [
      P("firstName", "Customer's first name"),
      P("reasonForEnquiry", "Reason they chose (e.g. Installation)"),
      P("areaOfEnquiry", "Area they chose (e.g. Home Charging)"),
    ],
    automatic: ["Logo and footer"],
    fields: [
      subject("We've got your enquiry"),
      heading("Thanks, {firstName} — we've received your enquiry"),
      para(
        "paragraph1",
        "Paragraph 1",
        "A member of the {company} team will be in touch shortly about your **{reasonForEnquiry}** enquiry for **{areaOfEnquiry}**.",
      ),
      para("paragraph2", "Paragraph 2", "If it's urgent, [message us on WhatsApp]({whatsappUrl})."),
    ],
  },
  {
    key: "enquiry-update",
    label: "Enquiry update",
    group: "Enquiries",
    trigger: "Staff move an enquiry to Contacted, Quoted or Won (Lost isn't emailed)",
    placeholders: [
      P("firstName", "Customer's first name"),
      P("areaOfEnquiry", "Area of the enquiry"),
      P("status", "New status (Contacted / Quoted / Won)"),
    ],
    automatic: ["Logo, footer and button link (their messages)"],
    fields: [
      subject("An update on your {areaOfEnquiry} enquiry"),
      heading("Hi {firstName}, there's an update on your enquiry"),
      para("intro", "Opening line", "Your enquiry about **{areaOfEnquiry}** is now **{status}**."),
      para("statusContacted", "Line when Contacted", "We've picked up your enquiry and a member of the team is in touch with you."),
      para("statusQuoted", "Line when Quoted", "We've prepared a quote for you — keep an eye on your inbox and messages."),
      para(
        "statusWon",
        "Line when Won",
        "Great news — we're going ahead. We'll guide you through the next steps, including any OZEV grant paperwork.",
      ),
      button("View your messages"),
    ],
  },
  {
    key: "order-received",
    label: "Order received (pay later)",
    group: "Orders",
    trigger: "A customer places an order without paying online",
    placeholders: [P("firstName", "Customer's first name"), P("orderReference", "Order reference")],
    automatic: [
      "Items, delivery and total",
      "Delivery & installation address",
      "Survey callout (only when the order includes installation) and its survey link",
      "Logo, footer and button links",
    ],
    fields: [
      subject("Order {orderReference} received"),
      heading("Thanks, {firstName} — we've got your order"),
      para("referenceLine", "Reference line", "Your order reference is **{orderReference}**."),
      para(
        "paymentInstall",
        "Payment line (with installation)",
        "No payment is taken online — a member of the team will be in touch to confirm payment and book your installation.",
      ),
      para(
        "paymentNoInstall",
        "Payment line (products only)",
        "No payment is taken online — a member of the team will be in touch to confirm payment and arrange delivery.",
      ),
      { id: "surveyTitle", label: "Survey callout title", default: "Next step: complete your virtual survey", plain: true },
      para(
        "surveyBody",
        "Survey callout text",
        "It takes about 5 minutes — a few photos and questions about where your charger is going. Our team reviews it before booking your installation.",
      ),
      { id: "surveyLink", label: "Survey link text", default: "Start your survey →", plain: true },
      ...orderButtons,
    ],
  },
  {
    key: "order-paid-invoice",
    label: "Payment received & invoice",
    group: "Orders",
    trigger: "A customer pays online (card, Apple Pay, Google Pay, PayPal) — the PDF invoice is attached",
    placeholders: [
      P("firstName", "Customer's first name"),
      P("orderReference", "Order reference"),
      P("invoiceNumber", "Invoice number"),
      P("surveyUrl", "Open Quote virtual survey link"),
    ],
    automatic: [
      "Invoice box (number, date, payment method)",
      "Items, delivery, VAT and total paid",
      "Billing and delivery addresses",
      "Company registration / VAT line",
      "PDF invoice attachment",
    ],
    fields: [
      subject("Your invoice {invoiceNumber} — order {orderReference} (paid)"),
      para("greeting", "Greeting", "Hi {firstName},"),
      para("thanks", "Thank-you line", "Thank you for your order. We've received your payment, and your order is confirmed."),
      para("orderNumberLine", "Order number line", "Order number: **{orderReference}**"),
      { id: "installIntro", label: "With installation — section title", default: "Here’s what happens from here:", plain: true },
      { id: "install1Title", label: "With installation — step 1 title", default: "1. Check your inbox.", plain: true },
      para(
        "install1Body",
        "With installation — step 1",
        "Your order confirmation and receipt are on their way. If you can’t see them, check your spam folder.",
      ),
      { id: "install2Title", label: "With installation — step 2 title", default: "2. We’ll arrange your survey.", plain: true },
      para(
        "install2Body",
        "With installation — step 2",
        "Use [Open Quote]({surveyUrl}), a virtual survey tool, to begin your home survey. Our engineer will review your submissions and confirm the best position for your charger and check whether any extra work is needed, so there are no surprises on the day.",
      ),
      { id: "install3Title", label: "With installation — step 3 title", default: "3. Installation day", plain: true },
      para(
        "install3Body",
        "With installation — step 3",
        "We’ll book your installation within two weeks of the survey. Your engineer will fit and test the charger, set up the app, and show you how everything works.",
      ),
      { id: "install4Title", label: "With installation — step 4 title", default: "4. Ongoing support", plain: true },
      para("install4Body", "With installation — step 4", "After installation, our aftercare team is here to help with any questions."),
      para(
        "installQuestions",
        "With installation — questions line",
        "*Questions in the meantime?* [Chat with us on WhatsApp]({whatsappUrl}) · [{companyEmail}](mailto:{companyEmail})",
      ),
      { id: "productsIntro", label: "Products only — section title", default: "What happens next?", plain: true },
      { id: "products1Title", label: "Products only — step 1 title", default: "1. Delivery", plain: true },
      para("products1Body", "Products only — step 1", "Your order will arrive by free tracked delivery within 1–3 days."),
      { id: "products2Title", label: "Products only — step 2 title", default: "2. Safety information", plain: true },
      para(
        "products2Body",
        "Products only — step 2",
        "Chargers and circuit protection must be installed by a qualified electrician in line with BS 7671 wiring regulations.",
      ),
      { id: "products3Title", label: "Products only — step 3 title", default: "3. Support", plain: true },
      para(
        "products3Body",
        "Products only — step 3",
        "Questions about your product? Reply to this email or chat with us on WhatsApp: [https://wa.me/447525567054](https://wa.me/447525567054)",
      ),
      para("closing", "Closing line", "Thanks for choosing {company}."),
      para(
        "signOff",
        "Sign-off",
        "The {company} Team\n[{companyEmail}](mailto:{companyEmail}) | [www.ocunioenergy.com](https://www.ocunioenergy.com)",
      ),
    ],
  },
  {
    key: "order-status-update",
    label: "Order status update",
    group: "Orders",
    trigger: "Staff change an order's status",
    placeholders: [P("orderReference", "Order reference"), P("status", "New status")],
    automatic: ["Items, delivery and total", "Logo, footer and button links"],
    fields: [
      subject("Order {orderReference} is now {status}"),
      heading("Your order is now {status}"),
      para("referenceLine", "Reference line", "Order reference **{orderReference}**."),
      para("statusConfirmed", "Line when Confirmed", "We've confirmed your order and payment. Installation scheduling is next."),
      para(
        "statusScheduled",
        "Line when Scheduled",
        "Your installation is being scheduled — we'll be in touch to confirm the date with you.",
      ),
      para("statusInstalled", "Line when Installed", "Your charger has been installed. Welcome to easier charging!"),
      para("statusCancelled", "Line when Cancelled", "Your order has been cancelled. If this is unexpected, please get in touch."),
      para("statusOther", "Line for any other status", "There's an update on your order."),
      ...orderButtons,
    ],
  },
  {
    key: "payment-failed",
    label: "Payment failed",
    group: "Orders",
    trigger: "An online payment fails",
    placeholders: [P("firstName", "Customer's first name"), P("orderReference", "Order reference"), P("total", "Order total")],
    automatic: ["Logo, footer and button link (checkout)"],
    fields: [
      subject("Your payment for order {orderReference} didn't go through"),
      heading("Hi {firstName}, your payment didn't go through"),
      para(
        "paragraph1",
        "Paragraph 1",
        "We couldn't take payment for your order **{orderReference}** ({total}). No money has been taken.",
      ),
      para(
        "paragraph2",
        "Paragraph 2",
        "This is usually a declined card or a cancelled bank check. You can try again with the same or a different card — or get in touch and we'll help.",
      ),
      button("Try again"),
    ],
  },
  {
    key: "quote-received",
    label: "Quote received",
    group: "Quotes",
    trigger: "A customer submits an OZEV grant quote for review",
    placeholders: [
      P("firstName", "Customer's first name (or “there”)"),
      P("schemeLabel", "Grant scheme name"),
      P("quoteReference", "Quote reference"),
    ],
    automatic: ["Logo, footer and button link (their quotes)"],
    fields: [
      subject("We've received your {schemeLabel} quote"),
      heading("Thanks, {firstName} — your quote is with us"),
      para(
        "paragraph1",
        "Paragraph 1",
        "Your **{schemeLabel}** quote (reference **{quoteReference}**) has been submitted for review.",
      ),
      para(
        "paragraph2",
        "Paragraph 2",
        "Our team checks every grant quote before it can be used in your application. We'll email you as soon as it's approved, or if anything needs changing.",
      ),
      button("View your quotes"),
    ],
  },
  {
    key: "quote-approved",
    label: "Quote approved",
    group: "Quotes",
    trigger: "Staff approve a grant quote",
    placeholders: [P("schemeLabel", "Grant scheme name"), P("quoteReference", "Quote reference")],
    automatic: ["Logo, footer and button link (their quotes)"],
    fields: [
      subject("Your {schemeLabel} quote is ready"),
      heading("Your quote has been approved"),
      para(
        "paragraph1",
        "Paragraph",
        "Your **{schemeLabel}** quote (reference **{quoteReference}**) has been reviewed and approved — you can download it now.",
      ),
      button("Download your quote"),
    ],
  },
  {
    key: "quote-needs-changes",
    label: "Quote needs changes",
    group: "Quotes",
    trigger: "Staff reject a grant quote",
    placeholders: [
      P("schemeLabel", "Grant scheme name"),
      P("quoteReference", "Quote reference"),
      P("reason", "The reason staff gave"),
    ],
    automatic: ["Logo, footer and button link (their quotes)"],
    fields: [
      subject("Your {schemeLabel} quote needs changes"),
      heading("Your quote needs a few changes"),
      para(
        "paragraph1",
        "Paragraph",
        "Your **{schemeLabel}** quote (reference **{quoteReference}**) couldn't be approved as submitted.",
      ),
      para("reasonLine", "Reason line (shown when a reason is given)", "**Reason:** {reason}"),
      button("View details"),
    ],
  },
];

export type TemplateKey = (typeof EMAIL_TEMPLATES)[number]["key"];

export function getTemplateDef(key: string): TemplateDef | undefined {
  return EMAIL_TEMPLATES.find((t) => t.key === key);
}

/** field id → text, for one template. */
export type TemplateCopy = Record<string, string>;

export function defaultCopy(key: string): TemplateCopy {
  const def = getTemplateDef(key);
  if (!def) throw new Error(`Unknown email template "${key}"`);
  return Object.fromEntries(def.fields.map((f) => [f.id, f.default]));
}

/** Placeholders a field may use that this template doesn't define. */
export function unknownPlaceholders(def: TemplateDef, text: string): string[] {
  const allowed = new Set([...def.placeholders, ...GLOBAL_PLACEHOLDERS].map((p) => p.name));
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((n) => !allowed.has(n));
}
