"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-dal";
import { orderStatuses, type OrderStatus } from "@/lib/orders";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
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
