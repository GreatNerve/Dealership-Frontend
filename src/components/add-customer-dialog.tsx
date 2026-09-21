import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import type { Customer } from '@/lib/types'
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
import { formPlaceholders } from '@/lib/form-placeholders'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCustomerDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!open) return
    setEmail('')
    setName('')
    setPassword('')
  }, [open])

  const save = useMutation({
    mutationFn: () =>
      apiPost<Customer>('/api/v1/customers', {
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        password,
      }),
    onSuccess: () => {
      toast.success('Customer created')
      onOpenChange(false)
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-6 pt-6 pb-4 pr-12">
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>
            Walk-in registration. They can sign in with this email and password.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="cust-email">Email</FieldLabel>
              <Input
                id="cust-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={formPlaceholders.email}
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cust-name">Name (optional)</FieldLabel>
              <Input
                id="cust-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={formPlaceholders.customerName}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cust-password">Password</FieldLabel>
              <Input
                id="cust-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder={formPlaceholders.passwordNew}
                autoComplete="new-password"
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
            disabled={save.isPending || !email.trim() || password.length < 8}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner data-icon="inline-start" /> : null}
            Create customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
