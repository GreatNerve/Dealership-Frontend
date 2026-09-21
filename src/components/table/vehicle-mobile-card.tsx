import type { Vehicle } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VehicleMobileCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-base">{vehicle.registrationNumber}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </CardContent>
    </Card>
  )
}
