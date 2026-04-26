# WIZARD DOMAIN KNOWLEDGE BASE

## OVERVIEW
- `src/lib/wizard/` owns the application draft contract, section ordering, local persistence, and completion/progress logic.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Draft schema | `types.ts` | `ApplicationDraft` and `SECTIONS` are core contracts. |
| Persistence and updates | `store.ts` | LocalStorage-backed store with `useSyncExternalStore`. |
| Progress computation | `progress.ts` | Derives per-section status and overall percentage. |

## CONVENTIONS
- Treat `types.ts`, `store.ts`, and `progress.ts` as one coordinated unit.
- Preserve SSR/client safety around `window` and `localStorage`; this store is consumed from client routes.
- When draft fields change, update empty draft defaults, patch/update helpers, progress derivation, and all consumers together.
- `SECTIONS` is the canonical step order used by apply layout and shared wizard UI.
- Essay completion logic depends on limits from `src/lib/ai/prompts.ts`; keep those contracts aligned.

## ANTI-PATTERNS
- Do not add fields to `ApplicationDraft` without updating `emptyDraft()`.
- Do not duplicate section order in route or component files.
- Do not replace the external-store pattern with ad hoc local state unless the whole consumer model changes.
- Do not make persistence logic browser-unsafe during SSR hydration.

## CHANGE CHECKLIST
- New draft fields have defaults.
- Patch/update helpers still preserve `updatedAt` semantics.
- Progress output still matches current step set.
- Apply routes and wizard components still compile against the contract.

## NOTES
- There are no wizard-specific tests yet; manual flow verification matters after contract changes.
