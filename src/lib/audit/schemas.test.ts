import { describe, expect, it } from "vitest"

import {
  formatZodError,
  openRouterChatCompletionSchema,
  seoInsightResultSchema,
  seoInsightsRequestSchema,
} from "@/lib/audit/schemas"

describe("seoInsightsRequestSchema", () => {
  it("aceita um array de pageIds válido", () => {
    const result = seoInsightsRequestSchema.safeParse({ pageIds: ["page-001", "page-002"] })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pageIds).toEqual(["page-001", "page-002"])
    }
  })

  it("rejeita pageIds vazio", () => {
    const result = seoInsightsRequestSchema.safeParse({ pageIds: [] })

    expect(result.success).toBe(false)
  })

  it("rejeita pageIds ausente", () => {
    const result = seoInsightsRequestSchema.safeParse({})

    expect(result.success).toBe(false)
  })

  it("rejeita strings vazias dentro de pageIds", () => {
    const result = seoInsightsRequestSchema.safeParse({ pageIds: ["page-001", ""] })

    expect(result.success).toBe(false)
  })
})

describe("seoInsightResultSchema", () => {
  it("aceita resposta de IA válida", () => {
    const result = seoInsightResultSchema.safeParse({
      source: "ai",
      model: "openrouter/free",
      summary: "Resumo",
      recommendations: ["Item 1"],
    })

    expect(result.success).toBe(true)
  })

  it("aceita resposta de fallback com error", () => {
    const result = seoInsightResultSchema.safeParse({
      source: "fallback",
      model: null,
      summary: "Fallback",
      recommendations: [],
      error: "Timeout",
    })

    expect(result.success).toBe(true)
  })

  it("rejeita source inválido", () => {
    const result = seoInsightResultSchema.safeParse({
      source: "unknown",
      model: null,
      summary: "Resumo",
      recommendations: [],
    })

    expect(result.success).toBe(false)
  })
})

describe("openRouterChatCompletionSchema", () => {
  it("aceita resposta válida da OpenRouter", () => {
    const result = openRouterChatCompletionSchema.safeParse({
      choices: [{ message: { content: "- Recomendação 1" } }],
    })

    expect(result.success).toBe(true)
  })

  it("rejeita resposta sem choices", () => {
    const result = openRouterChatCompletionSchema.safeParse({ choices: [] })

    expect(result.success).toBe(false)
  })

  it("rejeita content vazio", () => {
    const result = openRouterChatCompletionSchema.safeParse({
      choices: [{ message: { content: "" } }],
    })

    expect(result.success).toBe(false)
  })
})

describe("formatZodError", () => {
  it("formata mensagens de erro do zod", () => {
    const result = seoInsightsRequestSchema.safeParse({ pageIds: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(formatZodError(result.error)).toContain("pageIds")
    }
  })
})
