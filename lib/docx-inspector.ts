import { promises as fs } from 'node:fs'
import path from 'node:path'

import JSZip from 'jszip'

export interface DocxInventoryFile {
  path: string
  type: 'xml' | 'text' | 'binary'
  textContent?: string
}

export interface DocxInventoryForm {
  formName: string
  fields: string[]
}

export interface DocxInventory {
  files: DocxInventoryFile[]
  forms: DocxInventoryForm[]
}

const xmlLikeExtensions = new Set(['.xml', '.rels'])
const textLikeExtensions = new Set(['.txt'])
const placeholderPattern = /\[\[([^[\]]+)\]\]|\{\{([^{}]+)\}\}/g
const formHeadingPattern = /\bAPPLICATION CHECKLIST\b|\bFORM\s+[1-6]\b/gi

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

const extractXmlText = (xml: string) =>
  decodeXmlEntities(
    xml
      .replace(/<w:tab\b[^>]*\/>/g, '\t')
      .replace(/<w:br\b[^>]*\/>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )

const toPosixPath = (filePath: string) => filePath.split(path.sep).join('/')

const classifyEntry = (filePath: string): DocxInventoryFile['type'] => {
  const extension = path.extname(filePath).toLowerCase()

  if (xmlLikeExtensions.has(extension)) {
    return 'xml'
  }

  if (textLikeExtensions.has(extension)) {
    return 'text'
  }

  return 'binary'
}

const extractPlaceholders = (value: string) => {
  const fields = new Set<string>()

  for (const match of value.matchAll(placeholderPattern)) {
    const fieldId = (match[1] ?? match[2] ?? '').trim()

    if (fieldId) {
      fields.add(fieldId)
    }
  }

  return [...fields]
}

const collectForms = (files: DocxInventoryFile[]): DocxInventoryForm[] => {
  const forms = new Map<string, Set<string>>()
  const xmlContents = files.filter((file) => file.type === 'xml' && file.textContent)

  for (const file of xmlContents) {
    const rawXml = file.textContent ?? ''
    const plainText = extractXmlText(rawXml)
    const placeholderFields = extractPlaceholders(rawXml)
    const headings = [...plainText.matchAll(formHeadingPattern)].map((match) =>
      match[0].replace(/\s+/g, ' ').trim().toUpperCase(),
    )

    for (const fieldId of placeholderFields) {
      const lowered = fieldId.toLowerCase()
      let formName = 'UNCLASSIFIED'

      if (lowered.startsWith('checklist.')) {
        formName = 'APPLICATION CHECKLIST'
      } else {
        const formMatch = lowered.match(/^form(\d+)/)
        if (formMatch) {
          formName = `FORM ${formMatch[1]}`
        }
      }

      if (!forms.has(formName)) {
        forms.set(formName, new Set())
      }

      forms.get(formName)?.add(fieldId)
    }

    for (const heading of headings) {
      if (!forms.has(heading)) {
        forms.set(heading, new Set())
      }
    }

    if (/w:checkBox|w:char="F0FE"|w:char="F06F"/i.test(rawXml)) {
      const checkboxFormName = headings.at(-1) ?? 'UNCLASSIFIED'

      if (!forms.has(checkboxFormName)) {
        forms.set(checkboxFormName, new Set())
      }

      forms.get(checkboxFormName)?.add('checkbox-marker')
    }
  }

  return [...forms.entries()]
    .map(([formName, fieldSet]) => ({
      formName,
      fields: [...fieldSet].sort(),
    }))
    .sort((left, right) => left.formName.localeCompare(right.formName))
}

export const inspectDocx = async (filePath: string): Promise<DocxInventory> => {
  const inputBuffer = await fs.readFile(filePath)
  const zip = await JSZip.loadAsync(inputBuffer)
  const files: DocxInventoryFile[] = []

  const zipEntries = Object.values(zip.files).sort((left, right) => left.name.localeCompare(right.name))

  for (const entry of zipEntries) {
    if (entry.dir) {
      continue
    }

    const entryPath = toPosixPath(entry.name)
    const type = classifyEntry(entryPath)

    if (type === 'binary') {
      files.push({ path: entryPath, type })
      continue
    }

    files.push({
      path: entryPath,
      type,
      textContent: await entry.async('text'),
    })
  }

  return {
    files,
    forms: collectForms(files),
  }
}
