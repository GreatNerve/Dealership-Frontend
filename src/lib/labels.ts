import type { CustomerSummary, Dealership, Vehicle } from './types'

export function vehicleLabel(v: Vehicle) {
  return `${v.registrationNumber} - ${v.year} ${v.make} ${v.model}`
}

export function dealershipLabel(d: Dealership) {
  return d.name
}

export function dealershipSubline(d: Dealership) {
  return d.address
}

export function customerDisplayName(c: CustomerSummary | null | undefined): string {
  if (!c) return '—'
  const name = c.name?.trim()
  if (name) return name
  return 'Customer'
}

export function customerContactEmail(c: CustomerSummary | null | undefined): string | null {
  if (!c?.contact) return null
  const contact = c.contact.trim()
  if (!contact.includes('@')) return null
  return contact
}
