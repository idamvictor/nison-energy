import { CalendarClock, CreditCard, Star, Truck, Wrench } from "lucide-react";

const items = [
  { icon: Truck, label: "Free nationwide delivery" },
  { icon: CreditCard, label: "Buy now, pay in 3" },
  { icon: Wrench, label: "Certified charger installation" },
  { icon: CalendarClock, label: "Next day delivery available" },
];

export function TrustBar() {
  return (
    <div className="border-b border-border/70 bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 text-center sm:justify-between sm:px-6 lg:px-8">
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
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/70">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-accent text-accent" />
            ))}
          </div>
          Rated excellent · 137 reviews
        </div>
      </div>
    </div>
  );
}
