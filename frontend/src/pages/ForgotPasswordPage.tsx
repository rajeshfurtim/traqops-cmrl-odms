import { ArrowLeft, CircleCheck, LoaderCircle, Send } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '@/auth/authStore'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Field'

const BACK = 'inline-flex items-center gap-1.5 self-start text-secondary font-medium text-primary-ink hover:underline'

export default function ForgotPasswordPage() {
  const ids = useId()
  const [employeeId, setEmployeeId] = useState('')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (!employeeId.trim()) {
      setProblem('Enter your employee ID.')
      return
    }
    setProblem('')
    setBusy(true)
    await requestPasswordReset(employeeId)
    setBusy(false)
    setSentTo(employeeId.trim().toUpperCase())
  }

  return (
    <AuthLayout title="Reset password">
      <Card className="flex flex-col gap-5 p-6 sm:p-8">
        <Link to="/login" className={BACK}>
          <ArrowLeft aria-hidden className="size-4" />
          Back to sign in
        </Link>

        {sentTo ? (
          <div role="status" className="flex flex-col gap-3">
            <CircleCheck aria-hidden className="size-8 text-success" />
            <h1 className="text-title-lg text-ink">Check your email and phone</h1>
            <p className="text-body text-ink-secondary">
              If <span className="font-mono font-semibold text-ink">{sentTo}</span> is registered, a link to set a new
              password has been sent to the email and mobile number on record. The link works for 30 minutes.
            </p>
            <p className="text-secondary text-ink-muted">
              Nothing arrived? Your contact details may be out of date. Ask your Station Supervisor or the ODMS
              administrator to reset your password.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-title-lg text-ink">Reset your password</h1>
              <p className="mt-1 text-secondary text-ink-muted">
                Enter your employee ID. We’ll send a reset link to the email and mobile number on record.
              </p>
            </div>
            <form noValidate onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${ids}-id`}>Employee ID</Label>
                <Input
                  id={`${ids}-id`}
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoFocus
                  placeholder="e.g. EMP-20417"
                  value={employeeId}
                  aria-invalid={problem ? true : undefined}
                  aria-describedby={problem ? `${ids}-problem` : undefined}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="h-11 w-full text-body-lg"
                />
                {problem && (
                  <p id={`${ids}-problem`} className="text-caption text-danger">
                    {problem}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={busy ? LoaderCircle : Send}
                disabled={busy}
                className={`w-full ${busy ? '[&>svg]:animate-spin' : ''}`}
              >
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}
      </Card>
    </AuthLayout>
  )
}
