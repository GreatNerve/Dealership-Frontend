import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState, type ReactNode } from 'react'
import { cn } from 'cn'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

type Props<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  rowCount: number
  pageCount: number
  pagination: PaginationState
  onPaginationChange: (state: PaginationState) => void
  searchValue: string
  onSearchValueChange: (value: string) => void
  searchPlaceholder?: string
  isLoading?: boolean
  isFetching?: boolean
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  onRowHover?: (row: TData) => void
  renderMobileCard?: (row: TData) => ReactNode
  getRowId?: (row: TData) => string
}

export function DataTable<TData>({
  columns,
  data,
  rowCount,
  pageCount,
  pagination,
  onPaginationChange,
  searchValue,
  onSearchValueChange,
  searchPlaceholder,
  isLoading = false,
  isFetching = false,
  emptyMessage = 'No results found.',
  onRowClick,
  onRowHover,
  renderMobileCard,
  getRowId,
}: Props<TData>) {
  const isMobile = useIsMobile()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination, columnVisibility },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      onPaginationChange(next)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount,
  })

  const hasRows = data.length > 0

  return (
    <div className="w-full space-y-3">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchValueChange={onSearchValueChange}
        isFetching={isFetching && hasRows}
      />

      {isMobile && renderMobileCard ? (
        <div className="space-y-3">
          {isLoading &&
            !hasRows &&
            Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={`msk-${i}`} className="h-28 w-full rounded-lg" />
            ))}
          {!isLoading && !hasRows && (
            <p className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
          {!isLoading &&
            hasRows &&
            data.map((row, index) => (
              <div
                key={getRowId?.(row) ?? index}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => onRowHover?.(row)}
                onFocus={() => onRowHover?.(row)}
              >
                {renderMobileCard(row)}
              </div>
            ))}
        </div>
      ) : (
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 border-0 bg-muted/50 px-3 align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading &&
              !hasRows &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`sk-${i}`} className="border-b border-border">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="border-0 px-3 py-3">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && !hasRows && (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 border-0 px-3 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              hasRows &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'border-b border-border last:border-0',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row.original)}
                  onMouseEnter={() => onRowHover?.(row.original)}
                  onFocus={() => onRowHover?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border-0 px-3 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      )}

      <DataTablePagination
        table={table}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowCount={rowCount}
      />
    </div>
  )
}
