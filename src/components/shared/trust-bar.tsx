import { CreditCard, Truck, Wrench } from "lucide-react";

import { FREE_DELIVERY_FROM } from "@/lib/orders/delivery";

const items = [
  { icon: Truck, label: `Free UK delivery over ${FREE_DELIVERY_FROM}` },
  { icon: CreditCard, label: "Buy now, pay in 3 installments" },
  { icon: Wrench, label: "Certified charger installation" },
];

export function TrustBar() {
  return (
    <div className="border-b border-border/70 bg-secondary">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-2.5 text-center sm:px-6 lg:px-8">
        {/* Phones: one line, messages rotate (globals.css .trust-cycle). */}
        <ul className="trust-cycle relative h-5 w-full sm:flex sm:h-auto sm:w-auto sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-1.5">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70"
            >
              <Icon className="size-3.5 text-accent" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
