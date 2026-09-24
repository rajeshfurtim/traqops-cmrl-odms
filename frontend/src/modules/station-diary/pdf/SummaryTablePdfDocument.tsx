import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logo from '@/assets/cmrl-logo.png'
import { STATUS_LABELS } from '../constants'
import type { DiaryStatus, Person, ShiftCode, ShiftDiary } from '../types'
import { formatFormDate, formatStamp } from '../utils'
import latinItalic from '@fontsource/inter/files/inter-latin-400-italic.woff'
import latinRegular from '@fontsource/inter/files/inter-latin-400-normal.woff'
import latinSemiBold from '@fontsource/inter/files/inter-latin-600-normal.woff'
import extItalic from '@fontsource/inter/files/inter-latin-ext-400-italic.woff'
import extRegular from '@fontsource/inter/files/inter-latin-ext-400-normal.woff'
import extSemiBold from '@fontsource/inter/files/inter-latin-ext-600-normal.woff'

try {
  Font.register({
    family: 'Inter',
    fonts: [{ src: latinRegular }, { src: latinSemiBold, fontWeight: 600 }, { src: latinItalic, fontStyle: 'italic' }],
  })
  Font.register({
    family: 'InterExt',
    fonts: [{ src: extRegular }, { src: extSemiBold, fontWeight: 600 }, { src: extItalic, fontStyle: 'italic' }],
  })
  Font.registerHyphenationCallback((word) => [word])
} catch {
  // Already registered
}

const INK = '#1f2937'
const MUTED = '#6b7280'
const LINE = '#9ca3af'
const HEAD = '#eef2f8'
const BRAND = '#0b1f3a'
const ALERT = '#b12218'

const styles = StyleSheet.create({
  page: {
    fontFamily: ['Inter', 'InterExt'],
    fontSize: 8,
    color: INK,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  watermark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkLogo: { width: 300, height: 300, opacity: 0.06 },
  sheetFrame: {
    borderWidth: 0.75,
    borderColor: LINE,
    padding: 8,
    backgroundColor: '#ffffff',
  },
  table: {
    borderTopWidth: 0.75,
    borderLeftWidth: 0.75,
    borderColor: LINE,
    marginBottom: 5,
  },
  row: { flexDirection: 'row' },
  cell: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: LINE,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  headerCell: {
    backgroundColor: HEAD,
    fontWeight: 600,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 10.5, fontWeight: 600, color: BRAND, letterSpacing: 0.3 },
  subtitle: { fontSize: 7, color: MUTED, letterSpacing: 0.4, marginTop: 1 },
  station: { fontSize: 8.5, fontWeight: 600, marginTop: 1 },
  refText: { fontSize: 6.5, color: MUTED, lineHeight: 1.25 },
  small: { fontSize: 6, color: MUTED, marginTop: 1 },
  footer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.5,
    color: MUTED,
  },
})

export interface SummaryPdfProps {
  diaries: ShiftDiary[]
  stationName: string
  stationCode: string
  from: string
  to: string
  shift: ShiftCode | ''
  status: DiaryStatus | ''
  meta: {
    generatedBy: Person
    generatedAt: Date
  }
}

