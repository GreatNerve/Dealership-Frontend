import type { ColumnDef } from '@tanstack/react-table'
import type { Vehicle } from '@/lib/types'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'

export const vehicleColumns: ColumnDef<Vehicle, unknown>[] = [
  {
    accessorKey: 'registrationNumber',
    meta: { title: 'Plate' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plate" />
    ),
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.registrationNumber}</span>
    ),
  },
  {
    accessorKey: 'make',
    meta: { title: 'Make' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Make" />
    ),
  },
  {
    accessorKey: 'model',
    meta: { title: 'Model' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
  },
  {
    accessorKey: 'year',
    meta: { title: 'Year' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Year" />
    ),
    cell: ({ row }) => <span className="tabular-nums">{row.original.year}</span>,
  },
]
