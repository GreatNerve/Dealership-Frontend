import { format, isValid, parseISO } from 'date-fns'

/** Shared visit / send time label (e.g. `22 Sep 2026, 2:45 AM`). */
export const DISPLAY_DATETIME_FORMAT = 'dd MMM yyyy, h:mm a'

function formatWallClockDate(year: number, month: number, day: number, hour: number, minute: number) {
  const dt = new Date(year, month - 1, day, hour, minute)
  return format(dt, DISPLAY_DATETIME_FORMAT)
}

/** Wall clock from API `scheduledAtLocal` (ISO with offset) — no browser TZ shift. */
export function formatWallClockFromIsoOffset(iso: string): string | null {
  const m = iso.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
  )
  if (!m) return null
  return formatWallClockDate(
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
  )
}

function formatInstantWithIntl(isoUtc: string, timeZone: string): string | null {
  const instant = parseISO(isoUtc)
  if (!isValid(instant)) return null
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(instant)
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? ''
    const dayPeriod = get('dayPeriod').toUpperCase()
    const month = get('month').replace('Sept', 'Sep')
    const day = Number(get('day'))
    const hour = Number(get('hour'))
    const minute = Number(get('minute'))
    const year = Number(get('year'))
    if (!dayPeriod || !month || !year) return null
    return formatWallClockDate(year, monthNameToNumber(month), day, to24Hour(hour, dayPeriod), minute)
  } catch {
    return null
  }
}

function monthNameToNumber(short: string): number {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const idx = months.findIndex((m) => short.startsWith(m))
  return idx >= 0 ? idx + 1 : 1
}

function to24Hour(hour12: number, dayPeriod: string): number {
  const pm = dayPeriod.toUpperCase() === 'PM'
  if (hour12 === 12) return pm ? 12 : 0
  return pm ? hour12 + 12 : hour12
}

/** Staff reminder `dueAt` (UTC instant) in Dealership IANA timezone. */
export function formatInstantInIanaZone(isoUtc: string, ianaZone: string): string {
  const formatted = formatInstantWithIntl(isoUtc, ianaZone)
  if (formatted) return formatted
  return formatWallClockFromIsoOffset(isoUtc) ?? isoUtc
}

/** Delivery Event `occurredAt`. Year ~58699 means millis were stored as seconds. */
export function providerOccurredAtIso(isoUtc: string): string {
  const padded = isoUtc.replace(/^\+(\d{5})-/, '+0$1-')
  const ms = Date.parse(padded)
  if (Number.isFinite(ms) && ms > Date.parse('2100-01-01T00:00:00Z')) {
    return new Date(ms / 1000).toISOString()
  }
  return isoUtc
}

export function formatProviderOccurredAt(isoUtc: string, ianaZone: string): string {
  return formatInstantInIanaZone(providerOccurredAtIso(isoUtc), ianaZone)
}

export function formatBookingOffsetLabel(displayOffset: string): string {
  const trimmed = displayOffset.trim()
  if (!trimmed) return ''
  if (trimmed === 'Z' || trimmed === '+00:00') return 'UTC'
  return `UTC${trimmed}`
}

/** Prefer canonical IANA id in UI (API may still return legacy alias). */
export function formatTimezoneLabel(iana: string): string {
  if (iana === 'Asia/Calcutta') return 'Asia/Kolkata'
  return iana
}

/** Calendar date in an IANA zone as `YYYY-MM-DD`. */
export function ymdInTimeZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function todayYmd(timeZone: string): string {
  return ymdInTimeZone(new Date(), timeZone)
}

export function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(year, month - 1, day + days))
  return dt.toISOString().slice(0, 10)
}

function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value)
  let hour = num('hour')
  if (hour === 24) hour = 0
  const asUtc = Date.UTC(
    num('year'),
    num('month') - 1,
    num('day'),
    hour,
    num('minute'),
    num('second'),
  )
  return asUtc - date.getTime()
}

/** UTC Instant of a local wall time in an IANA zone. */
export function instantAtZoneLocal(ymd: string, timeZone: string, hm = '00:00:00'): Date {
  const [year, month, day] = ymd.split('-').map(Number)
  const [hour, minute, second] = hm.split(':').map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute || 0, second || 0)
  const first = new Date(utcGuess)
  const adjusted = new Date(utcGuess - zoneOffsetMs(first, timeZone))
  return new Date(utcGuess - zoneOffsetMs(adjusted, timeZone))
}

/** Inclusive local dates → Instant `from` (inclusive) / `to` (exclusive). */
export function zonedDayRange(
  fromYmd: string,
  toYmd: string,
  timeZone: string,
): { from: string; to: string } {
  const from = instantAtZoneLocal(fromYmd, timeZone)
  const to = instantAtZoneLocal(shiftYmd(toYmd, 1), timeZone)
  return { from: from.toISOString(), to: to.toISOString() }
}

export function optionalZonedRange(
  fromYmd: string,
  toYmd: string,
  timeZone: string,
): { from?: string; to?: string } {
  if (fromYmd && toYmd) return zonedDayRange(fromYmd, toYmd, timeZone)
  if (fromYmd) return { from: instantAtZoneLocal(fromYmd, timeZone).toISOString() }
  if (toYmd) {
    return { to: instantAtZoneLocal(shiftYmd(toYmd, 1), timeZone).toISOString() }
  }
  return {}
}

/** List / detail visit time from API `scheduledAtLocal`. */
export function formatAppointmentScheduled(
  scheduledAt: string,
  scheduledAtLocal?: string | null,
): string {
  const local = scheduledAtLocal?.trim()
  if (local) {
    const wall = formatWallClockFromIsoOffset(local)
    if (wall) return wall
  }
  const parsed = parseISO(scheduledAt)
  if (!isValid(parsed)) {
    return local || scheduledAt
  }
  return format(parsed, DISPLAY_DATETIME_FORMAT)
}
