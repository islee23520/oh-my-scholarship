# oh-my-scholarship Milestone 1: GKS-U AI Interview Web App Vertical Slice

## TL;DR
> **Summary**: Bootstrap a greenfield local web app that interviews a GKS-U applicant one question at a time, stores one local profile, validates required/conditional fields, generates AI-assisted FORM 2/3 drafts, and proves representative DOCX filling without attempting full Forms 1-6 completion.
> **Deliverables**:
> - TypeScript Next.js local web app at repo root
> - 2026 GKS-U canonical schema + track/language validation
> - Consent-gated remote-AI adapter with mock provider for tests
> - One-question-at-a-time web interview UI with single local profile persistence
> - FORM 2/3 editable AI draft support
> - DOCX field inventory + representative text/date/checkbox/multiline fill proof
> - Vitest, Playwright, build, privacy scan, and DOCX proof tests
> **Effort**: Large
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Tasks 3/4/5 → Tasks 6/7/8 → Final Verification

## Context

### Original Request
User wants `oh-my-scholarship`, a tool that automatically fills GKS application forms by asking questions one turn at a time like an AI interview. User provided the official Study in Korea URL and local DOCX path `/Users/ilseoblee/Downloads/★2026 GKS-U Application Forms (1).docx`, pasted the 2026 GKS-U Undergraduate forms text, and requested Metis, Momus, and Oracle to reduce ambiguity.

### Interview Summary
- Interface: **web UI first**.
- AI/privacy: **remote AI allowed**, but only after explicit consent with minimization and no PII in logs/git/tests.
- DOCX Milestone 1 scope: **representative field proof only**, not full form completion.
- Test strategy: **tests-after**.
- Tracks: support **both Embassy Track and University Track** with conditional questions.
- Essays: include **AI-assisted draft support** for FORM 2 Personal Statement and FORM 3 Study Plan.
- Storage: **single local applicant profile**.
- Defaults applied: bootstrap app at repo root; target supplied 2026 GKS-U forms; Korean interview UI; English-only validation for FORM 1 fields where required; TypeScript Next.js stack.

### Metis Review (gaps addressed)
- Added consent gate before any AI call.
- Added provider-agnostic AI adapter plus mock provider for tests.
- Restricted AI to question phrasing/answer structuring and FORM 2/3 draft assistance; validation and DOCX rendering are deterministic code only.
- Added explicit guardrails against eligibility guarantees, scholarship consulting, online submission, recommendation-letter ghostwriting, medical/legal advice, cloud sync, auth, admin dashboard, and multi-template engines.
- Added privacy scan and e2e acceptance criteria that are agent-executable.

## Work Objectives

### Core Objective
Deliver a verifiable Milestone 1 vertical slice: consent → one-turn web interview → structured local profile → validation/completeness report → editable AI essay drafts → representative DOCX fill proof.

### Deliverables
- Root project setup with `package.json`, Next.js, TypeScript, ESLint config, Vitest, Playwright, and privacy scan script.
- `ApplicantProfile` schema with stable field IDs covering Application Checklist and Forms 1-6 at inventory level, with implementation focused on FORM 1 required fields plus representative FORM 2/3/5/6 proof fields.
- Track-aware interview engine for Embassy Track and University Track.
- Consent-gated AI adapter and mock provider.
- Local single-profile persistence and reset.
- DOCX field inventory generated from supplied DOCX and representative output proof.

### Definition of Done (verifiable conditions with commands)
- `npm run build` succeeds.
- `npm run test -- --run` succeeds.
- `npm run test:e2e -- --project=chromium` succeeds.
- `npm run privacy:scan` succeeds.
- Generated DOCX proof test confirms XML/text contains fixture values: `HONG GIL DONG`, `2007-03-14`, a checked marker, and multiline draft text.
- Completion report fixture shows missing required fields and validation errors deterministically.

