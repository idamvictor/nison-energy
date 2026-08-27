"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const IMG =
  "https://ocunioenergy.com/wp-content/uploads/2025/05/pexels-andersen-ev-1587213396-27355833-scaled.jpg";

const headline = "Making EV charging simple, from the first question to the last cable.";

export function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(".about-hero-word", { yPercent: 0, autoAlpha: 1 });
        gsap.set(".about-hero-copy", { y: 0, autoAlpha: 1 });
        gsap.set(imageRef.current, { scale: 1, autoAlpha: 1 });
        return;
      }

      gsap
        .timeline()
        .fromTo(
          imageRef.current,
          { scale: 1.15, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.6, ease: "power2.out" }
        )
        .to(imageRef.current, { scale: 1.08, duration: 18, ease: "none" }, "<")
        .fromTo(
          ".about-hero-word",
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.03,
          },
          0.35
        )
        .fromTo(
          ".about-hero-copy",
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          0.75
        );
    },
    { scope: containerRef }
  );

  const words = headline.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-foreground"
    >
      <div className="relative h-[560px] sm:h-[620px]">
        <div ref={imageRef} className="absolute inset-0 origin-center">
          <Image
            src={IMG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklch, black 90%, var(--primary) 10%) 0%, color-mix(in oklch, black 90%, var(--primary) 10%) 35%, transparent 78%)",
              opacity: 0.82,
            }}
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            <span className="about-hero-copy inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              About Ocunio Energy
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-[-0.02em] sm:text-5xl">
              {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1">
                  <span className="about-hero-word inline-block">
                    {word}
                    {i < words.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h1>
            <p className="about-hero-copy mt-5 max-w-md text-lg leading-relaxed text-white/75">
              A UK-based EV charger supplier and NICEIC-certified installation
              company — OZEV-accredited, so every installation we carry out
              is eligible for government grant support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
