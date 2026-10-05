import "server-only";

import { after } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { getStaffEmails } from "@/lib/email/recipients";
import {
  customerOrderConfirmation,
  customerPaymentFailed,
  staffOrderAlert,
  staffPaymentFailed,
} from "@/lib/email/templates";
import { insertOrder, toOrderRecord, type ContactDetails } from "@/lib/orders/queries";
import type { PricedLine } from "@/lib/orders/pricing";
import type { OrderWithItems } from "@/lib/orders/types";

type DraftDetails = ContactDetails & { termsAcceptedAt?: string };

const pounds = (pence: number | null | undefined) => (pence == null ? null : pence / 100);

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : (session.payment_intent?.id ?? null);
}

/** Express wallets (Apple Pay / Google Pay / PayPal) — details come from Stripe. */
function detailsFromSession(session: Stripe.Checkout.Session): ContactDetails {
  const customer = session.customer_details;
  const shipping = session.collected_information?.shipping_details;
  const name = (shipping?.name || customer?.name || "").trim();
  const [firstName = "", ...rest] = name.split(/\s+/);
  const delivery = shipping?.address ?? customer?.address;
  const billing = customer?.address;
  const line = (a?: Stripe.Address | null) => [a?.line1, a?.line2].filter(Boolean).join(", ");
  const sameAddress =
    !billing || !delivery || (billing.line1 === delivery.line1 && billing.postal_code === delivery.postal_code);
  return {
    firstName: firstName || "Customer",
    lastName: rest.join(" "),
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    address: line(delivery),
    city: delivery?.city ?? null,
    postcode: delivery?.postal_code ?? "",
    billingSameAsDelivery: sameAddress,
    billingAddress: sameAddress ? null : line(billing),
    billingCity: sameAddress ? null : (billing?.city ?? null),
    billingPostcode: sameAddress ? null : (billing?.postal_code ?? null),
    notes: null,
  };
}

function sendPaidNotices(order: OrderWithItems) {
  after(async () => {
    await createNotification({
      userId: order.userId,
      kind: "order",
      title: `Payment received for order ${order.reference}`,
      href: "/account/orders",
    });
    await sendEmail({ to: order.email, ...customerOrderConfirmation(order, { paid: true }) });
    const staff = await getStaffEmails();
    await sendEmail({ to: staff, replyTo: order.email, ...staffOrderAlert(order) });
  });
}

async function findOrder(sessionId: string): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });
  return order ? toOrderRecord(order) : null;
}

/**
 * Turns a completed Checkout Session into an Order (once). Called from both
 * the webhook and the success page — whichever comes first creates it; the
 * unique stripeCheckoutSessionId makes the second a no-op. Returns the Order,
 * or null when the session isn't complete / isn't one of ours.
 */
export async function fulfilCheckoutSession(sessionId: string): Promise<OrderWithItems | null> {
  const existing = await findOrder(sessionId);
  if (existing) return existing;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
  if (session.status !== "complete") return null;
  const draftId = session.metadata?.draftId;
  if (!draftId) return null;

  const draft = await prisma.checkoutDraft.findUnique({ where: { id: draftId } });
  if (!draft) return findOrder(sessionId); // another request fulfilled it a moment ago

  const fromForm = draft.details as unknown as DraftDetails | null;
  const { termsAcceptedAt, ...details } = fromForm ?? { ...detailsFromSession(session) };
  const paid = session.payment_status !== "unpaid";

  let order: OrderWithItems;
  try {
    order = await insertOrder({
      details: details as ContactDetails,
      lines: draft.lines as unknown as PricedLine[],
      subtotal: Number(draft.subtotal),
      deliveryFee: Number(draft.deliveryFee),
      userId: draft.userId,
      // Express buyers tick the terms box before the wallet opens (enforced on the page).
      termsAcceptedAt: termsAcceptedAt ? new Date(termsAcceptedAt) : new Date(session.created * 1000),
      paymentStatus: paid ? "Paid" : "Unpaid",
      status: paid ? "Confirmed" : "Pending",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId(session),
      taxAmount: pounds(session.total_details?.amount_tax),
      total: pounds(session.amount_total),
    });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return findOrder(sessionId);
    throw err;
  }

  await prisma.checkoutDraft.delete({ where: { id: draftId } }).catch(() => {});
  if (paid) sendPaidNotices(order);
  return order;
}

/** Delayed payment methods that settle after the customer left the page. */
export async function markSessionPaid(session: Stripe.Checkout.Session): Promise<void> {
  const created = await fulfilCheckoutSession(session.id);
  if (!created) return;
  const { count } = await prisma.order.updateMany({
    where: { stripeCheckoutSessionId: session.id, paymentStatus: { not: "Paid" } },
    data: { paymentStatus: "Paid", status: "Confirmed", stripePaymentIntentId: paymentIntentId(session) },
  });
  if (count === 0) return; // already paid (fulfilment sent the emails)
  const order = await findOrder(session.id);
  if (order) sendPaidNotices(order);
}

export async function markSessionFailed(session: Stripe.Checkout.Session): Promise<void> {
  await fulfilCheckoutSession(session.id);
  const { count } = await prisma.order.updateMany({
    where: { stripeCheckoutSessionId: session.id, paymentStatus: "Unpaid" },
    data: { paymentStatus: "Failed" },
  });
  if (count === 0) return;
  const order = await findOrder(session.id);
  if (!order) return;
  after(async () => {
    await sendEmail({ to: order.email, ...customerPaymentFailed(order) });
    const staff = await getStaffEmails();
    await sendEmail({ to: staff, replyTo: order.email, ...staffPaymentFailed(order) });
  });
}

/** Abandoned checkout: the session expired unpaid — drop its draft. */
export async function discardExpiredSession(session: Stripe.Checkout.Session): Promise<void> {
  const draftId = session.metadata?.draftId;
  if (draftId) await prisma.checkoutDraft.deleteMany({ where: { id: draftId } });
}
