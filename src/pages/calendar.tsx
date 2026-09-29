import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { apiDelete, apiGet } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  formatClockInIanaZone,
  shiftYmd,
  todayYmd,
  ymdInTimeZone,
  zonedDayRange,
} from '@/lib/format-datetime'
import { customerDisplayName } from '@/lib/labels'
import type {
  Appointment,
  CapacityOverride,
  Page,
  ServiceSlot,
  ServiceSlotsPage,
} from '@/lib/types'
import { PageShell } from '@/components/layout/page-shell'
import { AppointmentStatusBadge } from '@/components/appointment-status-badge'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ymdLocal(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function monthTitle(date: Date): string {
  return format(date, 'MMMM yyyy')
}

function gridDays(month: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  })
}

function weeksOf(days: Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

function overrideOnDay(rows: CapacityOverride[], ymd: string): CapacityOverride | undefined {
  return rows.find((row) => row.fromDate <= ymd && ymd <= row.toDate)
}

function hmLabel(value: string | null): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function overrideLabel(row: CapacityOverride): string {
  const seats = row.capacity === 0 ? 'Closed' : `${row.capacity} seats`
  if (!row.fromTime || !row.toTime) return seats
  return `${seats} ${hmLabel(row.fromTime)}–${hmLabel(row.toTime)}`
}

function clockInZone(isoUtc: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(parseISO(isoUtc))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00'
  let hour = get('hour')
  if (hour === '24') hour = '00'
  return `${hour}:${get('minute')}:${get('second')}`
}

function slotCovered(slot: ServiceSlot, override: CapacityOverride, timeZone: string): boolean {
  const ymd = ymdInTimeZone(parseISO(slot.start), timeZone)
  if (ymd < override.fromDate || ymd > override.toDate) return false
  if (!override.fromTime || !override.toTime) return true
  const clock = clockInZone(slot.start, timeZone)
  return clock >= override.fromTime && clock < override.toTime
}

type OverrideSpan = {
  id: string
  week: number
  col: number
  span: number
  day: string
  label: string
  lane: number
}

function overrideSpans(weeks: Date[][], rows: CapacityOverride[]): OverrideSpan[] {
  const out: OverrideSpan[] = []
  weeks.forEach((week, weekIndex) => {
    const ymds = week.map(ymdLocal)
    const used: number[][] = ymds.map(() => [])
    for (const row of rows) {
      const first = ymds.findIndex((d) => d >= row.fromDate && d <= row.toDate)
      if (first < 0) continue
      let last = first
      for (let i = first; i < 7; i++) {
        if (ymds[i] >= row.fromDate && ymds[i] <= row.toDate) last = i
        else break
      }
      let lane = 0
      while (ymds.slice(first, last + 1).some((_, i) => used[first + i].includes(lane))) {
        lane += 1
      }
      for (let i = first; i <= last; i++) used[i].push(lane)
      out.push({
        id: `${row.id}-${weekIndex}-${ymds[first]}`,
        week: weekIndex,
        col: first,
        span: last - first + 1,
        day: ymds[first],
        label: overrideLabel(row),
        lane,
      })
    }
  })
  return out
}

export function CalendarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const staff = user?.role === 'DEALERSHIP_STAFF'
  const shopId = user?.homeDealershipId
  const tz = user?.homeDealership?.timezone ?? 'UTC'
  const today = todayYmd(tz)
  const [month, setMonth] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })
  const [day, setDay] = useState(today)
  const [view, setView] = useState<'month' | 'day'>('month')

  const monthSpan = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return zonedDayRange(ymdLocal(start), ymdLocal(end), tz)
  }, [month, tz])
  const daySpan = useMemo(() => zonedDayRange(day, day, tz), [day, tz])

  const monthSlots = useQuery({
    queryKey: ['dealership-slots', shopId, monthSpan.from, monthSpan.to],
    enabled: staff && !!shopId && view === 'month',
    queryFn: () =>
      apiGet<ServiceSlotsPage>(`/api/v1/dealerships/${shopId}/slots`, {
        from: monthSpan.from,
        to: monthSpan.to,
      }),
  })

  const daySlotsQuery = useQuery({
    queryKey: ['dealership-slots', shopId, daySpan.from, daySpan.to],
    enabled: staff && !!shopId && view === 'day',
    queryFn: () =>
      apiGet<ServiceSlotsPage>(`/api/v1/dealerships/${shopId}/slots`, {
        from: daySpan.from,
        to: daySpan.to,
      }),
  })

  const overrides = useQuery({
    queryKey: ['dealership-overrides', shopId],
    enabled: staff && !!shopId,
    queryFn: () => apiGet<CapacityOverride[]>(`/api/v1/dealerships/${shopId}/overrides`),
  })

  const monthVisits = useQuery({
    queryKey: ['appointments', 'calendar-month', monthSpan.from, monthSpan.to],
    enabled: staff && view === 'month',
    queryFn: () =>
      apiGet<Page<Appointment>>('/api/v1/appointments', {
        from: monthSpan.from,
        to: monthSpan.to,
        size: 1000,
      }),
  })

  const dayVisitsQuery = useQuery({
    queryKey: ['appointments', 'calendar-day', day],
    enabled: staff && view === 'day',
    queryFn: () =>
      apiGet<Page<Appointment>>('/api/v1/appointments', {
        from: daySpan.from,
        to: daySpan.to,
        size: 100,
      }),
  })

  const removeOverride = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/dealerships/${shopId}/overrides/${id}`),
    onSuccess: () => {
      toast.success('Override removed')
      qc.invalidateQueries({ queryKey: ['dealership-overrides', shopId] })
      qc.invalidateQueries({ queryKey: ['dealership-slots'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const slotsByDay = useMemo(() => {
    const map = new Map<string, ServiceSlot[]>()
    for (const slot of monthSlots.data?.items ?? []) {
      const key = ymdInTimeZone(parseISO(slot.start), tz)
      const list = map.get(key)
      if (list) list.push(slot)
      else map.set(key, [slot])
    }
    return map
  }, [monthSlots.data, tz])

  const visitsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const row of monthVisits.data?.items ?? []) {
      if (row.status === 'CANCELLED') continue
      const key = ymdInTimeZone(parseISO(row.scheduledAt), tz)
      const list = map.get(key)
      if (list) list.push(row)
      else map.set(key, [row])
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    }
    return map
  }, [monthVisits.data, tz])

  const days = useMemo(() => gridDays(month), [month])
  const weeks = useMemo(() => weeksOf(days), [days])
  const spans = useMemo(
    () => overrideSpans(weeks, overrides.data ?? []),
    [weeks, overrides.data],
  )
  const dayOverride = overrideOnDay(overrides.data ?? [], day)
  const daySlots = daySlotsQuery.data?.items ?? []
  const dayVisits = (dayVisitsQuery.data?.items ?? []).filter((row) => row.status !== 'CANCELLED')

  if (!staff) {
    return <Navigate to="/appointments" replace />
  }

  const openDay = (ymd: string) => {
    const [y, m] = ymd.split('-').map(Number)
    setMonth(new Date(y, m - 1, 1))
    setDay(ymd)
    setView('day')
  }

  const goToday = () => {
    const [y, m] = today.split('-').map(Number)
    setMonth(new Date(y, m - 1, 1))
    setDay(today)
  }

  const go = (delta: number) => {
    if (view === 'day') {
      openDay(shiftYmd(day, delta))
      return
    }
    setMonth((current) => addMonths(current, delta))
  }

  return (
    <PageShell title="Calendar">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={goToday}>
            Today
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => go(-1)} aria-label="Previous">
            <ChevronLeft />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => go(1)} aria-label="Next">
            <ChevronRight />
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">
            {view === 'day' ? format(parseISO(`${day}T12:00:00`), 'd MMMM yyyy') : monthTitle(month)}
          </h2>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          <Button
            type="button"
            size="sm"
            variant={view === 'month' ? 'secondary' : 'ghost'}
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'day' ? 'secondary' : 'ghost'}
            onClick={() => setView('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((name) => (
              <div key={name} className="px-3 py-2 text-xs font-medium text-muted-foreground">
                {name}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => {
            const weekSpans = spans.filter((row) => row.week === weekIndex)
            const lanes = Math.max(0, ...weekSpans.map((row) => row.lane + 1))
            return (
              <div key={weekIndex} className="relative grid grid-cols-7 border-b border-border last:border-b-0">
                {week.map((date) => {
                  const ymd = ymdLocal(date)
                  const inMonth = isSameMonth(date, month)
                  const isToday = ymd === today
                  const dayVisitsForCell = visitsByDay.get(ymd) ?? []
                  const daySlotsForCell = slotsByDay.get(ymd) ?? []
                  const open = daySlotsForCell.reduce((n, slot) => n + slot.available, 0)
                  return (
                    <button
                      key={ymd}
                      type="button"
                      onClick={() => openDay(ymd)}
                      className={cn(
                        'flex min-h-32 flex-col items-start gap-1 border-r border-border p-2 pb-8 text-left last:border-r-0 hover:bg-muted/40',
                        !inMonth && 'bg-muted/20 text-muted-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full text-sm',
                          isToday && 'bg-foreground text-background',
                        )}
                      >
                        {date.getDate()}
                      </span>
                      <span style={{ height: `${Math.max(lanes, 1) * 1.4}rem` }} />
                      {dayVisitsForCell.slice(0, 2).map((row) => (
                        <span
                          key={row.id}
                          className="w-full truncate rounded-md bg-sky-100 px-1.5 py-0.5 text-[11px] text-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                        >
                          {formatClockInIanaZone(row.scheduledAt, tz)}{' '}
                          {row.vehicle?.registrationNumber ?? 'Visit'}
                        </span>
                      ))}
                      {dayVisitsForCell.length > 2 ? (
                        <span className="text-[11px] text-muted-foreground">
                          +{dayVisitsForCell.length - 2} more
                        </span>
                      ) : null}
                      {dayVisitsForCell.length === 0 && open > 0 ? (
                        <span className="text-[11px] text-muted-foreground">{open} open</span>
                      ) : null}
                    </button>
                  )
                })}
                {weekSpans.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => openDay(row.day)}
                    className="absolute z-10 truncate rounded-md bg-amber-100 px-1.5 py-0.5 text-left text-[11px] text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200"
                    style={{
                      top: `2.15rem`,
                      marginTop: `${row.lane * 1.4}rem`,
                      left: `calc(${(row.col / 7) * 100}% + 4px)`,
                      width: `calc(${(row.span / 7) * 100}% - 8px)`,
                    }}
                  >
                    {row.label}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <DayAgenda
          timezone={tz}
          slots={daySlots}
          visits={dayVisits}
          override={dayOverride}
          removing={removeOverride.isPending}
          onRemoveOverride={() => dayOverride && removeOverride.mutate(dayOverride.id)}
          onOpen={(id) => navigate(`/appointments/${id}`)}
        />
      )}
    </PageShell>
  )
}

function DayAgenda({
  timezone,
  slots,
  visits,
  override,
  removing,
  onRemoveOverride,
  onOpen,
}: {
  timezone: string
  slots: ServiceSlot[]
  visits: Appointment[]
  override: CapacityOverride | undefined
  removing: boolean
  onRemoveOverride: () => void
  onOpen: (id: string) => void
}) {
  const visitsByStart = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const row of visits) {
      const list = map.get(row.scheduledAt) ?? []
      list.push(row)
      map.set(row.scheduledAt, list)
    }
    return map
  }, [visits])

  const rows =
    slots.length > 0
      ? slots
      : visits.map((row) => ({
          start: row.scheduledAt,
          capacity: 0,
          booked: 1,
          available: 0,
        }))

  const allDay = override && !override.fromTime
  const firstCovered = override
    ? rows.findIndex((slot) => slotCovered(slot, override, timezone))
    : -1
  const lastCovered =
    firstCovered >= 0
      ? rows.reduce((last, slot, i) => (slotCovered(slot, override!, timezone) ? i : last), firstCovered)
      : -1

  return (
    <div>
      {override && allDay ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
          <span>{overrideLabel(override)}</span>
          <Button type="button" variant="outline" size="sm" disabled={removing} onClick={onRemoveOverride}>
            Remove
          </Button>
        </div>
      ) : null}

      {rows.length === 0 && !override ? (
        <p className="py-12 text-sm text-muted-foreground">No Service Slots this day.</p>
      ) : rows.length === 0 && override ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
          <span>{overrideLabel(override)}</span>
          <Button type="button" variant="outline" size="sm" disabled={removing} onClick={onRemoveOverride}>
            Remove
          </Button>
        </div>
      ) : (
        <div>
          {rows.map((slot, index) => {
            const bookedHere = visitsByStart.get(slot.start) ?? []
            const showOverrideBlock = !allDay && index === firstCovered && override
            if (!allDay && firstCovered >= 0 && index > firstCovered && index <= lastCovered) {
              return <span key={slot.start} className="hidden" />
            }
            const coveredCount =
              showOverrideBlock && lastCovered >= firstCovered ? lastCovered - firstCovered + 1 : 1
            const visitsInRange = showOverrideBlock
              ? rows
                  .slice(firstCovered, lastCovered + 1)
                  .flatMap((item) => visitsByStart.get(item.start) ?? [])
              : bookedHere
            return (
              <div
                key={slot.start}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-border/70 py-3 last:border-b-0"
              >
                <div className="pt-1 text-xs tabular-nums text-muted-foreground">
                  {formatClockInIanaZone(slot.start, timezone)}
                  {showOverrideBlock && coveredCount > 1 ? (
                    <>
                      <br />
                      {formatClockInIanaZone(rows[lastCovered].start, timezone)}
                    </>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  {showOverrideBlock ? (
                    <div
                      className="flex items-center justify-between gap-3 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
                      style={{ minHeight: `${Math.max(coveredCount, 1) * 2.25}rem` }}
                    >
                      <span>{overrideLabel(override)}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={removing}
                        onClick={onRemoveOverride}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                  {visitsInRange.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => onOpen(row.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-md bg-sky-100 px-3 py-2 text-left text-sm text-sky-950 hover:bg-sky-200/80 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-950/70"
                    >
                      <span className="min-w-0 truncate">
                        {row.vehicle?.registrationNumber ?? 'Vehicle'}
                        {' · '}
                        {customerDisplayName(row.customer)}
                      </span>
                      <AppointmentStatusBadge status={row.status} />
                    </button>
                  ))}
                  {!showOverrideBlock && bookedHere.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {slot.available} open · {slot.booked}/{slot.capacity} booked
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
