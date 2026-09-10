import type { Metadata } from "next";

import { OrdersTableView } from "@/components/admin/orders/orders-table-view";
import { getOrders } from "@/lib/orders-dal";

export const metadata: Metadata = { title: "Orders | Admin" };

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <OrdersTableView orders={orders} />;
}
