import { pdf } from '@react-pdf/renderer'
import type { Person, ShiftDiary } from '../types'
import { DiaryPdfDocument, type PdfOptions } from './DiaryPdfDocument'

export type { PdfOptions }

interface DownloadRequest {
  diaries: ShiftDiary[]
  options: PdfOptions
  generatedBy: Person
  fileName: string

  withIndex: boolean
}

export async function downloadDiaryPdf({ diaries, options, generatedBy, fileName, withIndex }: DownloadRequest) {
  const blob = await pdf(
    <DiaryPdfDocument
      diaries={diaries}
      options={options}
      meta={{ generatedBy, generatedAt: new Date() }}
      withIndex={withIndex}
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
