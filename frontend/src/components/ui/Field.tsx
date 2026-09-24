import type { InputHTMLAttributes, LabelHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/** Shared look for text inputs, selects and textareas. */
const FIELD =
  'rounded-md border border-border-strong bg-surface px-2.5 text-body text-ink shadow-xs transition-colors placeholder:text-ink-disabled hover:border-ink-disabled focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary/25 disabled:opacity-60'

type FieldSize = 'sm' | 'md'

const HEIGHTS: Record<FieldSize, string> = {
  sm: 'h-8',
  md: 'h-9',
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  fieldSize?: FieldSize
  ref?: Ref<HTMLInputElement>
}

export function Input({ fieldSize = 'md', className = '', ...props }: InputProps) {
  return <input className={`${FIELD} ${HEIGHTS[fieldSize]} ${className}`} {...props} />
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  fieldSize?: FieldSize
}

export function Select({ fieldSize = 'md', className = '', ...props }: SelectProps) {
  return <select className={`${FIELD} ${HEIGHTS[fieldSize]} pr-7 ${className}`} {...props} />
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={`${FIELD} py-2 ${className}`} {...props} />
}

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-secondary font-medium text-ink-secondary ${className}`} {...props} />
}

/** Native checkbox tinted with the brand colour. */
export function Checkbox({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <input type="checkbox" className={`size-4 shrink-0 accent-primary ${className}`} {...props} />
}
