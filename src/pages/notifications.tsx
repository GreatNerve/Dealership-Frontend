import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FilterSelect } from '@/components/filter-select'
import { InstantDateRange } from '@/components/instant-date-range'
import { PageShell } from '@/components/layout/page-shell'
import { ServerDataTable } from '@/components/table'
import { NotificationMobileCard } from '@/components/table/notification-mobile-card'
import { notificationColumns } from '@/components/table/columns/notification-columns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth'
import { optionalZonedRange } from '@/lib/format-datetime'
import { prefetchNotificationDetail } from '@/lib/prefetch'
import type { Notification } from '@/lib/types'

const GENERATION_ITEMS = [
  { value: 'ALL', label: 'All' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'MANUAL', label: 'Manual' },
]

const STATUS_ITEMS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SENT', label: 'Sent' },
  { value: 'RETRY_SCHEDULED', label: 'Retry scheduled' },
  { value: 'DEAD_LETTER', label: 'Dead letter' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const EVENT_ITEMS = [
  { value: 'ALL', label: 'Any' },
  { value: 'OPENED', label: 'Opened' },
  { value: 'SOFT_BOUNCE', label: 'Soft bounce' },
  { value: 'HARD_BOUNCE', label: 'Hard bounce' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CLICKED', label: 'Clicked' },
]

export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const tz = user?.homeDealership?.timezone ?? 'UTC'
  const [fromYmd, setFromYmd] = useState('')
  const [toYmd, setToYmd] = useState('')
  const [generation, setGeneration] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [hasEvent, setHasEvent] = useState('ALL')

  const extraParams = useMemo(
    () => ({
      ...optionalZonedRange(fromYmd, toYmd, tz),
      generation: generation === 'ALL' ? undefined : generation,
      status: status === 'ALL' ? undefined : status,
      hasEvent: hasEvent === 'ALL' ? undefined : hasEvent,
    }),
    [fromYmd, toYmd, tz, generation, status, hasEvent],
  )

  if (!staff) return <Navigate to="/appointments" replace />

  if (!user?.homeDealershipId) {
    return (
      <PageShell title="Notifications">
        <Alert className="max-w-2xl">
          <AlertTitle>No home dealership</AlertTitle>
          <AlertDescription>Set up your shop first.</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell title="Notifications">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <InstantDateRange
          fromYmd={fromYmd}
          toYmd={toYmd}
          onFromYmd={setFromYmd}
          onToYmd={setToYmd}
          timeZone={tz}
        />
        <FilterSelect
          id="n-generation"
          label="Kind"
          value={generation}
          onValueChange={setGeneration}
          items={GENERATION_ITEMS}
        />
        <FilterSelect
          id="n-status"
          label="Status"
          value={status}
          onValueChange={setStatus}
          items={STATUS_ITEMS}
        />
        <FilterSelect
          id="n-event"
          label="Event"
          value={hasEvent}
          onValueChange={setHasEvent}
          items={EVENT_ITEMS}
        />
      </div>
      <ServerDataTable
        queryKey="notifications"
        path="/api/v1/notifications"
        extraParams={extraParams}
        columns={notificationColumns(tz)}
        searchPlaceholder="Search customer or plate"
        emptyMessage="No notifications in this range."
        initialPageSize={10}
        onRowClick={(row) => navigate(`/notifications/${row.id}`)}
        onRowHover={(row: Notification) => {
          if (!user?.id) return
          prefetchNotificationDetail(qc, user.id, row.id)
        }}
        getRowId={(row) => row.id}
        renderMobileCard={(row) => (
          <NotificationMobileCard notification={row} timeZone={tz} />
        )}
      />
    </PageShell>
  )
}
