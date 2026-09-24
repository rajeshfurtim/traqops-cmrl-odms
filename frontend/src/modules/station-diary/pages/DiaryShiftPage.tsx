import { Download, History, Lock, NotebookPen, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DiaryTabs } from '../components/DiaryTabs'
import { DiaryTimeline } from '../components/DiaryTimeline'
import { EntryComposer } from '../components/EntryComposer'
import { ExportPdfDialog } from '../components/ExportPdfDialog'
import { HandoverDialog } from '../components/HandoverDialog'
import { ShiftStrip } from '../components/ShiftStrip'
import { HandoverPanel, TasksPanel } from '../components/SidePanels'
import { STATUS_LABELS, STATUS_TONES } from '../constants'
import { useDiaries } from '../data/diaryStore'
import { useActor, useCurrentDiaryId } from '../hooks'
import { addDays, compareDiariesAsc, formatLongDate, shiftLabel } from '../utils'

/**
 * One shift's diary. `/station-diary` opens the controller's current shift;
 * `/station-diary/shifts/:shiftId` opens any other shift read-only.
 */
export default function DiaryShiftPage() {
  const { shiftId } = useParams()
  const currentId = useCurrentDiaryId()
  const all = useDiaries()
  const actor = useActor()
  const navigate = useNavigate()
  const [exportOpen, setExportOpen] = useState(false)
  const [handoverOpen, setHandoverOpen] = useState(false)

  const id = shiftId ?? currentId
  const diary = all.find((d) => d.id === id)

  const { previousId, nextId, lastSubmittedId } = useMemo(() => {
    if (!diary) return {}
    const sameStation = all
      .filter((d) => d.stationCode === diary.stationCode && d.status !== 'upcoming')
      .sort(compareDiariesAsc)
    const index = sameStation.findIndex((d) => d.id === diary.id)
    const earlier = sameStation.slice(0, index)
    return {
      previousId: earlier[earlier.length - 1]?.id,
      nextId: sameStation[index + 1]?.id,
      lastSubmittedId: earlier.reverse().find((d) => d.status === 'submitted')?.id,
    }
  }, [all, diary])

  if (!diary) {
    return (
      <>
        <PageHeader title="Station Diary" />
        <DiaryTabs />
        <EmptyState
          icon={NotebookPen}
          title="Shift not found"
          description="This shift diary doesn't exist or is from another station."
          action={
            <Link to="/station-diary" className="font-medium text-primary-ink hover:underline">
              Open today's diary
            </Link>
          }
        />
      </>
    )
  }

  const isCurrent = diary.id === currentId
  const editable = isCurrent && diary.status === 'in-progress' && diary.controller?.employeeId === actor.employeeId

  return (
    <>
      <PageHeader
        title="Station Diary"
        description={`${diary.stationName} (${diary.stationCode}) · ${formatLongDate(diary.date)} · ${shiftLabel(diary.shift)}`}
        status={
          <Badge tone={STATUS_TONES[diary.status]} dot>
            {STATUS_LABELS[diary.status]}
          </Badge>
        }
        actions={
          <>
            {lastSubmittedId && (
              <Button icon={History} onClick={() => navigate(`/station-diary/shifts/${lastSubmittedId}`)}>
                Last shift summary
              </Button>
            )}
            <Button icon={Download} onClick={() => setExportOpen(true)}>
              Export PDF
            </Button>
            {editable && (
              <Button variant="primary" icon={Send} onClick={() => setHandoverOpen(true)}>
                Submit &amp; hand over
              </Button>
            )}
          </>
        }
      />
      <DiaryTabs />

      <div className="flex flex-col gap-4">
        {!isCurrent && (
          <p className="flex items-center gap-2 rounded-lg bg-info-subtle px-3 py-2 text-secondary text-info">
            <Lock aria-hidden className="size-4 shrink-0" />
            You're viewing a past shift. It can't be changed.
            <Link to="/station-diary" className="ml-auto font-medium underline-offset-2 hover:underline">
              Back to today
            </Link>
          </p>
        )}
        {isCurrent && diary.status === 'submitted' && (
          <p className="flex items-center gap-2 rounded-lg bg-success-subtle px-3 py-2 text-secondary text-success">
            <Lock aria-hidden className="size-4 shrink-0" />
            Shift handed over. The diary is locked and the PDF is now the official copy.
          </p>
        )}

        <ShiftStrip diary={diary} />

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-4">
            {editable && <EntryComposer key={diary.id} diary={diary} actor={actor} />}
            <DiaryTimeline diary={diary} previousId={previousId} nextId={nextId} editable={editable} actor={actor} />
          </div>
          <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1" aria-label="Shift details">
            <TasksPanel diary={diary} actor={actor} editable={editable} />
            <HandoverPanel diary={diary} />
          </aside>
        </div>
      </div>

      <ExportPdfDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        diary={diary}
        defaultScope="shift"
        defaultRange={{ from: addDays(diary.date, -6), to: diary.date }}
      />
      {editable && (
        <HandoverDialog diary={diary} actor={actor} open={handoverOpen} onClose={() => setHandoverOpen(false)} />
      )}
    </>
  )
}
