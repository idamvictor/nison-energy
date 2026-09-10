import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/components/admin/orders/order-status-select";
import { getOrder } from "@/lib/orders/queries";
import type { OrderStatus } from "@/lib/orders/types";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOptions(options: unknown): string | null {
  if (!options || typeof options !== "object") return null;
  const o = options as { cableLength?: string; installation?: string };
  const parts: string[] = [];
  if (o.cableLength) parts.push(`${o.cableLength} cable`);
  if (o.installation === "standard") parts.push("Standard installation");
  if (o.installation === "none") parts.push("No installation");
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrder(id);
  return { title: order ? `${order.reference} | Admin` : "Order | Admin" };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
        <OrderStatusSelect
          orderId={order.id}
          initialStatus={order.status as OrderStatus}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{order.reference}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed {formatDateTime(order.createdAt)}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => {
                    const opts = formatOptions(item.options);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                            {opts ? ` · ${opts}` : ""}
                          </p>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice != null
                            ? currency.format(item.unitPrice * item.quantity)
                            : "Quote"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {currency.format(order.subtotal)}
                </p>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-foreground">
              {order.firstName} {order.lastName}
            </p>
            <a
              href={`mailto:${order.email}`}
              className="flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Mail className="size-4 text-muted-foreground" />
              {order.email}
            </a>
            <a
              href={`tel:${order.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Phone className="size-4 text-muted-foreground" />
              {order.phone}
            </a>
            <p className="flex items-start gap-2 text-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {order.address}
                <br />
                {order.postcode}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
