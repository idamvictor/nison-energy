"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createOrder, createDraftOrderForCheckout, toOrderRecord } from "@/lib/orders/queries";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { customerOrderStatusUpdate } from "@/lib/email/templates";
import { stripe } from "@/lib/stripe/client";
import { SITE_URL } from "@/lib/site";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getClientIp } from "@/lib/rate-limit/ip";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  orderStatuses,
  type CreateCheckoutSessionResult,
  type OrderActionResult,
  type OrderStatus,
  type PlaceOrderPayload,
  type PlaceOrderResult,
} from "@/lib/orders/types";

// ─── Checkout ──────────────────────────────────────────────────────────────

// Shared guard for both checkout paths. Unlike the lead forms' honeypot (which
// fakes success to deceive spam bots harmlessly), a tripped checkout honeypot
// returns a real error — there's no safe "pretend this order was placed"
// outcome for a monetary transaction. Both PlaceOrderResult and
// CreateCheckoutSessionResult share the same `{ ok: false; errors }` shape.
async function checkoutGuard(
  payload: PlaceOrderPayload,
): Promise<{ ok: false; errors: Record<string, string> } | null> {
  if ((payload.honeypot ?? "").trim() !== "") {
    return { ok: false, errors: { lines: "Could not process your request." } };
  }
  const ip = await getClientIp();
  const allowed = await checkRateLimit(`checkout:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!allowed) {
    return {
      ok: false,
      errors: { lines: "Too many attempts — please try again in a few minutes." },
    };
  }
  return null;
}

export async function placeOrder(
  payload: PlaceOrderPayload,
): Promise<PlaceOrderResult> {
  const blocked = await checkoutGuard(payload);
  if (blocked) return blocked;

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
  const blocked = await checkoutGuard(payload);
  if (blocked) return blocked;

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
  const order = toOrderRecord(
    await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: { items: true },
    }),
  );

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
  revalidateTag(CACHE_TAGS.orders, { expire: 0 });
  return { ok: true };
}
