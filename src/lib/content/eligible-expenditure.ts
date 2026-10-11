// OZEV eligible / ineligible expenditure — shown from the grant guides' quote
// form ("Eligible & ineligible expenditure"). Wording from the client's guidance document.

export type ExpenditureItem = { title: string; detail: string };

export const eligibleExpenditureIntro =
  "According to official guidance published by the Office for Zero Emission Vehicles (OZEV) and the Department for Transport (DfT) on GOV.UK. This guidance helps applicants understand the Electric Vehicle Chargepoint Grant rules, under which grant funding can cover up to 75% of the total eligible expenditure.";

export const eligibleExpenditure: ExpenditureItem[] = [
  { title: "Chargepoint Unit", detail: "The cost of the new, OZEV-approved EV chargepoint model." },
  {
    title: "Electrical Components",
    detail:
      "Cabling, dedicated distribution boards/consumer units, circuit breakers, isolators, and safety protection devices (e.g., open-PEN devices, earth rods).",
  },
  {
    title: "Hardware Costs",
    detail: "Physical mounting equipment, such as mounting posts, plinths, and protective physical fixings.",
  },
  {
    title: "Civil Engineering Works",
    detail:
      "Groundworks directly related to the install, including trenching, ducting, drilling, and making good/reinstating surfaces.",
  },
  {
    title: "Labour Costs",
    detail: "Direct installation, fitting, and electrical commissioning labour provided by the installer.",
  },
  {
    title: "Site Survey Works",
    detail: "Initial technical and electrical site surveys, provided they lead directly to a completed installation.",
  },
  {
    title: "Smart Meters & CT Clamps",
    detail:
      "The capital cost of an additional smart meter or current clamp (CT clamp) device for load management, provided it is installed at the same time as the chargepoint.",
  },
  { title: "VAT", detail: "Any Value Added Tax incurred by the customer on the above eligible goods and services." },
];

export const ineligibleExpenditure: ExpenditureItem[] = [
  { title: "Interest & Financial Charges", detail: "Interest charges, loan fees, or bad debts." },
  {
    title: "Profits & Entertaining",
    detail: "General profit margins added on top of allowable rates, or hospitality/entertainment expenses.",
  },
  {
    title: "Project Management & Admin",
    detail: "General project management, reporting costs, or overhead administrative fees.",
  },
  {
    title: "Arbitrary Contingencies",
    detail:
      "General inflation allowances or contingency markups applied as a flat, arbitrary percentage (though standard, itemized price adjustments for labour/materials are permitted).",
  },
  {
    title: "Land Acquisition",
    detail: "Purchasing, leasing, or securing new or additional land required for the installation site.",
  },
  {
    title: "Electricity Supply Costs",
    detail: "The cost of the electricity supplied to or consumed by the infrastructure.",
  },
  {
    title: "Ongoing Operating Costs",
    detail:
      "Back-office software subscriptions, data SIM/cellular communication packages, or ongoing maintenance contracts.",
  },
  {
    title: "Extended Warranties",
    detail: "Any warranty extensions purchased beyond the mandatory 3-year manufacturer guarantee.",
  },
  {
    title: "Marketing & Transport",
    detail: "Marketing, advertising, travel, or vehicle transport costs incurred by the installer/customer.",
  },
  {
    title: "Second-Hand Equipment",
    detail: "Any previously installed, refurbished, or used chargepoint units (all units must be brand-new).",
  },
  {
    title: "Customer-Supplied Hardware",
    detail:
      "If a customer provides their own pre-purchased chargepoint unit, the unit cost itself cannot be claimed under the grant (only the installer's labour and additional parts are eligible).",
  },
  { title: "Prior Work", detail: "Work completed before formal grant voucher or application approval." },
];
