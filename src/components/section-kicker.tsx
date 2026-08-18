import { cn } from "@/lib/utils";

export function SectionKicker({
  center = false,
  tone = "default",
  className,
}: {
  center?: boolean;
  tone?: "default" | "invert";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-1 w-10 rounded-full bg-gradient-to-r",
        tone === "invert"
          ? "from-white to-white/40"
          : "from-primary to-accent",
        center && "mx-auto",
        className
      )}
    />
  );
}
