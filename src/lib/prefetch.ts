import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type {
  Appointment,
  Dealership,
  Notification,
  Page,
  ReminderItem,
  Vehicle,
} from '@/lib/types'

/** Same hydrate as appointment detail — list rows often omit events. */
export async function loadAppointmentMails(appointmentId: string) {
  const page = await apiGet<Page<Notification>>('/api/v1/notifications', {
    appointmentId,
    size: 100,
  })
  const items = await Promise.all(
    page.items.map((row) =>
      row.events?.length
        ? Promise.resolve(row)
        : apiGet<Notification>(`/api/v1/notifications/${row.id}`).catch(() => row),
    ),
  )
  return { ...page, items }
}

/** Drop failed prefetch so a 429 does not poison the next navigation. */
function softPrefetch<T>(
  qc: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
) {
  if (qc.getQueryData(queryKey) != null) return
  const state = qc.getQueryState(queryKey)
  if (state?.fetchStatus === 'fetching') return
  void qc.prefetchQuery({ queryKey, queryFn }).catch(() => {
    qc.removeQueries({ queryKey, exact: true })
  })
}

/** Hover Create appointment — warm vehicles + dealerships. */
export function prefetchBookSources(qc: QueryClient) {
  softPrefetch(qc, ['vehicles', 'book'], () =>
    apiGet<Page<Vehicle>>('/api/v1/vehicles', { size: 100 }),
  )
  softPrefetch(qc, ['dealerships'], () =>
    apiGet<Page<Dealership>>('/api/v1/dealerships', { size: 100 }),
  )
}

/**
 * Hover appointment row — warm detail (+ reminders for staff).
 * Skip mail hydrate on hover: that N+1 burns the 15/60s prod rate limit.
 */
export function prefetchAppointmentDetail(
  qc: QueryClient,
  userId: string,
  appointmentId: string,
  staff: boolean,
) {
  softPrefetch(qc, ['appointment', userId, appointmentId], () =>
    apiGet<Appointment>(`/api/v1/appointments/${appointmentId}`),
  )
  if (!staff) return
  softPrefetch(qc, ['reminders', userId, appointmentId], () =>
    apiGet<ReminderItem[]>(`/api/v1/appointments/${appointmentId}/reminders`),
  )
}

/** Hover notification row — warm detail. */
export function prefetchNotificationDetail(
  qc: QueryClient,
  userId: string,
  notificationId: string,
) {
  softPrefetch(qc, ['notification', userId, notificationId], () =>
    apiGet<Notification>(`/api/v1/notifications/${notificationId}`),
  )
}
