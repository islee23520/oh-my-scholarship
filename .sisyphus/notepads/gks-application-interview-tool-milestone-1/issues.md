# Issues

## 2026-04-26 Task 1 delegation instability
Multiple synchronous `task()` delegations for Task 1 aborted before making file changes. Task 1 remains unchecked and blocks downstream implementation tasks. Next attempt should use a different agent/category path or continue an existing session if available.

## 2026-04-26 Version Compatibility & Integration Gotchas

### Critical Compatibility Notes

**Vitest jsdom + Next.js Server Components**
- Vitest's jsdom environment is a pure JavaScript DOM implementation (Node.js-based)
- Does NOT support Next.js server-side features: Server Components, Route Handlers, Server Actions, middleware
- Implication: Unit/component tests via Vitest are limited to client-side React logic
- Solution: Use Playwright for full-stack e2e tests that exercise server features

**RTL Auto-Cleanup in Vitest**
- React Testing Library's `cleanup()` must be called after each test to prevent DOM state leaks
- Vitest does NOT auto-call cleanup unless `globals: true` is set in config
- Without cleanup: subsequent tests may fail with "Found multiple elements" errors
- Solution: Either enable `globals: true` OR add manual `afterEach(cleanup)` in setup file

**Playwright webServer Port Conflicts**
- If Next.js dev server is already running on port 3000, Playwright may fail to start its own instance
- Setting `reuseExistingServer: !process.env.CI` allows reuse during local development
- In CI, always set `reuseExistingServer: false` to ensure clean state
- Implication: Local e2e tests require `npm run dev` to be running OR Playwright to start it

**Next.js 16 ESLint Changes**
- `next lint` command no longer runs automatically during `next build`
- ESLint now uses flat config format (`eslint.config.mjs`) instead of `.eslintrc.*`
- Implication: Linting must be explicitly invoked via npm scripts
- Task 1 should include `npm run lint` in CI/pre-commit hooks

**TypeScript + Next.js App Router**
- App Router uses React canary releases built-in (includes React 19 features)
- Must still declare `react` and `react-dom` in package.json for IDE/tooling compatibility
- Minimum TypeScript version: 5.1.0
- Implication: Don't skip React dependencies even though App Router bundles them

**Vitest Config Override Behavior**
- If `vitest.config.ts` exists, it COMPLETELY OVERRIDES `vite.config.ts`
- All Vite plugins and settings from `vite.config.ts` are ignored
- Solution: Use `mergeConfig()` from `vitest/config` to extend Vite config if needed
- Implication: Keep Vite and Vitest configs in sync or use single config file

### Recommended Workarounds

1. **For Server Component Testing**: Use Playwright e2e tests, not Vitest unit tests
2. **For RTL Cleanup**: Always include `vitest.setup.ts` with `afterEach(cleanup)` even if `globals: true` is set (defensive)
3. **For Port Conflicts**: Document that local e2e tests require dev server running OR use `webServer` config
4. **For ESLint**: Create explicit `npm run lint` script; don't rely on build-time linting
5. **For Vitest Config**: Use single `vitest.config.ts` with `mergeConfig()` if Vite config is needed

### Known Limitations for Task 1

- Vitest cannot test Next.js Route Handlers, Server Actions, or middleware
- RTL cannot render Server Components directly (must test via Playwright e2e)
- Playwright Chromium-only baseline may miss browser-specific bugs (add Firefox/WebKit later)
- jsdom does not support all browser APIs (e.g., IntersectionObserver, ResizeObserver without polyfills)


## 2026-04-26 Privacy Scan Research — Risk Notes

### False Positive/Negative Gotchas

**Risk: False Negatives (scanner misses real secrets)**
- Secrets in comments: `// OPENAI_API_KEY=sk-xxx` may not be caught if pattern is split across lines
- Secrets in dynamic strings: `const key = "sk-" + process.env.SUFFIX` (concatenation defeats regex)
- Secrets in Base64: `OPENAI_API_KEY=c2stdGVzdA==` (encoded values not detected)
- **Mitigation**: Document that `.env.local` is the PRIMARY safety mechanism; scanner is SECONDARY
- **Mitigation**: For Task 1, focus on hardcoded literals only (not dynamic/encoded)
- **Acceptance**: Task 1 criteria require zero findings on repo files because no real secrets are committed; this is a proof-of-concept, not production-grade

**Risk: False Positives (scanner flags non-secrets)**
- Generic patterns like `password=` or `token=` match comments, docs, test data
- **Mitigation**: Use provider-specific prefixes (e.g., `sk-` for OpenAI, `ghp_` for GitHub)
- **Mitigation**: Exclude common false-positive paths: `docs/`, `README.md`, `CHANGELOG.md`, test fixtures
- **Acceptance**: Custom script can be tuned to Task 1 scope; no need for 200+ GitHub patterns

### Implementation Risks

**Risk: Fixture maintenance**
- Synthetic fixture `__fixtures__/secrets.test.fixture.ts` must contain a valid-looking secret
- If fixture is accidentally committed with real secret, scanner defeats its purpose
- **Mitigation**: Add fixture to `.gitignore` OR mark as synthetic in filename/comments
- **Mitigation**: Code review: fixture must contain ONLY test patterns, never real keys

