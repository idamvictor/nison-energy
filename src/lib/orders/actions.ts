"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth/session";
import { createOrder, toOrderRecord, validateContactDetails } from "@/lib/orders/queries";
import { priceCart, type PricedLine } from "@/lib/orders/pricing";
import { DELIVERY_LABEL } from "@/lib/orders/delivery";
import { checkUkPostcode } from "@/lib/postcode";
import type { Prisma } from "@/generated/prisma/client";
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
  type OrderActionResult,
  type OrderStatus,
  type PlaceOrderPayload,
  type PlaceOrderResult,
  type OrderLineInput,
  type SaveCheckoutDetailsResult,
  type StartCheckoutResult,
  type CheckoutKind,
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
 * Opens a Stripe Checkout Session for the cart as soon as /checkout loads, so
 * the express wallet buttons (Apple Pay / Google Pay / PayPal) work before the
 * customer types anything. Prices come from the database (priceCart), never
 * the browser. The cart is held in a CheckoutDraft; the Order itself is only
 * created once Stripe confirms payment (src/lib/orders/fulfil.ts). Called
 * again (with the previous draft id) whenever the cart or extras change.
 */
export async function startCheckout(
  lines: OrderLineInput[],
  previousDraftId?: string,
  /** "wallet" = express + pay later (Dashboard-driven methods); "card" = card only. */
  kind: CheckoutKind = "wallet",
  /** keepCart: a product-page "buy now" — the success page leaves the basket alone. */
  opts?: { keepCart?: boolean },
): Promise<StartCheckoutResult> {
  const ip = await getClientIp();
  const allowed = await checkRateLimit(`checkout-start:${ip}`, { limit: 150, windowMs: 10 * 60_000 });
  if (!allowed) return { ok: false, error: "Too many attempts — please try again in a few minutes." };

  if (previousDraftId) await discardDraft(previousDraftId);

  const priced = await priceCart(lines);
  if (!priced.ok) return { ok: false, error: priced.error };
  const { cart } = priced;
  if (cart.hasQuoteOnly) {
    return { ok: false, error: "Some items don't have a fixed price yet — use “Place Order” instead." };
  }

  const user = await getCurrentUser();
  const draft = await prisma.checkoutDraft.create({
    data: {
      userId: user?.id ?? null,
      lines: cart.lines as unknown as Prisma.InputJsonValue,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
    },
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Payment happens on our own /checkout page (Express Checkout + Payment
      // Element). No payment_method_types: Stripe shows whatever is switched
      // on in the Dashboard, so newly enabled methods appear automatically.
      ui_mode: "elements",
      // The Card category is card-only by definition; the wallet session
      // stays Dashboard-driven so newly enabled wallets appear automatically.
      ...(kind === "card" ? { payment_method_types: ["card" as const] } : {}),
      line_items: cart.lines.map((line) => ({
        price_data: {
          currency: "gbp",
          product_data: { name: line.name },
          unit_amount: Math.round((line.unitPrice ?? 0) * 100),
        },
        quantity: line.quantity,
      })),
      // An inline rate (no Stripe objects) so test and live behave the same;
      // wallets show it in their sheet too.
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: DELIVERY_LABEL,
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(cart.deliveryFee * 100), currency: "gbp" },
          },
        },
      ],
      // Wallets (express) supply the delivery address; the card path hands
      // over the address, email and phone from our form before confirming.
      shipping_address_collection: { allowed_countries: ["GB"] },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      customer_creation: "always",
      invoice_creation: { enabled: true },
      return_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}${opts?.keepCart ? "&keep_cart=1" : ""}`,
      metadata: { draftId: draft.id },
    });
    if (!session.client_secret) throw new Error("Stripe did not return a client secret.");

    await prisma.checkoutDraft.update({
      where: { id: draft.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return {
      ok: true,
      clientSecret: session.client_secret,
      draftId: draft.id,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
    };
  } catch {
    await prisma.checkoutDraft.delete({ where: { id: draft.id } }).catch(() => {});
    return {
      ok: false,
      error: "Could not start payment. Please try again, or message us on WhatsApp and we'll help.",
    };
  }
}

/**
 * Card path: validates the checkout form and stores it on the draft just
 * before the customer confirms, so the Order is created with exactly these
 * details. (Express wallets skip this — their details come from Stripe.)
 */
export async function saveCheckoutDetails(
  draftId: string,
  payload: PlaceOrderPayload,
): Promise<SaveCheckoutDetailsResult> {
  const blocked = await checkoutGuard(payload);
  if (blocked) return blocked;

  const contact = validateContactDetails(payload);
  if (!contact.ok) return contact;

  const draft = await prisma.checkoutDraft.findUnique({ where: { id: draftId } });
  if (!draft) return { ok: false, errors: { lines: "Your checkout expired — please refresh the page." } };

  // Installation orders need a real UK postcode for the installer.
  const lines = draft.lines as unknown as PricedLine[];
  if (lines.some((l) => l.options?.installation === "standard")) {
    const check = await checkUkPostcode(contact.details.postcode);
    if (!check.valid) return { ok: false, errors: { postcode: check.reason } };
    contact.details.postcode = check.postcode;
  }

  await prisma.checkoutDraft.update({
    where: { id: draftId },
    data: {
      details: {
        ...contact.details,
        termsAcceptedAt: new Date().toISOString(),
      } as unknown as Prisma.InputJsonValue,
    },
  });
  return { ok: true };
}

/** Expires a superseded session and drops its draft (cart changed, page left). */
async function discardDraft(draftId: string): Promise<void> {
  const draft = await prisma.checkoutDraft.findUnique({ where: { id: draftId } });
  if (!draft) return;
  if (draft.stripeCheckoutSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(draft.stripeCheckoutSessionId);
      if (session.status !== "open") return; // completed/expired — fulfilment owns it
      await stripe.checkout.sessions.expire(session.id);
    } catch {
      return;
    }
  }
  await prisma.checkoutDraft.delete({ where: { id: draftId } }).catch(() => {});
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
