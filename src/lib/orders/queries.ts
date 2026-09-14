import "server-only";

import { cache } from "react";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { getStaffEmails } from "@/lib/email/recipients";
import {
  customerOrderConfirmation,
  staffOrderAlert,
} from "@/lib/email/templates";
import type { OrderLineInput, OrderWithItems } from "@/lib/orders/types";

export type {
  OrderStatus,
  OrderLineInput,
  OrderWithItems,
  OrderRecord,
  OrderItemRecord,
} from "@/lib/orders/types";
export { orderStatuses } from "@/lib/orders/types";

// ─── Reads ──────────────────────────────────────────────────────────────────

export const getOrders = cache(
  () =>
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { items: true },
    }) as unknown as Promise<OrderWithItems[]>,
);

export const getOrder = cache(
  (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: { items: true },
    }) as unknown as Promise<OrderWithItems | null>,
);

export const getOrderByCheckoutSession = cache(
  (stripeCheckoutSessionId: string) =>
    prisma.order.findUnique({
      where: { stripeCheckoutSessionId },
      include: { items: true },
    }) as unknown as Promise<OrderWithItems | null>,
);

export const getOrdersForUser = cache(
  (userId: string, email: string) =>
    prisma.order.findMany({
      where: { OR: [{ userId }, { email }] },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }) as unknown as Promise<OrderWithItems[]>,
);

export const getPendingOrderCount = cache(() =>
  prisma.order.count({ where: { status: "Pending" } }),
);

// ─── Create ─────────────────────────────────────────────────────────────────

export type CreateOrderInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  postcode?: unknown;
  notes?: unknown;
  lines?: OrderLineInput[];
};

export type CreateOrderResult =
  | { ok: true; reference: string }
  | { ok: false; errors: Record<string, string> };

export type CreateDraftOrderResult =
  | { ok: true; order: OrderWithItems }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function newReference(): string {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

type ValidatedOrderInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  notes: string | null;
  lines: OrderLineInput[];
  subtotal: number;
  userId: string | null;
};

async function validateOrderInput(
  input: CreateOrderInput,
): Promise<{ ok: true; data: ValidatedOrderInput } | { ok: false; errors: Record<string, string> }> {
  const firstName = str(input.firstName);
  const lastName = str(input.lastName);
  const email = str(input.email);
  const phone = str(input.phone);
  const address = str(input.address);
  const postcode = str(input.postcode);

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "Enter your first name.";
  if (!lastName) errors.lastName = "Enter your last name.";
  if (!email) errors.email = "Enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!phone) errors.phone = "Enter a phone number.";
  if (!address) errors.address = "Enter the installation address.";
  if (!postcode) errors.postcode = "Enter the postcode.";

  const lines = Array.isArray(input.lines) ? input.lines : [];
  if (lines.length === 0) errors.lines = "Your cart is empty.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const subtotal = lines.reduce(
    (sum, line) => sum + (line.unitPrice ?? 0) * Math.max(1, line.quantity),
    0,
  );

  const user = await getCurrentUser();

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      email,
      phone,
      address,
      postcode,
      notes: str(input.notes) || null,
      lines,
      subtotal,
      userId: user?.id ?? null,
    },
  };
}

async function insertOrder(
  data: ValidatedOrderInput,
  extra?: { paymentStatus?: "Unpaid" | "Paid" | "Failed" },
): Promise<OrderWithItems> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    try {
      return (await prisma.order.create({
        data: {
          reference,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          postcode: data.postcode,
          notes: data.notes,
          subtotal: data.subtotal,
          userId: data.userId,
          paymentStatus: extra?.paymentStatus,
          items: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              category: line.category,
              name: line.name,
              unitPrice: line.unitPrice ?? null,
              quantity: Math.max(1, line.quantity),
              options: line.options ?? undefined,
            })),
          },
        },
        include: { items: true },
      })) as unknown as OrderWithItems;
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "P2002") continue; // unique clash on reference — retry
      throw err;
    }
  }
  throw new Error("Could not generate a unique order reference.");
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const validated = await validateOrderInput(input);
  if (!validated.ok) return validated;

  let order: OrderWithItems;
  try {
    order = await insertOrder(validated.data);
  } catch {
    return { ok: false, errors: { lines: "Could not place the order. Try again." } };
  }

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

/**
 * Creates an Order row for the "Pay online now" path — paymentStatus starts
 * Unpaid and no confirmation email/notification is sent yet. Those fire from
 * the Stripe webhook once payment is actually confirmed (see
 * src/app/api/webhooks/stripe/route.ts), never from this synchronous path,
 * since a customer can close the tab before paying.
 */
export async function createDraftOrderForCheckout(
  input: CreateOrderInput,
): Promise<CreateDraftOrderResult> {
  const validated = await validateOrderInput(input);
  if (!validated.ok) return validated;

  if (validated.data.lines.some((line) => line.unitPrice == null)) {
    return {
      ok: false,
      errors: { lines: "Some items don't have a fixed price yet — use “Place Order” instead." },
    };
  }

  try {
    const order = await insertOrder(validated.data, { paymentStatus: "Unpaid" });
    return { ok: true, order };
  } catch {
    return { ok: false, errors: { lines: "Could not start checkout. Try again." } };
  }
}
