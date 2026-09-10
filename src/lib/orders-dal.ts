import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-dal";
import type { OrderLineInput, OrderWithItems } from "@/lib/orders";

export type {
  OrderStatus,
  OrderLineInput,
  OrderWithItems,
  OrderRecord,
  OrderItemRecord,
} from "@/lib/orders";
export { orderStatuses } from "@/lib/orders";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function newReference(): string {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
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

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    try {
      await prisma.order.create({
        data: {
          reference,
          firstName,
          lastName,
          email,
          phone,
          address,
          postcode,
          notes: str(input.notes) || null,
          subtotal,
          userId: user?.id ?? null,
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              category: line.category,
              name: line.name,
              unitPrice: line.unitPrice ?? null,
              quantity: Math.max(1, line.quantity),
              options: line.options ?? undefined,
            })),
          },
        },
      });
      return { ok: true, reference };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "P2002") continue; // unique clash on reference — retry
      throw err;
    }
  }
  return { ok: false, errors: { lines: "Could not place the order. Try again." } };
}
