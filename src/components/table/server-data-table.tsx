import { useQuery } from '@tanstack/react-query'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useEffect, useState, type ReactNode } from 'react'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Page } from '@/lib/types'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTable } from './data-table'

type Props<TData> = {
  queryKey: string
  path: string
  columns: ColumnDef<TData, unknown>[]
  searchPlaceholder?: string
  emptyMessage?: string
  initialPageSize?: number
  onRowClick?: (row: TData) => void
  renderMobileCard?: (row: TData) => ReactNode
  getRowId?: (row: TData) => string
  enabled?: boolean
}

export function ServerDataTable<TData>({
  queryKey,
  path,
  columns,
  searchPlaceholder,
  emptyMessage,
  initialPageSize = 10,
  onRowClick,
  renderMobileCard,
  getRowId,
  enabled = true,
}: Props<TData>) {
  const { user } = useAuth()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue, 400)

  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }))
  }, [debouncedSearch])

  const fetchQuery = useQuery({
    queryKey: [queryKey, user?.id, pagination.pageIndex, pagination.pageSize, debouncedSearch],
    enabled: enabled && !!user,
    queryFn: () =>
      apiGet<Page<TData>>(path, {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        q: debouncedSearch.trim() || undefined,
      }),
  })

  const page = fetchQuery.data
  const items = page?.items ?? []
  const rowCount = page?.totalElements ?? 0
  const pageCount = page?.totalPages ?? 0

  if (fetchQuery.isError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Failed to load data. Check that the API is running.
      </p>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      rowCount={rowCount}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={setPagination}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      searchPlaceholder={searchPlaceholder}
      isLoading={fetchQuery.isLoading}
      isFetching={fetchQuery.isFetching}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
      renderMobileCard={renderMobileCard}
      getRowId={getRowId}
    />
  )
}
