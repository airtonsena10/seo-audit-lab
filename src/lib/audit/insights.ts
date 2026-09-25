import { getPageIssues, getPageSeverity } from "@/lib/audit/severity"
import {
  formatZodError,
  openRouterChatCompletionSchema,
  seoInsightResultSchema,
  type SeoInsightResult,
} from "@/lib/audit/schemas"
import type { AuditRunPage } from "@/lib/audit/types"

export type { SeoInsightResult }

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

/** Mensagem segura para o cliente quando a IA falha (detalhe fica só no log). */
export const SEO_INSIGHTS_FALLBACK_ERROR =
  "Não foi possível consultar o modelo de IA. Usando recomendações locais."

function buildPagesContext(pages: AuditRunPage[]): string {
  return pages
    .map((page) => {
      const issues = getPageIssues(page)
      const issuesText = issues.length
        ? issues.map((issue) => `- [${issue.severity}] ${issue.message}`).join("\n")
        : "- Nenhum problema técnico detectado"

      return [
        `URL: ${page.url}`,
        `Título: ${page.title ?? "(sem title)"}`,
        `Tipo WordPress: ${page.wordpress.postType} (slug: ${page.wordpress.slug})`,
        `coverageState: ${page.coverageState}`,
        `pageFetchState: ${page.pageFetchState}`,
        `indexingState: ${page.indexingState}`,
        `statusCode: ${page.statusCode ?? "desconhecido"}`,
        `robotsTxtAllowed: ${page.robotsTxtAllowed}`,
        `hasNoindex: ${page.hasNoindex}`,
        `submittedInSitemap: ${page.submittedInSitemap}`,
        `canonicalUrl: ${page.canonicalUrl ?? "(nenhum)"}`,
        `wordCount: ${page.wordCount}`,
        `imagesWithoutAlt: ${page.imagesWithoutAlt}`,
        `Severidade calculada: ${getPageSeverity(page)}`,
        `Problemas detectados:\n${issuesText}`,
      ].join("\n")
    })
    .join("\n\n---\n\n")
}

function buildPrompt(pages: AuditRunPage[]): string {
  return `Você é um especialista em SEO técnico que ajuda gestores de blogs WordPress a resolver problemas de indexação no Google.

Abaixo estão dados de auditoria (Google Search Console) de ${pages.length} página(s) de um blog WordPress:

${buildPagesContext(pages)}

Gere recomendações PRÁTICAS e ESPECÍFICAS para o WordPress (nomeie plugins comuns como Yoast SEO ou Rank Math quando fizer sentido) para resolver os problemas encontrados.

Responda em português, em formato de lista com marcadores ("- "), sem introdução nem conclusão, com no máximo 8 itens, cada um em uma frase objetiva e acionável.`
}


