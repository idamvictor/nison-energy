"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const slides = [
  {
    eyebrow: "EV Home Charging",
    headline: "Premium chargers, installed properly.",
    copy: "Instant online quotes and expert installation from certified engineers. Fitted in days, not weeks.",
    cta: "Browse home chargers",
    image: `${IMG}/2025/05/EV_OneStop_Website_Home_Chargers.png`,
  },
  {
    eyebrow: "Workplace Charging",
    headline: "Power up your fleet on-site.",
    copy: "Scalable commercial installations for offices, depots and car parks, backed by OZEV workplace funding.",
    cta: "Explore workplace charging",
    image: `${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`,
  },
  {
    eyebrow: "EV Accessories",
    headline: "Cables, adapters and everything else.",
    copy: "Type 2 cables, holsters and portable chargers to round out your setup.",
    cta: "Shop accessories",
    image: `${IMG}/2025/05/EV_OneStop_Website_Type_2_Cables_1f4fd143-35b6-46ba-a663-705f220bc1f4.png`,
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="relative h-[560px] sm:h-[520px]">
        {slides.map((s, i) => (
          <div
            key={s.headline}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_oklch,var(--primary),black_15%)] via-[color-mix(in_oklch,var(--primary),black_15%)]/85 to-transparent" />
          </div>
        ))}

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              {slide.eyebrow}
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              {slide.headline}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">
              {slide.copy}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 gap-2 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
              >
                {slide.cta}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10"
              >
                Check grant eligibility
              </Button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setIndex((i) => (i - 1 + slides.length) % slides.length)
          }
          className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-6"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-6"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.headline}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
