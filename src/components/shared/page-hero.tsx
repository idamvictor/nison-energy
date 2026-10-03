import { cn } from "@/lib/utils";

/**
 * Inner-page header band. A deep "night" ink surface lit by a soft cyan glow
 * (like a charger LED) with a faint orange counter-glow, an orange eyebrow,
 * and the brand cyan→orange hairline along the bottom edge — replaces the old
 * flat light-blue bands, which couldn't carry white text legibly.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "center",
  size = "default",
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  /** `compact` halves the vertical padding for pages where the content should start sooner. */
  size?: "default" | "compact";
  /** Extra content under the subtitle (e.g. a CTA). */
  children?: React.ReactNode;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("relative isolate overflow-hidden bg-ink text-white", className)}>
      <div
        aria-hidden
        className="absolute -top-40 -left-32 -z-10 size-[520px] rounded-full bg-primary/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -right-24 -bottom-48 -z-10 size-[420px] rounded-full bg-accent/15 blur-[120px]"
      />
      <div
        className={cn(
          "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8",
          size === "compact" ? "py-8 sm:py-10" : "py-16 sm:py-20",
          centered ? "text-center" : "max-w-7xl",
        )}
      >
        {eyebrow && (
          <p
            className={cn(
              "flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-accent uppercase",
              centered && "justify-center",
            )}
          >
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px] shadow-accent/25" />
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "mt-3 font-semibold tracking-[-0.02em] text-balance",
            size === "compact" ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={cn("mt-3 max-w-xl text-white/70", centered && "mx-auto")}>{subtitle}</p>
        )}
        {children}
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-primary via-primary/70 to-accent"
      />
    </div>
  );
}
