import { format, isValid } from 'date-fns'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DISPLAY_DATETIME_FORMAT } from '@/lib/format-datetime'
import { dateToDatetimeLocal } from '@/lib/schedule'

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Block calendar days before today (local). */
  disablePast?: boolean
}

const DISPLAY_FORMAT = DISPLAY_DATETIME_FORMAT.replace(' a', ' aa')
const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1).padStart(2, '0'),
}))
const MINUTE_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5
  return { value: String(m), label: String(m).padStart(2, '0') }
})

function fromDatetimeLocal(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return isValid(d) ? d : undefined
}

function to12hParts(d: Date) {
  const h24 = d.getHours()
  const ampm: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12
  const minute = d.getMinutes()
  return { hour12, minute, ampm }
}

function snapMinute(m: number) {
  return Math.min(55, Math.round(m / 5) * 5)
}

function applyTime(base: Date, hour12: number, minute: number, ampm: 'AM' | 'PM') {
  const next = new Date(base)
  let h = hour12 % 12
  if (ampm === 'PM') h += 12
  next.setHours(h, minute, 0, 0)
  return next
}

export function DateTimePickerField({
  id = 'scheduled-at',
  value,
  onChange,
  disabled,
  disablePast = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => fromDatetimeLocal(value), [value])
  const [month, setMonth] = useState<Date | undefined>(selected)
  const [draft, setDraft] = useState<Date | undefined>(selected)

  useEffect(() => {
    setDraft(selected)
    setMonth(selected)
  }, [selected])

  const parts = draft
    ? { ...to12hParts(draft), minute: snapMinute(to12hParts(draft).minute) }
    : { hour12: 9, minute: 0, ampm: 'AM' as const }

  const updateDraft = (next: Date) => {
    setDraft(next)
    onChange(dateToDatetimeLocal(next))
  }

  const display = selected ? format(selected, DISPLAY_FORMAT) : 'Pick date and time'
  const preview = draft ? format(draft, DISPLAY_FORMAT.replace(' a', ' aa')) : 'Pick a date and time'
  const startOfToday = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  return (
    <Field>
      <FieldLabel htmlFor={id}>Date and time</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            'inline-flex h-9 w-full items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm font-normal shadow-none hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          <span className="truncate">{display}</span>
        </PopoverTrigger>
        <PopoverContent
          className="z-[200] w-auto max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <div className="p-2 pb-0 [--cell-size:2rem]">
            <Calendar
              className="mx-auto p-0 text-sm"
              mode="single"
              selected={draft}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              disabled={disablePast ? { before: startOfToday } : undefined}
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
                      'data-[selected-single=true]:bg-foreground data-[selected-single=true]:font-medium data-[selected-single=true]:text-background data-[selected-single=true]:hover:bg-foreground data-[selected-single=true]:hover:text-background',
                    )}
                  />
                ),
              }}
              onSelect={(day) => {
                if (!day) return
                const base = draft ?? new Date()
                const merged = new Date(day)
                merged.setHours(base.getHours(), base.getMinutes(), 0, 0)
                updateDraft(merged)
              }}
            />
          </div>

          <div className="mx-2 mb-2 space-y-1.5 rounded-md border border-border bg-muted/30 p-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <ClockIcon className="size-3" />
              Time
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
              <div className="space-y-0.5">
                <Label className="text-[11px] text-muted-foreground">Hour</Label>
                <Select
                  value={String(parts.hour12)}
                  items={HOUR_ITEMS}
                  onValueChange={(v) => {
                    const base = draft ?? new Date()
                    updateDraft(applyTime(base, Number(v), parts.minute, parts.ampm))
                  }}
                >
                  <SelectTrigger className="h-8 w-full text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_ITEMS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[11px] text-muted-foreground">Minute</Label>
                <Select
                  value={String(parts.minute)}
                  items={MINUTE_ITEMS}
                  onValueChange={(v) => {
                    const base = draft ?? new Date()
                    updateDraft(applyTime(base, parts.hour12, Number(v), parts.ampm))
                  }}
                >
                  <SelectTrigger className="h-8 w-full text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTE_ITEMS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label className="text-[11px] text-muted-foreground">Period</Label>
                <div className="flex h-8 rounded-md border border-input bg-background p-0.5">
                  {(['AM', 'PM'] as const).map((ampm) => (
                    <button
                      key={ampm}
                      type="button"
                      className={cn(
                        'min-w-10 rounded-md px-2 text-xs font-medium transition-colors',
                        parts.ampm === ampm
                          ? 'bg-muted text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => {
                        const base = draft ?? new Date()
                        updateDraft(applyTime(base, parts.hour12, parts.minute, ampm))
                      }}
                    >
                      {ampm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-2 py-1.5">
            <p className="min-w-0 truncate text-[11px] text-muted-foreground">{preview}</p>
            <Button type="button" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  )
}
