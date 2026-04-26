# APPLY FLOW KNOWLEDGE BASE

## OVERVIEW
- `src/app/apply/` owns the end-user application wizard: step pages, shell integration, and review/export entrypoint.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Sidebar and flow layout | `layout.tsx` | Nav labels mirror wizard section IDs. |
| Review aggregation | `review/page.tsx` | Pulls draft data into eligibility, scoring, and export. |
| Individual step UI | `*/page.tsx` | Each folder under `apply/` is one step route. |
| Shared wizard contracts | `../../lib/wizard/` | Section order, persistence, and progress rules live there. |
| Shared wizard UI | `../../components/wizard/WizardShell.tsx` | Progress bar, navigation, and shared field/button styles. |

## CONVENTIONS
- Treat these route files as thin UI layers over the shared draft contract.
- Use `src/lib/wizard/types.ts` as the source of truth for section IDs and step order.
- Use the shared draft store rather than introducing parallel page-local persistence models.
- `review/page.tsx` is the integration boundary where draft data is adapted into eligibility, scoring, and export inputs.
- Keep route-level validation close to user input, but move reusable policy into `src/lib/*`.

## ANTI-PATTERNS
- Do not hardcode a second copy of the step sequence or labels inside a page.
- Do not bypass the draft store for state that must survive route transitions.
- Do not move scoring or eligibility rules into the review UI.
- Do not change export-triggering behavior in review without checking `src/lib/export/*` and draft field mapping.

## CHANGE CHECKLIST
- Navigation still matches `SECTIONS` ordering.
- Progress and completion states still make sense after any new field/step change.
- Review still adapts draft data into `ApplicantProfile` and `ScoringInput` correctly.
- PDF/DOCX export still receives the fields it expects.

## RELATED AGENTS
- `../../lib/wizard/AGENTS.md`
- `../../lib/eligibility/AGENTS.md`
- `../../lib/scoring/AGENTS.md`
