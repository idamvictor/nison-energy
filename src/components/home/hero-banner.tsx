import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { jakarta, montserrat } from "@/components/shared/banner-fonts";
import { cn } from "@/lib/utils";

// Home page hero, built from the Figma frame "OCUNIO ENERGY" (node 87:75,
// 1440×619). From lg up it is the artboard itself: every position and size
// below is the Figma px value, scaled to the banner's width with
// calc(100cqw * px / 1440) — pixel-perfect at 1440 and proportional around
// it. Below lg the same pieces stack. Images live in the media store.

const MEDIA = {
  carPhoto: "/api/media/uploads/2e4688dc-5ea8-4193-aad8-a34755244813.png",
  slant: "/api/media/uploads/9ede13bf-fef2-4f88-b97b-d9341a41b5f1.svg",
  solar: "/api/media/uploads/75a91743-e4df-4001-aa03-d3698771c79f.png",
  phone: "/api/media/uploads/802aeeed-9842-404e-a1b3-78db1191d02c.png",
  kit: "/api/media/uploads/d31b4c49-498b-4343-aaec-873b274dd7b5.png",
  arrowLg: "/api/media/uploads/7e37b63b-6722-43e7-9090-913dd7f64611.svg",
  arrowSolar: "/api/media/uploads/03447248-1375-47f7-b294-cdbe96e7c907.svg",
  arrowCalc: "/api/media/uploads/2361cae8-3fec-4049-a5d8-b7b5e4cd0ff8.svg",
  arrowKit: "/api/media/uploads/ef828494-9043-4c60-97b5-c85492921b96.svg",
};

/** A Figma px value, scaled to the artboard width. */
const u = (px: number) => `calc(100cqw * ${px} / 1440)`;

/** Absolute box on the artboard. */
function box(left: number, top: number, width?: number, height?: number): CSSProperties {
  return {
    position: "absolute",
    left: u(left),
    top: u(top),
    ...(width != null ? { width: u(width) } : {}),
    ...(height != null ? { height: u(height) } : {}),
  };
}

function text(size: number, lineHeight: number, tracking = 0): CSSProperties {
  return { fontSize: u(size), lineHeight: u(lineHeight), letterSpacing: u(tracking) };
}

const NAVY = "#37414f";
const ORANGE = "#ff8411";
const HERO_BG = "linear-gradient(125.9deg, #0284c7 7.96%, #05a1dc 31.652%)";
const BAND_BG = "linear-gradient(138.31deg, #0284c7 14.403%, #08b9ee 43.403%)";
const BUTTON_BG = "linear-gradient(to bottom, #ff8a1a, #ff7900)";

type ButtonSpec = {
  font: number;
  lineHeight: number;
  tracking: number;
  padX: number;
  padY: number;
  border: number;
  borderAlpha: number;
  radius: number;
  gap: number;
  shadowY: number;
  shadowBlur: number;
  shadowAlpha: number;
  arrow: number;
  weight: 700 | 800;
};

const BTN_HERO: ButtonSpec = { font: 16.48, lineHeight: 24.721, tracking: 0.824, padX: 27.687, padY: 14.502, border: 1.318, borderAlpha: 0.6, radius: 5.274, gap: 10.547, shadowY: 5.274, shadowBlur: 9.229, shadowAlpha: 0.45, arrow: 18.458, weight: 800 };
const BTN_SOLAR: ButtonSpec = { font: 13.972, lineHeight: 20.958, tracking: 0.35, padX: 17.299, padY: 9.315, border: 1.331, borderAlpha: 0.5, radius: 5.323, gap: 7.984, shadowY: 5.323, shadowBlur: 9.315, shadowAlpha: 0.45, arrow: 15.968, weight: 700 };
const BTN_CALC: ButtonSpec = { font: 12.078, lineHeight: 18.117, tracking: 0.3019, padX: 15.701, padY: 8.455, border: 1.208, borderAlpha: 0.6, radius: 4.831, gap: 7.247, shadowY: 4.65, shadowBlur: 8, shadowAlpha: 0.46, arrow: 14.493, weight: 700 };
const BTN_KIT: ButtonSpec = { font: 12.21, lineHeight: 18.315, tracking: 0.3058, padX: 15.118, padY: 8.14, border: 1.163, borderAlpha: 0.5, radius: 4.652, gap: 6.977, shadowY: 4.652, shadowBlur: 8.14, shadowAlpha: 0.45, arrow: 13.955, weight: 700 };

