import { Bold, BookmarkPlus, Hash, ImagePlus, Italic, List, ListOrdered, Plus, Star, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox, Textarea } from '@/components/ui/Field'
import { Kbd } from '@/components/ui/Kbd'
import { useNow } from '@/hooks/useNow'
import type { HotKey } from '../constants'
import { addEntry, generatePnNumber, useHotKeys } from '../data/diaryStore'
import type { Attachment, Person, ShiftDiary } from '../types'
import { formatStampSeconds } from '../utils'
import { HotKeyDialog, type HotKeyDraft } from './HotKeyDialog'

const TOOL =
  'inline-flex size-8 items-center justify-center rounded-md text-ink-secondary hover:bg-subtle hover:text-ink'
const HOT_KEY =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-canvas px-2.5 text-secondary text-ink-secondary transition-colors hover:border-primary hover:text-primary-ink'

const draftKey = (diaryId: string) => `odms.diary.draft.${diaryId}`

function readDraft(diaryId: string): string {
  try {
    return window.localStorage.getItem(draftKey(diaryId)) ?? ''
  } catch {
    return ''
  }
}

function writeDraft(diaryId: string, text: string) {
  try {
    if (text) window.localStorage.setItem(draftKey(diaryId), text)
    else window.localStorage.removeItem(draftKey(diaryId))
  } catch {
    // Storage unavailable: the draft only lives in memory.
  }
}

interface EntryComposerProps {
  diary: ShiftDiary
  actor: Person
}

