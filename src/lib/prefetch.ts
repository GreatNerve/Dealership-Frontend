import type { QueryClient } from '@tanstack/react-query'
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

/** Hover Create appointment — warm vehicles + dealerships. */
export function prefetchBookSources(qc: QueryClient) {
  void qc.prefetchQuery({
    queryKey: ['vehicles', 'book'],
    queryFn: () => apiGet<Page<Vehicle>>('/api/v1/vehicles', { size: 100 }),
  })
  void qc.prefetchQuery({
    queryKey: ['dealerships'],
    queryFn: () => apiGet<Page<Dealership>>('/api/v1/dealerships', { size: 100 }),
  })
}

/** Hover appointment row — warm detail (and staff reminder/mail). */
export function prefetchAppointmentDetail(
  qc: QueryClient,
  userId: string,
  appointmentId: string,
  staff: boolean,
) {
  void qc.prefetchQuery({
    queryKey: ['appointment', userId, appointmentId],
    queryFn: () => apiGet<Appointment>(`/api/v1/appointments/${appointmentId}`),
  })
  if (!staff) return
  void qc.prefetchQuery({
    queryKey: ['reminders', userId, appointmentId],
    queryFn: () =>
      apiGet<ReminderItem[]>(`/api/v1/appointments/${appointmentId}/reminders`),
  })
  void qc.prefetchQuery({
    queryKey: ['notifications', userId, appointmentId],
    queryFn: () => loadAppointmentMails(appointmentId),
  })
}

/** Hover notification row — warm detail. */
export function prefetchNotificationDetail(
  qc: QueryClient,
  userId: string,
  notificationId: string,
) {
  void qc.prefetchQuery({
    queryKey: ['notification', userId, notificationId],
    queryFn: () => apiGet<Notification>(`/api/v1/notifications/${notificationId}`),
  })
}
