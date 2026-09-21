/** Deterministic avatars via [DiceBear](https://www.dicebear.com/) HTTP API (Thumbs). */
const DICEBEAR_STYLE = 'thumbs'

export function dicebearAvatarUrl(seed: string, size = 36): string {
  const px = Math.min(512, Math.max(size, Math.round(size * 2)))
  const params = new URLSearchParams({
    seed,
    size: String(px),
    backgroundColor: 'f4f4f5',
    radius: '0',
  })
  return `https://api.dicebear.com/10.x/${DICEBEAR_STYLE}/png?${params}`
}
