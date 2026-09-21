import { Link, useLocation } from 'react-router-dom'
import { cn } from 'cn'
import { AppLogo } from '@/components/brand/app-logo'

export function AuthNavbar() {
  const { pathname } = useLocation()
  const onLogin = pathname.startsWith('/login')
  const onRegister = pathname.startsWith('/register')

  return (
    <header
      className="sticky top-0 z-20 border-b border-border/70 bg-background/75 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/login"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppLogo className="size-9" />
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            Service Desk
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2 text-sm" aria-label="Authentication">
          <Link
            to="/login"
            className={cn(
              'rounded-lg px-3.5 py-2 font-medium transition-colors',
              onLogin
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={cn(
              'rounded-lg border px-3.5 py-2 font-medium transition-colors',
              onRegister
                ? 'border-foreground/20 bg-card text-foreground shadow-sm'
                : 'border-transparent text-muted-foreground hover:border-border hover:bg-card/80 hover:text-foreground',
            )}
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  )
}
