import { pdf } from '@react-pdf/renderer'
import { downloadBlob } from '../download'
import type { ReportLayout } from '../layout'
import { ReportPdfDocument } from '../pdf/ReportPdfDocument'

/** Loaded on demand: pulls in react-pdf and the fonts only when someone exports. */
export async function downloadReportPdf(layout: ReportLayout, author: string, fileName: string) {
  const blob = await pdf(<ReportPdfDocument layout={layout} author={author} />).toBlob()
  downloadBlob(blob, fileName)
}
