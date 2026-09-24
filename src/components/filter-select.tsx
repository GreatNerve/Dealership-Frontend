import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FilterSelectItem = {
  value: string
  label: string
}

type Props = {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  items: FilterSelectItem[]
}

export function FilterSelect({ id, label, value, onValueChange, items }: Props) {
  return (
    <Field className="w-auto gap-1">
      <FieldLabel htmlFor={id} className="text-[11px] text-muted-foreground">
        {label}
      </FieldLabel>
      <Select
        value={value}
        items={items}
        onValueChange={(next) => {
          if (next) onValueChange(next)
        }}
      >
        <SelectTrigger id={id} className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} side="bottom">
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
