import type { ColumnDef } from '@tanstack/react-table'
import type { Customer } from '@/lib/types'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { customerDisplayName } from '@/lib/labels'

export function customerColumns(): ColumnDef<Customer, unknown>[] {
  return [
    {
      accessorKey: 'name',
      meta: { title: 'Customer' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium">{customerDisplayName(row.original)}</span>
          <span className="truncate text-xs text-muted-foreground">{row.original.contact}</span>
        </div>
      ),
    },
    {
      id: 'vehicleCount',
      meta: { title: 'Vehicles' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vehicles" />
      ),
      cell: ({ row }) => {
        const n = row.original.vehicles.length
        if (n === 0) {
          return <span className="text-sm text-muted-foreground">None</span>
        }
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {n} vehicle{n === 1 ? '' : 's'}
          </span>
        )
      },
    },
  ]
}
