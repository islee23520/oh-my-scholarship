# SCORING ENGINE KNOWLEDGE BASE

## OVERVIEW
- `src/lib/scoring/` owns rubric points, bonus calculations, competitiveness tiering, and typed score output used by review surfaces.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Rubric math | `rubric.ts` | Academic, language, and bonus point calculations. |
| Competitiveness tiering | `competitiveness.ts` | Country quota + rubric heuristics. |
| Shared scoring types | `types.ts` | Contracts consumed by UI and other logic. |
| Executable behavior spec | `scoring.test.ts` | Update tests first for scoring changes. |
| Country reference data | `../../../data/countries.json` | Embassy quota lookups feed competitiveness reasoning. |

## CONVENTIONS
- Keep calculations deterministic, explainable, and traceable to current inputs/reference data.
- Treat returned line items, reasons, and suggestions as part of the public contract consumed by the review UI.
- Keep rubric scoring separate from competitiveness heuristics even when both are shown together.
- Preserve typed boundaries between scoring inputs and display formatting.

## ANTI-PATTERNS
- Do not bury scoring rules in page components.
- Do not make tier logic opaque; preserve reason/suggestion output when behavior changes.
- Do not couple rubric math to UI wording unless the contract intentionally changes.
- Do not change scoring behavior without updating `scoring.test.ts`.

## CHANGE CHECKLIST
- Tests updated first for rubric/tier changes.
- Country quota lookups still match current data shape.
- `total`, `max`, line items, tier, reasons, and suggestions remain coherent together.
- Review UI still has enough structured output to explain the score.
