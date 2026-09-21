export type ApiEnvelope<T> = {
  success: boolean
  data: T
  error: string | null
  message: string | null
  correlationId: string
}

export type Role = 'CUSTOMER' | 'DEALERSHIP_STAFF'

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'

export type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type User = {
  id: string
  email: string
  name: string | null
  role: Role
  homeDealershipId: string | null
  customerId: string | null
  homeDealership: Dealership | null
  customer: CustomerSummary | null
}

export type CustomerSummary = {
  id: string
  contact: string
  name: string | null
}

export type Dealership = {
  id: string
  name: string
  timezone: string
  address: string
}

export type Vehicle = {
  id: string
  customerId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  customer: CustomerSummary | null
}

export type Customer = {
  id: string
  contact: string
  name: string | null
  vehicles: Vehicle[]
}

export type Appointment = {
  id: string
  customerId: string
  vehicleId: string
  dealershipId: string
  customer: CustomerSummary | null
  vehicle: Vehicle | null
  dealership: Dealership | null
  scheduledAt: string
  displayOffset: string
  scheduledAtLocal: string
  status: AppointmentStatus
  createdByRole: Role
  notify: boolean
}

export type ReminderItem = {
  offsetMinutes: number
  dueAt: string
  reminderStatus: string
  notification: {
    id: string | null
    status: string
    attempts: number
    lastError: string | null
    sentAt: string | null
    nextAttemptAt: string | null
  }
}

export type Page<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
