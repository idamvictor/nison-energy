import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { privacyPolicyMarkdown } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Ocunio Energy",
  description: "How Ocunio Energy collects, uses, and protects your personal information.",
};

const sections = [
  { id: "1-information-we-collect", label: "1. Information We Collect" },
  { id: "2-how-we-use-your-information", label: "2. How We Use It" },
  { id: "3-payment-information", label: "3. Payment Information" },
  { id: "4-sharing-your-information", label: "4. Sharing Your Information" },
  { id: "5-cookies", label: "5. Cookies" },
  { id: "6-how-long-we-keep-your-information", label: "6. Retention" },
  { id: "7-keeping-your-information-safe", label: "7. Keeping It Safe" },
  { id: "8-childrens-privacy", label: "8. Children's Privacy" },
  { id: "9-your-privacy-rights", label: "9. Your Privacy Rights" },
  { id: "10-updates-to-this-notice", label: "10. Updates to This Notice" },
  { id: "11-contact-us", label: "11. Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      sections={sections}
      content={privacyPolicyMarkdown}
    />
  );
}
