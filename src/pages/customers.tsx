import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AddCustomerDialog } from '@/components/add-customer-dialog'
import {
  PAGE_HEADER_PRIMARY_BUTTON_CLASS,
  PageShell,
} from '@/components/layout/page-shell'
import { ServerDataTable } from '@/components/table'
import { customerColumns } from '@/components/table/columns/customer-columns'
import { CustomerMobileCard } from '@/components/table/customer-mobile-card'
import { Button } from '@/components/ui/button'

export function CustomersPage() {
  const { user } = useAuth()
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  if (user?.role !== 'DEALERSHIP_STAFF') {
    return <Navigate to="/appointments" replace />
  }

  return (
    <PageShell
      title="Customers"
      description="Staff-only directory at your home dealership. Customers add their own vehicles under My vehicles before booking."
      actions={
        <Button
          type="button"
          className={PAGE_HEADER_PRIMARY_BUTTON_CLASS}
          onClick={() => setAddCustomerOpen(true)}
        >
          <Plus data-icon="inline-start" />
          Add customer
        </Button>
      }
    >
      <ServerDataTable
        queryKey="customers"
        path="/api/v1/customers"
        columns={customerColumns()}
        searchPlaceholder="Search name, email, or plate"
        emptyMessage="No customers found."
        initialPageSize={10}
        getRowId={(row) => row.id}
        renderMobileCard={(row) => <CustomerMobileCard customer={row} />}
      />

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
    </PageShell>
  )
}
