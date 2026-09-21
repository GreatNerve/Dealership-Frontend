import type { Appointment, AppointmentStatus } from '@/lib/types'
import { AppointmentStatusBadge } from '@/components/appointment-status-badge'
import { RowLink } from '@/components/table/row-link'
import { formatAppointmentScheduled } from '@/lib/format-datetime'
import { customerDisplayName } from '@/lib/labels'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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

type Props = {
  appointment: Appointment
  showDealership?: boolean
  showCustomer?: boolean
}

export function AppointmentMobileCard({
  appointment,
  showDealership = true,
  showCustomer = true,
}: Props) {
  const plate =
    appointment.vehicle?.registrationNumber ?? appointment.vehicleId.slice(0, 8)
  const vehicleLine = appointment.vehicle
    ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
    : null
  const when = formatAppointmentScheduled(
    appointment.scheduledAt,
    appointment.scheduledAtLocal,
  )
  const subtitle = showCustomer
    ? customerDisplayName(appointment.customer)
    : vehicleLine

  return (
    <Card size="sm" className="shadow-sm transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base font-mono">{plate}</CardTitle>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <AppointmentStatusBadge status={normalizeStatus(appointment.status)} />
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="tabular-nums text-foreground">{when}</p>
        {showDealership && appointment.dealership?.name ? (
          <p className="truncate text-muted-foreground">{appointment.dealership.name}</p>
        ) : null}
      </CardContent>
      <CardFooter className="border-t border-border/80 pt-3">
        <RowLink
          to={`/appointments/${appointment.id}`}
          label="View appointment"
          onClick={(e) => e.stopPropagation()}
        />
      </CardFooter>
    </Card>
  )
}
