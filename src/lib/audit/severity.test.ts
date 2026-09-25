import { describe, expect, it } from "vitest"

import { getPageIssues, getPageSeverity, getPrimaryIssue } from "@/lib/audit/severity"
import type { AuditRunPage } from "@/lib/audit/types"

function buildPage(overrides: Partial<AuditRunPage> = {}): AuditRunPage {
  return {
    id: "page-test",
    url: "https://example.com/post",
    title: "Um título qualquer",
    metaDescription: "Uma descrição qualquer",
    h1: "Um H1 qualquer",
    wordCount: 1200,
    publishedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: null,
    lastCrawlTime: "2026-01-02T00:00:00.000Z",
    clicks: 10,
    impressions: 100,
    ctr: 0.1,
    position: 10,
    coverageState: "Submitted and indexed",
    pageFetchState: "Successful",
    indexingState: "INDEXING_ALLOWED",
    canonicalUrl: "https://example.com/post",
    submittedInSitemap: true,
    robotsTxtAllowed: true,
    hasNoindex: false,
    statusCode: 200,
    internalLinks: 10,
    externalLinks: 2,
    imagesWithoutAlt: 0,
    schemaTypes: ["Article"],
    wordpress: {
      postType: "post",
      slug: "post",
      author: "Autor",
      categories: ["Categoria"],
      tags: ["tag"],
    },
    ...overrides,
  }
}

describe("getPageSeverity", () => {
  it("classifica como SUCCESS uma página indexada e saudável", () => {
    const page = buildPage()

    expect(getPageSeverity(page)).toBe("SUCCESS")
    expect(getPageIssues(page)).toHaveLength(0)
  })

  it("classifica como ERROR uma página bloqueada por robots.txt", () => {
    const page = buildPage({
      coverageState: "Blocked by robots.txt",
      pageFetchState: "Blocked",
      indexingState: "BLOCKED_BY_ROBOTS_TXT",
      robotsTxtAllowed: false,
    })

    expect(getPageSeverity(page)).toBe("ERROR")
  })

  it("classifica como ERROR uma página com noindex", () => {
    const page = buildPage({
      coverageState: "Excluded by noindex tag",
      indexingState: "BLOCKED_BY_META_TAG",
      hasNoindex: true,
    })

    expect(getPageSeverity(page)).toBe("ERROR")
  })

  it("classifica como ERROR uma página 404", () => {
    const page = buildPage({
      coverageState: "Not found (404)",
      pageFetchState: "Not found",
      statusCode: 404,
    })

    expect(getPageSeverity(page)).toBe("ERROR")
  })

  it("classifica como WARNING uma página sem meta description", () => {
    const page = buildPage({ metaDescription: null })

    expect(getPageSeverity(page)).toBe("WARNING")
  })

  it("classifica como WARNING uma página não enviada no sitemap", () => {
    const page = buildPage({ submittedInSitemap: false })

    expect(getPageSeverity(page)).toBe("WARNING")
  })

  it("nunca rebaixa a severidade: ERROR tem prioridade sobre WARNING", () => {
    const page = buildPage({
      coverageState: "Not found (404)",
      statusCode: 404,
      metaDescription: null,
      submittedInSitemap: false,
    })

    expect(getPageSeverity(page)).toBe("ERROR")
  })
})

describe("getPrimaryIssue", () => {
  it("retorna null quando não há problemas", () => {
    expect(getPrimaryIssue(buildPage())).toBeNull()
  })

  it("retorna o problema de maior severidade como principal", () => {
    const page = buildPage({
      coverageState: "Not found (404)",
      statusCode: 404,
      metaDescription: null,
    })

    const primary = getPrimaryIssue(page)

    expect(primary?.severity).toBe("ERROR")
  })
})
