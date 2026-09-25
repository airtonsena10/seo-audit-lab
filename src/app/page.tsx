import { AuditDashboard } from "@/components/audit-dashboard"
import { auditRunPages } from "@/data/audit-run-pages"

export default function Home() {
  return <AuditDashboard pages={auditRunPages} />
}
