"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-border">
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain p-10"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActive((i) => (i - 1 + images.length) % images.length)
              }
              aria-label="Previous image"
              className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 hover:bg-secondary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 hover:bg-secondary"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute right-3 bottom-3 rounded-full bg-foreground/70 px-2 py-0.5 text-xs text-white">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 transition-all",
                index === active
                  ? "ring-2 ring-primary"
                  : "ring-border hover:ring-primary/40"
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
