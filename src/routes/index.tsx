import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/lib/auth'
import { AuthLayout } from '@/layouts/auth-layout'
import { AppLayout } from '@/layouts/app-layout'
import { LoginPage } from '@/pages/login'
import { RegisterChooserPage } from '@/pages/register-chooser'
import { RegisterCustomerPage } from '@/pages/register-customer'
import { RegisterDealershipPage } from '@/pages/register-dealership'
import { AppointmentsPage } from '@/pages/appointments'
import { AppointmentDetailPage } from '@/pages/appointment-detail'
import { DashboardPage } from '@/pages/dashboard'
import { DealershipsPage } from '@/pages/dealerships'
import { CalendarPage } from '@/pages/calendar'
import { NotificationsPage } from '@/pages/notifications'
import { NotificationDetailPage } from '@/pages/notification-detail'
import { VehiclesPage } from '@/pages/vehicles'
import { ProfilePage } from '@/pages/profile'
import { Spinner } from '@/components/ui/spinner'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout />
}

export function AppRouter() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterChooserPage />} />
              <Route path="/register/customer" element={<RegisterCustomerPage />} />
              <Route path="/register/dealership" element={<RegisterDealershipPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/appointments" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/:id" element={<NotificationDetailPage />} />
              <Route path="/customers" element={<Navigate to="/appointments" replace />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/dealerships" element={<DealershipsPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster richColors closeButton position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
