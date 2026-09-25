# SEO Audit Lab

Desafio prático de SEO técnico para blogs WordPress. Exibe um dashboard com páginas de auditoria (dados no estilo Google Search Console), classifica a severidade dos problemas e gera recomendações práticas — via IA (OpenRouter) ou por regras locais de fallback.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- Tailwind CSS
- Zod (validação de request/response)
- Vitest + Testing Library
- OpenRouter (opcional, para insights com IA)

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) 10

## Instalação

```bash
pnpm install
cp .env.example .env.local
```

## Configuração

Variáveis em `.env.local` (veja `.env.example`):

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Não* | Chave da API OpenRouter. Sem ela, os insights usam o fallback por regras. |
| `OPENROUTER_MODEL` | Não | Modelo a usar (padrão no código: `meta-llama/llama-3.3-70b-instruct:free`). |

\*Necessária apenas se quiser recomendações geradas por IA.

## Scripts

```bash
pnpm dev      # desenvolvimento (Turbopack)
pnpm build    # build de produção
pnpm start    # sobe o build
pnpm lint     # ESLint
pnpm test     # Vitest
```

Acesse [http://localhost:3000](http://localhost:3000) após `pnpm dev`.

## O que o app faz

1. **Dashboard** — lista páginas mock em `src/data/audit-run-pages.ts` com filtros (busca, severidade, coverage), ordenação e seleção.
2. **Severidade** — `src/lib/audit/severity.ts` deriva ERROR / WARNING / SUCCESS a partir de coverage, robots, noindex, status HTTP, conteúdo fino, etc.
3. **Insights** — selecione páginas e peça recomendações. A rota `POST /api/seo-insights` chama o OpenRouter; se a chave faltar ou a chamada falhar, retorna recomendações locais (`source: "fallback"`).

## Estrutura relevante

```
src/
  app/                  # páginas e API route
  components/           # dashboard, tabela, cards, painel de insights
  data/audit-run-pages.ts
  lib/audit/            # tipos, schemas Zod, severidade, insights
```

## Licença

MIT — ver [LICENSE](LICENSE).
