import { BookmarkPlus, Hash, ImagePlus, Plus, Star, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Field'
import { Kbd } from '@/components/ui/Kbd'
import { useNow } from '@/hooks/useNow'
import type { HotKey } from '../constants'
import { addEntry, generatePnNumber, useHotKeys } from '../data/diaryStore'
import type { Attachment, Person, ShiftDiary } from '../types'
import { formatStampSeconds } from '../utils'
import { DiaryEditor, type DiaryEditorHandle } from './DiaryEditor'
import { HotKeyDialog, type HotKeyDraft } from './HotKeyDialog'

const HOT_KEY =
  'inline-flex h-7 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 text-secondary font-medium text-ink transition-colors hover:border-primary hover:bg-primary-subtle hover:text-primary-ink'

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
  const editorRef = useRef<DiaryEditorHandle>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const now = useNow(1000)

  // Keep unsent text if the page reloads or the connection drops.
  useEffect(() => writeDraft(diary.id, text), [diary.id, text])

  const insertHotKey = (hotKey: HotKey) => {
    // On its own line, with the first "__" blank selected so the controller can type straight away.
    editorRef.current?.insert(hotKey.template, { asNewLine: true, selectFirstBlank: true })
  }

  const addPn = () => {
    const pn = generatePnNumber(diary.stationCode)
    editorRef.current?.insert(text && !/\s$/.test(text) ? ` ${pn}` : pn)
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
      editorRef.current?.focus()
      return
    }
    addEntry(diary.id, { text, important, attachments }, actor)
    setText('')
    setImportant(false)
    setAttachments([])
    setNotice('Entry logged.')
    editorRef.current?.focus()
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
            // Keep focus in the editor so the controller can type straight into the blank.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertHotKey(hotKey)}
          >
            {hotKey.label}
          </button>
        ))}
        <Button size="sm" variant="ghost" icon={Plus} className="h-7" onClick={() => setHotKeyDialog({})}>
          Add hot key
        </Button>
      </div>

      <DiaryEditor
        ref={editorRef}
        value={text}
        onChange={setText}
        onSubmit={log}
        size="lg"
        label="Diary entry"
        placeholder="Type a diary entry, or pick a hot key above…"
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
        <p aria-live="polite" title={notice} className="min-w-0 flex-1 truncate text-caption text-ink-muted">
          {notice}
        </p>
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
