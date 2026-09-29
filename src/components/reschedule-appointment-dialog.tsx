import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import type { Appointment } from '@/lib/types'
import { ServiceSlotPicker } from '@/components/service-slot-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

type Props = {
  appointment: Appointment
  timezone: string
  staff: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RescheduleAppointmentDialog({
  appointment,
  timezone,
  staff,
  open,
  onOpenChange,
}: Props) {
  const qc = useQueryClient()
  const [slotStart, setSlotStart] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSlotStart(null)
  }, [open, appointment.id])

  const reschedule = useMutation({
    mutationFn: () =>
      apiPost<Appointment>(`/api/v1/appointments/${appointment.id}/reschedule`, {
        scheduledAt: slotStart,
      }),
    onSuccess: () => {
      toast.success('Rescheduled')
      onOpenChange(false)
      qc.invalidateQueries({ queryKey: ['appointment'] })
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['reminders'] })
      qc.invalidateQueries({ queryKey: ['dealership-slots'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const canSubmit = !!slotStart && slotStart !== appointment.scheduledAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle className="text-lg">Reschedule visit</DialogTitle>
          <DialogDescription>
            Pick a Service Slot. Unavailable times are crossed out.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <ServiceSlotPicker
            dealershipId={appointment.dealershipId}
            timezone={timezone}
            value={slotStart}
            onChange={setSlotStart}
            allowUnavailable={staff}
            constrainWindow={!staff}
          />
        </div>
        <DialogFooter className="mx-0 mb-0 gap-2 rounded-none border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || reschedule.isPending}
            onClick={() => reschedule.mutate()}
          >
            {reschedule.isPending ? <Spinner data-icon="inline-start" /> : null}
            Save new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
