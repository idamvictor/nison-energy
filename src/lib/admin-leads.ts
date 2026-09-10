// Lead types + option lists shared by the admin CRM and the customer inbox.
// The persisted shape lives in prisma/schema.prisma (`Lead`); src/lib/leads-dal.ts
// maps a DB row to the `AdminLead` shape below, which the UI components consume.

export type LeadStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export type InstallationStage =
  | "Enquiry Received"
  | "Survey Booked"
  | "Grant Application"
  | "Installation Scheduled"
  | "Installed";

export type GrantStatus = "Not applicable" | "Not eligible" | "Submitted" | "Approved";

export type InstallationDetails = {
  stage: InstallationStage;
  surveyDate?: string;
  grantStatus?: GrantStatus;
  installDate?: string;
  engineer?: string;
};

export const installationStages: InstallationStage[] = [
  "Enquiry Received",
  "Survey Booked",
  "Grant Application",
  "Installation Scheduled",
  "Installed",
];

export const grantStatuses: GrantStatus[] = [
  "Not applicable",
  "Not eligible",
  "Submitted",
  "Approved",
];

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
  // Only present once a lead is Won — tracks the OZEV grant/installation
  // journey that follows the sale, separate from the sales-pipeline status.
  installation?: InstallationDetails;
};

export const leadStatuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Quoted",
  "Won",
  "Lost",
];
