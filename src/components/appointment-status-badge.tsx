import { Check, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AppointmentStatus } from '@/lib/types'
import { cn } from 'cn'

const styles: Record<
  AppointmentStatus,
  { className: string; icon?: ReactNode; label: string }
> = {
  CONFIRMED: {
    className:
      'border-0 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    icon: <Check className="size-3" aria-hidden />,
    label: 'Confirmed',
  },
  CANCELLED: {
    className: 'border-0 bg-muted text-muted-foreground',
    icon: <X className="size-3" aria-hidden />,
    label: 'Cancelled',
  },
  COMPLETED: {
    className:
      'border-0 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200',
    label: 'Completed',
  },
  NO_SHOW: {
    className: 'border-0 bg-amber-50 text-amber-900 dark:bg-amber-950/40',
    label: 'No show',
  },
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = styles[status] ?? {
    className: 'border-border bg-secondary text-secondary-foreground',
    label: status,
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-normal whitespace-nowrap',
        cfg.className,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}
