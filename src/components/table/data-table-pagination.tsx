import type { Table } from '@tanstack/react-table'
import type { PaginationState } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PAGE_SIZES = [10, 20, 50, 100] as const

type Props<TData> = {
  table: Table<TData>
  pagination: PaginationState
  onPaginationChange: (state: PaginationState) => void
  rowCount?: number
}

export function DataTablePagination<TData>({
  table,
  pagination,
  onPaginationChange,
  rowCount,
}: Props<TData>) {
  const { pageIndex, pageSize } = pagination
  const pageCount = table.getPageCount()
  const total = rowCount ?? table.getFilteredRowModel().rows.length

  const pageSizeOptions = useMemo(() => {
    const set = new Set<number>(PAGE_SIZES)
    set.add(pageSize)
    return [...set].sort((a, b) => a - b)
  }, [pageSize])

  const sizeItems = useMemo(
    () => pageSizeOptions.map((size) => ({ value: String(size), label: String(size) })),
    [pageSizeOptions],
  )

  const handlePageSizeChange = (newSize: string | null) => {
    if (!newSize) return
    const next = Number(newSize)
    if (!Number.isFinite(next) || next < 1) return
    onPaginationChange({ pageIndex: 0, pageSize: next })
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 py-2">
      <p className="text-sm text-muted-foreground">
        {total} row{total === 1 ? '' : 's'}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="text-sm text-muted-foreground">
          Page <span>{pageCount === 0 ? 0 : pageIndex + 1}</span> of{' '}
          <span>{pageCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            items={sizeItems}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-20 border-border shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="border border-border"
            disabled={!table.getCanPreviousPage()}
            onClick={() =>
              onPaginationChange({ ...pagination, pageIndex: pageIndex - 1 })
            }
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="border border-border"
            disabled={!table.getCanNextPage()}
            onClick={() =>
              onPaginationChange({ ...pagination, pageIndex: pageIndex + 1 })
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
