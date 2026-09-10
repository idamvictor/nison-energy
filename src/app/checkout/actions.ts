"use server";

import { revalidatePath } from "next/cache";

import { createOrder } from "@/lib/orders-dal";
import type { OrderLineInput } from "@/lib/orders";

export type PlaceOrderPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  notes?: string;
  lines: OrderLineInput[];
};

export type PlaceOrderResult =
  | { ok: true; reference: string }
  | { ok: false; errors: Record<string, string> };

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
