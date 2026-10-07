import { z } from "zod";

import { normalisePostcode } from "@/lib/postcode";

// One set of checkout rules, used by the form (inline errors) and the server
// (validateContactDetails) — so both always agree.

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
// 0 or +44 / 44, then 9–10 digits (spaces, dashes and brackets ignored).
const UK_PHONE_RE = /^(?:0|44)\d{9,10}$/;

const required = (label: string, max = 120) =>
  z
    .string({ error: `Enter your ${label}.` })
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(max, `Keep your ${label} under ${max} characters.`);

const optional = (label: string) =>
  z.string().trim().max(120, `Keep the ${label} under 120 characters.`).optional().default("");

const postcode = (label: string) =>
  z
    .string({ error: `Enter the ${label}.` })
    .trim()
    .min(1, `Enter the ${label}.`)
    .regex(UK_POSTCODE_RE, "Enter a valid UK postcode, e.g. SW1A 2AA.")
    .transform(normalisePostcode);

export const checkoutDetailsSchema = z
  .object({
    firstName: required("first name", 60),
    lastName: required("last name", 60),
    email: z
      .string({ error: "Enter your email." })
      .trim()
      .min(1, "Enter your email.")
      .pipe(z.email("Enter a valid email address.")),
    phone: z
      .string({ error: "Enter a phone number." })
      .trim()
      .min(1, "Enter a phone number.")
      .refine((v) => UK_PHONE_RE.test(v.replace(/[\s\-()+]/g, "")), "Enter a valid UK phone number."),
    company: optional("company name"),
    address: required("address"),
    addressLine2: optional("apartment / suite"),
    city: required("town or city", 80),
    postcode: postcode("postcode"),
    billingSameAsDelivery: z.boolean().default(true),
    billingAddress: z.string().trim().optional().default(""),
    billingAddressLine2: optional("billing apartment / suite"),
    billingCity: z.string().trim().optional().default(""),
    billingPostcode: z.string().trim().optional().default(""),
    acceptedTerms: z.literal(true, "Please tick to agree to the Terms and Conditions of Sale."),
    notes: z.string().trim().max(2000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.billingSameAsDelivery) return;
    if (!data.billingAddress)
      ctx.addIssue({ code: "custom", path: ["billingAddress"], message: "Enter the billing address." });
    if (!data.billingCity)
      ctx.addIssue({ code: "custom", path: ["billingCity"], message: "Enter the billing town or city." });
    if (!data.billingPostcode) {
      ctx.addIssue({ code: "custom", path: ["billingPostcode"], message: "Enter the billing postcode." });
    } else if (!UK_POSTCODE_RE.test(data.billingPostcode)) {
      ctx.addIssue({ code: "custom", path: ["billingPostcode"], message: "Enter a valid UK postcode, e.g. SW1A 2AA." });
    }
  });

export type CheckoutDetailsInput = z.input<typeof checkoutDetailsSchema>;

/** First message per field: `{ email: "Enter a valid email address.", … }`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

/** Billing rules on their own, so they report alongside other field errors
 *  (the schema's cross-field check only runs once every field parses). */
function billingErrors(input: unknown): Record<string, string> {
  const i = (input ?? {}) as Record<string, unknown>;
  if (i.billingSameAsDelivery !== false) return {};
  const v = (k: string) => (typeof i[k] === "string" ? (i[k] as string).trim() : "");
  const errors: Record<string, string> = {};
  if (!v("billingAddress")) errors.billingAddress = "Enter the billing address.";
  if (!v("billingCity")) errors.billingCity = "Enter the billing town or city.";
  if (!v("billingPostcode")) errors.billingPostcode = "Enter the billing postcode.";
  else if (!UK_POSTCODE_RE.test(v("billingPostcode")))
    errors.billingPostcode = "Enter a valid UK postcode, e.g. SW1A 2AA.";
  return errors;
}

/** Validate checkout details; `{ ok: true, data }` or `{ ok: false, errors }` keyed by field. */
export function checkCheckoutDetails(input: unknown) {
  const result = checkoutDetailsSchema.safeParse(input);
  return result.success
    ? ({ ok: true, data: result.data } as const)
    : ({ ok: false, errors: { ...billingErrors(input), ...fieldErrors(result.error) } } as const);
}
