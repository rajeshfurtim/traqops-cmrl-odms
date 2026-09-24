import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Redo2, Undo2, type LucideIcon } from 'lucide-react'
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import { docToMarkup, markupToHtml } from '../editorMarkup'

export interface DiaryEditorHandle {
  focus: () => void
  /** Inserts markup at the cursor (or at the end), e.g. a PN number or a hot key message. */
  insert: (markup: string, options?: { asNewLine?: boolean; selectFirstBlank?: boolean }) => void
}

interface DiaryEditorProps {
  /** Stored markup (see richText.ts). */
  value: string
  onChange: (markup: string) => void
  /** Ctrl/⌘ + Enter. */
  onSubmit?: () => void
  /** Esc. */
  onCancel?: () => void
  placeholder?: string
  label: string
  autoFocus?: boolean
  /** Taller writing area for the main composer. */
  size?: 'md' | 'lg'
  invalid?: boolean
  ref?: Ref<DiaryEditorHandle>
  /** Extra controls at the right of the toolbar. */
  toolbarEnd?: ReactNode
}

const TOOL =
  'inline-flex size-8 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-subtle hover:text-ink aria-pressed:bg-primary-subtle aria-pressed:text-primary-ink disabled:pointer-events-none disabled:opacity-40'

const MIN_HEIGHT: Record<'md' | 'lg', string> = { md: 'min-h-20', lg: 'min-h-24' }

/** Selects the first "__" blank at or after `from`, so the controller can type straight over it. */
function selectFirstBlank(editor: Editor, from = 0) {
  let found: { from: number; to: number } | undefined
  editor.state.doc.descendants((node, pos) => {
    if (found || !node.isText || !node.text) return !found
    const index = node.text.indexOf('__', Math.max(0, from - pos))
    if (index >= 0) found = { from: pos + index, to: pos + index + 2 }
    return false
  })
  if (found) editor.commands.setTextSelection(found)
  // Focus synchronously: TipTap's focus command is deferred and can lose to the clicked button.
  editor.view.focus()
}

/**
 * WYSIWYG editor for diary entries: bold, italic and lists show as formatted while typing.
 * Supports only what the stored markup supports, so what you see is exactly what is logged and printed.
 */
export function DiaryEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  label,
  autoFocus = false,
  size = 'md',
  invalid = false,
  ref,
  toolbarEnd,
}: DiaryEditorProps) {
  // Last markup this editor emitted, so external updates (clear, hot key) are told apart from typing.
  const emitted = useRef(value)
  // Latest callbacks, read by the editor's handlers (the editor is created once).
  const handlers = useRef({ onChange, onSubmit, onCancel })
  useLayoutEffect(() => {
    handlers.current = { onChange, onSubmit, onCancel }
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Only what the diary markup can store.
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: markupToHtml(value),
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        class: `odms-editor ${MIN_HEIGHT[size]} px-4 py-3 text-body-lg text-ink outline-none sm:text-body`,
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && handlers.current.onSubmit) {
          event.preventDefault()
          handlers.current.onSubmit()
          return true
        }
        if (event.key === 'Escape' && handlers.current.onCancel) {
          handlers.current.onCancel()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      const markup = docToMarkup(e.getJSON())
      emitted.current = markup
      handlers.current.onChange(markup)
    },
  })

  // Value changed from outside (entry logged → cleared, draft restored): load it into the editor.
  useEffect(() => {
    if (!editor || value === emitted.current) return
    emitted.current = value
    editor.commands.setContent(markupToHtml(value), { emitUpdate: false })
  }, [editor, value])

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.commands.focus(),
      insert: (markup, options = {}) => {
        if (!editor) return
        const html = markupToHtml(markup)
        // Where the new text starts, so only its own blanks are selected.
        const start = editor.isEmpty
          ? 0
          : options.asNewLine
            ? editor.state.doc.content.size
            : editor.state.selection.from
        if (editor.isEmpty) editor.commands.setContent(html)
        else if (options.asNewLine)
          editor.chain().setTextSelection(editor.state.doc.content.size).insertContent(html).run()
        else editor.commands.insertContent(markup.replace(/\n/g, ' '))
        if (options.selectFirstBlank) selectFirstBlank(editor, start)
        else {
          editor.commands.setTextSelection(editor.state.doc.content.size)
          editor.view.focus()
        }
      },
    }),
    [editor],
  )

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      italic: e?.isActive('italic') ?? false,
      bullet: e?.isActive('bulletList') ?? false,
      ordered: e?.isActive('orderedList') ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  })

  const tools: { label: string; icon: LucideIcon; pressed?: boolean; disabled?: boolean; run: () => void }[] = [
    { label: 'Bold', icon: Bold, pressed: active?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: Italic, pressed: active?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    {
      label: 'Bulleted list',
      icon: List,
      pressed: active?.bullet,
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Numbered list',
      icon: ListOrdered,
      pressed: active?.ordered,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ]
  const history = [
    { label: 'Undo', icon: Undo2, disabled: !active?.canUndo, run: () => editor?.chain().focus().undo().run() },
    { label: 'Redo', icon: Redo2, disabled: !active?.canRedo, run: () => editor?.chain().focus().redo().run() },
  ]

  return (
    <div className={invalid ? 'ring-2 ring-danger/40 ring-inset' : ''}>
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1"
        role="toolbar"
        aria-label={`${label} formatting`}
      >
        {tools.map(({ label: name, icon: Icon, pressed, run }) => (
          <button
            key={name}
            type="button"
            className={TOOL}
            aria-label={name}
            aria-pressed={Boolean(pressed)}
            title={name}
            // Keep the editor's selection when the button is clicked.
            onMouseDown={(e) => e.preventDefault()}
            onClick={run}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        ))}
        <span aria-hidden className="mx-1 h-4 w-px bg-border" />
        {history.map(({ label: name, icon: Icon, disabled, run }) => (
          <button
            key={name}
            type="button"
            className={TOOL}
            aria-label={name}
            title={name}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={run}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        ))}
        {toolbarEnd && <div className="ml-auto flex items-center gap-2">{toolbarEnd}</div>}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
