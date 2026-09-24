import type { JSONContent } from '@tiptap/react'
import { parseRichText, type RichSpan } from './richText'

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function spansToHtml(spans: RichSpan[]): string {
  return spans
    .map((s) => {
      let html = escapeHtml(s.text)
      if (s.italic) html = `<em>${html}</em>`
      if (s.bold) html = `<strong>${html}</strong>`
      return html
    })
    .join('')
}

/** Stored markup → editor HTML. */
export function markupToHtml(markup: string): string {
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const closeList = () => {
    if (list) out.push(`</${list}>`)
    list = null
  }
  for (const block of parseRichText(markup)) {
    if (block.type === 'paragraph') {
      closeList()
      out.push(`<p>${spansToHtml(block.spans)}</p>`)
      continue
    }
    const kind = block.type === 'bullet' ? 'ul' : 'ol'
    if (list !== kind) {
      closeList()
      const start = block.type === 'numbered' ? Number.parseInt(block.marker, 10) : 1
      out.push(kind === 'ol' && start !== 1 ? `<ol start="${start}">` : `<${kind}>`)
      list = kind
    }
    out.push(`<li><p>${spansToHtml(block.spans)}</p></li>`)
  }
  closeList()
  return out.join('')
}

function inlineToMarkup(nodes: JSONContent[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === 'hardBreak') return ' '
      if (node.type !== 'text' || !node.text) return ''
      const marks = new Set(node.marks?.map((m) => m.type))
      // Keep surrounding spaces outside the markers so the markup stays valid ("**a** b", not "**a **b").
      const [, lead, core, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(node.text) ?? ['', '', node.text, '']
      if (!core) return node.text
      let text = core
      if (marks.has('italic')) text = `_${text}_`
      if (marks.has('bold')) text = `**${text}**`
      return `${lead}${text}${trail}`
    })
    .join('')
}

function listItems(list: JSONContent, prefix: (index: number) => string, lines: string[]) {
  ;(list.content ?? []).forEach((item, index) => {
    for (const child of item.content ?? []) {
      if (child.type === 'paragraph') lines.push(`${prefix(index)} ${inlineToMarkup(child.content)}`)
      // Nested lists are flattened: the stored format has one level.
      else blockToMarkup(child, lines)
    }
  })
}

function blockToMarkup(node: JSONContent, lines: string[]) {
  if (node.type === 'paragraph') lines.push(inlineToMarkup(node.content))
  else if (node.type === 'bulletList') listItems(node, () => '-', lines)
  else if (node.type === 'orderedList') {
    const start = Number(node.attrs?.start ?? 1)
    listItems(node, (i) => `${start + i}.`, lines)
  }
}

/** Editor document → stored markup. Blank paragraphs are dropped, as they are when entries are shown. */
export function docToMarkup(doc: JSONContent): string {
  const lines: string[] = []
  for (const node of doc.content ?? []) blockToMarkup(node, lines)
  return lines
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line.trim() !== '')
    .join('\n')
}
