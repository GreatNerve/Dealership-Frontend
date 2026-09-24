import type { Notification } from '@/lib/types'
import { NotificationAppointmentLink } from '@/components/notification-appointment-link'
import { RowLink } from '@/components/table/row-link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatInstantInIanaZone } from '@/lib/format-datetime'
import { notificationToName } from '@/lib/labels'
import { notificationBadgeClass, prettyEnum } from '@/lib/notification-status'

type Props = {
  notification: Notification
  timeZone: string
}

export function NotificationMobileCard({ notification, timeZone }: Props) {
  return (
    <Card size="sm" className="shadow-sm transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">
            {notificationToName(notification)}
          </CardTitle>
          <div className="mt-1">
            <NotificationAppointmentLink notification={notification} visitOnly />
          </div>
        </div>
        <Badge variant="outline" className={notificationBadgeClass(notification.status)}>
          {prettyEnum(notification.status)}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm">
        <p className="tabular-nums text-foreground">
          {notification.sentAt
            ? formatInstantInIanaZone(notification.sentAt, timeZone)
            : 'Not sent yet'}
        </p>
        <p className="text-muted-foreground">
          {prettyEnum(notification.generation)}
          {' · '}
          {notification.opened ? 'Opened' : 'Not opened'}
          {notification.bounced ? ' · Bounced' : ''}
        </p>
      </CardContent>
      <CardFooter className="border-t border-border/80 pt-3">
        <RowLink
          to={`/notifications/${notification.id}`}
          label="View notification"
          onClick={(e) => e.stopPropagation()}
        />
      </CardFooter>
    </Card>
  )
}