export function SummaryTablePdfDocument({
  diaries,
  stationName,
  stationCode,
  from,
  to,
  shift,
  status,
  meta,
}: SummaryPdfProps) {
  const widths = ['13%', '7%', '24%', '7%', '15%', '17%', '17%']

  const genDate = meta.generatedAt.toLocaleDateString('en-GB')
  const genTime = meta.generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const genLine = `Generated from ODMS by ${meta.generatedBy.name} (${meta.generatedBy.employeeId}) on ${genDate} ${genTime}`

  return (
    <Document
      title={`Shift Summary ${stationCode} ${from} to ${to}`}
      author={meta.generatedBy.name}
      creator="ODMS · Chennai Metro Rail"
      producer="ODMS"
    >
      <Page size="A4" style={styles.page}>
        {/* CMRL Logo Watermark */}
        <View style={styles.watermark} fixed>
          <Image src={logo} style={styles.watermarkLogo} />
        </View>

        {/* Outer Official Form Frame */}
        <View style={styles.sheetFrame}>
          {/* Header Table */}
          <View style={[styles.table, styles.row]}>
            <View style={[styles.cell, styles.center, { width: '12%' }]}>
              <Image src={logo} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </View>
            <View style={[styles.cell, styles.center, { width: '66%' }]}>
              <Text style={styles.title}>CHENNAI METRO RAIL LIMITED</Text>
              <Text style={styles.subtitle}>STATION SHIFT DIARY REGISTER — SHIFT SUMMARY</Text>
              <Text style={styles.station}>
                {stationName} ({stationCode})
              </Text>
            </View>
            <View style={[styles.cell, { width: '22%', justifyContent: 'center' }]}>
              <Text style={styles.refText}>
                <Text style={{ fontWeight: 600 }}>REF: </Text>CMRL/OPER/SO/R-01
              </Text>
              <Text style={styles.refText}>
                <Text style={{ fontWeight: 600 }}>PERIOD: </Text>
                {formatFormDate(from)} to {formatFormDate(to)}
              </Text>
              <Text style={styles.refText}>
                <Text style={{ fontWeight: 600 }}>RECORDS: </Text>
                {diaries.length} shift{diaries.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>

          {/* Filter & Metadata Block */}
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell, { width: '15%' }]}>Shift Filter</Text>
              <Text style={[styles.cell, { width: '35%' }]}>{shift ? `Shift ${shift}` : 'All shifts'}</Text>
              <Text style={[styles.cell, styles.headerCell, { width: '15%' }]}>Status Filter</Text>
              <Text style={[styles.cell, { width: '35%' }]}>{status ? STATUS_LABELS[status] : 'All statuses'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.cell, styles.headerCell, { width: '15%' }]}>Generated By</Text>
              <Text style={[styles.cell, { width: '35%' }]}>
                {meta.generatedBy.name} ({meta.generatedBy.employeeId})
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '15%' }]}>Generated On</Text>
              <Text style={[styles.cell, { width: '35%' }]}>{`${genDate} ${genTime}`}</Text>
            </View>
          </View>

          {/* Summary Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.row} fixed>
              {['Date', 'Shift', 'Station Controller', 'Entries', 'Status', 'Handed over by', 'Taken over by'].map(
                (h, i) => (
                  <Text
                    key={h}
                    style={[
                      styles.cell,
                      styles.headerCell,
                      {
                        width: widths[i],
                        textAlign: i === 1 || i === 3 ? 'center' : 'left',
                      },
                    ]}
                  >
                    {h}
                  </Text>
                ),
              )}
            </View>

            {/* Table Rows */}
            {diaries.length === 0 ? (
              <View style={styles.row}>
                <Text style={[styles.cell, { width: '100%', textAlign: 'center', color: MUTED, paddingVertical: 10 }]}>
                  No shifts match the selected filters.
                </Text>
              </View>
            ) : (
              diaries.map((d) => (
                <View key={d.id} style={styles.row} wrap={false}>
                  <Text style={[styles.cell, { width: widths[0], fontWeight: 500 }]}>{formatFormDate(d.date)}</Text>
                  <Text style={[styles.cell, { width: widths[1], textAlign: 'center', fontWeight: 600 }]}>
                    {d.shift}
                  </Text>
                  <View style={[styles.cell, { width: widths[2] }]}>
                    <Text>{d.controller?.name ?? '—'}</Text>
                    {d.controller && <Text style={styles.small}>{d.controller.employeeId}</Text>}
                  </View>
                  <Text style={[styles.cell, { width: widths[3], textAlign: 'center' }]}>{d.entries.length}</Text>
                  <Text style={[styles.cell, { width: widths[4] }]}>{STATUS_LABELS[d.status]}</Text>
                  <View style={[styles.cell, { width: widths[5] }]}>
                    <Text>{d.handover.handedAt ? d.handover.handedBy?.name : '—'}</Text>
                    {d.handover.handedAt && <Text style={styles.small}>{formatStamp(d.handover.handedAt)}</Text>}
                  </View>
                  <View style={[styles.cell, { width: widths[6] }]}>
                    <Text>{d.handover.takenBy?.name ?? '—'}</Text>
                    {d.handover.takenBy && !d.handover.takenAt && (
                      <Text style={[styles.small, { color: ALERT }]}>Awaiting acknowledgement</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Form Footer */}
          <View style={styles.footer}>
            <Text>{genLine} · Official Station Operations Register</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  )
}
