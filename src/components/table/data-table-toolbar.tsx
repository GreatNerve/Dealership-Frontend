import type { Table } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

type Props<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchValue: string
  onSearchValueChange: (value: string) => void
  isFetching?: boolean
  toolbarContent?: ReactNode
  showFilter?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchValueChange,
  isFetching,
  toolbarContent,
  showFilter = false,
}: Props<TData>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
      <div className="min-w-[200px] flex-1">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          className="max-w-xl min-w-[150px] border-border bg-background shadow-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
          aria-label="Search table"
        />
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-4 sm:w-auto">
        {showFilter ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
            disabled
          >
            <ListFilter className="size-4" />
            Filter
          </Button>
        ) : null}
        {toolbarContent}
        <DataTableViewOptions table={table} isFetching={isFetching} />
      </div>
    </div>
  )
}
