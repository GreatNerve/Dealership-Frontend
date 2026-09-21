import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMe } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { customerContactEmail, customerDisplayName } from '@/lib/labels'
import { formatTimezoneLabel } from '@/lib/format-datetime'
import { UserAvatar } from '@/components/user-avatar'
import { DetailField, DetailPanel } from '@/components/layout/detail-field'
import { PageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

export function ProfilePage() {
  const { user: sessionUser, logout, reloadUser } = useAuth()
  const navigate = useNavigate()
  const staff = sessionUser?.role === 'DEALERSHIP_STAFF'

  const me = useQuery({
    queryKey: ['me', sessionUser?.id],
    enabled: !!sessionUser,
    queryFn: fetchMe,
  })

  const user = me.data ?? sessionUser

  if (!sessionUser) {
    return null
  }

  if (me.isLoading && !user) {
    return (
      <PageShell title="Profile" description="Loading your account…">
        <Skeleton className="h-56 w-full max-w-2xl rounded-xl" />
      </PageShell>
    )
  }

  if (me.isError) {
    return (
      <PageShell title="Profile" description="Could not load your account.">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTitle>Profile unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span>Try again or sign out and back in.</span>
            <Button type="button" size="sm" variant="outline" onClick={() => me.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.name?.trim() || customerDisplayName(user.customer) || user.email
  const customerEmail = customerContactEmail(user.customer) ?? user.email

  return (
    <PageShell
      title="Profile"
      description="Your signed-in account and linked records."
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={me.isFetching}
          onClick={() => {
            void reloadUser()
            void me.refetch()
          }}
        >
          {me.isFetching ? <Spinner data-icon="inline-start" className="size-3" /> : null}
          Refresh
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <section className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-5 shadow-sm">
          <UserAvatar seed={user.id} size={64} className="size-16 shrink-0" alt={displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-foreground">{displayName}</p>
            <p className="mt-0.5 break-all text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-2 font-normal">
              {staff ? 'Dealership staff' : 'Customer'}
            </Badge>
          </div>
        </section>

        <DetailPanel title="Account">
          <DetailField label="Email">
            <span className="break-all">{user.email}</span>
          </DetailField>
          <DetailField label="Display name">
            {user.name?.trim() ? user.name : <span className="text-muted-foreground">Not set</span>}
          </DetailField>
          <DetailField label="Role">
            <Badge variant="outline">{staff ? 'Dealership staff' : 'Customer'}</Badge>
          </DetailField>
        </DetailPanel>

        {!staff && user.customerId && (
          <DetailPanel title="Customer record">
            <DetailField label="Contact on file">
              <span className="break-all">{user.customer?.contact ?? customerEmail}</span>
            </DetailField>
            <DetailField label="Name on file">{customerDisplayName(user.customer)}</DetailField>
            <DetailField label="Vehicles">
              <Link
                to="/vehicles"
                className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/90"
              >
                My vehicles
              </Link>
            </DetailField>
          </DetailPanel>
        )}

        {staff && (
          <DetailPanel title="Dealership">
            {user.homeDealership ? (
              <>
                <DetailField label="Home shop">{user.homeDealership.name}</DetailField>
                <DetailField label="Address">
                  <span className="break-all text-muted-foreground">
                    {user.homeDealership.address}
                  </span>
                </DetailField>
                <DetailField label="Timezone">
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatTimezoneLabel(user.homeDealership.timezone)}
                  </Badge>
                </DetailField>
                <DetailField label="Details">
                  <Link
                    to="/dealerships"
                    className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/90"
                  >
                    My dealership page
                  </Link>
                </DetailField>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No home dealership linked.{' '}
                <Link to="/dealerships" className="underline underline-offset-2">
                  Set up your shop
                </Link>
                .
              </p>
            )}
          </DetailPanel>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
