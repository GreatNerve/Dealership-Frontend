import type { Dealership } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DealershipMobileCard({ dealership }: { dealership: Dealership }) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{dealership.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">{dealership.address}</p>
        <Badge variant="outline" className="font-mono text-xs">
          {dealership.timezone}
        </Badge>
      </CardContent>
    </Card>
  )
}
