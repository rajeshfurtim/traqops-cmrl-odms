/*
 * Official Station Diary form (CMRL/OPER/SO/F-01) as a real PDF.
 * Mirrors components/DiaryFormSheet.tsx, which shows the same layout on screen.
 * Only loaded when someone exports, so react-pdf never weighs down the diary itself.
 */
import { Document, Font, Image, Page, Polygon, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'
import logo from '@/assets/cmrl-logo.png'
import { FORM_DATE, FORM_NUMBER, FORM_REVISION, STATUS_LABELS } from '../constants'
import { parseRichText, type RichSpan } from '../richText'
import type { Person, ShiftDiary } from '../types'
import { diaryReference, formatFormDate, formatStamp, formatStampSeconds, sortEntriesAsc } from '../utils'
// Inter from the @fontsource/inter npm package (free, SIL OFL 1.1). react-pdf can embed WOFF but not WOFF2.
// The Latin file covers normal text; the Latin Extended file supplies ₹ (react-pdf falls back per glyph).
import latinItalic from '@fontsource/inter/files/inter-latin-400-italic.woff'
import latinRegular from '@fontsource/inter/files/inter-latin-400-normal.woff'
import latinSemiBold from '@fontsource/inter/files/inter-latin-600-normal.woff'
import extItalic from '@fontsource/inter/files/inter-latin-ext-400-italic.woff'
import extRegular from '@fontsource/inter/files/inter-latin-ext-400-normal.woff'
import extSemiBold from '@fontsource/inter/files/inter-latin-ext-600-normal.woff'

Font.register({
  family: 'Inter',
  fonts: [{ src: latinRegular }, { src: latinSemiBold, fontWeight: 600 }, { src: latinItalic, fontStyle: 'italic' }],
})
Font.register({
  family: 'InterExt',
  fonts: [{ src: extRegular }, { src: extSemiBold, fontWeight: 600 }, { src: extItalic, fontStyle: 'italic' }],
})
Font.registerHyphenationCallback((word) => [word])

// PDF colours mirror the --color-paper-* tokens in styles/index.css.
const INK = '#1f2937'
const MUTED = '#6b7280'
const LINE = '#9ca3af'
const HEAD = '#eef2f8'
const SIGN = '#1e3a8a'
const ALERT = '#b12218'

const s = StyleSheet.create({
  page: {
    fontFamily: ['Inter', 'InterExt'],
    fontSize: 9,
    color: INK,
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  table: { borderTopWidth: 0.75, borderLeftWidth: 0.75, borderColor: LINE, marginBottom: 7 },
  row: { flexDirection: 'row' },
  cell: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: LINE,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  key: { backgroundColor: HEAD, fontWeight: 600 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4 },
  subtitle: { fontSize: 8, color: MUTED, marginTop: 1 },
  small: { fontSize: 7.5, color: MUTED },
  section: { fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  sign: { fontStyle: 'italic', fontSize: 11, color: SIGN },
  // CMRL roundel, faint and centred behind the content on every page.
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
  draft: { marginTop: 2, fontSize: 7.5, fontWeight: 600, color: ALERT },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: MUTED,
  },
})

export interface PdfOptions {
  importantOnly: boolean
  includeTasks: boolean
  includeImages: boolean
}

export interface PdfMeta {
  generatedBy: Person
  generatedAt: Date
}

function Spans({ spans }: { spans: RichSpan[] }) {
  return spans.map((span, i) => (
    <Text key={i} style={span.bold ? { fontWeight: 600 } : span.italic ? { fontStyle: 'italic' } : undefined}>
      {span.text}
    </Text>
  ))
}

/** Drawn, not typed: the ★ glyph isn't in Inter's Latin files. */
function Star() {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: 8, height: 8, marginTop: 1.5, marginRight: 3 }}>
      <Polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9" fill={INK} />
    </Svg>
  )
}

function RichPdfText({ text }: { text: string }) {
  return parseRichText(text).map((block, i) => (
    <Text key={i} style={block.type === 'paragraph' ? undefined : { paddingLeft: 6 }}>
      {block.type === 'bullet' && '•  '}
      {block.type === 'numbered' && `${block.marker}  `}
      <Spans spans={block.spans} />
    </Text>
  ))
}

function Pair({ k1, v1, k2, v2 }: { k1: string; v1: string; k2: string; v2: string }) {
  return (
    <View style={s.row}>
      <Text style={[s.cell, s.key, { width: '18%' }]}>{k1}</Text>
      <Text style={[s.cell, { width: '32%' }]}>{v1}</Text>
      <Text style={[s.cell, s.key, { width: '18%' }]}>{k2}</Text>
      <Text style={[s.cell, { width: '32%' }]}>{v2}</Text>
    </View>
  )
}

