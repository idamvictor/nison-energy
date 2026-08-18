"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const ZAP_PATH =
  "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z";

export function SiteLoader() {
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      if (!path) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        const id = requestAnimationFrame(() => setDone(true));
        return () => cancelAnimationFrame(id);
      }

      document.body.style.overflow = "hidden";

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(".loader-word", { autoAlpha: 0, y: 8 });
      gsap.set(".loader-bg", { scale: 1.15 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setDone(true);
        },
      });

      tl.to(path, {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: "power2.inOut",
      })
        .to(path, { fillOpacity: 1, duration: 0.35, ease: "power1.out" }, "-=0.15")
        .fromTo(
          path,
          { scale: 1 },
          {
            scale: 1.12,
            duration: 0.25,
            ease: "power1.out",
            yoyo: true,
            repeat: 1,
            transformOrigin: "50% 50%",
          },
          "-=0.1"
        )
        .to(
          ".loader-word",
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
        .to({}, { duration: 0.35 })
        .to(".loader-bg", { scale: 1, duration: 0.8, ease: "power2.out" }, "<")
        .to(
          containerRef.current,
          { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" },
          "-=0.3"
        );

      return () => {
        tl.kill();
        document.body.style.overflow = "";
      };
    },
    { scope: containerRef }
  );

  if (done) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-primary"
    >
      <div
        className="loader-bg absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, color-mix(in oklch, var(--primary), white 12%) 0%, var(--primary) 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path
            ref={pathRef}
            d={ZAP_PATH}
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
            fillOpacity={0}
          />
        </svg>
        <span className="loader-word font-heading text-lg font-semibold tracking-[-0.01em] text-white">
          Nison Energy
        </span>
      </div>
    </div>
  );
}
