import { dicebearAvatarUrl } from '@/lib/dicebear'
import { cn } from 'cn'

type UserAvatarProps = {
  seed: string
  size?: number
  className?: string
  alt?: string
}

export function UserAvatar({ seed, size = 36, className, alt = '' }: UserAvatarProps) {
  return (
    <img
      src={dicebearAvatarUrl(seed, size)}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn(
        'shrink-0 rounded-lg bg-muted object-contain ring-1 ring-border/60',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}
