import { pdf } from '@react-pdf/renderer'
import type { DiaryStatus, Person, ShiftCode, ShiftDiary } from '../types'
import { SummaryTablePdfDocument } from './SummaryTablePdfDocument'

export interface DownloadSummaryPdfRequest {
  diaries: ShiftDiary[]
  stationName: string
  stationCode: string
  from: string
  to: string
  shift: ShiftCode | ''
  status: DiaryStatus | ''
  generatedBy: Person
  fileName: string
}

export async function downloadSummaryPdf({
  diaries,
  stationName,
  stationCode,
  from,
  to,
  shift,
  status,
  generatedBy,
  fileName,
}: DownloadSummaryPdfRequest) {
  const blob = await pdf(
    <SummaryTablePdfDocument
      diaries={diaries}
      stationName={stationName}
      stationCode={stationCode}
      from={from}
      to={to}
      shift={shift}
      status={status}
      meta={{ generatedBy, generatedAt: new Date() }}
    />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
