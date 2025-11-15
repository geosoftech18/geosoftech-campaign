import { Prisma } from '@prisma/client'

/**
 * Builds Prisma where clause for lead segmentation
 */
export function buildSegmentFilter(
  city?: string | null,
  state?: string | null,
  category?: string | null
): Prisma.LeadWhereInput {
  const filter: Prisma.LeadWhereInput = {}

  if (city) {
    filter.city = { equals: city, mode: 'insensitive' }
  }

  if (state) {
    filter.state = { equals: state, mode: 'insensitive' }
  }

  if (category) {
    filter.category = { equals: category, mode: 'insensitive' }
  }

  return filter
}


