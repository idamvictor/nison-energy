// Single source for the company identity used in transactional email (and
// anywhere else that needs it). The site's legal/contact copy still has its own
// hand-written strings in src/lib/content/legal.ts and the contact components —
// this is not a repo-wide refactor, just the canonical values.
export const COMPANY = {
  legalName: "Nison Limited",
  tradingName: "Ocunio Energy",
  companyNumber: "16371062",
  ozevInstallerNumber: "13528",
  email: "info@ocunioenergy.com",
  phone: "07525 567054",
  registeredOffice:
    "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom",
} as const;
