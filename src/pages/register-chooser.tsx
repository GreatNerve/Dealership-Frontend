import { Building2, Car, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthFormShell } from '@/components/auth/auth-form-shell'
import { cn } from 'cn'

const options = [
  {
    to: '/register/customer',
    icon: Car,
    title: 'I need service',
    description: 'Book appointments and manage your vehicles.',
  },
  {
    to: '/register/dealership',
    icon: Building2,
    title: 'I run a dealership',
    description: 'Set up your shop and staff login together.',
  },
] as const

export function RegisterChooserPage() {
  return (
    <AuthFormShell title="Choose your path">
      <ul className="flex flex-col gap-3">
        {options.map((opt) => (
          <li key={opt.to}>
            <Link
              to={opt.to}
              className={cn(
                'group flex items-start gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-colors',
                'hover:border-foreground/15 hover:bg-muted/40',
              )}
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-foreground ring-1 ring-foreground/10"
                aria-hidden
              >
                <opt.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  {opt.title}
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{opt.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
        >
          Sign in
        </Link>
      </p>
    </AuthFormShell>
  )
}
