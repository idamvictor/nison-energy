// Mock signed-in customer — there's no auth yet, so these account pages are
// built against a placeholder persona (the same person behind lead-01 in
// admin-leads.ts) rather than any real login/session.
export const accountCustomer = {
  firstName: "Sarah",
  lastName: "Whitfield",
  email: "sarah.whitfield@gmail.com",
  phone: "07700 900123",
  address: "14 Latchmere Road, London",
  postcode: "SW11 4RT",
};

export type AccountEnquiryStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export type AccountEnquiry = {
  id: string;
  areaOfEnquiry: string;
  reasonForEnquiry: string;
  submittedAt: string;
  status: AccountEnquiryStatus;
  additionalInformation?: string;
};

export const accountEnquiries: AccountEnquiry[] = [
  {
    id: "enq-01",
    areaOfEnquiry: "House",
    reasonForEnquiry: "Home EV Installation",
    submittedAt: "2026-08-18T09:14:00Z",
    status: "New",
    additionalInformation:
      "Just bought a Tesla Model Y, driveway parking, would like a quote for a 7.4kW charger.",
  },
  {
    id: "enq-02",
    areaOfEnquiry: "House",
    reasonForEnquiry: "EV Maintenance",
    submittedAt: "2026-06-02T10:30:00Z",
    status: "Won",
    additionalInformation:
      "Annual service check for the Ohme Home Pro installed last year.",
  },
];
