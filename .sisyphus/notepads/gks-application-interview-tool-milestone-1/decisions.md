# Decisions

## 2026-04-26 Task 6 Validation and completion report
- Kept validation deterministic and schema-driven in `lib/validation.ts`; no AI or heuristic language detection is used for readiness decisions.
- Treated Form 1 `english-only` as strict ASCII-only validation to match the requirement that Korean/CJK input must fail while names like `HONG GIL DONG` pass.
- Counted conditional milestone rows as `skipped` instead of `missing` when `getMilestoneFields()` marks them inactive for the selected track/profile.
- Limited `readyForDocxProof` to active required Milestone 1 fields only, so the status remains a DOCX-proof gate and not a broader application submission verdict.

## 2026-04-26 Task 8 DOCX representative proof
- Implemented DOCX proof as a copy-first archive rewrite in `lib/docx-renderer.ts`; the original file is never opened for write and the synthetic proof is appended only to the copied output under `.generated/`.
- Kept completion reporting intentionally partial with `scope: "representative-proof"`, listing mapped representative fields and leaving the rest in `unmappedFields`/`unmappedForms` to avoid any claim of full form coverage.
- Added `.generated/` to repository ignore and privacy-scan ignore lists so generated inventories and proof artifacts stay local and do not pollute repository scans.

## 2026-04-26 Task 7 Essay draft assistant
- Reused `ConsentGatedAIAdapter` through the draft service and API route so consent enforcement remains server-side and consistent with the existing interview AI flow.
- Kept draft safety checking deterministic via regex flags for guarantee/success claims instead of trying to block or rewrite text heuristically.
- Preserved the schema shape by saving accepted FORM 2 text to `profile.form2PersonalStatement` and accepted FORM 3 text to `profile.form3StudyPlan.{languageStudyPlan,goalStudyPlan,futurePlan}` only after explicit accept.
- Fixed `lib/interview-engine.ts` strict type assignments while validating this task because `next build` surfaced existing `unknown` assignment errors that would otherwise block shipment.

## 2026-04-26 F1 Plan Compliance Audit
- Recorded F1 verdict as REJECT because explicit plan requirements are still unmet, even though the handoff context says build/tests/e2e/privacy scan passed.
- Treated the plan's exact Must Have list and the task's stricter privacy roll-up as separate checks: the repo appears free of real applicant data, but it still fails the stricter “no PII in logs/git/tests” interpretation.
