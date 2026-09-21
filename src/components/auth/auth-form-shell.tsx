import type { ReactNode } from 'react'
import { cn } from 'cn'

type Props = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function AuthFormShell({ title, description, children, className }: Props) {
  const showHeader = Boolean(title || description)

  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border/80 bg-card/95 p-6 shadow-lg shadow-foreground/[0.04] backdrop-blur-md sm:p-8',
        className,
      )}
    >
      {showHeader ? (
        <div className="mb-6 space-y-1.5">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
