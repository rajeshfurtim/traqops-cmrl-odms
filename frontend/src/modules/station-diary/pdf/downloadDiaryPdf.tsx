import { pdf } from '@react-pdf/renderer'
import type { Person, ShiftDiary } from '../types'
import { DiaryPdfDocument, type PdfOptions } from './DiaryPdfDocument'

export type { PdfOptions }

interface DownloadRequest {
  /** Oldest first. */
  diaries: ShiftDiary[]
  options: PdfOptions
  generatedBy: Person
  fileName: string
  /** Adds an index page (booklet exports). */
  withIndex: boolean
}

/**
 * Builds the PDF in the browser and saves it. Lazy-loaded by the export dialog.
 * When the backend can render PDFs, replace the body with a fetch of the server file:
 * callers only depend on this signature.
 */
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
  // Give the browser a moment to start the download before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
