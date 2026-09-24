import { Link } from 'react-router-dom'
import type { Notification } from '@/lib/types'
import { appointmentCaption } from '@/lib/labels'
import { formatAppointmentScheduled } from '@/lib/format-datetime'
import { cn } from 'cn'

type Props = {
  notification: Notification
  className?: string
  showWhen?: boolean
  /** Table already has a To column — link is the visit, not the name. */
  visitOnly?: boolean
}

export function NotificationAppointmentLink({
  notification,
  className,
  showWhen = false,
  visitOnly = false,
}: Props) {
  const caption = appointmentCaption(notification.appointment)
  const when =
    showWhen && notification.appointment
      ? formatAppointmentScheduled(
          notification.appointment.scheduledAt,
          notification.appointment.scheduledAtLocal,
        )
      : null
  const title = visitOnly
    ? (caption.plate ?? caption.name)
    : caption.plate
      ? `${caption.name} · ${caption.plate}`
      : caption.name
  const subtitle = [caption.vehicleLine, when].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/appointments/${notification.appointmentId}`}
      className={cn('min-w-0 underline-offset-4 hover:underline', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="block truncate text-sm font-medium text-foreground">{title}</span>
      {subtitle ? (
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>
      ) : null}
    </Link>
  )
}
