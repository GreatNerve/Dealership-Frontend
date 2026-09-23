import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, CalendarClock, Car } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Appointment, AppointmentStatus, ReminderItem } from '@/lib/types'
import { AppointmentStatusBadge } from '@/components/appointment-status-badge'
import { DateTimePickerField } from '@/components/forms/date-time-picker-field'
import { DetailField, DetailPanel } from '@/components/layout/detail-field'
import { PageShell } from '@/components/layout/page-shell'
import {
  formatAppointmentScheduled,
  formatBookingOffsetLabel,
  formatInstantInIanaZone,
  formatTimezoneLabel,
} from '@/lib/format-datetime'
import { customerContactEmail, customerDisplayName } from '@/lib/labels'
import { formatOffsetMinutes } from '@/lib/reminder-offset'
import { dealershipVisibleToStaff } from '@/lib/dealership-view'
import { useReminderCountdown } from '@/hooks/use-reminder-countdown'
import { reminderDeliveryView } from '@/lib/reminder-delivery'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import {
  apiToDatetimeLocal,
  datetimeLocalSameInstant,
  datetimeLocalToApiOffset,
  isFutureDatetimeLocal,
} from '@/lib/schedule'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from 'cn'

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

function HeroFact({
  icon,
  lead,
  label,
  children,
}: {
  icon?: ReactNode
  lead?: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 gap-3 px-5 py-4">
      {lead ?? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm ring-1 ring-border/60">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 min-w-0 text-sm leading-snug text-foreground">{children}</div>
      </div>
    </div>
  )
}

function DeliveryStatusBadge({ item }: { item: ReminderItem }) {
  const view = reminderDeliveryView(item)
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
    <div className="text-left sm:text-right">
      <Badge variant="outline" className={badgeClass}>
        {view.label}
      </Badge>
    </div>
  )
}

