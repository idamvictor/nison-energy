"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { categoryRoute, type HardwareProduct } from "@/lib/catalog/types";
import { swatchColour } from "@/lib/catalog/colour-swatches";
import { keepScrollOnNextNav } from "@/components/shared/scroll-manager";
import { cn } from "@/lib/utils";

const circle = "block size-7 shrink-0 rounded-full ring-1 ring-black/15 transition-shadow";
const selectedRing = "ring-2 ring-foreground ring-offset-2 ring-offset-background";

/** Variants with a colour, in their stored (sortOrder) order. */
const withColour = (variants: HardwareProduct[]) => variants.filter((v) => v.colour);

/** Card: a row of colour circles, each linking to that colour's product page. */
export function ColourSwatchLinks({ variants, currentId }: { variants: HardwareProduct[]; currentId: string }) {
  return (
    <ul className="relative z-10 flex flex-wrap items-center gap-2.5 py-1" aria-label="Colours">
      {withColour(variants).map((v) => (
        <li key={v.id}>
          <Link
            href={`${categoryRoute[v.category]}/${v.id}`}
            title={v.colour}
            aria-label={v.colour}
            className={cn(circle, "hover:ring-2 hover:ring-foreground/40", v.id === currentId && selectedRing)}
            style={{ backgroundColor: swatchColour(v.colour) }}
          />
        </li>
      ))}
    </ul>
  );
}

/** Product page: a colour picker (radio group) that swaps to the chosen colour's page in place. */
export function ColourSwatchPicker({ variants, currentId }: { variants: HardwareProduct[]; currentId: string }) {
  const router = useRouter();
  const options = withColour(variants);
  const current = options.find((v) => v.id === currentId);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (v: HardwareProduct) => {
    if (v.id === currentId) return;
    keepScrollOnNextNav();
    router.push(`${categoryRoute[v.category]}/${v.id}`, { scroll: false });
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    refs.current[next]?.focus();
    choose(options[next]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-medium text-foreground">
        Colour: <span className="font-normal text-muted-foreground">{current?.colour}</span>
      </p>
      <div role="radiogroup" aria-label="Colour" className="flex flex-wrap items-center gap-3">
        {options.map((v, i) => {
          const selected = v.id === currentId;
          return (
            <button
              key={v.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={v.colour}
              title={v.colour}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(v)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                circle,
                "size-9 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                selected ? selectedRing : "hover:ring-2 hover:ring-foreground/40",
              )}
              style={{ backgroundColor: swatchColour(v.colour) }}
            />
          );
        })}
      </div>
    </div>
  );
}
