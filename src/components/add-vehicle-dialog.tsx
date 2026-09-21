import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import type { Vehicle } from '@/lib/types'
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
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: (vehicle: Vehicle) => void
}

export function AddVehicleDialog({ open, onOpenChange, onAdded }: Props) {
  const qc = useQueryClient()
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    if (!open) return
    setRegistrationNumber('')
    setMake('')
    setModel('')
    setYear(String(new Date().getFullYear()))
  }, [open])

  const save = useMutation({
    mutationFn: () =>
      apiPost<Vehicle>('/api/v1/vehicles', {
        registrationNumber: registrationNumber.trim(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
      }),
    onSuccess: (vehicle) => {
      toast.success('Vehicle added')
      onAdded?.(vehicle)
      onOpenChange(false)
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle>Add vehicle</DialogTitle>
          <DialogDescription>
            Plate is stored uppercase. Year must be between 1950 and 2100.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="plate">Vehicle number</FieldLabel>
              <Input
                id="plate"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="KA01AB1234"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="make">Make</FieldLabel>
              <Input
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Honda"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="model">Model</FieldLabel>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Civic"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="year">Year</FieldLabel>
              <Input
                id="year"
                type="number"
                min={1950}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Field>
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
              save.isPending ||
              !registrationNumber.trim() ||
              !make.trim() ||
              !model.trim() ||
              !year
            }
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner data-icon="inline-start" /> : null}
            Save vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
