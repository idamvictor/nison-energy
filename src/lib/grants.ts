const IMG = "https://ocunioenergy.com/wp-content/uploads/2025/05";

export type GrantStatus = "open" | "closed";

export type GrantScheme = {
  slug: string;
  audience: string;
  title: string;
  tagline: string;
  image: string;
  status: GrantStatus;
  statusNote?: string;
  grantAmount: string;
  grantDetails?: string[];
  overview: string[];
  eligibility: string[];
  ineligible?: string[];
  requirements?: string[];
  documentation?: string[];
  applicationSteps?: string[];
  applyCta?: { label: string; href: string };
  resources: { label: string; href: string }[];
};

const govResources = [
  {
    label: "OZEV-authorised installer directory",
    href: "https://www.gov.uk/electric-vehicle-chargepoint-installers",
  },
  {
    label: "Approved chargepoint model list",
    href: "https://www.gov.uk/government/publications/authorised-chargepoint-model-list",
  },
  {
    label: "April 2026 grant scheme changes",
    href: "https://www.gov.uk/guidance/changes-to-electric-vehicle-chargepoint-grant-schemes-from-1-april-2026",
  },
];

export const grantSchemes: GrantScheme[] = [
  {
    slug: "renters-and-flat-owners",
    audience: "Renters & Flat Owners",
    title: "Electric Vehicle Chargepoint Grant for Renters and Flat Owners",
    tagline: "Live in a flat or rent your property? Save up to £500 with OZEV funding",
    image: `${IMG}/side-view-man-charging-his-car-min-scaled.webp`,
    status: "open",
    grantAmount: "75% of cost, up to £500 per socket",
    overview: [
      "If you rent your home or own a flat, you could save money on the cost of an EV chargepoint through OZEV funding.",
      "The EV Chargepoint Grant for Renters and Flat Owners covers 75% of the cost of buying and installing a home chargepoint, up to £500 per socket. The grant is paid straight to your OZEV-approved installer and deducted from your invoice — you never handle the money yourself.",
      "Once approved, your installer completes the installation, deducts the £500 grant from your invoice, and claims it directly from OZEV.",
    ],
    eligibility: [
      "Live in a flat you own (including shared ownership), or rent any residential property",
      "Have a private, off-street parking space you own or have a legal right to use, accessible at all times",
      "Own or use an OZEV-approved electric or qualifying plug-in hybrid vehicle",
      "Not yet have the chargepoint installed (the grant can't be backdated)",
      "Live in an existing, occupied residential property in England, Wales, Scotland or Northern Ireland",
    ],
    ineligible: [
      "Own a standalone house (unless it's been converted into flats and you occupy just one)",
      "Rent a room where your landlord also lives",
      "Are moving or planning to move",
      "Have already claimed this grant, EVHS, or the Domestic Recharge Scheme at this address",
      "Live somewhere a chargepoint is legally required (e.g. a new build)",
      "Live in the Channel Islands or Isle of Man",
    ],
    applicationSteps: [
      "Get a dated quote from an OZEV-authorised installer",
      "Gather your documents — tenancy agreement or ownership proof, a utility bill under 3 months old, and written landlord/freeholder permission",
      "From 1 April 2026, apply directly via the GOV.UK Find a Grant platform (installers can no longer send you the application link)",
      "OZEV reviews your application and notifies you and your installer by email once approved",
    ],
    documentation: [
      "Proof of address — a utility bill or council tax bill dated within the last 3 months",
      "Proof of tenancy or ownership — your signed tenancy agreement (AST), or your leasehold title if you own the flat",
      "If you're renting: written landlord or freeholder consent — grab our ready-made permission letter template to speed things along",
      "Your itemised quote from Ocunio, showing the £500 grant deduction clearly",
      "Vehicle evidence: your V5C logbook, lease agreement, or registration number if you already have the car — or your vehicle order form plus a photo of your off-street parking space if it's on order",
      "Some landlords, especially councils or housing associations, require you to submit a business case as part of your permission — we support you with the information and supporting documents needed for this",
    ],
    resources: [
      {
        label: "Apply via Find a Grant",
        href: "https://www.find-government-grants.service.gov.uk/",
      },
      {
        label: "Eligible vehicles list",
        href: "https://www.gov.uk/government/publications/residential-chargepoints-eligible-vehicles",
      },
      ...govResources,
    ],
  },
  {
    slug: "residential-landlords",
    audience: "Residential Landlords",
    title: "Electric Vehicle Chargepoint Grant for Residential Landlords",
    tagline: "Are you a residential landlord? Save up to £500 per socket with OZEV funding",
    image: `${IMG}/Home-Charging-Image.jpg`,
    status: "open",
    grantAmount: "75% of cost, up to £500 per socket",
    overview: [
      "The EV Chargepoint Grant for Residential Landlords has been extended and remains open to new applications. Landlords can claim 75% of the cost of buying and installing an EV chargepoint, up to £500 per socket for up to 200 sockets per year across their properties. The grant is paid directly to the OZEV-approved installer and deducted from the landlord's invoice.",
    ],
    eligibility: [
      "Own or manage residential rental property — a single let flat, a block of flats, or shared communal parking/spaces",
      "Provide a private, off-street parking space accessible to the tenant at all times",
      "Have a company registration or VAT number (individuals, RTM/RMC companies, freeholders, management companies, social housing providers, and public sector landlords all qualify)",
      "Not be installing the chargepoint because it's a mandatory requirement (e.g. a new-build planning condition)",
    ],
    applyCta: { label: "More information & apply now", href: "/workplace-charging" },
    resources: govResources,
  },
  {
    slug: "workplace-charging-scheme",
    audience: "Businesses, Charities & Public Sector",
    title:
      "Workplace Charging Scheme — Electric Vehicle Chargepoint Grant for Businesses, Charities and Public Sector",
    tagline: "Are you a business, charity, or public sector organisation? Save up to £20,000 with OZEV funding",
    image: `${IMG}/pexels-kindelmedia-9800036-scaled.webp`,
    status: "open",
    grantAmount: "75% of cost (incl. VAT), up to £500 per socket",
    overview: [
      "The Workplace Charging Scheme (WCS) is a voucher-based grant from OZEV and DVLA that covers 75% of the cost of buying and installing EV chargepoints (including VAT), up to £500 per socket, for up to 40 sockets per applicant — a maximum of £20,000. The grant is issued as a voucher and deducted from your final invoice by your OZEV-authorised installer, who must not charge you until the grant has been paid.",
      "Home workers can also apply, provided their address is registered as a place of business and an eligible dual-use (residential/commercial) chargepoint is installed.",
      "Tax benefits: employees using workplace EV charging aren't taxed on the electricity provided, and businesses can claim 100% of chargepoint installation costs as a capital allowance in the year of installation — with some expenditure qualifying for further enhanced deductions. Combined with the WCS grant, this can substantially reduce your net installation cost.",
    ],
    eligibility: [
      "Be a business, charity, public sector organisation, or small accommodation business in England, Wales, Scotland or Northern Ireland",
      "Have dedicated off-street parking, clearly associated with your premises and designated for staff or fleet use",
      "Own the site or have written landlord consent to install chargepoints",
      "Provide a company registration number, VAT number, or business rates bill (or equivalent evidence for charities, NHS surgeries and schools)",
      "Not be installing chargepoints as a mandatory requirement (e.g. under Part S regulations or a planning condition)",
    ],
    applicationSteps: [
      "Arrange a site survey with an OZEV-authorised installer",
      "Apply online at apply-workplace-chargepoint-grant.service.gov.uk — approval and voucher issued within 5 working days",
      "Share the voucher with your installer and complete installation within 180 days (don't install before the voucher is issued)",
      "Your installer claims the grant on your behalf and deducts it from your invoice",
    ],
    applyCta: { label: "More information & apply now", href: "/workplace-charging" },
    resources: [
      {
        label: "Apply for a workplace voucher",
        href: "https://apply-workplace-chargepoint-grant.service.gov.uk/",
      },
      ...govResources,
    ],
  },
  {
    slug: "on-street-parking",
    audience: "Households with On-Street Parking",
    title: "Electric Vehicle Chargepoint Grant for Households with On-Street Parking",
    tagline: "Got on-street parking? Save up to £500 with OZEV funding",
    image: `${IMG}/freepik__the-style-is-candid-image-photography-with-natural__60490.jpeg`,
    status: "open",
    grantAmount: "75% of cost, up to £500 per socket",
    overview: [
      "The EV Chargepoint Grant for Households with On-Street Parking supports residents without private off-street parking. It covers 75% of the combined cost of a chargepoint and its installation, up to £500 per socket, but a permanent cross-pavement charging solution (such as a cable channel cut into the pavement) must be installed at the same time. The grant is paid directly to your OZEV-approved installer and deducted from your invoice.",
      "Note: the grant doesn't cover the cross-pavement solution itself — only the chargepoint purchase and installation costs are eligible. Local highways authority consent can take time to arrange, so it's worth contacting them early.",
    ],
    eligibility: [
      "Own or rent the residential property and live there, with no private off-street parking (driveway, garage or residential car park)",
      "Have adequate, lawful on-street parking available near your home",
      "Own, lease, or be responsible for an OZEV-approved electric vehicle",
      "Obtain consent from your local highway's authority for the cross-pavement solution before applying",
      "Be located in England, Wales, Scotland or Northern Ireland",
    ],
    ineligible: [
      "Already have a chargepoint installed, or simply want to replace, upgrade or relocate one",
      "Have private off-street parking",
      "Won't be installing a permanent cross-pavement solution",
      "Have previously claimed this grant or the Renters and Flat Owners grant at this address",
      "Are moving or planning to move",
    ],
    applyCta: {
      label: "More information & apply now",
      href: "/ozev-grant-guide/renters-and-flat-owners",
    },
    resources: [
      {
        label: "Apply via Find a Grant",
        href: "https://www.find-government-grants.service.gov.uk/",
      },
      {
        label: "Eligible vehicles list",
        href: "https://www.gov.uk/government/publications/residential-chargepoints-eligible-vehicles",
      },
      ...govResources,
    ],
  },
  {
    slug: "education-institutions",
    audience: "State-Funded Education Institutions",
    title: "Workplace Charging Scheme for State-Funded Education Institutions",
    tagline: "Are you a state-funded school or education institution? Save up to £2,000 per socket with OZEV funding",
    image: `${IMG}/indra-smart-pro-tethered-in-situ-4.webp`,
    status: "open",
    grantAmount: "75% of cost (incl. VAT), up to £2,000 per socket",
    overview: [
      "The Workplace Charging Scheme (WCS) for State-Funded Education Institutions is a voucher-based grant from OZEV and DVLA. It covers 75% of the total purchase and installation cost (including VAT), up to £2,000 per socket from 1 April 2026, for up to 40 sockets across all sites. The grant will be deducted from your invoice by your OZEV-authorised installer once the claim is made on your behalf.",
    ],
    eligibility: [
      "Be a state-funded primary, secondary, sixth form, or further education institution, nursery, academy or free school (independent schools apply via the standard WCS instead)",
      "Have designated off-street parking clearly associated with the premises",
      "Use an OZEV-authorised installer and an eligible chargepoint from the OZEV-approved model list",
      "Have authority to apply on the institution's behalf, with two named contacts using the institution's email domain",
    ],
    ineligible: [
      "The institution is independent, or based in the Channel Islands or Isle of Man",
      "The parking isn't designated for the institution, or hasn't been built yet",
      "A chargepoint has already been claimed for the same socket under another grant scheme",
      "Installation was a mandatory requirement (e.g. under building or planning regulations)",
    ],
    applicationSteps: [
      "Arrange a site survey with an OZEV-authorised installer and agree the scope of work",
      "Complete the dedicated application form at gov.uk (not the Find a Grant platform) in one session, with your institution/SEED reference number and contact details",
      "If successful, you'll be emailed a voucher code within 5 working days — don't begin installation before receiving it",
      "Your installer completes the work within the 180-day voucher validity period",
      "Your installer submits the claim, including photographs, a cost breakdown, and a site plan, and deducts the grant from your invoice",
    ],
    applyCta: { label: "More information & apply now", href: "/workplace-charging" },
    resources: [
      {
        label: "Apply on GOV.UK",
        href: "https://www.gov.uk/guidance/workplace-charging-scheme-for-state-funded-education-institutions",
      },
      ...govResources,
    ],
  },
];

export function getGrantScheme(slug: string) {
  return grantSchemes.find((scheme) => scheme.slug === slug);
}
