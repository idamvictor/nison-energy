"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Hero } from "@/components/home/hero";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      if (reduceMotion || !isDesktop) return;

      const trigger = {
        trigger: heroWrapRef.current,
        start: "top top",
        end: "+=60%",
        scrub: true,
      };

      const st = ScrollTrigger.create({ ...trigger, pin: true, pinSpacing: false });

      gsap.to(heroWrapRef.current, {
        scale: 0.96,
        opacity: 0.75,
        ease: "none",
        scrollTrigger: trigger,
      });

      return () => st.kill();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative">
      <div ref={heroWrapRef} className="relative">
        <Hero />
      </div>
      <div className="relative z-10 bg-background lg:overflow-hidden lg:rounded-t-[2.5rem] lg:shadow-[0_-24px_48px_rgba(0,0,0,0.18)]">
        {children}
      </div>
    </div>
  );
}
