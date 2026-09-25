import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logo from '@/assets/cmrl-logo.png'
import latinItalic from '@fontsource/inter/files/inter-latin-400-italic.woff'
import latinRegular from '@fontsource/inter/files/inter-latin-400-normal.woff'
import latinSemiBold from '@fontsource/inter/files/inter-latin-600-normal.woff'
import extItalic from '@fontsource/inter/files/inter-latin-ext-400-italic.woff'
import extRegular from '@fontsource/inter/files/inter-latin-ext-400-normal.woff'
import extSemiBold from '@fontsource/inter/files/inter-latin-ext-600-normal.woff'
import { pairRows, type LabelValue, type ReportLayout } from '../layout'

// Own family names, so this never clashes with the Station Diary PDF's registration.
Font.register({
  family: 'ReportInter',
  fonts: [{ src: latinRegular }, { src: latinSemiBold, fontWeight: 600 }, { src: latinItalic, fontStyle: 'italic' }],
})
Font.register({
  family: 'ReportInterExt',
  fonts: [{ src: extRegular }, { src: extSemiBold, fontWeight: 600 }, { src: extItalic, fontStyle: 'italic' }],
})
Font.registerHyphenationCallback((word) => [word])

// Same values as the paper-* tokens in index.css.
const INK = '#1f2937'
const MUTED = '#6b7280'
const LINE = '#9ca3af'
const HEAD = '#eef2f8'
const BRAND = '#0b1f3a'

