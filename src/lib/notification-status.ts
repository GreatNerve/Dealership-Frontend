export function prettyEnum(value: string | null | undefined): string {
  if (!value) return '—'
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function notificationTone(
  status: string,
): 'sent' | 'pending' | 'failed' | 'muted' | 'default' {
  if (status === 'SENT' || status === 'DELIVERED') return 'sent'
  if (status === 'DEAD_LETTER') return 'failed'
  if (status === 'PENDING' || status === 'PROCESSING' || status === 'RETRY_SCHEDULED') {
    return 'pending'
  }
  if (status === 'CANCELLED' || status === 'NOT_SCHEDULED') return 'muted'
  return 'default'
}

export function notificationBadgeClass(status: string): string {
  const tone = notificationTone(status)
  if (tone === 'sent') return 'border-0 bg-emerald-50 font-normal text-emerald-800'
  if (tone === 'pending') return 'border-amber-200 bg-amber-50 font-normal text-amber-900'
  if (tone === 'failed') return 'border-destructive/30 bg-destructive/5 font-normal text-destructive'
  if (tone === 'muted') return 'font-normal text-muted-foreground'
  return 'font-normal'
}

export function deliveryEventBadgeClass(type: string): string {
  switch (type) {
    case 'ACCEPTED':
      return 'border-0 bg-sky-50 font-normal text-sky-800'
    case 'DELIVERED':
      return 'border-0 bg-emerald-50 font-normal text-emerald-800'
    case 'OPENED':
      return 'border-0 bg-amber-50 font-normal text-amber-900'
    case 'CLICKED':
      return 'border-0 bg-violet-50 font-normal text-violet-800'
    case 'SOFT_BOUNCE':
      return 'border-0 bg-orange-50 font-normal text-orange-800'
    case 'HARD_BOUNCE':
      return 'border-0 bg-red-50 font-normal text-red-800'
    case 'BLOCKED':
      return 'border-0 bg-slate-100 font-normal text-slate-700'
    case 'SPAM':
      return 'border-0 bg-fuchsia-50 font-normal text-fuchsia-800'
    case 'ERROR':
      return 'border-0 bg-destructive/10 font-normal text-destructive'
    default:
      return 'font-normal text-muted-foreground'
  }
}
