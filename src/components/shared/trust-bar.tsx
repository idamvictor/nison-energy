import type { ReactNode } from "react";
import { CreditCard, Truck, Wrench } from "lucide-react";

import { FREE_DELIVERY_FROM } from "@/lib/orders/delivery";
import { INSTALL_SALE_PRICE, INSTALL_WAS_PRICE, wholePounds } from "@/lib/orders/installation-sale";
import { cn } from "@/lib/utils";

const items: { key: string; icon: typeof Truck; label: ReactNode; highlight?: boolean }[] = [
  { key: "delivery", icon: Truck, label: `Free UK delivery over ${FREE_DELIVERY_FROM}` },
  { key: "instalments", icon: CreditCard, label: "Buy now, pay in 3 installments" },
  // Advertises the installation sale while INSTALL_WAS_PRICE is set.
  INSTALL_WAS_PRICE != null
    ? {
        key: "installation",
        icon: Wrench,
        highlight: true,
        label: (
          <>
            Installation now {wholePounds(INSTALL_SALE_PRICE)}
            <s className="font-normal text-foreground/50 decoration-1">
              <span className="sr-only">was </span>
              {wholePounds(INSTALL_WAS_PRICE)}
            </s>
          </>
        ),
      }
    : { key: "installation", icon: Wrench, label: "Certified charger installation" },
];

export function TrustBar() {
  return (
    <div className="border-b border-border/70 bg-secondary">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-2.5 text-center sm:px-6 lg:px-8">
        {/* Phones: one line, messages rotate (globals.css .trust-cycle). */}
        <ul className="trust-cycle relative h-5 w-full sm:flex sm:h-auto sm:w-auto sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-1.5">
          {items.map(({ key, icon: Icon, label, highlight }) => (
            <li
              key={key}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium text-foreground/70",
                highlight && "font-semibold text-accent-strong"
              )}
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
