import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuditTable } from "@/components/audit-table"
import type { AuditRunPage } from "@/lib/audit/types"

const page: AuditRunPage = {
  id: "page-001",
  url: "https://example.com/blocked-post",
  title: "Post bloqueado",
  metaDescription: "Descrição",
  h1: "H1",
  wordCount: 1000,
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
  lastCrawlTime: null,
  clicks: 0,
  impressions: 0,
  ctr: 0,
  position: 0,
  coverageState: "Blocked by robots.txt",
  pageFetchState: "Successful",
  indexingState: "BLOCKED_BY_ROBOTS_TXT",
  canonicalUrl: null,
  submittedInSitemap: true,
  robotsTxtAllowed: false,
  hasNoindex: false,
  statusCode: 200,
  internalLinks: 0,
  externalLinks: 0,
  imagesWithoutAlt: 0,
  schemaTypes: [],
  wordpress: {
    postType: "post",
    slug: "blocked-post",
    author: "Autor",
    categories: [],
    tags: [],
  },
}

describe("AuditTable", () => {
  it("exibe o coverageState (não o pageFetchState) na coluna de Coverage", () => {
    render(<AuditTable pages={[page]} />)

    expect(screen.getByText("Blocked by robots.txt")).toBeInTheDocument()
    expect(screen.getByText("Successful")).toBeInTheDocument()
    expect(screen.getByText("BLOCKED_BY_ROBOTS_TXT")).toBeInTheDocument()
  })
})
