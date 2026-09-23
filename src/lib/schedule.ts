/** API expects ISO-8601 with offset, e.g. 2026-09-22T22:00:00+05:30 */
export function datetimeLocalToApiOffset(value: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const pad = (n: number) => String(n).padStart(2, '0')
  const offMin = -d.getTimezoneOffset()
  const sign = offMin >= 0 ? '+' : '-'
  const abs = Math.abs(offMin)
  const oh = Math.floor(abs / 60)
  const om = abs % 60

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(oh)}:${pad(om)}`
}

export function dateToDatetimeLocal(d: Date): string {
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function defaultDatetimeLocal(hoursFromNow = 24): string {
  const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  d.setSeconds(0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** For datetime-local inputs from an API instant or offset datetime string. */
export function apiToDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const wall = wallClockIsoToDatetimeLocal(iso)
  if (wall) return wall
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * `datetime-local` value from API wall clock (ISO with offset).
 * Avoids shifting visit time when the browser zone differs from booking / dealership.
 */
export function wallClockIsoToDatetimeLocal(isoWithOffset: string): string | null {
  const m = isoWithOffset.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
  )
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`
}

export function timezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'local time'
  }
}

/** True when datetime-local value parses to a time strictly after now. */
export function isFutureDatetimeLocal(value: string, nowMs = Date.now()): boolean {
  if (!value) return false
  const t = new Date(value).getTime()
  return !Number.isNaN(t) && t > nowMs
}

/** Same wall-clock Instant (minute precision) for datetime-local strings. */
export function datetimeLocalSameInstant(a: string, b: string): boolean {
  if (!a || !b) return false
  const ta = new Date(a).getTime()
  const tb = new Date(b).getTime()
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false
  return Math.floor(ta / 60_000) === Math.floor(tb / 60_000)
}
