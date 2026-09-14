"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createOrder, createDraftOrderForCheckout } from "@/lib/orders/queries";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { customerOrderStatusUpdate } from "@/lib/email/templates";
import { stripe } from "@/lib/stripe/client";
import { SITE_URL } from "@/lib/site";
import {
  orderStatuses,
  type CreateCheckoutSessionResult,
  type OrderActionResult,
  type OrderStatus,
  type PlaceOrderPayload,
  type PlaceOrderResult,
} from "@/lib/orders/types";

// ─── Checkout ──────────────────────────────────────────────────────────────

export async function placeOrder(
  payload: PlaceOrderPayload,
): Promise<PlaceOrderResult> {
  const result = await createOrder(payload);
  if (result.ok) {
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/account/orders");
  }
  return result;
}

/**
 * Draft-order-then-Checkout-Session flow for "Pay online now". The Order row
 * is created up front (paymentStatus: Unpaid) so we don't have to cram a
 * whole cart into Stripe metadata — the webhook (src/app/api/webhooks/stripe/
 * route.ts) looks it up by id and flips it to Paid once Stripe confirms
 * payment. If Stripe session creation fails, the draft order is deleted so we
 * don't leave an orphaned Unpaid row with no Checkout Session behind it.
 */
export async function createCheckoutSession(
  payload: PlaceOrderPayload,
): Promise<CreateCheckoutSessionResult> {
  const draft = await createDraftOrderForCheckout(payload);
  if (!draft.ok) return draft;

  const { order } = draft;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: { name: item.name },
          unit_amount: Math.round((item.unitPrice ?? 0) * 100),
        },
        quantity: item.quantity,
      })),
      invoice_creation: { enabled: true },
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout`,
      metadata: { orderId: order.id },
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return { ok: true, url: session.url };
  } catch {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    return {
      ok: false,
      errors: { lines: "Could not start checkout. Try again, or use “Place Order”." },
    };
  }
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<OrderActionResult> {
  await requireAdmin();
  if (!orderStatuses.includes(status as OrderStatus)) {
    return { ok: false, error: "Unknown status." };
  }
  const order = await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
    include: { items: true },
  });

  if (status !== "Pending") {
    await createNotification({
      userId: order.userId,
      kind: "order",
      title: `Order ${order.reference} is now ${status}`,
      href: "/account/orders",
    });
    after(async () => {
      await sendEmail({
        to: order.email,
        ...customerOrderStatusUpdate(order),
      });
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  revalidatePath("/account/inbox");
  return { ok: true };
}
