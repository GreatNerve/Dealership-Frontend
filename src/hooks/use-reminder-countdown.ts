import { useEffect, useState } from 'react'
import type { ReminderItem } from '@/lib/types'
import { formatReminderCountdown, shouldShowReminderCountdown } from '@/lib/reminder-countdown'

const TICK_MS = 30_000

export function useReminderCountdown(item: ReminderItem): string | null {
  const active = shouldShowReminderCountdown(item)
  const [label, setLabel] = useState<string | null>(() =>
    active ? formatReminderCountdown(item.dueAt, item) : null,
  )

  useEffect(() => {
    if (!active) {
      setLabel(null)
      return
    }
    const tick = () => setLabel(formatReminderCountdown(item.dueAt, item))
    tick()
    const id = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(id)
  }, [active, item])

  return label
}
