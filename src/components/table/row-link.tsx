import { ExternalLink } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { cn } from 'cn'

type Props = {
  to: string
  label: string
  onClick?: (e: MouseEvent) => void
}

export function RowLink({ to, label, onClick }: Props) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline',
      )}
    >
      {label}
      <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
    </Link>
  )
}
