import { redirect } from "next/navigation";

import { OPENQUOTE_SURVEY_URL } from "@/lib/content/openquote";

// The survey now opens on OpenQuote directly (no embed). Old links, emails and
// search results that still point here are sent straight there.
export default function VirtualSurveyPage() {
  redirect(OPENQUOTE_SURVEY_URL);
}
