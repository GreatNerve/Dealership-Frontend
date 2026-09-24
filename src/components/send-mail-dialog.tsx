import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import type { Appointment, Notification } from '@/lib/types'
import {
  hydrateMailTemplate,
  MAIL_TEMPLATES,
  type MailTemplateKey,
} from '@/lib/mail-templates'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment
}

export function SendMailDialog({ open, onOpenChange, appointment }: Props) {
  const qc = useQueryClient()
  const [templateKey, setTemplateKey] = useState<MailTemplateKey>('visit-again')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const idempotencyKey = useRef(crypto.randomUUID())

  const items = useMemo(
    () => MAIL_TEMPLATES.map((t) => ({ value: t.key, label: t.label })),
    [],
  )

  useEffect(() => {
    if (!open) return
    idempotencyKey.current = crypto.randomUUID()
    const hydrated = hydrateMailTemplate(templateKey, appointment)
    setSubject(hydrated.subject)
    setBody(hydrated.body)
  }, [open, templateKey, appointment])

  const send = useMutation({
    mutationFn: () =>
      apiPost<Notification>(
        `/api/v1/appointments/${appointment.id}/notifications`,
        {
          subject: subject.trim(),
          body: body.trim(),
        },
        idempotencyKey.current,
      ),
    onSuccess: () => {
      toast.success('Email queued')
      onOpenChange(false)
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['reminders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const canSend = subject.trim().length > 0 && body.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send mail</DialogTitle>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="mail-template">Template</FieldLabel>
            <Select
              value={templateKey}
              items={items}
              onValueChange={(value) => {
                if (value) setTemplateKey(value as MailTemplateKey)
              }}
            >
              <SelectTrigger id="mail-template" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="mail-subject">Subject</FieldLabel>
            <Input
              id="mail-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="mail-body">Body</FieldLabel>
            <Textarea
              id="mail-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="min-h-40"
            />
          </Field>
        </FieldGroup>
        <DialogFooter className="flex-row justify-end border-t-0 bg-transparent p-0 -mx-0 -mb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSend || send.isPending}
            onClick={() => send.mutate()}
          >
            {send.isPending ? <Spinner data-icon="inline-start" /> : null}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
