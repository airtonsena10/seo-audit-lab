import { getSeverityLabel } from "@/lib/audit/severity"
import type { Severity } from "@/lib/audit/types"

type SeverityBadgeProps = {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityClassName = {
    ERROR: "bg-error/10 text-error ring-error/15",
    WARNING: "bg-warning/10 text-warning ring-warning/15",
    SUCCESS: "bg-success/10 text-success ring-success/15",
  }[severity]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${severityClassName}`}
    >
      {getSeverityLabel(severity)}
    </span>
  )
}
