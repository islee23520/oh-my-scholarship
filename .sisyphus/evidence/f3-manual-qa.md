VERDICT: APPROVE

# F3 Real Manual QA

## Method
- Browser: Chrome DevTools (chromium) via MCP
- Dev server: `npm run dev` on localhost:3000
- Date: 2026-04-26

## Test Flows Executed

### 1. Home page (/)
- **Status: PASS**
- Heading "oh-my-scholarship" visible
- Privacy note: "이 브라우저에 데이터가 로컬로 저장됩니다 (Milestone 1)."
- 4 nav links: Interview, Essay drafts, Report, Proof export
- No console errors

### 2. Interview consent gate (/interview)
- **Status: PASS**
- Heading "인터뷰 시작" visible
- Consent checkbox unchecked by default
- "시작하기" button disabled until consent checked
- After checking consent, button becomes enabled
- No console errors

### 3. Track selection
- **Status: PASS**
- After clicking "시작하기", track selection appears
- Two buttons: "대사관 트랙 (Embassy Track)" and "대학 트랙 (University Track)"
- Both buttons clickable

### 4. Embassy track interview flow
- **Status: PASS**
- Clicking Embassy track shows first question: "다음 질문입니다. Application Type 항목을 위해 구체적으로 설명해 주세요."
- Text input and "제출" button visible
- Mock AI provides Korean fallback text (deterministic)

### 5. Report page (/report)
- **Status: PASS**
- Heading "Milestone 1 DOCX proof 준비 상태" visible
- Shows Embassy track (대사관 트랙) as default
- Completion count: 6/38 active items
- 32 missing, 0 invalid, 8 skipped
- Correctly lists missing fields (Application Type, Degree, etc.)
- Correctly lists skipped fields (Associate degree, University track choice)
- Disclaimer: "공식 제출 판정은 아니며, Milestone 1 DOCX proof 정리 기준만 제공합니다."
- No console errors

### 6. Draft page (/interview/drafts)
- **Status: PASS**
- Heading "에세이 초안 도우미" visible
- Consent checkbox unchecked by default → generate buttons disabled
- Language selector (Korean/English) present
- Bullet textarea present with placeholder
- After checking consent and entering bullets, generate buttons enabled

### 7. Draft generation and safety check
- **Status: PASS**
- Clicked FORM 2 draft generation
- Draft preview appears with editable textarea
- Label "초안 — 반드시 사용자가 검토/수정해야 함" visible above preview
- Safety warning correctly flags "admission guarantee claim" and "acceptance guarantee claim"
- Mock AI returns deterministic Korean draft text

### 8. Draft accept
- **Status: PASS**
- Clicked "초안 수락 및 저장" button (data-testid="accept-draft")
- Confirmation message: "초안을 저장했습니다. 필요하면 다시 열어 수정할 수 있습니다."
- No console errors (after fix: duplicate React key warning resolved)

## Console Errors
- **Before fix**: React key uniqueness warning in safety flags display (duplicate "admission guarantee claim")
- **After fix**: Zero console errors on all pages

## Summary
All 8 browser flows pass. Consent gate, Embassy/University track selection, AI fallback, report page, draft generation, safety check, and draft accept all work correctly. The app correctly labels drafts as requiring user review and does not claim submission readiness.
