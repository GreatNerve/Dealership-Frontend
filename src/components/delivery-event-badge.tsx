import {
  Ban,
  CircleAlert,
  CircleCheck,
  Mail,
  MailOpen,
  MailWarning,
  MousePointerClick,
  Send,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatProviderOccurredAt, providerOccurredAtIso } from '@/lib/format-datetime'
import { deliveryEventBadgeClass, prettyEnum } from '@/lib/notification-status'
import type { DeliveryEventView } from '@/lib/types'
import { cn } from 'cn'

const ICONS: Record<string, LucideIcon> = {
  ACCEPTED: Send,
  DELIVERED: CircleCheck,
  OPENED: MailOpen,
  CLICKED: MousePointerClick,
  SOFT_BOUNCE: MailWarning,
  HARD_BOUNCE: MailWarning,
  BLOCKED: Ban,
  SPAM: ShieldAlert,
  ERROR: CircleAlert,
}

const NODE: Record<string, string> = {
  ACCEPTED: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  OPENED: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  CLICKED: 'bg-violet-50 text-violet-700 ring-violet-200/80',
  SOFT_BOUNCE: 'bg-orange-50 text-orange-800 ring-orange-200/80',
  HARD_BOUNCE: 'bg-red-50 text-red-700 ring-red-200/80',
  BLOCKED: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  SPAM: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200/80',
  ERROR: 'bg-destructive/10 text-destructive ring-destructive/20',
}

const BLURB: Record<string, string> = {
  ACCEPTED: 'Provider accepted the message',
  DELIVERED: 'Reached the recipient inbox',
  OPENED: 'Recipient opened the mail',
  CLICKED: 'A link in the mail was clicked',
  SOFT_BOUNCE: 'Temporary delivery failure',
  HARD_BOUNCE: 'Permanent delivery failure',
  BLOCKED: 'Blocked by the provider',
  SPAM: 'Marked as spam',
  ERROR: 'Provider reported an error',
  OTHER: 'Other provider signal',
}

export function DeliveryEventBadge({ type }: { type: string }) {
  const Icon = ICONS[type] ?? Mail
  return (
    <Badge variant="outline" className={deliveryEventBadgeClass(type)}>
      <Icon data-icon="inline-start" />
      {prettyEnum(type)}
    </Badge>
  )
}

export function DeliveryEventTimeline({
  events,
  timeZone,
  compact = false,
}: {
  events: DeliveryEventView[]
  timeZone: string
  /** Nested under a reminder row — tighter spacing, no blurbs. */
  compact?: boolean
}) {
  if (!events.length) return null

  const sorted = [...events].sort((a, b) =>
    providerOccurredAtIso(b.occurredAt).localeCompare(providerOccurredAtIso(a.occurredAt)),
  )

  return (
    <ol className={cn('relative', compact ? 'mt-2 space-y-0' : 'mt-1 space-y-0')}>
      {sorted.map((event, i) => {
        const Icon = ICONS[event.eventType] ?? Mail
        const nodeClass = NODE[event.eventType] ?? 'bg-muted text-muted-foreground ring-border'
        const last = i === sorted.length - 1
        const nodeSize = compact ? 'size-6' : 'size-8'
        const iconSize = compact ? 'size-3' : 'size-3.5'
        return (
          <li
            key={`${event.eventType}-${event.occurredAt}-${i}`}
            className={cn('relative flex gap-3', compact ? 'pb-3 last:pb-0' : 'pb-5 last:pb-0')}
          >
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-0 w-px bg-border',
                  compact ? 'top-7 left-[11px]' : 'top-9 left-[15px]',
                )}
              />
            ) : null}
            <div
              className={cn(
                'relative z-[1] flex shrink-0 items-center justify-center rounded-full ring-1',
                nodeSize,
                nodeClass,
              )}
            >
              <Icon className={iconSize} strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <p
                    className={cn(
                      'font-medium text-foreground',
                      compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {prettyEnum(event.eventType)}
                  </p>
                  {!compact ? (
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {BLURB[event.eventType] ?? BLURB.OTHER}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      'font-medium tabular-nums text-foreground/80',
                      compact ? 'text-[11px]' : 'text-xs',
                    )}
                  >
                    {formatProviderOccurredAt(event.occurredAt, timeZone)}
                  </p>
                  {!compact ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {prettyEnum(event.provider)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {prettyEnum(event.provider)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
