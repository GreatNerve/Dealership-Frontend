import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AddVehicleDialog } from '@/components/add-vehicle-dialog'
import {
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PageShell,
} from '@/components/layout/page-shell'
import { ServerDataTable } from '@/components/table'
import { vehicleColumns } from '@/components/table/columns/vehicle-columns'
import { VehicleMobileCard } from '@/components/table/vehicle-mobile-card'
import { Button } from '@/components/ui/button'

export function VehiclesPage() {
  const { user } = useAuth()
  const [addOpen, setAddOpen] = useState(false)

  if (user?.role === 'DEALERSHIP_STAFF') {
    return <Navigate to="/appointments" replace />
  }

  return (
    <PageShell
      title="My vehicles"
      description="Vehicles registered to your customer account."
      actions={
        <Button
          type="button"
          className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
          onClick={() => setAddOpen(true)}
        >
          <Plus data-icon="inline-start" />
          Add vehicle
        </Button>
      }
    >
      <ServerDataTable
        queryKey="vehicles"
        path="/api/v1/vehicles"
        columns={vehicleColumns}
        searchPlaceholder="Search plate, make, or model"
        emptyMessage="No vehicles found."
        initialPageSize={10}
        getRowId={(row) => row.id}
        renderMobileCard={(row) => <VehicleMobileCard vehicle={row} />}
      />

      <AddVehicleDialog open={addOpen} onOpenChange={setAddOpen} />
    </PageShell>
  )
}
