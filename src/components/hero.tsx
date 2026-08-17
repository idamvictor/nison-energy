import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

const trustPoints = [
  "Certified installers",
  "5-day install turnaround",
  "OZEV grant support",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 15% 20%, color-mix(in oklch, var(--primary) 22%, transparent) 0%, transparent 70%), radial-gradient(55% 50% at 90% 15%, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
        <Reveal>
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              EV Home Charging
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Premium EV chargers,{" "}
              <span className="text-primary">installed properly.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Instant online quotes and expert installation from certified
              engineers. Get your home charger fitted in days, not weeks —
              and claim up to £500 toward the cost.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 gap-2 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
              >
                Browse chargers
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-primary/30 px-6 text-base text-primary hover:bg-primary/5"
              >
                Check grant eligibility
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground/70"
                >
                  <CheckCircle2 className="size-4 text-success" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div
              className="absolute inset-0 rounded-[2rem] opacity-90"
              style={{
                background:
                  "conic-gradient(from 210deg at 50% 50%, var(--primary), color-mix(in oklch, var(--primary) 40%, var(--accent)), var(--accent), var(--primary))",
              }}
            />
            <div className="absolute inset-[6px] rounded-[calc(2rem-6px)] bg-background/95 backdrop-blur-sm" />
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full p-12"
              aria-hidden
            >
              <rect
                x="60"
                y="30"
                width="80"
                height="140"
                rx="16"
                className="fill-none stroke-primary"
                strokeWidth="4"
              />
              <circle cx="100" cy="52" r="6" className="fill-accent" />
              <path
                d="M96 78 L84 112 L100 112 L92 150 L124 100 L106 100 Z"
                className="fill-primary"
              />
              <path
                d="M140 120 q30 0 30 30 v20"
                className="fill-none stroke-accent"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
