import type { Dealership } from '@/lib/types'

/** Staff UI must not surface another shop's name, address, or timezone. */
export function dealershipVisibleToStaff(
  dealership: Dealership | null | undefined,
  homeDealershipId: string | null | undefined,
): Dealership | null {
  if (!dealership || !homeDealershipId) return null
  if (dealership.id !== homeDealershipId) return null
  return dealership
}

export function dealershipNameForStaff(
  dealership: Dealership | null | undefined,
  homeDealershipId: string | null | undefined,
): string {
  return dealershipVisibleToStaff(dealership, homeDealershipId)?.name ?? '—'
}
