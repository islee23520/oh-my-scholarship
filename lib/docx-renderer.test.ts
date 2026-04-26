import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import JSZip from 'jszip'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { inspectDocx } from './docx-inspector'
import { renderRepresentativeProof } from './docx-renderer'

const execFileAsync = promisify(execFile)
const generatedRoot = path.join(process.cwd(), '.generated', 'docx-proof-tests')
const fixturePath = path.join(generatedRoot, 'fixture-template.docx')
const renderedPath = path.join(generatedRoot, 'proof-output.docx')
const inventoryPath = path.join(generatedRoot, 'docx-inventory.json')

const representativeData = {
  fullName: 'HONG GIL DONG',
  dateOfBirth: '2007-03-14',
  checkedFieldId: 'form5.section1.consentGroup' as const,
  multilineFieldId: 'form2.section1.personalStatement' as const,
  multilineText: 'FORM 2 draft line one.\nFORM 3 draft line two.',
}

const createFixtureDocx = async (filePath: string) => {
  const zip = new JSZip()

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  )
  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  )
  zip.folder('word')?.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>FORM 1</w:t></w:r></w:p>
    <w:p><w:r><w:t>[[form1.section5.givenName]]</w:t></w:r></w:p>
    <w:p><w:r><w:t>[[form1.section5.dateOfBirth]]</w:t></w:r></w:p>
    <w:p><w:r><w:t>FORM 2</w:t></w:r></w:p>
    <w:p><w:r><w:t>[[form2.section1.personalStatement]]</w:t></w:r></w:p>
    <w:p><w:r><w:t>FORM 5</w:t></w:r></w:p>
    <w:p><w:r><w:t>[[form5.section1.consentGroup]]</w:t></w:r></w:p>
    <w:p><w:r><w:sym w:font="Wingdings" w:char="F06F"/></w:r></w:p>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`,
  )

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, await zip.generateAsync({ type: 'nodebuffer' }))
}

const readDocumentXml = async (filePath: string) => {
  const zip = await JSZip.loadAsync(await fs.readFile(filePath))
  const entry = zip.file('word/document.xml')

  expect(entry).toBeDefined()

  return entry!.async('text')
}

beforeEach(async () => {
  await fs.rm(generatedRoot, { recursive: true, force: true })
  await createFixtureDocx(fixturePath)
})

afterEach(async () => {
  await fs.rm(generatedRoot, { recursive: true, force: true })
})

describe('docx representative proof', () => {
  it('inspects DOCX structure without modifying the source file', async () => {
    const beforeHash = createHash('sha256').update(await fs.readFile(fixturePath)).digest('hex')
    const inventory = await inspectDocx(fixturePath)
    const afterHash = createHash('sha256').update(await fs.readFile(fixturePath)).digest('hex')

    expect(beforeHash).toBe(afterHash)
    expect(inventory.files.some((file) => file.path === 'word/document.xml')).toBe(true)
    expect(inventory.forms).toContainEqual({
      formName: 'FORM 1',
      fields: ['form1.section5.dateOfBirth', 'form1.section5.givenName'],
    })
    expect(inventory.forms).toContainEqual({
      formName: 'FORM 5',
      fields: ['checkbox-marker', 'form5.section1.consentGroup'],
    })
  })

  it('writes representative synthetic values into the copied DOCX only', async () => {
    const beforeStat = await fs.stat(fixturePath)
    const beforeHash = createHash('sha256').update(await fs.readFile(fixturePath)).digest('hex')

    const result = await renderRepresentativeProof(fixturePath, renderedPath, representativeData)
    const documentXml = await readDocumentXml(renderedPath)
    const afterStat = await fs.stat(fixturePath)
    const afterHash = createHash('sha256').update(await fs.readFile(fixturePath)).digest('hex')

    expect(result.outputPath).toBe(renderedPath)
    expect(documentXml).toContain('HONG GIL DONG')
    expect(documentXml).toContain('2007-03-14')
    expect(documentXml).toContain('w:char="F0FE"')
    expect(documentXml).toContain('FORM 2 draft line one.')
    expect(documentXml).toContain('FORM 3 draft line two.')
    expect(beforeHash).toBe(afterHash)
    expect(afterStat.mtimeMs).toBe(beforeStat.mtimeMs)
  })

  it('writes a representative completion report next to the output', async () => {
    const result = await renderRepresentativeProof(fixturePath, renderedPath, representativeData)
    const report = JSON.parse(await fs.readFile(result.completionReportPath, 'utf8'))

    expect(report.scope).toBe('representative-proof')
    expect(report.mappedFields).toEqual([
      'form1.section5.dateOfBirth',
      'form1.section5.givenName',
      'form2.section1.personalStatement',
      'form5.section1.consentGroup',
    ])
    expect(report.unmappedFields).toContain('form3.section1.languageStudyPlan')
    expect(report.unmappedForms).toContain('FORM 3')
  })

  it('runs the inspection CLI and writes inventory JSON under .generated', async () => {
    await execFileAsync(process.execPath, ['scripts/docx-inspect.mjs', fixturePath, inventoryPath], {
      cwd: process.cwd(),
    })

    const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'))

    expect(inventory.files.some((file: { path: string }) => file.path === 'word/document.xml')).toBe(
      true,
    )
    expect(inventory.forms.some((form: { formName: string }) => form.formName === 'FORM 2')).toBe(true)
  })
})
