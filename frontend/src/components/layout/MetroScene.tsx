/** Car body length and spacing in the scene's 800 × 240 viewBox. */
const CAR = 212
const GAP = 8
const TOP = 112
const FLOOR = 166
/** Left edge of each car's two doors. */
const DOORS = [66, 160]
const DOOR_W = 22
const DOOR_H = FLOOR - TOP - 14
/** Saloon windows [x, width], kept clear of where the door leaves slide to. */
const WINDOWS: [number, number][] = [
  [12, 42],
  [100, 48],
  [194, 12],
]

/** Half of a sliding door: body panel with its window and the livery stripe, so the stripe slides with it. */
function DoorLeaf({ side }: { side: 'left' | 'right' }) {
  const x = side === 'left' ? 0 : DOOR_W / 2
  return (
    <g className={side === 'left' ? 'odms-door-left' : 'odms-door-right'}>
      <rect x={x} width={DOOR_W / 2} height={DOOR_H} className="fill-ink/95 stroke-nav/35" strokeWidth="1" />
      <rect x={x + 3} y="5" width={DOOR_W / 2 - 6} height="13" rx="1" className="fill-nav" />
      <rect x={x} y={TOP + 36 - (TOP + 8)} width={DOOR_W / 2} height="5" className="fill-accent" />
    </g>
  )
}

/**
 * A pair of sliding doors. While the train waits at the platform the leaves slide apart onto the body,
 * showing the lit saloon, and the amber door lamp above comes on (timed with the train in index.css).
 */
function Door({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${TOP + 8})`}>
      <rect width={DOOR_W} height={DOOR_H} className="fill-nav" />
      <rect y={DOOR_H - 14} width={DOOR_W} height="14" className="fill-accent/25" />
      <rect x="2" y="4" width={DOOR_W - 4} height="2" rx="1" className="fill-accent/40" />
      <DoorLeaf side="left" />
      <DoorLeaf side="right" />
      <circle cx={DOOR_W / 2} cy="-4" r="1.75" className="odms-door-lamp fill-accent" />
    </g>
  )
}

/** One trailing car: body, roof, windows, doors, livery stripe and bogies. */
function Car({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect y={TOP - 4} x="10" width={CAR - 20} height="5" rx="2" className="fill-ink/40" />
      <rect y={TOP} width={CAR} height={FLOOR - TOP} rx="5" className="fill-ink/95" />
      {WINDOWS.map(([wx, w]) => (
        <rect key={wx} x={wx} y={TOP + 12} width={w} height="17" rx="2.5" className="fill-nav" />
      ))}
      <rect y={TOP + 36} width={CAR} height="5" className="fill-accent" />
      {DOORS.map((dx) => (
        <Door key={dx} x={dx} />
      ))}
      <Bogie x={16} />
      <Bogie x={CAR - 52} />
    </g>
  )
}

function Bogie({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${FLOOR})`}>
      <rect width="36" height="5" rx="1.5" className="fill-black/45" />
      <circle cx="8" cy="5" r="3.5" className="fill-black/60" />
      <circle cx="28" cy="5" r="3.5" className="fill-black/60" />
    </g>
  )
}

/** The leading car with a sloped cab, windscreen and headlight. */
function LeadCar({ x }: { x: number }) {
  const nose = CAR + 30
  return (
    <g transform={`translate(${x} 0)`}>
      <rect y={TOP - 4} x="10" width={CAR - 30} height="5" rx="2" className="fill-ink/40" />
      <path
        d={`M5 ${TOP} H${CAR - 6} C${CAR + 14} ${TOP} ${nose - 4} ${TOP + 22} ${nose} ${TOP + 40} V${FLOOR - 4} Q${nose} ${FLOOR} ${nose - 4} ${FLOOR} H5 Q0 ${FLOOR} 0 ${FLOOR - 5} V${TOP + 5} Q0 ${TOP} 5 ${TOP} Z`}
        className="fill-ink/95"
      />
      {WINDOWS.slice(0, 2).map(([wx, w]) => (
        <rect key={wx} x={wx} y={TOP + 12} width={w} height="17" rx="2.5" className="fill-nav" />
      ))}
      <path
        d={`M${CAR - 22} ${TOP + 8} H${CAR - 2} C${CAR + 10} ${TOP + 10} ${nose - 12} ${TOP + 22} ${nose - 6} ${TOP + 32} H${CAR - 22} Z`}
        className="fill-nav"
      />
      <rect y={TOP + 36} width={nose - 1} height="5" className="fill-accent" />
      {DOORS.map((dx) => (
        <Door key={dx} x={dx} />
      ))}
      <circle cx={nose - 6} cy={FLOOR - 12} r="3.5" className="fill-accent" />
      <path d={`M${nose - 4} ${FLOOR - 15} L${nose + 120} ${FLOOR - 30} V${FLOOR + 2} Z`} className="fill-accent/10" />
      <Bogie x={16} />
      <Bogie x={CAR - 40} />
    </g>
  )
}

