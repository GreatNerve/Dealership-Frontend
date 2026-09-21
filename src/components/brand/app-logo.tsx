import { cn } from 'cn'

type AppLogoProps = {
  className?: string
}

/** Raster app mark — `public/icons/logo-*.png` (see public/icons/ATTRIBUTION.txt). */
export function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src="/icons/logo-32.png"
      srcSet="/icons/logo-48.png 2x"
      width={32}
      height={32}
      alt=""
      decoding="async"
      className={cn('size-8 shrink-0 object-contain', className)}
    />
  )
}
