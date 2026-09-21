import type { ReactNode } from 'react'
import { cn } from 'cn'

export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border/80 py-3 last:border-0 sm:grid-cols-[minmax(7rem,9rem)_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

export function DetailPanel({
  title,
  description,
  children,
  className,
  headerExtra,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      {(title || headerExtra) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {headerExtra}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
