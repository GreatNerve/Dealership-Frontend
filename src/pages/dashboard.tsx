import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import {
  CalendarCheck2,
  CalendarOff,
  CircleAlert,
  CircleCheck,
  MailOpen,
  MailWarning,
  Send,
  UserRoundX,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { DashboardWeekChart } from '@/components/dashboard-week-chart'
import { PageShell } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiGet, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { shiftYmd, todayYmd, zonedDayRange } from '@/lib/format-datetime'
import type {
  AppointmentDailyStats,
  AppointmentStats,
  DashboardStats,
  NotificationDailyStats,
  NotificationStats,
} from '@/lib/types'
import type { ChartConfig } from '@/components/ui/chart'
import { cn } from 'cn'

const appointmentConfig = {
  confirmed: { label: 'Confirmed', color: 'var(--chart-1)' },
  cancelled: { label: 'Cancelled', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-3)' },
  noShow: { label: 'No-show', color: 'var(--chart-4)' },
} satisfies ChartConfig

const notificationConfig = {
  sent: { label: 'Sent', color: 'var(--chart-1)' },
  failed: { label: 'Failed', color: 'var(--chart-2)' },
  bounced: { label: 'Bounced', color: 'var(--chart-3)' },
  opened: { label: 'Opened', color: 'var(--chart-4)' },
} satisfies ChartConfig

function weekYmds(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftYmd(today, i - 6))
}

function dayLabel(ymd: string): string {
  return format(parseISO(`${ymd}T12:00:00`), 'EEE')
}

const emptyAppt: AppointmentStats = {
  confirmed: 0,
  cancelled: 0,
  completed: 0,
  noShow: 0,
  buckets: [],
}

const emptyMail: NotificationStats = {
  appointments: 0,
  notificationsSent: 0,
  opened: 0,
  softBounce: 0,
  hardBounce: 0,
  failed: 0,
  bounced: 0,
  buckets: [],
}

const emptyDash: DashboardStats = {
  appointments: emptyAppt,
  notifications: emptyMail,
}

export function DashboardPage() {
  const { user } = useAuth()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const tz = user?.homeDealership?.timezone ?? 'UTC'
  const today = todayYmd(tz)
  const yearStart = `${today.slice(0, 4)}-01-01`
  const days = useMemo(() => weekYmds(today), [today])
  const yearRange = useMemo(() => zonedDayRange(yearStart, today, tz), [yearStart, today, tz])

  const overview = useQuery({
    queryKey: ['dashboard', user?.id, today, tz],
    enabled: staff && !!user?.homeDealershipId,
    staleTime: 30_000,
    queryFn: async () => {
      try {
        return await apiGet<DashboardStats>('/api/v1/dashboard/stats', {
          ...yearRange,
          bucket: 'DAY',
        })
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return emptyDash
        throw e
      }
    },
  })

  if (!staff) return <Navigate to="/appointments" replace />

  if (!user?.homeDealershipId) {
    return (
      <PageShell title="Today">
        <Alert className="max-w-2xl">
          <AlertTitle>No home dealership</AlertTitle>
          <AlertDescription>Set up your shop first.</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  const yearAppt = overview.data?.appointments ?? emptyAppt
  const yearMail = overview.data?.notifications ?? emptyMail
  const todayAppt = pickApptDay(yearAppt.buckets, today)
  const todayMail = pickMailDay(yearMail.buckets, today)

  const apptWeek = days.map((ymd) => {
    const row = pickApptDay(yearAppt.buckets, ymd)
    return { label: dayLabel(ymd), ...row }
  })
  const mailWeek = days.map((ymd) => {
    const row = pickMailDay(yearMail.buckets, ymd)
    return { label: dayLabel(ymd), ...row }
  })

  return (
    <PageShell title="Today">
      {overview.isError ? (
        <Alert variant="destructive" className="mb-4 max-w-2xl">
          <AlertTitle>Could not load stats</AlertTitle>
        </Alert>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Appointments</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Confirmed"
            icon={CalendarCheck2}
            tone="chart-1"
            today={todayAppt.confirmed}
            year={yearAppt.confirmed}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Cancelled"
            icon={CalendarOff}
            tone="chart-2"
            today={todayAppt.cancelled}
            year={yearAppt.cancelled}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Completed"
            icon={CircleCheck}
            tone="chart-3"
            today={todayAppt.completed}
            year={yearAppt.completed}
            loading={overview.isLoading}
          />
          <MetricCard
            label="No-show"
            icon={UserRoundX}
            tone="chart-4"
            today={todayAppt.noShow}
            year={yearAppt.noShow}
            loading={overview.isLoading}
          />
        </div>
        <Card className="mt-3">
          <CardHeader>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : (
              <DashboardWeekChart
                data={apptWeek}
                config={appointmentConfig}
                keys={['confirmed', 'cancelled', 'completed', 'noShow']}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Notifications</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Sent"
            icon={Send}
            tone="chart-1"
            today={todayMail.sent}
            year={yearMail.notificationsSent}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Failed"
            icon={CircleAlert}
            tone="chart-2"
            today={todayMail.failed ?? 0}
            year={yearMail.failed ?? 0}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Bounced"
            icon={MailWarning}
            tone="chart-3"
            today={todayMail.bounced ?? 0}
            year={yearMail.bounced ?? 0}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Opened"
            icon={MailOpen}
            tone="chart-4"
            today={todayMail.opened}
            year={yearMail.opened}
            loading={overview.isLoading}
          />
        </div>
        <Card className="mt-3">
          <CardHeader>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-52 w-full rounded-lg" />
            ) : (
              <DashboardWeekChart
                data={mailWeek}
                config={notificationConfig}
                keys={['sent', 'failed', 'bounced', 'opened']}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  )
}

function pickApptDay(
  rows: AppointmentDailyStats[] | undefined,
  ymd: string,
): { confirmed: number; cancelled: number; completed: number; noShow: number } {
  const row = rows?.find((r) => String(r.date).slice(0, 10) === ymd)
  if (!row) {
    return { confirmed: 0, cancelled: 0, completed: 0, noShow: 0 }
  }
  return {
    confirmed: row.confirmed,
    cancelled: row.cancelled,
    completed: row.completed,
    noShow: row.noShow,
  }
}

function pickMailDay(
  rows: NotificationDailyStats[] | undefined,
  ymd: string,
): { sent: number; failed: number; bounced: number; opened: number } {
  const row = rows?.find((r) => String(r.date).slice(0, 10) === ymd)
  if (!row) return { sent: 0, failed: 0, bounced: 0, opened: 0 }
  return {
    sent: row.sent,
    failed: row.failed,
    bounced: row.bounced,
    opened: row.opened,
  }
}

function MetricCard({
  label,
  icon: Icon,
  tone,
  today,
  year,
  loading,
}: {
  label: string
  icon: LucideIcon
  tone: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4'
  today: number
  year: number
  loading: boolean
}) {
  return (
    <Card size="sm" className="shadow-none">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{label}</CardDescription>
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-lg',
              tone === 'chart-1' && 'bg-chart-1/15 text-chart-1',
              tone === 'chart-2' && 'bg-chart-2/15 text-chart-2',
              tone === 'chart-3' && 'bg-chart-3/15 text-chart-3',
              tone === 'chart-4' && 'bg-chart-4/15 text-chart-4',
            )}
          >
            <Icon className="size-3.5" />
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums">
            {today.toLocaleString()}
          </CardTitle>
        )}
        <p className="text-xs tabular-nums text-muted-foreground">
          {year.toLocaleString()} this year
        </p>
      </CardHeader>
    </Card>
  )
}
