import type { Appointment } from './types'
import { formatAppointmentScheduled } from './format-datetime'

export type MailTemplateKey = 'visit-again' | 'feedback' | 'missed' | 'upcoming'

export const MAIL_TEMPLATES: { key: MailTemplateKey; label: string }[] = [
  { key: 'visit-again', label: 'Visit us again' },
  { key: 'feedback', label: 'How was your visit?' },
  { key: 'missed', label: 'We missed you' },
  { key: 'upcoming', label: 'Visit reminder' },
]

export function hydrateMailTemplate(
  key: MailTemplateKey,
  appointment: Appointment,
): { subject: string; body: string } {
  const shop = appointment.dealership?.name?.trim() || 'our shop'
  const plate = appointment.vehicle?.registrationNumber?.trim() || 'your vehicle'
  const when = formatAppointmentScheduled(
    appointment.scheduledAt,
    appointment.scheduledAtLocal,
  )
  const name = appointment.customer?.name?.trim()
  const greeting = name ? `Hi ${name},\n\n` : ''

  if (key === 'feedback') {
    return {
      subject: `How was your visit to ${shop}?`,
      body:
        `${greeting}How was your service visit for ${plate} on ${when}?\n\n` +
        `Reply to this email if we can help.\n\n${shop}`,
    }
  }

  if (key === 'missed') {
    return {
      subject: `We missed you at ${shop}`,
      body:
        `${greeting}We had ${plate} booked for ${when} and did not see you.\n\n` +
        `Reply to this email if you would like to book again.\n\n${shop}`,
    }
  }

  if (key === 'upcoming') {
    return {
      subject: `Reminder: ${plate} at ${shop}`,
      body:
        `${greeting}This is a reminder that ${plate} is booked at ${shop} on ${when}.\n\n` +
        `Reply if you need to change the time.\n\n${shop}`,
    }
  }

  return {
    subject: `We hope to see you again at ${shop}`,
    body:
      `${greeting}Thank you for bringing ${plate} in on ${when}.\n\n` +
      `We would be glad to see you again at ${shop} for your next service.\n\n${shop}`,
  }
}
