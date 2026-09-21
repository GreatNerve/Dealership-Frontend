import { formatDistanceToNow, isValid, parseISO } from 'date-fns'
import type { ReminderItem } from './types'
import { reminderDeliveryView } from './reminder-delivery'

export function shouldShowReminderCountdown(item: ReminderItem): boolean {
  const view = reminderDeliveryView(item)
  if (view.tone === 'sent') return false
  if (view.label === 'Cancelled') return false
  if (view.tone === 'failed') return false
  return true
}

/** Relative time until `dueAt` for staff reminder rows (null when not applicable). */
export function formatReminderCountdown(dueAt: string, item: ReminderItem): string | null {
  if (!shouldShowReminderCountdown(item)) return null

  const due = parseISO(dueAt)
  if (!isValid(due)) return null

  const ms = due.getTime() - Date.now()
  if (ms <= 0) {
    const view = reminderDeliveryView(item)
    if (view.tone === 'pending' || item.reminderStatus === 'PROCESSING') {
      return 'Due now — sending soon'
    }
    return null
  }

  return `Sends in ${formatDistanceToNow(due)}`
}
