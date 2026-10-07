import { Minus, Plus, Trash2 } from "lucide-react";

export function QuantityStepper({
  quantity,
  onChange,
  className,
  min = 1,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  className?: string;
  /** 0 lets "−" take the item to zero (the cart then removes it). */
  min?: number;
}) {
  const removes = min === 0 && quantity <= 1;
  return (
    <div
      className={`flex h-10 w-32 items-stretch overflow-hidden rounded-lg border border-input ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        aria-label={removes ? "Remove from cart" : "Decrease quantity"}
        className={`flex w-10 items-center justify-center transition-colors hover:bg-secondary ${
          removes ? "text-foreground/70 hover:text-destructive" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {removes ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
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
