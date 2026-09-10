"use server";

import { createLead } from "@/lib/leads-dal";

export type EnquiryFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; errors: Record<string, string>; message?: string };

export async function submitEnquiry(
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  // Honeypot — bots fill hidden fields. Pretend it worked, store nothing.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  const result = await createLead({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    jobTitle: formData.get("jobTitle"),
    companyName: formData.get("companyName"),
    postcode: formData.get("postcode"),
    areaOfEnquiry: formData.get("areaOfEnquiry"),
    reasonForEnquiry: formData.get("reasonForEnquiry"),
    additionalInformation: formData.get("additionalInformation"),
    futureCommunications: formData.get("futureCommunications"),
  });

  if (!result.ok) {
    return {
      status: "error",
      errors: result.errors,
      message: "Please check the highlighted fields.",
    };
  }

  return { status: "success" };
}
