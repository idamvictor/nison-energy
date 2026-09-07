import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { deliveryInformationMarkdown } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Delivery Information | Ocunio Energy",
  description:
    "How Ocunio Energy dispatches and delivers EV charger equipment orders across the UK.",
};

const sections = [
  { id: "delivery-options", label: "Delivery Options" },
  { id: "when-will-my-item-be-dispatched", label: "Dispatch Timescales" },
  { id: "where-do-we-deliver", label: "Where We Deliver" },
  { id: "track-your-delivery", label: "Track Your Delivery" },
];

export default function DeliveryInformationPage() {
  return (
    <LegalPageLayout
      title="Delivery Information"
      subtitle="How we dispatch, ship, and track your EV charger equipment orders across the UK."
      sections={sections}
      content={deliveryInformationMarkdown}
    />
  );
}
