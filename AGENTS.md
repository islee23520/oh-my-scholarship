<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PROJECT KNOWLEDGE BASE

## OVERVIEW
- GKS undergraduate application helper built on Next.js 16 App Router, React 19, TypeScript, Tailwind 4, and Vitest.
- Main product areas: eligibility screening, multi-step application wizard, rubric/competitiveness scoring, essay feedback, and PDF/DOCX export.

## STRUCTURE
```text
.
├── src/app/                  # routes, layouts, API handlers
│   ├── apply/                # multi-step application flow
│   └── api/ai/essay-feedback # Anthropic-backed essay review route
├── src/lib/                  # domain logic and shared contracts
│   ├── wizard/               # draft shape, persistence, progress, section order
│   ├── eligibility/          # blocker/warning rules engine
│   ├── scoring/              # rubric + competitiveness calculations
│   ├── ai/                   # essay prompts, limits, feedback schema
│   └── export/               # PDF/DOCX generators
├── src/components/wizard/    # flow-specific UI shell/fields
├── data/                     # JSON reference datasets and rules
├── supabase/migrations/      # schema evolution (currently one migration)
├── docs/                     # source PDFs for official GKS guidance
└── .sisyphus/                # plans, QA artifacts, and session evidence
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Understand the main product flow | `src/app/apply/` | Primary user journey; see local AGENTS there first. |
| Change draft fields or step order | `src/lib/wizard/` | `types.ts`, `store.ts`, and `progress.ts` form one contract. |
| Change eligibility rules | `src/lib/eligibility/` | Data-driven engine backed by JSON reference data and tests. |
| Change rubric or competitiveness logic | `src/lib/scoring/` | Deterministic scoring with tests. |
| Change essay prompts or limits | `src/lib/ai/prompts.ts` | Keep prompt schema aligned with API JSON parsing. |
| Change AI feedback endpoint | `src/app/api/ai/essay-feedback/route.ts` | Node runtime; expects `ANTHROPIC_API_KEY`. |
| Change export output | `src/lib/export/` | Review flow imports these dynamically. |
| Check source rule data | `data/*.json` | Eligibility, GPA, country, and university reference data live here. |
| Review database shape | `supabase/migrations/0001_init.sql` | Only migration currently present. |
| Check official scholarship docs | `docs/*.pdf` | Treat as reference inputs, not editable product logic. |

## LOCAL AGENTS
- `src/app/apply/AGENTS.md`
- `src/lib/wizard/AGENTS.md`
- `src/lib/eligibility/AGENTS.md`
- `src/lib/scoring/AGENTS.md`

## CONVENTIONS
- Follow current import aliasing: `@/*` maps to `src/*`.
- Keep calculation layers deterministic and data-driven. `eligibility` and `scoring` should not absorb UI concerns.
- Treat `data/*.json` as canonical rule/reference inputs before adding hardcoded constants in TS.
- The apply flow is contract-first: section order comes from `src/lib/wizard/types.ts`, progress comes from `src/lib/wizard/progress.ts`, and UI pages consume the shared draft store.
- Essay review uses a strict JSON contract: prompt shape in `src/lib/ai/prompts.ts` must stay compatible with parsing in `src/app/api/ai/essay-feedback/route.ts`.
- Export logic is downstream of the draft contract. When draft fields move, review/export code must be updated together.

## ANTI-PATTERNS (THIS PROJECT)
- Do not assume generic Next.js guidance applies; check `node_modules/next/dist/docs/` first for this pinned version.
- Do not duplicate wizard section lists, labels, or draft shape inside route files.
- Do not encode eligibility/scoring policy directly in UI components when `src/lib/eligibility` or `src/lib/scoring` should own it.
- Do not treat `docs/*.pdf`, `.sisyphus/`, or `.generated/` as primary places for application logic.
- Do not break the AI feedback JSON schema without updating both the prompt and server-side parser.

## COMMANDS
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
```

## NOTES
- Tests currently cover `src/lib/eligibility` and `src/lib/scoring`; wizard and apply-flow changes need manual verification.
- `vitest.config.ts` only includes `src/**/*.test.ts` and uses the `@` alias.
- `next.config.ts` is currently minimal; do not infer custom runtime behavior from it.
- `.sisyphus/` contains planning and QA evidence from prior work; useful for context, not product runtime.
