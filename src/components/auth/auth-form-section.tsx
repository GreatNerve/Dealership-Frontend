import type { ReactNode } from 'react'
import { cn } from 'cn'

type Props = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function AuthFormSection({ title, description, children, className }: Props) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-muted/25 p-4 sm:p-5',
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