export function generateFallbackInsight(pages: AuditRunPage[]): SeoInsightResult {
  const recommendations = new Set<string>()

  for (const page of pages) {
    const issues = getPageIssues(page)

    for (const issue of issues) {
      switch (issue.code) {
        case "blocked-by-robots":
          recommendations.add(
            `Revise o robots.txt: "${page.url}" está sendo bloqueada e não pode ser rastreada pelo Google.`,
          )
          break
        case "noindex":
          recommendations.add(
            `Verifique a tag noindex em "${page.url}" nas configurações de SEO do post (Yoast/Rank Math) — ela está impedindo a indexação.`,
          )
          break
        case "not-found":
          recommendations.add(
            `Corrija ou redirecione (301) a página 404 "${page.url}" para uma URL válida e atualizada.`,
          )
          break
        case "server-error":
          recommendations.add(
            `Investigue o erro de servidor em "${page.url}" (hospedagem, plugin com conflito ou timeout) — ela está retornando 5xx.`,
          )
          break
        case "coverage-error":
        case "fetch-failed":
          recommendations.add(
            `Reenvie "${page.url}" para o Google Search Console após corrigir o problema de rastreamento/cobertura.`,
          )
          break
        case "not-in-sitemap":
          recommendations.add(
            `Confirme que "${page.url}" está incluída no sitemap.xml gerado pelo plugin de SEO e envie-o novamente no Search Console.`,
          )
          break
        case "coverage-warning":
          recommendations.add(
            `Acompanhe "${page.url}": está com status "${page.coverageState}", pode levar tempo para o Google reprocessar ou pode indicar conteúdo duplicado/canonical incorreto.`,
          )
          break
        case "missing-title":
          recommendations.add(`Adicione um meta title otimizado para "${page.url}".`)
          break
        case "missing-meta-description":
          recommendations.add(`Escreva uma meta description atrativa (150-160 caracteres) para "${page.url}".`)
          break
        case "missing-h1":
          recommendations.add(`Adicione um H1 claro e único para "${page.url}".`)
          break
        case "images-without-alt":
          recommendations.add(
            `Preencha o atributo alt de ${page.imagesWithoutAlt} imagem(ns) em "${page.url}" para acessibilidade e SEO.`,
          )
          break
        case "thin-content":
          recommendations.add(
            `Amplie o conteúdo de "${page.url}" (hoje com ${page.wordCount} palavras) para cobrir o tema com mais profundidade.`,
          )
          break
        case "unknown-state":
          recommendations.add(
            `Solicite uma nova inspeção de URL no Search Console para "${page.url}", pois o estado de rastreamento está indefinido.`,
          )
          break
      }
    }

    if (page.canonicalUrl && page.canonicalUrl !== page.url) {
      recommendations.add(
        `Revise a tag canonical de "${page.url}", que aponta para outra URL ("${page.canonicalUrl}") — confirme se isso é intencional.`,
      )
    }
  }

  if (recommendations.size === 0) {
    recommendations.add("Nenhum problema crítico encontrado nas páginas selecionadas. Continue monitorando periodicamente.")
  }

  return seoInsightResultSchema.parse({
    source: "fallback",
    model: null,
    summary:
      "Recomendações geradas por regras locais (fallback), sem uso de modelo de IA. Baseadas diretamente nos campos de auditoria de cada página.",
    recommendations: Array.from(recommendations).slice(0, 10),
  })
}

function parseRecommendations(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
}

async function callOpenRouter(pages: AuditRunPage[]): Promise<SeoInsightResult> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY não configurada")
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: buildPrompt(pages) }],
        temperature: 0.4,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "")
      throw new Error(`OpenRouter respondeu ${response.status}: ${errorBody.slice(0, 300)}`)
    }

    const data: unknown = await response.json()
    const parsed = openRouterChatCompletionSchema.safeParse(data)

    if (!parsed.success) {
      throw new Error(formatZodError(parsed.error))
    }

    const content = parsed.data.choices[0].message.content
    const recommendations = parseRecommendations(content)

    return seoInsightResultSchema.parse({
      source: "ai",
      model,
      summary: `Recomendações geradas por IA (${model}) com base nos dados de auditoria das páginas selecionadas.`,
      recommendations: recommendations.length > 0 ? recommendations : [content.trim()],
    })
  } finally {
    clearTimeout(timeout)
  }
}


export async function generateSeoInsights(pages: AuditRunPage[]): Promise<SeoInsightResult> {
  if (pages.length === 0) {
    return seoInsightResultSchema.parse({
      source: "fallback",
      model: null,
      summary: "Nenhuma página selecionada.",
      recommendations: [],
    })
  }

  try {
    return await callOpenRouter(pages)
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erro desconhecido ao chamar o modelo de IA"
    console.error("[seo-insights] falha ao chamar OpenRouter:", detail)

    const fallback = generateFallbackInsight(pages)
    return seoInsightResultSchema.parse({
      ...fallback,
      error: SEO_INSIGHTS_FALLBACK_ERROR,
    })
  }
}
