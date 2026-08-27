import type { Metadata } from "next";

import { VirtualSurveyView } from "@/components/grant-guide/virtual-survey-view";

export const metadata: Metadata = {
  title: "Virtual Survey | Ocunio Energy",
  description:
    "Complete your virtual home survey to confirm your charger, any additional work required, and your grant-adjusted price.",
};

export default function VirtualSurveyPage() {
  return <VirtualSurveyView />;
}
