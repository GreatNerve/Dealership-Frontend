import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AddVehicleDialog } from '@/components/add-vehicle-dialog'
import { apiPost } from '@/lib/api'
import { dealershipLabel, dealershipSubline, vehicleLabel } from '@/lib/labels'
import { isoWithZoneOffset } from '@/lib/format-datetime'
import type { Appointment, Customer, Dealership, Vehicle } from '@/lib/types'
import { ServiceSlotPicker } from '@/components/service-slot-picker'
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

function mergeVehicles(base: Vehicle[], extra: Vehicle[]): Vehicle[] {
  const byId = new Map<string, Vehicle>()
  for (const v of base) byId.set(v.id, v)
  for (const v of extra) byId.set(v.id, v)
  return [...byId.values()]
}

export function BookAppointmentDialog({
  customer,
  dealerships,
  defaultDealershipId,
  open,
  onOpenChange,
}: Props) {
  const qc = useQueryClient()
  const [addedVehicles, setAddedVehicles] = useState<Vehicle[]>([])
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [dealershipId, setDealershipId] = useState('')
  const [slotStart, setSlotStart] = useState<string | null>(null)

  const bookingVehicles = useMemo(
    () => mergeVehicles(customer.vehicles, addedVehicles),
    [customer.vehicles, addedVehicles],
  )

  const vehicleOptions = useMemo(
    () =>
      bookingVehicles.map((v) => ({
        value: v.id,
        label: vehicleLabel(v),
      })),
    [bookingVehicles],
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
    setAddedVehicles([])
    setAddVehicleOpen(false)
    setVehicleId(customer.vehicles[0]?.id ?? '')
    setDealershipId(defaultDealershipId ?? dealerships[0]?.id ?? '')
    setSlotStart(null)
  }, [open, customer.vehicles, defaultDealershipId, dealerships])

  useEffect(() => {
    if (!open) return
    if (!bookingVehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(bookingVehicles[0]?.id ?? '')
    }
  }, [open, bookingVehicles, vehicleId])

  useEffect(() => {
    setSlotStart(null)
  }, [dealershipId])

  const book = useMutation({
    mutationFn: () => {
      const tz = dealerships.find((d) => d.id === dealershipId)?.timezone ?? 'UTC'
      return apiPost<Appointment>(
        '/api/v1/appointments',
        {
          customerId: customer.id,
          vehicleId,
          dealershipId,
          scheduledAt: isoWithZoneOffset(slotStart!, tz),
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

  const noVehicles = vehicleOptions.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle className="text-lg">Create appointment</DialogTitle>
          <DialogDescription>
            {noVehicles
              ? 'Add a vehicle, then choose dealership and service time.'
              : 'Choose your vehicle, dealership, and service time.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Vehicle</FieldLabel>
              {noVehicles ? (
                <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    You do not have a vehicle on your profile yet.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setAddVehicleOpen(true)}
                  >
                    Add vehicle
                  </Button>
                </div>
              ) : (
                <>
                  <SearchableCombobox
                    options={vehicleOptions}
                    value={vehicleId}
                    onValueChange={setVehicleId}
                    placeholder="Choose vehicle"
                    searchPlaceholder="Search plate…"
                    emptyText="No vehicles found."
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-xs text-muted-foreground"
                    onClick={() => setAddVehicleOpen(true)}
                  >
                    Add another vehicle
                  </Button>
                </>
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

            {dealershipId ? (
              <ServiceSlotPicker
                dealershipId={dealershipId}
                timezone={dealerships.find((d) => d.id === dealershipId)?.timezone ?? 'UTC'}
                value={slotStart}
                onChange={setSlotStart}
              />
            ) : null}
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
              !slotStart
            }
            onClick={() => book.mutate()}
          >
            {book.isPending ? <Spinner data-icon="inline-start" /> : null}
            Book appointment
          </Button>
        </DialogFooter>
      </DialogContent>

      <AddVehicleDialog
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        onAdded={(vehicle) => {
          setAddedVehicles((prev) => mergeVehicles(prev, [vehicle]))
          setVehicleId(vehicle.id)
          qc.invalidateQueries({ queryKey: ['vehicles', 'book'] })
          qc.invalidateQueries({ queryKey: ['vehicles'] })
        }}
      />
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
