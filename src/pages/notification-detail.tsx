import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Notification } from '@/lib/types'
import { DetailField, DetailPanel } from '@/components/layout/detail-field'
import { PageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DeliveryEventTimeline } from '@/components/delivery-event-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatInstantInIanaZone, formatTimezoneLabel } from '@/lib/format-datetime'
import { notificationBadgeClass, prettyEnum } from '@/lib/notification-status'
import { NotificationAppointmentLink } from '@/components/notification-appointment-link'
import { appointmentCaption, notificationToName } from '@/lib/labels'
import { cn } from 'cn'

export function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const tz = user?.homeDealership?.timezone ?? 'UTC'

  const note = useQuery({
    queryKey: ['notification', user?.id, id],
    enabled: !!id && !!user && staff,
    queryFn: () => apiGet<Notification>(`/api/v1/notifications/${id}`),
  })

  const replay = useMutation({
    mutationFn: () => apiPost(`/api/v1/notifications/${id}/replay`),
    onSuccess: () => {
      toast.success('Notification queued to resend')
      qc.invalidateQueries({ queryKey: ['notification', user?.id, id] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (!staff) return <Navigate to="/appointments" replace />

  if (note.isLoading) {
    return (
      <PageShell title="Notification" description="Loading…">
        <Skeleton className="h-56 w-full max-w-3xl rounded-xl" />
      </PageShell>
    )
  }

  if (note.isError) {
    const msg = note.error instanceof ApiError ? note.error.message : 'Not found'
    return (
      <PageShell title="Notification" description="Could not load this mail.">
        <Alert variant="destructive" className="max-w-3xl">
          <AlertTitle>Notification unavailable</AlertTitle>
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  const n = note.data!
  const canReplay = n.status === 'DEAD_LETTER'
  const caption = appointmentCaption(n.appointment)
  const pageTitle = caption.plate ? `${caption.name} · ${caption.plate}` : caption.name

  return (
    <PageShell
      eyebrow="Notification"
      title={pageTitle}
      description={`${prettyEnum(n.generation)} · ${formatTimezoneLabel(tz)}`}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="outline" className={notificationBadgeClass(n.status)}>
            {prettyEnum(n.status)}
          </Badge>
          <Link
            to="/notifications"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <DetailPanel title="Delivery">
          <DetailField label="To">{notificationToName(n)}</DetailField>
          <DetailField label="Channel">{prettyEnum(n.channel)}</DetailField>
          <DetailField label="Opened">{n.opened ? 'Yes' : 'No'}</DetailField>
          <DetailField label="Bounced">{n.bounced ? 'Yes' : 'No'}</DetailField>
          <DetailField label="Sent">
            {n.sentAt ? formatInstantInIanaZone(n.sentAt, tz) : '—'}
          </DetailField>
          <DetailField label="Attempts">{n.attempts}</DetailField>
          {n.lastError ? (
            <DetailField label="Last error">
              <span className="text-destructive">{n.lastError}</span>
            </DetailField>
          ) : null}
          <DetailField label="Appointment">
            <NotificationAppointmentLink notification={n} className="inline-flex flex-col" showWhen />
          </DetailField>
          {n.generation === 'MANUAL' ? (
            <>
              <DetailField label="Subject">{n.subject ?? '—'}</DetailField>
              <DetailField label="Body">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                  {n.body ?? '—'}
                </pre>
              </DetailField>
            </>
          ) : null}
        </DetailPanel>

        <DetailPanel
          title="Delivery events"
          description="Latest provider signal first. These rows do not change worker status."
        >
          {n.events.length === 0 ? (
            <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6">
              <p className="text-sm font-medium text-foreground">No events yet</p>
              <p className="text-xs text-muted-foreground">
                Opens, delivers, and bounces will show here after the provider reports them.
              </p>
            </div>
          ) : (
            <DeliveryEventTimeline events={n.events} timeZone={tz} />
          )}
        </DetailPanel>

        {canReplay ? (
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={replay.isPending}
            onClick={() => replay.mutate()}
          >
            {replay.isPending ? <Spinner data-icon="inline-start" /> : null}
            Resend
          </Button>
        ) : null}
      </div>
    </PageShell>
  )
}
