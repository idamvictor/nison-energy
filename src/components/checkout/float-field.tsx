import { cn } from "@/lib/utils";

/** White, 49px, 12px-rounded checkout field (with room for a floating label). */
export const FIELD_INPUT =
  "h-[49px] rounded-[12px] border-[#dedede] bg-white px-[11px] pt-[17px] pb-[3px] text-sm text-black shadow-none md:text-sm placeholder:text-transparent focus-visible:border-[#0280a3] focus-visible:ring-2 focus-visible:ring-[#0280a3]/25 dark:bg-white";

/**
 * Floating label: sits inside the empty field like a placeholder and shrinks
 * to the top once there's a value. `as="div"` for composite inputs (address
 * type-ahead, postcode check) whose dropdowns mustn't live inside a <label>.
 * `error` outlines the field in red and shows the message underneath.
 */
export function FloatField({
  label,
  filled,
  children,
  className,
  as = "label",
  error,
  tone = "dark",
}: {
  label: string;
  filled: boolean;
  children: React.ReactNode;
  className?: string;
  as?: "label" | "div";
  error?: string | null;
  /** Background the message sits on — dark column or the light card panel. */
  tone?: "dark" | "light";
}) {
  const Wrapper = as;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Wrapper
        className={cn(
          "relative block text-left",
          error && "[&_input]:border-[#e5484d] [&_input]:ring-1 [&_input]:ring-[#e5484d]/50",
        )}
      >
        {children}
        <span
          className={cn(
            "pointer-events-none absolute left-3 z-10 max-w-[calc(100%-44px)] truncate transition-all duration-150",
            error ? "text-[#c62828]" : "text-[#707070]",
            filled ? "top-1.5 text-[12px] leading-4" : "top-3.75 text-sm leading-4.5",
          )}
        >
          {label}
        </span>
      </Wrapper>
      {error && (
        <p role="alert" className={cn("pl-1 text-xs", tone === "dark" ? "text-[#ffb4b4]" : "text-[#c62828]")}>
          {error}
        </p>
      )}
    </div>
  );
}
