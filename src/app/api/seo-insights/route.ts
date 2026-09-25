import { NextResponse } from "next/server"

import { auditRunPages } from "@/data/audit-run-pages"
import { generateSeoInsights } from "@/lib/audit/insights"
import { formatZodError, seoInsightResultSchema, seoInsightsRequestSchema } from "@/lib/audit/schemas"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 })
  }

  const parsedRequest = seoInsightsRequestSchema.safeParse(body)

  if (!parsedRequest.success) {
    return NextResponse.json({ error: formatZodError(parsedRequest.error) }, { status: 400 })
  }

  const pageIds = Array.from(new Set(parsedRequest.data.pageIds))
  const pages = auditRunPages.filter((page) => pageIds.includes(page.id))
  const foundIds = new Set(pages.map((page) => page.id))
  const unknownIds = pageIds.filter((id) => !foundIds.has(id))

  if (pages.length === 0) {
    return NextResponse.json({ error: "Nenhuma página encontrada para os IDs informados" }, { status: 404 })
  }

  if (unknownIds.length > 0) {
    return NextResponse.json(
      { error: `IDs não encontrados: ${unknownIds.join(", ")}` },
      { status: 400 },
    )
  }

  const result = await generateSeoInsights(pages)
  const parsedResult = seoInsightResultSchema.safeParse(result)

  if (!parsedResult.success) {
    return NextResponse.json({ error: "Resposta interna inválida" }, { status: 500 })
  }

  return NextResponse.json(parsedResult.data)
}
