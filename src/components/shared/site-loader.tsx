"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SiteLoader() {
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        const id = requestAnimationFrame(() => setDone(true));
        return () => cancelAnimationFrame(id);
      }

      document.body.style.overflow = "hidden";

      gsap.set(".loader-logo", { autoAlpha: 0, y: 14, scale: 0.94 });
      gsap.set(".loader-bar-fill", { scaleX: 0 });
      gsap.set(".loader-glow", { autoAlpha: 0, scale: 0.85 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setDone(true);
        },
      });

      tl.to(".loader-glow", {
        autoAlpha: 1,
        scale: 1,
        duration: 0.9,
        ease: "power2.out",
      })
        .to(
          ".loader-logo",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .to(
          ".loader-bar-fill",
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power2.inOut",
            transformOrigin: "left center",
          },
          "-=0.25"
        )
        .to({}, { duration: 0.25 })
        .to(containerRef.current, {
          autoAlpha: 0,
          scale: 1.03,
          duration: 0.6,
          ease: "power2.inOut",
        });

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
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-background"
    >
      <div
        className="loader-glow absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 40% at 50% 45%, color-mix(in oklch, var(--primary) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <Image
          src="/ocunio-energy-logo.png"
          alt="Ocunio Energy"
          width={676}
          height={369}
          priority
          className="loader-logo h-14 w-auto sm:h-16"
        />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-secondary">
          <div
            className="loader-bar-fill h-full w-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary), var(--accent))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
