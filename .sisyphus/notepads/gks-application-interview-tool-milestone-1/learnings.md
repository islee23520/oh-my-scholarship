# Learnings
- Repo root baseline: .DS_Store, .git/, .sisyphus/, docs/ - no web app files present (no package.json, tsconfig.json, next.config.*, app/, pages/, tests/, playwright.config.*, .eslintrc*, jest.config*)
- opencode.json and oh-my-openagent.jsonc not found at root - no conflict with bootstrap
- Notepads exist: learnings.md (appended), issues.md (prior delegation aborts noted), decisions.md empty, problems.md empty
- Task 1 gaps: all Next.js scaffold (package.json, tsconfig, app/, tests/, playwright, eslint, vitest) must be created at root without overwriting existing operational files

## 2026-04-26 Bootstrap Guidance: Next.js 16 + TypeScript + Vitest + RTL + Playwright

### Official Documentation References

**Next.js 16.2.4 (App Router)**
- Installation: https://nextjs.org/docs/app/getting-started/installation
- Getting Started: https://nextjs.org/docs/app/getting-started
- Key: `create-next-app@latest` scaffolds TypeScript, ESLint, Tailwind, App Router by default
- Minimum Node.js: 20.9+
- Default scripts: `dev`, `build`, `start`, `lint`, `lint:fix`

**Vitest 4.1.5**
- Getting Started: https://vitest.dev/guide/
- Config Reference: https://vitest.dev/config/
- Key: Reads `vite.config.ts` by default; can use separate `vitest.config.ts` for test-only settings
- Requires Vite >=v6.0.0 and Node >=v20.0.0
- Default test pattern: `*.test.*` or `*.spec.*`

**React Testing Library (latest)**
- Intro: https://testing-library.com/docs/react-testing-library/intro/
- Setup: https://testing-library.com/docs/react-testing-library/setup
- Installation: `npm install --save-dev @testing-library/react @testing-library/dom`
- With TypeScript: Also install `@types/react @types/react-dom`
- Key: Vitest + RTL requires `globals: true` in vitest config OR manual `afterEach(cleanup)` hook

**Playwright 1.58+ (Chromium)**
- Installation: https://playwright.dev/docs/intro
- Configuration: https://playwright.dev/docs/test-configuration
- Key: `npm init playwright@latest` scaffolds full setup; can add to existing project
- Default: Runs headless in parallel across Chromium, Firefox, WebKit
- For Chromium-only: Configure `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`

### Required Files for Task 1 Baseline

**package.json**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  },
  "dependencies": {
    "next": "^16.2.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.0",
    "@testing-library/react": "^latest",
    "@testing-library/dom": "^latest",
    "@types/node": "^latest",
    "@types/react": "^latest",
    "@types/react-dom": "^latest",
    "typescript": "^5.1.0",
    "vitest": "^4.1.5",
    "eslint": "^latest"
  }
}
```

**tsconfig.json** (Next.js auto-generates with recommended settings)
- Includes `"jsx": "preserve"` for Next.js
- Includes `"paths": { "@/*": ["./*"] }` for import aliases
- Minimum TypeScript: v5.1.0

**next.config.js** (minimal)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

**vitest.config.ts** (separate from vite.config.ts)
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

**vitest.setup.ts** (auto-cleanup for RTL)
```typescript
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

