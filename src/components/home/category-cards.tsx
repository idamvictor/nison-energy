import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils";

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const categories = [
  {
    title: "Residential Chargers",
    description: "Chargers for your driveway or garage, fitted in days.",
    image: `${IMG}/2025/05/EV_OneStop_Website_Home_Chargers.png`,
    href: "/home-charging",
    span: "lg:col-span-2 lg:row-span-2",
    text: "text-2xl sm:text-3xl",
  },
  {
    title: "Commercial Chargers",
    description: null,
    image: `${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`,
    href: "/workplace-charging",
    span: "lg:col-span-1 lg:row-span-1",
    text: "text-lg",
  },
  {
    title: "Accessories",
    description: null,
    image: `${IMG}/2025/05/EV_OneStop_Website_Type_2_Cables_1f4fd143-35b6-46ba-a663-705f220bc1f4.png`,
    href: "/accessories",
    span: "lg:col-span-1 lg:row-span-1",
    text: "text-lg",
  },
  {
    title: "OZEV Grants",
    description: "See what you're eligible to claim.",
    image: `${IMG}/2025/05/side-view-man-charging-his-car-min-scaled.webp`,
    href: "#grants",
    span: "lg:col-span-2 lg:row-span-1",
    text: "text-lg",
  },
];

export function CategoryCards() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Shop By Category
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-65 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={index * 60} className={category.span}>
              <Link
                href={category.href}
                className="group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-2xl"
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(0deg, color-mix(in oklch, black 88%, var(--primary) 12%) 0%, transparent 65%)",
                    opacity: 0.85,
                  }}
                />
                <div className="relative p-6">
                  <p
                    className={cn(
                      "font-heading font-semibold tracking-[-0.01em] text-white",
                      category.text
                    )}
                  >
                    {category.title}
                  </p>
                  {category.description && (
                    <p className="mt-1.5 max-w-xs text-sm text-white/70">
                      {category.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Shop now
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
