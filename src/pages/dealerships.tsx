import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { AddDealershipDialog } from '@/components/add-dealership-dialog'
import { DetailField, DetailPanel } from '@/components/layout/detail-field'
import { PageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Dealership } from '@/lib/types'
import { DealershipSchedulePanel } from '@/components/dealership-schedule-panel'

export function DealershipsPage() {
  const { user } = useAuth()
  const [addOpen, setAddOpen] = useState(false)

  if (user?.role !== 'DEALERSHIP_STAFF') {
    return <Navigate to="/appointments" replace />
  }

  const homeId = user.homeDealershipId

  const homeQuery = useQuery({
    queryKey: ['dealership', homeId],
    enabled: !!homeId,
    queryFn: () => apiGet<Dealership>(`/api/v1/dealerships/${homeId}`),
  })

  const dealership = homeQuery.data ?? user.homeDealership

  return (
    <PageShell
      title="My dealership"
      description="Your home shop profile. Other dealerships are not shown in this app."
    >
      {!homeId && (
        <Alert className="mb-4 max-w-2xl">
          <AlertTitle>No home dealership linked</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Create your shop here, or register a new dealership account with shop details included.
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              Add dealership
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {homeId && homeQuery.isLoading && (
        <Skeleton className="h-48 w-full max-w-2xl rounded-xl" />
      )}

      {homeId && homeQuery.isError && !dealership && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTitle>Could not load dealership</AlertTitle>
          <AlertDescription>Try signing out and back in.</AlertDescription>
        </Alert>
      )}

      {dealership && (
        <>
          <DetailPanel
            title={dealership.name}
            description="Shop tied to your staff login."
            className="max-w-4xl"
          >
            <DetailField label="Name">{dealership.name}</DetailField>
            <DetailField label="Address">
              <span className="text-muted-foreground">{dealership.address}</span>
            </DetailField>
            <DetailField label="Timezone">
              <Badge variant="outline" className="font-mono text-xs">
                {dealership.timezone}
              </Badge>
            </DetailField>
          </DetailPanel>
          <DealershipSchedulePanel dealershipId={dealership.id} />
        </>
      )}

      {!homeId && <AddDealershipDialog open={addOpen} onOpenChange={setAddOpen} />}
    </PageShell>
  )
}
