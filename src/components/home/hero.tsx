"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const IMG = "/media/wp";

type Slide = {
  tag?: string;
  headline: string;
  copy: string;
  bullets?: string[];
  cta: string;
  href: string;
  image: string;
};

const slides: Slide[] = [
  {
    tag: "Best Sellers In Stock",
    headline: "Your car. Charged right.",
    copy: "Trusted by thousands of UK drivers. Fast delivery, expert fitting, real savings.",
    bullets: [
      "Universal EV Compatibility",
      "OZEV Grant-Eligible Chargers",
      "Cheaper Overnight Charging",
    ],
    cta: "Shop Now",
    href: "/home-charging",
    image: `${IMG}/2025/05/EV_OneStop_Website_Home_Chargers.png`,
  },
  {
    headline: "On-site charging for your whole fleet.",
    copy: "Scalable, revenue-ready installations for offices, depots and car parks — backed by OZEV workplace funding.",
    cta: "Shop Now",
    href: "/workplace-charging",
    image: `${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`,
  },
  {
    headline: "Cables, posts and install kits.",
    copy: "Type 2 cables, mounts and posts, and portable chargers, hand-picked to complete your installation.",
    cta: "Shop Now",
    href: "/accessories",
    image: `${IMG}/2025/05/EV_OneStop_Website_Type_2_Cables_1f4fd143-35b6-46ba-a663-705f220bc1f4.png`,
  },
];

// Long enough to read the headline, copy and bullets before it moves on.
const arrowClass =
  "pointer-events-auto flex size-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:absolute sm:top-1/2 sm:-translate-y-1/2";

const SLIDE_DURATION = 12000;

export function Hero() {
  const [index, setIndex] = useState(0);
  // Paused while the pointer or focus is on the hero; once someone uses the
  // arrows or dots, auto-advance stops for good — they are in control.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manual, setManual] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Re-armed on every slide change, so each slide gets its full duration.
  useEffect(() => {
    if (hovered || focused || manual) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_DURATION);
    return () => clearTimeout(id);
  }, [index, hovered, focused, manual]);

  const goTo = (next: number) => {
    setManual(true);
    setIndex((next + slides.length) % slides.length);
  };

  useGSAP(
    () => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(".hero-word", { yPercent: 0, autoAlpha: 1 });
        gsap.set(".hero-copy, .hero-cta", { y: 0, autoAlpha: 1 });
        if (slides[index].tag) {
          gsap.set(".hero-tag", { y: 0, autoAlpha: 1 });
        }
        if (slides[index].bullets) {
          gsap.set(".hero-bullet", { y: 0, autoAlpha: 1 });
        }
        gsap.set(imageRef.current, { scale: 1, autoAlpha: 1 });
        return;
      }

      const currentSlide = slides[index];

      const tl = gsap
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
        );

      if (currentSlide.tag) {
        tl.fromTo(
          ".hero-tag",
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
          0.15
        );
      }

      tl.fromTo(
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
      ).fromTo(
        ".hero-copy",
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        0.55
      );

      if (currentSlide.bullets) {
        tl.fromTo(
          ".hero-bullet",
          { y: 10, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
          },
          0.65
        );
      }

      tl.fromTo(
        ".hero-cta",
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
        },
        0.8
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
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="relative h-[680px] sm:h-[640px]">
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
            {slide.tag && (
              <span className="hero-tag mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
                <span className="size-1.5 rounded-full bg-accent" />
                {slide.tag}
              </span>
            )}
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.02em] sm:text-5xl">
              {words.map((word, i) => (
                <span key={i}>
                  <span className="inline-block overflow-hidden pb-1">
                    <span className="hero-word inline-block">{word}</span>
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="hero-copy mt-5 max-w-md text-lg leading-relaxed text-white/70">
              {slide.copy}
            </p>
            {slide.bullets && (
              <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                {slide.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="hero-bullet flex items-center gap-2 text-sm font-medium text-white/85"
                  >
                    <Check className="size-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                variant="cta"
                className="hero-cta h-12 gap-2 px-6 text-base"
                render={<Link href={slide.href} />}
              >
                {slide.cta}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Controls. Phones: one row at the bottom — [‹] dots [›] — clear of the
            headline and the floating WhatsApp button. From sm up the row fills
            the hero so the arrows can sit centred at its sides. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-4 sm:inset-y-0 sm:items-end sm:pb-6">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className={cn(arrowClass, "sm:left-6")}
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" strokeWidth={2} />
          </button>
          <div className="pointer-events-auto flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.headline}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className={cn(arrowClass, "sm:right-6")}
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