### Must Have
- One and only one visible next interview question per turn.
- Explicit AI consent before `/api/interview` or `/api/draft` calls.
- Mock AI provider path for tests; real provider configured only through `.env.local`.
- Local profile reset that deletes persisted applicant data.
- English-only validation for FORM 1 fields marked English-only by form instructions.
- FORM 2/3 Korean or English draft support.
- No real applicant data in source, tests, logs, evidence, or commits.

### Must NOT Have
- No full Forms 1-6 completion claim in Milestone 1.
- No eligibility/admission/scholarship-winning guarantee.
- No online submission automation.
- No university recommendation or acceptance prediction.
- No medical/legal advice.
- No recommendation-letter ghostwriting beyond applicant/recommender info capture.
- No multi-user accounts, auth, cloud sync, admin dashboard, or multi-template engine.
- No LLM-direct DOCX editing.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after using Vitest + Playwright + custom privacy scan.
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`.
- Required commands: `npm run build`, `npm run test -- --run`, `npm run test:e2e -- --project=chromium`, `npm run privacy:scan`.

## Execution Strategy

### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Tasks 1-2 (project foundation, schema/inventory foundation)
Wave 2: Tasks 3-6 (privacy/AI adapter, persistence, interview UI/engine, validation)
Wave 3: Tasks 7-8 (essay draft assistant, DOCX proof renderer)
Final Wave: F1-F4 verification agents in parallel

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1. Bootstrap web app and verification baseline | None | 2,3,4,5,6,7,8 |
| 2. Build GKS schema and field inventory | 1 | 5,6,7,8 |
| 3. Implement privacy consent and AI adapter | 1 | 5,7 |
| 4. Implement single local profile persistence | 1,2 | 5,6,7 |
| 5. Implement one-question interview UI/engine | 1,2,3,4 | 6,7 |
| 6. Implement validation and completion report | 1,2,4,5 | 8 |
| 7. Implement FORM 2/3 AI draft assistant | 1,2,3,4,5 | Final |
| 8. Implement DOCX representative proof | 1,2,6 | Final |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → `quick`, `deep`
- Wave 2 → 4 tasks → `deep`, `quick`, `visual-engineering`, `deep`
- Wave 3 → 2 tasks → `deep`, `deep`
- Final → 4 review tasks → `oracle`, `unspecified-high`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Bootstrap Next.js web app and verification baseline

  **What to do**: Initialize the repo root as a TypeScript Next.js app using npm. Add scripts: `dev`, `build`, `test`, `test:e2e`, `privacy:scan`. Add Vitest, React Testing Library, Playwright Chromium config, ESLint, TypeScript strict mode, and `.gitignore` entries for `.env`, `.env.local`, generated DOCX/output folders, Playwright reports, and evidence artifacts. Create a minimal home page with title `oh-my-scholarship` and placeholder route structure for interview, report, and proof export.
  **Must NOT do**: Do not create auth, cloud database, admin dashboard, or deploy config. Do not add real API keys or real applicant fixtures.

  **Recommended Agent Profile**:
  - Category: `quick` - Greenfield scaffolding with clear commands.
  - Skills: `[]` - No special skill required.
  - Omitted: `frontend-ui-ux` - Visual polish is not the milestone focus.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2,3,4,5,6,7,8 | Blocked By: none

  **References**:
  - Pattern: repository root is empty except `.git/` per explore result - bootstrap at root.
  - Requirement: `.sisyphus/drafts/gks-application-interview-tool-milestone-1.md` - confirmed web UI first and tests-after.
  - External: https://nextjs.org/docs/app/getting-started/installation - Next.js setup reference.
  - External: https://playwright.dev/docs/intro - Playwright setup reference.

  **Acceptance Criteria**:
  - [ ] `npm run build` exits 0 and renders a page containing `oh-my-scholarship`.
  - [ ] `npm run test -- --run` exits 0 with at least one smoke test.
  - [ ] `npm run test:e2e -- --project=chromium` exits 0 with a smoke navigation test.
  - [ ] `npm run privacy:scan` exits 0 on synthetic-only repository content.

  **QA Scenarios**:
  ```
  Scenario: Project boots and page renders
    Tool: Bash
    Steps: Run `npm run build && npm run test -- --run`.
    Expected: Both commands exit 0; test output includes the home page title assertion.
    Evidence: .sisyphus/evidence/task-1-bootstrap.txt

  Scenario: Privacy scan blocks secrets
    Tool: Bash
    Steps: Run the privacy scan test suite against a synthetic fixture containing `OPENAI_API_KEY=sk-test-blocked`.
    Expected: Test asserts privacy scanner returns non-zero for the fixture and zero for repo files.
    Evidence: .sisyphus/evidence/task-1-privacy-scan.txt
  ```

  **Commit**: YES | Message: `chore(app): bootstrap web app verification baseline` | Files: root config, app scaffold, test config, privacy scan script

- [x] 2. Build 2026 GKS-U schema and field inventory foundation

  **What to do**: Create a canonical schema module for the supplied 2026 GKS-U forms. Define stable field IDs, form number, source label, required/optional status, language policy, track condition, field type, and validation metadata. Include inventory coverage for Application Checklist and Forms 1-6. Implement active Milestone 1 fields for: application track, application type, degree, field of study, full English name, DOB, gender, citizenship, Korean citizenship yes/no, contact info, language scores, education, university choices, one FORM 2 prompt group, one FORM 3 prompt group, FORM 5 consent checkbox group, and FORM 6 yes/no medical sample. Add unit tests for duplicate IDs and conditional activation.
  **Must NOT do**: Do not hardcode UI labels inside validation logic. Do not treat inventory coverage as full DOCX completion support.

  **Recommended Agent Profile**:
  - Category: `deep` - Requires careful schema boundaries and conditional rules.
  - Skills: `[]` - No special skill required.
  - Omitted: `librarian` - User supplied form text; external research not required.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5,6,7,8 | Blocked By: 1

  **References**:
  - User-pasted DOCX text in conversation - authoritative source for Forms 1-6 fields.
  - Requirement: FORM 1 English-only instruction: “All information must be typed in English ONLY.”
  - Requirement: FORM 2/3 instructions allow Korean or English.
  - Requirement: Embassy/University Track choices from FORM 1 sections 1-3 and university choice section 9.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run schema` exits 0.
  - [ ] Tests fail if any schema field ID is duplicated.
  - [ ] Embassy Track activates Embassy-specific program/university choice rules and deactivates University-only fields.
  - [ ] University Track activates University-specific program/one-university rules and deactivates Embassy-only fields.

  **QA Scenarios**:
  ```
  Scenario: Embassy Track conditional schema
    Tool: Bash
    Steps: Run `npm run test -- --run schema` with fixture `{ applicationTrack: "embassy" }`.
    Expected: Embassy program fields are active; three-choice university structure is active; University-only program fields are inactive.
    Evidence: .sisyphus/evidence/task-2-schema-embassy.txt

  Scenario: Duplicate field ID failure
    Tool: Bash
    Steps: Run schema unit test using an injected duplicate field fixture.
    Expected: Test reports duplicate field ID and exits as expected in the negative assertion.
    Evidence: .sisyphus/evidence/task-2-schema-duplicate.txt
  ```

  **Commit**: YES | Message: `feat(schema): add gks form field inventory` | Files: schema modules and tests

