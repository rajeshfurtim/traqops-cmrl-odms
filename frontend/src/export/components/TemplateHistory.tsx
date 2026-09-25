import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatStampSeconds } from '../format'
import type { HeaderTemplate } from '../types'

interface TemplateHistoryProps {
  versions: HeaderTemplate[]
  /** Loads a version into the form; saving it makes a new version. */
  onRestore?: (version: HeaderTemplate) => void
}

export function TemplateHistory({ versions, onRestore }: TemplateHistoryProps) {
  if (!versions.length) {
    return <p className="text-caption text-ink-muted">No saved versions yet. The built-in default is in use.</p>
  }
  return (
    <ol className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {versions.map((v, i) => (
        <li key={v.id} className="flex items-start justify-between gap-3 px-3 py-2">
          <div className="min-w-0 text-caption">
            <p className="text-secondary font-semibold text-ink">
              v{v.version}
              {i === 0 && (
                <span className="ml-1.5 font-medium text-ink-muted">· {v.retired ? 'removed' : 'in use'}</span>
              )}
            </p>
            <p className="text-ink-muted tabular-nums">
              {formatStampSeconds(v.updatedAt)} · {v.updatedBy.name} ({v.updatedBy.employeeId})
            </p>
            {v.note && <p className="text-ink-secondary">{v.note}</p>}
          </div>
          {onRestore && !v.retired && i > 0 && (
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => onRestore(v)}>
              Restore
            </Button>
          )}
        </li>
      ))}
    </ol>
  )
}
