import type { Metadata } from "next";
import { CalendarCheck, CreditCard, RotateCcw, ShieldCheck } from "lucide-react";

import { LegalPageLayout, type LegalHighlight } from "@/components/shared/legal-page-layout";
import { termsOfSaleMarkdown } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Terms and Conditions of Sale | Ocunio Energy",
  description:
    "The terms that apply when you buy EV chargers, accessories and installation from Ocunio Energy.",
};

// Built from the document's "## " headings, slugged the same way BlogMarkdown
// sets heading ids, so the contents always match the text.
const sections = [...termsOfSaleMarkdown.matchAll(/^## (.+)$/gm)].map(([, heading]) => ({
  id: heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  label: heading,
}));

const highlights: LegalHighlight[] = [
  {
    icon: CalendarCheck,
    title: "Delivered before installation",
    text: "Your charger arrives before your scheduled installation date.",
  },
  {
    icon: RotateCcw,
    title: "14-day right to cancel",
    text: "Change your mind within 14 days — see section 9 for how it works with installation.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty and guarantee",
    text: "Manufacturer's warranty on every charger, plus our 5-year workmanship guarantee.",
  },
  {
    icon: CreditCard,
    title: "Secure payment",
    text: "Card payments are processed by Stripe — we never store your card details.",
  },
];

export default function TermsOfSalePage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions of Sale"
      subtitle="The terms that apply when you buy EV chargers, accessories and installation from us."
      sections={sections}
      content={termsOfSaleMarkdown}
      highlights={highlights}
    />
  );
}
