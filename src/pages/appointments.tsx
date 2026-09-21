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
import {
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PageShell,
} from '@/components/layout/page-shell'
import { ServerDataTable } from '@/components/table'
import { AppointmentMobileCard } from '@/components/table/appointment-mobile-card'
import { appointmentColumns } from '@/components/table/columns/appointment-columns'
import { Button } from '@/components/ui/button'

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const canCreate = !staff && !!user?.customerId
  const [createOpen, setCreateOpen] = useState(false)

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
      description={
        staff
          ? 'Service visits at your home dealership — open a row to complete, reschedule, or cancel.'
          : 'Book a new visit or open a row to view, reschedule, or cancel.'
      }
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
      <ServerDataTable
        queryKey="appointments"
        path="/api/v1/appointments"
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
