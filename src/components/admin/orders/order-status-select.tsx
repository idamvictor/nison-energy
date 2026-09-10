"use client";

import { useState, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatuses, type OrderStatus } from "@/lib/orders";
import { updateOrderStatus } from "@/app/admin/orders/actions";

export function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        value={status}
        disabled={pending}
        onValueChange={(value) => {
          if (!value) return;
          const next = value as OrderStatus;
          const prev = status;
          setStatus(next);
          setError(null);
          startTransition(async () => {
            const result = await updateOrderStatus(orderId, next);
            if (!result.ok) {
              setStatus(prev);
              setError(result.error);
            }
          });
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {orderStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <p className="text-xs text-muted-foreground">Saving…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
