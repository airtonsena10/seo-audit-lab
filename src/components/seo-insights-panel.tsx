"use client"

import { useState } from "react"
import { Sparkles, TriangleAlert } from "lucide-react"

import type { SeoInsightResult } from "@/lib/audit/insights"

type SeoInsightsPanelProps = {
  selectedCount: number
  selectedPageIds: string[]
}

export function SeoInsightsPanel({ selectedCount, selectedPageIds }: SeoInsightsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeoInsightResult | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setRequestError(null)
    setResult(null)

    try {
      const response = await fetch("/api/seo-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: selectedPageIds }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? `Erro inesperado (${response.status})`)
      }

      const data: SeoInsightResult = await response.json()
      setResult(data)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Não foi possível gerar os insights")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 bg-gradient-to-br from-accent-soft/50 via-transparent to-transparent px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="text-base font-semibold tracking-tight">SEO Insights</h2>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} página(s) selecionada(s). Gere recomendações práticas para o WordPress.`
              : "Selecione uma ou mais páginas na tabela para gerar recomendações de SEO."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={selectedCount === 0 || loading}
          className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45 ${
            loading ? "btn-loading" : ""
          }`}
        >
          {loading ? "Gerando..." : "Gerar insights"}
        </button>
      </div>

      {(requestError || result) && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          {requestError && (
            <p className="flex items-center gap-2 rounded-xl bg-error/8 px-3 py-2.5 text-sm text-error ring-1 ring-error/20">
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
              {requestError}
            </p>
          )}

          {result && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-medium ${
                    result.source === "ai"
                      ? "bg-success/10 text-success ring-1 ring-success/20"
                      : "bg-warning/10 text-warning ring-1 ring-warning/20"
                  }`}
                >
                  {result.source === "ai" ? `Gerado por IA (${result.model})` : "Gerado por regras (fallback)"}
                </span>
                {result.error && (
                  <span className="text-muted-foreground">Motivo do fallback: {result.error}</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{result.summary}</p>

              <ul className="space-y-2.5">
                {result.recommendations.map((recommendation, index) => (
                  <li
                    key={index}
                    className="flex gap-3 rounded-xl bg-muted/50 px-3.5 py-3 text-sm leading-relaxed"
                  >
                    <span className="mt-0.5 font-mono text-[11px] font-medium text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  )
}
