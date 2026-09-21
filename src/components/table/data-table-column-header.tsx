import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUpDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

type Props<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
  sortable?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  sortable = false,
}: Props<TData, TValue>) {
  const isSorted = sortable ? column.getIsSorted() : false

  if (!sortable) {
    return <span className={cn('text-sm font-medium', className)}>{title}</span>
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 px-2 font-medium"
      onClick={() => column.toggleSorting(isSorted === 'asc')}
    >
      {title}
      {isSorted === 'desc' ? (
        <ArrowDown className="ml-2 size-4" />
      ) : isSorted === 'asc' ? (
        <ArrowUp className="ml-2 size-4" />
      ) : (
        <ArrowUpDown className="ml-2 size-4 text-muted-foreground" />
      )}
    </Button>
  )
}
