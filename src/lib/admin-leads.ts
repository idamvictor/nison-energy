export type LeadStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export type AdminLead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  jobTitle?: string;
  companyName?: string;
  postcode?: string;
  areaOfEnquiry: string;
  reasonForEnquiry: string;
  paidServicePlans: "Yes" | "No";
  futureCommunications: "Yes" | "No";
  additionalInformation?: string;
  status: LeadStatus;
  submittedAt: string;
};

export const leadStatuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Quoted",
  "Won",
  "Lost",
];

// Mock data — the contact form has no backend yet, so nothing is ever
// actually submitted anywhere. This populates the inbox UI for the design
// pass using the real field shape from src/components/contact/contact-form.tsx.
export const adminLeads: AdminLead[] = [
  {
    id: "lead-01",
    firstName: "Sarah",
    lastName: "Whitfield",
    phone: "07700 900123",
    email: "sarah.whitfield@gmail.com",
    postcode: "SW11 4RT",
    areaOfEnquiry: "House",
    reasonForEnquiry: "Home EV Installation",
    paidServicePlans: "No",
    futureCommunications: "Yes",
    additionalInformation:
      "Just bought a Tesla Model Y, driveway parking, would like a quote for a 7.4kW charger.",
    status: "New",
    submittedAt: "2026-08-18T09:14:00Z",
  },
  {
    id: "lead-02",
    firstName: "Daniel",
    lastName: "Okafor",
    phone: "07822 445610",
    email: "d.okafor@outlook.com",
    jobTitle: "Facilities Manager",
    companyName: "Ridgeway Logistics Ltd",
    postcode: "LU5 4TP",
    areaOfEnquiry: "Office Parking",
    reasonForEnquiry: "Workplace EV Installation",
    paidServicePlans: "Yes",
    futureCommunications: "Yes",
    additionalInformation:
      "Looking at 6 bays for a van fleet, need dual-socket units if possible.",
    status: "Contacted",
    submittedAt: "2026-08-16T14:32:00Z",
  },
  {
    id: "lead-03",
    firstName: "Priya",
    lastName: "Chandran",
    phone: "07911 223344",
    email: "priya.chandran@yahoo.co.uk",
    postcode: "M20 2RN",
    areaOfEnquiry: "Flat",
    reasonForEnquiry: "Home EV Installation",
    paidServicePlans: "No",
    futureCommunications: "No",
    additionalInformation:
      "Leasehold flat with an allocated parking space — not sure if freeholder consent is needed.",
    status: "New",
    submittedAt: "2026-08-19T11:02:00Z",
  },
  {
    id: "lead-04",
    firstName: "James",
    lastName: "Carrow",
    phone: "07555 981276",
    email: "james.carrow@carrowbuild.co.uk",
    jobTitle: "Site Manager",
    companyName: "Carrow Build Ltd",
    postcode: "RG1 8EX",
    areaOfEnquiry: "Apartment Building",
    reasonForEnquiry: "Workplace EV Installation",
    paidServicePlans: "Yes",
    futureCommunications: "Yes",
    additionalInformation:
      "New-build development, 40 units, want to scope charger provision for residents' car park.",
    status: "Quoted",
    submittedAt: "2026-08-11T16:45:00Z",
  },
  {
    id: "lead-05",
    firstName: "Emily",
    lastName: "Foster",
    phone: "07666 102938",
    email: "emily.foster82@gmail.com",
    postcode: "BS8 1TH",
    areaOfEnquiry: "House",
    reasonForEnquiry: "EV Maintenance",
    paidServicePlans: "No",
    futureCommunications: "No",
    additionalInformation:
      "Existing Ohme charger installed by another company keeps dropping WiFi, want a callout.",
    status: "Contacted",
    submittedAt: "2026-08-14T08:20:00Z",
  },
  {
    id: "lead-06",
    firstName: "Michael",
    lastName: "Sørensen",
    phone: "07234 556789",
    email: "m.sorensen@harboroaks.com",
    jobTitle: "Operations Director",
    companyName: "Harbor Oaks Hospitality Group",
    postcode: "PL1 3JQ",
    areaOfEnquiry: "Hospitality",
    reasonForEnquiry: "Workplace EV Installation",
    paidServicePlans: "Yes",
    futureCommunications: "Yes",
    additionalInformation:
      "Boutique hotel car park, guests increasingly asking about charging — want to future-proof with 8 bays.",
    status: "Won",
    submittedAt: "2026-08-04T13:10:00Z",
  },
  {
    id: "lead-07",
    firstName: "Grace",
    lastName: "Adeyemi",
    phone: "07789 334521",
    email: "grace.adeyemi@hotmail.com",
    postcode: "CR0 5NL",
    areaOfEnquiry: "Shared Accommodation",
    reasonForEnquiry: "Home EV Installation",
    paidServicePlans: "No",
    futureCommunications: "Yes",
    status: "New",
    submittedAt: "2026-08-19T17:48:00Z",
  },
  {
    id: "lead-08",
    firstName: "Robert",
    lastName: "Hale",
    phone: "07321 665012",
    email: "r.hale@lindenacademy.org.uk",
    jobTitle: "Bursar",
    companyName: "Linden Academy",
    postcode: "NE12 8FA",
    areaOfEnquiry: "School Car Park",
    reasonForEnquiry: "Workplace EV Installation",
    paidServicePlans: "Yes",
    futureCommunications: "No",
    additionalInformation:
      "Governors have approved budget for 4 staff bays, need OZEV grant guidance for a school site.",
    status: "Lost",
    submittedAt: "2026-07-29T10:05:00Z",
  },
  {
    id: "lead-09",
    firstName: "Olivia",
    lastName: "Bennett",
    phone: "07456 887123",
    email: "olivia.bennett@icloud.com",
    postcode: "EH10 5AB",
    areaOfEnquiry: "House",
    reasonForEnquiry: "Home EV Installation",
    paidServicePlans: "No",
    futureCommunications: "Yes",
    additionalInformation:
      "Considering a Hypervolt or Indra unit, would like a comparison before booking a survey.",
    status: "Quoted",
    submittedAt: "2026-08-09T12:27:00Z",
  },
  {
    id: "lead-10",
    firstName: "Tom",
    lastName: "Ridley",
    phone: "07998 110452",
    email: "tom@ridleyelectrical.co.uk",
    jobTitle: "Director",
    companyName: "Ridley Electrical",
    postcode: "YO1 6JN",
    areaOfEnquiry: "Other",
    reasonForEnquiry: "Joining our network",
    paidServicePlans: "No",
    futureCommunications: "Yes",
    additionalInformation:
      "NICEIC-registered electrician, based in York, interested in becoming an installer partner.",
    status: "New",
    submittedAt: "2026-08-17T15:56:00Z",
  },
];