function ReminderRow({
  item,
  dealershipTimeZone,
  replayingId,
  onReplay,
}: {
  item: ReminderItem
  dealershipTimeZone: string
  replayingId: string | null
  onReplay: (notificationId: string) => void
}) {
  const countdown = useReminderCountdown(item)
  const canReplay =
    item.notification.status === 'DEAD_LETTER' && item.notification.id != null

  return (
    <div className="space-y-1.5 border-b border-border py-3 last:border-0">
      <div className="grid gap-2 sm:grid-cols-[6.5rem_1fr_auto] sm:items-start">
        <div>
          <p className="text-sm font-medium">{formatOffsetMinutes(item.offsetMinutes)}</p>
          <p className="text-[11px] text-muted-foreground">before visit</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Sends at
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
            {formatInstantInIanaZone(item.dueAt, dealershipTimeZone)}
          </p>
          {countdown ? (
            <p className="mt-1 text-xs font-medium text-foreground/80">{countdown}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <DeliveryStatusBadge item={item} />
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
      {item.notification.lastError ? (
        <p className="text-xs leading-relaxed text-destructive">{item.notification.lastError}</p>
      ) : null}
    </div>
  )
}

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const [rescheduleLocal, setRescheduleLocal] = useState('')
  const [replayingId, setReplayingId] = useState<string | null>(null)

  const appt = useQuery({
    queryKey: ['appointment', user?.id, id],
    enabled: !!id && !!user,
    queryFn: () => apiGet<Appointment>(`/api/v1/appointments/${id}`),
  })

  const reminders = useQuery({
    queryKey: ['reminders', user?.id, id],
    enabled: !!id && !!user && staff,
    queryFn: () => apiGet<ReminderItem[]>(`/api/v1/appointments/${id}/reminders`),
  })

  useEffect(() => {
    // Leave empty until the user picks a new future time (same Instant is rejected by API).
    setRescheduleLocal('')
  }, [appt.data?.id])

  const currentVisitLocal = useMemo(() => {
    if (!appt.data) return ''
    return apiToDatetimeLocal(appt.data.scheduledAtLocal || appt.data.scheduledAt)
  }, [appt.data])

  const cancel = useMutation({
    mutationFn: () => apiPost<Appointment>(`/api/v1/appointments/${id}/cancel`),
    onSuccess: async () => {
      toast.success('Appointment cancelled')
      await Promise.all([
        qc.refetchQueries({ queryKey: ['appointment', user?.id, id] }),
        qc.refetchQueries({ queryKey: ['reminders', user?.id, id] }),
      ])
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const complete = useMutation({
    mutationFn: () => apiPost<Appointment>(`/api/v1/appointments/${id}/complete`),
    onSuccess: async () => {
      toast.success('Visit marked complete')
      await Promise.all([
        qc.refetchQueries({ queryKey: ['appointment', user?.id, id] }),
        qc.refetchQueries({ queryKey: ['reminders', user?.id, id] }),
      ])
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const reschedule = useMutation({
    mutationFn: () =>
      apiPost<Appointment>(`/api/v1/appointments/${id}/reschedule`, {
        scheduledAt: datetimeLocalToApiOffset(rescheduleLocal),
      }),
    onSuccess: () => {
      toast.success('Rescheduled')
      qc.invalidateQueries({ queryKey: ['appointment', user?.id, id] })
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['reminders', user?.id, id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const canSubmitReschedule =
    !!rescheduleLocal &&
    isFutureDatetimeLocal(rescheduleLocal) &&
    !datetimeLocalSameInstant(rescheduleLocal, currentVisitLocal)

  const replayNotification = useMutation({
    mutationFn: (notificationId: string) => {
      setReplayingId(notificationId)
      return apiPost(`/api/v1/notifications/${notificationId}/replay`)
    },
    onSuccess: () => {
      toast.success('Notification queued to resend')
      qc.invalidateQueries({ queryKey: ['reminders', user?.id, id] })
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setReplayingId(null),
  })

  if (appt.isLoading) {
    return (
      <PageShell title="Appointment" description="Loading…">
        <Skeleton className="h-72 w-full max-w-5xl rounded-xl" />
      </PageShell>
    )
  }

  if (appt.isError) {
    const msg = appt.error instanceof ApiError ? appt.error.message : 'Not found'
    return (
      <PageShell title="Appointment" description="Could not load this visit.">
        <Alert variant="destructive" className="max-w-3xl">
          <AlertTitle>Appointment unavailable</AlertTitle>
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  const a = appt.data!
  const canAct = a.status === 'CONFIRMED'
  const location = staff
    ? dealershipVisibleToStaff(a.dealership, user?.homeDealershipId)
    : a.dealership
  const when = formatAppointmentScheduled(a.scheduledAt, a.scheduledAtLocal)
  const dealershipTz = location?.timezone ?? 'UTC'
  const visitTimeZoneHint = staff
    ? formatTimezoneLabel(dealershipTz)
    : formatBookingOffsetLabel(a.displayOffset)
  const plate = a.vehicle?.registrationNumber
  const vehicleLine = a.vehicle
    ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`
    : null
  const pageTitle = vehicleLine ?? plate ?? 'Service visit'
  const customerEmail = staff ? customerContactEmail(a.customer) : null

  return (
    <PageShell
      eyebrow="Appointment"
      title={pageTitle}
      description={
        <p>
          {plate ? (
            <>
              <span className="font-mono text-foreground">{plate}</span>
              <span aria-hidden> · </span>
            </>
          ) : null}
          <span className="text-foreground">{when}</span>
          {location?.name ? (
            <>
              <span aria-hidden> · </span>
              {location.name}
            </>
          ) : null}
        </p>
      }
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AppointmentStatusBadge status={normalizeStatus(a.status)} />
          <Link
            to="/appointments"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div
            className={cn(
              'grid min-w-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:divide-x [&>div]:min-w-0',
              staff ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
            )}
          >
            {staff ? (
              <HeroFact
                lead={
                  <UserAvatar
                    seed={a.customerId}
                    size={36}
                    className="size-9"
                    alt={customerDisplayName(a.customer)}
                  />
                }
                label="Customer"
              >
                <p className="truncate font-medium">{customerDisplayName(a.customer)}</p>
                {customerEmail ? (
                  <p className="mt-0.5 break-all text-xs text-muted-foreground">{customerEmail}</p>
                ) : null}
              </HeroFact>
            ) : null}
            <HeroFact icon={<Car className="size-4" />} label="Vehicle">
              <p className="font-mono font-medium">{plate ?? '—'}</p>
              {vehicleLine ? <p className="mt-0.5 text-muted-foreground">{vehicleLine}</p> : null}
            </HeroFact>
            <HeroFact icon={<CalendarClock className="size-4" />} label="Visit time">
              <p className="font-medium tabular-nums">{when}</p>
              <p className="mt-0.5 text-muted-foreground">{visitTimeZoneHint}</p>
            </HeroFact>
            <HeroFact icon={<Building2 className="size-4" />} label="Location">
              <p className="font-medium">{location?.name ?? '—'}</p>
              {location?.address ? (
                <p className="mt-0.5 line-clamp-2 break-all text-muted-foreground">
                  {location.address}
                </p>
              ) : null}
            </HeroFact>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,22rem)]">
          {staff ? (
            <DetailPanel
              title="Reminder schedule"
              description={`Send times in ${formatTimezoneLabel(dealershipTz)}. Delivery status per offset.`}
            >
              {reminders.isLoading && <Skeleton className="h-28 w-full" />}
              {reminders.isError && (
                <p className="text-sm text-destructive">Could not load reminders.</p>
              )}
              {reminders.isSuccess && reminders.data.length === 0 && (
                <p className="text-sm text-muted-foreground">No reminder rows yet.</p>
              )}
              {reminders.isSuccess && reminders.data.length > 0 && (
                <div className="divide-y divide-border">
                  {reminders.data.map((r) => (
                    <ReminderRow
                      key={r.offsetMinutes}
                      item={r}
                      dealershipTimeZone={dealershipTz}
                      replayingId={replayingId}
                      onReplay={(notificationId) => replayNotification.mutate(notificationId)}
                    />
                  ))}
                </div>
              )}
            </DetailPanel>
          ) : (
            <DetailPanel title="Visit summary">
              <DetailField label="Vehicle">
                {a.vehicle
                  ? `${a.vehicle.registrationNumber} · ${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`
                  : '—'}
              </DetailField>
              <DetailField label="Visit time">
                <span className="font-medium tabular-nums text-foreground">{when}</span>
                <p className="mt-0.5 text-sm text-muted-foreground">{visitTimeZoneHint}</p>
              </DetailField>
              <DetailField label="Dealership">{location?.name ?? '—'}</DetailField>
              <DetailField label="Address">
                <span className="text-muted-foreground">{location?.address ?? '—'}</span>
              </DetailField>
              <DetailField label="Status">
                <AppointmentStatusBadge status={normalizeStatus(a.status)} />
              </DetailField>
            </DetailPanel>
          )}

          <DetailPanel
            title={canAct ? 'Change visit' : 'Actions'}
            description={
              canAct
                ? staff
                  ? 'Complete the visit, reschedule, or cancel while confirmed.'
                  : 'Reschedule or cancel your visit while it is confirmed.'
                : undefined
            }
            className={cn('lg:sticky lg:top-20')}
          >
            {canAct ? (
              <FieldGroup className="gap-5">
                <DateTimePickerField
                  id="reschedule"
                  value={rescheduleLocal}
                  onChange={setRescheduleLocal}
                  disablePast
                />
                <div className="flex flex-col gap-2">
                  {staff ? (
                    <Button
                      className="w-full"
                      disabled={complete.isPending}
                      onClick={() => complete.mutate()}
                    >
                      {complete.isPending ? <Spinner data-icon="inline-start" /> : null}
                      Mark complete
                    </Button>
                  ) : null}
                  <Button
                    className="w-full"
                    variant={staff ? 'outline' : 'default'}
                    disabled={!canSubmitReschedule || reschedule.isPending}
                    onClick={() => reschedule.mutate()}
                  >
                    {reschedule.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate()}
                  >
                    {cancel.isPending ? <Spinner data-icon="inline-start" /> : null}
                    Cancel visit
                  </Button>
                </div>
              </FieldGroup>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                This visit is{' '}
                <span className="font-medium text-foreground">
                  {a.status.replace(/_/g, ' ').toLowerCase()}
                </span>
                . You can only reschedule or cancel confirmed appointments.
              </p>
            )}
          </DetailPanel>
        </div>
      </div>
    </PageShell>
  )
}
