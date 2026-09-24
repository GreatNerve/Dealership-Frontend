import type { Appointment, CustomerSummary, Dealership, Notification, Vehicle } from './types'

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

export function appointmentCaption(a: Appointment | null | undefined): {
  name: string
  plate: string | null
  vehicleLine: string | null
} {
  if (!a) {
    return { name: 'View appointment', plate: null, vehicleLine: null }
  }
  const vehicle = a.vehicle
  return {
    name: customerDisplayName(a.customer),
    plate: vehicle?.registrationNumber ?? null,
    vehicleLine: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : null,
  }
}

export function notificationToName(n: Pick<Notification, 'appointment'>): string {
  if (!n.appointment) return '—'
  return customerDisplayName(n.appointment.customer)
}
