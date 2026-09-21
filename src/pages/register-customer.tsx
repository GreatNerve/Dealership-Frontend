import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { AuthFormShell } from '@/components/auth/auth-form-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { formPlaceholders } from '@/lib/form-placeholders'

export function RegisterCustomerPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await register({
        email,
        name: name.trim() || undefined,
        password,
        role: 'CUSTOMER',
      })
      toast.success('Account created')
      navigate('/appointments', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthFormShell title="Your details">
      <form onSubmit={onSubmit}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="reg-name">Your name</FieldLabel>
            <Input
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={formPlaceholders.customerName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="reg-email">Email</FieldLabel>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={formPlaceholders.email}
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
              placeholder={formPlaceholders.passwordNew}
              required
            />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Create customer account
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
