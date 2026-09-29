import { Link, useLocation } from 'react-router-dom'

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  notifications: 'Notifications',
  customers: 'Customers',
  calendar: 'Calendar',
  dealerships: 'My dealership',
  vehicles: 'My vehicles',
  profile: 'Profile',
}

export function PageHeader() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const page = segments[0] ?? 'appointments'
  const label = labels[page] ?? 'Dashboard'
  const isAppointmentDetail = page === 'appointments' && segments.length > 1
  const isNotificationDetail = page === 'notifications' && segments.length > 1

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/appointments" className="transition-colors hover:text-foreground">
        Home
      </Link>
      <span aria-hidden>/</span>
      {isAppointmentDetail ? (
        <>
          <Link to="/appointments" className="transition-colors hover:text-foreground">
            Appointments
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-foreground">Detail</span>
        </>
      ) : isNotificationDetail ? (
        <>
          <Link to="/notifications" className="transition-colors hover:text-foreground">
            Notifications
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-foreground">Detail</span>
        </>
      ) : (
        <span className="font-medium text-foreground">{label}</span>
      )}
    </nav>
  )
}
