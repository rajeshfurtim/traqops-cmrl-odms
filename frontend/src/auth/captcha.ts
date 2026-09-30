// Mock captcha "server". The page only ever gets an image and an id; the answer stays here and is checked at sign-in,
// the way a real backend will do it. Replace `getCaptcha` / `verifyCaptcha` with API calls later.

export interface CaptchaChallenge {
  id: string
  /** PNG data URL. */
  image: string
}

// No 0/O, 1/l/I: they are too easy to misread on a station screen.
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const LENGTH = 5
const TTL_MS = 5 * 60_000

const answers = new Map<string, { text: string; expires: number }>()

const random = (max: number) => Math.floor(Math.random() * max)

function draw(text: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = 150
  canvas.height = 48
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#f4f6fa'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(18, 48, 95, ${0.15 + Math.random() * 0.2})`
    ctx.lineWidth = 1 + Math.random()
    ctx.beginPath()
    ctx.moveTo(random(canvas.width), random(canvas.height))
    ctx.bezierCurveTo(random(150), random(48), random(150), random(48), random(canvas.width), random(canvas.height))
    ctx.stroke()
  }
  ctx.textBaseline = 'middle'
  ;[...text].forEach((char, i) => {
    ctx.save()
    ctx.translate(18 + i * 27, 24 + (Math.random() * 8 - 4))
    ctx.rotate((Math.random() - 0.5) * 0.6)
    ctx.font = `700 ${24 + random(5)}px ui-monospace, Menlo, monospace`
    ctx.fillStyle = i % 2 ? '#12305f' : '#1f2937'
    ctx.fillText(char, -8, 0)
    ctx.restore()
  })
  return canvas.toDataURL('image/png')
}

export async function getCaptcha(previousId?: string): Promise<CaptchaChallenge> {
  if (previousId) answers.delete(previousId)
  const text = Array.from({ length: LENGTH }, () => CHARS[random(CHARS.length)]).join('')
  const id = crypto.randomUUID()
  answers.set(id, { text, expires: Date.now() + TTL_MS })
  return { id, image: draw(text) }
}

/** One try per challenge: the answer is removed whether it matched or not. Case doesn't matter. */
export function verifyCaptcha(id: string, answer: string): boolean {
  const entry = answers.get(id)
  answers.delete(id)
  return Boolean(entry && entry.expires > Date.now() && entry.text.toLowerCase() === answer.trim().toLowerCase())
}