const s = StyleSheet.create({
  page: {
    fontFamily: ['ReportInter', 'ReportInterExt'],
    fontSize: 8,
    color: INK,
    paddingTop: 24,
    paddingBottom: 40,
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
  table: { borderTopWidth: 0.75, borderLeftWidth: 0.75, borderColor: LINE, marginBottom: 6 },
  row: { flexDirection: 'row' },
  cell: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: LINE,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  head: { backgroundColor: HEAD, fontWeight: 600 },
  center: { alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  organisation: { fontSize: 10.5, fontWeight: 600, color: BRAND, letterSpacing: 0.3 },
  title: { fontSize: 9, fontWeight: 600, marginTop: 2, textTransform: 'uppercase' },
  subtitle: { fontSize: 7, color: MUTED, letterSpacing: 0.4, marginTop: 1, textTransform: 'uppercase' },
  line: { fontSize: 7.5, marginTop: 1 },
  small: { fontSize: 6.5, color: MUTED, marginTop: 1 },
  label: { fontWeight: 600, color: MUTED },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 16,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.5,
    color: MUTED,
  },
})

const ALIGN = { left: 'left', center: 'center', right: 'right' } as const

function Labelled({ item, upper = false }: { item: LabelValue; upper?: boolean }) {
  return (
    <Text>
      <Text style={s.label}>{upper ? item.label.toUpperCase() : item.label}: </Text>
      {item.value}
    </Text>
  )
}

function StandardHeader({ header }: { header: ReportLayout['header'] }) {
  return (
    <>
      <View style={[s.table, s.row]}>
        <View style={[s.cell, s.center, { width: '12%' }]}>
          <Image src={logo} style={{ width: 34, height: 34, objectFit: 'contain' }} />
        </View>
        <View style={[s.cell, s.center, { flexGrow: 1, flexBasis: 0 }]}>
          <Text style={s.organisation}>{header.organisation}</Text>
          <Text style={s.title}>{header.title}</Text>
          {header.subtitle ? <Text style={s.subtitle}>{header.subtitle}</Text> : null}
          {header.department ? <Text style={s.line}>{header.department}</Text> : null}
        </View>
        {header.docControl.length > 0 && (
          <View style={[s.cell, { width: '22%', justifyContent: 'center', fontSize: 7 }]}>
            {header.docControl.map((d) => (
              <Labelled key={d.label} item={d} upper />
            ))}
          </View>
        )}
      </View>

      {header.runDetails.length > 0 && (
        <View style={s.table}>
          {pairRows(header.runDetails).map((pair) => (
            <View key={pair[0].label} style={s.row}>
              {pair.map((d) => (
                <View key={d.label} style={[s.row, { width: pair.length === 1 ? '100%' : '50%' }]}>
                  <Text style={[s.cell, s.head, { width: pair.length === 1 ? '15%' : '30%' }]}>{d.label}</Text>
                  <Text style={[s.cell, { flexGrow: 1, flexBasis: 0 }]}>{d.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </>
  )
}

function CompactHeader({ header }: { header: ReportLayout['header'] }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <View
        style={[s.row, { alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: BRAND, paddingBottom: 4 }]}
      >
        <Image src={logo} style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 8 }} />
        <View style={{ flexGrow: 1, flexBasis: 0 }}>
          <Text style={{ fontSize: 7, fontWeight: 600, color: BRAND, letterSpacing: 0.3 }}>{header.organisation}</Text>
          <Text style={{ fontSize: 9.5, fontWeight: 600 }}>
            {header.title}
            {header.subtitle ? <Text style={{ color: MUTED, fontWeight: 400 }}> · {header.subtitle}</Text> : null}
          </Text>
          {header.department ? <Text style={{ fontSize: 7, color: MUTED }}>{header.department}</Text> : null}
        </View>
        {header.docControl.length > 0 && (
          <View style={{ fontSize: 6.5, alignItems: 'flex-end' }}>
            {header.docControl.map((d) => (
              <Labelled key={d.label} item={d} />
            ))}
          </View>
        )}
      </View>
      <Text style={{ fontSize: 7, marginTop: 3 }}>
        {header.runDetails.map((d, i) => (
          <Text key={d.label}>
            {i > 0 ? <Text style={{ color: MUTED }}> · </Text> : null}
            <Text style={s.label}>{d.label}: </Text>
            {d.value}
          </Text>
        ))}
      </Text>
    </View>
  )
}

/** The report as a real PDF, drawn from the same `ReportLayout` as the HTML sheet. */
export function ReportPdfDocument({ layout, author }: { layout: ReportLayout; author: string }) {
  const { header, columns } = layout
  return (
    <Document
      title={layout.documentTitle}
      author={author}
      subject={layout.footer.reference}
      keywords={layout.footer.reference}
      creator="ODMS · Chennai Metro Rail"
      producer="ODMS"
    >
      <Page size="A4" orientation={layout.orientation} style={s.page}>
        <View style={s.watermark} fixed>
          <Image src={logo} style={s.watermarkLogo} />
        </View>

        {header.layout === 'compact' ? <CompactHeader header={header} /> : <StandardHeader header={header} />}

        <View style={s.table}>
          <View style={s.row} fixed>
            {columns.map((c) => (
              <Text key={c.id} style={[s.cell, s.head, { width: c.width, textAlign: ALIGN[c.align] }]}>
                {c.header}
              </Text>
            ))}
          </View>
          {layout.rows.length === 0 ? (
            <View style={s.row}>
              <Text style={[s.cell, { width: '100%', textAlign: 'center', color: MUTED, paddingVertical: 10 }]}>
                No records match the selected filters.
              </Text>
            </View>
          ) : (
            layout.rows.map((row) => (
              <View key={row.key} style={s.row} wrap={false}>
                {row.cells.map((cell, i) => (
                  <View key={columns[i].id} style={[s.cell, { width: columns[i].width }]}>
                    <Text style={{ textAlign: ALIGN[columns[i].align] }}>{cell.text}</Text>
                    {cell.sub ? (
                      <Text style={[s.small, { textAlign: ALIGN[columns[i].align] }]}>{cell.sub}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        <View style={s.footer} fixed>
          <Text style={{ maxWidth: '55%' }}>{layout.footer.generated}</Text>
          <Text>{layout.footer.reference}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
