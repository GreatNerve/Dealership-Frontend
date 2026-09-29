import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { CapacityOverride, DealershipSchedule, WeekdayHours } from '@/lib/types'
import { TimeSelect } from '@/components/forms/time-select'
import { InstantDateRange } from '@/components/instant-date-range'
import { DetailPanel } from '@/components/layout/detail-field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { CalendarOff } from 'lucide-react'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function formatTime(value: string | null): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function DealershipSchedulePanel({ dealershipId }: { dealershipId: string }) {
  const { user } = useAuth()
  const tz = user?.homeDealership?.timezone ?? 'UTC'
  const qc = useQueryClient()
  const schedule = useQuery({
    queryKey: ['dealership-schedule', dealershipId],
    queryFn: () => apiGet<DealershipSchedule>(`/api/v1/dealerships/${dealershipId}/schedule`),
  })
  const overrides = useQuery({
    queryKey: ['dealership-overrides', dealershipId],
    queryFn: () => apiGet<CapacityOverride[]>(`/api/v1/dealerships/${dealershipId}/overrides`),
  })

  const [capacity, setCapacity] = useState(10)
  const [hours, setHours] = useState<WeekdayHours[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [limitHours, setLimitHours] = useState(false)
  const [fromTime, setFromTime] = useState('09:00:00')
  const [toTime, setToTime] = useState('18:00:00')
  const [overrideCapacity, setOverrideCapacity] = useState(0)

  useEffect(() => {
    if (!schedule.data) return
    setCapacity(schedule.data.defaultCapacity)
    setHours(schedule.data.hours)
  }, [schedule.data])

  const save = useMutation({
    mutationFn: () =>
      apiPut<DealershipSchedule>(`/api/v1/dealerships/${dealershipId}/schedule`, {
        defaultCapacity: capacity,
        hours,
      }),
    onSuccess: () => {
      toast.success('Schedule saved')
      qc.invalidateQueries({ queryKey: ['dealership-schedule', dealershipId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addOverride = useMutation({
    mutationFn: () =>
      apiPost<CapacityOverride>(`/api/v1/dealerships/${dealershipId}/overrides`, {
        fromDate,
        toDate: toDate || fromDate,
        fromTime: limitHours ? fromTime : null,
        toTime: limitHours ? toTime : null,
        capacity: overrideCapacity,
      }),
    onSuccess: () => {
      toast.success('Override added')
      setFromDate('')
      setToDate('')
      setLimitHours(false)
      qc.invalidateQueries({ queryKey: ['dealership-overrides', dealershipId] })
      qc.invalidateQueries({ queryKey: ['dealership-slots'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const removeOverride = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/dealerships/${dealershipId}/overrides/${id}`),
    onSuccess: () => {
      toast.success('Override removed')
      qc.invalidateQueries({ queryKey: ['dealership-overrides', dealershipId] })
      qc.invalidateQueries({ queryKey: ['dealership-slots'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (schedule.isLoading) {
    return <Skeleton className="mt-6 h-96 w-full rounded-xl" />
  }

  if (!schedule.data) return null

  const overrideRows = overrides.data ?? []

  return (
    <div className="mt-6 grid gap-6">
      <DetailPanel
        title="Service hours"
        description={`Default Slot Capacity applies to every open ${schedule.data.slotDurationMinutes}-minute Service Slot. Customers may book ${schedule.data.maxAdvanceDays} local days ahead.`}
      >
        <FieldGroup>
          <Field className="max-w-xs">
            <FieldLabel htmlFor="default-capacity">Default Slot Capacity</FieldLabel>
            <Input
              id="default-capacity"
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <FieldDescription>Seats per Service Slot when no override applies.</FieldDescription>
          </Field>

          <div className="flex flex-col gap-3">
            {hours.map((row, i) => (
              <div
                key={row.weekday}
                className="grid items-center gap-3 rounded-lg border border-border px-3 py-2.5 sm:grid-cols-[7.5rem_auto_1fr_1fr]"
              >
                <span className="text-sm font-medium">{WEEKDAYS[row.weekday - 1]}</span>
                <Field orientation="horizontal" className="w-auto">
                  <Switch
                    id={`closed-${row.weekday}`}
                    checked={row.closed}
                    onCheckedChange={(closed) => {
                      const next = [...hours]
                      next[i] = {
                        ...row,
                        closed,
                        openTime: closed ? null : row.openTime ?? '09:00:00',
                        closeTime: closed ? null : row.closeTime ?? '18:00:00',
                      }
                      setHours(next)
                    }}
                  />
                  <FieldLabel htmlFor={`closed-${row.weekday}`} className="text-xs text-muted-foreground">
                    Closed
                  </FieldLabel>
                </Field>
                <TimeSelect
                  value={row.openTime}
                  disabled={row.closed}
                  placeholder="Opens"
                  onChange={(openTime) => {
                    const next = [...hours]
                    next[i] = { ...row, openTime }
                    setHours(next)
                  }}
                />
                <TimeSelect
                  value={row.closeTime}
                  disabled={row.closed}
                  placeholder="Closes"
                  onChange={(closeTime) => {
                    const next = [...hours]
                    next[i] = { ...row, closeTime }
                    setHours(next)
                  }}
                />
              </div>
            ))}
          </div>

          <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Spinner data-icon="inline-start" /> : null}
            Save hours
          </Button>
        </FieldGroup>
      </DetailPanel>

      <DetailPanel
        title="Capacity overrides"
        description="Holidays and one-off capacity. Ranges must not overlap. Capacity 0 blocks the window."
      >
        {overrideRows.length === 0 ? (
          <Empty className="mb-4 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarOff />
              </EmptyMedia>
              <EmptyTitle>No overrides</EmptyTitle>
              <EmptyDescription>Add a holiday or a one-off capacity change below.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="mb-4 flex flex-col gap-2">
            {overrideRows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {row.fromDate}
                    {row.toDate !== row.fromDate ? ` to ${row.toDate}` : ''}
                    {row.fromTime ? ` · ${formatTime(row.fromTime)}–${formatTime(row.toTime)}` : ' · all day'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.capacity === 0 ? 'Blocks Customer booking' : `${row.capacity} seats`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={row.capacity === 0 ? 'destructive' : 'outline'}>
                    {row.capacity === 0 ? 'Closed' : row.capacity}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                    disabled={removeOverride.isPending}
                    onClick={() => removeOverride.mutate(row.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <FieldGroup>
          <InstantDateRange
            fromYmd={fromDate}
            toYmd={toDate}
            onFromYmd={setFromDate}
            onToYmd={setToDate}
            timeZone={tz}
            label="Override dates"
            showToday={false}
          />
          <Field orientation="horizontal" className="w-auto">
            <Switch id="limit-hours" checked={limitHours} onCheckedChange={setLimitHours} />
            <FieldLabel htmlFor="limit-hours">Limit to hours</FieldLabel>
          </Field>
          {limitHours ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>From</FieldLabel>
                <TimeSelect value={fromTime} onChange={setFromTime} />
              </Field>
              <Field>
                <FieldLabel>To</FieldLabel>
                <TimeSelect value={toTime} onChange={setToTime} />
              </Field>
            </div>
          ) : null}
          <Field className="max-w-xs">
            <FieldLabel htmlFor="override-capacity">Capacity</FieldLabel>
            <Input
              id="override-capacity"
              type="number"
              min={0}
              value={overrideCapacity}
              onChange={(e) => setOverrideCapacity(Number(e.target.value))}
            />
            <FieldDescription>0 closes the window for Customers.</FieldDescription>
          </Field>
          <Button
            type="button"
            variant="outline"
            disabled={!fromDate || addOverride.isPending}
            onClick={() => addOverride.mutate()}
          >
            {addOverride.isPending ? <Spinner data-icon="inline-start" /> : null}
            Add override
          </Button>
        </FieldGroup>
      </DetailPanel>
    </div>
  )
}
