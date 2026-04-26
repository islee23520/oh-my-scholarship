import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const defaultIgnoreDirs = new Set([
  '.git',
  '.next',
  'node_modules',
  'coverage',
  'playwright-report',
  'test-results',
  '.sisyphus',
  '__fixtures__',
])

const secretPatterns = [
  /OPENAI_API_KEY\s*=\s*['"]?(sk-[A-Za-z0-9_-]{8,})['"]?/i,
  /ANTHROPIC_API_KEY\s*=\s*['"]?(sk-[A-Za-z0-9_-]{8,})['"]?/i,
  /AWS_SECRET_ACCESS_KEY\s*=\s*['"]?([A-Za-z0-9/+=]{16,})['"]?/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /gh[pousr]_[A-Za-z0-9]{20,}/i,
]

const textExtensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
  '.env',
])

function isIgnoredDir(relativePath) {
  return [...defaultIgnoreDirs].some((ignored) => relativePath === ignored || relativePath.startsWith(`${ignored}/`))
}

async function collectFiles(startPath) {
  const entries = await fs.readdir(startPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(startPath, entry.name)
    const relativePath = path.relative(repoRoot, fullPath)

    if (entry.isDirectory()) {
      if (!isIgnoredDir(relativePath)) {
        files.push(...(await collectFiles(fullPath)))
      }
      continue
    }

    if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files
}

async function scanFile(filePath, skipIgnore = false) {
  const relativePath = path.relative(repoRoot, filePath)
  if (!skipIgnore && isIgnoredDir(relativePath)) {
    return []
  }

  const ext = path.extname(filePath).toLowerCase()
  if (!textExtensions.has(ext) && ext !== '') {
    return []
  }

  const content = await fs.readFile(filePath, 'utf8')
  const findings = []

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      findings.push({ file: relativePath, pattern: pattern.toString() })
    }
  }

  return findings
}

async function main() {
  const targets = process.argv.slice(2)
  const hasExplicitTargets = targets.length > 0
  const targetPaths = hasExplicitTargets ? targets : [repoRoot]
  const findings = []

  for (const target of targetPaths) {
    const absoluteTarget = path.resolve(repoRoot, target)
    const stat = await fs.stat(absoluteTarget)
    const files = stat.isDirectory() ? await collectFiles(absoluteTarget) : [absoluteTarget]

    for (const file of files) {
      findings.push(...(await scanFile(file, hasExplicitTargets)))
    }
  }

  if (findings.length > 0) {
    console.error('Privacy scan blocked potential secret(s):')
    for (const finding of findings) {
      console.error(`- ${finding.file} (${finding.pattern})`)
    }
    process.exitCode = 1
    return
  }

  console.log('Privacy scan passed: no secrets found.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