/** Orange CTA. `scale` = artboard units (lg+) or plain px (mobile). */
function OrangeButton({
  href,
  label,
  arrow,
  spec,
  unit,
  style,
}: {
  href: string;
  label: string;
  arrow: string;
  spec: ButtonSpec;
  unit: (px: number) => string;
  style?: CSSProperties;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center whitespace-nowrap text-white uppercase transition-[filter] hover:text-white hover:brightness-105 focus-visible:ring-3 focus-visible:ring-[#ff7900]/40 focus-visible:outline-none"
      style={{
        gap: unit(spec.gap),
        padding: `${unit(spec.padY)} ${unit(spec.padX)}`,
        border: `${unit(spec.border)} solid rgba(255,152,56,${spec.borderAlpha})`,
        borderRadius: unit(spec.radius),
        backgroundImage: BUTTON_BG,
        filter: `drop-shadow(0 ${unit(spec.shadowY)} ${unit(spec.shadowBlur)} rgba(255,121,0,${spec.shadowAlpha}))`,
        fontWeight: spec.weight,
        fontSize: unit(spec.font),
        lineHeight: unit(spec.lineHeight),
        letterSpacing: unit(spec.tracking),
        ...style,
      }}
    >
      {label}
      <Image
        src={arrow}
        alt=""
        width={spec.arrow}
        height={spec.arrow}
        unoptimized
        style={{ width: unit(spec.arrow), height: unit(spec.arrow) }}
      />
    </Link>
  );
}

const px = (n: number) => `${n}px`;

const headline = (
  <>
    Buy, install, claim your
    <br />
    <span style={{ color: ORANGE }}>OZEV grant.</span> All in one place
  </>
);

export function HeroBanner() {
  return (
    <section className={cn(montserrat.className, "@container relative overflow-hidden")} style={{ backgroundImage: HERO_BG }}>
      {/* ── lg+: the Figma artboard ─────────────────────────────────────── */}
      <div className="relative hidden aspect-[1440/619] lg:block">
        <div style={{ ...box(0, 402, 1440, 217), backgroundImage: BAND_BG }} />

        <Image src={MEDIA.slant} alt="" width={838} height={402} unoptimized style={box(592, 0, 838, 402)} />
        <div style={box(602, 0, 838, 402)}>
          <Image
            src={MEDIA.carPhoto}
            alt="Dark blue EV charging from a wall-mounted charger on a red brick wall"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </div>

        <p className="font-extrabold whitespace-nowrap text-white uppercase" style={{ ...box(73, 81), ...text(15.969, 23.953, 2.555) }}>
          EV CHARGERS, ACCESSORIES, INSTALLATION AND
        </p>
        {/* One heading, two boxes (as in Figma); "contents" keeps the h1 out of layout. */}
        <h1 className={cn(jakarta.className, "contents font-extrabold text-white")}>
          <span className="block" style={{ ...box(72, 110.03, 591.307), ...text(53.648, 53.648, -2.1459) }}>
            Buy, install, claim your
          </span>{" "}
          <span
            className="block"
            style={{ ...box(69, 177.5, 440.767), ...text(53.648, 53.648, -2.1459), filter: `drop-shadow(0 ${u(0.812)} ${u(0.406)} rgba(0,0,0,0.05))` }}
          >
            <span style={{ color: ORANGE }}>OZEV grant.</span> All in one place
          </span>
        </h1>

        <OrangeButton href="/home-charging" label="Get Started" arrow={MEDIA.arrowLg} spec={BTN_HERO} unit={u} style={box(72, 326)} />

        {/* Card 1 — Plug in Solar */}
        <div className="rounded-[10px] bg-white" style={{ ...box(74, 419, 423, 190), borderRadius: u(10) }} />
        <div className="flex flex-col justify-between" style={{ ...box(91, 433, 248, 165), padding: `${u(23)} 0` }}>
          <div className="flex flex-col" style={{ gap: u(5.323), color: NAVY }}>
            <h2 className={cn(montserrat.className, "font-black")} style={text(20.625, 25.788, -0.515)}>Plug in Solar</h2>
            <p className="font-normal" style={text(13.306, 17.565)}>
              Harness clean, renewable energy
              <br />
              and reduce your energy bills.
            </p>
          </div>
          <div style={{ paddingTop: u(10.645) }}>
            <OrangeButton href="/solar-panels" label="Shop Solar" arrow={MEDIA.arrowSolar} spec={BTN_SOLAR} unit={u} />
          </div>
        </div>
        <div style={box(263, 461, 234, 137)}>
          <Image src={MEDIA.solar} alt="Plug-in solar panel with micro-inverter and UK plug" fill sizes="240px" className="object-cover" />
        </div>

        {/* Card 2 — OZEV Quote Calculator */}
        <div className="bg-white" style={{ ...box(510, 419, 424, 190), borderRadius: u(10) }} />
        <div className="flex items-center justify-center" style={box(764, 414, 170.331, 199.694)}>
          <div className="relative rotate-[14.21deg]" style={{ width: u(132.018), height: u(172.574) }}>
            <Image src={MEDIA.phone} alt="Phone showing OZEV Grant Eligible" fill sizes="140px" className="object-cover" />
          </div>
        </div>
        <h2 className={cn(montserrat.className, "font-black")} style={{ ...box(527, 462, 312), ...text(18.721, 23.407, -0.4674), color: NAVY }}>
          OZEV Quote Calculator
        </h2>
        <p className="font-medium" style={{ ...box(527, 490.83, 273), ...text(12.078, 15.943), color: NAVY }}>
          Find out how much you could save
          <br />
          with the OZEV grant.
        </p>
        <OrangeButton href="/ozev-grant-guide" label="Calculate Your Quote" arrow={MEDIA.arrowCalc} spec={BTN_CALC} unit={u} style={box(527, 537)} />

        {/* Card 3 — Circuit Protection & EV Home Install Kits */}
        <div className="bg-white" style={{ ...box(942, 419, 423, 190), borderRadius: u(10) }} />
        <div className="flex flex-col justify-between" style={{ ...box(963, 441, 227.576, 147), padding: `${u(14)} 0` }}>
          <div className="flex flex-col" style={{ gap: u(3.721), color: NAVY }}>
            <h2 className={cn(montserrat.className, "font-black")} style={{ ...text(14.885, 18.606, -0.3721), paddingTop: u(0.93) }}>
              Circuit Protection &amp; EV
              <br />
              Home Install Kits
            </h2>
            <p className="font-normal" style={{ ...text(11.047, 14.362), paddingBottom: u(0.605) }}>
              Keep your installation safe with trusted
              <br />
              protection solutions and complete kits.
            </p>
          </div>
          <div style={{ paddingTop: u(9.303) }}>
            <OrangeButton href="/circuit-protection" label="Shop Install Kits" arrow={MEDIA.arrowKit} spec={BTN_KIT} unit={u} />
          </div>
        </div>
        <div style={box(1161, 435, 184, 184)}>
          <Image src={MEDIA.kit} alt="Open consumer unit with circuit protection" fill sizes="190px" className="-scale-x-100 object-cover" />
        </div>
      </div>

      {/* ── Below lg: stacked ───────────────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4 px-5 pt-8 pb-6 sm:px-8">
          <p className="text-[11px] leading-[18px] font-extrabold tracking-[1.8px] text-white uppercase sm:text-[13px]">
            EV CHARGERS, ACCESSORIES, INSTALLATION AND
          </p>
          <p className={cn(jakarta.className, "text-[34px] leading-[36px] font-extrabold tracking-[-1.2px] text-white sm:text-[46px] sm:leading-[48px]")}>
            {headline}
          </p>
          <OrangeButton href="/home-charging" label="Get Started" arrow={MEDIA.arrowLg} spec={BTN_HERO} unit={px} style={{ marginTop: 8 }} />
        </div>
        <div className="relative aspect-[838/402] w-full">
          <Image
            src={MEDIA.carPhoto}
            alt="Dark blue EV charging from a wall-mounted charger on a red brick wall"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-8" style={{ backgroundImage: BAND_BG }}>
          <MobileCard
            title="Plug in Solar"
            copy="Harness clean, renewable energy and reduce your energy bills."
            button={<OrangeButton href="/solar-panels" label="Shop Solar" arrow={MEDIA.arrowSolar} spec={BTN_SOLAR} unit={px} />}
            image={<Image src={MEDIA.solar} alt="Plug-in solar panel with micro-inverter and UK plug" fill sizes="200px" className="object-contain object-right" />}
          />
          <MobileCard
            title="OZEV Quote Calculator"
            copy="Find out how much you could save with the OZEV grant."
            button={<OrangeButton href="/ozev-grant-guide" label="Calculate Your Quote" arrow={MEDIA.arrowCalc} spec={BTN_CALC} unit={px} />}
            image={<Image src={MEDIA.phone} alt="Phone showing OZEV Grant Eligible" fill sizes="140px" className="rotate-[14.21deg] object-contain" />}
          />
          <MobileCard
            title="Circuit Protection & EV Home Install Kits"
            copy="Keep your installation safe with trusted protection solutions and complete kits."
            button={<OrangeButton href="/circuit-protection" label="Shop Install Kits" arrow={MEDIA.arrowKit} spec={BTN_KIT} unit={px} />}
            image={<Image src={MEDIA.kit} alt="Open consumer unit with circuit protection" fill sizes="160px" className="-scale-x-100 object-contain" />}
          />
        </div>
      </div>
    </section>
  );
}

function MobileCard({
  title,
  copy,
  button,
  image,
}: {
  title: string;
  copy: string;
  button: React.ReactNode;
  image: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[170px] overflow-hidden rounded-[10px] bg-white">
      <div className="relative z-10 flex w-[62%] flex-col justify-between gap-3 py-5 pl-4" style={{ color: NAVY }}>
        <div className="flex flex-col gap-1.5">
          <h2 className={cn(montserrat.className, "text-[18px] leading-[22px] font-black tracking-[-0.45px]")}>{title}</h2>
          <p className="text-[13px] leading-[17px]">{copy}</p>
        </div>
        {button}
      </div>
      <div className="absolute inset-y-3 right-2 w-[34%]">{image}</div>
    </div>
  );
}
