import Image from "next/image";
import { ArrowRight, Building2, Cable, Home, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/reveal";

const IMG = "https://ocunioenergy.com/wp-content/uploads";

const categories = [
  {
    title: "Home Charging",
    description: "Chargers for your driveway or garage",
    icon: Home,
    image: `${IMG}/2025/05/Home-Charging-Image.jpg`,
    tone: "from-primary/90 via-primary/60",
  },
  {
    title: "Workplace Charging",
    description: "Fleet and commercial installations",
    icon: Building2,
    image: `${IMG}/2025/05/EV_OneStop_Website_Commercial_EV_Chargers_02.png`,
    tone: "from-[color-mix(in_oklch,var(--primary),black_25%)]/90 via-[color-mix(in_oklch,var(--primary),black_25%)]/55",
  },
  {
    title: "EV Accessories",
    description: "Cables, adapters and holsters",
    icon: Cable,
    image: `${IMG}/2025/05/EV_OneStop_Website_Type_2_Cables_1f4fd143-35b6-46ba-a663-705f220bc1f4.png`,
    tone: "from-accent/90 via-accent/55",
  },
  {
    title: "OZEV Grants",
    description: "Check what you're eligible to claim",
    icon: ShieldCheck,
    image: `${IMG}/2025/05/side-view-man-charging-his-car-min-scaled.webp`,
    tone: "from-[color-mix(in_oklch,var(--accent),black_20%)]/90 via-[color-mix(in_oklch,var(--accent),black_20%)]/55",
  },
];

export function CategoryCards() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={index * 75}>
              <a
                href="#"
                className="group relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl"
              >
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.tone} to-transparent`}
                />
                <category.icon className="absolute top-4 left-4 size-6 text-white" />
                <div className="relative p-5 text-white">
                  <p className="font-heading text-lg font-semibold">
                    {category.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {category.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                    Shop now
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
