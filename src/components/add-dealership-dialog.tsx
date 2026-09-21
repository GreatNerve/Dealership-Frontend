import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { timezoneLabel } from '@/lib/schedule'
import type { Dealership } from '@/lib/types'
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
}

export function AddDealershipDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient()
  const { reloadUser } = useAuth()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setAddress('')
  }, [open])

  const save = useMutation({
    mutationFn: () =>
      apiPost<Dealership>('/api/v1/dealerships', {
        name: name.trim(),
        address: address.trim(),
        timezone: timezoneLabel(),
      }),
    onSuccess: async () => {
      toast.success('Dealership created')
      onOpenChange(false)
      await reloadUser()
      qc.invalidateQueries({ queryKey: ['dealership'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle>Create dealership</DialogTitle>
          <DialogDescription>
            Name and address only. Timezone uses your device ({timezoneLabel()}).
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="dealer-name">Name</FieldLabel>
              <Input
                id="dealer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Great Nerve Service"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dealer-address">Address</FieldLabel>
              <Input
                id="dealer-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            disabled={save.isPending || !name.trim() || !address.trim()}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner data-icon="inline-start" /> : null}
            Create dealership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
