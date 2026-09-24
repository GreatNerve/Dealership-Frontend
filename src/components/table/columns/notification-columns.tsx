import type { ColumnDef } from '@tanstack/react-table'
import type { Notification } from '@/lib/types'
import { NotificationAppointmentLink } from '@/components/notification-appointment-link'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { formatInstantInIanaZone } from '@/lib/format-datetime'
import { notificationToName } from '@/lib/labels'
import { notificationBadgeClass, prettyEnum } from '@/lib/notification-status'

export function notificationColumns(
  timeZone: string,
): ColumnDef<Notification, unknown>[] {
  return [
    {
      id: 'to',
      meta: { title: 'To' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="To" />,
      cell: ({ row }) => (
        <span className="max-w-[220px] truncate text-sm font-medium">
          {notificationToName(row.original)}
        </span>
      ),
    },
    {
      id: 'generation',
      meta: { title: 'Kind' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kind" />,
      cell: ({ row }) => (
        <span className="text-sm">{prettyEnum(row.original.generation)}</span>
      ),
    },
    {
      id: 'status',
      meta: { title: 'Status' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={notificationBadgeClass(row.original.status)}>
          {prettyEnum(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'opened',
      meta: { title: 'Opened' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opened" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.opened ? 'Yes' : '—'}
        </span>
      ),
    },
    {
      id: 'bounced',
      meta: { title: 'Bounced' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bounced" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.bounced ? 'Yes' : '—'}
        </span>
      ),
    },
    {
      id: 'when',
      meta: { title: 'Sent' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.sentAt
            ? formatInstantInIanaZone(row.original.sentAt, timeZone)
            : '—'}
        </span>
      ),
    },
    {
      id: 'appointment',
      meta: { title: 'Appointment' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Appointment" />
      ),
      cell: ({ row }) => (
        <NotificationAppointmentLink notification={row.original} visitOnly />
      ),
    },
  ]
}
