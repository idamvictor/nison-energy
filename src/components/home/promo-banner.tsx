import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

// Home page banner + promo cards, rebuilt from the "Homepage hero + promo
// cards" design. Images live in the media store (uploaded once).
const MEDIA = {
  hero: "/api/media/uploads/489b3e10-1cc6-4d25-b150-93cf4d241324.jpg",
  iconChargers: "/api/media/uploads/240fd8e0-36aa-4ade-87b5-8a85cbe86781.png",
  iconAccessories: "/api/media/uploads/dd18f7b3-8aec-4171-9c0c-ccb8ffaf816e.png",
  iconInstall: "/api/media/uploads/e6f827ed-80d1-40e2-9685-35c6d4183d78.png",
  iconGrant: "/api/media/uploads/abbd768d-ed2c-458b-9920-0c4012bb6045.png",
  solarPhoto: "/api/media/uploads/17f4d87b-e33e-458f-ba42-d3beda4bf90c.jpg",
  solarIcon: "/api/media/uploads/c6b69bea-906a-4ecd-8d4d-5d11ca7d3fb7.png",
  calcPhoto: "/api/media/uploads/77104ec4-8242-4c94-b9ec-cffe13d71c51.jpg",
  calcIcon: "/api/media/uploads/d3062d3d-b6ee-41d8-8d08-f3e9ace45a91.png",
  kitsPhoto: "/api/media/uploads/9c48c72c-565e-416c-87e2-2f5e3d3bfc38.jpg",
  kitsIcon: "/api/media/uploads/80c547cf-50d7-4061-b14d-135084d159fc.png",
};

const features = [
  { icon: MEDIA.iconChargers, title: "EV Chargers", sub: "Home & Workplace" },
  { icon: MEDIA.iconAccessories, title: "Accessories", sub: "Everything you need" },
  { icon: MEDIA.iconInstall, title: "Installation", sub: "By trusted professionals" },
  { icon: MEDIA.iconGrant, title: "OZEV Grant", sub: "We help you claim" },
];

const cards = [
  {
    title: ["Plug in solar"],
    copy: "Harness clean, renewable energy and reduce your energy bills.",
    cta: "Shop Solar",
    href: "/solar-panels",
    icon: MEDIA.solarIcon,
    photo: MEDIA.solarPhoto,
    alt: "Plug-in solar panel with micro-inverter and UK plug",
    photoWidth: "w-[46%]",
    textWidth: "max-w-[58%]",
  },
  {
    title: ["OZEV Quote", "Calculator"],
    copy: "Find out how much you could save with the OZEV grant.",
    cta: "Calculate Your Quote",
    href: "/ozev-grant-guide",
    icon: MEDIA.calcIcon,
    photo: MEDIA.calcPhoto,
    alt: "Hand holding a phone showing OZEV Grant Eligible",
    photoWidth: "w-[46%]",
    textWidth: "max-w-[58%]",
  },
  {
    title: ["Circuit Protection &", "EV Home Install Kits"],
    copy: "Keep your installation safe and compliant with trusted protection solutions and complete kits.",
    cta: "Shop Install Kits",
    href: "/accessories",
    icon: MEDIA.kitsIcon,
    photo: MEDIA.kitsPhoto,
    alt: "Open consumer unit with circuit protection",
    photoWidth: "w-[34%]",
    textWidth: "max-w-[70%]",
    comingSoon: true,
  },
];

// Soft left edge where the photo meets the gradient (as in the design).
const fade = "[mask-image:linear-gradient(90deg,transparent_0,#000_40px)]";

function Arrow() {
  return (
    <svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6h15M11 1l5 5-5 5" />
    </svg>
  );
}

function PromoButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[41px] items-center justify-center gap-2 rounded-[2px] bg-[linear-gradient(180deg,#ff8a1f_0%,#f96b06_100%)] px-5 text-[17px] font-semibold whitespace-nowrap text-white shadow-[0_2px_4px_rgba(200,80,0,.18)] transition-[filter] hover:text-white hover:brightness-105 focus-visible:ring-3 focus-visible:ring-[#f96b06]/40 focus-visible:outline-none",
        className,
      )}
    >
      {children}
      <Arrow />
    </Link>
  );
}

