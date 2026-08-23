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
  ineligible: string[];
  requirements?: string[];
  documentation?: string[];
  applicationSteps: string[];
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
    tagline:
      "Living in a rented home or flat with off-street parking? You can still get a grant-funded charger.",
    image: `${IMG}/side-view-man-charging-his-car-min-scaled.webp`,
    status: "open",
    grantAmount: "75% of cost, up to £500 per socket",
    grantDetails: [
      "£500 per socket for applications submitted from 1 April 2026 (previously £350)",
      "One grant per eligible vehicle and address",
      "Paid directly to your OZEV-authorised installer and deducted from your invoice",
    ],
    overview: [
      "This grant makes EV charging accessible for people living in rented homes or flats. With landlord or property manager approval, eligible residents can install a chargepoint wherever off-street parking is available.",
    ],
    eligibility: [
      "Reside in an owned flat (including shared ownership) or a rental property",
      "Have private, off-street parking accessible at all times",
      "Own or use an OZEV-approved electric or plug-in hybrid vehicle",
      "Have not previously installed a chargepoint at the address",
      "Live in an occupied UK residential property",
    ],
    ineligible: [
      "Owners of standalone houses (converted flats are acceptable)",
      "Renting a room in a shared home where a landlord or owner is also present",
      "Relocating or planning to move",
      "Have previously claimed this or a related grant at the address",
      "Properties where a chargepoint is legally mandated, or in the Channel Islands/Isle of Man",
    ],
    requirements: [
      "Parking space must be off-street, private, clearly defined, and accessible at all times",
      "You must legally own or be authorised to use the space, with supporting documentation",
      "Vehicle must be on the OZEV-approved list — registered owners, 6+ month leaseholders, company car assignees, salary sacrifice participants, and those with a vehicle on order all qualify",
    ],
    documentation: [
      "Renters: signed tenancy agreement, a recent utility bill (under 3 months), and written landlord permission",
      "Flat owners: a recent utility bill (under 3 months) and written freeholder permission",
      "Everyone: a dated installation quote from an OZEV-authorised installer",
      "Vehicles on order: order form documentation",
    ],
    applicationSteps: [
      "Contact an OZEV-authorised installer for a dated quote",
      "Gather the permissions and documentation listed above",
      "Apply via the GOV.UK Find a Grant platform with your property and vehicle details",
      "OZEV reviews your application and notifies you and your installer by email",
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
    tagline:
      "Support for landlords and property managers installing chargepoints across residential sites.",
    image: `${IMG}/Home-Charging-Image.jpg`,
    status: "closed",
    statusNote:
      "This scheme closed on 31 March 2026 and is no longer accepting new applications. Details are kept here for reference — get in touch and we'll help you find what's currently available.",
    grantAmount: "Was 75% of cost, up to £500 per socket",
    grantDetails: [
      "£500 per socket for applications from 1 April 2026 (previously £350)",
      "Landlords could claim up to 200 sockets per year across eligible properties",
      "Paid directly to the OZEV-authorised installer, deducted from the invoice",
    ],
    overview: [
      "This grant enabled residential landlords, right-to-manage companies, and social housing providers to install chargepoints across rented properties — improving tenant amenity and property value.",
    ],
    eligibility: [
      "Individual landlords with rental properties",
      "Right to manage (RTM) companies and residents' management companies (RMC)",
      "Freeholders of multi-unit properties",
      "Social housing providers, public sector organisations, and charities managing residential property",
      "Property factors (Scotland)",
    ],
    ineligible: [
      "Owner-occupants",
      "Holiday rental operators",
      "Organisations without company or VAT registration",
      "Mandatory installations (planning conditions, new builds)",
      "Properties in the Channel Islands, Isle of Man, or still under construction",
    ],
    requirements: [
      "Parking must be off-street, private, and clearly defined",
      "Accessible to tenants at all times, owned by the applicant or with legal usage rights granted",
      "Applicants needed to complete electrical supply upgrades, arrange maintenance, and update fire safety risk assessments before applying",
    ],
    documentation: [
      "All applicants: an installation quote from an OZEV-authorised installer",
      "Freeholders of multi-unit properties: Land Registry title confirming freehold status",
      "Private landlords/charities: a current, dated insurance policy showing rental status",
      "RMC/RTM companies: Companies House verification and appointment documentation",
      "Public sector/social housing: quote only, no further documentation required",
    ],
    applicationSteps: [
      "Obtain quotes from OZEV-approved installers",
      "Confirm installation scope and select an eligible chargepoint model",
      "Gather the required documentation for your organisation type",
      "Apply via the GOV.UK Find a Grant platform",
      "Receive OZEV approval notification",
      "Installer completes the work and submits the claim with photos and invoice",
    ],
    resources: [
      {
        label: "Scheme details on GOV.UK",
        href: "https://www.find-government-grants.service.gov.uk/grants/electric-vehicle-chargepoint-and-infrastructure-grants-for-landlords-1",
      },
      ...govResources,
    ],
  },
  {
    slug: "workplace-charging-scheme",
    audience: "Businesses, Charities & Public Sector",
    title:
      "Workplace Charging Scheme — Electric Vehicle Chargepoint Grant for Businesses, Charities and Public Sector",
    tagline:
      "Enable your organisation to install EV chargepoints at reduced cost.",
    image: `${IMG}/pexels-kindelmedia-9800036-scaled.webp`,
    status: "open",
    grantAmount: "75% of cost (incl. VAT), up to £500 per socket",
    grantDetails: [
      "£500 per socket for installations from 1 April 2026 (previously £350)",
      "Up to 40 sockets per applicant across all sites, capped at £20,000 total",
      "Voucher-based — the voucher is valid for 180 days from issue",
    ],
    overview: [
      "The Workplace Charging Scheme is a government grant administered by OZEV and DVLA that provides eligible organisations with support towards the upfront cost of purchasing and installing EV chargepoints at their sites.",
    ],
    eligibility: [
      "Businesses, including SMEs and sole traders",
      "Charities",
      "Public sector organisations — councils, NHS, armed forces, emergency services",
      "Small accommodation businesses — hotels, B&Bs, guest houses",
    ],
    ineligible: [
      "Sites outside England, Wales, Scotland or Northern Ireland",
      "Non-designated or customer-only parking",
      "Unbuilt parking facilities or domestic property parking (unless it's the primary workplace)",
      "Sites already claimed under this scheme or the EVHS/Domestic Recharging Scheme",
      "Installations mandated by Part S Building Regulations or planning conditions",
    ],
    requirements: [
      "You must own the property or have written landlord consent",
      "Dedicated off-road parking clearly associated with the premises, for staff or fleet use",
      "A pre-installation survey by an authorised installer is required",
      "Businesses: staff/fleet use during working hours only. Public authorities, charities and accommodation providers have no usage restriction, but must comply with the Public Chargepoint Regulations 2023 if offering public access",
    ],
    documentation: [
      "Companies House registration number and VAT registration number",
      "A business rate bill from your local council",
      "Charities: Charity Commission registration or a principal regulator letter",
      "NHS surgeries and schools: matching organisational email domain plus registration evidence",
    ],
    applicationSteps: [
      "Confirm organisational and site eligibility, then arrange a site survey with an OZEV-authorised installer",
      "Select an eligible chargepoint model",
      "Apply online with your organisation details, site address(es), socket quantity and evidence",
      "Receive a voucher code by email within 5 working days",
      "Share the voucher with your installer — do not start work before the voucher is issued",
      "Installer completes the work within 180 days and submits the claim with photos and invoice",
    ],
    resources: [
      {
        label: "Apply for a workplace voucher",
        href: "https://apply-workplace-chargepoint-grant.service.gov.uk/",
      },
      ...govResources,
    ],
  },
  {
    slug: "education-institutions",
    audience: "State-Funded Education Institutions",
    title:
      "Workplace Charging Scheme for State-Funded Education Institutions",
    tagline:
      "Support your institution's transition to electric mobility with dedicated chargepoint funding.",
    image: `${IMG}/indra-smart-pro-tethered-in-situ-4.webp`,
    status: "open",
    grantAmount: "75% of cost (incl. VAT), up to £2,000 per socket",
    grantDetails: [
      "£2,000 per socket from 1 April 2026 (previously £2,500, if the voucher is redeemed by 30 September 2026)",
      "Up to 40 sockets available across all sites, per institution",
      "Voucher-based — valid for 180 days from issue",
    ],
    overview: [
      "A government voucher-based grant administered by OZEV and DVLA, supporting state-funded educational institutions installing EV chargepoints.",
    ],
    eligibility: [
      "State-funded primary and secondary schools",
      "State-funded sixth form and further education colleges, and nurseries",
      "Academies and free schools within academy trusts (multi-academy trusts apply separately per institution)",
      "England, Wales, Scotland and Northern Ireland (excludes Channel Islands and Isle of Man)",
    ],
    ineligible: [
      "Independent (non state-funded) schools",
      "Parking not designated for the institution, or unbuilt parking facilities",
      "Chargepoints already claimed under another scheme",
      "Installations mandated by building regulations",
    ],
    requirements: [
      "Minimum 3kW power supply per socket, undiminished under simultaneous use",
      "Maximum one socket per parking space",
      "Installation to British Standards (BS 8300, BS EN 61851, BS 7671) by an OZEV-authorised installer",
    ],
    documentation: [
      "Institution or SEED reference number",
      "Number of chargepoints needed and number of installation sites",
      "Installer name and OZEV registration",
      "Two institutional contacts with matching email domains",
    ],
    applicationSteps: [
      "Complete the online application via the GOV.UK guidance page",
      "Receive a unique voucher code within 5 working days",
      "Share the voucher code with your OZEV-authorised installer",
      "Installer completes the work within the 180-day window",
      "Installer submits the claim with a cost breakdown and installation photos",
      "OZEV pays the installer directly",
    ],
    resources: [
      {
        label: "Apply on GOV.UK",
        href: "https://www.gov.uk/guidance/workplace-charging-scheme-for-state-funded-education-institutions",
      },
      ...govResources,
    ],
  },
  {
    slug: "on-street-parking",
    audience: "Households with On-Street Parking",
    title:
      "Electric Vehicle Chargepoint Grant for Households with On-Street Parking",
    tagline: "No driveway? No problem.",
    image: `${IMG}/freepik__the-style-is-candid-image-photography-with-natural__60490.jpeg`,
    status: "open",
    grantAmount: "75% of cost, up to £500 per socket",
    grantDetails: [
      "Requires a permanent cross-pavement solution (cable channel or ducting) installed alongside the chargepoint",
      "The grant does not entitle you to a reserved parking space on the public highway",
      "Cross-pavement solution costs are not covered by the grant itself",
    ],
    overview: [
      "For households without private off-street parking, this scheme covers 75% of the combined cost of the chargepoint and its installation — paired with a permanent, council-approved cross-pavement cable solution.",
    ],
    eligibility: [
      "Own or rent the residential property and live there",
      "Lack private, exclusive off-street parking (no driveway, garage or car park)",
      "Have lawful on-street parking available without compromising traffic safety",
      "Own or be responsible for an eligible battery electric or plug-in hybrid vehicle (PHEV under 50g/km CO₂)",
      "Located in England, Wales, Scotland or Northern Ireland",
    ],
    ineligible: [
      "Already have a chargepoint installed, or have claimed this grant or its predecessors (EVHS/Domestic Recharge Scheme)",
      "Relocating, or seeking to replace/upgrade an existing chargepoint",
      "Have private off-street parking access",
      "Not willing to install a permanent cross-pavement solution",
    ],
    requirements: [
      "The cross-pavement solution must be permanent — temporary cable covers or mats are not eligible",
      "Written consent from your local highways authority is mandatory before applying, and planning permission may also be required",
    ],
    documentation: [
      "Written consent from landlords, freeholders, managing agents or private road owners, where applicable",
      "Local highways authority (LHA) consent evidence for the cross-pavement installation",
      "A dated quote from an OZEV-authorised installer",
    ],
    applicationSteps: [
      "Secure any third-party permissions needed (landlord, freeholder, managing agent)",
      "Get a quote from an OZEV-approved installer",
      "Apply to your local highways authority for cross-pavement consent",
      "Create an account on the GOV.UK Find a Grant platform and apply, uploading your LHA consent evidence",
      "Wait for OZEV's eligibility notification — do not install before this arrives",
      "Proceed with installation once approved",
      "Installer submits the claim with photos and invoice",
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
];

export function getGrantScheme(slug: string) {
  return grantSchemes.find((scheme) => scheme.slug === slug);
}
