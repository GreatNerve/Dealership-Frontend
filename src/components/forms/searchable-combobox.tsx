import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from 'cn'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type ComboboxOption = {
  value: string
  label: string
  description?: string
}

type Props = {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function SearchableCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const triggerWrapRef = useRef<HTMLDivElement>(null)
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>()

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  )

  useLayoutEffect(() => {
    if (!open) return
    const el = triggerWrapRef.current
    if (!el) return
    setTriggerWidth(el.getBoundingClientRect().width)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div ref={triggerWrapRef} className="w-full">
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm font-normal shadow-none transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span className={cn('min-w-0 truncate', !selected && 'text-muted-foreground')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
      </div>
      <PopoverContent
        data-slot="combobox-content"
        align="start"
        side="bottom"
        sideOffset={8}
        className="z-[200] w-[var(--anchor-width)] min-w-[var(--anchor-width)] gap-0 overflow-hidden p-0"
        style={
          triggerWidth
            ? { width: triggerWidth, minWidth: triggerWidth }
            : undefined
        }
      >
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-60">
            <CommandEmpty className="py-4 text-sm">{emptyText}</CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => {
                const isSelected = value === option.value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={
                      option.description
                        ? [option.label, option.description]
                        : [option.label]
                    }
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className="gap-2 px-2 py-2"
                  >
                    <CheckIcon
                      className={cn(
                        'size-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex min-w-0 flex-1 flex-col text-left">
                      <span className="truncate">{option.label}</span>
                      {option.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
