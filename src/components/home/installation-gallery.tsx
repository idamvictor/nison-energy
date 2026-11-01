"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils";

// Real installs, from the client's "Changes following review" doc. Images
// live in the media store.
const PHOTOS = [
  { src: "/api/media/uploads/0e11eecf-22b0-4279-ac46-9ce21554a890.jpg", alt: "Two Ohme home chargers installed side by side on a brick wall" },
  { src: "/api/media/uploads/f350e265-bce6-4177-a87c-15c8b693b754.jpg", alt: "Ocunio Energy engineer commissioning a charger with the homeowner" },
  { src: "/api/media/uploads/eaee9aa3-8953-4c39-bd34-ea965b37eeb7.jpg", alt: "myenergi zappi charger installed on a brick wall" },
  { src: "/api/media/uploads/750e3bf9-03d5-4286-af41-123af457b832.jpg", alt: "Ohme charger with its tethered cable neatly holstered" },
  { src: "/api/media/uploads/99d293bc-47c4-45a2-9272-5b62b74088fb.jpg", alt: "Rolec charger installed beside a gravel driveway" },
  { src: "/api/media/uploads/1779bb21-ce2a-406e-89be-e82c24858b98.jpg", alt: "Close-up of an installed Ohme charger" },
  { src: "/api/media/uploads/7664b423-3c52-4e00-94b9-3732df5ce147.jpg", alt: "Wall-mounted charger with a neat cable run to the ground" },
  { src: "/api/media/uploads/39256e47-b0fa-4dbf-b4a1-9afaab31bb7c.jpg", alt: "myenergi zappi charger fitted next to a downpipe" },
];

/** Seconds each photo stays before the carousel moves on. */
const HOLD_SECONDS = 3;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Shortest signed distance from `active` to `index` around the loop. */
function offsetOf(index: number, active: number, count: number) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

/**
 * Home page gallery of real installations: a coverflow carousel that moves on
 * every HOLD_SECONDS (driven by the active dot's progress animation, so the
 * pause states freeze timer and bar together), with prev/next buttons, dots,
 * swipe and arrow keys.
 */
export function InstallationGallery() {
  const count = PHOTOS.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  // Set when a pointer gesture was a swipe, so its trailing click doesn't also pick a slide.
  const swiped = useRef(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  const tabHidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  useEffect(() => {
    const node = regionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const go = (index: number) => setActive(((index % count) + count) % count);
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  const autoplay = !reducedMotion;
  const paused = !inView || hovered || focused || tabHidden;

  return (
    <section className="overflow-hidden bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Our Installations
            </h2>
            <p className="mt-3 text-muted-foreground">Real chargers fitted by our OZEV-approved engineers.</p>
          </div>
        </Reveal>

        <div
          ref={regionRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Installation photos"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          // Pause for keyboard focus only — a mouse click leaves the button focused.
          onFocus={(e) => setFocused(e.target !== e.currentTarget && e.target.matches(":focus-visible"))}
          onBlur={() => setFocused(false)}
          onPointerDown={(e) => {
            swipeStart.current = e.clientX;
            swiped.current = false;
          }}
          onPointerUp={(e) => {
            if (swipeStart.current == null) return;
            const dx = e.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(dx) < 40) return;
            swiped.current = true;
            if (dx < 0) next();
            else prev();
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          style={{ "--card": "min(68vw, 330px)", "--step": "calc(var(--card) * 0.78)" } as CSSProperties}
          className="relative mt-10 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="relative mx-auto aspect-3/4 w-(--card) touch-pan-y select-none perspective-[1400px]">
            {PHOTOS.map((photo, index) => {
              const offset = offsetOf(index, active, count);
              const distance = Math.abs(offset);
              const isActive = offset === 0;
              return (
                <div
                  key={photo.src}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}`}
                  aria-hidden={!isActive}
                  onClick={() => !swiped.current && !isActive && distance <= 2 && go(index)}
                  style={{
                    transform: `translateX(calc(var(--step) * ${offset})) scale(${[1, 0.82, 0.66][Math.min(distance, 2)]}) rotateY(${offset * -14}deg)`,
                    opacity: distance > 2 ? 0 : [1, 0.6, 0.28][distance],
                    filter: distance === 0 ? "none" : `blur(${distance * 1.5}px) saturate(0.8)`,
                    zIndex: 10 - distance,
                  }}
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-2xl bg-muted shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/5",
                    "motion-safe:transition-[transform,opacity,filter] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity motion-reduce:duration-300",
                    !isActive && distance <= 2 && "cursor-pointer",
                    distance > 2 && "pointer-events-none",
                  )}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 330px, 68vw"
                    loading={distance <= 1 ? "eager" : "lazy"}
                    draggable={false}
                    className={cn(
                      "object-cover",
                      isActive && "motion-safe:animate-[gallery-zoom_var(--hold)_ease-out_forwards]",
                    )}
                    style={{ "--hold": `${HOLD_SECONDS}s` } as CSSProperties}
                  />
                  {isActive && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/35 to-transparent" />
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-0 z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg ring-1 ring-border transition hover:scale-105 hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-12"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute top-1/2 right-0 z-20 flex size-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg ring-1 ring-border transition hover:scale-105 hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-12"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {PHOTOS.map((photo, index) => {
              const isActive = index === active;
              return (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={isActive}
                  className={cn(
                    "relative h-2 overflow-hidden rounded-full bg-foreground/15 transition-all duration-500",
                    isActive ? "w-10" : "w-2 hover:bg-foreground/30",
                  )}
                >
                  {isActive && (
                    <span
                      // Re-keyed per slide so the fill restarts; its end moves the carousel on.
                      key={active}
                      onAnimationEnd={autoplay ? next : undefined}
                      style={{
                        animationDuration: `${HOLD_SECONDS}s`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      className={cn(
                        "absolute inset-0 origin-left rounded-full bg-accent",
                        autoplay && "animate-[gallery-progress_linear_both]",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
