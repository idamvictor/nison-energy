import { NextResponse } from "next/server";
import { after } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { getStaffEmails } from "@/lib/email/recipients";
import { customerOrderConfirmation, staffOrderAlert } from "@/lib/email/templates";

// Uses the raw request body for signature verification — never statically cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "unpaid") {
        await markOrderPaid(session);
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markOrderFailed(session);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// Fulfillment lives here, driven by the verified webhook event — never on the
// client-side success page, since a customer can close the tab before it
// loads. The conditional updateMany (paymentStatus not already "Paid") makes
// this idempotent against Stripe's at-least-once webhook delivery.
async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const taxAmount =
    session.total_details?.amount_tax != null
      ? Math.round(session.total_details.amount_tax / 100)
      : null;
  const total = session.amount_total != null ? Math.round(session.amount_total / 100) : null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const { count } = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: { not: "Paid" } },
    data: {
      paymentStatus: "Paid",
      status: "Confirmed",
      stripePaymentIntentId: paymentIntentId,
      taxAmount,
      total,
    },
  });
  if (count === 0) return; // already processed (duplicate delivery) or order missing

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;

  await createNotification({
    userId: order.userId,
    kind: "order",
    title: `Payment received for order ${order.reference}`,
    href: "/account/orders",
  });

  after(async () => {
    await sendEmail({
      to: order.email,
      ...customerOrderConfirmation(order, { paid: true }),
    });
    const staff = await getStaffEmails();
    await sendEmail({
      to: staff,
      replyTo: order.email,
      ...staffOrderAlert(order),
    });
  });
}

async function markOrderFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "Unpaid" },
    data: { paymentStatus: "Failed" },
  });
}
