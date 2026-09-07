import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { termsAndConditionsMarkdown } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms and Conditions | Ocunio Energy",
  description: "The terms and conditions for using the Ocunio Energy website and services.",
};

const sections = [
  { id: "1-eligibility", label: "1. Eligibility" },
  { id: "2-our-services", label: "2. Our Services" },
  { id: "3-intellectual-property", label: "3. Intellectual Property" },
  { id: "4-purchases-and-payment", label: "4. Purchases and Payment" },
  { id: "5-delivery-and-returns", label: "5. Delivery and Returns" },
  { id: "6-prohibited-activities", label: "6. Prohibited Activities" },
  { id: "7-user-contributions", label: "7. User Contributions" },
  { id: "8-third-party-links", label: "8. Third-Party Links" },
  { id: "9-liability", label: "9. Liability" },
  { id: "10-termination", label: "10. Termination" },
  { id: "11-governing-law-and-disputes", label: "11. Governing Law & Disputes" },
  { id: "12-changes-to-these-terms", label: "12. Changes to These Terms" },
  { id: "13-contact-us", label: "13. Contact Us" },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms and Conditions"
      subtitle="The terms that apply when you use our website, buy products, or book installation services."
      sections={sections}
      content={termsAndConditionsMarkdown}
    />
  );
}
