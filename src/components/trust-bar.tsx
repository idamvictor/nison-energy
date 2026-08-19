import { CalendarClock, CreditCard, Truck, Wrench } from "lucide-react";

const items = [
  { icon: Truck, label: "Free nationwide delivery" },
  { icon: CreditCard, label: "Buy now, pay in 3" },
  { icon: Wrench, label: "Certified charger installation" },
  { icon: CalendarClock, label: "Next day delivery available" },
];

export function TrustBar() {
  return (
    <div className="border-b border-border/70 bg-secondary">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-2.5 text-center sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70"
            >
              <Icon className="size-3.5 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
