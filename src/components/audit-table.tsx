import { ExternalLink } from "lucide-react"

import { formatNumber, formatPercent, formatPosition } from "@/lib/audit/formatters"
import { getPageSeverity, getPrimaryIssue } from "@/lib/audit/severity"
import type { AuditRunPage } from "@/lib/audit/types"
import { SeverityBadge } from "@/components/severity-badge"

type AuditTableProps = {
  pages: AuditRunPage[]
  selectedPageIds?: Set<string>
  onToggleSelected?: (pageId: string) => void
}

export function AuditTable({ pages, selectedPageIds, onToggleSelected }: AuditTableProps) {
  const selectable = Boolean(onToggleSelected)

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
            <tr>
              {selectable && <th className="w-10 px-4 py-3.5" />}
              <th className="px-4 py-3.5">URL</th>
              <th className="px-4 py-3.5">Severidade</th>
              <th className="px-4 py-3.5">Principal problema</th>
              <th className="px-4 py-3.5" title="Estado de cobertura/indexação no Google">
                Coverage
              </th>
              <th className="px-4 py-3.5" title="Resultado da tentativa de rastreamento">
                Fetch
              </th>
              <th className="px-4 py-3.5" title="Permissão técnica de indexação">
                Indexing
              </th>
              <th className="px-4 py-3.5">Cliques</th>
              <th className="px-4 py-3.5">CTR</th>
              <th className="px-4 py-3.5">Posição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {pages.map((page) => {
              const primaryIssue = getPrimaryIssue(page)

              return (
                <tr key={page.id} className="transition hover:bg-accent-soft/40">
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedPageIds?.has(page.id) ?? false}
                        onChange={() => onToggleSelected?.(page.id)}
                        aria-label={`Selecionar ${page.url}`}
                        className="h-4 w-4 rounded border-border accent-accent"
                      />
                    </td>
                  )}
                  <td className="max-w-[320px] px-4 py-3.5">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <ExternalLink
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/80"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{page.title ?? "Sem title"}</p>
                        <p className="truncate text-xs text-muted-foreground">{page.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <SeverityBadge severity={getPageSeverity(page)} />
                  </td>
                  <td className="max-w-[220px] px-4 py-3.5 text-xs text-muted-foreground">
                    {primaryIssue ? primaryIssue.message : "Nenhum problema encontrado"}
                  </td>
                  <td className="px-4 py-3.5 text-xs">{page.coverageState}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{page.pageFetchState}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                    {page.indexingState}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">{formatNumber(page.clicks)}</td>
                  <td className="px-4 py-3.5 tabular-nums">{formatPercent(page.ctr)}</td>
                  <td className="px-4 py-3.5 tabular-nums">{formatPosition(page.position)}</td>
                </tr>
              )
            })}
            {pages.length === 0 && (
              <tr>
                <td
                  colSpan={selectable ? 10 : 9}
                  className="px-4 py-14 text-center text-sm text-muted-foreground"
                >
                  Nenhuma página encontrada com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
