export type CoverageState =
  | "Submitted and indexed"
  | "Indexed, not submitted in sitemap"
  | "Discovered - currently not indexed"
  | "Crawled - currently not indexed"
  | "Duplicate without user-selected canonical"
  | "Alternate page with proper canonical tag"
  | "Blocked by robots.txt"
  | "Excluded by noindex tag"
  | "Soft 404"
  | "Not found (404)"
  | "Server error (5xx)"
  | "Redirect error"

export type PageFetchState =
  | "Successful"
  | "Blocked"
  | "Not found"
  | "Server error"
  | "Redirect error"
  | "Unknown"

export type IndexingState =
  | "INDEXING_ALLOWED"
  | "BLOCKED_BY_META_TAG"
  | "BLOCKED_BY_ROBOTS_TXT"
  | "BLOCKED_BY_HTTP_HEADER"
  | "UNKNOWN"

export type WordPressPostType = "post" | "page" | "category" | "tag"

export type AuditRunPage = {
  id: string
  url: string
  title: string | null
  metaDescription: string | null
  h1: string | null
  wordCount: number
  publishedAt: string
  updatedAt: string | null
  lastCrawlTime: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
  coverageState: CoverageState
  pageFetchState: PageFetchState
  indexingState: IndexingState
  canonicalUrl: string | null
  submittedInSitemap: boolean
  robotsTxtAllowed: boolean
  hasNoindex: boolean
  statusCode: number | null
  internalLinks: number
  externalLinks: number
  imagesWithoutAlt: number
  schemaTypes: string[]
  wordpress: {
    postType: WordPressPostType
    slug: string
    author: string
    categories: string[]
    tags: string[]
  }
}

export type Severity = "ERROR" | "WARNING" | "SUCCESS"

export type SeoInsight = {
  pageId: string
  severity: Severity
  summary: string
  wordpressActions: string[]
  technicalExplanation: string
}