function Signature({ person, at }: { person?: Person; at?: string }) {
  if (!person || !at) return <Text style={s.small}>Not signed yet</Text>
  return (
    <View>
      <Text style={s.sign}>{person.name}</Text>
      <Text style={s.small}>Signed digitally · {formatStamp(at)}</Text>
    </View>
  )
}

function Footer({ left }: { left: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{left}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function generatedLine(meta: PdfMeta) {
  const d = meta.generatedAt
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `Generated from ODMS by ${meta.generatedBy.name} (${meta.generatedBy.employeeId}) on ${d.toLocaleDateString('en-GB')} ${time}`
}

function DiaryPage({ diary, options, meta }: { diary: ShiftDiary; options: PdfOptions; meta: PdfMeta }) {
  const entries = sortEntriesAsc(diary.entries).filter((e) => !options.importantOnly || e.important)
  const { handedBy, handedAt, takenBy, takenAt } = diary.handover

  return (
    <Page size="A4" style={s.page}>
      <View style={s.watermark} fixed>
        <Image src={logo} style={s.watermarkLogo} />
      </View>

      <View style={[s.table, s.row]}>
        <View style={[s.cell, s.center, { width: '12%' }]}>
          <Image src={logo} style={{ width: 34, height: 34, objectFit: 'contain' }} />
        </View>
        <View style={[s.cell, s.center, { width: '66%' }]}>
          <Text style={s.title}>CHENNAI METRO RAIL LIMITED</Text>
          <Text style={s.subtitle}>STATION DIARY</Text>
          <Text style={{ fontWeight: 600, marginTop: 1 }}>
            {diary.stationName} ({diary.stationCode})
          </Text>
        </View>
        <View style={[s.cell, { width: '22%', justifyContent: 'center', fontSize: 7.5 }]}>
          <Text>{FORM_NUMBER}</Text>
          <Text>{FORM_REVISION}</Text>
          <Text>{FORM_DATE}</Text>
          {diary.status === 'in-progress' && <Text style={s.draft}>DRAFT · not handed over</Text>}
        </View>
      </View>

      <View style={s.table}>
        <Pair k1="Date" v1={formatFormDate(diary.date)} k2="Shift" v2={diary.shift} />
        <Pair k1="Emp Name" v1={diary.controller?.name ?? '—'} k2="Emp ID" v2={diary.controller?.employeeId ?? '—'} />
        <Pair
          k1="Sign-in"
          v1={diary.signInAt ? formatStampSeconds(diary.signInAt) : '—'}
          k2="Sign-out"
          v2={diary.signOutAt ? formatStampSeconds(diary.signOutAt) : '—'}
        />
      </View>

      <View style={s.table}>
        <View style={s.row} fixed>
          <Text style={[s.cell, s.key, { width: '21%' }]}>Date &amp; time</Text>
          <Text style={[s.cell, s.key, { width: '79%' }]}>Remarks</Text>
        </View>
        {entries.length === 0 && (
          <Text style={[s.cell, { color: MUTED }]}>
            {diary.status === 'no-attendance' ? 'No attendance recorded for this shift.' : 'No entries.'}
          </Text>
        )}
        {entries.map((e) => (
          <View key={e.id} style={s.row} wrap={false}>
            <Text style={[s.cell, { width: '21%' }]}>{formatStampSeconds(e.at)}</Text>
            <View style={[s.cell, { width: '79%' }]}>
              <View style={s.row}>
                {e.important && <Star />}
                <View style={{ flex: 1 }}>
                  <RichPdfText text={e.text} />
                </View>
              </View>
              {e.editedAt && <Text style={s.small}>Edited {formatStampSeconds(e.editedAt)}</Text>}
              {e.registerRecord && <Text style={s.small}>Register ref: {e.registerRecord.ref}</Text>}
              {options.includeImages && e.attachments && (
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 3 }}>
                  {e.attachments.map((a) => (
                    <Image key={a.id} src={a.url} style={{ height: 70, objectFit: 'contain' }} />
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {options.includeTasks && diary.tasks.length > 0 && (
        <View wrap={false}>
          <Text style={s.section}>Tasks &amp; events</Text>
          <View style={s.table}>
            {diary.tasks.map((t) => (
              <View key={t.id} style={s.row}>
                <Text style={[s.cell, { width: '14%' }]}>{t.kind === 'circular' ? 'Circular' : 'Task'}</Text>
                <Text style={[s.cell, { width: '66%' }]}>{t.title}</Text>
                <Text style={[s.cell, { width: '20%', textTransform: 'capitalize' }]}>{t.status}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View wrap={false}>
        <Text style={s.section}>Shift handover details</Text>
        <View style={s.table}>
          <View style={s.row}>
            <Text style={[s.cell, s.key, { width: '18%' }]}>Handed Over By</Text>
            <Text style={[s.cell, { width: '32%' }]}>
              {handedBy ? `${handedBy.name} (${handedBy.employeeId})` : '—'}
            </Text>
            <Text style={[s.cell, s.key, { width: '18%' }]}>Signature</Text>
            <View style={[s.cell, { width: '32%' }]}>
              <Signature person={handedBy} at={handedAt} />
            </View>
          </View>
          <View style={s.row}>
            <Text style={[s.cell, s.key, { width: '18%' }]}>Taken Over By</Text>
            <Text style={[s.cell, { width: '32%' }]}>{takenBy ? `${takenBy.name} (${takenBy.employeeId})` : '—'}</Text>
            <Text style={[s.cell, s.key, { width: '18%' }]}>Signature</Text>
            <View style={[s.cell, { width: '32%' }]}>
              <Signature person={takenBy} at={takenAt} />
            </View>
          </View>
        </View>
      </View>

      <Footer left={`Ref ${diaryReference(diary)} · ${generatedLine(meta)}`} />
    </Page>
  )
}

function IndexPage({ diaries, meta }: { diaries: ShiftDiary[]; meta: PdfMeta }) {
  const first = diaries[0]
  const last = diaries[diaries.length - 1]
  const widths = ['7%', '15%', '8%', '30%', '10%', '16%', '14%']
  return (
    <Page size="A4" style={s.page}>
      <View style={s.watermark} fixed>
        <Image src={logo} style={s.watermarkLogo} />
      </View>
      <View style={[s.table, s.row]}>
        <View style={[s.cell, s.center, { width: '12%' }]}>
          <Image src={logo} style={{ width: 34, height: 34, objectFit: 'contain' }} />
        </View>
        <View style={[s.cell, s.center, { width: '88%' }]}>
          <Text style={s.title}>CHENNAI METRO RAIL LIMITED</Text>
          <Text style={s.subtitle}>STATION DIARY BOOKLET · INDEX</Text>
          <Text style={{ fontWeight: 600, marginTop: 1 }}>
            {first.stationName} ({first.stationCode}) · {formatFormDate(first.date)} to {formatFormDate(last.date)}
          </Text>
        </View>
      </View>
      <View style={s.table}>
        <View style={s.row} fixed>
          {['Sheet', 'Date', 'Shift', 'Station Controller', 'Entries', 'Status', 'Handed over'].map((h, i) => (
            <Text key={h} style={[s.cell, s.key, { width: widths[i] }]}>
              {h}
            </Text>
          ))}
        </View>
        {diaries.map((d, i) => (
          <View key={d.id} style={s.row} wrap={false}>
            <Text style={[s.cell, { width: widths[0] }]}>{i + 1}</Text>
            <Text style={[s.cell, { width: widths[1] }]}>{formatFormDate(d.date)}</Text>
            <Text style={[s.cell, { width: widths[2] }]}>{d.shift}</Text>
            <Text style={[s.cell, { width: widths[3] }]}>{d.controller?.name ?? '—'}</Text>
            <Text style={[s.cell, { width: widths[4] }]}>{d.entries.length}</Text>
            <Text style={[s.cell, { width: widths[5] }]}>{STATUS_LABELS[d.status]}</Text>
            <Text style={[s.cell, { width: widths[6] }]}>
              {d.handover.handedAt ? formatStamp(d.handover.handedAt) : '—'}
            </Text>
          </View>
        ))}
      </View>
      <Footer left={generatedLine(meta)} />
    </Page>
  )
}

export function DiaryPdfDocument({
  diaries,
  options,
  meta,
  withIndex,
}: {
  diaries: ShiftDiary[]
  options: PdfOptions
  meta: PdfMeta
  withIndex: boolean
}) {
  const title =
    diaries.length === 1
      ? `Station Diary ${formatFormDate(diaries[0].date)} Shift ${diaries[0].shift}`
      : `Station Diary Booklet ${formatFormDate(diaries[0].date)} to ${formatFormDate(diaries[diaries.length - 1].date)}`
  return (
    <Document title={title} author={meta.generatedBy.name} creator="ODMS · Chennai Metro Rail" producer="ODMS">
      {withIndex && <IndexPage diaries={diaries} meta={meta} />}
      {diaries.map((d) => (
        <DiaryPage key={d.id} diary={d} options={options} meta={meta} />
      ))}
    </Document>
  )
}
