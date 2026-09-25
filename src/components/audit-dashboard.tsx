"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, RotateCcw, Search, Shield } from "lucide-react"

import { AuditTable } from "@/components/audit-table"
import { SummaryCards } from "@/components/summary-cards"
import { SeoInsightsPanel } from "@/components/seo-insights-panel"
import { getPageSeverity } from "@/lib/audit/severity"
import type { AuditRunPage, CoverageState, Severity } from "@/lib/audit/types"

type AuditDashboardProps = {
  pages: AuditRunPage[]
}

type SortKey = "severity" | "clicks" | "impressions" | "position"

const SEVERITY_RANK: Record<Severity, number> = { ERROR: 2, WARNING: 1, SUCCESS: 0 }

export function AuditDashboard({ pages }: AuditDashboardProps) {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<Severity | "ALL">("ALL")
  const [coverageFilter, setCoverageFilter] = useState<CoverageState | "ALL">("ALL")
  const [sortKey, setSortKey] = useState<SortKey>("severity")
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set())

  const pagesWithSeverity = useMemo(
    () => pages.map((page) => ({ page, severity: getPageSeverity(page) })),
    [pages],
  )

  const counts = useMemo(() => {
    const result: Record<Severity, number> = { ERROR: 0, WARNING: 0, SUCCESS: 0 }
    for (const { severity } of pagesWithSeverity) {
      result[severity] += 1
    }
    return result
  }, [pagesWithSeverity])

  const coverageStates = useMemo(
    () => Array.from(new Set(pages.map((page) => page.coverageState))).sort(),
    [pages],
  )

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase()

    return pagesWithSeverity
      .filter(({ severity }) => severityFilter === "ALL" || severity === severityFilter)
      .filter(({ page }) => coverageFilter === "ALL" || page.coverageState === coverageFilter)
      .filter(({ page }) => {
        if (!query) return true
        return (
          page.url.toLowerCase().includes(query) ||
          (page.title ?? "").toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "clicks":
            return b.page.clicks - a.page.clicks
          case "impressions":
            return b.page.impressions - a.page.impressions
          case "position":
            return a.page.position - b.page.position
          case "severity":
          default:
            return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
        }
      })
      .map(({ page }) => page)
  }, [pagesWithSeverity, severityFilter, coverageFilter, search, sortKey])

  function toggleSelected(pageId: string) {
    setSelectedPageIds((current) => {
      const next = new Set(current)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }

  const hasActiveFilters =
    search.trim().length > 0 || coverageFilter !== "ALL" || sortKey !== "severity" || severityFilter !== "ALL"

  function resetFilters() {
    setSearch("")
    setCoverageFilter("ALL")
    setSortKey("severity")
    setSeverityFilter("ALL")
  }

  return (
    <main className="min-h-screen">
      <header className="animate-rise">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 pb-2 pt-10 md:flex-row md:items-end md:justify-between md:pt-14">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-accent">
              <span className="signal-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Desafio prático · Search Console × WordPress
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
              SEO Audit Lab
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Leia sinais de indexação, priorize problemas técnicos e gere
              recomendações acionáveis — com IA ou regras locais.
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-white/60 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Run atual
            </p>
            <p className="mt-1 font-medium text-foreground">{pages.length} URLs mock GSC</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8">
        <div className="animate-rise animate-rise-delay-1">
          <SummaryCards
            counts={counts}
            total={pages.length}
            activeSeverity={severityFilter}
            onSelectSeverity={setSeverityFilter}
          />
        </div>

        <div className="animate-rise animate-rise-delay-2">
          <SeoInsightsPanel
            selectedCount={selectedPageIds.size}
            selectedPageIds={Array.from(selectedPageIds)}
          />
        </div>

        <div className="animate-rise animate-rise-delay-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold tracking-tight">Filtros</p>
              <p className="text-xs text-muted-foreground">
                Exibindo{" "}
                <span className="font-medium text-foreground">{filteredPages.length}</span> de{" "}
                {pages.length} páginas
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-paper px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Limpar
              </button>
            )}
          </div>

          <div className="grid gap-3 bg-gradient-to-br from-accent-soft/40 via-surface to-muted/40 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Busca
              </span>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
                  aria-hidden
                />
                <input
                  id="audit-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="URL ou título..."
                  className="control w-full py-2.5 pl-10 pr-3.5 text-sm"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Coverage
              </span>
              <select
                value={coverageFilter}
                onChange={(event) => setCoverageFilter(event.target.value as CoverageState | "ALL")}
                className="control w-full px-3.5 py-2.5 text-sm"
              >
                <option value="ALL">Todos os estados</option>
                {coverageStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                Ordenação
              </span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="control w-full px-3.5 py-2.5 text-sm"
              >
                <option value="severity">Severidade</option>
                <option value="clicks">Cliques</option>
                <option value="impressions">Impressões</option>
                <option value="position">Posição média</option>
              </select>
            </label>
          </div>
        </div>

        <div className="animate-rise animate-rise-delay-4">
          <AuditTable
            pages={filteredPages}
            selectedPageIds={selectedPageIds}
            onToggleSelected={toggleSelected}
          />
        </div>
      </div>
    </main>
  )
}
