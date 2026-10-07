import { cn } from "@/lib/utils";

/** White, 49px, 12px-rounded checkout field (with room for a floating label). */
export const FIELD_INPUT =
  "h-[49px] rounded-[12px] border-[#dedede] bg-white px-[11px] pt-[17px] pb-[3px] text-sm text-black shadow-none md:text-sm placeholder:text-transparent focus-visible:border-[#0280a3] focus-visible:ring-2 focus-visible:ring-[#0280a3]/25 dark:bg-white";

/**
 * Floating label: sits inside the empty field like a placeholder and shrinks
 * to the top once there's a value. `as="div"` for composite inputs (address
 * type-ahead, postcode check) whose dropdowns mustn't live inside a <label>.
 */
export function FloatField({
  label,
  filled,
  children,
  className,
  as = "label",
}: {
  label: string;
  filled: boolean;
  children: React.ReactNode;
  className?: string;
  as?: "label" | "div";
}) {
  const Wrapper = as;
  return (
    <Wrapper className={cn("relative block text-left", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-[12px] z-10 max-w-[calc(100%-44px)] truncate text-[#707070] transition-all duration-150",
          filled ? "top-[6px] text-[12px] leading-4" : "top-[15px] text-sm leading-[18px]",
        )}
      >
        {label}
      </span>
    </Wrapper>
  );
}
