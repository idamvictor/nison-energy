import Image from "next/image";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

const IMG = "https://ocunioenergy.com/wp-content/uploads/2025/05";

const logos = [
  { src: `${IMG}/wallbox.png`, alt: "Wallbox" },
  { src: `${IMG}/Podpoint.png`, alt: "Podpoint" },
  { src: `${IMG}/Ohme.png`, alt: "Ohme" },
  { src: `${IMG}/Hypervolt.png`, alt: "Hypervolt" },
  { src: `${IMG}/Givenergy.png`, alt: "GivEnergy" },
  { src: `${IMG}/Easee.png`, alt: "Easee" },
  { src: `${IMG}/download.png`, alt: "Tesla" },
  { src: `${IMG}/download-1.png`, alt: "myenergi" },
];

export function TrustedInstallers() {
  const track = [...logos, ...logos];

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionKicker center />
          <h2 className="mt-4 text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Our Trusted Installers
          </h2>
        </Reveal>

        <div className="mt-10 overflow-hidden mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-16 motion-reduce:animate-none">
            {track.map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="flex h-10 w-28 shrink-0 items-center justify-center grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={112}
                  height={40}
                  className="max-h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
