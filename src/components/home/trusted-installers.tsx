import Image from "next/image";


const IMG = "/media/wp/2025/05";

const logos = [
  { src: `${IMG}/wallbox.png`, alt: "Wallbox" },
  { src: `${IMG}/Podpoint.png`, alt: "Podpoint" },
  { src: `${IMG}/Ohme.png`, alt: "Ohme" },
  { src: `${IMG}/Hypervolt.png`, alt: "Hypervolt" },
  { src: `${IMG}/Givenergy.png`, alt: "GivEnergy" },
  { src: `${IMG}/Easee.png`, alt: "Easee" },
  { src: `${IMG}/download.png`, alt: "Tesla" },
  { src: `${IMG}/download-1.png`, alt: "myenergi" },
  // Media store (uploaded once).
  { src: "/api/media/uploads/f5f7704f-c032-4280-a237-bb5fe0d255a2.webp", alt: "Doncaster Cables" },
  { src: "/api/media/uploads/836a8521-c358-4987-bf3f-5bd031a1f785.webp", alt: "Matt:e" },
  { src: "/api/media/uploads/a309e648-2df5-4148-947f-b4ac80477647.webp", alt: "Whitecliffe" },
];

export function TrustedInstallers() {
  const track = [...logos, ...logos];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="overflow-hidden mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-20 motion-reduce:animate-none">
            {track.map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="flex h-16 w-40 shrink-0 items-center justify-center"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={64}
                  className="max-h-16 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
