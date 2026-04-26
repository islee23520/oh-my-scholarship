# ELIGIBILITY ENGINE KNOWLEDGE BASE

## OVERVIEW
- `src/lib/eligibility/` owns deterministic eligibility checks, blockers, warnings, and track derivation for GKS applicants.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Core rule engine | `engine.ts` | Age, nationality, GPA, and track decisions live here. |
| Types and result shapes | `types.ts` | Shared contract for inputs, blockers, warnings, and tracks. |
| Executable behavior spec | `engine.test.ts` | Update tests first for rule changes. |
| Source rule data | `../../../data/eligibility-rules.json` | GPA thresholds and cutoffs. |
| Country support list | `../../../data/countries.json` | NIIED-designated countries and quota-related data. |

## CONVENTIONS
- Keep the engine deterministic and data-driven.
- Prefer changing JSON rule/reference data before introducing new hardcoded policy branches.
- Preserve the stable output shape of `EligibilityResult`, including blocker/warning codes used by UI.
- Keep UI concerns out of this layer; this module should return facts and messaging, not presentation.

## ANTI-PATTERNS
- Do not scatter eligibility policy into route components.
- Do not change blocker/warning codes casually; downstream UI may depend on them.
- Do not add nondeterministic behavior or network access here.
- Do not change rule behavior without updating `engine.test.ts`.

## CHANGE CHECKLIST
- Tests updated first when rule behavior changes.
- JSON data and TS logic still agree on scale keys and track names.
- `evaluateEligibility()` still returns empty `eligibleTracks` when blockers exist.
- Borderline-threshold warnings still behave intentionally.