- [x] 3. Implement consent-gated AI adapter with mock provider

  **What to do**: Add AI service abstraction with `mock` provider as default for tests and provider-agnostic real adapter configured only via `.env.local`. Add consent state that must be true before any AI API route sends data. Add request minimization so payload includes only current field, current answer, active validation context, and explicitly selected essay facts; never include the entire completed profile by default. Add tests proving no AI call occurs without consent and payload minimization holds.
  **Must NOT do**: Do not commit `.env.local`. Do not log raw applicant answers. Do not allow LLM to validate eligibility or edit DOCX.

  **Recommended Agent Profile**:
  - Category: `deep` - Privacy-critical API boundary.
  - Skills: `[]` - No special skill required.
  - Omitted: `git-master` - No history manipulation needed.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5,7 | Blocked By: 1

  **References**:
  - Metis directive: AI adapter + mock provider; explicit consent before AI calls.
  - Oracle guardrail: AI must not infer or invent data; store only user-confirmed values.
  - Requirement: Remote AI allowed by user, with privacy safeguards.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run ai` exits 0.
  - [ ] API route returns consent-required error before consent is true.
  - [ ] Mock provider returns deterministic Korean next-question phrasing.
  - [ ] Payload minimization test proves unrelated completed profile fields are absent.

  **QA Scenarios**:
  ```
  Scenario: AI call blocked before consent
    Tool: Bash
    Steps: Run `npm run test -- --run ai` with consent false.
    Expected: API response is 403 or typed `CONSENT_REQUIRED`; mock provider invocation count remains 0.
    Evidence: .sisyphus/evidence/task-3-ai-consent.txt

  Scenario: Payload excludes unrelated PII
    Tool: Bash
    Steps: Run AI payload unit test with profile containing phone/email/passport-like synthetic fields and current field `dateOfBirth`.
    Expected: Payload includes `dateOfBirth` context only and excludes phone/email/passport-like fields.
    Evidence: .sisyphus/evidence/task-3-ai-minimization.txt
  ```

  **Commit**: YES | Message: `feat(ai): add consent gated provider adapter` | Files: AI adapter, API route, consent tests

- [x] 4. Implement single local applicant profile persistence

  **What to do**: Implement a single `ApplicantProfile` store for the web app using browser local storage with schema versioning, migration placeholder, export JSON, and reset/delete. Store only one active profile. Add a visible privacy note that data is stored locally in this browser for Milestone 1. Add tests for save/load/reset and corrupted stored JSON recovery.
  **Must NOT do**: Do not add cloud storage, user accounts, multi-profile switching, or server-side persistence of PII.

  **Recommended Agent Profile**:
  - Category: `quick` - Local persistence with explicit constraints.
  - Skills: `[]` - No special skill required.
  - Omitted: `deep` - Scope is intentionally narrow.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5,6,7 | Blocked By: 1,2

  **References**:
  - User decision: single local applicant profile.
  - Metis directive: no cloud sync, no multi-user, no auth.
  - Schema from Task 2: `ApplicantProfile` is source of truth.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run profile-store` exits 0.
  - [ ] Saving a synthetic profile persists across reload simulation.
  - [ ] Reset removes local storage key and returns app to first screen.
  - [ ] Corrupted JSON is ignored with safe empty profile state and no raw error leak.

  **QA Scenarios**:
  ```
  Scenario: Save and reload local profile
    Tool: Bash
    Steps: Run `npm run test -- --run profile-store`.
    Expected: Synthetic `HONG GIL DONG` fixture reloads from local storage simulation with schema version preserved.
    Evidence: .sisyphus/evidence/task-4-profile-save.txt

  Scenario: Reset deletes profile
    Tool: Playwright
    Steps: Fill synthetic name, click `[data-testid="reset-profile"]`, confirm `[data-testid="confirm-reset"]`.
    Expected: Local storage profile key is absent; first consent screen is visible.
    Evidence: .sisyphus/evidence/task-4-profile-reset.png
  ```

  **Commit**: YES | Message: `feat(profile): add single local applicant profile` | Files: profile store, UI controls, tests

