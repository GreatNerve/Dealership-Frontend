import type { Customer } from '@/lib/types'
import { customerDisplayName } from '@/lib/labels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CustomerMobileCard({ customer }: { customer: Customer }) {
  const n = customer.vehicles.length
  return (
    <Card size="sm" className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{customerDisplayName(customer)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="break-all text-muted-foreground">{customer.contact}</p>
        <p className="text-muted-foreground tabular-nums">
          {n === 0 ? 'No vehicles on file' : `${n} vehicle${n === 1 ? '' : 's'} on file`}
        </p>
      </CardContent>
    </Card>
  )
}
