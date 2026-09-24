import { parseRichText, type RichSpan } from '../richText'

function Spans({ spans }: { spans: RichSpan[] }) {
  return spans.map((span, i) => {
    if (span.bold && span.italic)
      return (
        <strong key={i} className="font-semibold">
          <em>{span.text}</em>
        </strong>
      )
    if (span.bold)
      return (
        <strong key={i} className="font-semibold">
          {span.text}
        </strong>
      )
    if (span.italic) return <em key={i}>{span.text}</em>
    return <span key={i}>{span.text}</span>
  })
}

export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = parseRichText(text)
  return (
    <div className={`space-y-0.5 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === 'paragraph')
          return (
            <p key={i}>
              <Spans spans={block.spans} />
            </p>
          )
        return (
          <p key={i} className="flex gap-2 pl-1">
            <span aria-hidden className="shrink-0 text-ink-muted">
              {block.type === 'bullet' ? '•' : block.marker}
            </span>
            <span>
              <Spans spans={block.spans} />
            </span>
          </p>
        )
      })}
    </div>
  )
}
