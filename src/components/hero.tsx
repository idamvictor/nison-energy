"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const slides = [
  {
    headline: "Premium chargers, installed properly.",
    copy: "Instant online quotes and expert installation from certified engineers. Fitted in days, not weeks.",
    cta: "Browse home chargers",
    href: "/home-charging",
    image: `${IMG}/2025/05/EV_OneStop_Website_Home_Chargers.png`,
  },
  {
    headline: "Power up your fleet on-site.",
    copy: "Scalable commercial installations for offices, depots and car parks, backed by OZEV workplace funding.",
    cta: "Explore workplace charging",
    href: "#",
    image: `${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`,
  },
  {
    headline: "Cables, adapters and everything else.",
    copy: "Type 2 cables, holsters and portable chargers to round out your setup.",
    cta: "Shop accessories",
    href: "#",
    image: `${IMG}/2025/05/EV_OneStop_Website_Type_2_Cables_1f4fd143-35b6-46ba-a663-705f220bc1f4.png`,
  },
];

const SLIDE_DURATION = 7000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(".hero-word", { yPercent: 0, autoAlpha: 1 });
        gsap.set([".hero-copy", ".hero-cta"], { y: 0, autoAlpha: 1 });
        gsap.set(imageRef.current, { scale: 1, autoAlpha: 1 });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          imageRef.current,
          { scale: 1.12, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.4, ease: "power2.out" }
        )
        .to(
          imageRef.current,
          {
            scale: 1.06,
            duration: SLIDE_DURATION / 1000 - 1.4,
            ease: "none",
          },
          "<"
        )
        .fromTo(
          ".hero-word",
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.035,
          },
          0.3
        )
        .fromTo(
          ".hero-copy",
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          0.55
        )
        .fromTo(
          ".hero-cta",
          { y: 14, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
          },
          0.68
        );
    },
    { scope: containerRef, dependencies: [index], revertOnUpdate: true }
  );

  const slide = slides[index];
  const words = slide.headline.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-foreground"
    >
      <div className="relative h-[600px] sm:h-[540px]">
        <div
          ref={imageRef}
          key={index}
          className="absolute inset-0 origin-center"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklch, black 88%, var(--primary) 12%) 0%, color-mix(in oklch, black 88%, var(--primary) 12%) 30%, transparent 75%)",
              opacity: 0.8,
            }}
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.02em] sm:text-5xl">
              {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1">
                  <span className="hero-word inline-block">
                    {word}
                    {i < words.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h1>
            <p className="hero-copy mt-5 max-w-md text-lg leading-relaxed text-white/70">
              {slide.copy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                className="hero-cta h-12 gap-2 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
                render={<Link href={slide.href} />}
              >
                {slide.cta}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="hero-cta h-12 border-white/40 bg-transparent px-6 text-base text-white hover:border-white hover:bg-white/10"
                render={<Link href="#grants" />}
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
          className="absolute top-1/2 left-4 flex size-8 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white sm:left-6"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute top-1/2 right-4 flex size-8 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white sm:right-6"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" strokeWidth={1.5} />
        </button>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.headline}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-white" : "w-1 bg-white/35"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
