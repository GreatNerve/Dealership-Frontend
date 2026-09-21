import { HERO_COPY, type AuthHeroVariant } from '@/components/auth/auth-hero-copy'

type Props = {
  variant: AuthHeroVariant
}

export function AuthPageIntro({ variant }: Props) {
  const { title, subtitle } = HERO_COPY[variant]

  return (
    <header className="mb-6 text-center sm:mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Great Nerve Service
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </header>
  )
}
