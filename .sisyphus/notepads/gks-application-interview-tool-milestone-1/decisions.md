# Decisions

## 2026-04-26 Task 6 Validation and completion report
- Kept validation deterministic and schema-driven in `lib/validation.ts`; no AI or heuristic language detection is used for readiness decisions.
- Treated Form 1 `english-only` as strict ASCII-only validation to match the requirement that Korean/CJK input must fail while names like `HONG GIL DONG` pass.
- Counted conditional milestone rows as `skipped` instead of `missing` when `getMilestoneFields()` marks them inactive for the selected track/profile.
- Limited `readyForDocxProof` to active required Milestone 1 fields only, so the status remains a DOCX-proof gate and not a broader application submission verdict.
