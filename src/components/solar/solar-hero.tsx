import Image from "next/image";
import { Kalam, Plus_Jakarta_Sans } from "next/font/google";

import { cn } from "@/lib/utils";

// /solar-panels hero, rebuilt from the "UKSOL plug-in solar banner" design
// (a 1983×793 artboard). From xl up every element sits where the design puts
// it — positions in %, sizes in cqw of the banner — so it scales like the
// artboard and lines up with the divider marks baked into the photo. Below
// xl it falls back to a stacked layout. Images live in the media store.

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
const kalam = Kalam({ subsets: ["latin"], weight: "700", display: "swap" });

const MEDIA = {
  bg: "/api/media/uploads/ea9d0e20-35dd-4465-a82f-bdf1c2a3877a.jpg",
  logo: "/api/media/uploads/708472e7-03a4-440e-8a63-c09fbfa598e8.png",
  panel: "/api/media/uploads/24916d02-93ab-4508-ad99-4d53a951c04a.png",
  inverter: "/api/media/uploads/56085c57-61fb-4090-8abe-b0f27849daa5.png",
  app: "/api/media/uploads/64acffcb-1c14-4bbc-a5eb-6d20b492196b.png",
  clean: "/api/media/uploads/cd89f20e-4f26-4c53-a397-413ce9da9e8e.png",
  warranty: "/api/media/uploads/0922b6bb-3992-4131-94a7-1b5d11aff2a6.png",
  plug: "/api/media/uploads/c21217dd-93cc-434b-9055-dbb2591d1f8e.png",
};

// `left` = feature centre on the artboard (% of 1983), icon width in cqw.
const features = [
  { icon: MEDIA.panel, title: "460W", sub: "Panel Power", left: "xl:left-[6.45%]", w: "xl:w-[3.83cqw]" },
  { icon: MEDIA.inverter, title: "800W", sub: "Inverter Output", left: "xl:left-[14.72%]", w: "xl:w-[3.83cqw]" },
  { icon: MEDIA.app, title: "WiFi & Bluetooth", sub: "App Monitoring", left: "xl:left-[23.55%]", w: "xl:w-[5.35cqw]" },
  { icon: MEDIA.clean, title: "Clean", sub: "Energy", left: "xl:left-[32.02%]", w: "xl:w-[3.93cqw]" },
  { icon: MEDIA.warranty, title: "10 Year", sub: "Warranty", left: "xl:left-[39.99%]", w: "xl:w-[3.93cqw]" },
  { icon: MEDIA.plug, title: "Plug & Play", sub: "Setup", left: "xl:left-[48.36%]", w: "xl:w-[3.93cqw]" },
];
const dividers = ["xl:left-[10.29%]", "xl:left-[19.06%]", "xl:left-[28.09%]", "xl:left-[35.86%]", "xl:left-[43.87%]"];

export function SolarHero() {
  return (
    <section className={cn(jakarta.className, "@container relative overflow-hidden bg-[#f4f8fb] xl:aspect-[1983/793]")}>
      <div className="relative h-56 sm:h-72 md:absolute md:inset-0 md:h-auto">
        <Image
          src={MEDIA.bg}
          alt="Plug-in solar panel on a sunny seaside terrace"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[80%_center] xl:object-center"
        />
      </div>
      {/* Keeps the text readable over the photo until the artboard layout. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/75 to-transparent md:block xl:hidden" />

      <div className="relative flex flex-col gap-4 px-5 py-8 sm:px-8 md:max-w-[62%] md:py-12 xl:static xl:max-w-none xl:p-0">
        <Image
          src={MEDIA.logo}
          alt="UKSOL"
          width={352}
          height={92}
          className="h-auto w-40 mix-blend-multiply sm:w-52 xl:absolute xl:top-[7.31%] xl:left-[4.54%] xl:w-[17.75cqw]"
        />

        <div className="xl:absolute xl:top-[22.95%] xl:left-[4.74%]">
          <p className="text-sm leading-[26px] font-extrabold tracking-[4px] whitespace-nowrap text-[#17375e] sm:text-base xl:text-[1.01cqw] xl:leading-[1.31cqw] xl:tracking-[0.28cqw]">
            UKSOL PLUG-IN SOLAR
          </p>
          <div className="mt-1 h-[5px] w-[54px] bg-[#fdb313] xl:mt-[0.4cqw] xl:h-[0.25cqw] xl:w-[2.72cqw]" />
        </div>

        <h1 className="text-[40px] leading-[1] font-extrabold tracking-[-1.2px] text-[#17426a] sm:text-[56px] xl:absolute xl:top-[27.74%] xl:left-[4.54%] xl:text-[4.44cqw] xl:leading-[4.29cqw] xl:tracking-[-0.12cqw] xl:whitespace-nowrap">
          Harness the sun.
          <br />
          <span className="text-[#fca80c]">Power your home.</span>
        </h1>

        <p className="max-w-[560px] text-base leading-[1.45] font-medium text-[#1f2f45] sm:text-lg xl:absolute xl:top-[52.46%] xl:left-[4.74%] xl:max-w-none xl:text-[1.21cqw] xl:leading-[1.59cqw] xl:whitespace-nowrap">
          Plug-in solar kits are the simple, cost-effective way
          <br className="hidden xl:inline" /> to generate your own clean energy — no complicated
          <br className="hidden xl:inline" /> installations, no hassle.
        </p>

        <ul className="mt-2 grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-6 xl:contents">
          {features.map((f) => (
            <li
              key={f.title}
              className={cn(
                "flex flex-col items-center text-center xl:absolute xl:top-[68.85%] xl:-ml-[4.285cqw] xl:w-[8.57cqw]",
                f.left,
              )}
            >
              <Image src={f.icon} alt="" width={106} height={76} className={cn("h-12 w-auto object-contain mix-blend-multiply xl:h-[3.83cqw]", f.w)} />
              <b className="mt-2 text-sm leading-tight font-bold tracking-[-0.3px] text-[#17375e] xl:mt-[0.4cqw] xl:text-[max(0.96cqw,12px)] xl:leading-[1.21cqw] xl:whitespace-nowrap">
                {f.title}
              </b>
              <span className="text-xs leading-snug font-medium text-[#2b3d55] xl:text-[max(0.81cqw,11px)] xl:leading-[1.11cqw] xl:whitespace-nowrap">
                {f.sub}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {dividers.map((left) => (
        <span
          key={left}
          aria-hidden="true"
          className={cn("absolute top-[69.99%] hidden h-[15.51%] w-px bg-[#d3dae2] xl:block", left)}
        />
      ))}

      {/* Handwritten note + swoosh (artboard layout only). */}
      <div
        aria-hidden="true"
        className={cn(
          kalam.className,
          "absolute top-[12.11%] left-[53.45%] hidden w-[15.13cqw] -rotate-[15deg] text-center text-[2.12cqw] leading-[2.32cqw] font-bold text-[#1c3d6e] xl:block",
        )}
      >
        Clean energy
        <br />
        <span className="ml-[1.21cqw] inline-block">made simple</span>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 70"
        className="absolute top-[24.21%] left-[56.88%] hidden h-auto w-[10.09cqw] xl:block"
      >
        <path d="M6 60 C 60 34, 120 16, 194 10" fill="none" stroke="#fbb11a" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </section>
  );
}
