import { promises as fs } from 'node:fs'
import path from 'node:path'

import JSZip from 'jszip'

import { MILESTONE_1_FIELD_IDS, type GksFieldId } from './gks-schema'

export interface ProofData {
  fullName: string
  dateOfBirth: string
  checkedFieldId: GksFieldId
  multilineFieldId: GksFieldId
  multilineText: string
}

export interface RepresentativeCompletionReport {
  scope: 'representative-proof'
  mappedFields: GksFieldId[]
  unmappedForms: string[]
  unmappedFields: GksFieldId[]
}

const checkedSymbolXml = '<w:sym w:font="Wingdings" w:char="F0FE"/>'

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const createRun = (text: string) => `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`

const createMultilineRuns = (text: string) => {
  const lines = text.split(/\r?\n/)

  return lines
    .map((line, index) => `${index > 0 ? '<w:r><w:br/></w:r>' : ''}${createRun(line)}`)
    .join('')
}

const appendRepresentativeProofBlock = (documentXml: string, data: ProofData) => {
  const proofParagraphs = [
    `<w:p>${createRun('Representative Proof')}</w:p>`,
    `<w:p>${createRun(`[[form1.section5.givenName]] ${data.fullName}`)}</w:p>`,
    `<w:p>${createRun(`[[form1.section5.dateOfBirth]] ${data.dateOfBirth}`)}</w:p>`,
    `<w:p>${createRun(`[[${data.checkedFieldId}]] `)}<w:r>${checkedSymbolXml}</w:r></w:p>`,
    `<w:p>${createRun(`[[${data.multilineFieldId}]] `)}${createMultilineRuns(data.multilineText)}</w:p>`,
  ].join('')

  return documentXml.replace('</w:body>', `${proofParagraphs}</w:body>`)
}

const getFormNameFromFieldId = (fieldId: GksFieldId) => {
  if (fieldId.startsWith('checklist.')) {
    return 'APPLICATION CHECKLIST'
  }

  const match = fieldId.match(/^form(\d+)\./)

  return match ? `FORM ${match[1]}` : 'UNCLASSIFIED'
}

const buildCompletionReport = (mappedFields: readonly GksFieldId[]): RepresentativeCompletionReport => {
  const mappedFieldSet = new Set(mappedFields)
  const unmappedFields = MILESTONE_1_FIELD_IDS.filter((fieldId) => !mappedFieldSet.has(fieldId))
  const unmappedForms = [...new Set(unmappedFields.map((fieldId) => getFormNameFromFieldId(fieldId)))].sort()

  return {
    scope: 'representative-proof',
    mappedFields: [...mappedFieldSet].sort(),
    unmappedForms,
    unmappedFields,
  }
}

export const renderRepresentativeProof = async (
  templatePath: string,
  outputPath: string,
  data: ProofData,
) => {
  const outputDir = path.dirname(outputPath)
  const templateBuffer = await fs.readFile(templatePath)

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(outputPath, templateBuffer)

  const zip = await JSZip.loadAsync(await fs.readFile(outputPath))
  const documentEntry = zip.file('word/document.xml')

  if (!documentEntry) {
    throw new Error('Template DOCX is missing word/document.xml')
  }

  const documentXml = await documentEntry.async('text')
  const mappedFields = [
    'form1.section5.givenName',
    'form1.section5.dateOfBirth',
    data.checkedFieldId,
    data.multilineFieldId,
  ] as const satisfies readonly GksFieldId[]

  zip.file('word/document.xml', appendRepresentativeProofBlock(documentXml, data))

  await fs.writeFile(outputPath, await zip.generateAsync({ type: 'nodebuffer' }))

  const completionReport = buildCompletionReport(mappedFields)
  const completionReportPath = path.join(outputDir, 'completion-report.json')

  await fs.writeFile(
    completionReportPath,
    `${JSON.stringify(completionReport, null, 2)}\n`,
    'utf8',
  )

  return {
    outputPath,
    completionReportPath,
    completionReport,
  }
}
