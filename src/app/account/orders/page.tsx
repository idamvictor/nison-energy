import type { Metadata } from "next";

import { AccountOrders } from "@/components/account/account-orders";
import { requireUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/queries";

export const metadata: Metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id, user.email);
  return <AccountOrders orders={orders} />;
}
