import type { ReminderItem } from './types'

export type ReminderDeliveryTone = 'sent' | 'pending' | 'muted' | 'failed' | 'default'

export type ReminderDeliveryView = {
  label: string
  tone: ReminderDeliveryTone
}

function pretty(status: string) {
  return status.replace(/_/g, ' ')
}

/** One staff-facing status per offset (notification when present, else reminder queue state). */
export function reminderDeliveryView(
  item: ReminderItem,
  extra?: { opened?: boolean; bounced?: boolean },
): ReminderDeliveryView {
  const notification = item.notification.status
  const reminder = item.reminderStatus

  if (notification === 'DEAD_LETTER') {
    return { label: 'Send failed', tone: 'failed' }
  }

  if (reminder === 'CANCELLED' || notification === 'CANCELLED') {
    return { label: 'Cancelled', tone: 'muted' }
  }

  if (notification === 'NOT_SCHEDULED') {
    if (reminder === 'PENDING' || reminder === 'PROCESSING') {
      return { label: 'Pending', tone: 'pending' }
    }
    if (reminder === 'EXPIRED') {
      return { label: 'Not sent', tone: 'muted' }
    }
    return { label: pretty(reminder), tone: 'muted' }
  }

  if (notification === 'SENT' || notification === 'DELIVERED') {
    if (extra?.bounced) {
      return { label: 'Bounced', tone: 'failed' }
    }
    if (extra?.opened) {
      return { label: 'Opened', tone: 'sent' }
    }
    return { label: pretty(notification), tone: 'sent' }
  }

  return {
    label: pretty(notification),
    tone: 'default',
  }
}