- [x] 5. Implement one-question interview UI and engine

  **What to do**: Build interview route with Korean UI. First ask for consent and application track. Then use deterministic schema gap selection to display exactly one next question at `[data-testid="next-question"]`. Support answer entry, skip, correction, and next. Branch Embassy/University Track fields according to schema. Use AI only to phrase the current question when consent is true; fallback to deterministic Korean question text if AI fails. Add UI tests and Playwright tests proving one-question behavior and AI failure fallback.
  **Must NOT do**: Do not display a full long form as the primary interaction. Do not ask irrelevant track-specific fields. Do not infer unstated values from user answers.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Primary web UI/UX behavior.
  - Skills: `[]` - No special skill required.
  - Omitted: `frontend-ui-ux` skill unavailable in this environment.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 6,7 | Blocked By: 1,2,3,4

  **References**:
  - User requirement: “한턴 한턴 ai 인터뷰 하듯 질문”.
  - Task 2 schema conditions.
  - Task 3 AI consent/adapter.
  - Task 4 local profile store.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run interview-engine` exits 0.
  - [ ] `npm run test:e2e -- --project=chromium` includes interview flow and exits 0.
  - [ ] Before consent, `[data-testid="interview-start"]` is disabled and `/api/interview` call count is 0.
  - [ ] After Embassy Track selection, exactly one `[data-testid="next-question"]` is visible.
  - [ ] Mock AI 500 response shows Korean fallback and still exactly one question.

  **QA Scenarios**:
  ```
  Scenario: One question per turn
    Tool: Playwright
    Steps: Open app, check consent, select Embassy Track, click `[data-testid="interview-start"]`, fill `[data-testid="answer-input"]` with `HONG`, click `[data-testid="answer-submit"]`.
    Expected: At every step after start, locator `[data-testid="next-question"]` has count 1.
    Evidence: .sisyphus/evidence/task-5-one-question.png

  Scenario: AI failure fallback
    Tool: Playwright
    Steps: Enable mock AI 500 mode, consent, start interview, submit one answer.
    Expected: `[data-testid="ai-fallback-notice"]` contains Korean fallback message; one deterministic next question remains visible.
    Evidence: .sisyphus/evidence/task-5-ai-fallback.png
  ```

  **Commit**: YES | Message: `feat(interview): add one question web flow` | Files: interview engine, UI route, tests

- [x] 6. Implement validation and completion report

  **What to do**: Implement deterministic validation for required fields, track conditions, date format `YYYY-MM-DD`, email format, phone country-code hint, English-only FORM 1 fields, and missing/invalid/complete statuses. Add a report route showing missing fields, invalid fields, skipped fields, and ready-for-DOCX-proof status. Add tests for English-only failure, FORM 2/3 language allowance, invalid dates/emails, missing required fields, and conditional track report accuracy.
  **Must NOT do**: Do not mark an application “officially ready to submit”; only mark “ready for Milestone 1 DOCX proof”. Do not use LLM for validation decisions.

  **Recommended Agent Profile**:
  - Category: `deep` - Deterministic correctness and edge cases.
  - Skills: `[]` - No special skill required.
  - Omitted: `oracle` - Architecture decision already resolved.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1,2,4,5

  **References**:
  - FORM 1 instruction: all information typed in English only.
  - FORM 2/3 instruction: Korean or English allowed.
  - Metis QA directives for invalid email/date/English-only cases.
  - Oracle recommendation: ready/incomplete/needs-review statuses.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run validation` exits 0.
  - [ ] `applicant.nameEnglish = "홍길동"` returns `ENGLISH_ONLY`.
  - [ ] `applicant.nameEnglish = "HONG GIL DONG"` passes.
  - [ ] FORM 2/3 Korean draft text passes language validation.
  - [ ] Missing date of birth appears in completion report.
  - [ ] Invalid email appears as invalid, not missing.

  **QA Scenarios**:
  ```
  Scenario: FORM 1 English-only validation
    Tool: Bash
    Steps: Run `npm run test -- --run validation`.
    Expected: Korean name in English-only field returns `ENGLISH_ONLY`; English uppercase fixture passes.
    Evidence: .sisyphus/evidence/task-6-english-validation.txt

  Scenario: Completion report distinguishes missing and invalid
    Tool: Bash
    Steps: Run validation tests with missing DOB and `email: "bad-email"`.
    Expected: Report contains DOB under `missing` and email under `invalid`.
    Evidence: .sisyphus/evidence/task-6-completion-report.json
  ```

  **Commit**: YES | Message: `feat(validation): add gks completeness report` | Files: validators, report UI, tests

