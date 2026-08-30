export type Faq = {
  question: string;
  answer: string;
  link?: { label: string; href: string };
};
export type FaqCategory = { category: string; items: Faq[] };

// General site-wide FAQ, shown on the home page.
export const homeFaqCategories: FaqCategory[] = [
  {
    category: "Ordering & Delivery",
    items: [
      {
        question:
          "What's the difference between buying a charger online and having it installed by you?",
        answer:
          "When you order through our site, you can choose to purchase the charger only or bundle it with professional installation by one of our certified engineers. If you already have a charger and just need it fitted, we can also arrange installation separately.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "In-stock chargers and accessories are typically dispatched within 1–2 working days, with next-day delivery available at checkout for most postcodes. If your order includes installation, we'll coordinate delivery to align with your scheduled fitting date.",
      },
      {
        question: "Can I pay in instalments?",
        answer:
          "Yes, we offer buy now, pay later options (such as pay in 3) with Paypal and Klarna at checkout for eligible orders, in addition to full upfront payment.",
      },
    ],
  },
  {
    category: "Choosing Your Charger",
    items: [
      {
        question:
          "What's the difference between a tethered and untethered charger?",
        answer:
          "A tethered charger comes with a permanently attached cable, so you just plug straight into your car. An untethered charger has a socket instead, meaning you connect your own separate Type 2 cable — offering more flexibility if you drive different vehicles with different cable needs.",
      },
    ],
  },
  {
    category: "Installation",
    items: [
      {
        question: "Do I need a home survey before installation?",
        answer:
          "Yes. We carry out remote surveys to check your electrical supply, mounting location, and cable routing, so we can confirm the right charger and installation plan for your property.",
      },
      {
        question: "How long does installation take once I've ordered?",
        answer:
          "Most residential installations are completed within a few days to a couple of weeks of your survey, depending on your location and the complexity of the job (for example, if additional electrical work is needed).",
      },
      {
        question:
          "What happens if my property isn't suitable for the charger I've chosen?",
        answer:
          "If a survey identifies an issue — such as insufficient supply capacity or an unsuitable mounting point — we'll recommend a suitable alternative charger or installation approach, or advise on any additional electrical work required before we proceed.",
      },
      {
        question:
          "Can I install the charger myself instead of using your installation service?",
        answer:
          "We strongly recommend professional installation. EV chargers involve specialist electrical work, and self-installation can invalidate your warranty, breach UK wiring regulations, and affect eligibility for OZEV grant funding, which requires installation by an approved installer.",
      },
      {
        question: "Do I need planning permission to install a home EV charger?",
        answer:
          "Most domestic installations don't require planning permission. However, some exceptions apply — for example, installations on listed buildings, in conservation areas, or where the unit would be mounted on a wall facing a highway in certain circumstances. We can advise on this during your survey.",
      },
      {
        question: "What if I rent my property or live in a flat/apartment?",
        answer:
          "You can still have a charger installed, but you'll typically need permission from your landlord or freeholder/management company first. For flats and apartments, factors like shared parking and communal electrical supply also affect what's possible — we can talk you through the options.",
      },
    ],
  },
  {
    category: "Grants & Funding",
    items: [
      {
        question: "Am I eligible for an OZEV grant, and can you help me apply?",
        answer:
          "Eligibility depends on factors like your property type, parking arrangement, and whether you own or lease your vehicle. As an OZEV-accredited installer, we can check your eligibility and handle the grant application on your behalf, so you don't have to navigate the process yourself.",
        link: { label: "Check your OZEV grant eligibility", href: "/ozev-grants" },
      },
    ],
  },
  {
    category: "Business & Commercial",
    items: [
      {
        question:
          "Do you offer chargers and installation for businesses, not just homes?",
        answer:
          "Yes. We supply and install workplace and commercial chargers for offices, car parks, and fleet depots, and can advise on OZEV workplace charging scheme funding where applicable.",
      },
    ],
  },
  {
    category: "After Installation",
    items: [
      {
        question:
          "What warranty and support do I get after installation, and what if something goes wrong?",
        answer:
          "All chargers come with a manufacturer's warranty (typically 3 years, depending on the model). Alongside this, our team provides ongoing technical support and can arrange a call-out if you experience a fault or issue with your charger after installation.",
      },
    ],
  },
];

// Shown on the residential chargers page.
export const residentialFaqCategories: FaqCategory[] = [
  {
    category: "Residential Chargers",
    items: [
      {
        question: "How much does it cost to install a home EV charger?",
        answer:
          "Most home installations cost £800–£1,300 total, including the charger. If you're eligible for the OZEV grant, you could get £500 or 75% off — whichever is lower. We check your eligibility and apply on your behalf during your free survey.",
      },
      {
        question: "Do I need a smart meter before getting a charger installed?",
        answer:
          "No. But you'll need one to access EV-specific tariffs, which can cut your overnight charging costs significantly. We can advise on the best tariffs for you.",
      },
      {
        question: "What makes an installation non-standard?",
        answer:
          "About 1 in 10 installations need extra work — usually if your fuse box isn't on an outside wall, your cable run exceeds 10 metres, or the cable needs burying. We'll flag this during your survey and give you a revised quote upfront. No hidden costs.",
      },
      {
        question: "Do I need to tell my home insurer?",
        answer: "Yes. It rarely affects your premium, but it keeps your policy accurate.",
      },
      {
        question: "Which charger is right for my home?",
        answer:
          "Most homes suit a 7kW single-phase charger, enough to fully charge most EVs overnight. If you have three-phase power, an 11kW or 22kW charger charges faster. We'll recommend the best fit during your survey.",
      },
      {
        question: "Will my electricity bill increase?",
        answer:
          "Yes, but charging at home still costs far less than petrol or diesel — especially on an off-peak tariff. We can help you compare options.",
      },
    ],
  },
  {
    category: "Installation & Process",
    items: [
      {
        question: "What does a standard installation include?",
        answer:
          "Up to 10 metres of cabling, an RCD and enclosure, surge protector, all fixings required, commissioning, and OZEV grant submission where eligible. Installed and tested by a NICEIC-certified engineer.",
      },
      {
        question: "What happens on installation day?",
        answer:
          "Our engineer installs, tests, and commissions your charger, shows you how to use it, and leaves everything clean and tidy. Takes around 3 hours for a standard install.",
      },
      {
        question: "Are your engineers qualified?",
        answer:
          "Yes — all installations are carried out by independently assessed, NICEIC-certified electricians. We never subcontract to unverified tradespeople.",
      },
    ],
  },
];

// Shown on the commercial chargers page.
export const commercialFaqCategories: FaqCategory[] = [
  {
    category: "Workplace & Commercial",
    items: [
      {
        question: "Can my business access grant funding for EV charger installation?",
        answer:
          "Yes. The OZEV Workplace Charging Scheme covers up to £500 per socket (up to 40 sockets) — up to £20,000 in funding. We handle the application for you.",
      },
      {
        question: "What size installation do you support for commercial sites?",
        answer:
          "Anything from a two-socket car park to a multi-bay charging hub. We run a free site assessment to design a solution that fits your site and budget.",
      },
      {
        question: "Can schools and public sector organisations apply for the WCS grant?",
        answer:
          "Yes — state-funded schools and public sector organisations are eligible. We have experience delivering these projects and can guide you through the process.",
      },
    ],
  },
];