**Risk: Scanner bypass**
- Developer could commit `.env.local` if not in `.gitignore`
- Developer could hardcode secret in source if pattern is not covered
- **Mitigation**: `.gitignore` is the primary gate; scanner is a secondary check
- **Mitigation**: Document that `.env.local` is never committed (convention)

**Risk: Performance**
- Custom Node script scans all files in `src/`, `app/`, etc. on every `npm run privacy:scan`
- For large repos, this could be slow
- **Mitigation**: For Task 1, repo is small; not a concern
- **Mitigation**: If needed, add file-size limit or exclude large binary files

### Scope Boundaries

**In scope for Task 1:**
- Hardcoded API key patterns (OpenAI, Anthropic, AWS, GitHub, etc.)
- Private key headers (RSA, EC, OpenSSH)
- `.env` file detection
- Synthetic fixture with intentional secret
- Zero findings on actual repo files

**Out of scope for Task 1:**
- Entropy-based detection (too many false positives)
- Base64-encoded secrets
- Dynamic/concatenated secrets
- Secrets in comments (too noisy)
- Full SAST (static application security testing)
- SaaS scanners (GitHub Advanced Security, Snyk, etc.)
- CI/CD integration beyond npm script

### Recommended Approach

**Use custom Node script (Path B)** because:
1. Zero additional npm dependencies
2. Transparent, readable code (no black box)
3. Faster than Vitest for a simple scan
4. Easier to debug and modify
5. Aligns with "lightweight" requirement
6. Acceptable false-positive/negative tradeoff for Task 1 scope

**Files to create:**
1. `scripts/privacy-scan.js` — custom Node script
2. `__fixtures__/secrets.test.fixture.ts` — synthetic secret fixture
3. Update `package.json` — add `"privacy:scan"` script
4. Update `.gitignore` — ensure `.env.local` is ignored

**Acceptance criteria:**
- ✅ `npm run privacy:scan` exits 0 on synthetic-only repo
- ✅ Fixture contains `OPENAI_API_KEY=sk-test-blocked` (proves scanner detects it)
- ✅ Repo files have zero findings (no real secrets committed)
- ✅ No heavy dependencies added
- ✅ Transparent, auditable approach

## 2026-04-26 Task 1 Bootstrap — Resolved Issues

### Privacy scan false positives from .sisyphus/ notepad files
- **Problem**: Notepad files (learnings.md, issues.md) and the plan file contain `OPENAI_API_KEY=sk-test-blocked` as documentation examples. Privacy scan's regex patterns matched these as real secrets.
- **Fix**: Added `.sisyphus` to the scanner's `defaultIgnoreDirs` set. Rationale: `.sisyphus/` contains operational metadata, not application code or config.
- **Trade-off**: If someone accidentally stores a real secret in a `.sisyphus/` notepad, the scanner won't catch it. Primary protection remains `.gitignore` + code review.

### Privacy scan fixture vs. default scan mode
- **Problem**: Synthetic fixture at `__fixtures__/privacy-scan/blocked-secret.fixture.txt` should prove detection but not fail the default `npm run privacy:scan`.
- **Fix**: Added `__fixtures__` to ignore dirs for default mode. When explicit file paths are passed as CLI arguments, the scanner bypasses ignore rules so `node scripts/privacy-scan.js <fixture>` exits 1 as proof.
- **Trade-off**: Two-step verification required (default scan + explicit fixture scan) rather than a single command proving both behaviors.

### Next.js tsconfig auto-modification
- **Observed**: `next build` automatically updated `tsconfig.json`: changed `jsx` from `preserve` to `react-jsx`, added `.next/dev/types/**/*.ts` to includes, added `{ name: 'next' }` plugin. This is expected Next.js 16 behavior per docs.
- **Impact**: No issue; these changes are correct and improve type safety.

### Cross-origin HMR warning in Playwright
- **Problem**: Playwright's webServer spawned dev server showed "Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from 127.0.0.1".
- **Fix**: Added `allowedDevOrigins: ['127.0.0.1']` to `next.config.mjs`.
- **Impact**: Warning eliminated; e2e tests run cleanly.

### /favicon.ico 404 in browser console
- **Problem**: Next.js App Router does not provide a default `favicon.ico`. Browsers always request `/favicon.ico` regardless of `<link>` tags, producing a 404 and console error in dev mode.
- **Fix**: Added `app/favicon.ico` (1x1 transparent ICO wrapping PNG, 92 bytes) and `app/icon.png` (1x1 transparent PNG, 70 bytes). Next.js serves both as static file conventions.
- **Gotcha**: Hand-crafted ICO with raw BMP pixel data failed Turbopack validation ("Bitmap header too small"). ICO wrapping PNG data works, but the ICO header dimensions must match the inner PNG dimensions exactly or Turbopack rejects it ("Entry(N, N) and PNG(M, M) dimensions do not match").
- **Impact**: `/favicon.ico` and `/icon.png` both return 200; browser console is clean.

