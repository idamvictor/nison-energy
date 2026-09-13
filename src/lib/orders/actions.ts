"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createOrder } from "@/lib/orders/queries";
import { createNotification } from "@/lib/notifications/queries";
import { sendEmail } from "@/lib/email/client";
import { customerOrderStatusUpdate } from "@/lib/email/templates";
import {
  orderStatuses,
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
