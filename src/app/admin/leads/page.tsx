import { LeadsTableView } from "@/components/admin/leads/leads-table-view";
import { getLeads } from "@/lib/leads/queries";

export default async function AdminLeadsPage() {
  const leads = await getLeads();
  return <LeadsTableView leads={leads} />;
}
