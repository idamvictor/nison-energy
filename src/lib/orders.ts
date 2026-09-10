// Order types + option lists — safe to import from client components.
// Server reads/writes live in src/lib/orders-dal.ts.

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Scheduled"
  | "Installed"
  | "Cancelled";

export const orderStatuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Scheduled",
  "Installed",
  "Cancelled",
];

export type OrderLineInput = {
  productId: string;
  category: "residential" | "commercial" | "accessories" | "extra";
  name: string;
  unitPrice: number | null;
  quantity: number;
  options?: { cableLength?: string; installation?: "standard" | "none" };
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  category: string;
  name: string;
  unitPrice: number | null;
  quantity: number;
  options: unknown;
};

export type OrderRecord = {
  id: string;
  reference: string;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  notes: string | null;
  subtotal: number;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderWithItems = OrderRecord & { items: OrderItemRecord[] };
