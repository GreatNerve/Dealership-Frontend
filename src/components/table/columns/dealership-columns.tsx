import type { ColumnDef } from '@tanstack/react-table'
import type { Dealership } from '@/lib/types'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { Badge } from '@/components/ui/badge'

export const dealershipColumns: ColumnDef<Dealership, unknown>[] = [
    {
      accessorKey: 'name',
      meta: { title: 'Name' },
      header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
      accessorKey: 'address',
      meta: { title: 'Address' },
      header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.address}</span>
    ),
  },
  {
      accessorKey: 'timezone',
      meta: { title: 'Timezone' },
      header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timezone" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.timezone}
      </Badge>
    ),
  },
]
