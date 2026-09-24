import {
  CircleAlert,
  CircleCheck,
  Clock,
  Hourglass,
  MailOpen,
  MailWarning,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DeliveryEventTimeline } from '@/components/delivery-event-badge'
import { useReminderCountdown } from '@/hooks/use-reminder-countdown'
import { formatInstantInIanaZone } from '@/lib/format-datetime'
import {
  notificationBounced,
  notificationOpened,
} from '@/lib/mail-watch'
import { reminderDeliveryView, type ReminderDeliveryTone } from '@/lib/reminder-delivery'
import { formatOffsetBeforeVisit } from '@/lib/reminder-offset'
import { notificationBadgeClass, prettyEnum } from '@/lib/notification-status'
import type { Notification, ReminderItem } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from 'cn'

const TONE_NODE: Record<ReminderDeliveryTone, string> = {
  sent: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200/80',
  failed: 'bg-destructive/10 text-destructive ring-destructive/20',
  muted: 'bg-muted text-muted-foreground ring-border',
  default: 'bg-sky-50 text-sky-700 ring-sky-200/80',
}

function toneIcon(tone: ReminderDeliveryTone, label: string): LucideIcon {
  if (label === 'Opened') return MailOpen
  if (label === 'Bounced') return MailWarning
  if (tone === 'sent') return CircleCheck
  if (tone === 'pending') return Hourglass
  if (tone === 'failed') return CircleAlert
  if (tone === 'muted') return Clock
  return Send
}

function StatusBadge({
  item,
  opened,
  bounced,
}: {
  item: ReminderItem
  opened?: boolean
  bounced?: boolean
}) {
  const view = reminderDeliveryView(item, { opened, bounced })
  const badgeClass =
    view.tone === 'sent'
      ? 'border-0 bg-emerald-50 font-normal text-emerald-800'
      : view.tone === 'pending'
        ? 'border-amber-200 bg-amber-50 font-normal text-amber-900'
        : view.tone === 'failed'
          ? 'border-destructive/30 bg-destructive/5 font-normal text-destructive'
          : view.tone === 'muted'
            ? 'font-normal text-muted-foreground'
            : 'font-normal'

  return (
    <Badge variant="outline" className={badgeClass}>
      {view.label}
    </Badge>
  )
}

