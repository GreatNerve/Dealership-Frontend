import { Building2, CalendarDays, Car, LogOut, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/brand/app-logo'
import { UserAvatar } from '@/components/user-avatar'
import { Outlet, useNavigate } from 'react-router-dom'
import { NavItem } from '@/components/layout/nav-item'
import { PageHeader } from '@/components/layout/page-header'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'

/** Shared height for sidebar brand row and main breadcrumb bar */
const APP_TOPBAR_CLASS = 'h-16 shrink-0'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const staff = user?.role === 'DEALERSHIP_STAFF'

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="border-sidebar-border group-data-[side=left]:border-r"
        >
          <SidebarHeader
            className={`${APP_TOPBAR_CLASS} sticky top-0 z-20 gap-0 border-b border-sidebar-border bg-sidebar p-0`}
          >
            <div className={`flex ${APP_TOPBAR_CLASS} w-full items-center gap-2 px-3`}>
              <AppLogo className="size-8 shrink-0" />
              <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">Service Desk</span>
                <span className="truncate text-xs text-muted-foreground">Dealership API</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem to="/appointments" end tooltip="Appointments">
                    <CalendarDays />
                    <span>Appointments</span>
                  </NavItem>
                  {!staff && user?.customerId && (
                    <NavItem to="/vehicles" tooltip="My vehicles">
                      <Car />
                      <span>My vehicles</span>
                    </NavItem>
                  )}
                  {staff && (
                    <NavItem to="/dealerships" tooltip="My dealership">
                      <Building2 />
                      <span>My dealership</span>
                    </NavItem>
                  )}
                  {/* Customer directory UI removed — /customers redirects to appointments. */}
                  <NavItem to="/profile" tooltip="Your profile">
                    <UserCircle />
                    <span>Profile</span>
                  </NavItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
              {user ? (
                <Link
                  to="/profile"
                  className="shrink-0 rounded-lg ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Your profile"
                >
                  <UserAvatar
                    seed={user.id}
                    size={36}
                    className="size-9"
                    alt={user.name?.trim() || user.email}
                  />
                </Link>
              ) : (
                <div className="size-9 shrink-0 rounded-lg bg-muted ring-1 ring-border" aria-hidden />
              )}
              <Link
                to="/profile"
                className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                <p className="truncate text-sm font-medium">{user?.name?.trim() || 'Signed in'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {staff ? 'Dealership staff' : 'Customer'}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 group-data-[collapsible=icon]:hidden"
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                aria-label="Sign out"
              >
                <LogOut />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-w-full min-h-0 min-w-0 flex h-svh flex-1 flex-col overflow-hidden bg-background">
          <header
            className={`sticky top-0 z-50 flex ${APP_TOPBAR_CLASS} w-full items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80`}
          >
            <SidebarTrigger className="-ml-1 shrink-0" />
            <Separator orientation="vertical" className="mx-2 h-8 shrink-0" />
            <PageHeader />
          </header>
          <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-2">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
