export function StepHead({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <p className="font-heading text-base font-semibold text-foreground">{title}</p>
    </div>
  );
}
