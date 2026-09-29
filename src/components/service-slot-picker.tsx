import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import {
  formatClockInIanaZone,
  shiftYmd,
  todayYmd,
  zonedDayRange,
} from '@/lib/format-datetime'
import type { DealershipSchedule, ServiceSlotsPage } from '@/lib/types'
import { Calendar } from '@/components/ui/calendar'
import { cn } from 'cn'

type Props = {
  dealershipId: string
  timezone: string
  value: string | null
  onChange: (start: string | null) => void
  allowUnavailable?: boolean
  constrainWindow?: boolean
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function ServiceSlotPicker({
  dealershipId,
  timezone,
  value,
  onChange,
  allowUnavailable = false,
  constrainWindow = true,
}: Props) {
  const schedule = useQuery({
    queryKey: ['dealership-schedule', dealershipId],
    enabled: !!dealershipId,
    queryFn: () => apiGet<DealershipSchedule>(`/api/v1/dealerships/${dealershipId}/schedule`),
  })

  const today = todayYmd(timezone)
  const last = shiftYmd(today, schedule.data?.maxAdvanceDays ?? 15)
  const [day, setDay] = useState(today)

  const range = useMemo(() => zonedDayRange(day, day, timezone), [day, timezone])

  const slots = useQuery({
    queryKey: ['dealership-slots', dealershipId, range.from, range.to],
    enabled: !!dealershipId && !!range.from,
    queryFn: () =>
      apiGet<ServiceSlotsPage>(`/api/v1/dealerships/${dealershipId}/slots`, {
        from: range.from,
        to: range.to,
      }),
  })

  const items = slots.data?.items ?? []
  const minDate = parseYmd(today)
  const maxDate = parseYmd(last)

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
      <Calendar
        mode="single"
        selected={parseYmd(day)}
        onSelect={(date) => {
          if (!date) return
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          setDay(`${y}-${m}-${d}`)
          onChange(null)
        }}
        disabled={
          constrainWindow
            ? (date) => date < minDate || date > maxDate
            : undefined
        }
        captionLayout="dropdown"
      />
      <div className="min-w-0">
        <p className="mb-2 text-sm text-muted-foreground">
          {items.length === 0
            ? 'No Service Slots this day.'
            : 'Choose a Service Slot. Unavailable times are crossed out.'}
        </p>
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {items.map((slot) => {
            const open = slot.available > 0
            const selectable = open || allowUnavailable
            const selected = value === slot.start
            const label = formatClockInIanaZone(slot.start, timezone)
            return (
              <button
                key={slot.start}
                type="button"
                disabled={!selectable}
                onClick={() => onChange(slot.start)}
                className={cn(
                  'flex min-h-12 flex-col items-start justify-center rounded-lg border px-3 py-2 text-left',
                  selected && 'border-foreground bg-muted',
                  !open && 'text-muted-foreground line-through',
                  selectable ? 'hover:bg-muted/60' : 'cursor-not-allowed opacity-60',
                )}
              >
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {slot.booked}/{slot.capacity} booked
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
