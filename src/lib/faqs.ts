export type Faq = { question: string; answer: string };
export type FaqCategory = { category: string; items: Faq[] };

export const faqCategories: FaqCategory[] = [
  {
    category: "Residential Chargers",
    items: [
      {
        question: "How much does it cost to install a home EV charger?",
        answer:
          "Most standard home installations cost between £800 and £1,300 in total, including the charger and installation. If you're eligible for the OZEV Electric Vehicle Chargepoint Grant, you can receive either £500 or 75% off the purchase and installation cost — whichever is lower. We'll confirm your eligibility during your free survey and apply for the grant on your behalf.",
      },
      {
        question: "What is the OZEV grant and do I qualify?",
        answer:
          "The OZEV Electric Vehicle Chargepoint Grant is a government scheme that reduces the cost of buying and installing a home EV charger. To qualify, you must own or lease an eligible electric or plug-in hybrid vehicle and have dedicated off-street parking. Flat and rented property owners may also be eligible under a separate scheme. We'll assess your eligibility as part of your free site survey.",
      },
      {
        question: "Do I need a smart meter before getting a charger installed?",
        answer:
          "No. A smart meter is not required to install or use your EV charger. However, if you want to take advantage of EV-specific energy tariffs — which can significantly reduce your overnight charging costs — you will need a smart meter to access them. We're happy to advise on the best tariffs available.",
      },
      {
        question: "How long does installation take?",
        answer:
          "A standard home installation is typically completed in around three hours. Around 90% of our installations are standard. We'll confirm your specific timeframe during your survey.",
      },
      {
        question: "What makes an installation non-standard?",
        answer:
          "Around 1 in 10 installations requires additional materials or work. This usually applies if your fuse box is not on an outside wall, your cable run needs to exceed 10 metres, or the cable needs to be buried underground or under paving. If this applies to your property, we'll explain it clearly during your survey — before any work begins — and provide a revised quote. There are no hidden costs.",
      },
      {
        question: "Do I need to tell my home insurer?",
        answer:
          "Yes — it's good practice to inform your home insurer that a chargepoint is being installed. In most cases, it will have no effect on your premium, but it ensures your policy remains accurate.",
      },
      {
        question: "Which charger is right for my home?",
        answer:
          "Most homes are suited to a 7kW single-phase charger, which will fully charge the majority of EVs overnight. If your property has three-phase power, an 11kW or 22kW charger is an option and offers faster charging speeds. We'll advise on the best option for your vehicle and electricity supply during your survey.",
      },
      {
        question: "Will my electricity bill increase?",
        answer:
          "Yes — charging your EV at home will use more electricity. However, for most drivers, the cost is still significantly lower than petrol or diesel. Charging overnight on an off-peak tariff can reduce your cost per mile even further. We're happy to help you compare options.",
      },
    ],
  },
  {
    category: "Installation & Process",
    items: [
      {
        question: "What does a standard installation include?",
        answer:
          "A standard installation includes up to 10 metres of cabling, a residual current device (RCD) and enclosure, all necessary fixing materials, commissioning of the chargepoint, and OZEV grant submission where eligible. Everything is installed and tested by a NICEIC-certified engineer.",
      },
      {
        question: "What happens on installation day?",
        answer:
          "Our engineer will arrive at the agreed time, carry out the installation, test and commission the chargepoint, walk you through how to use it, and leave your property clean and tidy. The whole process takes around three hours for a standard installation.",
      },
      {
        question: "Are your engineers qualified?",
        answer:
          "Yes. All Nison Energy installations are carried out by NICEIC-certified electricians — independently assessed and approved. We don't subcontract to unverified tradespeople.",
      },
      {
        question: "What happens after installation?",
        answer:
          "Your charger comes with a manufacturer warranty, and we provide ongoing support if you have any questions or issues.",
      },
    ],
  },
  {
    category: "Workplace & Commercial",
    items: [
      {
        question:
          "Can my business access grant funding for EV charger installation?",
        answer:
          "Yes. The OZEV Workplace Charging Scheme (WCS) provides eligible businesses, charities, schools, and public sector organisations with up to £500 per socket (up to 40 sockets), meaning up to £20,000 in grant support. We manage the application process as part of our service.",
      },
      {
        question: "What size installation do you support for commercial sites?",
        answer:
          "We work on everything from two-socket car parks to multi-bay commercial charging hubs. We'll carry out a free site assessment to understand your requirements and design a solution that fits your site and budget.",
      },
      {
        question:
          "Can schools and public sector organisations apply for the WCS grant?",
        answer:
          "Yes. State-funded schools and public sector organisations are eligible for the Workplace Charging Scheme. We have experience working with education and public sector sites and can guide you through the process.",
      },
    ],
  },
];
