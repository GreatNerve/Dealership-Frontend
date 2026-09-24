import type { Notification, ReminderItem } from './types'

const IN_FLIGHT = new Set(['PENDING', 'PROCESSING', 'RETRY_SCHEDULED'])
const WATCH_MS = 5 * 60_000

export function notificationOpened(note?: Pick<Notification, 'opened' | 'events'> | null) {
  if (!note) return false
  return note.opened || (note.events?.some((event) => event.eventType === 'OPENED') ?? false)
}

export function notificationBounced(note?: Pick<Notification, 'bounced' | 'events'> | null) {
  if (!note) return false
  return (
    note.bounced ||
    (note.events?.some(
      (event) =>
        event.eventType === 'SOFT_BOUNCE' ||
        event.eventType === 'HARD_BOUNCE' ||
        event.eventType === 'BLOCKED',
    ) ??
      false)
  )
}

export function watchNotification(note: Notification, now = Date.now()) {
  if (IN_FLIGHT.has(note.status)) return true
  if ((note.status === 'SENT' || note.status === 'DELIVERED') && !notificationOpened(note)) {
    const sent = note.sentAt ? Date.parse(note.sentAt) : NaN
    return Number.isFinite(sent) && now - sent < WATCH_MS
  }
  return false
}

export function watchReminder(item: ReminderItem, note?: Notification, now = Date.now()) {
  if (note && watchNotification(note, now)) return true
  if (item.reminderStatus === 'PROCESSING' || IN_FLIGHT.has(item.notification.status)) {
    return true
  }
  if (item.reminderStatus !== 'PENDING') return false
  const due = Date.parse(item.dueAt)
  return Number.isFinite(due) && Math.abs(due - now) < WATCH_MS
}

export function watchAppointmentMail(items: ReminderItem[], notes: Notification[], now = Date.now()) {
  const byId = new Map(notes.map((note) => [note.id, note]))
  if (notes.some((note) => watchNotification(note, now))) return true
  return items.some((item) =>
    watchReminder(item, item.notification.id ? byId.get(item.notification.id) : undefined, now),
  )
}
