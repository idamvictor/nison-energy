"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createOrder } from "@/lib/orders/queries";
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
  await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  return { ok: true };
}