export function PromoBanner() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-[10px] px-4 py-12 sm:px-6 sm:py-14 lg:px-[18px]">
        <Reveal>
          {/* Banner */}
          <div className="relative overflow-hidden bg-[linear-gradient(180deg,#d9effc_0%,#eef8fe_45%,#f6fbfe_100%)] lg:min-h-[347px]">
            <div className="relative h-52 sm:h-64 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[42%] min-[1400px]:w-[49%]">
              <Image
                src={MEDIA.hero}
                alt="Dark blue EV charging from a wall-mounted charger on a red brick wall"
                fill
                sizes="(min-width: 1024px) 780px, 100vw"
                className="object-cover lg:[mask-image:linear-gradient(90deg,transparent_0,#000_40px)]"
              />
            </div>
            <svg aria-hidden="true" width="60" height="80" viewBox="0 0 60 80" className="absolute top-0 left-0 hidden lg:block">
              <polygon points="0,0 54,0 0,76" fill="#00b7fd" />
            </svg>

            <div className="relative flex flex-col gap-5 px-5 py-7 sm:px-8 lg:max-w-[60%] lg:py-6 lg:pl-[64px] min-[1400px]:max-w-[52%]">
              <div>
                <p className="text-sm font-semibold tracking-[0.1px] text-[#0b4f9f] sm:text-[19px]">
                  EV CHARGERS, ACCESSORIES, INSTALLATION AND
                </p>
                <h2 className="mt-1 text-[30px] leading-[1] font-bold tracking-[-0.6px] text-[#0a5bb4] sm:text-[44px] xl:text-[50px] xl:leading-[52px] min-[1400px]:text-[54px] min-[1400px]:leading-[53px]">
                  Buy, install, claim your
                  <br />
                  <span className="text-[#19a5ee]">ozev grant, All in one place.</span>
                </h2>
                <p className="mt-4 max-w-[600px] text-base leading-[23px] font-medium text-[#1f3655] sm:text-[19px]">
                  Quality EV chargers, accessories, professional installation and help with your OZEV grant. Simple, seamless, complete.
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:w-fit min-[1400px]:flex min-[1400px]:items-center min-[1400px]:gap-0">
                {features.map((f, i) => (
                  <li
                    key={f.title}
                    className={cn(
                      "flex items-center gap-2.5",
                      i > 0 && "min-[1400px]:ml-3 min-[1400px]:border-l min-[1400px]:border-[#c9dbea] min-[1400px]:pl-3",
                    )}
                  >
                    <Image src={f.icon} alt="" width={46} height={48} className="size-[46px] shrink-0 object-contain mix-blend-multiply" />
                    <div>
                      <b className="block text-xs leading-4 font-semibold text-[#14284a]">{f.title}</b>
                      <span className="block text-[10px] leading-[14px] font-medium text-[#5b6b80]">{f.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <PromoButton href="/home-charging" className="w-fit min-w-[183px]">
                Get Started
              </PromoButton>
            </div>
          </div>
        </Reveal>

        {/* Promo cards */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.cta} delay={i * 80} className="h-full">
              <div
                className={cn(
                  "relative flex h-full min-h-[255px] overflow-hidden bg-[linear-gradient(160deg,#dcf0fc_0%,#eef7fd_55%,#f4f9fd_100%)]",
                  "comingSoon" in card && "opacity-60 grayscale select-none",
                )}
                aria-disabled={"comingSoon" in card || undefined}
              >
                <div className={cn("absolute inset-y-0 right-0", card.photoWidth)}>
                  <Image src={card.photo} alt={card.alt} fill sizes="(min-width: 1024px) 260px, 50vw" className={cn("object-cover", fade)} />
                </div>
                <div className={cn("relative flex flex-col gap-3 px-5 py-4", card.textWidth)}>
                  <Image src={card.icon} alt="" width={68} height={60} className="h-[60px] w-auto self-start object-contain object-left mix-blend-multiply" />
                  <h3 className="text-[22px] leading-[1.05] font-bold tracking-[-0.2px] text-[#0b5cad] sm:text-[24px] min-[1400px]:text-[28px]">
                    {card.title.map((line, j) => (
                      <span key={j} className="block">{line}</span>
                    ))}
                  </h3>
                  <p className="text-[15px] leading-[18px] font-medium text-[#2a4466]">{card.copy}</p>
                  {"comingSoon" in card ? (
                    <span className="mt-auto inline-flex h-[41px] w-fit cursor-not-allowed items-center rounded-[2px] bg-[#9aa5b1] px-4 text-[15px] font-semibold text-white sm:text-[17px]">
                      Coming Soon
                    </span>
                  ) : (
                    <PromoButton href={card.href} className="mt-auto w-fit px-4 text-[15px] sm:text-[17px]">
                      {card.cta}
                    </PromoButton>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
