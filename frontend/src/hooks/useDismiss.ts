import { useEffect, useRef, type RefObject } from 'react'

export type DismissReason = 'escape' | 'outside'

/** Closes a non-modal popover on Escape or on a pointer press outside the given elements. */
export function useDismiss(
  active: boolean,
  onDismiss: (reason: DismissReason) => void,
  refs: RefObject<HTMLElement | null>[],
) {
  const onDismissRef = useRef(onDismiss)
  const refsRef = useRef(refs)
  useEffect(() => {
    onDismissRef.current = onDismiss
    refsRef.current = refs
  })

  useEffect(() => {
    if (!active) return

    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (refsRef.current.some((ref) => ref.current?.contains(target))) return
      onDismissRef.current('outside')
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onDismissRef.current('escape')
    }

    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [active])
}
