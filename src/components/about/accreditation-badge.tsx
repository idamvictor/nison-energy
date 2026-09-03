import Image from "next/image";

import { Reveal } from "@/components/shared/reveal";

const badges = [
  {
    src: "https://res.cloudinary.com/dyp8gtllq/image/upload/v1788130769/Picture1_alm0gl.png",
    alt: "NICEIC certified",
    width: 357,
    height: 154,
  },
  {
    src: "https://res.cloudinary.com/dyp8gtllq/image/upload/v1788398074/Picture4_e1xgc8.webp",
    alt: "Accreditation badge",
    width: 357,
    height: 154,
  },
  {
    src: "https://res.cloudinary.com/dyp8gtllq/image/upload/v1788398074/Picture3_cbgzs7.webp",
    alt: "Accreditation badge",
    width: 357,
    height: 154,
  },
];

export function AccreditationBadge() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-16 text-center sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {badges.map((badge) => (
              <div
                key={badge.src}
                className="flex h-36 items-center rounded-xl bg-white px-10 sm:h-44"
              >
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  className="h-24 w-auto object-contain sm:h-32"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every installation is carried out by NICEIC-certified electricians.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
