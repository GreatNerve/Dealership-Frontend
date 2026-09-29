import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIME_ITEMS = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  return {
    value,
    label: format(new Date(2000, 0, 1, hour, minute), 'h:mm a'),
  }
})

function toValue(raw: string | null): string {
  if (!raw) return ''
  const hm = raw.slice(0, 5)
  return `${hm}:00`
}

type Props = {
  id?: string
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TimeSelect({
  id,
  value,
  onChange,
  disabled,
  placeholder = 'Pick time',
  className,
}: Props) {
  const selected = toValue(value)

  return (
    <Select
      value={selected || undefined}
      items={TIME_ITEMS}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger id={id} className={className ?? 'w-full min-w-28'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} side="bottom">
        <SelectGroup>
          {TIME_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
