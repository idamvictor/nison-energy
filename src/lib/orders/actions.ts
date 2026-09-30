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
  type OrderWithItems,
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
    const customer = await upsertStripeCustomer(order);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // The Customer carries the checkout form's name + addresses, so Stripe's
      // payment page opens with the delivery address filled in as shipping
      // and "Billing info is same as shipping" ticked. Hosted Checkout can't
      // pre-fill a *different* billing address — those customers untick the
      // box and enter it (it's also saved on the order and the Customer).
      customer,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["GB"] },
      // Anything the customer corrects on Stripe's page is saved back.
      customer_update: { address: "auto", shipping: "auto", name: "auto" },
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
      errors: {
        lines: "Could not start payment. Please try again, or message us on WhatsApp and we'll help.",
      },
    };
  }
}

/**
 * Finds (by email) or creates the Stripe Customer for this order and sets its
 * name, phone, billing address and shipping (= delivery & installation)
 * address from the checkout form. Returns the Customer id.
 */
async function upsertStripeCustomer(order: OrderWithItems): Promise<string> {
  const name = `${order.firstName} ${order.lastName}`.trim();
  const delivery = {
    line1: order.address,
    city: order.city ?? undefined,
    postal_code: order.postcode,
    country: "GB",
  };
  const billing = order.billingSameAsDelivery
    ? delivery
    : {
        line1: order.billingAddress ?? order.address,
        city: order.billingCity ?? undefined,
        postal_code: order.billingPostcode ?? order.postcode,
        country: "GB",
      };
  const details = {
    name,
    email: order.email,
    phone: order.phone,
    address: billing,
    shipping: { name, phone: order.phone, address: delivery },
    metadata: { lastOrderReference: order.reference },
  };

  const existing = await stripe.customers.list({ email: order.email, limit: 1 });
  if (existing.data[0]) {
    await stripe.customers.update(existing.data[0].id, details);
    return existing.data[0].id;
  }
  const created = await stripe.customers.create(details);
  return created.id;
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
