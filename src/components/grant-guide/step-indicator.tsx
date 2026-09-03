import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: { title: string }[];
}) {
  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.title} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-accent text-accent-foreground",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "max-w-24 text-xs leading-tight",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn("mx-2 h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-muted")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
