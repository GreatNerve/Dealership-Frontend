import { Building2, CalendarDays, Car, LogOut, Users } from 'lucide-react'
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
          <SidebarHeader className="h-14 border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <AppLogo className="size-9 shrink-0" />
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
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
                    <>
                      <NavItem to="/customers" tooltip="Customer directory">
                        <Users />
                        <span>Customers</span>
                      </NavItem>
                      <NavItem to="/dealerships" tooltip="My dealership">
                        <Building2 />
                        <span>My dealership</span>
                      </NavItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
              {user ? (
                <UserAvatar
                  seed={user.id}
                  size={36}
                  className="size-9"
                  alt={user.name?.trim() || user.email}
                />
              ) : (
                <div className="size-9 shrink-0 rounded-lg bg-muted ring-1 ring-border" aria-hidden />
              )}
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{user?.name?.trim() || 'Signed in'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {staff ? 'Dealership staff' : 'Customer'}
                </p>
              </div>
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
        <SidebarInset className="max-w-full min-h-0 min-w-0 flex flex-1 flex-col overflow-x-auto overflow-y-hidden bg-background">
          <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 border-b border-border bg-background px-4">
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
