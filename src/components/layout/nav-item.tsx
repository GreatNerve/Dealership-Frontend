import type { ReactNode } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavItem({
  to,
  end,
  tooltip,
  children,
}: {
  to: string
  end?: boolean
  tooltip: string
  children: ReactNode
}) {
  const match = useMatch({ path: to, end: end ?? false })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={!!match}
        tooltip={tooltip}
        render={<NavLink to={to} end={end} />}
      >
        {children}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
