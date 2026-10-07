import "server-only";

import { cache } from "react";
import { after } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import { checkCheckoutDetails } from "@/lib/orders/schema";
import { normalisePostcode } from "@/lib/postcode";
import { getCurrentUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { getStaffEmails } from "@/lib/email/recipients";
import {
  customerOrderConfirmation,
  staffOrderAlert,
} from "@/lib/email/templates";
import type { OrderItemRecord, OrderLineInput, OrderWithItems } from "@/lib/orders/types";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { CACHE_TTL } from "@/lib/cache/config";
import { priceCart, type PricedLine } from "@/lib/orders/pricing";

export type {
  OrderStatus,
  OrderLineInput,
  OrderWithItems,
  OrderRecord,
  OrderItemRecord,
} from "@/lib/orders/types";
export { orderStatuses } from "@/lib/orders/types";

// ─── Reads ──────────────────────────────────────────────────────────────────

// Prisma returns Decimal columns (subtotal/taxAmount/total/unitPrice) as
// Decimal objects, not plain numbers — a Server Component can't hand one to
// a "use client" component (Next.js props must be plain-serializable), and
// the app-facing OrderRecord/OrderItemRecord types are declared as `number`
// throughout. Convert once, here, rather than at every call site.
type RawOrder = Awaited<ReturnType<typeof prisma.order.findFirst>>;
type RawOrderItem = { [K in keyof OrderItemRecord]: unknown };

export function toOrderRecord(
  order: NonNullable<RawOrder> & { items: RawOrderItem[] },
): OrderWithItems {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee ?? 0),
    taxAmount: order.taxAmount == null ? null : Number(order.taxAmount),
    total: order.total == null ? null : Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice == null ? null : Number(item.unitPrice),
    })) as OrderWithItems["items"],
  } as OrderWithItems;
}

export const getOrders = cache(async () => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { items: true },
  });
  return orders.map(toOrderRecord);
});

export const getOrder = cache(async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? toOrderRecord(order) : null;
});

export const getOrderByCheckoutSession = cache(
  async (stripeCheckoutSessionId: string) => {
    const order = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId },
      include: { items: true },
    });
    return order ? toOrderRecord(order) : null;
  },
);