/** Chennai skyline in silhouette, with the Central station clock tower. */
function Skyline() {
  const blocks: [number, number, number][] = [
    [20, 118, 46],
    [74, 96, 34],
    [116, 128, 52],
    [176, 80, 26],
    [210, 110, 60],
    [282, 132, 40],
    [330, 102, 30],
    [372, 124, 54],
    [436, 92, 22],
    [470, 136, 44],
    [640, 112, 40],
    [688, 94, 30],
    [726, 126, 64],
  ]
  return (
    <g className="fill-white/[0.06]">
      {blocks.map(([x, y, w]) => (
        <rect key={x} x={x} y={y} width={w} height={172 - y} />
      ))}
      {/* Chennai Central: twin wings, clock tower and spire */}
      <rect x="524" y="120" width="100" height="52" />
      <rect x="518" y="100" width="14" height="72" />
      <rect x="616" y="100" width="14" height="72" />
      <rect x="560" y="58" width="28" height="114" />
      <path d="M556 58 L574 30 L592 58 Z" />
      <circle cx="574" cy="76" r="7" className="fill-nav" />
    </g>
  )
}

/** Elevated station the train halts at: canopy, columns and a hanging name board. */
function Station() {
  const posts = [70, 230, 390]
  return (
    <g>
      {posts.map((x) => (
        <rect key={x} x={x - 3} y="88" width="6" height="84" className="fill-white/[0.09]" />
      ))}
      <path d="M20 84 H520 L508 92 H32 Z" className="fill-white/[0.14]" />
      <rect x="20" y="82" width="500" height="2" className="fill-accent/70" />
      <g transform="translate(400 62)">
        <rect x="-30" y="14" width="2" height="6" className="fill-white/30" />
        <rect x="28" y="14" width="2" height="6" className="fill-white/30" />
        <rect x="-44" width="98" height="14" rx="1.5" className="fill-primary-subtle" />
        <rect x="-44" width="3" height="14" className="fill-accent" />
        <text
          x="6"
          y="10"
          textAnchor="middle"
          className="fill-ink font-sans text-[0.4375rem] font-semibold tracking-[0.08em]"
        >
          CHENNAI METRO RAIL
        </text>
      </g>
    </g>
  )
}

/** A CMRL train that pulls into the station, waits, and leaves, on a loop. Decorative; hidden from assistive tech. */
export function MetroScene({ className = '' }: { className?: string }) {
  const piers = [60, 260, 460, 660]
  return (
    <svg viewBox="0 0 800 240" preserveAspectRatio="xMidYMax slice" aria-hidden className={className}>
      <Skyline />
      <Station />

      {/* Viaduct: parapet, deck and piers */}
      {piers.map((x) => (
        <g key={x} className="fill-white/[0.08]">
          <path d={`M${x - 26} 190 H${x + 26} L${x + 14} 204 H${x - 14} Z`} />
          <rect x={x - 12} y="204" width="24" height="36" />
        </g>
      ))}
      <rect x="0" y="176" width="800" height="14" className="fill-white/[0.12]" />
      <rect x="0" y="170" width="800" height="3" className="fill-white/25" />

      <g className="odms-train-run">
        <Car x={-CAR * 2 - GAP * 2 + 40} />
        <Car x={-CAR - GAP + 40} />
        <Car x={40} />
        <LeadCar x={40 + CAR + GAP} />
      </g>
    </svg>
  )
}
