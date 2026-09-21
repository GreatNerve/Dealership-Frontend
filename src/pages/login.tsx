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

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      await login(email, password)
      toast.success('Welcome back')
      navigate('/appointments', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthFormShell title="Sign in">
      <form onSubmit={onSubmit}>
        <FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={formPlaceholders.email}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={formPlaceholders.passwordSignIn}
              required
            />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link
              to="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Create an account
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