export const getOrdersForUser = cache(async (userId: string, email: string) => {
  const orders = await prisma.order.findMany({
    where: { OR: [{ userId }, { email }] },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map(toOrderRecord);
});

export const getPendingOrderCount = cache(
  unstable_cache(
    () => prisma.order.count({ where: { status: "Pending" } }),
    ["orders-pending-count"],
    { tags: [CACHE_TAGS.orders], revalidate: CACHE_TTL.adminMetrics },
  ),
);

// ─── Create ─────────────────────────────────────────────────────────────────

/** Raw contact/address fields from the checkout form (validated server-side). */
export type ContactInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  address?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  postcode?: unknown;
  billingSameAsDelivery?: unknown;
  billingAddress?: unknown;
  billingAddressLine2?: unknown;
  billingCity?: unknown;
  billingPostcode?: unknown;
  acceptedTerms?: unknown;
  notes?: unknown;
};

export type CreateOrderInput = ContactInput & { lines?: OrderLineInput[] };

export type CreateOrderResult =
  | { ok: true; reference: string }
  | { ok: false; errors: Record<string, string> };

/** Validated contact + delivery/billing details, as stored on an Order. */
export type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  address: string;
  addressLine2?: string | null;
  city: string | null;
  postcode: string;
  billingSameAsDelivery: boolean;
  billingAddress: string | null;
  billingAddressLine2?: string | null;
  billingCity: string | null;
  billingPostcode: string | null;
  notes: string | null;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function newReference(): string {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Contact, address and terms checks shared by "Place Order" and the card
 * checkout — the same Zod rules the form uses (src/lib/orders/schema.ts).
 */
export function validateContactDetails(
  input: ContactInput,
): { ok: true; details: ContactDetails } | { ok: false; errors: Record<string, string> } {
  const result = checkCheckoutDetails({
    firstName: str(input.firstName),
    lastName: str(input.lastName),
    email: str(input.email),
    phone: str(input.phone),
    company: str(input.company),
    address: str(input.address),
    addressLine2: str(input.addressLine2),
    city: str(input.city),
    postcode: str(input.postcode),
    // Anything but an explicit `false` means "same as delivery".
    billingSameAsDelivery: input.billingSameAsDelivery !== false,
    billingAddress: str(input.billingAddress),
    billingAddressLine2: str(input.billingAddressLine2),
    billingCity: str(input.billingCity),
    billingPostcode: str(input.billingPostcode),
    acceptedTerms: input.acceptedTerms === true,
    notes: str(input.notes),
  });
  if (!result.ok) return { ok: false, errors: result.errors };
  const d = result.data;
  const same = d.billingSameAsDelivery;
  return {
    ok: true,
    details: {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      company: d.company || null,
      address: d.address,
      addressLine2: d.addressLine2 || null,
      city: d.city || null,
      postcode: d.postcode,
      billingSameAsDelivery: same,
      billingAddress: same ? null : d.billingAddress,
      billingAddressLine2: same ? null : d.billingAddressLine2 || null,
      billingCity: same ? null : d.billingCity,
      billingPostcode: same ? null : normalisePostcode(d.billingPostcode),
      notes: d.notes || null,
    },
  };
}

export type NewOrder = {
  details: ContactDetails;
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  userId: string | null;
  termsAcceptedAt: Date | null;
  paymentStatus?: "Unpaid" | "Paid" | "Failed";
  status?: "Pending" | "Confirmed";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string | null;
  taxAmount?: number | null;
  total?: number | null;
};

/**
 * Inserts an Order with a fresh unique reference (shared by every checkout
 * path). Doesn't revalidate caches itself — it also runs while the success
 * page renders, where revalidateTag isn't allowed; callers in actions and
 * route handlers revalidate CACHE_TAGS.orders.
 */
export async function insertOrder(data: NewOrder): Promise<OrderWithItems> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    try {
      const order = await prisma.order.create({
        data: {
          reference,
          ...data.details,
          termsAcceptedAt: data.termsAcceptedAt,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          userId: data.userId,
          paymentStatus: data.paymentStatus,
          status: data.status,
          stripeCheckoutSessionId: data.stripeCheckoutSessionId,
          stripePaymentIntentId: data.stripePaymentIntentId,
          taxAmount: data.taxAmount,
          total: data.total,
          items: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              category: line.category,
              name: line.name,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              options: line.options ?? undefined,
            })),
          },
        },
        include: { items: true },
      });
      return toOrderRecord(order);
    } catch (err) {
      const e = err as { code?: string; meta?: { target?: unknown } };
      // Unique clash on the random reference — try another. A clash on the
      // Stripe session id means the order already exists; let the caller see it.
      if (e?.code === "P2002" && !String(e.meta?.target ?? "").includes("stripeCheckoutSessionId")) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique order reference.");
}

/**
 * "Place Order" path — quote-only carts that can't be paid online. Prices are
 * re-read from the database (priceCart), never taken from the browser.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const contact = validateContactDetails(input);
  const priced = await priceCart(input.lines ?? []);
  if (!contact.ok || !priced.ok) {
    return {
      ok: false,
      errors: {
        ...(contact.ok ? {} : contact.errors),
        ...(priced.ok ? {} : { lines: priced.error }),
      },
    };
  }
  const user = await getCurrentUser();

  let order: OrderWithItems;
  try {
    order = await insertOrder({
      details: contact.details,
      lines: priced.cart.lines,
      subtotal: priced.cart.subtotal,
      deliveryFee: priced.cart.deliveryFee,
      userId: user?.id ?? null,
      termsAcceptedAt: new Date(),
    });
  } catch {
    return { ok: false, errors: { lines: "Could not place the order. Try again." } };
  }
  revalidateTag(CACHE_TAGS.orders, { expire: 0 });

  await createNotification({
    userId: order.userId,
    kind: "order",
    title: `Order ${order.reference} placed`,
    body: "We'll be in touch to confirm payment and book your installation.",
    href: "/account/orders",
  });

  after(async () => {
    await sendEmail({
      to: order.email,
      ...customerOrderConfirmation(order),
    });
    const staff = await getStaffEmails();
    await sendEmail({
      to: staff,
      replyTo: order.email,
      ...staffOrderAlert(order),
    });
  });

  return { ok: true, reference: order.reference };
}
