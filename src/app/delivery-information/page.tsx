import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { deliveryPolicyMarkdown } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Delivery Information | Ocunio Energy",
  description:
    "How Ocunio Energy dispatches and delivers EV charger equipment orders across the UK.",
};

const sections = [
  { id: "delivery-coverage-lead-times", label: "Coverage & Lead Times" },
  { id: "delivery-charges", label: "Delivery Charges" },
  { id: "managing-your-delivery", label: "Managing Your Delivery" },
  { id: "receiving-inspecting-your-goods", label: "Receiving Your Goods" },
  { id: "specialist-delivery", label: "Specialist Delivery" },
  { id: "delivery-coverage", label: "Delivery Coverage" },
  { id: "need-help", label: "Need Help?" },
];

export default function DeliveryInformationPage() {
  return (
    <LegalPageLayout
      title="Delivery Information"
      subtitle="How we dispatch, ship, and track your EV charger equipment orders across the UK."
      sections={sections}
      content={deliveryPolicyMarkdown}
    />
  );
}
