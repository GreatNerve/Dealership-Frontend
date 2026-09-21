const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY

/** Display config offsets (e.g. 1440 → 1 day, 120 → 2 hr) like APP_REMINDER_OFFSETS. */
export function formatOffsetMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return '—'
  if (minutes === 0) return 'At appointment'

  if (minutes % MINUTES_PER_WEEK === 0) {
    const n = minutes / MINUTES_PER_WEEK
    return n === 1 ? '1 week' : `${n} weeks`
  }
  if (minutes % MINUTES_PER_DAY === 0) {
    const n = minutes / MINUTES_PER_DAY
    return n === 1 ? '1 day' : `${n} days`
  }
  if (minutes % MINUTES_PER_HOUR === 0) {
    const n = minutes / MINUTES_PER_HOUR
    return n === 1 ? '1 hr' : `${n} hr`
  }
  return `${minutes} min`
}
