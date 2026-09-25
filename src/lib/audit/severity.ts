import type { AuditRunPage, Severity } from "@/lib/audit/types"

export type SeverityIssue = {
  severity: Severity
  code: string
  message: string
}

const COVERAGE_ERROR_STATES: AuditRunPage["coverageState"][] = [
  "Server error (5xx)",
  "Not found (404)",
  "Redirect error",
]

const COVERAGE_WARNING_STATES: AuditRunPage["coverageState"][] = [
  "Discovered - currently not indexed",
  "Crawled - currently not indexed",
  "Duplicate without user-selected canonical",
  "Alternate page with proper canonical tag",
  "Soft 404",
  "Indexed, not submitted in sitemap",
]


export function getPageIssues(page: AuditRunPage): SeverityIssue[] {
  const issues: SeverityIssue[] = []

  if (page.robotsTxtAllowed === false || page.coverageState === "Blocked by robots.txt") {
    issues.push({
      severity: "ERROR",
      code: "blocked-by-robots",
      message: "Bloqueada pelo robots.txt",
    })
  }

  if (page.hasNoindex || page.coverageState === "Excluded by noindex tag") {
    issues.push({
      severity: "ERROR",
      code: "noindex",
      message: "Página marcada como noindex",
    })
  }

  if (page.statusCode === 404 || page.coverageState === "Not found (404)") {
    issues.push({
      severity: "ERROR",
      code: "not-found",
      message: "Página retorna 404 (não encontrada)",
    })
  }

  if (
    (page.statusCode !== null && page.statusCode >= 500) ||
    page.coverageState === "Server error (5xx)"
  ) {
    issues.push({
      severity: "ERROR",
      code: "server-error",
      message: "Página retorna erro de servidor (5xx)",
    })
  }

  if (COVERAGE_ERROR_STATES.includes(page.coverageState) && !issues.some((i) => i.severity === "ERROR")) {
    issues.push({
      severity: "ERROR",
      code: "coverage-error",
      message: `Estado de cobertura crítico: "${page.coverageState}"`,
    })
  }

  if (page.pageFetchState === "Blocked" || page.pageFetchState === "Server error") {
    issues.push({
      severity: "ERROR",
      code: "fetch-failed",
      message: `Falha no rastreamento (${page.pageFetchState})`,
    })
  }

  if (COVERAGE_WARNING_STATES.includes(page.coverageState)) {
    issues.push({
      severity: "WARNING",
      code: "coverage-warning",
      message: `Estado de cobertura requer atenção: "${page.coverageState}"`,
    })
  }

  if (!page.submittedInSitemap) {
    issues.push({
      severity: "WARNING",
      code: "not-in-sitemap",
      message: "Não enviada no sitemap XML",
    })
  }

  if (page.pageFetchState === "Unknown" || page.indexingState === "UNKNOWN") {
    issues.push({
      severity: "WARNING",
      code: "unknown-state",
      message: "Estado de rastreamento/indexação desconhecido",
    })
  }

  if (!page.title) {
    issues.push({
      severity: "WARNING",
      code: "missing-title",
      message: "Sem meta title",
    })
  }

  if (!page.metaDescription) {
    issues.push({
      severity: "WARNING",
      code: "missing-meta-description",
      message: "Sem meta description",
    })
  }

  if (!page.h1) {
    issues.push({
      severity: "WARNING",
      code: "missing-h1",
      message: "Sem H1",
    })
  }

  if (page.imagesWithoutAlt > 0) {
    issues.push({
      severity: "WARNING",
      code: "images-without-alt",
      message: `${page.imagesWithoutAlt} imagem(ns) sem atributo alt`,
    })
  }

  if (
    page.wordCount < 300 &&
    page.wordpress.postType === "post"
  ) {
    issues.push({
      severity: "WARNING",
      code: "thin-content",
      message: `Conteúdo raso (${page.wordCount} palavras)`,
    })
  }

  return issues
}

const SEVERITY_RANK: Record<Severity, number> = {
  ERROR: 2,
  WARNING: 1,
  SUCCESS: 0,
}

export function getPageSeverity(page: AuditRunPage): Severity {
  const issues = getPageIssues(page)

  if (issues.length === 0) {
    return "SUCCESS"
  }

  return issues.reduce<Severity>(
    (worst, issue) => (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[worst] ? issue.severity : worst),
    "SUCCESS",
  )
}


export function getPrimaryIssue(page: AuditRunPage): SeverityIssue | null {
  const issues = getPageIssues(page)

  if (issues.length === 0) {
    return null
  }

  return issues.reduce((worst, issue) =>
    SEVERITY_RANK[issue.severity] > SEVERITY_RANK[worst.severity] ? issue : worst,
  )
}

export function getSeverityLabel(severity: Severity) {
  const labels: Record<Severity, string> = {
    ERROR: "Erro",
    WARNING: "Atenção",
    SUCCESS: "Saudável",
  }

  return labels[severity]
}
