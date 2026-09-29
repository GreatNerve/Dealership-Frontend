import { format, parseISO, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { todayYmd } from '@/lib/format-datetime'

type Props = {
  fromYmd: string
  toYmd: string
  onFromYmd: (value: string) => void
  onToYmd: (value: string) => void
  timeZone: string
  label?: string
  showToday?: boolean
}

function ymdToDate(ymd: string): Date | undefined {
  if (!ymd) return undefined
  const d = parseISO(`${ymd}T12:00:00`)
  return isValid(d) ? d : undefined
}

function dateToYmd(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function rangeLabel(fromYmd: string, toYmd: string): string {
  const from = ymdToDate(fromYmd)
  const to = ymdToDate(toYmd)
  if (!from && !to) return 'Pick dates'
  if (from && to && fromYmd === toYmd) return format(from, 'dd MMM yyyy')
  if (from && to) {
    return `${format(from, 'dd MMM')} - ${format(to, 'dd MMM yyyy')}`
  }
  if (from) return `From ${format(from, 'dd MMM yyyy')}`
  if (to) return `To ${format(to, 'dd MMM yyyy')}`
  return 'Pick dates'
}

export function InstantDateRange({
  fromYmd,
  toYmd,
  onFromYmd,
  onToYmd,
  timeZone,
  label = 'Dates',
  showToday = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = useMemo<DateRange | undefined>(() => {
    const from = ymdToDate(fromYmd)
    const to = ymdToDate(toYmd)
    if (!from && !to) return undefined
    return { from, to: to ?? from }
  }, [fromYmd, toYmd])

  const [month, setMonth] = useState<Date | undefined>(
    () => selected?.to ?? selected?.from ?? new Date(),
  )

  const display = rangeLabel(fromYmd, toYmd)
  const hasValue = !!(fromYmd || toYmd)

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field className="w-auto gap-1">
        <FieldLabel className="text-[11px] text-muted-foreground">{label}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            'flex h-8 min-w-44 items-center justify-start gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm whitespace-nowrap outline-none select-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50',
            !hasValue && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span className="truncate">{display}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
          <div className="p-2 [--cell-size:2rem]">
            <Calendar
              className="mx-auto p-0 text-sm"
              mode="range"
              selected={selected}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              numberOfMonths={1}
              classNames={{
                today:
                  'rounded-md bg-transparent font-medium text-foreground ring-1 ring-border',
              }}
              components={{
                DayButton: (props) => (
                  <CalendarDayButton
                    {...props}
                    className={cn(
                      props.className,
                      'data-[range-start=true]:rounded-md data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:bg-foreground data-[range-end=true]:bg-foreground data-[range-middle=true]:bg-muted data-[range-start=true]:text-background data-[range-end=true]:text-background',
                    )}
                  />
                ),
              }}
              onSelect={(range) => {
                if (!range) {
                  onFromYmd('')
                  onToYmd('')
                  return
                }
                if (range.from) onFromYmd(dateToYmd(range.from))
                else onFromYmd('')
                if (range.to) onToYmd(dateToYmd(range.to))
                else if (range.from) onToYmd(dateToYmd(range.from))
                else onToYmd('')
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border px-2 py-1.5">
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
        </Popover>
      </Field>
      {showToday ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            const today = todayYmd(timeZone)
            onFromYmd(today)
            onToYmd(today)
          }}
        >
          Today
        </Button>
      ) : null}
    </div>
  )
}
