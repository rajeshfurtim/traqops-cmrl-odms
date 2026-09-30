import { useSyncExternalStore } from 'react'
import { MOCK_ACCOUNTS } from '@/constants/mock'
import type { ShiftCode, Station, User } from '@/types'
import { verifyCaptcha } from './captcha'

// In-memory mock shaped like the future auth API. Only this file (and captcha.ts) change when the backend arrives;
// then the session will be an httpOnly cookie and nothing sensitive is kept in the browser.

export interface AuthSession {
  user: User
  station: Station
  shiftCode: ShiftCode
  signedInAt: string
}

const STORAGE_KEY = 'odms.session'
const MAX_ATTEMPTS = 5
const LOCK_MS = 5 * 60_000

/** Only the employee ID, shift and sign-in time are stored; never the password. */
interface StoredSession {
  employeeId: string
  shiftCode: ShiftCode
  signedInAt: string
}

const findAccount = (employeeId: string) =>
  MOCK_ACCOUNTS.find((a) => a.user.employeeId.toLowerCase() === employeeId.trim().toLowerCase())

const VALID_SHIFTS: ShiftCode[] = ['A', 'G', 'B', 'C']

function readStored(): AuthSession | null {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) continue
      const stored = JSON.parse(raw) as StoredSession
      // Old sessions (before shiftCode was added) lack this field — treat as expired.
      if (!VALID_SHIFTS.includes(stored.shiftCode)) {
        storage.removeItem(STORAGE_KEY)
        continue
      }
      const account = findAccount(stored.employeeId)
      if (account)
        return {
          user: account.user,
          station: account.station,
          shiftCode: stored.shiftCode,
          signedInAt: stored.signedInAt,
        }
    } catch {}
  }
  return null
}

function clearStored() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {}
  }
}

let session: AuthSession | null = readStored()
const failures = new Map<string, { count: number; lockedUntil?: number }>()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function commit(next: AuthSession | null) {
  session = next
  listeners.forEach((l) => l())
}

export function useAuth(): AuthSession | null {
  return useSyncExternalStore(subscribe, () => session)
}

/** For other mock stores that build their data around the signed-in session. */
export const getAuthSession = () => session
export const subscribeToAuth = subscribe

export interface SignInRequest {
  employeeId: string
  password: string
  shiftCode: ShiftCode
  captchaId: string
  captcha: string
  /** Keep the session after the browser closes. */
  remember: boolean
}

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: 'captcha' }
  | { ok: false; reason: 'credentials'; attemptsLeft: number }
  | { ok: false; reason: 'locked'; lockedUntil: string }

export async function signIn(request: SignInRequest): Promise<SignInResult> {
  await new Promise((r) => setTimeout(r, 450)) // network round trip
  const key = request.employeeId.trim().toLowerCase()
  const record = failures.get(key)
  if (record?.lockedUntil && record.lockedUntil > Date.now()) {
    return { ok: false, reason: 'locked', lockedUntil: new Date(record.lockedUntil).toISOString() }
  }
  if (!verifyCaptcha(request.captchaId, request.captcha)) return { ok: false, reason: 'captcha' }

  const account = findAccount(request.employeeId)
  if (!account || account.password !== request.password) {
    const count = (record?.lockedUntil ? 0 : (record?.count ?? 0)) + 1
    if (count >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCK_MS
      failures.set(key, { count, lockedUntil })
      return { ok: false, reason: 'locked', lockedUntil: new Date(lockedUntil).toISOString() }
    }
    failures.set(key, { count })
    return { ok: false, reason: 'credentials', attemptsLeft: MAX_ATTEMPTS - count }
  }

  failures.delete(key)
  const signedInAt = new Date().toISOString()
  clearStored()
  try {
    const stored: StoredSession = { employeeId: account.user.employeeId, shiftCode: request.shiftCode, signedInAt }
    ;(request.remember ? window.localStorage : window.sessionStorage).setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {}
  commit({ user: account.user, station: account.station, shiftCode: request.shiftCode, signedInAt })
  return { ok: true }
}

export function signOut() {
  clearStored()
  commit(null)
}

/** Mock: always "sent", so the page never reveals whether an employee ID exists. */
export async function requestPasswordReset(employeeId: string): Promise<void> {
  void employeeId
  await new Promise((r) => setTimeout(r, 450))
}
