import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  quantity,
  onChange,
  className,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex h-10 w-32 items-stretch overflow-hidden rounded-lg border border-input ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        aria-label="Decrease quantity"
        className="flex w-10 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <div className="flex flex-1 items-center justify-center text-sm font-medium text-foreground">
        {quantity}
      </div>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="flex w-10 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
