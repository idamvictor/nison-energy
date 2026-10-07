"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

export type PickerExtra = { id: string; name: string; price: number; image: string };

function Thumb({ src, size = 48 }: { src: string; size?: number }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-[10px] bg-[#ececec] ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-contain p-1" />
    </span>
  );
}

/**
 * Optional add-ons: chosen extras as thumbnail rows (with remove), plus a
 * dropdown whose options show the product image, name and price.
 */
export function ExtrasPicker({
  available,
  selected,
  onAdd,
  onRemove,
}: {
  available: PickerExtra[];
  selected: PickerExtra[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-2.5">
      {selected.map((extra) => (
        <div key={extra.id} className="flex items-center gap-3 rounded-[12px] bg-white p-2.5 pr-3.5 ring-1 ring-[#dedede]">
          <Thumb src={extra.image} />
          <p className="flex-1 text-sm leading-snug text-black">{extra.name}</p>
          <p className="text-sm font-medium text-black">{formatCurrency(extra.price)}</p>
          <button
            type="button"
            onClick={() => onRemove(extra.id)}
            aria-label={`Remove ${extra.name}`}
            className="flex size-7 items-center justify-center rounded-full text-[#707070] transition-colors hover:bg-black/5 hover:text-red-600"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {available.length > 0 && (
        <div ref={boxRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex min-h-[49px] w-full items-center gap-3 rounded-[12px] border border-dashed bg-white/5 px-3 py-2 text-left transition-colors",
              open ? "border-white/70 bg-white/10" : "border-white/35 hover:border-white/60 hover:bg-white/10",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black">
              <Plus className="size-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-white">Add an extra</span>
              <span className="block text-xs text-white/80">
                Optional · {available.length} {available.length === 1 ? "item" : "items"} available
              </span>
            </span>
            <span className="flex -space-x-2">
              {available.slice(0, 3).map((extra) => (
                <span key={extra.id} className="block rounded-[10px] ring-2 ring-[#454545]">
                  <Thumb src={extra.image} size={32} />
                </span>
              ))}
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-white/80 transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <ul
              role="listbox"
              aria-label="Extras"
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-[12px] bg-white py-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] ring-1 ring-black/10"
            >
              {available.map((extra) => (
                <li key={extra.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(extra.id);
                      setOpen(false);
                    }}
                    className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#f4f8f9]"
                  >
                    <Thumb src={extra.image} />
                    <span className="flex-1">
                      <span className="block text-sm leading-snug text-black">{extra.name}</span>
                      <span className="block text-sm font-medium text-black">{formatCurrency(extra.price)}</span>
                    </span>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white transition-colors group-hover:bg-[#0280a3]">
                      Add
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