/** Writing area for the current shift: hot keys, light formatting, attachments and PN numbers. */
export function EntryComposer({ diary, actor }: EntryComposerProps) {
  const [text, setText] = useState(() => readDraft(diary.id))
  const [important, setImportant] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [notice, setNotice] = useState('')
  // null: closed · {}: "Add hot key" · { initial }: "Save as hot key" from the editor
  const [hotKeyDialog, setHotKeyDialog] = useState<{ initial?: HotKeyDraft } | null>(null)
  const hotKeys = useHotKeys(diary.stationCode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const now = useNow(1000)
  const ids = useId()

  // Keep unsent text if the page reloads or the connection drops.
  useEffect(() => writeDraft(diary.id, text), [diary.id, text])

  const replaceSelection = (transform: (selected: string) => string, placeholder = '') => {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = text.slice(start, end) || placeholder
    const next = text.slice(0, start) + transform(selected) + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + transform(selected).length
      el.setSelectionRange(pos, pos)
    })
  }

  const wrap = (marker: string, placeholder: string) => replaceSelection((s) => `${marker}${s}${marker}`, placeholder)

  const prefixLines = (numbered: boolean) =>
    replaceSelection(
      (s) =>
        s
          .split('\n')
          .map((line, i) => `${numbered ? `${i + 1}.` : '-'} ${line.replace(/^\s*([-•]|\d+[.)])\s+/, '')}`)
          .join('\n'),
      'item',
    )

  const insertHotKey = (hotKey: HotKey) => {
    setText((current) => (current.trim() ? `${current.trimEnd()}\n${hotKey.template}` : hotKey.template))
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      // Jump to the first blank so the controller can type straight away.
      const blank = el.value.indexOf('__')
      if (blank >= 0) el.setSelectionRange(blank, blank + 2)
    })
  }

  const addPn = () => {
    const pn = generatePnNumber(diary.stationCode)
    replaceSelection(() => (text && !/\s$/.test(text) ? ` ${pn}` : pn))
    setNotice(`${pn} generated.`)
  }

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, url: URL.createObjectURL(file) }))
    setAttachments((current) => [...current, ...added])
  }

  const blanksLeft = text.includes('__')
  const canLog = text.trim().length > 0 && !blanksLeft

  const log = () => {
    if (!canLog) {
      setNotice(blanksLeft ? 'Fill in the blanks (__) before logging.' : 'Type an entry first.')
      textareaRef.current?.focus()
      return
    }
    addEntry(diary.id, { text, important, attachments }, actor)
    setText('')
    setImportant(false)
    setAttachments([])
    setNotice('Entry logged.')
    textareaRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      log()
    }
  }

  const stamp = formatStampSeconds(new Date(now).toISOString())

  return (
    <section aria-label="New diary entry" className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="mr-1 text-label text-ink-muted uppercase">Hot keys</span>
        {hotKeys.map((hotKey) => (
          <button
            key={hotKey.id}
            type="button"
            className={HOT_KEY}
            title={hotKey.template}
            onClick={() => insertHotKey(hotKey)}
          >
            {hotKey.label}
          </button>
        ))}
        <Button size="sm" variant="ghost" icon={Plus} className="h-7" onClick={() => setHotKeyDialog({})}>
          Add hot key
        </Button>
      </div>

      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1"
        role="toolbar"
        aria-label="Formatting"
      >
        <button type="button" className={TOOL} aria-label="Bold" title="Bold" onClick={() => wrap('**', 'bold text')}>
          <Bold aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          className={TOOL}
          aria-label="Italic"
          title="Italic"
          onClick={() => wrap('_', 'italic text')}
        >
          <Italic aria-hidden className="size-4" />
        </button>
        <span aria-hidden className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          className={TOOL}
          aria-label="Bulleted list"
          title="Bulleted list"
          onClick={() => prefixLines(false)}
        >
          <List aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          className={TOOL}
          aria-label="Numbered list"
          title="Numbered list"
          onClick={() => prefixLines(true)}
        >
          <ListOrdered aria-hidden className="size-4" />
        </button>
      </div>

      <label htmlFor={`${ids}-text`} className="sr-only">
        Diary entry
      </label>
      <Textarea
        ref={textareaRef}
        id={`${ids}-text`}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a diary entry, or pick a hot key above…"
        className="block min-h-20 w-full resize-y rounded-none border-0 px-4 py-3 text-body-lg shadow-none focus-visible:outline-0 sm:text-body"
      />

      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-4 pb-3" aria-label="Attached images">
          {attachments.map((a) => (
            <li key={a.id} className="relative">
              <img src={a.url} alt={a.name} className="size-16 rounded-md border border-border object-cover" />
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => setAttachments((current) => current.filter((x) => x.id !== a.id))}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-surface"
              >
                <X aria-hidden className="size-3" strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-b-xl border-t border-border bg-canvas px-4 py-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Button size="sm" icon={ImagePlus} onClick={() => fileRef.current?.click()}>
          Attach image
        </Button>
        <Button size="sm" icon={Hash} onClick={addPn}>
          Generate PN number
        </Button>
        <Button
          size="sm"
          icon={BookmarkPlus}
          disabled={!text.trim()}
          title={text.trim() ? 'Save this message as a hot key to reuse it' : 'Type a message first'}
          onClick={() => setHotKeyDialog({ initial: { template: text.trim() } })}
        >
          Save as hot key
        </Button>
        <label className="flex items-center gap-2 text-secondary text-ink-secondary">
          <Checkbox checked={important} onChange={(e) => setImportant(e.target.checked)} />
          <Star aria-hidden className={`size-3.5 ${important ? 'fill-warning-dot text-warning-dot' : ''}`} />
          Important
        </label>
        {/* <p aria-live="polite" title={notice} className="min-w-0 flex-1 truncate text-caption text-ink-muted">
          {notice}
        </p> */}
        <span className="text-secondary whitespace-nowrap text-ink-muted tabular-nums">
          Logging at <span className="font-semibold text-ink">{stamp}</span>
        </span>
        <Button variant="primary" size="sm" onClick={log}>
          Log entry
          <Kbd tone="inverse" className="hidden sm:inline-flex">
            Ctrl ↵
          </Kbd>
        </Button>
      </div>
      <HotKeyDialog
        open={hotKeyDialog !== null}
        onClose={() => setHotKeyDialog(null)}
        stationCode={diary.stationCode}
        initial={hotKeyDialog?.initial}
        onSaved={(label) => setNotice(`Hot key "${label}" saved.`)}
      />
    </section>
  )
}
