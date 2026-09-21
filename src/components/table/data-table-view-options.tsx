import type { Table } from '@tanstack/react-table'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from 'cn'

type Props<TData> = {
  table: Table<TData>
  isFetching?: boolean
}

export function DataTableViewOptions<TData>({ table, isFetching }: Props<TData>) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <SlidersHorizontal className="size-4 shrink-0" />
          View
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {(column.columnDef.meta as { title?: string } | undefined)?.title ??
                    column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {isFetching ? (
        <div className="flex items-center p-1">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="sr-only">Loading</span>
        </div>
      ) : null}
    </div>
  )
}