**playwright.config.ts** (Chromium-only for local baseline)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**app/layout.tsx** (root layout, required)
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**app/page.tsx** (home page)
```typescript
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

**eslint.config.mjs** (Next.js 16 uses flat config)
```javascript
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
]
```

### Directory Structure
```
project-root/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── e2e/
│   └── example.spec.ts
├── __tests__/
│   └── example.test.tsx
├── public/
├── node_modules/
├── package.json
├── tsconfig.json
├── next.config.js
├── vitest.config.ts
├── vitest.setup.ts
├── playwright.config.ts
└── eslint.config.mjs
```

### Key Commands
- `npm run dev` — Start Next.js dev server (Turbopack by default)

## 2026-04-26 Task 7 Essay draft assistant
- `lib/essay-draft-service.ts` now centralizes FORM 2/3 draft generation, deterministic safety checks, fallback prompt generation, and accept-time persistence.
- Draft generation uses `minimizePayload(profile, fieldId)` plus a small whitelist of relevant profile facts and user bullets; email/address/medical fields are intentionally excluded from AI facts.
- `/interview/drafts` keeps generated text in local component state only; nothing is written to `ProfileStore` until `[data-testid="accept-draft"]` is clicked.
- FORM 3 accept flow stores into all three `form3StudyPlan` subfields; when section headings are present they are split, otherwise the accepted text is copied into each subfield to avoid silent data loss.
- Vitest needed explicit `@` alias resolution in `vitest.config.ts` for app-level tests that import project aliases.

## 2026-04-26 Profile Store Notes
- Single-profile persistence works best as one JSON blob under a fixed key (`oh-my-scholarship-profile`) with a top-level `_version` wrapper and the actual `ApplicantProfile` payload nested inside.
- Corrupted JSON should fail closed to `{}`; export can safely re-serialize the current loaded profile so the UI gets a deterministic download string.
- In this repo's test runtime, `localStorage` was not reliable enough to use directly, so a tiny in-memory `ProfileStorageLike` shim kept the store logic testable without changing the browser-facing behavior.
- The privacy note is exposed as a shared constant and rendered on the home page so later UI work can reuse the exact Milestone 1 wording.

## 2026-04-26 Task 3 AI Adapter Learnings
- `lib/gks-schema.ts` already exposes `getFieldById`, so AI payload minimization can stay schema-driven instead of duplicating field labels or validation metadata elsewhere.
- For privacy-safe prompting, `minimizePayload(profile, currentFieldId)` should return only the active field metadata plus a field-specific `profileExcerpt`; this prevents sending unrelated profile sections such as address, email, or essay content by default.
- Vitest/jsdom remains unsuitable for direct Next.js Route Handler behavior checks, so Task 3 verification is best anchored in unit tests for `ConsentGatedAIAdapter` and `minimizePayload`, while the route files stay thin wrappers around the service.
- A mock-first adapter works cleanly in this repo: default to `MockAIProvider` unless `process.env.OPENAI_API_KEY` exists, which keeps tests offline and allows `.env.local`-only real-provider configuration.
- `npm run test` — Run Vitest in watch mode
- `npm run test:ui` — Run Vitest with UI dashboard
- `npm run e2e` — Run Playwright tests (headless)
- `npm run e2e:ui` — Run Playwright with UI Mode
- `npm run build && npm run start` — Production build + server

## 2026-04-26 Task 2 Schema Foundation
 

## 2026-04-26 Task 8 DOCX Representative Proof
- `jszip` alone is sufficient for Milestone 1 DOCX proof work: the renderer can copy the template, replace only `word/document.xml` in the copied archive, and leave the original DOCX hash/mtime unchanged.
- A read-only inventory pass is easiest when it stores XML/text parts verbatim and derives a lightweight form map from visible headings (`FORM 1`-`FORM 6`) plus synthetic placeholder markers like `[[form1.section5.givenName]]`.
- Representative proof should stay explicit and narrow: append a clearly synthetic block with `HONG GIL DONG`, `2007-03-14`, one checked Wingdings marker (`F0FE`), and multiline draft text rather than pretending to map the full template.
- CLI coverage is practical with `scripts/docx-inspect.mjs` writing JSON under `.generated/`, while tests can call it via `child_process.execFile` and inspect the emitted inventory file.
- Added `lib/gks-schema.ts` as the canonical 2026 GKS-U schema inventory module with strict exported types (`GksField`, `GksFieldId`, `ApplicantProfile`, `LanguagePolicy`, `TrackCondition`, `FieldStatus`) and pure TypeScript helpers only.
- Inventory coverage now spans Application Checklist plus Forms 1-6. Milestone 1 focus stays limited to active interview-critical fields while non-milestone entries remain metadata-only inventory coverage.
- `getActiveFields(track, profile)` combines static `trackCondition` with profile-aware `isActive` predicates so Embassy 3-choice university sections, University single-choice sections, associate-degree education rows, and medical explanation rows can be toggled without embedding UI labels in validation logic.
- `npm run test -- --run schema` initially failed because Vitest in this repo does not yet resolve the `@/*` tsconfig alias automatically through Vite config. Using a relative import in `lib/gks-schema.test.ts` fixed the issue without changing Task 1 config.
- Verification passed for the new schema module: zero LSP diagnostics on modified files, `npm run test -- --run schema`, `npm run test -- --run`, and `npm run build`.

### Gotchas & Compatibility Notes

1. **Vitest + jsdom + Next.js**: Vitest's jsdom environment does NOT include Next.js server-side features (Server Components, Route Handlers, etc.). Use Vitest for unit/component tests only; use Playwright for full-stack e2e.

2. **RTL Cleanup**: Vitest requires either `globals: true` in config OR manual `afterEach(cleanup)` in setup file. Without this, DOM state leaks between tests.

3. **Playwright + Next.js Dev Server**: Use `webServer.reuseExistingServer: !process.env.CI` to avoid port conflicts during local development.

4. **TypeScript in Next.js 16**: App Router uses React canary releases built-in. Declare `react` and `react-dom` in package.json for tooling compatibility, even though App Router doesn't strictly require them.

5. **ESLint in Next.js 16**: `next lint` no longer runs automatically during `next build`. Use explicit npm scripts instead.

6. **Playwright Chromium-only**: For local baseline, configure only Chromium project. Add Firefox/WebKit projects later if needed.

7. **Vitest Config Override**: If using separate `vitest.config.ts`, it OVERRIDES `vite.config.ts` entirely. Use `mergeConfig()` to extend Vite config if needed.

### Minimal Test Examples

**Unit Test (Vitest + RTL)**
```typescript
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from '@/components/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

**E2E Test (Playwright)**
```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Hello, Next.js!')
})
```

### Installation Order (Recommended)
1. `npx create-next-app@latest my-app --yes` (scaffolds Next.js + TypeScript + ESLint)
2. `npm install -D vitest @testing-library/react @testing-library/dom`
3. `npm init playwright@latest` (scaffolds Playwright config + example tests)
4. Create `vitest.config.ts` and `vitest.setup.ts`
5. Create `__tests__/` directory for unit tests
6. Create `e2e/` directory for Playwright tests (if not auto-created)


## 2026-04-26 Privacy/Secret Scan Research — Task 1 Baseline

### Authoritative Findings

#### 1. **Lightweight Custom Script is Best for Task 1 Scope**

**Why not heavy tools?**
- GitHub Secret Scanning (free tier) requires public repo + GitHub Advanced Security (enterprise)
- npm packages like `@onamfc/security-scanner`, `ship-safe`, `@raj-dev/guardrail` add 5–20 dependencies
- Task 1 acceptance criteria require **synthetic-only repo content** + **zero findings on repo files** — a custom test-based approach is simpler and more transparent

**Recommended approach: Custom Vitest test + minimal regex patterns**
- Zero npm dependencies beyond Vitest (already required)
- Runs as `npm run privacy:scan` (custom npm script)
- Scans repo files for hardcoded secrets using regex patterns
- Includes synthetic test fixture that **intentionally contains a secret** to prove scanner works
- Exits 0 on clean repo, non-zero on findings

**Evidence**: GitHub's official secret scanning docs (https://docs.github.com/code-security/secret-scanning/secret-scanning-patterns) list 200+ provider patterns. For a custom lightweight scan, focus on:
- `.env`, `.env.local`, `.env.*.local` files (must be in `.gitignore`)
- Hardcoded patterns: `OPENAI_API_KEY=sk-`, `ANTHROPIC_API_KEY=`, AWS key prefixes, GitHub tokens (`ghp_`, `gho_`, `ghs_`, `ghr_`)
- Private key headers: `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----`

#### 2. **File Structure & Ignore Strategy**

**Must-have `.gitignore` entries** (from GitHub docs + Node.js conventions):
```
.env
.env.local
.env.*.local
.env.production.local
node_modules/
.next/
dist/
build/
coverage/
.playwright/
playwright-report/
```

**Why `.env.local` specifically?**
- Convention: `.env.local` is **never committed** (local machine secrets)
- `.env` may contain defaults; `.env.local` overrides with real keys
- Task 1 acceptance: "no real applicant data in source, tests, logs, evidence, or commits" → `.env.local` is the safety valve

**Fixture strategy for test:**
- Create `__fixtures__/secrets.test.fixture.ts` (or `.js`)
- Contains synthetic secret: `OPENAI_API_KEY=sk-test-blocked-fixture-12345`
- Test asserts: scanner finds this fixture, returns non-zero
- Test asserts: scanner finds zero secrets in actual repo files

#### 3. **Vitest Integration Pattern**

**Official Vitest docs** (https://vitest.dev/guide/) recommend:
- `vitest.config.ts` for test-specific config (separate from `vite.config.ts`)
- npm script: `"privacy:scan": "vitest run --config vitest.privacy.config.ts"`
- Or simpler: `"privacy:scan": "node scripts/privacy-scan.js"` (custom Node script)

**Two implementation paths:**

**Path A: Vitest test (recommended for Task 1)**
```typescript
// vitest.privacy.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.privacy.test.ts'],
    globals: true,
  },
})

// src/__tests__/privacy.test.ts
import { describe, it, expect } from 'vitest'
import { scanRepo, scanFixture } from '../lib/privacy-scan'

describe('Privacy Scan', () => {
  it('should find synthetic secret in fixture', async () => {
    const result = await scanFixture('__fixtures__/secrets.test.fixture.ts')
    expect(result.findings.length).toBeGreaterThan(0)
  })

  it('should find zero secrets in repo source files', async () => {
    const result = await scanRepo(['src/', 'app/'], {
      ignore: ['.env.local', 'node_modules', '.next'],
    })
    expect(result.findings).toEqual([])
  })
})
```

**Path B: Custom Node script (simpler, no Vitest overhead)**
```bash
# scripts/privacy-scan.js
#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const PATTERNS = {
  openai: /OPENAI_API_KEY\s*=\s*sk-/,
  anthropic: /ANTHROPIC_API_KEY\s*=\s*[a-z0-9]{20,}/,
  aws: /AKIA[0-9A-Z]{16}/,
  github: /(ghp_|gho_|ghs_|ghr_)[a-zA-Z0-9_]{36,255}/,
  privateKey: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
}

// Scan fixture (should find secrets)
const fixtureContent = fs.readFileSync('__fixtures__/secrets.test.fixture.ts', 'utf8')
const fixtureFindings = Object.entries(PATTERNS).filter(([_, regex]) =>
  regex.test(fixtureContent)
)
if (fixtureFindings.length === 0) {
  console.error('❌ Fixture test failed: no secrets found in fixture')
  process.exit(1)
}

// Scan repo (should find zero secrets)
const repoFiles = getRepoFiles(['src/', 'app/'], {
  ignore: ['.env.local', 'node_modules', '.next'],
})
const repoFindings = repoFiles.flatMap(file => {
  const content = fs.readFileSync(file, 'utf8')
  return Object.entries(PATTERNS)
    .filter(([_, regex]) => regex.test(content))
    .map(([name]) => ({ file, pattern: name }))
})

if (repoFindings.length > 0) {
  console.error('❌ Repo scan failed: found secrets in source')
  repoFindings.forEach(f => console.error(`  ${f.file}: ${f.pattern}`))
  process.exit(1)
}

console.log('✅ Privacy scan passed: fixture contains secrets, repo is clean')
process.exit(0)
```

#### 4. **False Positives & False Negatives — Gotchas**

**False Positives (scanner flags non-secrets):**
- Generic patterns like `password=` or `token=` match comments, docs, test data
- **Mitigation**: Use provider-specific prefixes (e.g., `sk-` for OpenAI, `ghp_` for GitHub)
- **Mitigation**: Exclude common false-positive paths: `docs/`, `README.md`, `CHANGELOG.md`, test fixtures

**False Negatives (scanner misses real secrets):**
- Secrets in comments: `// API_KEY=sk-xxx` (regex may not catch if pattern is split)
- Secrets in strings: `const key = "sk-" + process.env.SUFFIX` (dynamic construction)
- Secrets in Base64: `OPENAI_API_KEY=c2stdGVzdA==` (encoded)
- **Mitigation**: For Task 1, focus on **hardcoded literals only** (not dynamic/encoded)
- **Mitigation**: Document that `.env.local` is the primary safety mechanism; scanner is a secondary check

**Task 1 acceptance criteria imply:**
- Synthetic fixture with `OPENAI_API_KEY=sk-test-blocked` (literal, easy to detect)
- Zero findings on actual repo files (because no real secrets are committed)
- This is a **proof of concept**, not a production-grade secret scanner

#### 5. **npm Script Hookup**

**Recommended `package.json` entry:**
```json
{
  "scripts": {
    "privacy:scan": "node scripts/privacy-scan.js",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "build": "next build"
  }
}
```

**Or with Vitest:**
```json
{
  "scripts": {
    "privacy:scan": "vitest run --config vitest.privacy.config.ts",
    "test": "vitest run"
  }
}
```

**CI integration (GitHub Actions example):**
```yaml
- name: Privacy scan
  run: npm run privacy:scan
```

#### 6. **Ignore/Output Considerations**

**`.gitignore` entries (must-have):**
```
# Environment
.env
.env.local
.env.*.local

# Build/test artifacts
node_modules/
.next/
dist/
build/
coverage/
.playwright/
playwright-report/

# Generated evidence/output
.sisyphus/evidence/
__fixtures__/generated/
```

**Output strategy:**
- Fixture test: print `✅ Fixture contains expected secret` (proves scanner works)
- Repo scan: print `✅ Zero secrets found in source files` or `❌ Found N secrets`
- Exit code: 0 on success, 1 on failure (standard for npm scripts)
- Optional: write JSON report to `.sisyphus/evidence/privacy-scan-report.json` for audit trail

#### 7. **Minimal Viable Privacy Scan for Task 1**

**Files needed:**
1. `scripts/privacy-scan.js` — custom Node script (zero dependencies)
2. `__fixtures__/secrets.test.fixture.ts` — synthetic secret fixture
3. `package.json` — add `"privacy:scan"` script
4. `.gitignore` — ensure `.env.local` is ignored
5. `.env.example` — optional, shows expected env vars (no real values)

**Acceptance criteria alignment:**
- ✅ `npm run privacy:scan` exits 0 on synthetic-only repo
- ✅ Fixture contains `OPENAI_API_KEY=sk-test-blocked` (proves scanner detects it)
- ✅ Repo files have zero findings (no real secrets committed)
- ✅ No heavy dependencies added
- ✅ Transparent, auditable approach (code is readable, not a black box)

### Recommended Implementation for Task 1

**Use Path B (custom Node script)** because:
1. Zero additional npm dependencies
2. Transparent, readable code (no magic)
3. Faster than Vitest for a simple scan
4. Easier to debug and modify
5. Aligns with "lightweight" requirement

**Script location:** `scripts/privacy-scan.js`
**Fixture location:** `__fixtures__/secrets.test.fixture.ts`
**npm script:** `"privacy:scan": "node scripts/privacy-scan.js"`

### References

- GitHub Secret Scanning Patterns: https://docs.github.com/code-security/secret-scanning/secret-scanning-patterns
- Vitest Official Guide: https://vitest.dev/guide/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- GitHub Advanced Security Custom Patterns: https://github.com/advanced-security/secret-scanning-custom-patterns

## 2026-04-26 Task 1 Bootstrap — Completed

### What was created
- `package.json` — Next.js 16.2.4, React 19, Vitest 4.1.5, Playwright, ESLint 9 flat config, TypeScript 5.9 strict
- `tsconfig.json` — strict mode, ES2022 target, bundler module resolution, `@/*` path alias
- `next.config.mjs` — minimal config with `allowedDevOrigins: ['127.0.0.1']` to suppress Playwright HMR warning
- `next-env.d.ts` — Next.js type reference shim
- `eslint.config.mjs` — flat config with `@next/eslint-plugin-next`, typescript-eslint, ignores for `.next/`, `.sisyphus/evidence/`
- `vitest.config.ts` — jsdom env, globals true, setup file, excludes e2e/ and .sisyphus/
- `vitest.setup.ts` — RTL auto-cleanup via `@testing-library/jest-dom/vitest` + afterEach(cleanup)
- `playwright.config.ts` — Chromium-only, `webServer` starts `npm run dev`, reuses existing in non-CI
- `app/layout.tsx` — root layout with metadata title "oh-my-scholarship"
- `app/page.tsx` — home page with h1 "oh-my-scholarship" and nav links to /interview, /report, /proof-export
- `app/interview/page.tsx`, `app/report/page.tsx`, `app/proof-export/page.tsx` — placeholder routes
- `app/page.test.tsx` — RTL smoke test asserting heading and link presence
- `e2e/smoke.spec.ts` — Playwright smoke visiting all 4 routes and asserting headings
- `scripts/privacy-scan.js` — custom Node ESM script with regex patterns for OpenAI, Anthropic, AWS, GitHub, private keys; ignores `.sisyphus/`, `__fixtures__/` by default; explicit file args bypass ignore
- `__fixtures__/privacy-scan/blocked-secret.fixture.txt` — synthetic `OPENAI_API_KEY=sk-test-blocked`
- `.gitignore` — covers `.env*`, node_modules, .next, coverage, playwright-report, evidence, generated output, *.docx

### Verification results (all pass)
- `npm run build` — exits 0, 6 static pages generated
- `npm run test -- --run` — 1 file, 1 test passed (368–487ms)
- `npm run test:e2e -- --project=chromium` — 1 test passed (1.5s)
- `npm run privacy:scan` — exits 0, "Privacy scan passed: no secrets found."
- `node scripts/privacy-scan.js __fixtures__/privacy-scan/blocked-secret.fixture.txt` — exits 1, detects synthetic secret

### Key decisions
- Used `package.json` `"type": "module"` for native ESM across all config files (`.mjs`)
- Privacy scan excludes `.sisyphus/` entirely because notepad/plan files contain pattern examples as documentation text
- Privacy scan excludes `__fixtures__/` by default; explicit CLI args bypass ignore for proof-of-detection
- Next.js auto-updated tsconfig.json: `jsx` → `react-jsx`, added `.next/dev/types/**/*.ts` include, added `next` plugin

## Task 5: Implement one-question interview UI/engine
- Implemented `selectNextQuestion` to find the first unanswered required field from active milestone fields.
- Used `updateProfileField` to handle nested profile updates using JSON parse/stringify for deep copy.
- Created a deterministic Korean question fallback for when the AI service fails.
- Built the interview UI with a consent screen, track selection, and one-question-at-a-time flow.
- Wrote Playwright tests to verify the flow and the AI fallback behavior.

## 2026-04-26 Task 6 Validation and completion report
- Added `lib/validation.ts` as the deterministic validation layer for Milestone 1, with schema-driven `validateField()` and `generateCompletionReport()` using `getMilestoneFields(track, profile)` so track/profile conditions stay in one source of truth.
- English-only enforcement is ASCII-only by design (`ENGLISH_ONLY`), which correctly rejects Korean/CJK input for Form 1 while allowing Form 2/3 Korean drafts because those fields use `korean-or-english` in the schema.
- Completion reporting classifies milestone fields into `missing`, `invalid`, and `skipped`; `skipped` is derived from inactive milestone fields rather than empty values, which keeps embassy/university conditional rows out of false-missing lists.
- `readyForDocxProof` intentionally means all active required Milestone 1 fields are present and valid; it is not a final submission readiness flag.
- Report UI now reads the saved browser profile through `ProfileStore`, shows Milestone 1 DOCX proof readiness, and adds a non-blocking phone country-code hint when the saved phone value does not start with `+`.
- Verification passed for Task 6: zero LSP diagnostics on `lib/validation.ts`, `lib/validation.test.ts`, and `app/report/page.tsx`; `npm run test -- --run validation`; `npm run test -- --run`; `npx tsc --noEmit`; `npm run build`.
