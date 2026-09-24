/*
 * Diary entries use a small, predictable markup instead of HTML, so the same text
 * renders safely on screen and in the PDF:
 *   **bold**   _italic_   "- " bullet line   "1. " numbered line
 */

export interface RichSpan {
  text: string
  bold?: boolean
  italic?: boolean
}

export type RichBlock =
  | { type: 'paragraph'; spans: RichSpan[] }
  | { type: 'bullet'; spans: RichSpan[] }
  | { type: 'numbered'; marker: string; spans: RichSpan[] }

// Bold: **text**. Italic: _text_, not inside a word and not touching another underscore, so "__" blanks and
// snake_case stay literal. Markers must hug the text (no leading/trailing spaces).
const INLINE = /(\*\*(?=\S)[^*]+?(?<=\S)\*\*|(?<![_\p{L}\p{N}])_(?=\S)[^_]+?(?<=\S)_(?![_\p{L}\p{N}]))/gu
const ITALIC_ONLY = /^_(?=\S)[^_]+(?<=\S)_$/u
const BOLD_ONLY = /^\*\*(?=\S)[^*]+(?<=\S)\*\*$/u

export function parseInline(line: string): RichSpan[] {
  return line
    .split(INLINE)
    .filter(Boolean)
    .map((part) => {
      if (BOLD_ONLY.test(part)) {
        const inner = part.slice(2, -2)
        return ITALIC_ONLY.test(inner)
          ? { text: inner.slice(1, -1), bold: true, italic: true }
          : { text: inner, bold: true }
      }
      if (ITALIC_ONLY.test(part)) {
        const inner = part.slice(1, -1)
        return BOLD_ONLY.test(inner)
          ? { text: inner.slice(2, -2), bold: true, italic: true }
          : { text: inner, italic: true }
      }
      return { text: part }
    })
}

export function parseRichText(text: string): RichBlock[] {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line): RichBlock => {
      const bullet = /^\s*[-•]\s+(.*)$/.exec(line)
      if (bullet) return { type: 'bullet', spans: parseInline(bullet[1]) }
      const numbered = /^\s*(\d+)[.)]\s+(.*)$/.exec(line)
      if (numbered) return { type: 'numbered', marker: `${numbered[1]}.`, spans: parseInline(numbered[2]) }
      return { type: 'paragraph', spans: parseInline(line) }
    })
}

/** Markup removed, e.g. for CSV export and search. */
export function toPlainText(text: string): string {
  return parseRichText(text)
    .map((block) => {
      const line = block.spans.map((s) => s.text).join('')
      if (block.type === 'bullet') return `• ${line}`
      if (block.type === 'numbered') return `${block.marker} ${line}`
      return line
    })
    .join(' ')
}
