import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError, apiPost } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { timezoneLabel } from '@/lib/schedule'
import type { Dealership } from '@/lib/types'
import { AuthFormShell } from '@/components/auth/auth-form-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function RegisterDealershipPage() {
  const { register, reloadUser } = useAuth()
  const navigate = useNavigate()
  const [dealershipName, setDealershipName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dealershipAddress, setDealershipAddress] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shopTz = timezoneLabel()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await register({
        email,
        password,
        role: 'DEALERSHIP_STAFF',
      })
      await apiPost<Dealership>('/api/v1/dealerships', {
        name: dealershipName.trim(),
        address: dealershipAddress.trim(),
        timezone: shopTz,
      })
      await reloadUser()
      toast.success('Dealership account ready')
      navigate('/appointments', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  const valid =
    dealershipName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    dealershipAddress.trim()

  return (
    <AuthFormShell title="Register your dealership">
      <form onSubmit={onSubmit}>
        <FieldGroup className="gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="dealer-name">Dealership name</FieldLabel>
            <Input
              id="dealer-name"
              value={dealershipName}
              onChange={(e) => setDealershipName(e.target.value)}
              placeholder="Great Nerve Service"
              autoComplete="organization"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="reg-email">Work email</FieldLabel>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="reg-password">Password</FieldLabel>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </Field>

          <Field>
            <FieldLabel htmlFor="dealer-address">Address</FieldLabel>
            <Input
              id="dealer-address"
              value={dealershipAddress}
              onChange={(e) => setDealershipAddress(e.target.value)}
              placeholder="Street, city, state, postal code"
              autoComplete="street-address"
              required
            />
          </Field>

          <p className="text-xs text-muted-foreground">
            Shop timezone is detected automatically ({shopTz}).
          </p>

          <Button type="submit" className="mt-1 w-full" disabled={pending || !valid}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Create dealership account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/register" className="underline underline-offset-4 hover:text-foreground">
              Back
            </Link>
            {' · '}
            <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