function TimelineNode({
  tone,
  label,
  last,
}: {
  tone: ReminderDeliveryTone
  label: string
  last: boolean
}) {
  const Icon = toneIcon(tone, label)
  return (
    <div className="relative flex flex-col items-center self-stretch">
      {!last ? (
        <span
          aria-hidden
          className="absolute top-8 bottom-[-1.25rem] left-1/2 w-px -translate-x-1/2 bg-border"
        />
      ) : null}
      <div
        className={cn(
          'relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full ring-1',
          TONE_NODE[tone],
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.25} />
      </div>
    </div>
  )
}

function ProviderEvents({
  events,
  timeZone,
}: {
  events?: Notification['events'] | null
  timeZone: string
}) {
  if (!events?.length) return null
  return (
    <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Provider events
      </p>
      <DeliveryEventTimeline events={events} timeZone={timeZone} compact />
    </div>
  )
}

/** Current-visit offset rows only — timeline. */
export function ReminderScheduleRow({
  item,
  note,
  dealershipTimeZone,
  replayingId,
  onReplay,
  last,
}: {
  item: ReminderItem
  note?: Notification
  dealershipTimeZone: string
  replayingId: string | null
  onReplay: (notificationId: string) => void
  last: boolean
}) {
  const countdown = useReminderCountdown(item)
  const opened = notificationOpened(note)
  const bounced = notificationBounced(note)
  const view = reminderDeliveryView(item, { opened, bounced })
  const canReplay =
    item.notification.status === 'DEAD_LETTER' && item.notification.id != null

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <TimelineNode tone={view.tone} label={view.label} last={last} />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {formatOffsetBeforeVisit(item.offsetMinutes)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sends at{' '}
              <span className="font-medium tabular-nums text-foreground/80">
                {formatInstantInIanaZone(item.dueAt, dealershipTimeZone)}
              </span>
            </p>
            {countdown ? (
              <p className="mt-1 text-xs font-medium text-foreground/80">{countdown}</p>
            ) : null}
            {item.notification.lastError ? (
              <p className="mt-1 text-xs leading-relaxed text-destructive">
                {item.notification.lastError}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusBadge item={item} opened={opened} bounced={bounced} />
            {canReplay ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={replayingId === item.notification.id}
                onClick={() => onReplay(item.notification.id!)}
              >
                {replayingId === item.notification.id ? (
                  <Spinner data-icon="inline-start" className="size-3" />
                ) : null}
                Resend
              </Button>
            ) : null}
          </div>
        </div>
        <ProviderEvents events={note?.events} timeZone={dealershipTimeZone} />
      </div>
    </li>
  )
}

/** Flat row — not timeline (before-reschedule offsets). */
export function ReminderFlatRow({
  item,
  note,
  dealershipTimeZone,
  replayingId,
  onReplay,
}: {
  item: ReminderItem
  note?: Notification
  dealershipTimeZone: string
  replayingId: string | null
  onReplay: (notificationId: string) => void
}) {
  const countdown = useReminderCountdown(item)
  const opened = notificationOpened(note)
  const bounced = notificationBounced(note)
  const canReplay =
    item.notification.status === 'DEAD_LETTER' && item.notification.id != null

  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {formatOffsetBeforeVisit(item.offsetMinutes)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sends at{' '}
            <span className="font-medium tabular-nums text-foreground/80">
              {formatInstantInIanaZone(item.dueAt, dealershipTimeZone)}
            </span>
          </p>
          {countdown ? (
            <p className="mt-1 text-xs font-medium text-foreground/80">{countdown}</p>
          ) : null}
          {item.notification.lastError ? (
            <p className="mt-1 text-xs leading-relaxed text-destructive">
              {item.notification.lastError}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge item={item} opened={opened} bounced={bounced} />
          {canReplay ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={replayingId === item.notification.id}
              onClick={() => onReplay(item.notification.id!)}
            >
              {replayingId === item.notification.id ? (
                <Spinner data-icon="inline-start" className="size-3" />
              ) : null}
              Resend
            </Button>
          ) : null}
        </div>
      </div>
      <ProviderEvents events={note?.events} timeZone={dealershipTimeZone} />
    </div>
  )
}

/** Flat row — not timeline (staff mail). */
export function StaffMailScheduleRow({
  note,
  dealershipTimeZone,
  replayingId,
  onReplay,
}: {
  note: Notification
  dealershipTimeZone: string
  replayingId: string | null
  onReplay: (notificationId: string) => void
}) {
  const canReplay = note.status === 'DEAD_LETTER'
  const when = note.sentAt
    ? formatInstantInIanaZone(note.sentAt, dealershipTimeZone)
    : 'Queued'
  const eventLabel = notificationBounced(note)
    ? 'Bounced'
    : notificationOpened(note)
      ? 'Opened'
      : null

  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <div className="min-w-0">
          <p className="mt-0.5 text-xs text-muted-foreground">
            {note.sentAt ? 'Sent at' : 'Status'}{' '}
            <span className="font-medium tabular-nums text-foreground/80">{when}</span>
          </p>
          {note.subject ? (
            <p className="mt-1 truncate text-sm text-foreground">{note.subject}</p>
          ) : (
            <p className="mt-1 text-sm font-medium text-foreground">Staff mail</p>
          )}
          {note.lastError ? (
            <p className="mt-1 text-xs leading-relaxed text-destructive">{note.lastError}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="outline" className={notificationBadgeClass(note.status)}>
            {eventLabel ?? prettyEnum(note.status)}
          </Badge>
          <Link
            to={`/notifications/${note.id}`}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            View
          </Link>
          {canReplay ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={replayingId === note.id}
              onClick={() => onReplay(note.id)}
            >
              {replayingId === note.id ? (
                <Spinner data-icon="inline-start" className="size-3" />
              ) : null}
              Resend
            </Button>
          ) : null}
        </div>
      </div>
      <ProviderEvents events={note.events} timeZone={dealershipTimeZone} />
    </div>
  )
}
