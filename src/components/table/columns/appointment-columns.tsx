import type { ColumnDef } from '@tanstack/react-table'
import type { Appointment, AppointmentStatus } from '@/lib/types'
import { AppointmentStatusBadge } from '@/components/appointment-status-badge'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { RowLink } from '@/components/table/row-link'
import { formatAppointmentScheduled } from '@/lib/format-datetime'
import { customerDisplayName } from '@/lib/labels'

function normalizeStatus(status: string): AppointmentStatus {
  if (status === 'NO_SHOW_EXPIRED') return 'NO_SHOW'
  if (
    status === 'CONFIRMED' ||
    status === 'CANCELLED' ||
    status === 'COMPLETED' ||
    status === 'NO_SHOW'
  ) {
    return status
  }
  return 'CONFIRMED'
}

export function appointmentColumns(options?: {
  omitDealership?: boolean
}): ColumnDef<Appointment, unknown>[] {
  const cols: ColumnDef<Appointment, unknown>[] = [
  {
    id: 'customer',
    meta: { title: 'Customer' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-medium">
        {customerDisplayName(row.original.customer)}
      </span>
    ),
  },
  {
    id: 'vehicle',
    meta: { title: 'Vehicle' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle no." />
    ),
    cell: ({ row }) => {
      const plate = row.original.vehicle?.registrationNumber
      if (plate) {
        return <span className="font-mono text-sm">{plate}</span>
      }
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.vehicleId.slice(0, 8)}
        </span>
      )
    },
  },
  {
    accessorKey: 'scheduledAt',
    meta: { title: 'Scheduled' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scheduled" />
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatAppointmentScheduled(row.original.scheduledAt, row.original.scheduledAtLocal)}
      </span>
    ),
  },
  {
    id: 'dealership',
    meta: { title: 'Dealership' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dealership" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate text-muted-foreground">
        {row.original.dealership?.name ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    meta: { title: 'Status' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <AppointmentStatusBadge status={normalizeStatus(row.original.status)} />
    ),
  },
  {
    id: 'view',
    meta: { title: 'View' },
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="text-right">
        <RowLink
          to={`/appointments/${row.original.id}`}
          label="View appointment"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
  },
  ]

  if (options?.omitDealership) {
    return cols.filter((c) => c.id !== 'dealership')
  }
  return cols
}
