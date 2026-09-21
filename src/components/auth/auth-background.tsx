import type { AuthHeroVariant } from '@/components/auth/auth-hero-copy'
import { HERO_COPY } from '@/components/auth/auth-hero-copy'

type Props = {
  variant: AuthHeroVariant
}

export function AuthBackground({ variant }: Props) {
  const { image } = HERO_COPY[variant]

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <img
        src={image}
        alt=""
        className="size-full object-cover opacity-[0.22] saturate-[0.9]"
      />
      <div className="absolute inset-0 bg-background/88 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-linear-to-b from-background/40 via-transparent to-background" />
    </div>
  )
}