- [x] 7. Implement FORM 2/3 editable AI draft assistant

  **What to do**: Add essay draft route/section for FORM 2 Personal Statement and FORM 3 Study Plan. Use confirmed profile facts and user-provided bullet answers to call AI only after consent. Generate editable drafts with labels: “초안 — 반드시 사용자가 검토/수정해야 함”. Support Korean or English draft mode. Store accepted draft text only after user clicks `[data-testid="accept-draft"]`. Add tests that draft generation uses minimal facts, does not claim admission success, and handles AI failure with a retry/fallback prompt.
  **Must NOT do**: Do not generate final unreviewed essays. Do not fabricate awards, experiences, grades, publications, or medical facts. Do not write recommendation letters.

  **Recommended Agent Profile**:
  - Category: `deep` - AI boundary and content safety matter.
  - Skills: `[]` - No special skill required.
  - Omitted: `writing` - This is product behavior planning/implementation, not prose-only.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Final | Blocked By: 1,2,3,4,5

  **References**:
  - FORM 2 instructions: motivations, educational background, experiences, activities, awards/publications/skills.
  - FORM 3 instructions: language study plan, goal/study plan, future plan.
  - User decision: AI-assisted draft support in Milestone 1.
  - Privacy rule from Task 3: minimized AI payload only.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run essay-draft` exits 0.
  - [ ] AI draft payload excludes unrelated sensitive profile fields.
  - [ ] Draft is not persisted until `[data-testid="accept-draft"]` is clicked.
  - [ ] Generated or mock draft containing “guaranteed acceptance” is rejected or flagged by safety check.
  - [ ] Korean draft input/output path passes validation.

  **QA Scenarios**:
  ```
  Scenario: Draft requires explicit acceptance
    Tool: Playwright
    Steps: Enter synthetic motivation bullets, click `[data-testid="generate-form2-draft"]`, then reload before accepting.
    Expected: Draft preview is shown before reload; persisted profile has no FORM 2 draft until `[data-testid="accept-draft"]` is clicked.
    Evidence: .sisyphus/evidence/task-7-draft-acceptance.png

  Scenario: Unsafe guarantee wording blocked
    Tool: Bash
    Steps: Run `npm run test -- --run essay-draft` with mock AI returning `This guarantees admission`.
    Expected: Safety check flags the text and UI displays revision-required state.
    Evidence: .sisyphus/evidence/task-7-draft-safety.txt
  ```

  **Commit**: YES | Message: `feat(essays): add editable ai draft assistant` | Files: essay UI, draft service, tests

- [x] 8. Implement DOCX structure inventory and representative fill proof

  **What to do**: Add a read-only DOCX inspection script for `/Users/ilseoblee/Downloads/★2026 GKS-U Application Forms (1).docx` that extracts document XML/text inventory into a generated ignored artifact. Implement deterministic representative proof renderer using the supplied template or a test fixture copy. Fill only representative fields: full name text `HONG GIL DONG`, date `2007-03-14`, one checked Application Track or agreement checkbox marker, and one multiline FORM 2/3 draft text. Generate a completion report JSON next to output. Add tests that unzip generated DOCX and inspect XML/text for expected synthetic values.
  **Must NOT do**: Do not claim all fields are mapped. Do not modify the original DOCX in Downloads. Do not let AI modify DOCX. Do not commit generated filled forms.

  **Recommended Agent Profile**:
  - Category: `deep` - DOCX structure and deterministic proof are risky.
  - Skills: `[]` - No special skill required.
  - Omitted: `visual-engineering` - Work is document processing, not UI polish.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Final | Blocked By: 1,2,6

  **References**:
  - Local DOCX: `/Users/ilseoblee/Downloads/★2026 GKS-U Application Forms (1).docx` - inspect read-only and copy before writing.
  - User-pasted forms: target fields include FORM 1 name/DOB/track, FORM 2/3 multiline, FORM 5 checkboxes.
  - Oracle recommendation: text cell, multiline area, checkbox, date/name field proof.
  - Metis directive: representative proof only, no full form completion.

  **Acceptance Criteria**:
  - [ ] `npm run test -- --run docx` exits 0.
  - [ ] Inspection script never writes to the original Downloads DOCX.
  - [ ] Generated proof DOCX is written only under ignored output path.
  - [ ] DOCX XML/text contains `HONG GIL DONG`, `2007-03-14`, one checked marker, and multiline draft text.
  - [ ] Completion report states `scope: "representative-proof"` and lists unmapped forms/fields as out of Milestone 1 scope.

  **QA Scenarios**:
  ```
  Scenario: Representative DOCX proof contains fixture values
    Tool: Bash
    Steps: Run `npm run test -- --run docx`.
    Expected: Test unzips generated proof and finds `HONG GIL DONG`, `2007-03-14`, checked marker, and multiline text in XML/text.
    Evidence: .sisyphus/evidence/task-8-docx-proof.txt

  Scenario: Original template is not modified
    Tool: Bash
    Steps: Test records checksum/mtime of `/Users/ilseoblee/Downloads/★2026 GKS-U Application Forms (1).docx`, runs renderer, then compares checksum/mtime.
    Expected: Original template checksum and mtime remain unchanged; output exists only in ignored generated directory.
    Evidence: .sisyphus/evidence/task-8-template-unchanged.txt
  ```

  **Commit**: YES | Message: `feat(docx): add representative gks proof renderer` | Files: DOCX inventory/rendering modules, fixtures, tests

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
  - Verify every Must Have/Must NOT Have and each task acceptance criterion was executed.
  - Evidence: `.sisyphus/evidence/f1-plan-compliance.md`
- [x] F2. Code Quality Review — unspecified-high
  - Run static review for TypeScript strictness, boundaries, AI adapter isolation, schema readability, and no AI slop patterns.
  - Evidence: `.sisyphus/evidence/f2-code-quality.md`
- [x] F3. Real Manual QA — unspecified-high (+ Playwright)
  - Execute Playwright browser flow: consent gate, Embassy path, University path, AI fallback, draft accept, reset.
  - Evidence: `.sisyphus/evidence/f3-manual-qa.md` and screenshots.
- [x] F4. Scope Fidelity Check — deep
  - Confirm no full form completion claim, no eligibility advice, no online submission, no cloud/auth/multi-user/multi-template expansion.
  - Evidence: `.sisyphus/evidence/f4-scope-fidelity.md`

## Commit Strategy
- Commit after each numbered task if all its acceptance criteria pass.
- Never commit `.env`, `.env.local`, generated applicant profiles, filled DOCX outputs, Playwright reports, or evidence artifacts unless explicitly intended and synthetic.
- Use conventional commit messages listed in each task.
- Final pre-handoff command sequence: `npm run build && npm run test -- --run && npm run test:e2e -- --project=chromium && npm run privacy:scan`.

## Success Criteria
- A user can open the local web app, consent to AI, answer one question at a time, choose Embassy or University Track, save one local profile, generate editable FORM 2/3 draft text, view deterministic validation/completion status, and generate a representative DOCX proof with synthetic field checks passing.
- The implementation remains a safe Milestone 1 vertical slice and does not overclaim full GKS submission readiness.
