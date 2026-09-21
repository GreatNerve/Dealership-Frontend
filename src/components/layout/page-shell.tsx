import type { ReactNode } from 'react'
import { cn } from 'cn'

/** Primary actions in page headers (default Button variant). */
export const PAGE_HEADER_PRIMARY_BUTTON_CLASS =
  'inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-sm'

type Props = {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** Same structure as ajvc InvoiceTable: header band + full-width table block. */
export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: Props) {
  return (
    <section className={cn('md:px-4 md:pb-4', className)}>
      <div
        className="flex flex-col gap-4 px-4 pb-6 pt-4 sm:flex-row sm:items-start sm:justify-between md:px-0"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
        ) : null}
      </div>
      <main className="flex-1 px-4 md:px-0">{children}</main>
    </section>
  )
}
