import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Dealership, Page, Vehicle } from '@/lib/types'
import {
  BookAppointmentDialog,
  buildCustomerForBooking,
} from '@/components/book-appointment-dialog'
import { FilterSelect } from '@/components/filter-select'
import { InstantDateRange } from '@/components/instant-date-range'
import {
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PageShell,
} from '@/components/layout/page-shell'
import { ServerDataTable } from '@/components/table'
import { AppointmentMobileCard } from '@/components/table/appointment-mobile-card'
import { appointmentColumns } from '@/components/table/columns/appointment-columns'
import { Button } from '@/components/ui/button'
import { optionalZonedRange } from '@/lib/format-datetime'

const STATUS_ITEMS = [
  { value: 'ALL', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No show' },
]

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const canCreate = !staff && !!user?.customerId
  const [createOpen, setCreateOpen] = useState(false)
  const tz = user?.homeDealership?.timezone ?? 'UTC'
  const [fromYmd, setFromYmd] = useState('')
  const [toYmd, setToYmd] = useState('')
  const [status, setStatus] = useState('ALL')
  const extraParams = useMemo(
    () => ({
      ...optionalZonedRange(fromYmd, toYmd, tz),
      status: staff && status !== 'ALL' ? status : undefined,
    }),
    [fromYmd, toYmd, tz, status, staff],
  )

  const dealerships = useQuery({
    queryKey: ['dealerships'],
    queryFn: () => apiGet<Page<Dealership>>('/api/v1/dealerships', { size: 100 }),
    enabled: createOpen && canCreate,
  })

  const vehicles = useQuery({
    queryKey: ['vehicles', 'book'],
    queryFn: () => apiGet<Page<Vehicle>>('/api/v1/vehicles', { size: 100 }),
    enabled: createOpen && canCreate,
  })

  const customerForBook = useMemo(() => {
    if (!canCreate || !user?.customerId) return null
    return buildCustomerForBooking(
      user.customerId,
      user.name,
      vehicles.data?.items ?? [],
    )
  }, [canCreate, user, vehicles.data])

  const dealerList = dealerships.data?.items ?? []

  return (
    <PageShell
      title="Appointments"
      description={staff ? 'Home dealership visits.' : 'Your service visits.'}
      actions={
        canCreate ? (
          <Button
            type="button"
            className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
            onClick={() => setCreateOpen(true)}
          >
            <Plus data-icon="inline-start" />
            Create appointment
          </Button>
        ) : undefined
      }
    >
      {staff ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <InstantDateRange
            fromYmd={fromYmd}
            toYmd={toYmd}
            onFromYmd={setFromYmd}
            onToYmd={setToYmd}
            timeZone={tz}
          />
          <FilterSelect
            id="appt-status"
            label="Status"
            value={status}
            onValueChange={setStatus}
            items={STATUS_ITEMS}
          />
        </div>
      ) : null}
      <ServerDataTable
        queryKey="appointments"
        path="/api/v1/appointments"
        extraParams={extraParams}
        columns={appointmentColumns({ omitDealership: staff, omitCustomer: !staff })}
        searchPlaceholder={staff ? 'Search plate or customer' : 'Search plate'}
        emptyMessage="No appointments found."
        initialPageSize={10}
        onRowClick={(row) => navigate(`/appointments/${row.id}`)}
        getRowId={(row) => row.id}
        renderMobileCard={(row) => (
          <AppointmentMobileCard
            appointment={row}
            showDealership={!staff}
            showCustomer={staff}
          />
        )}
      />

      {createOpen && canCreate && customerForBook && (
        <BookAppointmentDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          dealerships={dealerList}
          defaultDealershipId={user?.homeDealershipId ?? null}
          customer={customerForBook}
        />
      )}
    </PageShell>
  )
}
