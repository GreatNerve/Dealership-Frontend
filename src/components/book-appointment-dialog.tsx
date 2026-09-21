import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import { dealershipLabel, dealershipSubline, vehicleLabel } from '@/lib/labels'
import { datetimeLocalToApiOffset, defaultDatetimeLocal } from '@/lib/schedule'
import type { Appointment, Customer, Dealership, Vehicle } from '@/lib/types'
import { DateTimePickerField } from '@/components/forms/date-time-picker-field'
import { SearchableCombobox } from '@/components/forms/searchable-combobox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

type Props = {
  customer: Customer
  dealerships: Dealership[]
  defaultDealershipId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookAppointmentDialog({
  customer,
  dealerships,
  defaultDealershipId,
  open,
  onOpenChange,
}: Props) {
  const qc = useQueryClient()
  const [vehicleId, setVehicleId] = useState('')
  const [dealershipId, setDealershipId] = useState('')
  const [scheduledLocal, setScheduledLocal] = useState('')

  const vehicleOptions = useMemo(
    () =>
      customer.vehicles.map((v) => ({
        value: v.id,
        label: vehicleLabel(v),
      })),
    [customer.vehicles],
  )

  const dealershipOptions = useMemo(
    () =>
      dealerships.map((d) => ({
        value: d.id,
        label: dealershipLabel(d),
        description: dealershipSubline(d),
      })),
    [dealerships],
  )

  useEffect(() => {
    if (!open) return
    setVehicleId(customer.vehicles[0]?.id ?? '')
    setDealershipId(defaultDealershipId ?? dealerships[0]?.id ?? '')
    setScheduledLocal(defaultDatetimeLocal(24))
  }, [open, customer, dealerships, defaultDealershipId])

  useEffect(() => {
    if (!customer.vehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(customer.vehicles[0]?.id ?? '')
    }
  }, [customer.vehicles, vehicleId])

  const book = useMutation({
    mutationFn: () => {
      const scheduledAt = datetimeLocalToApiOffset(scheduledLocal)
      return apiPost<Appointment>(
        '/api/v1/appointments',
        {
          customerId: customer.id,
          vehicleId,
          dealershipId,
          scheduledAt,
          notify: true,
        },
        crypto.randomUUID(),
      )
    },
    onSuccess: () => {
      toast.success('Appointment booked')
      onOpenChange(false)
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle className="text-lg">Create appointment</DialogTitle>
          <DialogDescription>
            Choose your vehicle, dealership, and service time.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Vehicle</FieldLabel>
              <SearchableCombobox
                options={vehicleOptions}
                value={vehicleId}
                onValueChange={setVehicleId}
                placeholder="Choose vehicle"
                searchPlaceholder="Search plate…"
                emptyText="No vehicles yet."
                disabled={vehicleOptions.length === 0}
              />
              {vehicleOptions.length === 0 && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No vehicles yet.{' '}
                  <Link
                    to="/vehicles"
                    className="font-medium text-foreground underline underline-offset-2 hover:text-foreground/90"
                    onClick={() => onOpenChange(false)}
                  >
                    Add a vehicle
                  </Link>{' '}
                  on My vehicles, then book again.
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel>Dealership</FieldLabel>
              <SearchableCombobox
                options={dealershipOptions}
                value={dealershipId}
                onValueChange={setDealershipId}
                placeholder="Choose location"
                searchPlaceholder="Search dealership…"
                emptyText="No dealerships."
              />
            </Field>

            <DateTimePickerField
              id="book-scheduled-at"
              value={scheduledLocal}
              onChange={setScheduledLocal}
            />
          </FieldGroup>
        </div>

        <DialogFooter
          className="mx-0 mb-0 gap-2 rounded-none border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-end"
        >
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              book.isPending ||
              !vehicleId ||
              !dealershipId ||
              !scheduledLocal ||
              Number.isNaN(new Date(scheduledLocal).getTime())
            }
            onClick={() => book.mutate()}
          >
            {book.isPending ? <Spinner data-icon="inline-start" /> : null}
            Book appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Customer self-book: vehicles from GET /vehicles. */
export function buildCustomerForBooking(
  customerId: string,
  name: string | null,
  vehicles: Vehicle[],
): Customer {
  return {
    id: customerId,
    name,
    contact: '',
    vehicles,
  }
}
