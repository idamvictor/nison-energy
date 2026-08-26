export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  tags: string[];
  bodyMarkdown: string;
};

// Real articles crawled from the previous Ocunio Energy site's blog and
// rebranded for Nison Energy — internal CTAs point at our real routes,
// ads/newsletter widgets/related-post carousels/social-share blocks were
// stripped since they weren't article content, and the actual editorial
// text is preserved as written.
export const blogPostsSeed: BlogPost[] = [
  {
    slug: "work-from-home-you-could-claim-500-towards-an-ev-charger",
    title: "Work From Home? You Could Claim £500 towards an EV Charger",
    excerpt:
      "The Workplace Charging Scheme is usually pitched at offices and fleet yards — but if your home is your registered place of business, you can often claim too.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2026/06/image-3.jpeg",
    author: "Nison Energy",
    publishedAt: "2026-06-09",
    tags: ["Workplace Charging Scheme", "OZEV Grants", "Home Business"],
    bodyMarkdown: `If you're a contractor, sole trader or director running your business from home, there's a government grant with your name on it that you've probably been told doesn't apply to you. The [Workplace Charging Scheme (WCS)](https://www.find-government-grants.service.gov.uk/grants/workplace-charging-scheme-2) is usually pitched at offices, warehouses and fleet yards — so most people working from a home office assume it's not for them. In a lot of cases, they're wrong.

Get the details right and you can claim **£500 per socket** off the cost of installing an EV charger at home, treated as your place of work. With the van or company car charging on your own driveway overnight on a cheap tariff, the maths starts looking very good. Here's how it works.

## Can a home-based business really claim?

Yes — and this is written into the official OZEV guidance, not a loophole. If your primary place of work is also your home, you can apply under the WCS, provided you meet a specific set of conditions. The key is that your home address has to be recognised as a business address, and the charger has to be the right type.

**You qualify if all of these are true:**

- Your home is your primary place of work, AND your address is either listed as your place of business with Companies House, or recorded on your business (non-domestic) rate bill from your local council or Land and Property Services (LPS).
- You have off-road parking (a driveway, garage or similar — not on-street).
- You use an OZEV-authorised installer.
- You choose a chargepoint approved for BOTH residential and commercial use.

> **The mistake that gets claims declined.** If you fit a residential-only chargepoint, your claim will be refused — even if everything else is correct. The unit must be on the OZEV list as eligible for both residential and commercial use. This single detail trips up more home-business applicants than anything else, which is exactly why using the right installer matters.

One thing worth being honest about: simply having a company doesn't automatically make your home eligible. The address genuinely has to be registered as your place of business, and you genuinely need off-road parking. If you tick those boxes, though, the grant is open to you.

## Who this is perfect for

This route tends to suit people who run a real business from home and rely on a vehicle to do it:

- **Tradespeople** — electricians, plumbers, builders, decorators and gardeners running a van from a home base.
- **Mobile and field-based contractors** — anyone whose company car is core to the job, from surveyors to mobile groomers.
- **Consultants and directors** — limited company owners registered at their home address who drive to clients.
- **Sole traders and freelancers** — those whose home is recorded as the business address on official records.

## How much you can claim

From 1 April 2026 the WCS pays **£500 per socket** (up from £350), covering up to 75% of the total purchase and installation cost including VAT — whichever is lower. The scheme has been extended for a final year and runs until 31 March 2027. [See the latest changes on GOV.UK](https://www.gov.uk/guidance/workplace-charging-scheme-guidance-for-installers).

For a typical home installation, that £500 makes a real dent. And because the charger lives on your driveway, you can plug in overnight on an off-peak EV tariff — usually far cheaper than public charging — so the savings keep stacking up long after the grant is spent.

## Bonus: employers can install at an employee's home too

There's a second, less well-known route. If you employ someone who drives a company vehicle but can't charge it at your workplace, you (as the employer) can install a chargepoint at that employee's home under the WCS.

The extra step here is evidence: you'll need to provide DVLA with a letter confirming the employee works for you and that you have permission to install the chargepoint. The application still goes through the standard WCS portal in the usual way.

## How to apply — step by step

1. **Check your address is registered.** Confirm your home is listed as your place of business with [Companies House](https://www.gov.uk/government/organisations/companies-house), or appears on a non-domestic rate bill.
2. **Book a free site survey.** We check your off-road parking and electrical supply, and confirm you're eligible before anything is ordered.
3. **Choose a dual-use chargepoint.** We only spec units approved for both residential and commercial use, so your claim won't be declined on a technicality.
4. **We handle the WCS application and installation.** As an OZEV-authorised installer we submit the claim through the official portal and fit your charger.
5. **Pay only the net cost.** The £500 per socket is deducted from your invoice — you never chase the grant yourself.

Not sure if your home setup qualifies? That's the most common question we get from contractors — and it usually takes us five minutes to answer. [Book a free, no-obligation check](/contact-us) and we'll tell you straight whether the Workplace Charging Scheme works for your home business, and what it'll cost after the grant.`,
  },
  {
    slug: "ozev-ev-charger-grants-have-just-got-bigger",
    title: "OZEV EV Charger Grants Have Just Got Bigger",
    excerpt:
      "From 1 April 2026 the grant rate jumped to £500 per socket across both the Workplace Charging Scheme and the Residential Landlord Chargepoint Grant — here's what that means in practice.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2026/06/image-1.jpeg",
    author: "Nison Energy",
    publishedAt: "2026-06-09",
    tags: ["OZEV Grants", "Workplace Charging Scheme", "Landlords"],
    bodyMarkdown: `## Introduction

What the £500-per-socket increase means for businesses and residential landlords in 2026.

From 1 April 2026, the grant rate jumped to £500 per socket across both the Workplace Charging Scheme and the Residential Landlord Chargepoint Grant — a 43% rise on the old £350 rate. Both schemes are confirmed to run until 31 March 2027, so there's a clear window to take advantage.

In this guide we'll walk through both schemes: who qualifies, how much you can claim, real-world cost examples, the chargers we recommend, and exactly how to apply. If you only deal with one side of this — workplace or rental property — feel free to skip ahead to the part that's relevant to you.

## Part 1 — The Workplace Charging Scheme

For businesses, charities and public-sector organisations. You can claim up to **£500 per socket, across a maximum of 40 sockets, up to £20,000 in total per business.**

If your business hasn't yet installed EV charge points for staff or fleet vehicles, this is the best moment in years to act. The Workplace Charging Scheme (WCS) has been meaningfully upgraded, and the new rates make a strong case for booking before the scheme closes on 31 March 2027.

**Grant rate increased.** From 1 April 2026 the WCS pays £500 per socket, up from £350. Any installation completed on or after that date automatically qualifies for the higher rate — regardless of when you first applied.

### How much is the grant worth?

The headline figure is **£20,000 per UK business** — that's £500 per socket across up to 40 sockets. It's applied as a voucher discount, so your approved installer simply deducts it from your invoice and recovers it from OZEV directly. You never have to claim anything back yourself.

The grant covers up to **75% of the total purchase and installation cost (including VAT)**. Whichever is lower — the 75% cap or the £500-per-socket cap — is the figure that applies.

### Who qualifies?

- Registered UK businesses of any size — sole traders, SMEs, including small accommodation businesses and large enterprises
- Charities and public-sector organisations
- You need dedicated off-street parking — staff bays, fleet bays or a customer car park
- You must use an OZEV-authorised installer (Nison Energy is authorised)
- Charge points must be available to staff or fleet vehicles, not reserved for a single director
- Available across England, Wales, Scotland and Northern Ireland

### What it looks like in practice

**A small office — 6 sockets.** Six Hypervolt Home Pro 3 chargers, fully installed, come to around £8,500. The grant knocks off £3,000 (6 × £500), leaving a net cost of £5,500.

**A fleet depot — 20 sockets.** Twenty Easee Max chargers with load balancing and groundwork run to about £30,000. The grant covers £10,000 (20 × £500), bringing the net cost down to £20,000.

### OZEV-approved chargers for the workplace

A few units we install regularly, depending on the setting:

- **Hypervolt Home Pro 3 (up to 7.4kW)** — ideal for offices and staff parking. Wi-Fi, Ethernet and Bluetooth connectivity, solar-integration ready, Alexa voice control, IP66 weatherproof, and no earth rod required.
- **Ohme Home Pro (up to 7.4kW)** — best for smart-tariff users. Interactive LCD screen, Octopus Agile and Intelligent compatible, Type 2 tethered (5m or 8m) and all-tariff smart integration.
- **Ohme ePod (up to 7.4kW)** — a strong entry-level smart option. Built-in 4G and Wi-Fi with no SIM needed, tariff-optimised auto-charging, a carbon-intensity eco mode and a compact, minimalist design.
- **Easee Max Charge Multiphase (7–22kW, three-phase)** — built for fleet depots. Ultra-fast 22kW three-phase charging, dynamic load balancing, 4G / Wi-Fi / RFID management, IP54 weatherproofing and over-the-air updates.

### How to claim the WCS grant

1. **Book a free site survey.** We assess your parking, electrical supply and requirements — no obligation.
2. **We register with OZEV before installation.** As your approved installer we submit the project, and OZEV issues vouchers valid for six months.
3. **Installation.** We fit your chosen charge points on a date that suits your business.
4. **We submit the evidence pack.** Photos, invoices and business registration — we handle all the documentation with OZEV.
5. **Grant deducted from your invoice.** OZEV pays us; you pay only the net figure. The typical timeline is four to eight weeks from survey to completion.

## Part 2 — The Residential Landlord Chargepoint Grant

For private residential landlords. You can claim up to **£500 per socket, across up to 200 grants per financial year, worth as much as £100,000 in annual funding.**

The Residential Landlord Chargepoint Grant is one of the most generous EV schemes still on the table. It lets you claim up to £500 per socket across up to 200 of your rental properties every financial year — turning EV charging into a genuinely affordable upgrade. And it's an upgrade that tends to command higher rents and attract tenants who are actively searching for properties with charging.

**Grant rate increased.** From 1 April 2026 this grant also pays £500 per socket, up from £350. If you applied before that date, you can re-apply to receive the higher rate (tell your installer first). The scheme has been extended until 31 March 2027 — see the GOV.UK landlord customer guidance.

> **Watch out — some grants have closed.** The Residential Landlord Infrastructure Grant and the Commercial Landlord Grant both closed on 31 March 2026. Only the Residential Landlord Chargepoint Grant remains open, and applications now go through the government's Find a Grant platform. Do not install the charger before OZEV confirms your eligibility.

### How much is the grant worth?

You can claim **£500 per socket, or 75% of the total purchase and installation cost — whichever is lower**. This applies to up to 200 sockets per financial year, across any number of residential properties you let, which adds up to as much as £100,000 in annual funding.

A handy detail: a dual-socket charger counts as two sockets, so a single dual-socket unit at one property attracts £1,000 in grant funding. Roll that out across 10 properties and you're looking at £10,000 back off your installation costs.

### Who qualifies?

- Private residential landlords — individuals, companies, management companies, charities and housing associations
- You must be registered with Companies House or VAT-registered with HMRC
- Properties must be residential and let to tenants (commercial landlord grants have closed)
- Each property needs dedicated off-street or allocated parking
- You must use an OZEV-approved installer — Nison Energy is authorised
- You must install an OZEV-approved smart chargepoint
- The chargepoint must be installed after eligibility is confirmed — never before

### What does the grant cover?

The grant covers the charger hardware (purchase and delivery), installation labour and materials, associated cabling and electrical work, and DNO application fees where they apply. It does **not** cover infrastructure-only works (that route closed in March 2026), ongoing electricity costs, or signage.

### What it looks like in practice

**A single rental property — 1 socket.** An Ohme ePod 7.4kW smart charger, installed, costs around £900. The grant takes off £500, leaving a net cost of £400.

**A portfolio of 10 properties — 10 sockets.** Ten Ohme Home Pro chargers, installed across the portfolio, come to about £9,000. The grant covers £5,000 (10 × £500), bringing the net cost down to £4,000.

> "In 2026, tenants are actively filtering Rightmove for 'EV charging'. Installing a charger future-proofs your rental income and reduces void periods — and right now the government pays half the cost."
>
> — Nison Energy landlord analysis, May 2026

### Recommended chargers for rental properties

- **Ohme ePod (up to 7.4kW)** — great for a single rental property. Built-in 4G and Wi-Fi with no SIM needed, tariff-optimised auto-charging, tenant-friendly app control and a compact, unobtrusive design.
- **Ohme Home Pro (up to 7.4kW)** — well suited to longer-term tenants. Interactive LCD screen, compatible with all energy tariffs, Type 2 tethered (5m or 8m) and built-in safety protection.
- **Hypervolt Home Pro 3 (up to 7.4kW)** — ideal for HMOs and solar properties. Built-in solar integration, Wi-Fi / Ethernet / Bluetooth, IP66 weatherproofing and no earth rod required.

### How the application process works (from 1 April 2026)

The process changed on 1 April 2026. The old OZEV portal has been replaced for landlord grants by the government's Find a Grant platform — and importantly, you now apply directly, rather than through your installer.

1. **Book a free site survey with Nison Energy.** We confirm the property is suitable, recommend the right charger and prepare a dated quote — now required as part of the application.
2. **Apply via Find a Grant before installation.** Create an account on the government platform and upload your evidence: proof of landlord status (Companies House or VAT registration), a tenancy agreement, proof of parking, and our dated quote.
3. **Wait for OZEV approval (up to 10 working days).** Do not begin installation before you receive confirmation. If the charger goes in before approval, the grant may be refused.
4. **We carry out the installation.** Once you're approved, we fit your chosen chargepoint and handle all electrical work, commissioning and testing.
5. **Grant deducted from your invoice.** The £500 per socket is applied directly to your invoice, so you pay only the net cost. Repeat across your portfolio, up to 200 sockets per financial year.

## At a glance — Workplace vs Residential Landlord

| | Workplace Charging Scheme | Residential Landlord Grant |
|---|---|---|
| Grant rate (from Apr 2026) | £500 per socket | £500 per socket |
| Maximum sockets | 40 across all sites | 200 per financial year |
| Maximum total funding | £20,000 per business | £100,000 per year |
| Who applies | Installer on your behalf | Landlord via Find a Grant |
| Suitable for | Businesses, charities, public sector | Private residential landlords |
| Scheme closes | 31 March 2027 | 31 March 2027 |

Add EV charging to your portfolio or workplace. [Book a free site survey](/contact-us) and we'll handle the OZEV quote preparation and full Find a Grant application support.`,
  },
  {
    slug: "why-ev-charging-adds-value-to-your-property-and-how-to-make-it-pay",
    title: "Why EV Charging Adds Value to Your Property — and How to Make It Pay",
    excerpt:
      "Rightmove and Zoopla are both tracking a surge in demand for EV charging. Here's what it does to your property's value, and how a networked charger can pay for itself.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2026/06/id-1.jpg",
    author: "Nison Energy",
    publishedAt: "2026-06-09",
    tags: ["Property", "Landlords", "EV Charging"],
    bodyMarkdown: `Not long ago, an EV charge point was a curiosity on a property listing. Today it's fast becoming something buyers and tenants look for by name — and the property portals have noticed. Whether you own your home, let it out, or manage a commercial site, a well-chosen charge point is now one of the more sensible upgrades you can make. Here's what the data says, and how the right setup can actually earn its keep.

## The demand is real — and the portals are tracking it

The clearest signal comes from the two biggest UK property platforms. Rightmove found that the number of homes listed for sale mentioning an electric car charging point jumped more than five-fold in a single year, and predicted charging would keep climbing buyers' priority lists. Demand has only grown since.

Zoopla has gone a step further. In 2025, it became the first major UK portal to add a dedicated EV charging search filter — letting house-hunters screen for homes with a fitted or pre-wired charger, a suitable driveway, or nearby public charging. The fact that a portal built a filter for it tells you charging is now a mainstream search criterion, not a niche one.

The research behind that launch is striking: 40% of UK drivers say proximity to charging will influence where they move next, and a third say poor charging access would put them off a property altogether — rising to 84% among drivers who already own an EV. For landlords and sellers, that's a sizeable slice of the market you can either win or lose on this one feature.

> **The opportunity hiding in plain sight.** Zoopla's own analysis found only around 1.6% of listings explicitly mention EV charging. If your property has it and you say so clearly, you stand out from almost everyone else on the market.

## What it does to your property's value

Putting an exact figure on it is tricky, and reputable sources are careful to say so. The most widely cited estimate, referenced by Zoopla, comes from the National Association of Property Buyers: a home charge point could add "up to £5,000" to a property's value, against a typical installed cost of around £1,000. Even treating that as a ceiling rather than a promise, the economics are attractive — particularly once a grant reduces the upfront cost.

For landlords, the case is less about resale and more about lettability: a charge point widens your pool of prospective tenants, supports a higher rent, and helps reduce void periods when EV-driving tenants are actively filtering for it. For commercial sites, charging strengthens lease appeal and feeds into green building credentials.

## From cost to income: making your charge point pay

Here's the part many property owners miss. A modern, networked charge point isn't just an amenity — it can be a small revenue stream. With the right management software you can charge users a fair price per session, recover your electricity costs, and keep full visibility of who used what.

This is where an app-based platform like Monta comes in. Monta is an EV charging software platform that sits on top of your hardware and handles the things that turn a charger into a manageable asset: setting prices, taking payment, and reporting on usage. A few features that matter for property owners:

- **Set your own pricing** — charge by the kWh, by time, or a flat fee, and use dynamic pricing that tracks your actual electricity cost hour by hour so you're never charging at a loss.
- **Take payment from anyone** — drivers can pay in the Monta app, and with app clips they can charge and pay without even downloading it.
- **Reimburse tenants or staff** — employers can reimburse employees for home or on-site charging, which is useful for mixed residential and workplace setups.
- **Smart, cheaper charging** — schedule charging for times when electricity is cheapest, greenest, or both.

**A simple worked example.** Say you're a landlord with a charge point at a let property. You connect it to the Monta app and set a per-kWh price a few pence above your tariff. Your tenant taps to start a charge, pays automatically, and you see every session and your margin in one dashboard — no chasing, no spreadsheets. The charger covers its own running costs and chips away at the install cost, while making the property more attractive to the next tenant.

## Bring the cost down with a grant

Whatever your situation, there's likely a grant that cuts the upfront cost by up to 75%. Businesses, charities and public-sector organisations can use the Workplace Charging Scheme (£500 per socket, up to 40 sockets and £20,000 per business). Private residential landlords can claim through the Residential Landlord Chargepoint Grant (£500 per socket, up to 200 sockets a year). Both schemes run until 31 March 2027 — we break down the eligibility and application steps in full in our [dedicated OZEV grants guide](/ozev-grants).

## Getting started with Nison Energy

The picture from Rightmove and Zoopla is consistent: charging is moving from nice-to-have to expected, it supports property value, and it can be set up to pay for itself over time. The buildings that get ahead of this will be the easier ones to sell, let and lease.

As an OZEV-approved installer, Nison Energy handles the whole journey: a free site survey, the right hardware for your property, software setup with platforms like Monta, the grant paperwork, and a clean certified installation.

Ready to add charging — and make it work for you? [Book a free, no-obligation site survey](/contact-us) and we'll map out your options, including every grant you qualify for and how to turn your charger into an income stream.`,
  },
  {
    slug: "the-2026-ev-explosion-your-energy-independence",
    title: "The 2026 EV Explosion & Your Energy Independence",
    excerpt:
      "25% of global car sales are now electric. Here's what's happening right now across charging speeds, home energy freedom, infrastructure and the 2025/26 grants.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2026/04/i3nnin.jpg",
    author: "Nison Energy",
    publishedAt: "2026-04-21",
    tags: ["EV Industry", "Home Charging", "OZEV Grants"],
    bodyMarkdown: `2026 isn't just another year for electric vehicles — it's the year the industry hits hyper-drive. From the streets of London to the highways of Europe, the landscape of mobility is shifting beneath our wheels. Here is what's happening right now in the world of e-mobility.

## 1. The Big Picture: We've Hit the Tipping Point

Did you know that 25% of global car sales are now electric? This isn't just a trend; it's a historical shift in how the world moves. As fossil fuel dominance fades, infrastructure is racing to keep up.

## 2. Charging: It's About "Energy Freedom"

Recent industry reports highlight a major shift: EV owners are no longer just "drivers" — they are "energy managers." With the rise of bidirectional charging (V2H/V2G), your car is becoming a backup battery for your home. Home charging is evolving from a simple plug into an intelligent energy ecosystem that integrates with solar and smart grids to save you money while you sleep.

[Browse our range of home chargers](/home-charging).

## 3. The Infrastructure Revolution

Industry reports are showing a massive surge in ultra-rapid charging hubs. The standard is moving from 50kW to 150kW–400kW corridors, ensuring that long-distance travel is as seamless as a petrol stop. For businesses, the focus has shifted to scalable fleet electrification, with smart load balancing now a requirement rather than a luxury.

BYD is set to transform the electric-vehicle charging landscape in the UK with the launch of its dedicated charging network. The Chinese automotive giant is rolling out stations under its "Flash" brand, powered by its proprietary flash-charging technology — capable of delivering an impressive 1,500 kW. To put that in perspective, even the most powerful public EV chargers currently available rarely surpass 350 to 400 kW, making BYD's offering a dramatic leap forward for charging speeds.

## 4. Financial Boosts: The 2025/26 Grants Are Here

Cost is often the biggest barrier to going electric, but the UK government is making it easier. Between the UK Electric Car Grant (saving you up to £3,750) and the ongoing OZEV grants for charger installations, the financial math for EVs has never looked better.

- [Save up to £3,750 on your next EV](/blog/uk-electric-car-grant-2025-save-up-to-3750-on-your-next-ev)
- [Slash your installation costs with OZEV](/ozev-grants)
- [View official eligibility on the GOV.UK EV Grant page](https://www.gov.uk/electric-vehicle-grant)

## 5. Mastering the Day-to-Day: Charging & Equipment

Transitioning from petrol to electric requires a change in habits. We've broken down the how-to of ownership — from deciding between home charging and public hubs, to why the quality of your cable matters.

- [The guide to electric car charging and ownership](/blog/guide-to-electric-car-charging-and-ownership)
- [Why ZEV charging cables stand out](/blog/choosing-the-right-ev-charging-cable-why-zev-cables-stand-out)

## Are You Ready for the 2026 Surge?

Whether you're a homeowner looking for energy independence or a business scaling your fleet, the right installation is the foundation of your EV journey.`,
  },
  {
    slug: "ozev-ev-charge-point-grants-key-changes-for-2026-27",
    title: "OZEV EV Charge Point Grants: Key Changes for 2026/27",
    excerpt:
      "Five grant schemes have been extended until 31 March 2027 with new, higher rates, while three grants close permanently at the end of March 2026. Here's what's changing.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2025/06/Picture89.jpg",
    author: "Nison Energy",
    publishedAt: "2026-03-30",
    tags: ["OZEV Grants", "Policy Update"],
    bodyMarkdown: `The Office for Zero Emission Vehicles (OZEV) has announced significant updates to its home and workplace charge point grant schemes. Five grant schemes have been extended until 31 March 2027 with new grant rates, while three grants will close permanently at the end of March 2026. The aim is to simplify the system and make it easier for households and businesses to access support.

## What's Continuing Until March 2027

The following grants remain open for a final year:

**For homes:**
- Flats & Renters grant
- Residential Landlord charge point grant
- Households with On-Street Parking grant

**For workplaces:**
- Workplace Charging Scheme (WCS)
- Workplace Charging Scheme for State-Funded Education Institutions

## What's Closing on 31 March 2026

Three grants will not be renewed. The last date to apply is 31 March 2026 for:

- Staff & Fleets grant
- Residential Landlord infrastructure grant
- Commercial Landlord charge point grant

Installers should note that even if claims are submitted on the closing date of 26 May 2026, there will be time for at least two resubmissions if installers respond promptly to requests. The final deadline for resubmissions is 6 July 2026.

## New Grant Rates from 1 April 2026

The maximum grant rate for continuing home and workplace schemes will increase from £350 to £500 per socket. For the Workplace Charging Scheme specifically, businesses will be eligible for up to £500 per socket for installations completed from 1 April 2026, regardless of when they originally applied. So there's no need to cancel and reapply.

The exception is state-funded education institutions: the WCS grant for this group will decrease from £2,500 to £2,000 per socket from 1 April 2026. However, applications made before that date remain eligible for £2,500 per socket if vouchers are redeemed before 30 September 2026.

## A New Application Platform

From 1 April 2026, new applications for the Flats & Renters and Residential Landlord grants will be made on the government's Find a Grant platform, replacing the current portal. Customers who have already applied and wish to access the higher £500 rate can reapply from 1 April — their existing application will be cancelled and the new one assessed. Charge point installation must not take place before OZEV confirms eligibility.

## Tightened Evidence Requirements

From 1 April 2026, new evidencing requirements apply to the Flats & Renters and Residential Landlord grant schemes. Installers will need to submit additional photos with claims, including a close-up of the charge point, a photo showing the model and serial number, a shot of the charge point and its associated parking space, and a wide-angle view of the building. Customers will need to provide a dated quote from their installer, and depending on their circumstances, supporting documents such as a utility bill, tenancy agreement, landlord permission, or Land Registry title.

Full guidance is available on our [OZEV grants page](/ozev-grants).

## Key Dates at a Glance

| Date | Event |
|---|---|
| 31 March 2026 | Last day to apply for closing grants |
| 1 April 2026 | New grant rates + Find a Grant platform launches |
| 26 May 2026 | Last day for installers to claim closing grants |
| 6 July 2026 | Final deadline for claim resubmissions |
| 31 March 2027 | End of all remaining OZEV grant schemes |

If you have questions or need support navigating the new requirements, it's worth [contacting Nison Energy](/contact-us) ahead of the April deadlines.`,
  },
  {
    slug: "guide-to-electric-car-charging-and-ownership",
    title: "Guide to Electric Car Charging and Ownership",
    excerpt:
      "From home charging tariffs and cable types to connector standards, battery health and today's OZEV grant rates — a complete walkthrough of EV ownership.",
    coverImage: "https://ocunioenergy.com/wp-content/uploads/2026/03/image-2.jpeg",
    author: "Nison Energy",
    publishedAt: "2026-03-10",
    tags: ["EV Ownership", "Home Charging", "OZEV Grants"],
    bodyMarkdown: `Filling up with fuel is simple, but charging an electric car (EV) requires a bit more thought and planning. While different connectors and apps can seem complex, this guide aims to simplify the process.

## Charging at Home

Charging at home is the most convenient and typically the cheapest way to keep your vehicle topped up. It is often compared to having your very own petrol station at your front door.

**Benefits:**

- **Convenience** — pull up to your house, schedule, plug in, and forget about it.
- **Cost savings** — relying primarily on public rapid charging can increase your bill by around 70%.
- **Special tariffs** — home charging allows you to access EV-specific tariffs, like Intelligent Octopus Go, which can offer rates as low as 7p/kWh.
- **Smart control** — most home chargers allow you to start, stop, and schedule charges remotely via a smartphone app.

## EV Charger Types and Cables

Home chargers come in two main styles:

- **Tethered** — features a permanently attached cable.
- **Untethered** — features a socket for you to insert your own separate cable.

### Power and Speed

The speed of your charge depends on your home's power supply:

- **3-pin plug (2.3kW)** — "granny chargers" add approximately 7 miles of range per hour.
- **Single-phase (7.4kW)** — the most common UK home setup, adding about 30 miles of range per hour.
- **Three-phase (22kW)** — faster (90 miles per hour), but often costly to install in residential properties.

While a domestic socket works, a dedicated home charger is roughly three times faster. Most UK homes use single-phase power; upgrading to three-phase for faster 22kW charging can be costly.

Ensure your EV charging cable, whether tethered or untethered, is long enough to reach your vehicle without dragging on the ground. If purchasing a separate cable for an untethered charger, confirm it supports your home charger's maximum charging speed, which is typically indicated on the side of the cable. [Browse our cables](/accessories).

## Permissions and Costs

To install a home charger, your home must be a permanent structure. While driveways are ideal, solutions exist for those with off-street or on-street parking, though you should consult your local council for approval in on-street scenarios.

If you live in a rented property, you must obtain written permission from your landlord before installation. All owners must also get approval from their local Distribution Network Operator (DNO), a process usually handled by the installer. A typical installation costs between £800 and £1,200.

## Public and Workplace Charging

While home charging is the foundation, public and workplace infrastructure support longer journeys and commuters.

- **Workplace charging** — employers can use the Workplace Charging Scheme (WCS) to help fund the installation of up to 40 sockets, making commuting more viable for those living far away.
- **Public rapid chargers** — found at service stations, these units can provide an 80% charge in as little as 15 minutes. Major operators include Gridserve, BP Pulse, and Tesla.
- **Payment** — since late 2024, new public chargers over 8kW must offer contactless payment solutions, removing the need for multiple apps.

## EV Charge Connectors

While there is no single universal connector yet, the industry has largely standardised for modern vehicles.

- **Type 1** — chargers (SAE J1772) are 5-pin, single-phase AC connectors primarily used for older, Asian, or imported electric vehicles in the UK, such as early Nissan Leafs and Mitsubishi Outlanders. They offer 3.7kW–7.4kW charging speeds and feature a manual latch.
- **Type 2** — the standard 7-pin connector for AC charging in the UK and Europe, suitable for home wall boxes and public slow/fast charging up to 22kW. Features a 7-pin design with locking pins for safety and is compatible with most modern EVs, including Tesla, VW, and Kia.
- **CCS** — the Combined Charging System (specifically CCS Combo 2) is the standard rapid charging method for most new EVs in the UK. It combines AC and DC charging in one plug, delivering up to 350kW, making it ideal for motorway services and public rapid charging.
- **CHAdeMO** — a rapid DC connector (up to 50kW–100kW+), primarily used in the UK for older Nissan Leaf, Mitsubishi Outlander PHEV, and Kia Soul EV models.

## Maximising Range and Battery Health

Most modern EVs offer a range of 150 to 350 miles. To get the most out of your battery and ensure its longevity, consider these habits:

- **The 80% rule** — for daily use, set your charge limit to 80% to reduce battery wear. Save 100% charges for long trips.
- **Regenerative braking** — this feature converts kinetic energy into electricity while braking, flowing it back into the battery.
- **Preconditioning** — heat or cool your car while it is still plugged into the grid to save battery energy for driving.
- **Smooth driving** — avoid harsh acceleration to conserve range.

## How Much Does It Cost to Charge an EV at Home?

Charging an electric vehicle (EV) at home is generally the most cost-effective way to stay powered up. On average, a full charge can cost between £4 and £20, though this depends heavily on your vehicle's battery size, your specific energy tariff, and when you charge (peak vs off-peak hours).

In the UK, the average electricity price is around 27p per kWh. Based on this rate, fully charging a typical EV with a 60kWh battery would cost approximately £16–£18.

Many energy providers offer EV tariffs with significantly cheaper overnight electricity rates. Some tariffs drop to around 7p per kWh during off-peak hours. With one of these tariffs, charging the same 60kWh battery could cost as little as £4–£5 per full charge.

### Cost per mile

When charging at home, EV drivers typically spend:

- Off-peak tariffs — 2–3p per mile
- Standard electricity tariffs — 6–8p per mile

In comparison, a petrol car often costs 17–20p per mile in fuel. This means EV drivers charging at home can save over £1,000 per year compared to running a petrol vehicle.

## Electric Car Charging Points

[Zap-Map](https://www.zap-map.com/) offers a helpful mobile app that allows drivers to easily locate electric vehicle charging points across the UK. Most electric vehicles also feature built-in navigation systems that identify nearby charging stations and guide drivers to those within range. Some models go a step further by including route-planning tools that automatically map out charging stops for longer journeys.

## Financial Assistance (OZEV Grants)

The government provides financial support for installation via OZEV (formerly OLEV) — up to £500 per socket, or 75% off the cost of buying and installing EV charge points, for renters, flat owners and landlords, plus separate schemes for workplaces.

### OZEV Grants Available from 1 April 2026

| Applicant type | Grant (from 1 April 2026) |
|---|---|
| [Renters & Flat Owners](https://www.find-government-grants.service.gov.uk/grants/electric-vehicle-chargepoint-grant-for-renters-and-flat-owners-1) | £500 |
| [Residential Landlord Chargepoint Grant](https://www.find-government-grants.service.gov.uk/grants/electric-vehicle-chargepoint-and-infrastructure-grants-for-landlords-1) | £500 |
| [Households with On-Street Parking](https://www.find-government-grants.service.gov.uk/grants/electric-vehicle-chargepoint-grant-for-households-with-on-street-parking-1) | £500 |
| [Workplace Charging Scheme (WCS)](https://www.find-government-grants.service.gov.uk/grants/workplace-charging-scheme-2) | £500 |
| WCS for state-funded education institutions | £2,000 (reduced from £2,500) |

OZEV is also consolidating eight schemes down to five to simplify the system — the Commercial Landlord Grant, Residential Landlord Infrastructure Grant and Staff & Fleet Infrastructure Grant all close on 31 March 2026.

### New Find a Grant Service

When the new service opened on 1 April 2026, customers now register for a [Find a Grant account](https://www.find-government-grants.service.gov.uk/) and apply for the flats and renters grant directly, rather than being sent a link by their installer. Installers are notified by email when a claim is rejected, declined or approved. Initial assessment timescales are up to 10 working days.

At Nison Energy, our electricians are OZEV-approved, so we can take away the hard work from you and apply for a grant on your behalf. [See our full OZEV grants guide](/ozev-grants).`,
  },
  {
    slug: "uk-electric-car-grant-2025-save-up-to-3750-on-your-next-ev",
    title: "UK Electric Car Grant 2025: Save Up to £3,750 on Your Next EV",
    excerpt:
      "A £650 million Electric Car Grant offers discounts of up to £3,750 on eligible electric vehicles priced at or under £37,000 — here's who qualifies and what it means alongside home charging.",
    coverImage:
      "https://ocunioenergy.com/wp-content/uploads/2025/07/UK-Electric-Car-Grant-2025_blog-image.webp",
    author: "Nison Energy",
    publishedAt: "2025-07-30",
    tags: ["EV Grants", "Buying an EV"],
    bodyMarkdown: `The UK government has launched a game-changing initiative that could make electric vehicles more affordable than ever before. The new £650 million Electric Car Grant (ECG) offers discounts of up to £3,750 per car for eligible electric vehicles priced at or under £37,000, marking a significant step forward in making sustainable transport accessible to working families across the nation.

## What is the New Electric Car Grant?

The £650 million Electric Car Grant will back UK and other manufacturers, with eligibility dependent on the highest manufacturing sustainability standards. This isn't just about making EVs cheaper – it's about rewarding manufacturers who demonstrate genuine commitment to environmental responsibility throughout their production processes.

Car manufacturers can apply for the Electric Car Grant from 16 July 2025, meaning drivers could start seeing discounted vehicles at dealerships within weeks of the announcement. The funding will remain available until the 2028–2029 financial year, providing certainty for both manufacturers and consumers planning their EV transition.

## Who Benefits from the Electric Car Grant?

**Key eligibility criteria:**

- New electric vehicles priced at or under £37,000
- Vehicles from manufacturers with verified sustainability credentials
- Cars that meet government-defined emissions thresholds
- Available at the point of sale through participating dealers

Only cars costing less than £37k will qualify, ensuring the grant supports affordable electric mobility rather than luxury purchases. This price cap means the scheme directly targets the mass market, where cost barriers have been most significant.

## The Financial Impact: Real Savings for Real Families

With drivers citing upfront costs as a key barrier to adoption, the grant will narrow the upfront cost between petrol and electric vehicles, giving thousands more drivers access to savings of up to £1,500 a year in fuel and running costs compared to a petrol car.

**Combined savings opportunities:**

- Up to £3,750 immediate discount through the ECG
- £1,500 annual savings in fuel and running costs
- Preferential tax rates for EV owners
- When combined with salary sacrifice schemes, saving 20–50%, UK drivers can access unprecedented EV affordability

## Market Context: EVs Becoming More Accessible

Owning and buying an electric vehicle (EV) is becoming cheaper, with 2 in 5 of used electric cars sold at under £20,000 and 33 brand new electric cars available from under £30,000. More than 380,000 zero emission cars were registered last year, and the UK already holds the largest EV market in Europe, with sales up a fifth on the previous year.

## Industry Response

The automotive industry has responded positively to the grant announcement. Mike Hawes, SMMT chief executive, stated that "today's announcement of the return of government support for the purchase of electric vehicles is a clear signal to consumers that now is the time to switch." The SMMT estimates that discounts on EVs cost carmakers in the region of £4 billion in 2024, demonstrating the substantial investment manufacturers are already making.

## What This Means for Nison Energy Customers

As specialists in EV charging infrastructure, we understand that the transition to electric vehicles represents a crucial component of sustainable living. The new Electric Car Grant makes this transition more affordable, but it also increases the importance of having the right charging infrastructure at home.

**Key considerations:**

- Home charging becomes even more valuable with EV ownership
- Smart charging systems can maximise savings from time-of-use tariffs
- Solar panel integration with EV charging offers additional benefits
- Professional installation ensures safety and efficiency

## Timeline and Next Steps

**Key dates:**

- **16 July 2025** — manufacturers can begin applying for vehicle eligibility
- **Immediate** — discounted vehicles start appearing at dealerships
- **2028–2029** — funding available until the end of the financial year

**For consumers:**

1. Research eligible vehicles under £37,000
2. Check manufacturer's sustainability credentials
3. Consider combined savings with salary sacrifice schemes
4. Plan charging infrastructure needs
5. Monitor dealer announcements for available discounts

## Maximising Your EV Investment

The new Electric Car Grant creates unprecedented opportunities for UK drivers to access affordable electric mobility. However, to truly maximise the benefits of EV ownership, it's essential to consider the complete ecosystem — from the vehicle itself to home charging infrastructure and energy management.

Ready to explore your electric future? [Contact Nison Energy](/contact-us) today to discuss how we can support your EV charging needs and help you take full advantage of these exciting new opportunities in sustainable transport.`,
  },
  {
    slug: "choosing-the-right-ev-charging-cable-why-zev-cables-stand-out",
    title: "Choosing the Right EV Charging Cable: Why ZEV Cables Stand Out",
    excerpt:
      "Your cable is just as crucial as your charger. Here's why we recommend ZEV's Type 2 charging cables for home, workplace and public charging.",
    coverImage:
      "https://ocunioenergy.com/wp-content/uploads/2025/07/Zev-Cable-2025-05-04-at-15.38.53.jpeg.jpg",
    author: "Nison Energy",
    publishedAt: "2025-07-12",
    tags: ["EV Charging", "EV Charging Cable", "Electric Vehicle Charging Points", "Nison Energy", "OZEV", "Green Driving", "EV Accessories", "Workplace Charging Scheme"],
    bodyMarkdown: `When it comes to charging your electric vehicle, your cable is just as crucial as your charger. ZEV offers high-quality EV charging cables that are durable, reliable, and tailored to UK standards — specifically Type 2 connectors, which are now the universal standard for most EVs and chargepoints across the UK and Europe.

ZEV's cables support home, workplace, and public charging stations. They provide multiple cable lengths and power capacities (16A or 32A), accommodating both single and three-phase charging scenarios.

## Why Choose ZEV Charging Cables?

- **Compatibility** — supports all major EV brands with Type 2 ports.
- **Durability** — weatherproof, flexible, and resistant to wear.
- **Safe charging** — all cables are CE & TUV certified.
- **Convenience** — lightweight and easy to store on the go.

We recommend ZEV cables to our customers seeking dependable accessories to complement their electric vehicle charger installations. [Browse our full range of cables](/accessories).`,
  },
];
