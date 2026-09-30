import { CircleAlert, Eye, EyeOff, LoaderCircle, LogIn, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn, type SignInResult } from '@/auth/authStore'
import { getCaptcha, type CaptchaChallenge } from '@/auth/captcha'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox, Input, Label, Select } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { MOCK_ACCOUNTS } from '@/constants/mock'
import { SHIFTS, SHIFT_ORDER } from '@/modules/station-diary/constants'
import { formatStamp } from '@/modules/station-diary/utils'
import type { ShiftCode } from '@/types'

const FIELD = 'h-11 w-full text-body-lg'
const ERROR = 'text-caption text-danger'

type Field = 'employeeId' | 'password' | 'shift' | 'captcha'

function failureMessage(result: Exclude<SignInResult, { ok: true }>): string {
  if (result.reason === 'captcha') return 'The characters don’t match the picture. Type the new ones shown.'
  if (result.reason === 'locked') {
    return `Too many failed attempts. Try again after ${formatStamp(result.lockedUntil)}, or ask your Station Supervisor to reset your password.`
  }
  return `Employee ID or password is incorrect. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} left before sign-in is locked for 5 minutes.`
}

export default function LoginPage() {
  const ids = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [shiftCode, setShiftCode] = useState<ShiftCode | ''>('')
  const [captchaText, setCaptchaText] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const employeeIdRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const captchaRef = useRef<HTMLInputElement>(null)

  const refreshCaptcha = useCallback(async (previousId?: string) => {
    setCaptchaText('')
    setCaptcha(await getCaptcha(previousId))
  }, [])

  useEffect(() => {
    let live = true
    void getCaptcha().then((first) => live && setCaptcha(first))
    return () => {
      live = false
    }
  }, [])

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState('CapsLock'))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || !captcha) return
    const missing: Partial<Record<Field, string>> = {}
    if (!employeeId.trim()) missing.employeeId = 'Enter your employee ID.'
    if (!password) missing.password = 'Enter your password.'
    if (!shiftCode) missing.shift = 'Select the shift you are working.'
    if (!captchaText.trim()) missing.captcha = 'Type the characters in the picture.'
    setFieldErrors(missing)
    setError('')
    const first = (['employeeId', 'password', 'shift', 'captcha'] as const).find((f) => missing[f])
    if (first) {
      const focusMap: Partial<Record<Field, RefObject<HTMLElement | null>>> = {
        employeeId: employeeIdRef,
        password: passwordRef,
        captcha: captchaRef,
      }
      focusMap[first]?.current?.focus()
      return
    }

    setBusy(true)
    const result = await signIn({ employeeId, password, shiftCode: shiftCode as ShiftCode, captchaId: captcha.id, captcha: captchaText, remember })
    if (result.ok) {
      navigate(from, { replace: true })
      return
    }
    setBusy(false)
    setError(failureMessage(result))
    // Every failed try uses up the captcha; show a fresh one.
    void refreshCaptcha(captcha.id)
    if (result.reason === 'captcha') captchaRef.current?.focus()
    else if (result.reason === 'credentials') {
      setPassword('')
      passwordRef.current?.focus()
    }
  }

  const describedBy = (field: Field, extra?: string) =>
    [fieldErrors[field] ? `${ids}-${field}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined

  return (
    <AuthLayout title="Sign in">
      <Card className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h1 className="text-title-lg text-ink">Sign in</h1>
          <p className="mt-1 text-secondary text-ink-muted">Use your CMRL employee ID and password.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2.5 text-secondary text-danger"
          >
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-employeeId`}>Employee ID</Label>
            <Input
              ref={employeeIdRef}
              id={`${ids}-employeeId`}
              name="username"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus
              placeholder="e.g. EMP-20417"
              value={employeeId}
              aria-invalid={fieldErrors.employeeId ? true : undefined}
              aria-describedby={describedBy('employeeId')}
              onChange={(e) => setEmployeeId(e.target.value)}
              className={FIELD}
            />
            {fieldErrors.employeeId && (
              <p id={`${ids}-employeeId-error`} className={ERROR}>
                {fieldErrors.employeeId}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={`${ids}-password`}>Password</Label>
              <Link to="/forgot-password" className="text-secondary font-medium text-primary-ink hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                ref={passwordRef}
                id={`${ids}-password`}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={describedBy('password', capsLock ? `${ids}-caps` : undefined)}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onKey}
                onKeyDown={onKey}
                className={`${FIELD} pr-12`}
              />
              <span className="absolute inset-y-0 right-0 flex items-center">
                <IconButton
                  icon={showPassword ? EyeOff : Eye}
                  label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tooltip={false}
                  onClick={() => setShowPassword((v) => !v)}
                />
              </span>
            </div>
            {capsLock && (
              <p id={`${ids}-caps`} className="text-caption font-medium text-warning">
                Caps Lock is on.
              </p>
            )}
            {fieldErrors.password && (
              <p id={`${ids}-password-error`} className={ERROR}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-shift`}>Shift</Label>
            <Select
              id={`${ids}-shift`}
              value={shiftCode}
              aria-invalid={fieldErrors.shift ? true : undefined}
              aria-describedby={fieldErrors.shift ? `${ids}-shift-error` : undefined}
              onChange={(e) => setShiftCode(e.target.value as ShiftCode | '')}
              className={FIELD}
            >
              <option value="" disabled>
                Select your shift
              </option>
              {SHIFT_ORDER.map((code) => {
                const s = SHIFTS[code]
                return (
                  <option key={code} value={code}>
                    {s.label} · {s.start}–{s.end}
                  </option>
                )
              })}
            </Select>
            {fieldErrors.shift && (
              <p id={`${ids}-shift-error`} className={ERROR}>
                {fieldErrors.shift}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-captcha`}>Enter the characters shown</Label>
            <div className="flex items-center gap-2">
              <div className="flex h-11 w-[8rem] shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-strong bg-paper sm:w-[9.5rem]">
                {captcha ? (
                  <img src={captcha.image} alt="Security check: characters to type" className="h-full w-full" />
                ) : (
                  <LoaderCircle aria-hidden className="size-4 animate-spin text-ink-muted" />
                )}
              </div>
              <IconButton
                icon={RefreshCw}
                label="Show different characters"
                tooltip="top"
                onClick={() => {
                  void refreshCaptcha(captcha?.id)
                  captchaRef.current?.focus()
                }}
              />
              <Input
                ref={captchaRef}
                id={`${ids}-captcha`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={8}
                value={captchaText}
                aria-invalid={fieldErrors.captcha ? true : undefined}
                aria-describedby={describedBy('captcha')}
                onChange={(e) => setCaptchaText(e.target.value)}
                className={`${FIELD} min-w-0 flex-1 font-mono tracking-widest`}
              />
            </div>
            {fieldErrors.captcha && (
              <p id={`${ids}-captcha-error`} className={ERROR}>
                {fieldErrors.captcha}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-secondary text-ink">
            <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me signed in on this device
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={busy ? LoaderCircle : LogIn}
            disabled={busy || !captcha}
            className={`w-full ${busy ? '[&>svg]:animate-spin' : ''}`}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <div className="rounded-lg border border-dashed border-border-strong bg-canvas px-3 py-2.5 text-caption text-ink-muted">
            <p className="font-semibold text-ink-secondary">Demo accounts (development only)</p>
            {MOCK_ACCOUNTS.map((a) => (
              <p key={a.user.employeeId}>
                <span className="font-mono text-ink">{a.user.employeeId}</span> · {a.user.role} · password{' '}
                <span className="font-mono text-ink">{a.password}</span>
              </p>
            ))}
          </div>
        )}
      </Card>
    </AuthLayout>
  )
}
