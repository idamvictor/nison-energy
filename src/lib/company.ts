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
  // WhatsApp (07525 567054) — digits only, international format for wa.me.
  whatsapp: "447525567054",
  // Normal landline, shown in the help banner.
  phone: "0330 633 0252",
  phoneTel: "+443306330252",
  social: {
    facebook: "https://www.facebook.com/share/1ZrUVUn8vq/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/ocunioenergy",
    linkedin: "https://www.linkedin.com/company/ocunio-energy/",
  },
  registeredOffice:
    "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom",
} as const;
