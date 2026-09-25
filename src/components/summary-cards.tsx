import { AlertTriangle, CheckCircle2, Layers, XCircle } from "lucide-react"

import type { Severity } from "@/lib/audit/types"

type SummaryCardsProps = {
  counts: Record<Severity, number>
  total: number
  activeSeverity: Severity | "ALL"
  onSelectSeverity: (severity: Severity | "ALL") => void
}

const CARD_CONFIG: {
  key: Severity | "ALL"
  label: string
  hint: string
  Icon: typeof Layers
  iconWrap: string
  number: string
  wash: string
  active: string
}[] = [
  {
    key: "ALL",
    label: "Total",
    hint: "Todas as URLs",
    Icon: Layers,
    iconWrap: "bg-accent/12 text-accent",
    number: "text-foreground",
    wash: "from-accent-soft/70 via-white to-white",
    active: "border-accent/50 ring-2 ring-accent/20 shadow-[var(--shadow-lift)]",
  },
  {
    key: "ERROR",
    label: "Com erro",
    hint: "Bloqueio / 4xx / 5xx",
    Icon: XCircle,
    iconWrap: "bg-error/10 text-error",
    number: "text-error",
    wash: "from-error/8 via-white to-white",
    active: "border-error/40 ring-2 ring-error/15 shadow-[var(--shadow-lift)]",
  },
  {
    key: "WARNING",
    label: "Atenção",
    hint: "Risco de indexação",
    Icon: AlertTriangle,
    iconWrap: "bg-warning/10 text-warning",
    number: "text-warning",
    wash: "from-warning/8 via-white to-white",
    active: "border-warning/40 ring-2 ring-warning/15 shadow-[var(--shadow-lift)]",
  },
  {
    key: "SUCCESS",
    label: "Saudáveis",
    hint: "Sem problemas críticos",
    Icon: CheckCircle2,
    iconWrap: "bg-success/10 text-success",
    number: "text-success",
    wash: "from-success/8 via-white to-white",
    active: "border-success/40 ring-2 ring-success/15 shadow-[var(--shadow-lift)]",
  },
]

export function SummaryCards({ counts, total, activeSeverity, onSelectSeverity }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {CARD_CONFIG.map((card) => {
        const value = card.key === "ALL" ? total : counts[card.key]
        const isActive = activeSeverity === card.key
        const share = total > 0 ? Math.round((value / total) * 100) : 0
        const Icon = card.Icon

        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectSeverity(isActive ? "ALL" : card.key)}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${card.wash} p-4 text-left shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] md:p-5 ${
              isActive ? card.active : "hover:border-accent/25"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.iconWrap} transition group-hover:scale-105`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              {isActive && (
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Filtro
                </span>
              )}
            </div>

            <p className="mt-4 text-sm font-medium text-foreground">{card.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.hint}</p>

            <div className="mt-3 flex items-end justify-between gap-2">
              <span className={`font-display text-4xl leading-none tracking-tight md:text-5xl ${card.number}`}>
                {value}
              </span>
              <span className="pb-1 font-mono text-[11px] text-muted-foreground">{share}%</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
