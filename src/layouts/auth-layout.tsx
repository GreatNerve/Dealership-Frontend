import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthBackground } from '@/components/auth/auth-background'
import { authHeroVariant } from '@/components/auth/auth-hero-copy'
import { AuthNavbar } from '@/components/auth/auth-navbar'
import { AuthPageIntro } from '@/components/auth/auth-page-intro'
import { useAuth } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'
import { cn } from 'cn'

export function AuthLayout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const variant = authHeroVariant(pathname)
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/appointments" replace />
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <AuthBackground variant={variant} />

      <AuthNavbar />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
        <main className="flex flex-1 flex-col items-center justify-center pb-10 pt-6 sm:pb-14 sm:pt-8">
          <div
            className={cn(
              'w-full',
              variant === 'dealership' ? 'max-w-lg' : 'max-w-md',
            )}
          >
            <AuthPageIntro variant={variant} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
