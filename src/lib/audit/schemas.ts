import { z } from "zod"

/** Limite de páginas por requisição de insights (custo/latency da IA). */
export const MAX_SEO_INSIGHT_PAGE_IDS = 20

export const seoInsightsRequestSchema = z.object({
  pageIds: z
    .array(z.string().min(1, "Cada pageId deve ser uma string não vazia"))
    .min(1, "Informe 'pageIds' como um array de strings não vazio")
    .max(
      MAX_SEO_INSIGHT_PAGE_IDS,
      `Informe no máximo ${MAX_SEO_INSIGHT_PAGE_IDS} pageIds por requisição`,
    ),
})

export type SeoInsightsRequest = z.infer<typeof seoInsightsRequestSchema>

export const seoInsightResultSchema = z.object({
  source: z.enum(["ai", "fallback"]),
  model: z.string().nullable(),
  summary: z.string(),
  recommendations: z.array(z.string()),
  error: z.string().optional(),
})

export type SeoInsightResult = z.infer<typeof seoInsightResultSchema>

export const openRouterChatCompletionSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().min(1, "Resposta da IA veio vazia"),
        }),
      }),
    )
    .min(1, "Resposta da IA sem choices"),
})

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join("; ")
}
