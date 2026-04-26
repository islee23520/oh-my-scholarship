import { promises as fs } from 'node:fs'
import path from 'node:path'

const defaultInputPath = '/Users/ilseoblee/Downloads/★2026 GKS-U Application Forms (1).docx'
const defaultOutputPath = path.resolve(process.cwd(), '.generated/docx-inventory.json')

async function main() {
  const inputPath = process.argv[2] ?? defaultInputPath
  const outputPath = process.argv[3] ?? defaultOutputPath
  const { inspectDocx } = await import('../lib/docx-inspector.ts')
  const inventory = await inspectDocx(inputPath)
  const payload = `${JSON.stringify(inventory, null, 2)}\n`

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, payload, 'utf8')

  process.stdout.write(payload)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
