import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

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
import { PaymentStatusBadge } from "@/components/admin/orders/payment-status-badge";
import { getOrder } from "@/lib/orders/queries";
import type { OrderStatus } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/currency";

function stripeDashboardUrl(paymentIntentId: string): string {
  const isLiveMode = process.env.STRIPE_SECRET_KEY?.includes("_live_") ?? false;
  return `https://dashboard.stripe.com/${isLiveMode ? "" : "test/"}payments/${paymentIntentId}`;
}

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
        <div className="flex items-center gap-3">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusSelect
            orderId={order.id}
            initialStatus={order.status as OrderStatus}
          />
        </div>
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
                            ? formatCurrency(item.unitPrice * item.quantity)
                            : "Quote"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
                {order.total != null ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="text-foreground">{formatCurrency(order.subtotal)}</p>
                    </div>
                    {order.taxAmount != null && (
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Tax</p>
                        <p className="text-foreground">{formatCurrency(order.taxAmount)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Total paid</p>
                      <p className="font-heading text-lg font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {formatCurrency(order.subtotal)}
                    </p>
                  </div>
                )}
                {order.stripePaymentIntentId && (
                  <a
                    href={stripeDashboardUrl(order.stripePaymentIntentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    View payment in Stripe
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
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
